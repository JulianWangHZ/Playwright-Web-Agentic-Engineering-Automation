import { type Locator } from "@playwright/test";
import config from "../../config/test.config";
import { ElementNotFoundError } from "../errors/test-errors";

// Shared by BasePage and BaseComponent to avoid duplication
export async function waitForElement(
  locator: Locator,
  timeout?: number,
): Promise<void> {
  const ms = timeout ?? config.timeouts.default;
  try {
    await locator.waitFor({ state: "visible", timeout: ms });
  } catch {
    // Capture the first 120 chars of outerHTML to help locate the element; fall back to the locator string on failure
    const description = await locator
      .evaluate((el) => el.outerHTML.slice(0, 120))
      .catch(() => locator.toString());
    throw new ElementNotFoundError(description, ms);
  }
}
