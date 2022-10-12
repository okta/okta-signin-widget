Feature: Classic auth + OIDC Flow
  Background:
    Given an App configured to use authorization code flow
    And a group "OIDC App Users" is assigned to this app

    Scenario: User gets an error message when they are not assigned to the application
      Given a User named "testuser" exists in the org and added to "No Assignments Group" group
      And user opens the login page using "showSignInToGetTokens"
      When user logs in with username and password
      Then user sees an error message "User is not assigned to the client application."
