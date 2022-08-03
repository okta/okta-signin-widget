Feature: WebAuthn Login

  Background:
    Given an App configured to use interaction code flow
    And a User named "testuser" exists in the org and added to "Device Bound MFA Required" group

    Scenario: User logs in using webauthn
      Given user opens the login page
      When user logs in with username and password
      Then user is challenged for email code
      And user clicks send email
      And user clicks the email magic link
      When user selects biometric authenticator
      And user sets up biometric authenticator
      And user skips enrollment of optional authenticators
      Then user sees the tokens on the page
      
      
