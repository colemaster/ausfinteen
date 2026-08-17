import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ausfintools.com',
  base: process.env.VITE_BASE ?? '/',
  output: 'static',
  integrations: [react(), sitemap()],
  server: {
    host: '0.0.0.0',
    port: 31500,
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
    },
  },
});
