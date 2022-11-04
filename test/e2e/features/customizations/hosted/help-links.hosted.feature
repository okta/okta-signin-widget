@ignore
Feature: Widget Customizations > Hosted > Help Links

  Background:
    Given an Org using a default Okta-hosted sign-in page

    # Default settings
    Scenario: 
      When user opens the default Okta-hosted sign-in page
      Then user sees the "forgot-password" link with text "Forgot password?"
      And user sees the "unlock-account" link with text "Unlock account?"
      And user sees the "help" link with text "Help"
      And user does not see any custom help links

    # Override defaults
    Scenario: 
      Given admin has customizations for the "Sign-In Page" in the "Customized Help Links" section
        | Forgotton Password      | label for forgot password |
        | Forgotten Password URL  | http://forgot.okta1.com   |
        | Unlock account          | label for unlock account  |
        | Unlock account URL      | http://unlock.okta1.com   |
        | Okta help               | label for help            |
        | Okta help URL           | http://help.okta1.com     |
        | Custom link 1 text      | custom link 1             |
        | Custom link 1 URL       | http://custom1.okta1.com  |
        | Custom link 2 text      | custom link 2             |
        | Custom link 2 URL       | http://custom2.okta1.com  |
      When user opens the default Okta-hosted sign-in page
      Then user sees the "forgot-password" link with text "label for forgot password" and href "http://forgot.okta1.com"
      And user sees the "unlock-account" link with text "label for unlock account" and href "http://unlock.okta1.com"
      And user sees the "help" link with text "label for help" and href "http://help.okta1.com"
      And user sees a custom help link with text "custom link 1" and href "http://custom1.okta1.com"
      And user sees a custom help link with text "custom link 2" and href "http://custom2.okta1.com"
