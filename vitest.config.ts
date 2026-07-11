import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'lib/__tests__/**/*.test.ts'],
    exclude: ['**/node_modules/**', 'lib/__tests__/mocks/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'react-native': path.resolve(
        __dirname,
        'lib/__tests__/mocks/react-native.ts'
      ),
    },
  },
});
