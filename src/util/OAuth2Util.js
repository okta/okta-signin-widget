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

function hasResponseType (responseType, type) {
  if (_.isArray(responseType)) {
    return _.contains(responseType, type);
  } else {
    return type === responseType;
  }
}

// TODO: remove and use method from auth-js after 4.1 is released
// https://github.com/okta/okta-auth-js/pull/525
util.isAuthorizationCodeFlow = function (settings) {
  const authClient = settings.getAuthClient();
  const pkce = authClient.options.pkce;
  const responseType = settings.get('authParams.responseType');
  return hasResponseType(responseType, 'code') && !pkce;
};

/**
 * Get the tokens in the OIDC/OAUTH flows
 *
 * @param settings - settings model object
 * @param params - {idp: 'xxx'} for social auth
 *                 {sessionToken: 'xxx'} for okta idp
 */
util.getTokens = function (settings, params, controller) {
  function success (result) {
    settings.callGlobalSuccess(Enums.SUCCESS, result);
  }

  function error (error) {
    // OKTA-104330- Handle error case where user is not assigned to OIDC client
    if (error.errorCode === 'access_denied') {
      controller.model.trigger('error', controller.model, { responseJSON: error });
      controller.model.appState.trigger('removeLoading');
    }
    Util.triggerAfterError(controller, new Errors.OAuthError(error.message), settings);
  }

  const authClient = settings.getAuthClient();
  const options = settings.toJSON({ verbose: true });
  const getTokenOptions = {};

  _.extend(
    getTokenOptions,
    _.pick(options, 'clientId', 'redirectUri'),
    _.pick(options.authParams,
      // https://github.com/okta/okta-auth-js#authorize-options
      'responseType', 'scopes', 'state', 'nonce', 'idp', 'idpScope', 'display', 'prompt', 'maxAge', 'loginHint'
    ),
    params
  );

  // Extra Options for Social Idp popup window title and id_token response timeout
  getTokenOptions.popupTitle = loc('socialauth.popup.title', 'login');
  getTokenOptions.timeout = options.oAuthTimeout;

  // Redirect flow - this can be used when logging into an external IDP, or
  // converting the Okta sessionToken to an access_token, id_token, and/or
  // authorization code. Note: The authorization code flow will always redirect.
  if (options.mode === 'remediation' || util.isAuthorizationCodeFlow(settings)) {
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
