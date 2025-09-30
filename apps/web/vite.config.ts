import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Cast plugin to any to avoid cross-workspace type mismatch warnings
  plugins: [vue() as any],
  base: command === 'build' ? '/izakaya-verse/' : '/',
  server: {
    host: '0.0.0.0'
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true
  }
}))
