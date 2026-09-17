const config = {
  testDir: './tests',
  // Each spec drives a full create/install/build cycle, so the default 30s is far too low.
  timeout: 10 * 60 * 1000,
  expect: { timeout: 30 * 1000 },
  // The specs share one generated app via describe.serial, so they must not run in parallel.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    headless: true,
    trace: 'retain-on-failure',
  },
};
export default config;
