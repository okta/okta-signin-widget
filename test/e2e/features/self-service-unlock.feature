Feature: Self Service Recovery

  Background:
    Given an App configured to use interaction code flow
    And a User named "testuser" exists in the org

  Scenario: User resets password using magic link
    Given user opens the login page
    When user logs in with username and wrong password 10 times
    And user is locked out
    And user clicks unlock account
    And user submits their email
    Then user is challenged for email code
    And user clicks send email
    And user clicks magic link
    Then user sees the tokens on the page