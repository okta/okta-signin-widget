/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
var config = {
  framework: 'jasmine2',
  specs: ['specs/*.js'],
  restartBrowserBetweenTests: false
};

// Travis sauceLabs tests
if (process.env.TRAVIS || process.env.BACON) {
  config.sauceUser = process.env.SAUCELABS_USERNAME;
  config.sauceKey = process.env.SAUCELABS_ACCESS_KEY;

  if (process.env.BACON) {
    config.capabilities = {
      'tunnel-identifier': process.env.HOSTNAME,
    };
  } else {
    config.capabilities = {
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      'build': process.env.TRAVIS_BUILD_NUMBER
    };
  }

  // Mobile devices
  if (process.env.SAUCE_PLATFORM_NAME === 'iOS') {
    var appium = require('./appium/ios-conf.js');
    config.port = appium.port;
    config.multiCapabilities = appium.iosCapabilities;
  }

  // Desktop browsers
  else {
    config.capabilities = {
      'browserName': process.env.SAUCE_BROWSER_NAME,
      'version': process.env.SAUCE_BROWSER_VERSION,
      'platform': process.env.SAUCE_PLATFORM
    };
  }
}

// Local tests, required:
// WIDGET_TEST_SERVER
// WIDGET_BASIC_USER
// WIDGET_BASIC_PASSWORD
else {
  const webdriverManegerConfig = require('webdriver-manager/selenium/update-config.json');

  config.directConnect = true;
  config.chromeDriver = webdriverManegerConfig.chrome.last;
  config.capabilities = {
    browserName: 'chrome',
  };
}

module.exports.config = config;
