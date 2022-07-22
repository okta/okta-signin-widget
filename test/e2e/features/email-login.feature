@ignore
Feature: Email Login

  Background:
    Given an App configured to use interaction code flow
    And a User named "testuser" exists in the org and added to "MFA Required" group

    Scenario: User logs in using email MFA
      Given user opens the login page using "showSignInToGetTokens"
      When user logs in with username and password
      Then user is challenged for email code
      And user clicks send email
      # And user inputs the correct code from email
      And user clicks the email magic link
      Then user sees the tokens on the page
