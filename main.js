const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
let RPC;
try { RPC = require('discord-rpc'); } catch (e) { RPC = null; }

const GAME_URL = 'https://venge.io';
const DISCORD_CLIENT_ID = 'PUT_YOUR_DISCORD_APP_ID_HERE'; // create one at discord.com/developers

let mainWindow;
let overlayWindow;
let unlimitedFps = false;
let rpcClient;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Peakio Client',
    backgroundColor: '#0b0d10',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: true, // flipped off by the FPS toggle below
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadURL(GAME_URL);

  mainWindow.webContents.on('did-finish-load', () => {
    // Re-apply state on reload (e.g. user hits refresh in-game)
    mainWindow.webContents.setBackgroundThrottling(unlimitedFps ? false : true);
  });
}

function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 420,
    height: 320,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    parent: mainWindow,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  overlayWindow.loadFile(path.join(__dirname, 'overlay', 'settings.html'));
}

function toggleFps() {
  unlimitedFps = !unlimitedFps;
  // The honest version of "unlimited FPS": Electron throttles rendering for
  // backgrounded/unfocused windows. Turning that off removes Electron's own
  // cap. It cannot remove any frame limit the game itself sets internally —
  // I have no way to inspect that code from here.
  mainWindow.webContents.setBackgroundThrottling(!unlimitedFps ? true : false);
  if (overlayWindow) overlayWindow.webContents.send('fps-state', unlimitedFps);
  return unlimitedFps;
}

function toggleOverlay() {
  if (!overlayWindow) return;
  if (overlayWindow.isVisible()) {
    overlayWindow.hide();
  } else {
    const b = mainWindow.getBounds();
    overlayWindow.setPosition(b.x + b.width - 440, b.y + 60);
    overlayWindow.webContents.send('fps-state', unlimitedFps);
    overlayWindow.show();
  }
}

function setupDiscordRpc() {
  if (!RPC || DISCORD_CLIENT_ID.startsWith('PUT_YOUR')) return; // skip until configured
  RPC.register(DISCORD_CLIENT_ID);
  rpcClient = new RPC.Client({ transport: 'ipc' });
  rpcClient.on('ready', () => {
    rpcClient.setActivity({
      details: 'Playing Venge.io',
      state: 'via Peakio Client',
      startTimestamp: Date.now(),
      largeImageKey: 'peakio_logo',
      largeImageText: 'Peakio Client',
      instance: false
    });
  });
  rpcClient.login({ clientId: DISCORD_CLIENT_ID }).catch(() => {});
}

app.whenReady().then(() => {
  createMainWindow();
  createOverlayWindow();
  setupDiscordRpc();

  globalShortcut.register('CommandOrControl+/', toggleFps);
  globalShortcut.register('F7', toggleOverlay);

  ipcMain.handle('toggle-fps', toggleFps);
  ipcMain.handle('get-fps-state', () => unlimitedFps);
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
