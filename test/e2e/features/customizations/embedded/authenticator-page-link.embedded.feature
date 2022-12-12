# OKTA-558295
@skip
Feature: Widget Customizations > Embedded > Authenticator Page Link

  Background:
    Given an App configured to use interaction code flow
    And a User named "testuser" exists in the org and added to "MFA Required" group

    # Default setting (no link)
    Scenario: 
      When user opens the login page
      Then user does not see any custom help links
      When user logs in with username and password
      Then user is challenged for email code
      And user does not see any custom help links

    # Override default
    Scenario: 
      And widget config has a custom factor link
        | text                | href                        |
        | custom link 1       | http://custom1.okta1.com    |
      When user opens the login page
      Then user does not see any custom help links
      And user logs in with username and password
      Then user is challenged for email code
      And user sees a custom help link with text "custom link 1" and href "http://custom1.okta1.com"
