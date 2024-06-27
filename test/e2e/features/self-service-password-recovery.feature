Feature: Self Service Recovery

  Background:
    Given an App configured to use interaction code flow
    And a User named "testuser" exists in the org
    And a User named "testuser2" exists in the org and added to "No Reset Password Group" group

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

    Scenario: User is not allowed to reset password but can reset password for another email
      Given user opens the login page
      When user is "testuser2"
      And user navigates to forgot password form
      And user submits their email code
      Then user sees an error message "Reset password is not allowed at this time. Please contact support for assistance."
      When user is "testuser"
      When user submits their email
      Then user is challenged for email
      And user clicks send email
      And user clicks the password reset magic link
      Then user sees the password reset page
      When user fills in new password
      And user submits the form
      Then user sees the tokens on the page
