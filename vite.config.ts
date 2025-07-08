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
<<<<<<< HEAD
=======
    'process.env': {
      VITE_SUPABASE_URL: JSON.stringify('https://epflwghuawfpcbrydctg.supabase.co'),
      VITE_SUPABASE_ANON_KEY: JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZmx3Z2h1YXdmcGNicnlkY3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNjI1MzcsImV4cCI6MjA2NjczODUzN30.bmGHqelw-7bE2bjee7BCAjPfsSbdLLTj03HkSX8k12k'),
      VITE_ORANGE_MONEY_CLIENT_ID: JSON.stringify('payfuse_orange_client_2025'),
      VITE_ORANGE_MONEY_CLIENT_SECRET: JSON.stringify('orange_secret_key_production'),
      VITE_ORANGE_MONEY_BASE_URL: JSON.stringify('https://api.orange.com/orange-money-webpay/v1'),
      VITE_WAVE_API_KEY: JSON.stringify('wave_api_key_production_2025'),
      VITE_WAVE_BASE_URL: JSON.stringify('https://api.wave.com/v1'),
      VITE_MTN_MOMO_API_KEY: JSON.stringify('mtn_momo_production_key_2025'),
      VITE_MTN_MOMO_BASE_URL: JSON.stringify('https://api.mtn.com/momo/v1'),
      VITE_ELEVENLABS_API_KEY: JSON.stringify('https://elevenlabs.io/app/conversational-ai/agents/agent_01jyy1zf54eytsxwseww8zsrtr'),
      VITE_OPENAI_API_KEY: JSON.stringify('sk-payfuse-openai-production-key'),
      VITE_REVENUECAT_API_KEY: JSON.stringify('revenuecat_production_key_2025'),
      VITE_WEBHOOK_SECRET: JSON.stringify('payfuse_webhook_secret_production_2025'),
      VITE_ENVIRONMENT: JSON.stringify('production')
    }
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
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
<<<<<<< HEAD
})
=======
})
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
