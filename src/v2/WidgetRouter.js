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

/* eslint max-params: [2, 50] */
define([
  'okta',
  './util/BaseLoginRouter',
  './controllers/RefreshAuthStateController',
  './controllers/FormController',
  './controllers/ErrorController'
],
function (Okta,
  BaseLoginRouter,
  RefreshAuthStateController,
  FormController,
  ErrorController) {
  return BaseLoginRouter.extend({
    routes: {
      '': 'defaultAuth',
      'signin/render': 'renderWidgetView',
      '*wildcard': 'defaultAuth'
    },

    defaultAuth: function () {
      var stateToken = this.settings.get('stateToken');
      var authStateRefreshed = this.settings.get('authStateRefreshed');
      if (authStateRefreshed) {
        this.renderWidgetView();
        return;
      }
      if (stateToken && !authStateRefreshed) {
        this.settings.unset('stateToken');
        //if widget bootstrapped with stateToken
        this.refreshAuthState(stateToken);
      } else {
        //TODO check for stateToken in cookie if not present in settings
        //widget bootstrapped with no statetoken
        this.renderErrorView();
      }
    },

    refreshAuthState: function (token) {
      this.render(RefreshAuthStateController, {
        token: token
      });
    },

    renderErrorView: function () {
      // no/invalid stateToken
      this.render(ErrorController);
    },

    renderWidgetView: function () {
      this.render(FormController);
    },
  });

});
