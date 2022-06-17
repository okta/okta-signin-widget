/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint-disable */
const path = require('path');
require('@babel/register'); // Allows use of import module syntax
require('regenerator-runtime'); // Allows use of async/await
const wdioConfig = require('./wdio.conf');
// ensures 'capabilities', 'services' and 'reporters' will need to be defined in this conf file
const { capabilities, services, reporters, ...conf } = wdioConfig.config;

const DEBUG = process.env.DEBUG;
const CI = process.env.CI;
const defaultTimeoutInterval = DEBUG ? (24 * 60 * 60 * 1000) : 10000;

 // If you are using Cucumber you need to specify the location of your step definitions.
const cucumberOpts: WebdriverIO.CucumberOpts = {
  // <boolean> show full backtrace for errors
  backtrace: false,
  // <string[]> module used for processing required features
  requireModule: [],
  // <boolean< Treat ambiguous definitions as errors
  failAmbiguousDefinitions: true,
  // <boolean> invoke formatters without executing steps
  // dryRun: false,
  // <boolean> abort the run on first failure
  failFast: false,
  // <boolean> Enable this config to treat undefined definitions as
  // warnings
  ignoreUndefinedDefinitions: false,
  // <string[]> ("extension:module") require files with the given
  // EXTENSION after requiring MODULE (repeatable)
  names: [],
  // <boolean> hide step definition snippets for pending steps
  snippets: true,
  // <boolean> hide source uris
  source: true,
  // <string[]> (name) specify the profile to use
  profile: [],
  // <string[]> (file/dir) require files before executing features
  require: [
      // './steps/given.ts',
      // './steps/when.ts',
      path.resolve(__dirname, 'steps/given.ts'),
      path.resolve(__dirname, 'steps/when.ts'),
      path.resolve(__dirname, 'steps/then.ts'),
      path.resolve(__dirname, 'steps/after.ts'),
      // Or search a (sub)folder for JS files with a wildcard
      // works since version 1.1 of the wdio-cucumber-framework
      // './src/**/*.js',
  ],
  scenarioLevelReporter: false,
  order: 'defined',
  // <string> specify a custom snippet syntax
  snippetSyntax: undefined,
  // <boolean> fail if there are any undefined or pending steps
  strict: true,
  // <string> (expression) only execute the features or scenarios with
  // tags matching the expression, see
  // https://docs.cucumber.io/tag-expressions/
  tagExpression: 'not @Pending',
  // <boolean> add cucumber tags to feature or scenario name
  tagsInTitle: false,
  // <number> timeout for step definitions
  timeout: defaultTimeoutInterval,
};

export const config: WebdriverIO.Config = {
  ...conf,
  runner: 'local',
  path: '/',
  specs: [
    path.resolve(__dirname, 'features/**/*.feature')
  ],
  baseUrl: 'http://localhost:8080',
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  framework: 'cucumber',
  cucumberOpts,   // no edits required
  capabilities,   // no edits required
  services,
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
