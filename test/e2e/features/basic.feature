Feature: Widget Customization and CSP error
  Background:
    Given an App configured to use interaction code flow

    Scenario: User can hide and show the widget
      When user opens the login page
      And user clicks the hide button
      Then widget is hidden on the page

      When user clicks the show button
      Then widget is shown on the page

    Scenario: User can remove the widget
      When user clicks the remove button
      Then widget is removed from the page

    Scenario: User can customize the widget
      When widget config is updated with colors and i18n
      Then widget background shows the updated color
      And widget displays customized title

    Scenario: User triggers CSP error
      When user triggers CSP failure in the test app
      Then user sees the CSP error on the page

