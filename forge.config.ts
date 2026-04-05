import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerZIP } from '@electron-forge/maker-zip';

const config: ForgeConfig = {
  outDir: 'release',
  packagerConfig: {
    asar: false,
    icon: 'public/windows/icon.ico',
    ignore: [
    '^/[.].*',
    '^/apps',
    '^/packages',
    '^/release',
    '^/biome[.]json',
    '^/forge[.]config[.]ts',
    '^/make-version[.]js',
    '^/turbo[.]json',
    ],
  },
  rebuildConfig: {
    force: true,
  },
  makers: [
    new MakerZIP({
    }, ['darwin', 'linux', 'win32'])
  ],
};

export default config;