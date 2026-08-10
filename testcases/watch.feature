# Note: target site https://www.youtube.com; uses a fixed test video ID
Feature: YouTube Watch Page
  As a visitor
  I want to open a video watch page
  So that I can view the video and use its interaction controls

  # ############################################
  # Video Info
  # ############################################
  @watch @smoke @regression @auto @video-info
  Scenario: Watch page shows the title and player
    Given I open the watch page for video "jydYq7oAtD8"
    Then I should see the video title
    And I should see the player controls

  # ############################################
  # Interaction Buttons
  # ############################################
  @watch @regression @auto @interactions
  Scenario: Watch page shows the interaction buttons
    Given I open the watch page for video "jydYq7oAtD8"
    Then I should see the Subscribe button
    And I should see the Like and Share buttons
