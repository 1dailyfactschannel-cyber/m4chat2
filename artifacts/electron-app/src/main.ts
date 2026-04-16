import { app, BrowserWindow, shell } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import http from 'http';
import fs from 'fs';

const isDev = process.env.NODE_ENV === 'development';

let apiProcess: ChildProcess | null = null;
let staticServer: http.Server | null = null;
let mainWindow: BrowserWindow | null = null;

const STATIC_PORT = 3000;
const API_PORT = 8080;
const BASE_PATH = '';

function waitForUrl(url: string, timeout = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) return resolve();
        retry();
      }).on('error', retry);
    };
    const retry = () => {
      if (Date.now() - start > timeout) return reject(new Error(`Timed out waiting for ${url}`));
      setTimeout(check, 500);
    };
    check();
  });
}

function startApiServer(): Promise<void> {
  const serverPath = path.join(process.resourcesPath, 'api-server', 'dist', 'index.mjs');
  return new Promise((resolve) => {
    apiProcess = spawn(process.execPath, ['--enable-source-maps', serverPath], {
      env: { ...process.env, PORT: String(API_PORT), NODE_ENV: 'production' },
      stdio: 'pipe',
    });
    apiProcess.stdout?.on('data', (data: Buffer) => {
      if (data.toString().includes('Server listening')) resolve();
    });
    apiProcess.stderr?.on('data', (data: Buffer) => {
      console.error('[API]', data.toString());
    });
    setTimeout(resolve, 4000);
  });
}

function getMimeType(ext: string): string {
  const types: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
  };
  return types[ext] ?? 'application/octet-stream';
}

function startStaticServer(distPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    staticServer = http.createServer((req, res) => {
      const urlPath = req.url ?? '/';
      const stripped = urlPath.startsWith(BASE_PATH)
        ? urlPath.slice(BASE_PATH.length) || '/'
        : urlPath;

      let filePath = path.join(distPath, stripped);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distPath, 'index.html');
      }

      res.writeHead(200, { 'Content-Type': getMimeType(path.extname(filePath)) });
      fs.createReadStream(filePath).pipe(res);
    });

    staticServer.listen(STATIC_PORT, '127.0.0.1', () => resolve());
    staticServer.on('error', reject);
  });
}

function createWindow(url: string) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  mainWindow.loadURL(url);
  mainWindow.once('ready-to-show', () => mainWindow?.show());

  mainWindow.webContents.setWindowOpenHandler(({ url: openUrl }) => {
    shell.openExternal(openUrl);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  let appUrl: string;

  if (isDev) {
    appUrl = `http://localhost:8081${BASE_PATH}`;
  } else {
    const distPath = path.join(process.resourcesPath, 'frontend', 'dist');
    await Promise.all([startApiServer(), startStaticServer(distPath)]);
    appUrl = `http://localhost:${STATIC_PORT}${BASE_PATH}`;
  }

  createWindow(appUrl);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(appUrl);
  });
});

app.on('window-all-closed', () => {
  apiProcess?.kill();
  staticServer?.close();
  if (process.platform !== 'darwin') app.quit();
});
