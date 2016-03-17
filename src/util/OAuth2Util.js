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
   * Get the 'id_token' from a social/okta idps.
   *
   * @param settings - settings model object
   * @param params - {idp: 'xxx'} for social auth
   *                 {sessionToken: 'xxx'} for okta idp
   */
  util.getIdToken = function (settings, params) {
    var authClient = settings.getAuthClient(),
        options = settings.toJSON({verbose: true}),
        oauthParams = _.extend({}, _.pick(options, 'clientId'),
          _.pick(options.authParams, 'responseType', 'responseMode', 'display', 'scope')),
        extraOptions = {};

    _.extend(oauthParams, params || {}, {redirectUri: options.oauthRedirectUri});

    // Extra Options for Social Idp popup window title and id_token response timeout
    extraOptions.popupTitle = Okta.loc('socialauth.popup.title', 'login');
    if (options.oAuthTimeout) {
      extraOptions.timeOut = options.oAuthTimeout;
    }

    authClient.idToken.authorize(oauthParams, extraOptions)
    .then(function (result) {
      settings.callGlobalSuccess(Enums.SUCCESS, result);
    })
    .fail(function (error) {
      settings.callGlobalError(new Errors.OAuthError(error.message));
    });
  };

  return util;

});
