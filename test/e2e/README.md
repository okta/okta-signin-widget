# Manually running E2E tests

This assumes you have already built the main project:

```sh
yarn install
```

Additionally, you have already installed dependencies for test apps:

```
yarn install:react
yarn install:angular
```

## Define environment variables

See `test/e2e/env.defaults.js` for a list of all environment variables used by E2E tests. You can define variables in the shell (using `export VAR=value` in `~/.bash_profile` or similar) or place values in a `testenv` file at the root of this project. [dotenv docs](https://github.com/motdotla/dotenv#dotenv)

For all E2E tests to pass locally, you will need to define these values. You will need a test org and a FB user.

The test org should have a configured SPA app with following login redirect callbacks:

```sh
http://localhost:8080/implicit/callback
http://localhost:3000/done
```

Each of this origins must be added as 'Trusted Origins'.  

The test org should have at least one 'basic' user available for testing.

## Start the servers

You will need to restart the server whenever you change environment variables.

### Single terminal

Each server process can be started in the background. This allows you to run E2E tests within a single terminal.

```sh
yarn start:basic
```

To kill the background server processes:

```sh
killall node
```

### Separate terminals

When actively developing or debugging a test you will probably prefer to have each server running in its own terminal.

Static server:

```sh
node test/e2e/basic/server
```

## Prepare tests

Generate test specs:

```sh
grunt copy:e2e
```

Run this whenever you change environment variables or spec src.

Generate test pages:

```sh
grunt copy:e2e-pages
```

Run this whenever you change environment variables.

## Built assets

This step requires that you have run the grunt copy commands above.

You will need a built version of the widget to run the tests.  For a full check you can run:
```
yarn build:release
yarn build:webpack-e2e-app
```

However, for development that can be tedious to repeatedly run.  In that case you will want to run:
```
yarn build:webpack-dev --output-path ./target/js --output-filename okta-sign-in.min.js --watch
```

## Prepare protractor

Install/update webdriver locally.

```
yarn webdriver-manager update
```

You should only need to do this once.

## Run specs

To see protractor options simply run:

```sh
npx protractor
```

You can run all specs with this command:

```sh
npx protractor target/e2e/conf.js
```

To run a specific spec:
(yes, the `target/` below is correct - the conf files are copied from `test/`, which is why you need to run the grunt copy command above when you change a spec)
```
npx protractor target/e2e/conf.js --specs target/e2e/specs/basic_spec.js
```
