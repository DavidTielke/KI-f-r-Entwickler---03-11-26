import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Im Entwicklungsmodus leitet Vite die Schnittstelle an den Factory-Dienst weiter.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: { '/api': 'http://127.0.0.1:4000' },
  },
})
