import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'AusFinance Suite — Australian Personal Finance Toolkit',
        short_name: 'AusFinance',
        description:
          'Free, privacy-first Australian personal finance guides, calculators and statutory Q&A. 100% browser-based with zero tracking.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,png,jpg,webp}'],
        globIgnores: ['**/report.html', '**/sw.js', '**/workbox-*.js'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
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
      open: false,
    }),
  ],
  build: {
    target: 'es2025',
    cssTarget: 'es2025',
    cssMinify: 'lightningcss',
    assetsInlineLimit: 4096,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 650,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'charts',
              test: /recharts|d3-|victory-vendor/,
              priority: 20,
            },
            {
              name: 'react-dom',
              test: /react-dom|scheduler/,
              priority: 15,
            },
            {
              name: 'react-vendor',
              test: /react(?!-dom)|react-router/,
              priority: 14,
            },
            {
              name: 'motion',
              test: /motion|framer-motion/,
              priority: 12,
            },
            {
              name: 'cmdk',
              test: /cmdk/,
              priority: 10,
            },
            {
              name: 'fuse',
              test: /fuse\.js/,
              priority: 10,
            },
            {
              name: 'icons',
              test: /lucide-react/,
              priority: 10,
            },
            {
              name: 'vendor',
              test: /node_modules/,
              priority: 1,
            },
          ],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 31500,
  },
  preview: {
    host: '0.0.0.0',
    port: 31501,
  },
  resolve: {
    tsconfigPaths: true,
  },
})
