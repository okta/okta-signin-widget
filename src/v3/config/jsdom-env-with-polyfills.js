/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint-disable import/no-extraneous-dependencies */
const { TextEncoder } = require('util');
const JsDomEnvironment = require('jest-environment-jsdom');

/**
 * A custom environment that extends jsdom with polyfills we need to run tests
 */
class JsDomEnvironmentWithPolyfills extends JsDomEnvironment {
  async setup() {
    await super.setup();
    if (typeof this.global.TextEncoder === 'undefined') {
      // TextEncoder is not included in jsdom but exists in the browser
      // Use the version from Node
      this.global.TextEncoder = TextEncoder;
    }
  }
}

module.exports = JsDomEnvironmentWithPolyfills;
