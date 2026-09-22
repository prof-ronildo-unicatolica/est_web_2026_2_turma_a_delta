import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // equivale a '0.0.0.0' — escuta em todas as interfaces
    port: 5173,
    strictPort: true,   // falha em vez de trocar de porta silenciosamente
    watch: {
      usePolling: true,  // necessário em containers/volumes do Codespaces
      interval: 100,
    },
    hmr: {
      clientPort: 443,   // Codespaces faz proxy HTTPS; força o client a usar 443
    },
  },
})