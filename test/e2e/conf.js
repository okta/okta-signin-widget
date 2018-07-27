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

// Local tests, required:
// WIDGET_TEST_SERVER
// WIDGET_BASIC_USER
// WIDGET_BASIC_PASSWORD
else {
  config.capabilities = {
    browserName: 'chrome',
    chromeOptions: {
      args: [ '--headless', '--disable-gpu', '--window-size=800,600' ]
    }
  };
}

module.exports.config = config;
