import { describe, expect, it } from 'vitest';
import { getLatestVersion } from './utils.js';

describe('getLatestVersion', () => {
  it('returns null or a valid LatestReleaseInfo object', async () => {
    const result = await getLatestVersion();

    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.tagName).toBe('string');
      expect(typeof result.name).toBe('string');
      expect(typeof result.browserDownloadUrl).toBe('string');
    }
  });

  it('returned browserDownloadUrl contains the current platform when result is not null', async () => {
    const result = await getLatestVersion();

    if (result !== null) {
      expect(result.browserDownloadUrl).toContain(process.platform);
    }
  });

  it('returned tagName is non-empty when result is not null', async () => {
    const result = await getLatestVersion();

    if (result !== null) {
      expect(result.tagName.length).toBeGreaterThan(0);
    }
  });
});
