# OKTA-558295
@skip
Feature: Widget Customizations > Embedded > Help Links

  Background:
    Given an App configured to use interaction code flow

    # Default settings
    Scenario: 
      When user opens the login page
      Then user sees the "forgot-password" link with text "Forgot password?"
      And user sees the "unlock-account" link with text "Unlock account?"
      And user sees the "help" link with text "Help"
      And does not see any custom help links

    # Override defaults
    Scenario: 
      Given widget config has these i18n properties 
        | forgotpassword      | label for forgot password   |
        | unlockaccount       | label for unlock account    |
        | help                | label for help              |
      And widget config has these help links
        | forgotPassword      | http://forgot.okta1.com     |
        | unlock              | http://unlock.okta1.com     |
        | help                | http://help.okta1.com       |
      And widget config has these custom help links
        | text                | href                        |
        | custom link 1       | http://custom1.okta1.com    |
        | custom link 2       | http://custom2.okta2.com    |
      When user opens the login page
      Then user sees the "forgot-password" link with text "label for forgot password" and href "http://forgot.okta1.com"
      And user sees the "unlock-account" link with text "label for unlock account" and href "http://unlock.okta1.com"
      And user sees the "help" link with text "label for help" and href "http://help.okta1.com"
      And user sees a custom help link with text "custom link 1" and href "http://custom1.okta1.com"
      And user sees a custom help link with text "custom link 2" and href "http://custom2.okta1.com"
