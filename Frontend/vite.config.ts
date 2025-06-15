import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['./eslint.config.js']
  },
  build: {
    rollupOptions: {
      external: ['./eslint.config.js'],
      output: {
        manualChunks: undefined,
      },
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
});