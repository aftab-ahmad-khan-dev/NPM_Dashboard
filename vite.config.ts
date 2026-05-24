import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/npm-downloads': {
        target: 'https://api.npmjs.org',
        changeOrigin: true,
        secure: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq, req) => {
            const full = req.url ?? ''
            const qIndex = full.indexOf('?')
            if (qIndex === -1) return
            const sp = new URLSearchParams(full.slice(qIndex))
            const pRaw = sp.get('p')
            if (pRaw === null || pRaw === '') return
            proxyReq.path = `/downloads/${pRaw}`
          })
        },
      },
    },
  },
})
