import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // The backend runs on 5001 in this project. Override with
  // VITE_API_PROXY_TARGET if your local backend uses a different port.
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5001'

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3002,
      strictPort: true,
      allowedHosts: 'all',
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
