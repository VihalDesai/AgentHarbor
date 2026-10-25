const { app, BrowserWindow, ipcMain, safeStorage } = require('electron');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.ico': 'image/x-icon' };
const providers = new Set(['openai', 'anthropic', 'gemini', 'openrouter', 'groq', 'deepseek', 'ollama', 'custom']);

function credentialFile() { return path.join(app.getPath('userData'), 'provider-keys.enc.json'); }
function readCredentials() {
  if (!fs.existsSync(credentialFile())) return {};
  try { return JSON.parse(fs.readFileSync(credentialFile(), 'utf8')); } catch { return {}; }
}
function writeCredentials(values) {
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Secure OS storage is unavailable on this device.');
  const directory = app.getPath('userData');
  fs.mkdirSync(directory, { recursive: true });
  const encrypted = Object.fromEntries(Object.entries(values).map(([provider, key]) => [provider, safeStorage.encryptString(String(key)).toString('base64')]));
  const destination = credentialFile();
  const temporary = `${destination}.${process.pid}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, JSON.stringify(encrypted), { mode: 0o600, flag: 'wx' });
    fs.renameSync(temporary, destination);
  } catch (error) {
    try { fs.unlinkSync(temporary); } catch { /* temporary file was not created */ }
    throw error;
  }
}
function decryptCredential(provider) {
  const stored = readCredentials()[provider];
  if (!stored) return null;
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Secure OS storage is unavailable on this device.');
  return safeStorage.decryptString(Buffer.from(stored, 'base64'));
}

function startAppServer() {
  const root = app.isPackaged ? path.join(process.resourcesPath, 'app') : path.resolve(__dirname, '../app/dist');
  const server = http.createServer((request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD', 'X-Content-Type-Options': 'nosniff' }).end('Method not allowed');
      return;
    }
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
      const candidate = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!candidate.startsWith(`${root}${path.sep}`) && candidate !== path.join(root, 'index.html')) {
        response.writeHead(403, { 'X-Content-Type-Options': 'nosniff' }).end('Forbidden');
        return;
      }
      const file = fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : path.join(root, 'index.html');
      response.writeHead(200, { 'Content-Type': mime[path.extname(file).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
      if (request.method === 'HEAD') response.end();
      else fs.createReadStream(file).on('error', () => { if (!response.headersSent) response.writeHead(500); response.end('Unable to read application file'); }).pipe(response);
    } catch {
      response.writeHead(400, { 'X-Content-Type-Options': 'nosniff' }).end('Bad request');
    }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` }));
  });
}

function createWindow(url) {
  const window = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 840,
    minHeight: 640,
    backgroundColor: '#101014',
    title: 'AgentHarbor',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, nextUrl) => {
    try {
      if (new URL(nextUrl).origin !== new URL(url).origin) event.preventDefault();
    } catch { event.preventDefault(); }
  });
  window.loadURL(url);
}

function trustedSender(event) {
  if (!appUrl || !event.senderFrame || event.senderFrame !== event.sender.mainFrame) throw new Error('Untrusted application window.');
  try {
    if (new URL(event.senderFrame.url).origin !== new URL(appUrl).origin) throw new Error('Untrusted application window.');
  } catch {
    throw new Error('Untrusted application window.');
  }
}

function boundedText(value, label, maxLength) {
  if (typeof value !== 'string' || value.length > maxLength) throw new Error(`${label} is invalid or too large.`);
  return value;
}

function normalizeTurns(value) {
  const turns = typeof value === 'string' ? [{ role: 'user', content: value }] : value;
  if (!Array.isArray(turns) || turns.length > 500) throw new Error('Conversation history is invalid or too large.');
  const normalized = turns.slice(-20).map((turn) => {
    if (!turn || !['user', 'assistant'].includes(turn.role)) throw new Error('Conversation history contains an invalid role.');
    return { role: turn.role, content: boundedText(turn.content, 'Conversation message', 8000) };
  });
  if (!normalized.length) throw new Error('Enter a message to start the conversation.');
  return normalized;
}

async function completeModel(settings, system, prompt) {
  if (!settings || !providers.has(settings.provider)) throw new Error('Choose a supported provider in Settings.');
  const provider = settings.provider;
  const endpoint = boundedText(settings.endpoint, 'Provider endpoint', 2048).trim().replace(/\/$/, '');
  if (!endpoint) throw new Error('Set a provider endpoint in Settings.');
  const model = boundedText(settings.model, 'Model name', 256).trim();
  if (!model) throw new Error('Set a model name in Settings.');
  const systemText = boundedText(system, 'System instructions', 30000);
  const turns = normalizeTurns(prompt);
  let parsedEndpoint;
  try { parsedEndpoint = new URL(endpoint); } catch { throw new Error('Set a valid provider endpoint in Settings.'); }
  if (!['http:', 'https:'].includes(parsedEndpoint.protocol)) throw new Error('Use an HTTP or HTTPS provider endpoint.');
  if (parsedEndpoint.username || parsedEndpoint.password) throw new Error('Remove credentials from the endpoint URL and add the API key in secure settings.');
  const key = decryptCredential(provider);
  if (provider !== 'ollama' && !key) throw new Error(`Add an API key for ${provider} in Settings.`);
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(parsedEndpoint.hostname);
  if (key && parsedEndpoint.protocol !== 'https:' && !loopback) throw new Error('Use HTTPS for any endpoint that receives an API key.');
  const headers = { 'Content-Type': 'application/json' };
  let url = `${endpoint}/chat/completions`;
  let body = { model, messages: [{ role: 'system', content: systemText }, ...turns], stream: false };
  if (provider === 'anthropic') {
    url = `${endpoint}/messages`;
    Object.assign(headers, { 'x-api-key': key, 'anthropic-version': '2023-06-01' });
    body = { model, max_tokens: 2048, system: systemText, messages: turns };
  } else if (provider === 'gemini') {
    url = `${endpoint}/models/${encodeURIComponent(model)}:generateContent`;
    Object.assign(headers, { 'x-goog-api-key': key });
    body = { systemInstruction: { parts: [{ text: systemText }] }, contents: turns.map((turn) => ({ role: turn.role === 'assistant' ? 'model' : 'user', parts: [{ text: turn.content }] })) };
  } else if (key) {
    Object.assign(headers, { Authorization: `Bearer ${key}` });
  }
  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), redirect: 'error', signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`Model server returned ${response.status}`);
  const result = await response.json();
  const text = provider === 'anthropic' ? result?.content?.find((part) => part.type === 'text')?.text
    : provider === 'gemini' ? result?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('')
      : result?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Model server returned an empty response.');
  return String(text).trim();
}

ipcMain.handle('agentharbor:model', async (event, payload) => {
  trustedSender(event);
  if (!payload || typeof payload !== 'object') throw new Error('Invalid model request.');
  return completeModel(payload.settings, payload.system, payload.prompt);
});
ipcMain.handle('agentharbor:key:has', async (event, provider) => {
  trustedSender(event);
  if (!providers.has(provider)) throw new Error('Unsupported provider.');
  return Boolean(readCredentials()[provider]);
});
ipcMain.handle('agentharbor:key:set', async (event, provider, key) => {
  trustedSender(event);
  if (!providers.has(provider)) throw new Error('Unsupported provider.');
  boundedText(key, 'API key', 8192);
  const values = readCredentials();
  if (key) values[provider] = key;
  else delete values[provider];
  writeCredentials(values);
});
ipcMain.handle('agentharbor:key:remove', async (event, provider) => {
  trustedSender(event);
  if (!providers.has(provider)) throw new Error('Unsupported provider.');
  const values = readCredentials();
  delete values[provider];
  writeCredentials(values);
});

let appServer;
let appUrl;
app.whenReady().then(async () => {
  ({ server: appServer, url: appUrl } = await startAppServer());
  createWindow(appUrl);
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(appUrl); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => appServer?.close());
