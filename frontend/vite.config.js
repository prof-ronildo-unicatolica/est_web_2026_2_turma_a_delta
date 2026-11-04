
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Em desenvolvimento, o Vite encaminha /api para o backend.
// Em produção, essa função é realizada pelo nginx.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
