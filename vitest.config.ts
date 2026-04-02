import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    exclude: ['**/node_modules/**', '**/.git/**', '.worktrees/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/.next/**',
        '**/generated/**',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/vitest.config.ts',
        '**/prisma/**',
        '**/scripts/**',
      ],
      include: ['src/**/*.{ts,tsx}'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
