Feature: CSP
  Background:
    Given an App configured to use interaction code flow

    Scenario: User triggers CSP error: eval
      When user triggers CSP failure in the test app: eval
      Then user sees the CSP error on the page
        | eval blocked due to CSP rule script-src |


    Scenario: User triggers CSP error: style-attr
      When user triggers CSP failure in the test app: style-attr
      Then user sees the CSP error on the page
        | inline blocked due to CSP rule style-src-attr |


