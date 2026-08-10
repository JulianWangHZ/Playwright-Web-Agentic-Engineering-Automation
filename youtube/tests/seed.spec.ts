import { test } from "@playwright/test";

// MCP exploration seed page: playwright-test MCP's planner_setup_page / generator_setup_page
// runs this seed so the planner / generator agent gets a page positioned on the YouTube home page,
// then starts walking scenarios step by step to extract real locators. YouTube tests run guest/logged-out, with no storageState.
test.describe("MCP explore seed", () => {
  test("seed", async ({ page }) => {
    await page.goto("/");
  });
});
