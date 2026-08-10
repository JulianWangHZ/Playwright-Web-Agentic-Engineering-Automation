export class PageLoadError extends Error {
  constructor(url: string, timeoutMs: number) {
    super(`Page "${url}" did not finish loading within ${timeoutMs}ms`);
    this.name = "PageLoadError";
  }
}

export class ElementNotFoundError extends Error {
  constructor(descriptor: string, timeoutMs?: number) {
    const suffix = timeoutMs !== undefined ? ` (waited ${timeoutMs}ms)` : "";
    super(`Element not found: "${descriptor}"${suffix}`);
    this.name = "ElementNotFoundError";
  }
}

export class NavigationError extends Error {
  constructor(actualUrl: string, expectedPattern: string | RegExp) {
    super(
      `Navigation failed — actual URL: "${actualUrl}", expected to match: "${expectedPattern}"`,
    );
    this.name = "NavigationError";
  }
}

export class AuthenticationError extends Error {
  constructor(reason?: string) {
    super(
      reason ? `Authentication failed: ${reason}` : "Authentication failed",
    );
    this.name = "AuthenticationError";
  }
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly endpoint?: string,
  ) {
    const where = endpoint ? ` [${endpoint}]` : "";
    super(`API error (HTTP ${statusCode})${where}: ${message}`);
    this.name = "ApiError";
  }
}

export class TestDataError extends Error {
  constructor(field: string) {
    super(
      `Missing test data: "${field}"; check the .env file or environment variables`,
    );
    this.name = "TestDataError";
  }
}
