import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL, // Replace with your backend server URL
        changeOrigin: true,
        secure: false,
      }
    }
  },
  css: {
    postcss: './postcss.config.js',
  },
})
