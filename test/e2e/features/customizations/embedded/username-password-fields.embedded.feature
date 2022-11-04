@ignore
Feature: Widget Customizations > Embedded > Username and Password Fields

  Background:
    Given an App configured to use interaction code flow

    # Default settings
    Scenario: 
      When user opens the login page
      Then the label for the "username" input is "Username"
      And the tip for the "username" input is empty
      And the label for the "password" input is "Password"
      And the tip for the "password" input is empty
      And the "Password Visibility" button is not visible

    # Override defaults
    Scenario: 
      Given widget config has these i18n properties 
        | primaryauth.username.placeholder  | label for username  |
        | primaryauth.username.tooltip      | tip for username    |
        | primaryauth.password.placeholder  | label for passsword |
        | primaryauth.password.tooltip      | tip for password    |
      And Widget config has these features
        | showPasswordToggleOnSignInPage    | true                |
      When user opens the login page
      Then the label for the "username" input is "label for username"
      And the tip for the "username" input is "tip for username"
      And the label for the "password" input is "label for password"
      And the tip for the "password" input is "tip for password"
      And the "Password Visibility" button is visible
