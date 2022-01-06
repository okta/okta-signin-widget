# Manually running E2E tests

**Note:** Before the repos is transformed into a yarn workspace, the test should be run in the root directory (`okta-signin-widget/`) of the repo.

// TODO: https://oktainc.atlassian.net/browse/OKTA-437720

## Define environment variables

See `test/e2e/env.defaults.js` for a list of all environment variables used by E2E tests. You can define variables in the shell (using `export VAR=value` in `~/.bash_profile` or similar) or place values in a `testenv` file at the root of this project. [dotenv docs](https://github.com/motdotla/dotenv#dotenv)

For all E2E tests to pass locally, you will need to define these values. You will need a test org and a FB user.

The test org should have a configured SPA app with following login redirect callbacks:

```sh
http://localhost:3000/done
```

Each of these origins must be added as [Trusted Origins](https://help.okta.com/en/prod/Content/Topics/Security/API-trusted-origins.htm).  

The test org should have at least one 'basic' user available for testing.

## Run tests with runner script

The runner script (./runner.js) starts the test app then runs specs against the test app.

```sh
yarn test:e2e
```

## Run test app and specs separately

### Start test app

```sh
yarn start:test:app
```

### Run specs against the test app

#### Run all specs:

```sh
yarn wdio ./test/e2e/wdio.conf.js
```

#### Run single spec:

```sh
yarn wdio ./test/e2e/wdio.conf.js --spec ./test/e2e/specs/{filename}
```

### Add a new test case

1. [Start test app](#start-test-app).
2. Make test changes.
3. [Run the changed test spec](#run-single-spec), you can also use `fit` or `xit` to focus on the targeted test case.
4. Adjust test case if needed.

## Debugging

* If you are using vscode, pick `Debug with WebdriverIO` for debugging. You can limit the debugging scope by changing the `specs` field in `wdio.config.js` file (e.g., `specs/**/*.e2e.js` -> `specs/**/basic.e2e.js`). 

* You can also add `await browser.debug()` statement in any test case to pause the browser.

* You can run test in `headless mode` by adding `CHROME_HEADLESS=true` or `CI=true` to the environment variables.

* You may need to set the `CHROMEDRIVER_VERSION` environment variable to match the version of Chrome on your machine. For example, `CHROMEDRIVER_VERSION=94.0.4606.41` can be added to the `testenv` file to work with Chrome version 94. Latest version numbers can be found at [chromedriver.chromium.org](https://chromedriver.chromium.org/downloads)

For more debugging information, check out [WebdriverIO debugging](https://webdriver.io/docs/debugging/).
