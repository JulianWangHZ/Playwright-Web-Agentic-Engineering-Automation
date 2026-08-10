import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../src/fixtures/test.fixtures";

const { Given, When, Then } = createBdd(test);

Given("I open the YouTube home page", async ({ homePage }) => {
  await homePage.goto();
});

Given("I open the YouTube home page as a guest", async ({ homePage }) => {
  await homePage.gotoAsGuest();
});

When("I search for {string}", async ({ homePage }, query: string) => {
  await homePage.search(query);
});

When("I click the left Shorts entry", async ({ homePage }) => {
  await homePage.gotoShorts();
});

When("I click the YouTube logo", async ({ homePage }) => {
  await homePage.clickHomeLogo();
});

Then("I should see the YouTube header", async ({ homePage }) => {
  await homePage.assertHeaderVisible();
});

Then("I should see the left navigation", async ({ homePage }) => {
  await homePage.assertSidebarVisible();
});

Then("I should see the logged-out home guide", async ({ homePage }) => {
  await homePage.assertEmptyFeedGuideVisible();
});

Then("I should see the Sign in entry", async ({ homePage }) => {
  await homePage.assertSignInEntryVisible();
});

Then("I should be taken to the search results page", async ({ page }) => {
  await expect(page).toHaveURL(/\/results\?/);
});
