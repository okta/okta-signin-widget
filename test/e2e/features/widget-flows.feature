Feature: Widget Flows

  Background:
    Given an App configured to use interaction code flow
    
    Scenario: Widget starts login flow
      Given user opens the widget in "login" flow config
      Then user sees primary signin form and not forgot password form

    # https://oktainc.atlassian.net/browse/OKTA-537528
    @skip(okta:monolith=true)
    Scenario: Widget starts signup flow
      Given user opens the widget in "signup" flow config
      Then user sees signup form

    Scenario: Widget starts reset password flow
      Given user opens the widget in "resetPassword" flow config
      Then user sees forgot password form

    # https://oktainc.atlassian.net/browse/OKTA-537529
    @skip(okta:monolith=true)
    Scenario: Widget starts unlock account flow
      Given user opens the widget in "unlockAccount" flow config
      Then user sees unlock account form