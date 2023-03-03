import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    css: true,
    setupFiles: './src/tests/setup.ts'
  }
});