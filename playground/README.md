# SignIn Widget Playground

## The playground App
In a nutshell, the playground application demonstrates customer hosted sign-in widget case, which loads sign-in widget assets and bootstrap widget via configurations.
The configurations have been done in two folds

- [widgetrc](https://github.com/okta/okta-signin-widget#the-widgetrc-config-file)
- `./main.js`

What `main.js` does is initialize sign-in widget using settings from `widgetrc` plus simple success handler.

## Mock server

While in `widgetrc` you can point `baseUrl` to any Okta tenants, it can also be set to mock server, which is started at `http://localhost:3000` when starting playground application.
You could imagine this is just another Okta tenant but it has to handle API requests properly on its own, which of course means mock it.

Here is the directory structure of `mocks` folder

```
playground/mocks
├── config
├── data
├── spec-device-authenticator
└── spec-okta-api
```

The mock server is implemented using [dyson.js](https://www.npmjs.com/package/dyson). Basically, you need to create a *mapping* in terms of what URI shall respond what response and those *mappings* are all living in `spec-*` folders.

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

## Some thoughts on enhancement

### JSON mock files

Particularly for IDX mocks, there are many redundancy among API responses in terms of structure, data. It would be nice to have a script to generate various mock files base on common data. Manually maintain consistency is painful and tedious.
