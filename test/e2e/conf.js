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

/* eslint no-console: 0 */
require('./env').config();

const jasmineReporters = require('jasmine-reporters');

var config = {
  framework: 'jasmine2',
  specs: ['specs/*.js'],
  restartBrowserBetweenTests: false,
  onPrepare: function() {
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
      savePath: 'build2/reports/junit',
      filePrefix: 'e2e-results',
    }));

    return browser.getProcessedConfig().then(data => {
      global.browserName = data.capabilities.browserName;
    });
  }
};

// Travis sauceLabs tests
if (process.env.TRAVIS  || process.env.CHROME_HEADLESS) {
  if (process.env.SAUCE_PLATFORM_NAME) {
    // Mobile emulators on sauce labs
    config.sauceUser = process.env.SAUCE_USERNAME;
    config.sauceKey = process.env.SAUCE_ACCESS_KEY;
  } else {
    // Desktop browser
    config.directConnect = true;
    config.capabilities = {
      'browserName': 'chrome',
      'chromeOptions': {
        'args': ['--headless','--disable-gpu','--window-size=1600x1200','--no-sandbox']
      }
    };
  }

  if (process.env.SAUCE_PLATFORM_NAME === 'iOS') {
    var appiumiOS = require('./appium/ios-conf.js');
    config.port = 4723;
    config.multiCapabilities = appiumiOS.iosCapabilities;
  }

  else if (process.env.SAUCE_PLATFORM_NAME === 'android') {
    var appiumAndroid = require('./appium/android-conf.js');
    config.port = 4723;
    config.multiCapabilities = appiumAndroid.androidCapabilities;
  }

  if (process.env.SAUCE_PLATFORM_NAME === 'windows') {
    config.multiCapabilities =
    [{
      'browserName': 'MicrosoftEdge',
      'browserVersion': '17.17134',
      'platformName': 'Windows 10',
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      'build': process.env.TRAVIS_BUILD_NUMBER
    }];
    config.exclude = ['specs/dev_spec.js', 'specs/npm_spec.js', 'specs/OIDC_spec.js'];
  }
}
// Local tests, required:
// WIDGET_TEST_SERVER
// WIDGET_BASIC_USER
// WIDGET_BASIC_PASSWORD
else {
  const webdriverManagerConfig = require('protractor/node_modules/webdriver-manager/selenium/update-config.json');

  config.directConnect = true;
  config.chromeDriver = webdriverManagerConfig.chrome.last;
  config.capabilities = {
    browserName: 'chrome',
  };
}

module.exports.config = config;
