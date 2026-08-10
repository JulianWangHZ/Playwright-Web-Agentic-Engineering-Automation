import { test as base } from "playwright-bdd";
import type { Page } from "@playwright/test";
import { SearchResultsPage } from "../pages/search-results.page";

type SearchResultsFixtures = {
  searchResultsPage: SearchResultsPage;
};

export const searchResultsTest = base.extend<SearchResultsFixtures>({
  searchResultsPage: async ({ page }: { page: Page }, use) => {
    await use(new SearchResultsPage(page));
  },
});
