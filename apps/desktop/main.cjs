const { app, BrowserWindow, ipcMain, safeStorage } = require('electron');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.ico': 'image/x-icon' };

function credentialFile() { return path.join(app.getPath('userData'), 'provider-keys.enc.json'); }
function readCredentials() {
  if (!fs.existsSync(credentialFile())) return {};
  try { return JSON.parse(fs.readFileSync(credentialFile(), 'utf8')); } catch { return {}; }
}
function writeCredentials(values) {
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Secure OS storage is unavailable on this device.');
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
  const encrypted = Object.fromEntries(Object.entries(values).map(([provider, key]) => [provider, safeStorage.encryptString(String(key)).toString('base64')]));
  fs.writeFileSync(credentialFile(), JSON.stringify(encrypted), { mode: 0o600 });
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
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const candidate = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!candidate.startsWith(`${root}${path.sep}`) && candidate !== path.join(root, 'index.html')) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const file = fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : path.join(root, 'index.html');
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(response);
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

async function completeModel(settings, system, prompt) {
  const endpoint = String(settings?.endpoint ?? '').trim().replace(/\/$/, '');
  if (!endpoint) throw new Error('Set a provider endpoint in Settings.');
  const provider = String(settings?.provider ?? 'ollama');
  const key = decryptCredential(provider);
  if (provider !== 'ollama' && !key) throw new Error(`Add an API key for ${provider} in Settings.`);
  const headers = { 'Content-Type': 'application/json' };
  let url = `${endpoint}/chat/completions`;
  let body = { model: settings.model, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], stream: false };
  if (provider === 'anthropic') {
    url = `${endpoint}/messages`;
    Object.assign(headers, { 'x-api-key': key || '', 'anthropic-version': '2023-06-01' });
    body = { model: settings.model, max_tokens: 2048, system, messages: [{ role: 'user', content: prompt }] };
  } else if (provider === 'gemini') {
    url = `${endpoint}/models/${encodeURIComponent(settings.model)}:generateContent`;
    Object.assign(headers, { 'x-goog-api-key': key || '' });
    body = { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }] };
  } else if (key) {
    Object.assign(headers, { Authorization: `Bearer ${key}` });
  }
  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`Model server returned ${response.status}`);
  const result = await response.json();
  const text = provider === 'anthropic' ? result?.content?.find((part) => part.type === 'text')?.text
    : provider === 'gemini' ? result?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('')
      : result?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Model server returned an empty response.');
  return String(text).trim();
}

ipcMain.handle('agentharbor:model', async (_event, { settings, system, prompt }) => completeModel(settings, system, prompt));
ipcMain.handle('agentharbor:key:has', async (_event, provider) => Boolean(readCredentials()[String(provider)]));
ipcMain.handle('agentharbor:key:set', async (_event, provider, key) => {
  const values = readCredentials();
  if (String(key)) values[String(provider)] = String(key);
  else delete values[String(provider)];
  writeCredentials(values);
});
ipcMain.handle('agentharbor:key:remove', async (_event, provider) => {
  const values = readCredentials();
  delete values[String(provider)];
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
