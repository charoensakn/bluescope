import fs from 'node:fs';
import path from 'node:path';
import {
  advisorModule,
  browserModule,
  caseModule,
  classificationModule,
  configModule,
  dashboardModule,
  descriptionModule,
  devModule,
  llmModule,
  logModule,
  presetModule,
  providerModule,
  refinementModule,
  searchModule,
  structureModule,
} from '@repo/modules';
import { connect, migrate } from '@repo/repos';
import { app, BaseWindow, BrowserWindow, ImageView, ipcMain, Menu, nativeImage, nativeTheme, shell } from 'electron';
import started from 'electron-squirrel-startup';
import { notify } from './electron_utils';
import { getLatestVersion } from './utils';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const windowStatePath = path.join(app.getPath('userData'), 'window-state.json');
const splashPath = path.join(app.getAppPath(), 'public', 'splash.png');
const dbPath = path.join(app.getPath('userData'), 'localdb.sqlite3');
const migrationsPath = path.join(app.getAppPath(), 'migrations');
const iconPath = path.join(app.getAppPath(), 'public', 'icon.png');
const versionPath = path.join(app.getAppPath(), 'version.json');

const appVersions = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));

Menu.setApplicationMenu(null);

const createWindow = async () => {
  const splashWin = new BaseWindow({
    width: 600,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    center: true,
    titleBarStyle: 'hidden',
    hasShadow: false,
    backgroundColor: 'hsl(209, 100%, 28%)',
    darkTheme: true,
    type: 'splash',
    useContentSize: true,
    modal: false,
    movable: false,
    resizable: false,
  });
  const splashView = new ImageView();
  const splashImage = nativeImage.createFromPath(splashPath);
  splashView.setImage(splashImage);
  splashWin.setContentView(splashView);

  // Initialize database and modules
  try {
    const db = connect(dbPath);
    await migrate(db, migrationsPath);

    ipcMain.on('versions', (event) => {
      event.returnValue = appVersions;
    });

    advisorModule.register(db);
    browserModule.register();
    caseModule.register(db);
    classificationModule.register(db);
    configModule.register();
    dashboardModule.register(db);
    descriptionModule.register(db);
    devModule.register(db);
    llmModule.register();
    logModule.register(db);
    presetModule.register(db);
    providerModule.register();
    refinementModule.register(db);
    searchModule.register(db);
    structureModule.register(db);

    ipcMain.on('openExternal', (_event, url: string) => {
      shell.openExternal(url);
    });
  } catch (err) {
    notify({
      message: `Failed to initialize the application: ${(err as Error).message}`,
      onClick: () => {
        app.quit();
      },
      onClose: () => {
        app.quit();
      },
      onError: () => {
        console.error('Failed to initialize the application:', err);
        app.quit();
      },
    });
  }

  nativeTheme.themeSource = configModule.readThemeState();

  let winState: { x?: number; y?: number; width: number; height: number };
  try {
    const data = fs.readFileSync(windowStatePath, { encoding: 'utf8' });
    winState = JSON.parse(data);
    if (
      typeof winState.x === 'number' &&
      typeof winState.y === 'number' &&
      typeof winState.width === 'number' &&
      typeof winState.height === 'number'
    ) {
      if (winState.x < 0) {
        winState.width += Math.abs(winState.x);
        winState.x = 0;
      }
      if (winState.y < 0) {
        winState.height += Math.abs(winState.y);
        winState.y = 0;
      }
      if (winState.width < 600) winState.width = 600;
      if (winState.height < 680) winState.height = 680;
    } else {
      winState = { x: undefined, y: undefined, width: 800, height: 600 };
    }
  } catch {
    winState = { x: undefined, y: undefined, width: 800, height: 600 };
  }

  const icon = nativeImage.createFromPath(iconPath);

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    x: winState.x,
    y: winState.y,
    width: winState.width,
    height: winState.height,
    minWidth: 600,
    minHeight: 680,
    show: false,
    icon,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'main', 'preload.js'),
    },
  });

  mainWindow.once('ready-to-show', () => {
    splashWin.close();
    mainWindow.show();

    getLatestVersion().then((latest) => {
      if (latest && latest.tagName.localeCompare(`v${app.getVersion()}`) > 0) {
        notify({
          message: `A new version ${latest.tagName} is available! Click to download.`,
          onClick: () => {
            shell.openExternal(latest.browserDownloadUrl);
          },
        });
      }
    });
  });

  const rendererPath = path.join(app.getAppPath(), 'renderer', `index.html`);
  if (fs.existsSync(rendererPath)) {
    mainWindow.loadFile(rendererPath);
  } else if (process.env.VITE_APP_URL) {
    mainWindow.loadURL(process.env.VITE_APP_URL);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    notify({
      message: `No renderer found, ${process.env.VITE_APP_URL || 'please set VITE_APP_URL in .env'}`,
      onClick: () => {
        app.quit();
      },
      onClose: () => {
        app.quit();
      },
      onError: () => {
        console.error('No renderer found, unable to start the application');
        app.quit();
      },
    });
  }

  mainWindow.on('close', () => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    fs.writeFileSync(windowStatePath, JSON.stringify(bounds), { encoding: 'utf8' });
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
