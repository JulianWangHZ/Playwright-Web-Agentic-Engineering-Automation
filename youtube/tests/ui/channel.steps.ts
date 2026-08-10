import { createBdd } from "playwright-bdd";
import { test } from "../../src/fixtures/test.fixtures";

const { Given, Then } = createBdd(test);

Given("I open the channel {string}", async ({ channelPage }, handle: string) => {
  await channelPage.goto(handle);
});

Then("I should see the channel name", async ({ channelPage }) => {
  await channelPage.assertChannelNameVisible();
});

Then("I should see the subscriber count", async ({ channelPage }) => {
  await channelPage.assertSubscriberCountVisible();
});

Then("I should see the channel Subscribe button", async ({ channelPage }) => {
  await channelPage.assertSubscribeVisible();
});

Then("I should see the {string} tab", async ({ channelPage }, name: string) => {
  await channelPage.assertTabVisible(name);
});
