# OKTA-558295
@skip
Feature: Widget Customizations > Hosted > Authenticator Page Link

  Background:
    Given an Org using a default Okta-hosted sign-in page
    And a User named "testuser" exists in the org and added to "MFA Required" group

    # Default setting (no link)
    Scenario: 
      When user opens the default Okta-hosted sign-in page
      Then does not see any custom help links
      When user logs in with username and password
      Then user is challenged for email code
      And user does not see any custom help links

    # Override default
    Scenario: 
      Given admin has customizations for the "Sign-In Page" in the "Authenticator Page Custom Link" section
        | Custom link text      | custom link 1             |
        | Custom link URL       | http://custom1.okta1.com  |
      When user opens the default Okta-hosted sign-in page
      Then user does not see any custom help links
      And user logs in with username and password
      Then user is challenged for email code
      And user sees a custom help link with text "custom link 1" and href "http://custom1.okta1.com"
