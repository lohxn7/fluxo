import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  webServer: {
    command: 'npm run dev -- --port 5183',
    url: 'http://localhost:5183',
    reuseExistingServer: true,
    timeout: 60000,
  },
  use: {
    baseURL: 'http://localhost:5183',
  },
})
