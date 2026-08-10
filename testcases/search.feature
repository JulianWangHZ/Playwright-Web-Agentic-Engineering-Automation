# Note: target site https://www.youtube.com (public site, no in-house page code path)
Feature: YouTube Video Search
  As a visitor
  I want to search for videos
  So that I can quickly find the content I want to watch

  # ############################################
  # Home Search
  # ############################################
  @search-results @smoke @regression @auto @keyword-search
  Scenario: Search a keyword from home and land on the results page
    Given I open the YouTube home page
    When I search for "playwright"
    Then I should be taken to the search results page
    And I should see video search results

  # ############################################
  # Home Browsing
  # ############################################
  @home @smoke @regression @auto @guest-browsing
  Scenario: Header and navigation are visible on the logged-out home
    Given I open the YouTube home page as a guest
    Then I should see the YouTube header
    And I should see the left navigation
    And I should see the Sign in entry
