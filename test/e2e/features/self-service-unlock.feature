# https://oktainc.atlassian.net/browse/OKTA-537529
@skip(okta:monolith=true)
Feature: Self Service Unlock

  Background:
    Given an App configured to use interaction code flow
    And a User named "testuser" exists in the org

  Scenario: User unlocks account using magic link
    Given user opens the login page
    When user logs in with username and wrong password 5 times
    Then user is locked out
    When user clicks unlock account
    And user submits their email to unlock
    Then user is challenged for email code
    And user clicks send email
    And user clicks the unlock account magic link
    Then user account is unlocked
    And user enters passowrd to unlock
    Then user sees the tokens on the page