Feature: Interaction Code Flow

  Background:
    Given an App configured to use interaction code flow
    And a User named "testuser" exists in the org

    Scenario: User logs in with username and password
      Given user opens the login page
      When user logs in with username and password
      Then user sees the tokens on the page

    Scenario: User logs in using 3rd party IdP
      Given user opens the login page using renderEl
      When user logs in using 3rd party IdP
      Then user sees the tokens on the page from 3rd party IdP
      
