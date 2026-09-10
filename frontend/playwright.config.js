import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = dirname(fileURLToPath(import.meta.url));
const siblingBackend = resolve(frontendRoot, '../backend');
const backendRoot =
  process.env.GY_BACKEND_ROOT ||
  (existsSync(siblingBackend)
    ? siblingBackend
    : resolve(frontendRoot, '../../../GYProject/backend'));
const testPython = process.env.GY_TEST_PYTHON || 'python';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5179',
    browserName: 'chromium',
    channel: 'msedge',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: `"${testPython}" "${resolve(backendRoot, '../scripts/test_server.py')}"`,
      url: 'http://127.0.0.1:8011/health/',
      timeout: 60000,
      reuseExistingServer: false,
      env: {
        DJANGO_SECRET_KEY: 'browser-test-only-secret-key-not-for-production-1234567890',
        DJANGO_DEBUG: 'true',
        DATABASE_URL: 'sqlite:///:memory:',
        RENDER: '',
        RENDER_EXTERNAL_HOSTNAME: '',
        CORS_ALLOWED_ORIGINS: 'http://127.0.0.1:5179',
        PYTHONDONTWRITEBYTECODE: '1',
      },
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5179 --strictPort',
      url: 'http://127.0.0.1:5179',
      timeout: 60000,
      reuseExistingServer: false,
      env: { VITE_API_URL: 'http://127.0.0.1:8011/api' },
    },
  ],
});
