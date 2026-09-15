import { defineConfig, svgoOptimizer } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ausfintools.com',
  base: process.env.VITE_BASE ?? '/',
  output: 'static',
  compressHTML: 'jsx',
  prerenderConflictBehavior: 'error',
  scopedStyleStrategy: 'where',
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
  },
  experimental: {
    clientPrerender: true,
    contentIntellisense: true,
    incrementalBuild: true,
    svgOptimizer: svgoOptimizer(),
    collectionStorage: 'chunked',
    chromeDevtoolsWorkspace: true,
  },
  redirects: {
    '/fire': '/super-drawdown',
    '/house-affordability': '/car-driving',
    '/investment-compare': '/investing-shares',
    '/offset-vs-debt-recycling': '/careers-employment',
    '/portfolio': '/profile',
    '/property-research': '/car-driving',
    '/savings-rate': '/teen-budgeting',
    '/tax-savings': '/tax-guide',
    '/wealth-property': '/car-driving',
  },
  image: {
    responsiveStyles: true,
  },
  build: {
    concurrency: 4,
    inlineStylesheets: 'auto',
  },
  integrations: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
    sitemap(),
  ],
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      target: 'es2025',
      cssTarget: 'es2025',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
              return 'charts';
            }
            if (id.includes('node_modules/motion')) {
              return 'motion';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'icons';
            }
            if (id.includes('node_modules/fuse.js')) {
              return 'search';
            }
          },
        },
      },
    },
  },
});
