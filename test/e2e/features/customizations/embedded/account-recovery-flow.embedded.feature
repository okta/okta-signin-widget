# OKTA-558295
@skip
Feature: Widget Customizations > Embedded > Account Recovery Flow

  Background:
    Given an App configured to use interaction code flow

    # Default setting (true)
    Scenario: 
      When user opens the login page
      And user clicks the "forgotPassword" link
      Then user sees the "Reset Password" view
      And the label for the "account-recovery-username" input is "Email or Username" 

    # Override default
    Scenario: 
      Given widget config has these i18n properties
        # the admin configuration option sets all 4 of these propeties 
        # TODO assert that all 4 properties are being respected
        | password.forgot.email.or.username.placeholder   | label for username  |
        | password.forgot.email.or.username.tooltip       | label for username  |
        | account.unlock.email.or.username.placeholder    | label for username  |
        | account.unlock.email.or.username.tooltip        | label for username  |
      When user opens the login page
      And user clicks the "forgotPassword" link
      Then user sees the "Reset Password" view
      And the label for the "account-recovery-username" input is "label for username" 
