import { type Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ChannelPage extends BasePage {
  // ─────────────────────────────────────────────
  // Selectors
  // ─────────────────────────────────────────────

  private readonly channelName = () =>
    this.page.getByRole("heading", { level: 1 });
  private readonly subscriberCount = () =>
    this.page.getByText(/subscribers/).first();
  private readonly subscribeButton = () =>
    this.page.getByRole("button", { name: "Subscribe", exact: true }).first();
  private readonly tab = (name: string) =>
    this.page.getByRole("tab", { name });

  constructor(page: Page) {
    super(page);
  }

  // ─────────────────────────────────────────────
  // Navigation methods
  // ─────────────────────────────────────────────

  async goto(handle: string): Promise<void> {
    await this.page.goto(`/${handle}`);
    await expect(this.channelName()).toBeVisible();
  }

  // ─────────────────────────────────────────────
  // Assertion methods
  // ─────────────────────────────────────────────

  async assertChannelNameVisible(): Promise<void> {
    await expect(this.channelName()).toBeVisible();
  }

  async assertSubscriberCountVisible(): Promise<void> {
    await expect(this.subscriberCount()).toBeVisible();
  }

  async assertSubscribeVisible(): Promise<void> {
    await expect(this.subscribeButton()).toBeVisible();
  }

  async assertTabVisible(name: string): Promise<void> {
    await expect(this.tab(name)).toBeVisible();
  }

  // ─────────────────────────────────────────────
  // Action methods
  // ─────────────────────────────────────────────

  async clickTab(name: string): Promise<void> {
    await this.tab(name).click();
  }
}
