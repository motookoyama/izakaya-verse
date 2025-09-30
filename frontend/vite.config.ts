import { defineConfig } from 'vite';

const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || 5173);

export default defineConfig({
  server: {
    port: FRONTEND_PORT,
    proxy: {
      '/api': {
        target: 'http://localhost:4117',
        changeOrigin: true
      },
      '/v1': {
        target: 'http://localhost:4117',
        changeOrigin: true
      }
    }
  }
});
