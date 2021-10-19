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

import { _, loc } from 'okta';
import Enums from './Enums';
import Errors from './Errors';
import Util from './Util';
const util = {};

// https://github.com/okta/okta-auth-js#authorize-options
const AUTH_PARAMS = [
  'responseType',
  'scopes',
  'state',
  'nonce',
  'idp',
  'idpScope',
  'display',
  'prompt',
  'maxAge',
  'loginHint'
];
util.AUTH_PARAMS = AUTH_PARAMS;

const VISIBLE_ERRORS = [
  'access_denied',
  'jit_failure_missing_fields',
  'jit_failure_invalid_login_format',
  'jit_failure_values_not_match_pattern',
  'jit_failure_values_too_long',
  'jit_failure_invalid_locale',
];

/**
 * Get the tokens in the OIDC/OAUTH flows
 *
 * @param settings - settings model object
 * @param params - {idp: 'xxx'} for social auth
 *                 {sessionToken: 'xxx'} for okta idp
 */
util.getTokens = function(settings, params, controller) {
  function success(result) {
    settings.callGlobalSuccess(Enums.SUCCESS, result);
  }

  function error(error) {
    let showError = false;
    let responseJSON = error;
  
    if (VISIBLE_ERRORS.includes(error.errorCode)) {
      showError = true;
    }

    // MFA is required but prompt=none (authn V1)
    const mfaRequiredMsg = 'The client specified not to prompt, but the client app requires re-authentication or MFA.';
    if (error.errorCode === 'login_required' && error.errorSummary === mfaRequiredMsg) {
      showError = true;
      responseJSON = { errorSummary: loc('error.mfa.required', 'login') };
    }

    if (showError) {
      controller.model.trigger('error', controller.model, { responseJSON });
      controller.model.appState.trigger('removeLoading');
    }

    Util.triggerAfterError(controller, new Errors.OAuthError(error.message), settings);
  }

  const authClient = settings.getAuthClient();
  const isAuthorizationCodeFlow = authClient.isAuthorizationCodeFlow() && !authClient.isPKCE();
  const options = settings.toJSON({ verbose: true });
  const getTokenOptions = {};

  _.extend(
    getTokenOptions,
    _.pick(options, 'clientId', 'redirectUri'),
    _.pick(options.authParams, AUTH_PARAMS),
    params
  );

  // Extra Options for Social Idp popup window title and id_token response timeout
  getTokenOptions.popupTitle = loc('socialauth.popup.title', 'login');
  getTokenOptions.timeout = options.oAuthTimeout;

  // Redirect flow - this can be used when logging into an external IDP, or
  // converting the Okta sessionToken to an access_token, id_token, and/or
  // authorization code. Note: The authorization code flow will always redirect.
  if (options.redirect === 'always' || isAuthorizationCodeFlow) {
    authClient.token.getWithRedirect(getTokenOptions).catch(error);
  } else if (getTokenOptions.sessionToken) {
    // Default flow if logging in with Okta as the IDP - convert sessionToken to
    // tokens in a hidden iframe. Used in Single Page Apps where the app does
    // not want to redirect away from the page to convert the token.
    authClient.token.getWithoutPrompt(getTokenOptions).then(success).catch(error);
  } else {
    // Default flow if logging in with an external IDP - opens a popup and
    // gets the token from a postMessage response.
    authClient.token.getWithPopup(getTokenOptions).then(success).catch(error);
  }
};

export default util;
