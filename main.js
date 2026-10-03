const { app, BrowserWindow, BrowserView, ipcMain, shell } = require('electron');
const path = require('path');

let win;
let activeView = null;
const views = new Map();

function contentBounds() {
  const [width, height] = win.getContentSize();
  return {
    x: 306,
    y: 90,
    width: Math.max(420, width - 306),
    height: Math.max(320, height - 90)
  };
}

function resizeView() {
  if (activeView) activeView.setBounds(contentBounds());
}

function createView(id, url) {
  if (views.has(id)) return views.get(id);

  const view = new BrowserView({
    webPreferences: {
      partition: 'persist:workspace-' + id,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    }
  });

  view.webContents.setWindowOpenHandler(({ url: next }) => {
    if (/^https?:/i.test(next)) {
      view.webContents.loadURL(next);
    } else {
      shell.openExternal(next);
    }
    return { action: 'deny' };
  });

  view.webContents.loadURL(url);
  views.set(id, view);
  return view;
}

function showWorkspace(id, url) {
  if (activeView) {
    try { win.removeBrowserView(activeView); } catch {}
  }

  activeView = createView(id, url);
  win.addBrowserView(activeView);
  resizeView();
  activeView.webContents.focus();
}

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1480,
    height: 900,
    minWidth: 1040,
    minHeight: 680,
    backgroundColor: '#0c0d0f',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
  win.on('resize', resizeView);
});

ipcMain.handle('workspace:open', (_event, payload) => {
  if (!payload?.id || !payload?.url) return false;
  showWorkspace(payload.id, payload.url);
  return true;
});

ipcMain.handle('workspace:hide', () => {
  if (activeView) {
    try { win.removeBrowserView(activeView); } catch {}
    activeView = null;
  }
  return true;
});

ipcMain.handle('translate:text', async (_event, text) => {
  if (!text) return '';
  return 'Translation service not configured yet.';
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
