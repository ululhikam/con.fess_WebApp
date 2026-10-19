import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

const proxy = {
  '/api': { target: 'http://127.0.0.1:3000', changeOrigin: true },
  '/upload': { target: 'http://127.0.0.1:3000', changeOrigin: true },
};

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [vue()],

    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },

    server: { port: 5173, host: true, proxy },
    preview: { port: 5173, host: true, proxy },

    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
    },

    build: {
      target: 'es2020',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      minify: 'esbuild',
      chunkSizeWarningLimit: 600,

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules/vue/') ||
              id.includes('node_modules/@vue/') ||
              id.includes('node_modules/vue-router/') ||
              id.includes('node_modules/pinia/')
            ) {
              return 'vue-vendor';
            }
            if (id.includes('node_modules/lucide-vue-next')) {
              return 'ui-vendor';
            }
            if (id.includes('node_modules/html-to-image')) {
              return 'export-vendor';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },

    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'lucide-vue-next'],
      force: false,
    },
  };
});
