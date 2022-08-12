Feature: Self Service Recovery

  Background:
    Given an App configured to use interaction code flow
    And a User named "testuser" exists in the org

    Scenario: User resets password using magic link
      Given user opens the login page
      When user navigates to forgot password form
      And user submits their email
      Then user is challenged for email code
      And user clicks send email
      And user clicks the password reset magic link
      Then user sees the password reset page
      When user fills in new password
      And user submits the form
      Then user sees the tokens on the page

