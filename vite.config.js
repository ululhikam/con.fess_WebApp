import { defineConfig, splitVendorChunkPlugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

const proxy = {
  '/api': { target: 'http://127.0.0.1:3000', changeOrigin: true },
  '/upload': { target: 'http://127.0.0.1:3000', changeOrigin: true },
};

export default defineConfig({
  plugins: [
    vue(),
    // Automatically split vendor vs app chunk for better long-term caching
    splitVendorChunkPlugin(),
  ],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  server: { port: 5173, host: true, proxy },
  preview: { port: 5173, host: true, proxy },

  build: {
    // Target modern browsers — smaller output, native ES modules
    target: 'es2020',
    // Inline assets smaller than 4 kB (reduced from default 8 kB to avoid big inlines)
    assetsInlineLimit: 4096,
    // Enable CSS code splitting for better parallel loading
    cssCodeSplit: true,
    // Minify with esbuild (default, fastest)
    minify: 'esbuild',
    // Report if any chunk exceeds 500 kB
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting strategy:
         *  - vue-vendor  : Vue + Vue Router (always cached after first visit)
         *  - ui-vendor   : Lucide icons (large but rarely changes)
         *  - app         : Application code (changes on deploy)
         * This maximises cache re-use across deploys.
         */
        manualChunks(id) {
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router')) {
            return 'vue-vendor';
          }
          if (id.includes('node_modules/lucide-vue-next')) {
            return 'ui-vendor';
          }
          if (id.includes('node_modules/html-to-image') || id.includes('node_modules/html2canvas')) {
            return 'export-vendor';
          }
        },
        // Deterministic chunk file names with content hash for cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  // Optimise dependency pre-bundling — list deps that are imported in many places
  // so Vite bundles them once rather than on every import during dev.
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'lucide-vue-next',
    ],
    // Force re-bundle if deps are stale
    force: false,
  },
});
