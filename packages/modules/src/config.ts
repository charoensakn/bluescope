import fs from 'node:fs';
import path from 'node:path';
import { app, ipcMain, nativeTheme } from 'electron';

export type Theme = 'light' | 'dark' | 'system';
export type Locale = 'en' | 'th';

const themeStatePath = path.join(app.getPath('userData'), 'theme-state.json');
const uiLocaleStatePath = path.join(app.getPath('userData'), 'ui-locale-state.json');
const promptLocaleStatePath = path.join(app.getPath('userData'), 'prompt-locale-state.json');
const reasoningStatePath = path.join(app.getPath('userData'), 'reasoning-state.json');

const cache: Record<string, unknown> = {};

function readState(path: string, key: string, validValues: unknown[]): unknown {
  if (cache[key]) {
    return cache[key];
  }
  if (fs.existsSync(path)) {
    try {
      const data = fs.readFileSync(path, { encoding: 'utf8' });
      const state = JSON.parse(data);
      if (validValues.includes(state[key])) {
        cache[key] = state[key];
        return state[key];
      }
    } catch {
      // If there's an error reading/parsing the file, fall back to default
    }
  }
  return validValues[0]; // Return the first valid value as default
}

export function readThemeState() {
  return readState(themeStatePath, 'theme', ['system', 'light', 'dark']) as Theme;
}

function readUiLocaleState() {
  return readState(uiLocaleStatePath, 'uiLocale', ['th', 'en']) as Locale;
}

function readPromptLocaleState() {
  return readState(promptLocaleStatePath, 'promptLocale', ['th', 'en']) as Locale;
}

function readReasoningState() {
  return readState(reasoningStatePath, 'reasoning', ['on', 'off']) as 'on' | 'off';
}

function getTheme(event: Electron.IpcMainEvent) {
  event.returnValue = readThemeState();
}

function getThemeMode(event: Electron.IpcMainEvent) {
  const theme = readThemeState();
  if (theme === 'dark' || theme === 'light') {
    event.returnValue = theme;
    return;
  }
  const mode = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  nativeTheme.themeSource = theme;
  event.returnValue = mode;
}

function setTheme(_event: Electron.IpcMainInvokeEvent, theme: string) {
  try {
    if (theme === 'dark' || theme === 'light' || theme === 'system') {
      const themeState = { theme };
      fs.writeFileSync(themeStatePath, JSON.stringify(themeState), {
        encoding: 'utf8',
      });
      nativeTheme.themeSource = theme;
      delete cache.theme;
      return true;
    }
    throw new Error('Invalid theme');
  } catch {
    return false;
  }
}

function getUiLocale(event: Electron.IpcMainEvent) {
  event.returnValue = readUiLocaleState();
}

function setUiLocale(_event: Electron.IpcMainInvokeEvent, uiLocale: string) {
  try {
    if (uiLocale === 'th' || uiLocale === 'en') {
      const uiLocaleState = { uiLocale };
      fs.writeFileSync(uiLocaleStatePath, JSON.stringify(uiLocaleState), {
        encoding: 'utf8',
      });
      delete cache.uiLocale;
      return true;
    }
    throw new Error('Invalid UI locale');
  } catch {
    return false;
  }
}

function getPromptLocale(event: Electron.IpcMainEvent) {
  event.returnValue = readPromptLocaleState();
}

function setPromptLocale(_event: Electron.IpcMainInvokeEvent, promptLocale: string) {
  try {
    if (promptLocale === 'th' || promptLocale === 'en') {
      const promptLocaleState = { promptLocale };
      fs.writeFileSync(promptLocaleStatePath, JSON.stringify(promptLocaleState), {
        encoding: 'utf8',
      });
      delete cache.promptLocale;
      return true;
    }
    throw new Error('Invalid prompt locale');
  } catch {
    return false;
  }
}

function getReasoning(event: Electron.IpcMainEvent) {
  event.returnValue = readReasoningState() === 'on';
}

function setReasoning(_event: Electron.IpcMainInvokeEvent, reasoning: boolean) {
  try {
    const reasoningState = { reasoning: reasoning ? 'on' : 'off' };
    fs.writeFileSync(reasoningStatePath, JSON.stringify(reasoningState), {
      encoding: 'utf8',
    });
    delete cache.reasoning;
    return true;
  } catch {
    return false;
  }
}

export function register() {
  ipcMain.on('config:getTheme', getTheme);
  ipcMain.on('config:getThemeMode', getThemeMode);
  ipcMain.handle('config:setTheme', setTheme);
  ipcMain.on('config:getUiLocale', getUiLocale);
  ipcMain.handle('config:setUiLocale', setUiLocale);
  ipcMain.on('config:getPromptLocale', getPromptLocale);
  ipcMain.handle('config:setPromptLocale', setPromptLocale);
  ipcMain.on('config:getReasoning', getReasoning);
  ipcMain.handle('config:setReasoning', setReasoning);
}

export interface IConfig {
  getTheme: () => Theme;
  getThemeMode: () => Omit<Theme, 'system'>;
  setTheme: (theme: Theme) => Promise<boolean>;
  getUiLocale: () => Locale;
  setUiLocale: (locale: Locale) => Promise<boolean>;
  getPromptLocale: () => Locale;
  setPromptLocale: (locale: Locale) => Promise<boolean>;
  getReasoning: () => boolean;
  setReasoning: (reasoning: boolean) => Promise<boolean>;
}
