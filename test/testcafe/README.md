## Run the test

At root directory of okta-signin-widget

Use following commands to run testcafe tests. Make sure playground is not running and consuming the localhost port.
Also make sure your .widgetrc file points to localhost:3000 instead of rain.

Run All

- `yarn test -t testcafe chrome`

Run All in headless chrome

- `yarn test -t testcafe chrome:headless`

Run single Fixture

- `yarn test -t testcafe chrome -f "Unknown user form"`

Run all similar Fixtures that matches the pattern

- `yarn test -t testcafe chrome -F "Unknown.*"`

Run a single test

- `yarn test -t testcafe chrome -t "should have editable fields"`

Run all similar tests that matches the pattern

- `yarn test -t testcafe chrome -T "should.*"`

### To run testcafe without building playground each time you run test

Start playground at one terminal and run the test in another terminal.
Useful during development in order to get quicker feedback.

- `yarn test:testcafe-setup`

- `yarn test -t testcafe chrome test/testcafe/spec`
- `yarn test -t testcafe chrome test/testcafe/spec -T "should.*`

Note: Above command directly runs testcafe which is different than test:testcafe

Live reload test for faster development

- `yarn test -t testcafe chrome test/testcafe/spec -f "Unknown user form" --live`

## Guideline for writing test

Currently there are two patterns for writing test

### Page level unit test

The mindset is to:

- bootstrap widget directly to the page you're testing
- verify the page elements
- and any interactions

### Multi-pages flow

This is useful when you want to test sort of real world user flow.
