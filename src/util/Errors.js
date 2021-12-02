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

import { loc } from 'okta';
import Enums from './Enums';

function ConfigError(message) {
  this.name = Enums.CONFIG_ERROR;
  this.message = message || loc('error.config');
}
ConfigError.prototype = new Error();

function UnsupportedBrowserError(message) {
  this.name = Enums.UNSUPPORTED_BROWSER_ERROR;
  this.message = message || loc('error.unsupported.browser');
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

function U2FError(err) {
  this.name = Enums.U2F_ERROR;
  this.message = err.xhr.responseJSON.errorSummary;
  this.xhr = err.xhr;
}
U2FError.prototype = new Error();

function WebAuthnError(err) {
  this.name = Enums.WEB_AUTHN_ERROR;
  this.message = err.xhr.responseJSON.errorSummary;
  this.xhr = err.xhr;
}
WebAuthnError.prototype = new Error();

// This is triggered only when code aborts webauthn browser prompt.
function WebauthnAbortError() {
  this.name = Enums.WEBAUTHN_ABORT_ERROR;
}
WebauthnAbortError.prototype = new Error();

function ConfiguredFlowError(message, flowSetting) {
  this.name = Enums.CONFIGURED_FLOW_ERROR;
  this.message = message;
  this.flowSetting = flowSetting;
}
ConfiguredFlowError.prototype = new Error();

export default {
  ConfigError: ConfigError,
  UnsupportedBrowserError: UnsupportedBrowserError,
  OAuthError: OAuthError,
  RegistrationError: RegistrationError,
  AuthStopPollInitiationError: AuthStopPollInitiationError,
  U2FError: U2FError,
  WebAuthnError: WebAuthnError,
  WebauthnAbortError: WebauthnAbortError,
  ConfiguredFlowError: ConfiguredFlowError,
};
