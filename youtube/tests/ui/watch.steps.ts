import { createBdd } from "playwright-bdd";
import { test } from "../../src/fixtures/test.fixtures";

const { Given, Then } = createBdd(test);

Given(
  "I open the watch page for video {string}",
  async ({ watchPage }, videoId: string) => {
    await watchPage.goto(videoId);
  },
);

Then("I should see the video title", async ({ watchPage }) => {
  await watchPage.assertTitleVisible();
});

Then("I should see the player controls", async ({ watchPage }) => {
  await watchPage.assertPlayerVisible();
});

Then("I should see the Subscribe button", async ({ watchPage }) => {
  await watchPage.assertSubscribeVisible();
});

Then("I should see the Like and Share buttons", async ({ watchPage }) => {
  await watchPage.assertLikeShareVisible();
});
