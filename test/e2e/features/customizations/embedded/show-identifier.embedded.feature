# OKTA-558295
@skip
Feature: Widget Customizations > Embedded > Show Identifier

  Background:
    Given an App configured to use interaction code flow

    # Default setting (true)
    Scenario: 
      Given a user with expired password
      When user opens the login page
      And user logs in with username and password
      Then user sees the "Password Expired" view with their identifier

    # Override default
    Scenario: 
      Given a user with expired password
      And Widget config has these features
        | showIdentifier   | false                |
      When user opens the login page
      And user logs in with username and password
      Then user sees the "Password Expired" view without their identifier

    # TODO: other views affected by this feature flag ?