import {
  app,
  BrowserWindow,
  shell,
  Tray,
  Menu,
  Notification,
  globalShortcut,
  ipcMain,
  nativeImage,
  dialog,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import http from 'http';
import fs from 'fs';
import os from 'os';

const isDev = process.env.NODE_ENV === 'development';

let apiProcess: ChildProcess | null = null;
let staticServer: http.Server | null = null;
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const STATIC_PORT = 3000;
const API_PORT = 8080;
const BASE_PATH = '';

// ─── Window State ────────────────────────────────────────────────────────────
const windowStateFile = path.join(os.homedir(), '.m4chat', 'window-state.json');

function loadWindowState() {
  try {
    if (fs.existsSync(windowStateFile)) {
      return JSON.parse(fs.readFileSync(windowStateFile, 'utf-8'));
    }
  } catch { /* ignore */ }
  return { width: 1280, height: 800, x: undefined, y: undefined, maximized: false };
}

function saveWindowState() {
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  const state = {
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    maximized: mainWindow.isMaximized(),
  };
  try {
    fs.mkdirSync(path.dirname(windowStateFile), { recursive: true });
    fs.writeFileSync(windowStateFile, JSON.stringify(state));
  } catch { /* ignore */ }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ─── Tray ────────────────────────────────────────────────────────────────────
function createTray() {
  // Use a simple colored square as tray icon (can be replaced with actual icon)
  const trayIcon = nativeImage.createFromNamedImage('NSImageNameActionTemplate', [16, 16] as any).resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Открыть M4Chat',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Выход',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('M4Chat');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
}

function updateBadge(count: number) {
  if (process.platform === 'darwin') {
    app.setBadgeCount(count);
  } else if (process.platform === 'win32' && mainWindow) {
    if (count > 0) {
      mainWindow.setOverlayIcon(
        nativeImage.createFromBuffer(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="30" fill="#2481CC"/><text x="32" y="42" text-anchor="middle" fill="white" font-size="28" font-family="Arial">${count}</text></svg>`)),
        `${count} unread`
      );
    } else {
      mainWindow.setOverlayIcon(null, '');
    }
  }
  if (tray && count > 0) {
    tray.setTitle(count > 0 ? String(count) : '');
  }
}

// ─── Window ──────────────────────────────────────────────────────────────────
function createWindow(url: string) {
  const state = loadWindowState();

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
    },
    show: false,
  });

  if (state.maximized) {
    mainWindow.maximize();
  }

  mainWindow.loadURL(url).catch((err) => {
    console.error('[Electron] Failed to load URL:', url, err);
    dialog.showErrorBox('Failed to load', `Could not load ${url}. Make sure the dev server is running.`);
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('[Electron] did-fail-load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('[Electron] render-process-gone:', details);
  });

  mainWindow.webContents.on('unresponsive', () => {
    console.error('[Electron] Window became unresponsive');
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    if (isDev) mainWindow?.webContents.openDevTools();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: openUrl }) => {
    shell.openExternal(openUrl);
    return { action: 'deny' };
  });

  // Save window state
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin') {
      event.preventDefault();
      mainWindow?.hide();
    } else {
      saveWindowState();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('resize', saveWindowState);
  mainWindow.on('move', saveWindowState);
  mainWindow.on('maximize', saveWindowState);
  mainWindow.on('unmaximize', saveWindowState);

  // Hide on minimize (optional - minimize to tray)
  mainWindow.on('minimize', () => {
    if (process.platform === 'win32') {
      mainWindow?.hide();
    }
  });
}

// ─── IPC Handlers ────────────────────────────────────────────────────────────
ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.handle('show-notification', (_event, title: string, body: string) => {
  if (!Notification.isSupported()) return;
  const notification = new Notification({
    title,
    body,
    icon: path.join(__dirname, '../../build-resources/icon.png'),
  });
  notification.on('click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
  notification.show();
});

ipcMain.on('update-badge', (_event, count: number) => {
  updateBadge(count);
});

ipcMain.on('set-spell-checker-languages', (_event, languages: string[]) => {
  mainWindow?.webContents.session.setSpellCheckerLanguages(languages);
});

// ─── Auto Updater ────────────────────────────────────────────────────────────
function setupAutoUpdater() {
  if (isDev) return;

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Доступно обновление',
      message: 'Найдена новая версия M4Chat. Она будет загружена в фоновом режиме.',
      buttons: ['OK'],
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Обновление готово',
      message: 'Обновление загружено. Перезапустить приложение сейчас?',
      buttons: ['Перезапустить', 'Позже'],
      defaultId: 0,
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err);
  });
}

// ─── Global Shortcuts ────────────────────────────────────────────────────────
function registerGlobalShortcuts() {
  // Ctrl/Cmd+Shift+M - Show/hide window
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
}

// ─── Protocol Handler ────────────────────────────────────────────────────────
const PROTOCOL = 'm4chat';

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

// Handle protocol URLs
function handleProtocolUrl(url: string) {
  if (!url.startsWith(`${PROTOCOL}://`)) return;
  const path = url.replace(`${PROTOCOL}://`, '');
  // e.g., m4chat://chat/123 → open chat 123
  if (path.startsWith('chat/')) {
    const chatId = path.replace('chat/', '');
    mainWindow?.webContents.send('protocol-open-chat', chatId);
  }
}

// ─── App Lifecycle ───────────────────────────────────────────────────────────
let appUrl: string;

app.whenReady().then(async () => {
  try {
    // Protocol handler for Windows
    const protocolUrl = process.argv.find((arg) => arg.startsWith(`${PROTOCOL}://`));
    if (protocolUrl) handleProtocolUrl(protocolUrl);

    if (isDev) {
      appUrl = `http://localhost:8081${BASE_PATH}`;
    } else {
      const distPath = path.join(process.resourcesPath, 'frontend', 'dist');
      await Promise.all([startApiServer(), startStaticServer(distPath)]);
      appUrl = `http://localhost:${STATIC_PORT}${BASE_PATH}`;
    }

    createWindow(appUrl);
    createTray();
    registerGlobalShortcuts();
    setupAutoUpdater();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow(appUrl);
      } else {
        mainWindow?.show();
      }
    });
  } catch (err: any) {
    console.error('[Electron] Fatal startup error:', err);
    dialog.showErrorBox('Startup Error', err?.message || String(err));
    app.quit();
  }
});

// macOS: handle protocol when app is already running
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleProtocolUrl(url);
});

// Windows: handle protocol when app is already running
app.on('second-instance', (event, argv) => {
  const protocolUrl = argv.find((arg) => arg.startsWith(`${PROTOCOL}://`));
  if (protocolUrl) handleProtocolUrl(protocolUrl);

  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  apiProcess?.kill();
  staticServer?.close();
  if (process.platform !== 'darwin') app.quit();
});
