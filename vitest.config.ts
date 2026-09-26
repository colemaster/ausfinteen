import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    css: false, // Skip CSS processing in tests for faster execution
    pool: 'threads',
    isolate: true,
    setupFiles: [],
    // Performance: enable transform caching across test runs
    fsModuleCache: true,
    // Performance: only transform what's needed
    deps: {
      optimizer: {
        client: {
          enabled: true,
        },
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
})
