import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

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
        globIgnores: ['**/report.html', '**/sw.js', '**/workbox-*.js'],
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
    target: 'es2025',
    cssTarget: 'es2025',
    cssMinify: 'lightningcss',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
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
    port: 45985,
  },
  preview: {
    host: '0.0.0.0',
    port: 45986,
  },
  resolve: {
    tsconfigPaths: true,
  },
})
