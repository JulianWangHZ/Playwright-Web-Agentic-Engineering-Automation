import { test as base } from "playwright-bdd";
import type { Page } from "@playwright/test";
import { WatchPage } from "../pages/watch.page";

type WatchFixtures = {
  watchPage: WatchPage;
};

export const watchTest = base.extend<WatchFixtures>({
  watchPage: async ({ page }: { page: Page }, use) => {
    await use(new WatchPage(page));
  },
});
