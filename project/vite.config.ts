// @ts-nocheck
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// TypeScript workaround for import.meta.url
const __filename = fileURLToPath((import.meta as any).url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        overlay: resolve(__dirname, 'overlay.html'),
      },
      output: {
        entryFileNames: chunk => chunk.name === 'overlay' ? 'chrome/overlay.js' : '[name].js',
        assetFileNames: chunk => chunk.name === 'overlay' ? 'chrome/[name][extname]' : '[name][extname]',
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
});
