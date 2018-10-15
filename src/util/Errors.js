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

define(['okta', './Enums'], function (Okta, Enums) {

  function ConfigError(message) {
    this.name = Enums.CONFIG_ERROR;
    this.message = message || Okta.loc('error.config');
  }
  ConfigError.prototype = new Error();

  function UnsupportedBrowserError(message) {
    this.name = Enums.UNSUPPORTED_BROWSER_ERROR;
    this.message = message || Okta.loc('error.unsupported.browser');
  }
  UnsupportedBrowserError.prototype = new Error();

  function OAuthError(message) {
    this.name = Enums.OAUTH_ERROR;
    this.message = message;
  }
  OAuthError.prototype = new Error();

  function RegistrationError(message) {
    this.name = Enums.REGISTRATION_FAILED;
    this.message = message;
  }
  RegistrationError.prototype = new Error();

  // Thrown when initiation of poll was cancelled.
  function AuthStopPollInitiationError() {
    this.name = Enums.AUTH_STOP_POLL_INITIATION_ERROR;
  }
  AuthStopPollInitiationError.prototype = new Error();

  return {
    ConfigError: ConfigError,
    UnsupportedBrowserError: UnsupportedBrowserError,
    OAuthError: OAuthError,
    RegistrationError: RegistrationError,
    AuthStopPollInitiationError: AuthStopPollInitiationError
  };

});
