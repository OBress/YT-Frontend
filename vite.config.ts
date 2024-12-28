import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/YT-Frontend/',
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      manifest: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      https: process.env.NODE_ENV === 'production' 
        ? undefined 
        : {
            key: './certificates/private.key',
            cert: './certificates/certificate.crt',
          },
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
        }
      },
    },
    css: {
      postcss: './postcss.config.js',
    },
  }
})
