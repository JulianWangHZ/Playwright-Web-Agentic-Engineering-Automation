import { test as base } from "playwright-bdd";
import type { Page } from "@playwright/test";
import { HomePage } from "../pages/home.page";

type HomeFixtures = {
  homePage: HomePage;
};

export const homeTest = base.extend<HomeFixtures>({
  homePage: async ({ page }: { page: Page }, use) => {
    await use(new HomePage(page));
  },
});
