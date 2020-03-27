## Run the test

At root directory of okta-signin-widget

Use following commands to run testcafe tests. Make sure playground is not running and consuming the localhost port.
Also make sure your .widgetrc file points to localhost:3000 instead of rain.

Run All

- `yarn test:testcafe chrome`

Run single Fixture

- `yarn test:testcafe chrome -f "Unknown user form"`

Run all similar Fixtures that matches the pattern

- `yarn test:testcafe chrome -F "Unknown.*"`

Run a single test

- `yarn test:testcafe chrome -t "should have editable fields"`

Run all similar tests that matches the pattern

- `yarn test:testcafe chrome -T "should.*"`

### To run testcafe without building playground each time you run test

Start playground at one terminal and run the test in another terminal.
Useful at development time in order to get quicker feedback.

- `yarn test:testcafe-setup`

- `yarn testcafe chrome test/testcafe/spec`
- `yarn testcafe chrome test/testcafe/spec -T "should.*`

Note: Above command directly runs testcafe which is different then test:testcafe

Live reload test for faster development

- `yarn testcafe chrome test/testcafe/spec -f "Unknown user form" --live`

## Guideline for writting test

Currently there are two patterns for writting test

### Page level unit test

The mindset is to
  - bootstrap widget directly to the page you're testing
  - verify the page elements
  - and any interactions

### Mulit-pages flow

This is useful when you want to test sort of real world user flow.
