## Run the test

At root directory of okta-signin-widget

Use following commands to run testcafe tests. Make sure playground is not running and consuming the localhost port.
Also make sure your .widgetrc file points to localhost:3000 instead of rain.

Run All

- `yarn test -t testcafe`

Run All in headless chrome or another browser

- `yarn test -t testcafe chrome:headless`
- `yarn test -t testcafe safari`

Run single Fixture

- `yarn test -t testcafe -f "Unknown user form"`

Run all similar Fixtures that matches the pattern

- `yarn test -t testcafe -F "Unknown.*"`

Run a single test

- `yarn test -t testcafe --test "should have editable fields"`

**Note:** testcafe's [`-t` CLI flag](https://testcafe.io/documentation/402639/reference/command-line-interface#-t-name---test-name) conflicts with our suite runner, so please use `--test` instead.

Run all similar tests that matches the pattern

- `yarn test -t testcafe -T "should.*"`

### To run testcafe without building playground each time you run test

Start playground at one terminal and run the test in another terminal.
Useful during development in order to get quicker feedback.

- `yarn test:testcafe-setup`

- `yarn test -t testcafe`
- `yarn test -t testcafe -T "should.*`

Note: Above command directly runs testcafe which is different than test:testcafe

Live reload test for faster development

- `yarn test -t testcafe -f "Unknown user form" --live`

## Guideline for writing test

Currently there are two patterns for writing test

### Page level unit test

The mindset is to:

- bootstrap widget directly to the page you're testing
- verify the page elements
- and any interactions

### Multi-pages flow

This is useful when you want to test sort of real world user flow.

## detect-english-leaks test suite
The detect-english-leaks is a test suite that loads up the widget in ok-PL language and checks if the view has any english leaks for OIE specific flows.
It currently has a list of mocks that are ignored as they have known issues. The test is located under spec-en-leaks/EnglishLeaks_spec.js.

To run the test suite locally use.

- `yarn test:enleaks`

To run the test suite on CI use.

- `yarn test:testcafe-ci`

Note: If you ecounter test failures for this suite, it might be because of any of the following reasons (Only applicable to OIE flows)

- New keys added to login.properties and they keys dont exist in login_ok_PL.properties. Running `yarn test:enleaks` locally will generate pseudo-loc properties and make sure login_ok_PL.properties gets regenerated. Additionally you can also run `grunt exec:pseudo-loc` to just generate pseudo loc properties. Running pseudo-loc currently requires you to be on VPN more details https://github.com/okta/okta-signin-widget#utilizing-pseudo-loc

- New keys added to login.properties that are used to render inputs in views but are not listed in i18nTransformer.js within `I18N_OVERRIDE_MAPPINGS`.

- You have built a new error state view using IDX response and the i18n key returned from the API inside the messages object is not listed in login.properties.
