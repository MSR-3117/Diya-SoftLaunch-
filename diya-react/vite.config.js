import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/brand': {
        target: 'http://localhost:5555',
        changeOrigin: true,
        secure: false,
      },
      '/calendar': {
        target: 'http://localhost:5555',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:5555',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
