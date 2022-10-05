# https://oktainc.atlassian.net/browse/OKTA-537528
@skip(okta:monolith=true)
Feature: Self Service Registration

  Background:
    Given an App configured to use interaction code flow
    And an a18n profile exists

    Scenario: User signs up with email and password
      Given user opens the login page
      When user clicks the signup link
      Then user sees signup form
      When user fills out their profile details
      And user submits the form
      When user selects email authenticator
      And user clicks the email magic link
      And user selects password authenticator
      Then user sees the password enroll page
      When user fills in new password
      And user submits the form
      And user skips enrollment of optional authenticators
      Then user sees the tokens on the page

    Scenario: User signs up with email and password and optional phone authenticator
      Given user opens the login page
      When user clicks the signup link
      Then user sees signup form
      When user fills out their profile details
      And user submits the form
      When user selects email authenticator
      And user clicks the email magic link
      And user selects password authenticator
      Then user sees the password enroll page
      When user fills in new password
      And user submits the form
      And user selects phone authenticator
      Then user sees the phone enroll page
      When user enters their phone number
      And user submits the form
      Then user is challenged for sms code
      When user enters the SMS code
      And user skips enrollment of optional authenticators
      Then user sees the tokens on the page
  
