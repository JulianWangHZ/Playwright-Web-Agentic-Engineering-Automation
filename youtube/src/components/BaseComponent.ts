import { type Page, type Locator, expect } from "@playwright/test";
import { createLogger, type Logger } from "../utils/logger";
import { waitForElement } from "../utils/element-wait.utils";

// A Component depends only on Page — not on other Page Objects, and is not coupled to testInfo
export abstract class BaseComponent {
  protected readonly log: Logger;

  constructor(protected readonly page: Page) {
    this.log = createLogger(this.constructor.name);
  }

  protected async waitForElement(
    locator: Locator,
    timeout?: number,
  ): Promise<void> {
    await waitForElement(locator, timeout);
  }

  protected async click(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.click();
  }

  protected async fill(locator: Locator, text: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.fill(text);
  }

  protected async verifyElementVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  protected async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }
}
