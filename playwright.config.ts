import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT || '3000';
const SERVE_BUILD = process.env.CI_SERVE_BUILD === 'true';
const HOMEPAGE_PATH = '/cc_jammming_music';
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ||
  (SERVE_BUILD
    ? `http://localhost:${PORT}${HOMEPAGE_PATH}`
    : `http://localhost:${PORT}`);

const devWebServer = {
  command: 'npm start',
  url: baseURL,
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
  env: {
    BROWSER: 'none',
    PORT,
    REACT_APP_SPOTIFY_CLIENT_ID:
      process.env.REACT_APP_SPOTIFY_CLIENT_ID || 'test-client-id',
    REACT_APP_REDIRECT_URI: process.env.REACT_APP_REDIRECT_URI || baseURL,
  },
};

const ciServeWebServer = {
  command: `node scripts/prepare-playwright-serve.mjs && npx serve .playwright-serve -l ${PORT}`,
  url: baseURL,
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ui',
      testMatch: /ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: SERVE_BUILD ? ciServeWebServer : devWebServer,
});
