import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    UnoCSS(),
    TanStackRouterVite(),
    react(),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  build: {
    outDir: 'dist',
  },
  server: {
    port: 33005,
    proxy: {
      '/api': {
        target: 'http://localhost:33007',
        changeOrigin: true,
      },
    },
  },
})
