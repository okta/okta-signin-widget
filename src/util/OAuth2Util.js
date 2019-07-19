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

define(['okta', './Enums', './Errors', './Util'], function (Okta, Enums, Errors, Util) {

  var util = {};
  var _ = Okta._;

  function hasResponseType (params, type) {
    if (_.isArray(params.responseType)) {
      return _.contains(params.responseType, type);
    }
    else {
      return type === params.responseType;
    }
  }

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
        controller.model.trigger('error', controller.model, {'responseJSON': error});
        controller.model.appState.trigger('removeLoading');
      }
      Util.triggerAfterError(controller, new Errors.OAuthError(error.message), settings);
    }

    var authClient = settings.getAuthClient(),
        options = settings.toJSON({ verbose: true }),
        oauthParams = {},
        extraOptions = {};

    _.extend(
      oauthParams,
      _.pick(options, 'clientId', 'redirectUri'),
      _.pick(options.authParams, 'grantType', 'responseType', 'responseMode', 'display', 'scopes', 'state', 'nonce'),
      params
    );

    // Extra Options for Social Idp popup window title and id_token response timeout
    extraOptions.popupTitle = Okta.loc('socialauth.popup.title', 'login');
    extraOptions.timeout = options.oAuthTimeout;

    _.extend(
      extraOptions,
      _.pick(options.authParams, 'issuer', 'authorizeUrl')
    );

    // Redirect flow - this can be used when logging into an external IDP, or
    // converting the Okta sessionToken to an access_token, id_token, and/or
    // authorization code. Note: The authorization code flow will always redirect.
    if (oauthParams.display === 'page' || hasResponseType(oauthParams, 'code')) {
      authClient.token.getWithRedirect(oauthParams, extraOptions)
        .fail(error);
    }

    // Default flow if logging in with Okta as the IDP - convert sessionToken to
    // tokens in a hidden iframe. Used in Single Page Apps where the app does
    // not want to redirect away from the page to convert the token.
    else if (oauthParams.sessionToken) {
      authClient.token.getWithoutPrompt(oauthParams, extraOptions)
        .then(success)
        .fail(error)
        .done();
    }

    // Default flow if logging in with an external IDP - opens a popup and
    // gets the token from a postMessage response.
    else {
      authClient.token.getWithPopup(oauthParams, extraOptions)
        .then(success)
        .fail(error)
        .done();
    }
  };

  // Parse through the OAuth 'authParams' object to ensure the 'openid' scope is
  // included (if required)
  util.addOrRemoveOpenIdScope = function (authParams) {
    if (!authParams.responseType) {
      return;
    }

    //  Convert scope into an Array
    var scope = Array.isArray(authParams.scopes) ? authParams.scopes : authParams.scopes.split(' ');

    // Remove the 'openid' scope, as it is only required if an 'id_token' is requested
    if (scope.includes('openid')) {
      scope.splice(scope.indexOf('openid'), 1);
    }

    // Add the 'openid' scope
    if (authParams.responseType.includes('id_token')) {
      scope.push('openid');
    }

    return scope;
  };

  // Utility handlers for mapping convenience keys to OAuth params
  util.getResponseType = function (options) {
    var responseType = [];
    if (options.getIdToken !== false) {
      responseType.push('id_token');
    }

    if (options.getAccessToken) {
      responseType.push('token');
    }

    return responseType;
  };

  util.transformShowSignInToGetTokensOptions = function (options, config = {}) {
    // Override specific OAuth/OIDC values
    if (!options.clientId && !config.clientId) {
      throw new Errors.ConfigError('showSignInToGetTokens() requires a "clientId" property.');
    }

    var renderOptions = {
      clientId: options.clientId,
      redirectUri: options.redirectUri,
      authParams: {
        issuer: options.authorizationServerId || 'default',
        display: 'page',
        responseMode: 'fragment',
        responseType: util.getResponseType(options),
        scopes: options.scope || (config.authParams && config.authParams.scopes) || ['openid']
      }
    };

    // Ensure the 'openid' scope is provided when an 'id_token' is requested.
    // If the 'openid' scope is present and isn't needed, remove it.
    renderOptions.authParams.scopes = util.addOrRemoveOpenIdScope(renderOptions.authParams);

    return renderOptions;
  };

  return util;

});
