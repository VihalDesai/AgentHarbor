const { app, BrowserWindow, ipcMain } = require('electron');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.ico': 'image/x-icon' };

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

ipcMain.handle('agentharbor:model', async (_event, { settings, system, prompt }) => {
  const endpoint = String(settings?.endpoint ?? '').trim().replace(/\/$/, '');
  if (!endpoint) throw new Error('Set a local model endpoint in Settings.');
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: settings.model, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], stream: false }),
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) throw new Error(`Model server returned ${response.status}`);
  const result = await response.json();
  const text = result?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Model server returned an empty response.');
  return String(text).trim();
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
