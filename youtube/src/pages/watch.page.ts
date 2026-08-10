import { type Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class WatchPage extends BasePage {
  // ─────────────────────────────────────────────
  // Selectors
  // ─────────────────────────────────────────────

  private readonly videoTitle = () =>
    this.page.getByRole("heading", { level: 1 });
  private readonly playerControl = () =>
    this.page.getByRole("button", { name: /^(Play|Pause)/ });
  private readonly subscribeButton = () =>
    this.page.getByRole("button", { name: "Subscribe", exact: true });
  private readonly likeButton = () =>
    this.page.getByRole("button", { name: /^like this video/ });
  private readonly shareButton = () =>
    this.page.getByRole("button", { name: "Share" });

  constructor(page: Page) {
    super(page);
  }

  // ─────────────────────────────────────────────
  // Navigation methods
  // ─────────────────────────────────────────────

  async goto(videoId: string): Promise<void> {
    await this.page.goto(`/watch?v=${videoId}`);
    await expect(this.videoTitle()).toBeVisible();
  }

  // ─────────────────────────────────────────────
  // Assertion methods
  // ─────────────────────────────────────────────

  async assertTitleVisible(): Promise<void> {
    await expect(this.videoTitle()).toBeVisible();
  }

  async assertPlayerVisible(): Promise<void> {
    await expect(this.playerControl().first()).toBeVisible();
  }

  async assertSubscribeVisible(): Promise<void> {
    await expect(this.subscribeButton()).toBeVisible();
  }

  async assertLikeShareVisible(): Promise<void> {
    await expect(this.likeButton()).toBeVisible();
    await expect(this.shareButton()).toBeVisible();
  }

  // ─────────────────────────────────────────────
  // Query methods
  // ─────────────────────────────────────────────

  async getTitle(): Promise<string> {
    return (await this.videoTitle().textContent())?.trim() ?? "";
  }
}
