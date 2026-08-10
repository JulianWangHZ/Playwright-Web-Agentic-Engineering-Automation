import { test as base } from "playwright-bdd";
import type { Page } from "@playwright/test";
import { ChannelPage } from "../pages/channel.page";

type ChannelFixtures = {
  channelPage: ChannelPage;
};

export const channelTest = base.extend<ChannelFixtures>({
  channelPage: async ({ page }: { page: Page }, use) => {
    await use(new ChannelPage(page));
  },
});
