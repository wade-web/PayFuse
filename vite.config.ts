import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@tanstack/react-query']
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: false,
    hmr: {
      port: 3001,
      host: 'localhost'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      util: 'util',
      buffer: 'buffer',
      process: 'process/browser'
    }
  },
  esbuild: {
    target: 'es2020'
  }
})