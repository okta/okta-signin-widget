Feature: Widget Flows

  Background:
    Given an App configured to use interaction code flow
    
    Scenario: Widget starts login flow
      Given user opens the widget in "login" flow config
      Then user sees primary signin form and not forgot password form

    Scenario: Widget starts signup flow
      Given user opens the widget in "signup" flow config
      Then user sees signup form

    Scenario: Widget starts reset password flow
      Given user opens the widget in "resetPassword" flow config
      Then user sees forgot password form

    Scenario: Widget starts unlock account flow
      Given user opens the widget in "unlockAccount" flow config
      Then user sees unlock account form