import './test/setup.mjs';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [
      ['**/*.test.tsx', 'jsdom'],
    ],
    include: ['test/unit/**/*.test.{ts,tsx}', 'test/integration/**/*.test.{ts,tsx}'],
    setupFiles: ['./test/setup.mjs'],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
