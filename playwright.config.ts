import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'docs/playwright_perf_report.json' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off',
    launchOptions: {
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu-vsync', '--enable-gpu-rasterization']
    }
  },
  webServer: {
    command: 'npx vite preview --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 15000
  },
  projects: [
    {
      name: 'chromium-audit',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
