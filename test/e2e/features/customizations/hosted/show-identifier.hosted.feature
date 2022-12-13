# OKTA-558295
@skip
Feature: Widget Customizations > Hosted > Show Identifier

  Background:
    Given an Org using a default Okta-hosted sign-in page

    # Default setting (true)
    Scenario: 
      Given a user with expired password
      When user opens the default Okta-hosted sign-in page
      And user logs in with username and password
      Then user sees the "Password Expired" view with their identifier

    # Override default
    Scenario: 
      Given a user with expired password
      Given admin has customizations for the "Sign-In Page" in the "Sign-In Widget User Identifier" section
        | Display the user's identifier in the Sign-In Widget  | Disabled   |
      When user opens the default Okta-hosted sign-in page
      And user logs in with username and password
      Then user sees the "Password Expired" view without their identifier

    # TODO: other views affected by this feature flag ?