# Note: target site https://www.youtube.com
Feature: YouTube Search Filters
  As a visitor
  I want to filter the search results
  So that I can find matching videos faster

  # ############################################
  # Filter Panel
  # ############################################
  @search-results @regression @auto @filter-panel
  Scenario: Open the filter panel and see the sections
    Given I am on the search results page for "playwright"
    When I open the search filters
    Then I should see the filter section "Type"
    And I should see the filter section "Duration"
    And I should see the filter section "Upload date"

  # ############################################
  # Apply Filter
  # ############################################
  @search-results @regression @auto @apply-video-type
  Scenario: Applying the video type filter still returns results
    Given I am on the search results page for "playwright"
    When I open the search filters
    And I apply the filter "Videos"
    Then I should see video search results
