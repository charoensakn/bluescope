import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock BrowserWindow behavior
const mockWin = {
  minimize: vi.fn(),
  maximize: vi.fn(),
  unmaximize: vi.fn(),
  close: vi.fn(),
  setTitle: vi.fn(),
  isMaximized: vi.fn(() => false),
};

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/test'),
    relaunch: vi.fn(),
    exit: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(() => mockWin),
  },
  ipcMain: { handle: vi.fn(), on: vi.fn() },
}));

import { register } from './browser';
import { BrowserWindow, ipcMain } from 'electron';

describe('browser module', () => {
  let handlers: Record<string, (...args: unknown[]) => unknown> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = {};

    // Capture ipcMain.handle registrations
    vi.mocked(ipcMain.handle).mockImplementation((channel: string, handler: (...args: unknown[]) => unknown) => {
      handlers[channel] = handler;
      return {} as Electron.IpcMain;
    });
    vi.mocked(ipcMain.on).mockImplementation((channel: string, handler: (...args: unknown[]) => void) => {
      handlers[channel] = handler;
      return {} as Electron.IpcMain;
    });

    register();
  });

  const fakeEvent = () => ({ sender: {} } as unknown as Electron.IpcMainInvokeEvent);

  describe('minimize', () => {
    it('calls minimize on the window', async () => {
      await handlers['minimize']?.(fakeEvent());
      expect(mockWin.minimize).toHaveBeenCalled();
    });
  });

  describe('maximize', () => {
    it('calls maximize when window is not maximized', async () => {
      mockWin.isMaximized.mockReturnValue(false);
      await handlers['maximize']?.(fakeEvent());
      expect(mockWin.maximize).toHaveBeenCalled();
    });

    it('calls unmaximize when window is already maximized', async () => {
      mockWin.isMaximized.mockReturnValue(true);
      await handlers['maximize']?.(fakeEvent());
      expect(mockWin.unmaximize).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('calls close on the window', async () => {
      await handlers['close']?.(fakeEvent());
      expect(mockWin.close).toHaveBeenCalled();
    });
  });

  describe('setTitle', () => {
    it('sets title to "BlueScope" when no title provided', async () => {
      await handlers['setTitle']?.(fakeEvent(), undefined);
      expect(mockWin.setTitle).toHaveBeenCalledWith('BlueScope');
    });

    it('sets title with prefix for short titles', async () => {
      await handlers['setTitle']?.(fakeEvent(), 'Case 001');
      expect(mockWin.setTitle).toHaveBeenCalledWith('BlueScope - Case 001');
    });

    it('truncates title to 80 characters when too long', async () => {
      const longTitle = 'A'.repeat(100);
      await handlers['setTitle']?.(fakeEvent(), longTitle);
      expect(mockWin.setTitle).toHaveBeenCalledWith(`BlueScope - ${'A'.repeat(80)}`);
    });

    it('does not truncate title that is exactly 80 characters', async () => {
      const exactTitle = 'B'.repeat(80);
      await handlers['setTitle']?.(fakeEvent(), exactTitle);
      expect(mockWin.setTitle).toHaveBeenCalledWith(`BlueScope - ${'B'.repeat(80)}`);
    });

    it('does not truncate title that is 81 characters', async () => {
      const title81 = 'C'.repeat(81);
      await handlers['setTitle']?.(fakeEvent(), title81);
      expect(mockWin.setTitle).toHaveBeenCalledWith(`BlueScope - ${'C'.repeat(80)}`);
    });
  });

  describe('when window is not found', () => {
    beforeEach(() => {
      mockWin.minimize.mockReset();
      mockWin.close.mockReset();
      mockWin.setTitle.mockReset();
      vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(null);
    });

    afterEach(() => {
      vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(mockWin);
    });

    it('does nothing when minimize called without window', async () => {
      await handlers['minimize']?.(fakeEvent());
      expect(mockWin.minimize).not.toHaveBeenCalled();
    });

    it('does nothing when close called without window', async () => {
      await handlers['close']?.(fakeEvent());
      expect(mockWin.close).not.toHaveBeenCalled();
    });

    it('does nothing when setTitle called without window', async () => {
      await handlers['setTitle']?.(fakeEvent(), 'Test');
      expect(mockWin.setTitle).not.toHaveBeenCalled();
    });
  });
});
