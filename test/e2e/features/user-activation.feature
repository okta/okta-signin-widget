Feature: User Activation

  Background:
    Given an App configured to use interaction code flow
    And a User named "testuser" is activated in the org

    Scenario: User logs in using activation email
      Given user clicks the email magic link
      Then user is challenged for password
      When user enters the password
      Then user is logged into okta dashboard

    # Will pass after fixing https://oktainc.atlassian.net/browse/OKTA-541966
    Scenario: User click back to sign in
      Given user clicks the email magic link
      Then user is challenged for password
      When user clicks back to sign in
      Then user sees primary signin form and not forgot password form