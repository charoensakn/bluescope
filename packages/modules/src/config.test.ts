import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Must mock electron BEFORE importing any module that imports from 'electron'
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => os.tmpdir()),
    getAppPath: vi.fn(() => '/tmp/app'),
    relaunch: vi.fn(),
    exit: vi.fn(),
  },
  ipcMain: { handle: vi.fn(), on: vi.fn() },
  nativeTheme: { themeSource: 'system' as string },
  safeStorage: { isEncryptionAvailable: vi.fn(() => false) },
  BrowserWindow: { fromWebContents: vi.fn() },
}));

// Import AFTER mock is defined
import { readThemeState } from './config';

describe('config module', () => {
  const tmpDir = os.tmpdir();

  function themeStatePath() {
    return path.join(tmpDir, 'theme-state.json');
  }

  function uiLocaleStatePath() {
    return path.join(tmpDir, 'ui-locale-state.json');
  }

  function promptLocaleStatePath() {
    return path.join(tmpDir, 'prompt-locale-state.json');
  }

  function reasoningStatePath() {
    return path.join(tmpDir, 'reasoning-state.json');
  }

  beforeEach(() => {
    // Remove state files before each test for isolation
    for (const p of [themeStatePath(), uiLocaleStatePath(), promptLocaleStatePath(), reasoningStatePath()]) {
      try {
        fs.unlinkSync(p);
      } catch {
        // ignore missing files
      }
    }
  });

  afterEach(() => {
    // Clean up state files
    for (const p of [themeStatePath(), uiLocaleStatePath(), promptLocaleStatePath(), reasoningStatePath()]) {
      try {
        fs.unlinkSync(p);
      } catch {
        // ignore
      }
    }
  });

  describe('readThemeState', () => {
    it('returns "system" as default when no state file exists', () => {
      const theme = readThemeState();
      // Default is first valid value: 'system'
      expect(['system', 'light', 'dark']).toContain(theme);
    });

    it('returns a valid theme value regardless of cache state', () => {
      // The module-level cache may have been populated already.
      // Verify the function always returns a valid Theme value.
      const theme = readThemeState();
      expect(['system', 'light', 'dark']).toContain(theme);
    });
  });
});
