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

import PrimaryAuthController from 'v1/controllers/PrimaryAuthController';
import IDPDiscoveryModel from 'v1/models/IDPDiscovery';
import PrimaryAuthModel from 'v1/models/PrimaryAuth';
import BaseLoginController from 'v1/util/BaseLoginController';
import IDPDiscoveryForm from 'v1/views/idp-discovery/IDPDiscoveryForm';
import CustomButtons from 'v1/views/primary-auth/CustomButtons';
import DeviceFingerprint from 'v1/util/DeviceFingerprint';
import RouterUtil from 'v1/util/RouterUtil';
import Util from 'util/Util';

export default PrimaryAuthController.extend({
  className: 'idp-discovery',

  View: IDPDiscoveryForm,

  constructor: function(options) {
    options.appState.unset('username');
    let requestContext = options.settings.get('idpDiscovery.requestContext');
    const lastAuthResponse = options.appState.get('lastAuthResponse');
    const stateToken = lastAuthResponse && lastAuthResponse?.stateToken;

    //Update requestContext with last stateToken, if the context was stateToken and not a fromUri
    if(Util.isV1StateToken(requestContext)) {
      requestContext = stateToken;
    }

    this.model = new IDPDiscoveryModel(
      {
        requestContext: requestContext,
        settings: options.settings,
        appState: options.appState,
      },
      { parse: true }
    );

    BaseLoginController.apply(this, arguments);

    this.addListeners();

    // If social auth is configured, 'socialAuthPositionTop' will determine
    // the order in which the social auth and primary auth are shown on the screen.
    if (options.settings.get('hasConfiguredButtons')) {
      this.add(CustomButtons, {
        prepend: options.settings.get('socialAuthPositionTop'),
        options: {
          // To trigger an afterError event, we require the current controller
          currentController: this,
        },
      });
    }

    this.addFooter(options);

    this.setUsername();
  },

  initialize: function() {
    PrimaryAuthController.prototype.initialize.apply(this);

    this.listenTo(this.model, 'goToPrimaryAuth', function() {
      this.settings.set('username', this.model.get('username'));
      const self = this;
      if (this.settings.get('features.deviceFingerprinting')) {
        DeviceFingerprint.generateDeviceFingerprint(this.settings.get('baseUrl'), this.$el)
          .then(function(fingerprint) {
            self.options.appState.set('deviceFingerprint', fingerprint);
            self.options.appState.set('username', self.model.get('username'));
          })
          .catch(function() {
          // Keep going even if device fingerprint fails
            self.options.appState.set('username', self.model.get('username'));
          })
          .finally(function() {
            self.doPrimaryAuth();
          });
      } else {
        self.doPrimaryAuth();
      }
    });
  },

  doPrimaryAuth : function() {
    if (this.settings.get('features.passwordlessAuth')) {
      const primaryAuthModel = new PrimaryAuthModel(
        {
          username: this.model.get('username'),
          multiOptionalFactorEnroll: this.options.settings.get('features.multiOptionalFactorEnroll'),
          settings: this.options.settings,
          appState: this.options.appState,
        },
        { parse: true }
      );

      // Events to set the transaction attributes on the app state.
      this.listenTo(primaryAuthModel, 'error', function(src, errObj) {
        this.toggleButtonState(false);
        this.model.trigger('error', this.model, errObj);
      });
      this.addModelListeners(primaryAuthModel);
      // Make the primary auth request
      primaryAuthModel.save();
    } else {
      this.options.appState.set('disableUsername', true);
      const url = RouterUtil.createSigninUrl(
        this.settings.get('features.prefillUsernameFromIdpDiscovery') && this.model.get('username')
      );
      this.options.appState.trigger('navigate', url);
    }
  },

});
