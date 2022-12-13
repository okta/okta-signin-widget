# OKTA-558295
@skip
Feature: Widget Customizations > Hosted > Username and Password Fields

  Background:
    Given an Org using a default Okta-hosted sign-in page

    # Default settings
    Scenario: 
      When user opens the default Okta-hosted sign-in page
      Then the label for the "username" input is "Username"
      And the tip for the "username" input is empty
      And the label for the "password" input is "Password"
      And the tip for the "password" input is empty
      And the "Password Visibility" button is not visible

    # Override defaults
    Scenario: 
      Given admin has customizations for the "Sign-In Page" in the "Username & Password Fields" section
        | Username label              | label for username  |
        | Username info tip           | tip for username    |
        | Password label              | label for passsword |
        | Password info tip           | tip for password    |
        | Password visibility toggle  | Enabled             |
      When user navigates to the default Okta-hosted sign-in page
      Then the label for the "username" input is "label for username"
      And the tip for the "username" input is "tip for username"
      And the label for the "password" input is "label for password"
      And the tip for the "password" input is "tip for password"
      And the "Password Visibility" button is visible
