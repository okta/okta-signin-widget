# E2E test app

This is a test harness app for widget E2E testing. This app provides UI components for test runner to update widget config and render updated widget based on top of that.

**Note:** Before the repos is transformed into a yarn workspace, the test app should be run in the root directory of the repo.

// TODO: https://oktainc.atlassian.net/browse/OKTA-437720

## Run test app

By default it will run using the "dev" bundle
```sh
yarn start:test:app
```

To run against "release" bundle 
```sh
MIN_BUNDLE=1 yarn start:test:app
```

To run against the ESM output

```sh
DIST_ESM=1 yarn start:test:app
```

By default the test app runs in modern browsers that support Promise and async/await.
To build test app with support for older browsers without Promise (such as IE11)

```sh
TARGET=CROSS_BROWSER yarn start:test:app
```

Many other options can be controlled through environment vars. See getDefaultConfig()