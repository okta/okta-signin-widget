/*!
 * Copyright (c) 2015-2017, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

define([
  'okta',
  'PrimaryAuthController',
  'views/idp-discovery/IDPDiscoveryForm',
  'models/IDPDiscovery',
  'views/shared/Footer',
  'util/BaseLoginController'
],
function (Okta, PrimaryAuthController, IDPDiscoveryForm, IDPDiscoveryModel, Footer, BaseLoginController) {

  return PrimaryAuthController.extend({
    className: 'idp-discovery',
    
    View: IDPDiscoveryForm,

    constructor: function (options) {
      options.appState.unset('username');

      this.model = new IDPDiscoveryModel({
        requestContext: options.settings.get('idpDiscovery.requestContext'),
        settings: options.settings,
        appState: options.appState
      }, { parse: true });

      BaseLoginController.apply(this, arguments);

      this.addListeners();

      this.add(new Footer(this.toJSON({appState: options.appState})));

      this.setUsername();
    },

    initialize: function () {
      PrimaryAuthController.prototype.initialize.apply(this);

      this.listenTo(this.model, 'goToPrimaryAuth', function () {
        this.settings.set('username', this.model.get('username'));
        this.options.appState.set('disableUsername', true);
        this.options.appState.trigger('navigate', 'signin');
      });
    }

  });

});
