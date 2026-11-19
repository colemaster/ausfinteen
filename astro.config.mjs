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
  compressHTML: 'jsx',
  prerenderConflictBehavior: 'error',
  scopedStyleStrategy: 'where',
  prefetch: {
    defaultStrategy: 'hover',
    prefetchAll: true,
  },
  security: {
    checkOrigin: true,
  },
  experimental: {
    clientPrerender: true,
    contentIntellisense: true,
    incrementalBuild: true,
    parallelPrerender: true,
    svgOptimizer: svgoOptimizer(),
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
    css: {
      transformer: 'lightningcss',
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
      // NOTE: broader `codeSplitting.groups` (charts / motion / vendor) were
      // measured and deliberately rejected. Hoisting them into shared chunks
      // *increased* the summed critical path by ~25% (e.g. /calculators/ went
      // 206 KB -> 328 KB gzip because the 121 KB `charts` chunk got pulled onto
      // pages that render no chart at all). Recharts and Sonner are deferred
      // dynamically instead. Vendor de-duplication uses `resolve.dedupe` above.
    },
  },
});
