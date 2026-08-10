import { type Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  // ─────────────────────────────────────────────
  // Selectors
  // ─────────────────────────────────────────────

  private readonly guideButton = () =>
    this.page.getByRole("button", { name: "Guide" });
  private readonly homeLogoLink = () =>
    this.page.getByRole("link", { name: "YouTube Home" });
  private readonly searchBox = () =>
    this.page.getByRole("combobox", { name: "Search" });
  private readonly searchButton = () =>
    this.page.getByRole("button", { name: "Search", exact: true });
  private readonly signInLink = () =>
    this.page.getByRole("link", { name: "Sign in" });

  private readonly sidebar = {
    home: () => this.page.getByRole("link", { name: "Home", exact: true }),
    shorts: () => this.page.getByRole("link", { name: "Shorts" }),
    subscriptions: () => this.page.getByRole("link", { name: "Subscriptions" }),
  };

  private readonly emptyFeedHeading = () =>
    this.page.getByRole("heading", { name: "Try searching to get started" });

  constructor(page: Page) {
    super(page);
  }

  // ─────────────────────────────────────────────
  // Navigation methods
  // ─────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto("/");
    await expect(this.searchBox()).toBeVisible();
  }

  async gotoAsGuest(): Promise<void> {
    await this.page.context().clearCookies();
    await this.page.goto("/");
    await expect(this.searchBox()).toBeVisible();
  }

  // ─────────────────────────────────────────────
  // Assertion methods
  // ─────────────────────────────────────────────

  async assertHeaderVisible(): Promise<void> {
    await expect(this.homeLogoLink()).toBeVisible();
    await expect(this.searchBox()).toBeVisible();
    await expect(this.searchButton()).toBeVisible();
  }

  async assertSidebarVisible(): Promise<void> {
    await expect(this.sidebar.home()).toBeVisible();
    await expect(this.sidebar.shorts()).toBeVisible();
    await expect(this.sidebar.subscriptions()).toBeVisible();
  }

  async assertEmptyFeedGuideVisible(): Promise<void> {
    await expect(this.emptyFeedHeading()).toBeVisible();
  }

  async assertSignInEntryVisible(): Promise<void> {
    await expect(this.signInLink()).toBeVisible();
  }

  // ─────────────────────────────────────────────
  // Action methods
  // ─────────────────────────────────────────────

  async search(query: string): Promise<void> {
    await this.searchBox().click();
    await this.searchBox().fill(query);
    await this.searchButton().click();
    await this.page.waitForURL(/\/results\?/);
  }

  async clickHomeLogo(): Promise<void> {
    await this.homeLogoLink().click();
  }

  async toggleGuide(): Promise<void> {
    await this.guideButton().click();
  }

  async gotoShorts(): Promise<void> {
    await this.sidebar.shorts().click();
    await this.page.waitForURL(/\/shorts/);
  }
}
