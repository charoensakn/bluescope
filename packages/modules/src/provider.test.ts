import { describe, expect, it, vi } from 'vitest';
import { availableProviders } from './provider';

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/test-providers'),
    getAppPath: vi.fn(() => '/tmp/app'),
  },
  ipcMain: { handle: vi.fn(), on: vi.fn() },
  safeStorage: { isEncryptionAvailable: vi.fn(() => false) },
}));

// Mock fs module to control provider state without touching disk
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(() => '[]'),
    writeFileSync: vi.fn(),
  };
});

describe('provider module', () => {
  describe('availableProviders', () => {
    it('returns empty array when no providers configured', () => {
      const providers = availableProviders(() => true);
      expect(providers).toEqual([]);
    });

    it('returns empty array when predicate matches nothing', () => {
      const providers = availableProviders(() => false);
      expect(providers).toEqual([]);
    });
  });
});
