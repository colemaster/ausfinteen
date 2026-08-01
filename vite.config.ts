import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '192.168.50.23',
    port: 31000,
  },
  preview: {
    host: '192.168.50.23',
    port: 31001,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
