/*!
 * Copyright (c) 2018-2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
module.exports = {
  // ====================
  // Appium Configuration
  // ====================
  // Default port for Appium
  port: 4723,
  // Check this link for configurations - https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
  // Check this for capabilities - http://appium.io/docs/en/writing-running-appium/caps/#general-capabilities
  androidCapabilities: [{
    'deviceName': 'Samsung Galaxy S9 WQHD GoogleAPI Emulator',
    'platformName': 'Android',
    'platformVersion': '8.1',
    'deviceOrientation': 'portrait',
    'unicodeKeyboard': true,
    'resetKeyboard': true,
    'browserName': 'Chrome',
    'appiumVersion': '1.9.1',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER
  }],
};
