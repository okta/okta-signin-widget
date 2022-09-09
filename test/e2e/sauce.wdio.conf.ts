/* eslint-disable */
const path = require('path');
require('@okta/env').config();
require('@babel/register'); // Allows use of import module syntax
require('regenerator-runtime'); // Allows use of async/await
const wdioConfig = require('./cucumber.wdio.conf');
// ensures 'services' and 'reporters' will need to be defined in this conf file
const { services, reporters, ...conf } = wdioConfig.config;

const DEBUG = process.env.DEBUG;
const defaultTimeoutInterval = DEBUG ? (24 * 60 * 60 * 1000) : 10000;

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
  specs: [
    path.resolve(__dirname, 'features/**/widget-flows.feature')
  ],
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