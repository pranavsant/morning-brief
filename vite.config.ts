import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // ── Clean-Architecture layer aliases ──────────────────────────────────
      // These are the canonical imports for cross-layer references in the DDD
      // structure. All four must be listed before the catch-all below.
      '@domain':         resolve(__dirname, 'src/domain'),
      '@application':    resolve(__dirname, 'src/application'),
      '@infrastructure': resolve(__dirname, 'src/infrastructure'),
      '@interfaces':     resolve(__dirname, 'src/interfaces'),

      // ── Shorthand aliases inside the interfaces (UI) layer ────────────────
      // "@/" maps to src/interfaces/ so component files can use short imports:
      //   import { Spinner } from '@/components/Spinner'
      //   import { useFeed }  from '@/hooks/useFeed'
      // The specific sub-directory entries are listed explicitly first so that
      // Vite resolves them before the wildcard entry below.
      '@/components':  resolve(__dirname, 'src/interfaces/components'),
      '@/pages':       resolve(__dirname, 'src/interfaces/pages'),
      '@/hooks':       resolve(__dirname, 'src/interfaces/hooks'),
      '@/controllers': resolve(__dirname, 'src/interfaces/controllers'),
      '@/lib':         resolve(__dirname, 'src/interfaces/lib'),
      '@/di':          resolve(__dirname, 'src/interfaces/di'),
      // Catch-all: any remaining @/<path> resolves into src/interfaces/<path>
      '@/':            resolve(__dirname, 'src/interfaces/'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
