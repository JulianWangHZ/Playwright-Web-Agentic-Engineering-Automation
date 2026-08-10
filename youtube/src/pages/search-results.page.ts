import { type Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class SearchResultsPage extends BasePage {
  // ─────────────────────────────────────────────
  // Selectors
  // ─────────────────────────────────────────────

  private readonly videoLinks = () => this.page.locator('a[href*="/watch?v="]');
  private readonly searchBox = () =>
    this.page.getByRole("combobox", { name: "Search" });
  private readonly searchFiltersButton = () =>
    this.page.getByRole("button", { name: "Search filters" });
  private readonly filterDialog = () => this.page.getByRole("dialog");
  private readonly filterSection = (name: string) =>
    this.filterDialog().getByRole("heading", { level: 4, name });
  private readonly filterOption = (name: string) =>
    this.filterDialog().getByRole("link", { name, exact: true });

  constructor(page: Page) {
    super(page);
  }

  // ─────────────────────────────────────────────
  // Navigation methods
  // ─────────────────────────────────────────────

  async goto(query: string): Promise<void> {
    await this.page.goto(`/results?search_query=${encodeURIComponent(query)}`);
    await expect(this.videoLinks().first()).toBeVisible();
  }

  // ─────────────────────────────────────────────
  // Assertion methods
  // ─────────────────────────────────────────────

  async assertHasResults(): Promise<void> {
    await expect(this.videoLinks().first()).toBeVisible();
    expect(await this.videoLinks().count()).toBeGreaterThan(0);
  }

  async assertSearchBoxContains(query: string): Promise<void> {
    await expect(this.searchBox()).toHaveValue(query);
  }

  async assertFilterSectionVisible(name: string): Promise<void> {
    await expect(this.filterSection(name)).toBeVisible();
  }

  // ─────────────────────────────────────────────
  // Action methods
  // ─────────────────────────────────────────────

  async openFilters(): Promise<void> {
    await this.searchFiltersButton().click();
    await expect(this.filterDialog()).toBeVisible();
  }

  async applyFilter(name: string): Promise<void> {
    await this.filterOption(name).click();
    await this.page.waitForURL(/[?&]sp=/);
  }

  async clickFirstResult(): Promise<void> {
    await this.videoLinks().first().click();
    await this.page.waitForURL(/\/watch\?v=/);
  }

  async resultCount(): Promise<number> {
    return this.videoLinks().count();
  }
}
