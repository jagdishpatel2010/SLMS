import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration.
// The dev server proxies /api calls to the Express backend so the frontend
// and backend can run on separate ports without CORS friction during
// development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
