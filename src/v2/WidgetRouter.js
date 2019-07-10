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
  '../views/shared/SecurityBeacon',
  '../views/shared/FactorBeacon',
],
function (Okta,
  BaseLoginRouter,
  RefreshAuthStateController,
  FormController,
  SecurityBeacon,
  FactorBeacon) {
  return BaseLoginRouter.extend({
    routes: {
      '': 'defaultAuth',
      'signin/refresh-auth-state(/:token)': 'refreshAuthState',
      'signin/render': 'renderWidgetView',
      '*wildcard': 'defaultAuth'
    },

    // Route handlers that do not require a stateToken. If the page is refreshed,
    // these functions will not require a status call to refresh the stateToken.
    stateLessRouteHandlers: [
      'defaultAuth', 'refreshAuthState'
    ],

    refreshAuthState: function (token) {
      this.render(RefreshAuthStateController, {
        token: token,
        Beacon: SecurityBeacon
      });
    },

    renderWidgetView: function () {
      this.render(FormController, { Beacon: FactorBeacon });
    }

  });

});
