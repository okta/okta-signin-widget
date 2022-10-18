/* eslint-disable */
const path = require('path');
require('@okta/env').config();

const CI = process.env.CI;
const logLevel = 'warn';
const browserOptions = {
    args: []
};

if (process.env.CHROMIUM_BINARY) {
  browserOptions.binary = process.env.CHROMIUM_BINARY;
}

if (process.env.CI || process.env.CHROME_HEADLESS) {
    browserOptions.args = browserOptions.args.concat([
        '--headless',
        '--disable-gpu',
        '--window-size=1600x1200',
        '--no-sandbox',
        '--whitelisted-ips',
        '--disable-extensions',
        '--verbose',
        '--disable-dev-shm-usage'
    ]);
}

const CHROMEDRIVER_VERSION = process.env.CHROMEDRIVER_VERSION || '89.0.4389.23';
const drivers = {
  chrome: { version: CHROMEDRIVER_VERSION }
};


const conf = {
    //
    // ====================
    // Runner Configuration
    // ====================
    //
    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the directory
    // from which `wdio` was called.
    //
    // The specs are defined as an array of spec files (optionally using wildcards
    // that will be expanded). The test for each spec file will be run in a separate
    // worker process. In order to have a group of spec files run in the same worker
    // process simply enclose them in an array within the specs array.
    //
    // If you are calling `wdio` from an NPM script (see https://docs.npmjs.com/cli/run-script),
    // then the current working directory is where your `package.json` resides, so `wdio`
    // will be called from there.
    //
    specs: [
        path.resolve(__dirname, 'specs/**/*.e2e.js')
    ],
    // Patterns to exclude.
    exclude: [
        path.resolve(__dirname, 'specs/**/language.e2e.js')
    ],
    runner: 'local',
    //
    // ============
    // Capabilities
    // ============
    // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
    // time. Depending on the number of capabilities, WebdriverIO launches several test
    // sessions. Within your capabilities you can overwrite the spec and exclude options in
    // order to group specific specs to a specific capability.
    //
    // First, you can define how many instances should be started at the same time. Let's
    // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
    // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
    // files and you set maxInstances to 10, all spec files will get tested at the same time
    // and 30 processes will get spawned. The property handles how many capabilities
    // from the same test should run tests.
    //
    maxInstances: 10,
    //
    // If you have trouble getting all important capabilities together, check out the
    // Sauce Labs platform configurator - a great tool to configure your capabilities:
    // https://docs.saucelabs.com/reference/platforms-configurator
    //
    capabilities: [{
        
        // maxInstances can get overwritten per capability. So if you have an in-house Selenium
        // grid with only 5 firefox instances available you can make sure that not more than
        // 5 instances get started at a time.
        maxInstances: 1, // all tests use the same user and local storage. they must run in series
        browserName: 'chrome',
        'goog:chromeOptions': browserOptions
        // If outputDir is provided WebdriverIO can capture driver session logs
        // it is possible to configure which logTypes to include/exclude.
        // excludeDriverLogs: ['*'], // pass '*' to exclude all driver session logs
        // excludeDriverLogs: ['bugreport', 'server'],
    }],
    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel,
    //
    // Set specific log levels per logger
    // loggers:
    // - webdriver, webdriverio
    // - @wdio/browserstack-service, @wdio/devtools-service, @wdio/sauce-service
    // - @wdio/mocha-framework, @wdio/jasmine-framework
    // - @wdio/local-runner
    // - @wdio/sumologic-reporter
    // - @wdio/cli, @wdio/config, @wdio/utils
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    // logLevels: {
    //     webdriver: 'info',
    //     '@wdio/appium-service': 'info'
    // },
    //
    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,
    //
    // Set a base URL in order to shorten url command calls. If your `url` parameter starts
    // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
    // gets prepended directly.
    baseUrl: 'http://localhost:3000',
    //
    // Default timeout for all waitFor* commands.
    waitforTimeout: 10000,
    //
    // Default timeout in milliseconds for request
    // if browser driver or grid doesn't send response
    connectionRetryTimeout: 120000,
    //
    // Default request retries count
    connectionRetryCount: 3,
    //
    // Test runner services
    // Services take over a specific job you don't want to take care of. They enhance
    // your test setup with almost no effort. Unlike plugins, they don't add new
    // commands. Instead, they hook themselves up into the test process.
    services: [
        ['selenium-standalone', {
            installArgs: {
                drivers
            },
            args: {
                drivers
            }
        }]
    ],
    
    // Framework you want to run your specs with.
    // The following are supported: Mocha, Jasmine, and Cucumber
    // see also: https://webdriver.io/docs/frameworks
    //
    // Make sure you have the wdio adapter package for the specific framework installed
    // before running any tests.
    framework: 'jasmine',
    //
    // The number of times to retry the entire specfile when it fails as a whole
    // specFileRetries: 1,
    //
    // Delay in seconds between the spec file retry attempts
    // specFileRetriesDelay: 0,
    //
    // Whether or not retried specfiles should be retried immediately or deferred to the end of the queue
    // specFileRetriesDeferred: false,
    //
    // Test reporter for stdout.
    // The only one supported by default is 'dot'
    // see also: https://webdriver.io/docs/dot-reporter
    reporters: [
        'spec',
        ['junit', {
            outputDir: '../../build2/reports/junit',
            outputFileFormat: function() { // optional
                return 'e2e-results.xml';
            }
        }]
    ],
    //
    // Options to be passed to Jasmine.
    jasmineOpts: {
        defaultTimeoutInterval: 60000
    },
}

// overrides for language e2e tests
if (process.env.TEST_LANG) {
  conf.specs = [path.resolve(__dirname, 'specs/**/language.e2e.js')];
  conf.exclude = [];

  // TODO: add support for FF, Edge and IE
  const chrome = conf.capabilities.find(c => c.browserName === 'chrome');
  chrome['goog:chromeOptions'].prefs = {
    'intl.accept_languages': process.env.TEST_LANG
  }
  // Chrome does not respect 'prefs' when running in headless mode
  chrome['goog:chromeOptions'].args.splice(chrome['goog:chromeOptions'].args.indexOf('--headless'), 1);
}

// overrides for saucelabs test
if (process.env.MOBILE_BROWSER_TESTS) {
    conf.capabilities = [
      {
        platformName: 'iOS',
        browserName: 'Safari',
        'appium:deviceName': 'iPad Pro (12.9 inch) (5th generation) Simulator',
        'appium:platformVersion': '15.4',
        'sauce:options': {
          appiumVersion: '1.22.3',
          build: "iOS-Widget-Build",
          name: "iOS-Widget-Test",
        }
      },
      // TODO - https://oktainc.atlassian.net/browse/OKTA-531564
      // {
      //   platformName: 'Android',
      //   browserName: 'Chrome',
      //   'appium:deviceName': 'Samsung Galaxy S8 FHD GoogleAPI Emulator',
      //   'appium:platformVersion': '7.0',
      //   'sauce:options': {
      //     appiumVersion: '1.9.1',
      //     build: "Android-Widget-Build",
      //     name: "Android-Widget-Test",
      //   }
      // }
    ];
} else if (process.env.RUN_SAUCE_TESTS) {
    conf.capabilities = [
    {
      maxInstances: 1, // all tests use the same user and local storage. they must run in series
      browserName: 'MicrosoftEdge',
      browserVersion: 'latest',
      platformName: 'Windows 10',
      "ms:edgeOptions": {} // don't delete this line, edge tests won't run
    },
    {
      maxInstances: 1, // all tests use the same user and local storage. they must run in series
      browserName: 'internet explorer',
      browserVersion: 'latest',
      platformName: 'Windows 10',
      "se:ieOptions": {
          acceptUntrustedCertificates: true,
          "ie.ensureCleanSession": true
      },
      timeouts: { "implicit": 20_000 }
    },
    {
      platformName: 'iOS',
      browserName: 'Safari',
      'appium:deviceName': 'iPad Pro (12.9 inch) (5th generation) Simulator',
      'appium:platformVersion': '15.4',
      'sauce:options': {
        appiumVersion: '1.22.3',
        build: "iOS-Widget-Build",
        name: "iOS-Widget-Test",
      }
    }
    ];
}

// Enable skipping certain tests when running against local monolith
// Can be removed when epic is complete: https://oktainc.atlassian.net/browse/OKTA-528454
if (process.env.LOCAL_MONOLITH) {
  conf.onPrepare = function (config, capabilities) {
    // This code may run in a remote environment. do not reference any variables from outer closure.
    capabilities.forEach(function(cap) {
      cap['okta:monolith'] = true;
    });
  };
}

exports.config = conf;
