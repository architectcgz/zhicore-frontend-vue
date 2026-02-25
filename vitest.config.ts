import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    // 属性测试配置：最小 100 次迭代
    // Property-based testing configuration: minimum 100 iterations
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'test/**/*.test.ts',
      'src/test/properties/**/*.property.test.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      // 覆盖率目标：80%+ 关键业务逻辑
      // Coverage target: 80%+ for critical business logic
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      exclude: [
        'node_modules/',
        'test/**',
        'src/test/**',
        'src/**/*.d.ts',
        'src/main.ts',
        'src/vite-env.d.ts',
        'src/router/index.ts',
        'src/types/**',
        'src/assets/**',
        'src/**/*.vue', // Vue 组件单独测试
      ],
      include: [
        'src/composables/**/*.ts',
        'src/stores/**/*.ts',
        'src/utils/**/*.ts',
        'src/api/**/*.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
