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
import { ErrorXHR, ErrorContextData } from 'types/errors';
import { FlowIdentifier } from '@okta/okta-auth-js';

export class ConfigError extends Error {
  name = Enums.CONFIG_ERROR;
  constructor(message?: string) {
    super(message || loc('error.config'));
  }
}

export class UnsupportedBrowserError extends Error {
  name = Enums.UNSUPPORTED_BROWSER_ERROR;
  constructor(message?: string) {
    super(message || loc('error.unsupported.browser'));
  }
}

export class OAuthError extends Error {
  name = Enums.OAUTH_ERROR;
}

export class RegistrationError extends Error {
  name = Enums.REGISTRATION_FAILED;
}

// Thrown when initiation of poll was cancelled.
export class AuthStopPollInitiationError extends Error {
  name = Enums.AUTH_STOP_POLL_INITIATION_ERROR;
}

export class U2FError extends Error {
  xhr: ErrorXHR;
  name = Enums.U2F_ERROR;
  constructor(err: ErrorContextData) {
    super(err.xhr.responseJSON.errorSummary);
    this.xhr = err.xhr;
  }
}

export class WebAuthnError extends Error {
  xhr: ErrorXHR;
  name = Enums.WEB_AUTHN_ERROR;
  constructor(err: ErrorContextData) {
    super(err.xhr.responseJSON.errorSummary);
    this.xhr = err.xhr;
  }
}

// This is triggered only when code aborts webauthn browser prompt.
export class WebauthnAbortError extends Error {
  name = Enums.WEBAUTHN_ABORT_ERROR;
}

export class ConfiguredFlowError extends Error {
  flowSetting: FlowIdentifier;
  name = Enums.CONFIGURED_FLOW_ERROR;
  constructor(message: string, flowSetting: FlowIdentifier) {
    super(message);
    this.flowSetting = flowSetting;
  }
}
