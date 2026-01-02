import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import Unocss from 'unocss/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    Unocss(),
    VueI18nPlugin({
      include: [
        path.resolve(__dirname, './src/locales/fa.json')
      ],
      strictMessage: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    css: true,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        'tests/**',
        'test/**',
        '*.config.*',
        '*.setup.*',
        'sweep.yaml',
        'vercel.json',
        'vite.config.js',
        'vitest.config.js'
      ]
    },
    mockReset: true,
    alias: [
      {
        find: /^virtual:pwa-register$/,
        replacement: path.resolve(__dirname, './tests/__mocks__/virtual:pwa-register.js')
      }
    ]
  },
  optimizeDeps: {
    include: ['@vue/shared'],
  },
  define: {
    'process.env': process.env,
    global: 'globalThis',
  }
});