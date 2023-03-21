Feature: Multi Tabs 

  Background:
    Given an App configured to use interaction code flow
    And a User named "testuser" exists in the org

    Scenario: By default, it does not share transaction storage between tabs
      Given user opens the login page
      When user navigates to forgot password form
      And user opens another instance in a new tab
      Then user sees primary signin form and not forgot password form

    # https://oktainc.atlassian.net/browse/OKTA-537527
    @skip(okta:monolith=true)
    Scenario: It will share transaction storage between tabs if state is set
      Given state parameter is set in the widget config
      And user opens the login page
      When user navigates to forgot password form
      And user opens another instance in a new tab
      Then user sees forgot password form

    # At the successful end of IDX flow server sets `idx` cookie.
    # When widget restarts login flow, IDX API will return 
    #  successful transaction containing interaction code.
    Scenario: It can load successful transaction after login flow restart without error
      Given transaction storage is empty
      And user opens the login page
      When user navigates to forgot password form
      And user opens another instance in a new tab
      Then user sees primary signin form and not forgot password form
      When user logs in with username and password
      Then user sees the tokens on the page
      When user switches to previous tab
      Then user sees forgot password form
      When user goes back to signin
      Then user sees the tokens on the page
      And user sees no unhandled rejections
