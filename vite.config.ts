import path from 'path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'AusTeen Money — Australian Teen Finance Guide',
        short_name: 'AusTeen Money',
        description:
          'Free, privacy-first Australian personal finance guides, calculators and Q&A for young Aussies. Everything runs in your browser.',
        theme_color: '#1c1c1c',
        background_color: '#0a0a0a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
    visualizer({
      filename: 'dist/report.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
  build: {
    target: 'es2022',
    cssTarget: 'es2022',
    cssMinify: 'lightningcss',
    minify: 'esbuild',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
            return 'charts'
          }
          if (id.includes('react-dom') || id.includes('scheduler')) return 'react-dom'
          if (id.includes('react') || id.includes('react-router') || id.includes('react-router-dom')) {
            return 'react-vendor'
          }
          if (id.includes('motion') || id.includes('framer-motion')) return 'motion'
          if (id.includes('cmdk')) return 'cmdk'
          if (id.includes('fuse.js')) return 'fuse'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('recharts')) return 'charts'
          return 'vendor'
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 31000,
  },
  preview: {
    host: '0.0.0.0',
    port: 31001,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
