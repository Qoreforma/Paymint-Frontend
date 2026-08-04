import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Raise the warning threshold slightly — the main chunk is large due to bundled vendor libs
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State / data fetching
          'vendor-query': ['@tanstack/react-query'],
          // Forms & validation
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // UI / animation
          'vendor-ui': ['framer-motion', 'lucide-react', 'sonner', 'axios'],
        },
      },
    },
  },
})
