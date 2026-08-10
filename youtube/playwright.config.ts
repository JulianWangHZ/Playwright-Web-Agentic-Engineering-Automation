import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import config from "./config/test.config";

// BDD feature files → generate glue specs into .features-gen/ (gitignored)
// testcases/ is the single source of truth; automation only reads this layer.
const bddTestDir = defineBddConfig({
  features: ["../testcases/**/*.feature"],
  featuresRoot: "../testcases",
  outputDir: "tests/.features-gen",
  steps: ["tests/ui/*.steps.ts", "src/fixtures/test.fixtures.ts"],
  tags: process.env.TAG ? `@${process.env.TAG}` : "@auto",
  missingSteps: "skip-scenario",
  aiFix: { promptAttachment: true },
});

const SUPPORTED_BROWSERS = ["chromium", "webkit", "firefox"] as const;
const BROWSER = (process.env.BROWSER ||
  "chromium") as (typeof SUPPORTED_BROWSERS)[number];

if (!SUPPORTED_BROWSERS.includes(BROWSER)) {
  throw new Error(
    `Unsupported BROWSER="${process.env.BROWSER}"; allowed values: ${SUPPORTED_BROWSERS.join(" / ")}`,
  );
}

const DESKTOP_PRESET: Record<(typeof SUPPORTED_BROWSERS)[number], string> = {
  chromium: "Desktop Chrome",
  webkit: "Desktop Safari",
  firefox: "Desktop Firefox",
};
const deviceName = process.env.DEVICE || DESKTOP_PRESET[BROWSER];
const devicePreset = devices[deviceName];

if (!devicePreset) {
  throw new Error(
    `Unsupported DEVICE="${deviceName}"; use a Playwright devices key (e.g. "iPhone 14" / "Pixel 7" / "iPad (gen 7)")`,
  );
}

// channel only applies to chromium (BROWSER_CHANNEL=chrome fallback)
const channel =
  BROWSER === "chromium" ? process.env.BROWSER_CHANNEL || undefined : undefined;

const engineUse = {
  browserName: BROWSER,
  headless: config.headless,
  channel,
};

// Engine follows BROWSER (ignore the preset defaultBrowserType so size and engine combine freely).
// firefox does not support isMobile emulation (Playwright throws), so it is stripped.
// YouTube tests need no login, so storageState is not attached.
const deviceUse = (device: (typeof devices)[string]) => {
  const { isMobile: _isMobile, ...firefoxSafeDevice } = device;

  return {
    ...(BROWSER === "firefox" ? firefoxSafeDevice : device),
    ...engineUse,
  };
};

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: config.retryCount,
  workers: config.workers,
  timeout: parseInt(process.env.TEST_TIMEOUT || "30000", 10),

  // playwright-smart-reporter (history / trends / failure clustering); CI also keeps junit/json
  reporter: process.env.CI
    ? [
        [
          "playwright-smart-reporter",
          {
            outputFile: "smart-report.html",
            historyFile: "test-history.json",
            maxHistoryRuns: 10,
            branding: { title: "Playwright Web E2E Reporter" },
          },
        ],
        ["junit", { outputFile: "test-results/junit.xml" }],
        ["json", { outputFile: "test-results/results.json" }],
        ["list"],
      ]
    : [
        [
          "playwright-smart-reporter",
          {
            outputFile: "smart-report.html",
            historyFile: "test-history.json",
            maxHistoryRuns: 10,
            branding: { title: "Playwright Web E2E Reporter" },
          },
        ],
        ["list"],
      ],

  use: {
    baseURL: config.baseURL,
    testIdAttribute: "data-test-id",
    trace: config.trace.onFailure ? "retain-on-failure" : "off",
    screenshot: config.screenshots.onFailure ? "only-on-failure" : "off",
    video: config.video.onFailure
      ? { mode: "retain-on-failure", size: config.viewport }
      : "off",
    actionTimeout: config.timeouts.default,
    navigationTimeout: config.timeouts.navigation,
    viewport: config.viewport,
    ignoreHTTPSErrors: true,
  },

  projects: [
    // BDD UI tests: read @auto scenarios from testcases/ and run against youtube.com in guest state
    {
      name: "ui",
      testDir: bddTestDir,
      grepInvert: process.env.CI ? /@quarantine/ : undefined,
      use: deviceUse(devicePreset),
    },
  ],
});
