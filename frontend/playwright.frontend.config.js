import { defineConfig } from '@playwright/test';

// Isolated UI/contract checks. Existing backend integration tests stay separate.
export default defineConfig({
  testDir: './tests/ui',
  outputDir: './test-results/frontend',
  timeout: 60000,
  expect: { timeout: 10000 },
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5181',
    browserName: 'chromium',
    channel: 'msedge',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5181 --strictPort',
    url: 'http://127.0.0.1:5181',
    timeout: 60000,
    reuseExistingServer: false,
    env: { VITE_API_URL: 'http://127.0.0.1:8011/api' },
  },
});
