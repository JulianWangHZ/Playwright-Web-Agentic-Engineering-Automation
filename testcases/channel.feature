# Note: target site https://www.youtube.com; uses a fixed test channel handle
Feature: YouTube Channel Page
  As a visitor
  I want to browse a channel page
  So that I can learn about the channel and browse its content

  # ############################################
  # Channel Info
  # ############################################
  @channel @smoke @regression @auto @channel-info
  Scenario: Channel page shows the channel info
    Given I open the channel "@freecodecamp"
    Then I should see the channel name
    And I should see the subscriber count
    And I should see the channel Subscribe button

  # ############################################
  # Content Tabs
  # ############################################
  @channel @regression @auto @content-tabs
  Scenario: Channel page shows the content tabs
    Given I open the channel "@freecodecamp"
    Then I should see the "Videos" tab
    And I should see the "Playlists" tab
