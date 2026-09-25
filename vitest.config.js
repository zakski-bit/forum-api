import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    fileParallelism: false,
    setupFiles: ['dotenv/config'],
    coverage: {
      provider: 'v8',
      exclude: [
        'src/Commons/config.js',
        'src/Infrastructures/database/postgres/pool.js',
        'src/app.js',
        '**/*.test.js',
        'tests/**',
      ],
    },
  },
});