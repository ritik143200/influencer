import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    allowedHosts: ['.lhr.life', '.trycloudflare.com']
  },
  preview: {
    allowedHosts: ['.lhr.life', '.trycloudflare.com']
  }
})
