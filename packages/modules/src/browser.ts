import { app, BrowserWindow, ipcMain } from 'electron';

function restart() {
  app.relaunch();
  app.exit(0);
}

function minimize(event: Electron.IpcMainInvokeEvent) {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.minimize();
  }
}

function maximize(event: Electron.IpcMainInvokeEvent) {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
}

function close(event: Electron.IpcMainInvokeEvent) {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.close();
  }
}

function setTitle(event: Electron.IpcMainInvokeEvent, title?: string) {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (title) {
      if (title.length > 80) {
        win.setTitle(`BlueScope - ${title.substring(0, 80)}`);
      } else {
        win.setTitle(`BlueScope - ${title}`);
      }
    } else {
      win.setTitle('BlueScope');
    }
  }
}

export function register() {
  ipcMain.on('restart', restart);
  ipcMain.on('minimize', minimize);
  ipcMain.on('maximize', maximize);
  ipcMain.on('close', close);
  ipcMain.handle('setTitle', setTitle);
}

export interface IBrowser {
  restart: () => Promise<void>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  removeAllListeners: () => void;
  setTitle: (title?: string) => Promise<void>;
}
