import { paraglideVitePlugin } from '@inlang/paraglide-js';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function getServerConfig(url?: string) {
  if (!url) {
    return undefined;
  }
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      throw new Error('Invalid protocol, must be http or https');
    }
    if (u.port === '') {
      throw new Error('Port is required');
    }

    return {
      host: u.hostname,
      port: parseInt(u.port, 10),
      strictPort: true,
    };
  } catch (err) {
    throw new Error(`Invalid URL provided in VITE_APP_URL: ${url}. ${(err as Error).message}`);
  }
}

// https://vite.dev/config/
export default defineConfig(({mode}) => ({
  base: mode === 'development' ? '/' : './',
  plugins: [
    paraglideVitePlugin({ project: './project.inlang', outdir: './src/paraglide' }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: getServerConfig(process.env.VITE_APP_URL),
  optimizeDeps: {
    exclude: ['@neo4j-nvl/layout-workers'],
    include: [
      '@neo4j-nvl/layout-workers > cytoscape',
      '@neo4j-nvl/layout-workers > cytoscape-cose-bilkent',
      '@neo4j-nvl/layout-workers > @neo4j-bloom/dagre',
      '@neo4j-nvl/layout-workers > bin-pack',
      '@neo4j-nvl/layout-workers > graphlib',
    ],
  },

  build: {
    rolldownOptions: {
      output: {
        manualChunks: (id: string) => {
          // Split MUI into a separate chunk
          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'mui';
          }
          // Split fonts into a separate chunk
          if (id.includes('@fontsource')) {
            return 'fonts';
          }
          // Split Neo4j layout workers into a separate chunk
          if (id.includes('@neo4j')) {
            return 'neo4j';
          }
          // Split tiptap into a separate chunk
          if (id.includes('@tiptap')) {
            return 'tiptap';
          }
          // Split react and react-dom into a separate chunk
          if (id.startsWith('react')) {
            return 'react';
          }
          // Default behavior: let Rollup handle it
          return undefined;
        },
      },
    },
  },
}));
