/* eslint-disable */
const path = require('path');
require('@okta/env').config();
require('@babel/register'); // Allows use of import module syntax
require('regenerator-runtime'); // Allows use of async/await

let wdioConfig;

if (process.env.TEST_LANG) {
  wdioConfig = require('./wdio.conf');
} else {
  wdioConfig = require('./cucumber.wdio.conf');
}

// ensures 'capabilities', 'services' and 'reporters' will need to be defined in this conf file
const { capabilities, services, reporters, ...conf } = wdioConfig.config;

const DEBUG = process.env.DEBUG;
const defaultTimeoutInterval = DEBUG ? (24 * 60 * 60 * 1000) : 10000;


if (process.env.TEST_LANG) {
  conf.capabilities = [
    {
      maxInstances: 1, // all tests use the same user and local storage. they must run in series
      browserName: 'firefox',
      browserVersion: 'latest',
      platformName: 'Windows 11',
      'moz:firefoxOptions': {
        prefs: {
          'intl.accept_languages': process.env.TEST_LANG   
        }
      }
    }
  ];

  conf.specs = [path.resolve(__dirname, 'specs/**/language.e2e.js')];
  conf.exclude = [];

} else {
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
    }
  ];
  conf.specs = [ path.resolve(__dirname, 'features/**/interaction-code-flow.feature') ];
}

exports.config = {
  ...conf,
  jasmineNodeOpts: {
    defaultTimeoutInterval,
    stopSpecOnExpectationFailure: true
  },
  runner: 'local',
  path: '/wd/hub',
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  cucumberOpts: {...conf.cucumberOpts, timeout: 20000},
  maxInstances: 1,
  waitforTimeout: 15000,
  services: [
    ...services,
    ['sauce', {
      sauceConnect: true,
      sauceConnectOpts: {
        tunnelIdentifier: 'SIW-e2e-tunnel',
      }
    }],
  ],
  reporters: [
    'spec',
    ['junit', {
      outputDir: '../../build2/reports/junit',
      outputFileFormat: function() { // optional
        return 'cucumber-e2e-results.xml';
      }
    }]
  ],
};