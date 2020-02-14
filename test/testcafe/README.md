## Run the test

At root directory of okta-signin-widget

All in once

- `yarn test:testcafe-run chrome`

Or start playground at one terminal and run the test in another terminal.
Useful at development time in order to get quicker feedback.

- `yarn test:testcafe-setup`
- `yarn testcafe chrome test/testcafe/spec`


## Guideline for writting test

Currently there are two patterns for writting test

### Page level unit test

The mindset is to
  - bootstrap widget directly to the page you're testing
  - verify the page elements
  - and any interactions

### Mulit-pages flow

This is useful when you want to test sort of real world user flow.
