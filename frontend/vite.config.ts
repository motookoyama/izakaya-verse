import { defineConfig } from 'vite';

const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || 5173);

export default defineConfig({
  server: {
    port: FRONTEND_PORT,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      },
      '/v1': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
});
