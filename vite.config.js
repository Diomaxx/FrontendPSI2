import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    port: 3000,
    host: true,
    proxy: {
      '/renderapi': {
        target: 'https://backenddonaciones.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/renderapi/, '/api'),
      }
    }

  }
})

