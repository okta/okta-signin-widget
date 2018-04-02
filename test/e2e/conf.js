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

/* global module, process */
var config = {
  framework: 'jasmine2',
  specs: ['specs/*.js'],
  restartBrowserBetweenTests: false
};

// Travis sauceLabs tests
if (process.env.TRAVIS) {
  config.sauceUser = process.env.SAUCE_USERNAME;
  config.sauceKey = process.env.SAUCE_ACCESS_KEY;

  // Mobile devices
  if (process.env.SAUCE_PLATFORM_NAME === 'iOS') {
    config.capabilities = {
      'browserName': process.env.SAUCE_BROWSER_NAME,
      'appiumVersion': process.env.SAUCE_APPIUM_VERSION,
      'deviceName': process.env.SAUCE_DEVICE_NAME,
      'deviceOrientation': process.env.SAUCE_DEVICE_ORIENTATION,
      'platformVersion': process.env.SAUCE_PLATFORM_VERSION,
      'platformName': process.env.SAUCE_PLATFORM_NAME
    };
  }

  // Desktop browsers
  else {
    config.capabilities = {
      'browserName': process.env.SAUCE_BROWSER_NAME,
      'version': process.env.SAUCE_BROWSER_VERSION,
      'platform': process.env.SAUCE_PLATFORM,
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      'build': process.env.TRAVIS_BUILD_NUMBER
    };
  }
}

// Local tests require the following environement variables
// Provided are some examples that will need to be customized for your own use
/*
  SELENIUM_ADDRESS: 'http://selenium-hub:4444/wd/hub'
  BROWSER_NAME: "chrome"
  E2E_HOST: "localhost"
  ANGULAR_HOST: "localhost"
  REACT_HOST: "localhost"
  E2E_PORT: "3000"
  ANGULAR_PORT: "4200"
  REACT_PORT: "3001"
  AUTH_SERVER_PATH: 'oauth2/default/'
  CLIENT_ID: 'myclientid'
  WIDGET_TEST_SERVER: "https://myokta.okta.com"
  WIDGET_BASIC_USER: "Saml.Jackson@gmail.com"
  WIDGET_BASIC_PASSWORD: "Password0"
  WIDGET_BASIC_USER_1: "bsummers@gmail.com"
  WIDGET_BASIC_PASSWORD_1: "Password1"
  WIDGET_BASIC_USER_2: "Alexander.Hamilton@gmail.com"
  WIDGET_BASIC_PASSWORD_2: "Password1"
  WIDGET_BASIC_USER_3: "bsummesr@gmail.com"
  WIDGET_BASIC_PASSWORD_3: "Password1"
  WIDGET_BASIC_USER_4: "bsummers@gmail.com"
  WIDGET_BASIC_PASSWORD_4: "Password1"
  WIDGET_BASIC_USER_5: "vmars@hurst.edu"
  WIDGET_BASIC_PASSWORD_5: "Password1"
*/
else {
  if (process.env.SELENIUM_ADDRESS !== '') {
    config.seleniumAddress = process.env.SELENIUM_ADDRESS;
  }
  else {
    config.seleniumServerJar = '../../node_modules/webdriver-manager/selenium/selenium-server-standalone-3.8.1.jar';
  }
  config.seleniumAddress = 'http://selenium-hub:4444/wd/hub';
  config.capabilities = {
    'browserName':  process.env.BROWSER_NAME,
    'phantomjs.binary.path': require('phantomjs').path,
    'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
  };
}

module.exports.config = config;
