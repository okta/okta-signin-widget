# SignIn Widget Playground

## The playground App

In a nutshell, the playground application demonstrates a customer hosted sign-in widget use-case, which loads sign-in widget assets and bootstrap widget via configurations.

The configuration consists of

- [widgetrc](https://github.com/okta/okta-signin-widget#the-widgetrc-config-file)
- `./main.js`: initializes the sign-in widget using settings from `.widgetrc.js` along with a simple success handler.

## Mock server

While starting the playground application, the `baseUrl` in `.widgetrc.js` can be used to point to any Okta tenant. Similarly it can also be set to point to the mock server, which runs at <http://localhost:3000>

Here is the directory structure of `mocks` folder

```
playground/mocks
├── config
├── data
├── spec-device-authenticator
└── spec-okta-api
```

The mock server is implemented using [dyson.js](https://www.npmjs.com/package/dyson). You need to create mappings of URI(endpoints) with corresponding response. These mappings are placed in `spec-*` folders.

- `spec-okta-api` has mocks for Okta APIs, e.g. `/api/v1/*`, `/idp/idx/*`, etc
- `spec-device-authenticator` is for mocking 3rd-party device authenticator application.

In most cases, the response is coming from a JSON file. It would be good to have abstractions to avoid tedious copy/paste. Take a look at config/templateHelper to get a sense of how to handle the common use cases in a generic fashion.
In order to create mock, i.e have a url /idp/idx/foo, respond with JSON stored in my-foo.json, you need to do two things:

1. Adds URL to `idx` object in `spec-okta-api/idp/idx/index.js`
2. Specify JSON file name in `idx` object in `config/responseConfig` like

```
'idp/idx/foo': [
  'my-foo.json',
],
```

You may wonder why the value is a List instead of a single String? Well, this is the poor man's solution for providing dynamic responses.
It means that you get different API response every time you hit the URL.

```
index = (number of times - 1) `mod` (size of mock data array)
apiResponse = dataArray[index]
```

## Testcafe tests, playground, and mock server

Testcafe tests located under `/test/testcafe/spec` use the playground application to run the tests.
However, they do not use the mock server even though the mock server is started along with playground application. This is not ideal for the following reasons

- each test expects different sets of API mocks.
- unless the test can change mock server config during testing, leveraging the mock server won't work.

Luckily, testcafe has its own API to [intercept http request and mock response](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/intercept-http-requests.html).

In summary, testcafe tests are using playground application but not mock sever. Mock server is only intended to be used during manually testing, bug reproduction.

## Testing minified CDN bundle

Run `yarn build:webpack-release` to generate CDN bundle (this can be run with the `--watch` flag). Open `http://localhost:3000/cdn.html` to test the minified bundle loads and renders correctly. Saucelabs tunnel can be used to test in IE11. Although you can use mocks via responseConfig, the `.widgetrc.js` file will not be loaded. Configuration can be edited directly in `cdn.html`. Before starting the playground set `DISABLE_CSP` environment variable.

```
DISABLE_CSP=1 yarn start
```

## Testing on IE11

Follow instructions for [Testing minified CDN bundle](#testing-minified-cdn-bundle).

## Some thoughts on enhancement

### JSON mock files

Particularly for IDX mocks, there are many redundancy among API responses in terms of structure, data. It would be nice to have a script to generate various mock files base on common data. Manually maintain consistency is painful and tedious.
