import { type APIRequestContext } from "@playwright/test";
import config from "../../../config/test.config";
import { ApiError } from "../../errors/test-errors";
import { createLogger } from "../../utils/logger";

export abstract class ApiClient {
  protected readonly log = createLogger(this.constructor.name);

  constructor(protected readonly request: APIRequestContext) {}

  protected async get<T>(path: string): Promise<T> {
    const url = `${config.apiBaseURL}${path}`;
    this.log.debug(`GET ${url}`);

    const response = await this.request.get(url, {
      timeout: config.timeouts.api,
    });

    if (!response.ok()) {
      throw new ApiError(response.status(), await response.text(), url);
    }

    return response.json() as Promise<T>;
  }

  protected async post<T>(path: string, body: unknown): Promise<T> {
    const url = `${config.apiBaseURL}${path}`;
    this.log.debug(`POST ${url}`, body);

    const response = await this.request.post(url, {
      data: body,
      headers: { "Content-Type": "application/json" },
      timeout: config.timeouts.api,
    });

    if (!response.ok()) {
      throw new ApiError(response.status(), await response.text(), url);
    }

    return response.json() as Promise<T>;
  }

  protected async postVoid(path: string, body: unknown): Promise<void> {
    const url = `${config.apiBaseURL}${path}`;
    this.log.debug(`POST ${url}`, body);

    const response = await this.request.post(url, {
      data: body,
      headers: { "Content-Type": "application/json" },
      timeout: config.timeouts.api,
    });

    if (!response.ok()) {
      throw new ApiError(response.status(), await response.text(), url);
    }
  }

  protected async patch<T>(path: string, body: unknown): Promise<T> {
    const url = `${config.apiBaseURL}${path}`;
    this.log.debug(`PATCH ${url}`, body);

    const response = await this.request.patch(url, {
      data: body,
      headers: { "Content-Type": "application/json" },
      timeout: config.timeouts.api,
    });

    if (!response.ok()) {
      throw new ApiError(response.status(), await response.text(), url);
    }

    return response.json() as Promise<T>;
  }

  protected async put<T>(path: string, body: unknown): Promise<T> {
    const url = `${config.apiBaseURL}${path}`;
    this.log.debug(`PUT ${url}`, body);

    const response = await this.request.put(url, {
      data: body,
      headers: { "Content-Type": "application/json" },
      timeout: config.timeouts.api,
    });

    if (!response.ok()) {
      throw new ApiError(response.status(), await response.text(), url);
    }

    return response.json() as Promise<T>;
  }

  protected async putVoid(path: string, body: unknown): Promise<void> {
    const url = `${config.apiBaseURL}${path}`;
    this.log.debug(`PUT ${url}`, body);

    const response = await this.request.put(url, {
      data: body,
      headers: { "Content-Type": "application/json" },
      timeout: config.timeouts.api,
    });

    if (!response.ok()) {
      throw new ApiError(response.status(), await response.text(), url);
    }
  }

  protected async delete(path: string): Promise<void> {
    const url = `${config.apiBaseURL}${path}`;
    this.log.debug(`DELETE ${url}`);

    const response = await this.request.delete(url, {
      timeout: config.timeouts.api,
    });

    if (!response.ok()) {
      throw new ApiError(response.status(), await response.text(), url);
    }
  }
}
