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
    'process.env': {
      VITE_SUPABASE_URL: JSON.stringify(process.env.VITE_SUPABASE_URL),
      VITE_SUPABASE_ANON_KEY: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
      VITE_ORANGE_MONEY_CLIENT_ID: JSON.stringify(process.env.VITE_ORANGE_MONEY_CLIENT_ID),
      VITE_ORANGE_MONEY_CLIENT_SECRET: JSON.stringify(process.env.VITE_ORANGE_MONEY_CLIENT_SECRET),
      VITE_ORANGE_MONEY_BASE_URL: JSON.stringify(process.env.VITE_ORANGE_MONEY_BASE_URL),
      VITE_WAVE_API_KEY: JSON.stringify(process.env.VITE_WAVE_API_KEY),
      VITE_WAVE_BASE_URL: JSON.stringify(process.env.VITE_WAVE_BASE_URL),
      VITE_MTN_MOMO_API_KEY: JSON.stringify(process.env.VITE_MTN_MOMO_API_KEY),
      VITE_MTN_MOMO_BASE_URL: JSON.stringify(process.env.VITE_MTN_MOMO_BASE_URL),
      VITE_ELEVENLABS_API_KEY: JSON.stringify(process.env.VITE_ELEVENLABS_API_KEY),
      VITE_OPENAI_API_KEY: JSON.stringify(process.env.VITE_OPENAI_API_KEY),
      VITE_REVENUECAT_API_KEY: JSON.stringify(process.env.VITE_REVENUECAT_API_KEY),
      VITE_WEBHOOK_SECRET: JSON.stringify(process.env.VITE_WEBHOOK_SECRET),
      VITE_ENVIRONMENT: JSON.stringify(process.env.VITE_ENVIRONMENT)
    }
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
