import * as dotenv from "dotenv";
import * as os from "os";

dotenv.config({ quiet: true });

// ENV selects the target environment; defaults to sit
// Usage: ENV=prod npm test
const ENV = (process.env.ENV || "sit") as "dev" | "sit" | "prod";

// YouTube has no multi-env; dev/sit/prod all point to the production site; api points to YouTube Data API (v3).
const BASE_URLS: Record<typeof ENV, { web: string; api: string }> = {
  dev: {
    web: "https://www.youtube.com",
    api: "https://www.googleapis.com/youtube/v3",
  },
  sit: {
    web: "https://www.youtube.com",
    api: "https://www.googleapis.com/youtube/v3",
  },
  prod: {
    web: "https://www.youtube.com",
    api: "https://www.googleapis.com/youtube/v3",
  },
};

const urls = BASE_URLS[ENV] ?? BASE_URLS.sit;

export interface TestConfig {
  env: string;
  baseURL: string;
  apiBaseURL: string;
  headless: boolean;
  viewport: { width: number; height: number };
  timeouts: {
    default: number;
    navigation: number;
    api: number;
  };
  retryCount: number;
  workers: number;
  screenshots: { onFailure: boolean };
  video: { onFailure: boolean };
  trace: { onFailure: boolean };
}

const config: TestConfig = {
  env: ENV,
  baseURL: process.env.BASE_URL || urls.web,
  apiBaseURL: process.env.API_BASE_URL || urls.api,
  headless: process.env.HEADLESS !== "false",
  viewport: {
    width: parseInt(process.env.VIEWPORT_WIDTH || "1440", 10),
    height: parseInt(process.env.VIEWPORT_HEIGHT || "900", 10),
  },
  timeouts: {
    default: parseInt(process.env.DEFAULT_TIMEOUT || "15000", 10),
    navigation: parseInt(process.env.NAVIGATION_TIMEOUT || "30000", 10),
    api: parseInt(process.env.API_TIMEOUT || "10000", 10),
  },
  // 1 retry locally, 2 on CI; balances stability against feedback speed
  retryCount: parseInt(
    process.env.RETRY_COUNT || (process.env.CI ? "2" : "1"),
    10,
  ),
  // Defaults to half the CPU count; override on CI via PARALLEL_WORKERS
  workers: parseInt(
    process.env.PARALLEL_WORKERS ||
      String(Math.max(4, Math.floor(os.cpus().length / 2))),
    10,
  ),
  screenshots: {
    onFailure: process.env.SCREENSHOT_ON_FAILURE !== "false",
  },
  video: {
    // Off by default; set VIDEO_ON_FAILURE=true to record (kept on failure only)
    onFailure: process.env.VIDEO_ON_FAILURE === "true",
  },
  trace: {
    onFailure: process.env.TRACE_ON_FAILURE !== "false",
  },
};

export default config;
