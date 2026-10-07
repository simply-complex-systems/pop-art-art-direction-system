import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { normalizeBasePath } from './scripts/base-path.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react()],
    // One canonical static library; Vite serves it in development and copies it for deployment.
    publicDir: env['VITE_LIBRARY_DIR'] ?? 'packs',
    base: normalizeBasePath(env['VITE_BASE_PATH'] ?? '/'),
    build: { outDir: env['VITE_OUTPUT_DIR'] ?? 'dist', target: 'es2022' },
    server: { host: '127.0.0.1', port: 5173, strictPort: true },
    preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  };
});
