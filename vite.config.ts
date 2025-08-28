import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-is': path.resolve(__dirname, 'node_modules/react-is'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})


