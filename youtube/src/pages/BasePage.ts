import { type Page, type Locator, expect } from "@playwright/test";
import config from "../../config/test.config";
import { createLogger } from "../utils/logger";
import { NavigationError, PageLoadError } from "../errors/test-errors";
import { waitForElement } from "../utils/element-wait.utils";

export class BasePage {
  protected readonly log = createLogger(this.constructor.name);
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string): Promise<void> {
    try {
      await this.page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: config.timeouts.navigation,
      });
    } catch {
      try {
        await this.page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: config.timeouts.navigation,
        });
      } catch {
        throw new PageLoadError(url, config.timeouts.navigation);
      }
    }
  }

  async waitForElement(locator: Locator, timeout?: number): Promise<void> {
    await waitForElement(locator, timeout);
  }

  async click(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.click();
  }

  async fill(locator: Locator, text: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.fill(text);
  }

  async getText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return (await locator.textContent()) || "";
  }

  async isVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
    await this.page
      .waitForLoadState("networkidle", { timeout: 10000 })
      .catch(() => {
        this.log.warn("networkidle wait timed out; continuing");
      });
  }

  async takeScreenshot(): Promise<Buffer> {
    return await this.page.screenshot({ fullPage: true });
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async verifyTextContains(
    locator: Locator,
    expectedText: string,
  ): Promise<void> {
    await expect(locator).toContainText(expectedText);
  }

  async verifyElementVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async assertNavigatesTo(
    locator: Locator,
    expectedPattern: string | RegExp,
  ): Promise<void> {
    await this.click(locator);
    await this.page.waitForLoadState("domcontentloaded");
    const actual = this.page.url();
    const matches =
      typeof expectedPattern === "string"
        ? actual.includes(expectedPattern)
        : expectedPattern.test(actual);
    if (!matches) {
      throw new NavigationError(actual, expectedPattern);
    }
  }
}
