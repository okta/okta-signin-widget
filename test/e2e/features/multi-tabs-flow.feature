Feature: Multi Tabs 

  Background:
    Given an App configured to use interaction code flow

    Scenario: By default, it does not share transaction storage between tabs
      Given user opens the login page
      When user navigates to forgot password form
      And user opens another instance in a new tab
      Then user sees primary signin form and not forgot password form

    Scenario: It will share transaction storage between tabs if state is set
      Given state parameter is set in the widget config
      And user opens the login page
      When user navigates to forgot password form
      And user opens another instance in a new tab
      Then user sees forgot password form
