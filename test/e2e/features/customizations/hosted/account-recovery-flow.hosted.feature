@ignore
Feature: Widget Customizations > Hosted > Account Recovery Flow

  Background:
    Given an Org using a default Okta-hosted sign-in page

    # Default setting (true)
    Scenario: 
      When user opens the default Okta-hosted sign-in page
      And user clicks the "forgotPassword" link
      Then user sees the "Reset Password" view
      And the label for the "account-recovery-username" input is "Email or Username" 

    # Override default
    Scenario: 
      Given admin has customizations for the "Sign-In Page" in the "Account Recovery Flow" section
        | Recovery flow label   | label for recovery  |
      When user opens the default Okta-hosted sign-in page
      And user clicks the "forgotPassword" link
      Then user sees the "Reset Password" view
      And the label for the "account-recovery-username" input is "label for recovery" 
