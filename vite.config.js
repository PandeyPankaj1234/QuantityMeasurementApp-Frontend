import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/login/oauth2': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    },
  },
})
