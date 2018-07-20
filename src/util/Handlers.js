/*!
 * Copyright (c) 2018-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

define(['okta', 'util/Logger', 'util/OAuth2Util'], function (Okta, Logger, Util) {

  var Handlers = {};
  var _ = Okta._;

  Handlers.filterOAuthRedirectParams = function(options, config) {
    // Override specific OAuth/OIDC values
    var renderOptions = {
      el: options.el,
      clientId: options.clientId,
      redirectUri: options.redirectUri,
      authParams: {
        display: 'page',
        responseMode: 'fragment',
        responseType: Util.getResponseType(options),
        scopes: options.scope || (config.authParams && config.authParams.scopes) || ['openid']
      }
    };

    if (options.authorizationServerId) {
      // Map the authorizationServerId to issuer
      renderOptions.authParams.issuer = options.authorizationServerId;
    }

    // Override undefined values with SignIn config
    // This will include buttons, assets, etc.
    _.defaults(renderOptions, config);

    // Ensure the 'openid' scope is provided when an 'id_token' is requested.
    // If the 'openid' scope is present and isn't needed, remove it.
    renderOptions.authParams.scopes = Util.scrubScopes(renderOptions.authParams);

    return renderOptions;
  };

  return Handlers;
});
