import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/cc_jammming_music/',
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/types/**',
        'src/**/*.test.{ts,tsx}',
        'src/index.tsx',
        'src/reportWebVitals.ts',
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 65,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
});
