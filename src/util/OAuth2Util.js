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

define(['okta', './Enums', './Errors'], function (Okta, Enums, Errors) {

  var util = {};
  var _ = Okta._;

  /**
   * Get the tokens in the OIDC/OAUTH flows
   *
   * @param settings - settings model object
   * @param params - {idp: 'xxx'} for social auth
   *                 {sessionToken: 'xxx'} for okta idp
   */
  util.getTokens = function (settings, params) {

    function success(result) {
      settings.callGlobalSuccess(Enums.SUCCESS, result);
    }

    function error(error) {
      settings.callGlobalError(new Errors.OAuthError(error.message));
    }

    var authClient = settings.getAuthClient(),
        options = settings.toJSON({ verbose: true }),
        oauthParams = {},
        extraOptions = {};

    _.extend(
      oauthParams,
      _.pick(options, 'clientId', 'redirectUri'),
      _.pick(options.authParams, 'responseType', 'responseMode', 'display', 'scope', 'scopes'),
      params
    );

    // Extra Options for Social Idp popup window title and id_token response timeout
    extraOptions.popupTitle = Okta.loc('socialauth.popup.title', 'login');
    extraOptions.timeout = options.oAuthTimeout;

    // Okta as IDP - convert sessionToken to idToken in hidden iframe
    if (oauthParams.sessionToken) {
      authClient.token.getWithoutPrompt(oauthParams, extraOptions)
      .then(success)
      .fail(error)
      .done();
    }

    // SocialAuth IDP, redirect flow
    else if (oauthParams.display === 'page') {
      authClient.token.getWithRedirect(oauthParams, extraOptions);
    }

    // SocialAuth IDP, popup flow (default for social idps)
    else {
      authClient.token.getWithPopup(oauthParams, extraOptions)
      .then(success)
      .fail(error)
      .done();
    }
  };

  return util;

});
