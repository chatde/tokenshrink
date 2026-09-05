import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: { setupFiles: ['./tests/setup.js'] },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
