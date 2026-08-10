import { createBdd } from "playwright-bdd";
import { test } from "../../src/fixtures/test.fixtures";

const { Given, When, Then } = createBdd(test);

Given(
  "I am on the search results page for {string}",
  async ({ searchResultsPage }, query: string) => {
    await searchResultsPage.goto(query);
  },
);

When("I open the search filters", async ({ searchResultsPage }) => {
  await searchResultsPage.openFilters();
});

When(
  "I apply the filter {string}",
  async ({ searchResultsPage }, name: string) => {
    await searchResultsPage.applyFilter(name);
  },
);

Then("I should see video search results", async ({ searchResultsPage }) => {
  await searchResultsPage.assertHasResults();
});

Then(
  "I should see the filter section {string}",
  async ({ searchResultsPage }, name: string) => {
    await searchResultsPage.assertFilterSectionVisible(name);
  },
);
