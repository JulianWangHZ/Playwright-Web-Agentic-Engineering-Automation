import { mergeTests } from "@playwright/test";
import { homeTest } from "./home.fixtures";
import { searchResultsTest } from "./search-results.fixtures";
import { watchTest } from "./watch.fixtures";
import { channelTest } from "./channel.fixtures";

export const test = mergeTests(
  homeTest,
  searchResultsTest,
  watchTest,
  channelTest,
);

export { expect } from "@playwright/test";
