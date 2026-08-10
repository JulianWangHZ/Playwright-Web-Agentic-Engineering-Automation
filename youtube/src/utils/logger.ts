// LOG_LEVEL controls output volume: debug | info | warn | error
// LOG_FORMAT=json (or CI=true) switches to structured JSON (NDJSON) for monitoring tools
// Local default: human-readable + ANSI colors

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const ANSI: Record<LogLevel | "reset" | "dim", string> = {
  debug: "\x1b[36m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  reset: "\x1b[0m",
  dim: "\x1b[2m",
};

const IS_JSON = !!process.env.CI || process.env.LOG_FORMAT === "json";

function resolveMinLevel(): LogLevel {
  const env = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel;
  return env in LEVEL_PRIORITY ? env : "info";
}

export class Logger {
  private readonly minLevel: LogLevel;

  constructor(private readonly context: string) {
    this.minLevel = resolveMinLevel();
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.minLevel];
  }

  // ── JSON mode ──────────────────────────────────────────────────────────────

  private emitJson(
    level: LogLevel,
    message: string,
    extra?: Record<string, unknown>,
  ): void {
    const entry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...extra,
    };
    const out = JSON.stringify(entry);
    if (level === "error") {
      console.error(out);
    } else {
      console.log(out);
    }
  }

  // ── Human-readable mode ───────────────────────────────────────────────────

  private buildPrefix(level: LogLevel): string {
    const ts = new Date().toISOString();
    const color = ANSI[level];
    const r = ANSI.reset;
    const dim = ANSI.dim;
    return `${dim}${ts}${r} ${color}[${level.toUpperCase().padEnd(5)}]${r} ${dim}[${this.context}]${r}`;
  }

  private serialize(data: unknown): string {
    if (data === undefined) return "";
    try {
      return " " + JSON.stringify(data, null, 0);
    } catch {
      return " " + String(data);
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  debug(message: string, data?: unknown): void {
    if (!this.shouldLog("debug")) return;
    if (IS_JSON) {
      this.emitJson(
        "debug",
        message,
        data !== undefined ? { data } : undefined,
      );
    } else {
      console.debug(
        `${this.buildPrefix("debug")} ${message}${this.serialize(data)}`,
      );
    }
  }

  info(message: string, data?: unknown): void {
    if (!this.shouldLog("info")) return;
    if (IS_JSON) {
      this.emitJson("info", message, data !== undefined ? { data } : undefined);
    } else {
      console.info(
        `${this.buildPrefix("info")} ${message}${this.serialize(data)}`,
      );
    }
  }

  warn(message: string, data?: unknown): void {
    if (!this.shouldLog("warn")) return;
    if (IS_JSON) {
      this.emitJson("warn", message, data !== undefined ? { data } : undefined);
    } else {
      console.warn(
        `${this.buildPrefix("warn")} ${message}${this.serialize(data)}`,
      );
    }
  }

  error(message: string, err?: unknown): void {
    if (!this.shouldLog("error")) return;
    if (IS_JSON) {
      const errorField =
        err instanceof Error
          ? { name: err.name, message: err.message, stack: err.stack }
          : err !== undefined
            ? { raw: String(err) }
            : undefined;
      this.emitJson(
        "error",
        message,
        errorField ? { error: errorField } : undefined,
      );
    } else {
      const detail =
        err instanceof Error
          ? `\n  ${ANSI.error}${err.name}: ${err.message}${ANSI.reset}${err.stack ? `\n${err.stack}` : ""}`
          : err !== undefined
            ? `\n  ${String(err)}`
            : "";
      console.error(`${this.buildPrefix("error")} ${message}${detail}`);
    }
  }

  step(message: string): void {
    this.info(`→ ${message}`);
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
