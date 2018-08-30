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
  'PrimaryAuthController',
  'models/PrimaryAuth',
  'views/idp-discovery/IDPDiscoveryForm',
  'models/IDPDiscovery',
  'util/BaseLoginController',
  'util/Util'
],
function (PrimaryAuthController, PrimaryAuthModel, IDPDiscoveryForm, IDPDiscoveryModel,
          BaseLoginController, Util) {

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

      this.addFooter(options);

      this.setUsername();
    },

    initialize: function () {
      PrimaryAuthController.prototype.initialize.apply(this);

      this.listenTo(this.model, 'goToPrimaryAuth', function () {
        this.settings.set('username', this.model.get('username'));
        if (this.settings.get('features.passwordlessAuth')) {
          var primaryAuthModel = new PrimaryAuthModel({
            username: this.model.get('username'),
            multiOptionalFactorEnroll: this.options.settings.get('features.multiOptionalFactorEnroll'),
            settings: this.options.settings,
            appState: this.options.appState
          }, { parse: true });
          // Events to set the transaction attributes on the app state.
          this.addModelListeners(primaryAuthModel);
          // Make the primary auth request
          primaryAuthModel.save();
        } else {
          this.options.appState.set('disableUsername', true);
          this.options.appState.trigger('navigate', 'signin');
        }
      });

      this.listenTo(this.model, 'goToOtherIdpAuth', function (url) {
        Util.postToUrl(url, this.$el);
      });
    }

  });

});
