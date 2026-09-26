import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const p = (env.VITE_ADMIN_PATH || '').replace(/^\/+|\/+$/g, '');
  const RESERVED = ['', 'assets', 'api', 'photos', 'programs', 'batches', 'team',
    'achievements', 'gallery', 'events', 'articles', 'contact', 'admin', 'login'];
  if (RESERVED.includes(p) || !/^[a-z0-9-]{6,}$/.test(p)) {
    throw new Error('VITE_ADMIN_PATH must be a 6+ char lowercase slug that is not a public route');
  }

  return {
    root: 'admin',
    base: `/${p}/`,
    plugins: [react()],
    build: {
      outDir: `../dist/${p}`,
      emptyOutDir: false,
    },
    server: {
      port: 5174,
      proxy: { '/api': 'http://localhost:9000' },
    },
  };
});
