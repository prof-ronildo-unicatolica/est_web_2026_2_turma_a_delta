import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Em desenvolvimento (npm run dev) o front chama /api/v1/... e o Vite repassa
// para o backend. Em produção (Docker) quem faz esse papel é o nginx.conf.
// Para apontar para outra API: VITE_API_URL=https://minha-api/api/v1 npm run dev
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
