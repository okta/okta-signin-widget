/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint complexity: [2, 50], max-statements: [2, 40] */
define([
  'okta',
  'util/Util',
  'util/Enums',
  'util/BrowserFeatures',
  'util/Errors',
  'util/ErrorCodes'
],
function (Okta, Util, Enums, BrowserFeatures, Errors, ErrorCodes) {
  var fn = {};
  var refreshUrlTpl = Okta.tpl('signin/refresh-auth-state{{#if token}}/{{token}}{{/if}}');
  fn.routeAfterAuthStatusChangeError = function (router, err) {
    if (!err) {
      return;
    }

    // Global error handling for CORS enabled errors
    if (err.xhr && BrowserFeatures.corsIsNotEnabled(err.xhr)) {
      router.settings.callGlobalError(new Errors.UnsupportedBrowserError(
        Okta.loc('error.enabled.cors')
      ));
      return;
    }

    // Token has expired - no longer valid. Navigate back to primary auth.
    if (err.errorCode === ErrorCodes.INVALID_TOKEN_EXCEPTION) {
      router.appState.set('flashError', err);
      router.controller.state.set('navigateDir', Enums.DIRECTION_BACK);
      router.navigate('', { trigger: true });
      return;
    }

    Util.triggerAfterError(router.controller, err);
  };

  fn.createRefreshUrl = function (stateToken) {
    var token = stateToken ? encodeURIComponent(stateToken) : null;
    return refreshUrlTpl({ token: token });
  };

  fn.routeAfterAuthStatusChange = function (router, res) {
    // Other errors are handled by the function making the authClient request
    if (!res || !res.status) {
      return;
    }
    router.appState.setAuthResponse(res);

    fn.handleResponseStatus(router, res);
  };

  fn.routeAfterAuthRemediationChange = function (router, res) {
    // Other errors are handled by the function making the authClient request
    if (!res || !res.status) {
      return;
    }
    router.appState.setAuthResponse(res);
    fn.handleRemediationResponse(router, res);
  };

  fn.handleRemediationResponse = function (router, res) {
    switch (res.status) {
    case 'FACTOR_REQUIRED':
    case 'FACTOR_ENROLL':
    case 'FACTOR_CHALLENGE':
    case 'FACTOR_ENROLL_ACTIVATE':
    case 'PROFILE_REQUIRED':
      router.navigate('signin/render', { trigger: true });
      return;
    default:
      throw new Error('Unknown status: ' + res.status);
    }
  };
  
  return fn;
});
