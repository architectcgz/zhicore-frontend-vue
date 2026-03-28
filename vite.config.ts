import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

function getShikiLanguageChunkName(id: string) {
  const marker = '/node_modules/@shikijs/langs/dist/';
  const index = id.indexOf(marker);

  if (index === -1) {
    return null;
  }

  const fileName = id.slice(index + marker.length).split('/')[0];
  return `shiki-lang-${fileName.replace(/\.mjs$/, '')}`;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          const shikiLanguageChunkName = getShikiLanguageChunkName(id);
          if (shikiLanguageChunkName) {
            return shikiLanguageChunkName;
          }

          if (id.includes('/node_modules/vue/') || id.includes('/node_modules/@vue/')) {
            return 'vue-core';
          }

          if (id.includes('/node_modules/vue-router/') || id.includes('/node_modules/pinia/')) {
            return 'vue-routing';
          }

          if (id.includes('/node_modules/@element-plus/icons-vue/')) {
            return 'element-plus-icons';
          }

          if (id.includes('/node_modules/element-plus/')) {
            return 'element-plus-core';
          }

          if (id.includes('/node_modules/@tanstack/')) {
            return 'tanstack-query';
          }

          if (
            id.includes('/node_modules/markdown-it/') ||
            id.includes('/node_modules/dompurify/')
          ) {
            return 'markdown-runtime';
          }

          if (
            id.includes('/node_modules/shiki/') ||
            id.includes('/node_modules/@shikijs/core/') ||
            id.includes('/node_modules/@shikijs/engine-javascript/') ||
            id.includes('/node_modules/@shikijs/themes/')
          ) {
            return 'shiki-core';
          }

          if (id.includes('/node_modules/echarts/')) {
            return 'echarts';
          }

          if (
            id.includes('/node_modules/axios/') ||
            id.includes('/node_modules/dayjs/') ||
            id.includes('/node_modules/date-fns/')
          ) {
            return 'vendor-http-date';
          }

          if (
            id.includes('/node_modules/@stomp/') ||
            id.includes('/node_modules/sockjs-client/')
          ) {
            return 'vendor-realtime';
          }

          if (id.includes('/node_modules/@fortawesome/')) {
            return 'vendor-fontawesome';
          }

          if (id.includes('/node_modules/@vueuse/')) {
            return 'vendor-vueuse';
          }

          return 'vendor';
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
