import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Global timeout for each test - longer on CI */
  timeout: process.env.CI ? 60 * 1000 : 30 * 1000,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never' // Never try to open HTML files - fully non-interactive
    }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Longer action timeout on CI */
    actionTimeout: process.env.CI ? 30 * 1000 : 10 * 1000,
    
    /* Longer navigation timeout on CI */
    navigationTimeout: process.env.CI ? 30 * 1000 : 10 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests - only when not on CI */
  ...(process.env.CI ? {} : {
    webServer: {
      command: 'docker compose up --build -d',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120 * 1000, // 2 minutes
    },
  }),
})
