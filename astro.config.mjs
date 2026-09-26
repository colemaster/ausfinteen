import { defineConfig, svgoOptimizer } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://astro.build/config
export default defineConfig({
  site: 'https://ausfintools.com',
  base: process.env.VITE_BASE ?? '/',
  output: 'static',
  compressHTML: true,
  prerenderConflictBehavior: 'error',
  scopedStyleStrategy: 'where',
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
    ignoreSlowConnection: true,
  },
  security: {
    checkOrigin: true,
  },
  experimental: {
    clientPrerender: true,
    contentIntellisense: true,
    incrementalBuild: true,
    svgOptimizer: svgoOptimizer(),
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
    // Increase build concurrency to leverage all available CPU cores
    concurrency: 16,
    inlineStylesheets: 'auto',
  },
  integrations: [
    react({
      include: ['**/src/**/*.{jsx,tsx}'],
      compiler: true,
    }),
    sitemap(),
  ],
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
  vite: {
    plugins: [
      tailwindcss(),
      ...(process.env.ANALYZE
        ? [
            visualizer({
              filename: 'dist/report.html',
              gzipSize: true,
              brotliSize: true,
              template: 'treemap',
              open: false,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
      // The @astrojs/react renderer pulls React through a CJS interop shim while
      // application code imports the ESM build. Without dedupe the bundler can
      // emit two React instances, which both doubles the payload and breaks
      // hook identity across the boundary.
      dedupe: ['react', 'react-dom'],
    },
    build: {
      target: 'es2025',
      cssTarget: 'es2025',
      cssMinify: 'lightningcss',
      // Inline small assets to reduce HTTP round-trips
      assetsInlineLimit: 8192,
      modulePreload: { polyfill: false },
      sourcemap: false,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 900,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                // lucide-react emits one ~250 byte chunk *per icon*, which put
                // ~20 extra requests on every page for ~5 KB of glyphs. Folding
                // them into a single chunk trades ~7 KB for ~19 fewer round
                // trips and 19 fewer modules to link on the main thread.
                name: 'icons',
                test: /node_modules[\\/](lucide-react|@lucide[\\/])/,
                priority: 1,
              },
            ],
          },
        },
      },
      // NOTE: broader `codeSplitting.groups` (charts / motion / vendor) were
      // measured and deliberately rejected. Hoisting them into shared chunks
      // *increased* the summed critical path by ~25% (e.g. /calculators/ went
      // 206 KB -> 328 KB gzip because the 121 KB `charts` chunk got pulled onto
      // pages that render no chart at all). Recharts and Sonner are deferred
      // dynamically instead. Vendor de-duplication uses `resolve.dedupe` above.
    },
  },
});
