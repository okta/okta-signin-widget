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

import { $ } from '@okta/courage';
import PrimaryAuthModel from 'v1/models/PrimaryAuth';
import BaseLoginController from 'v1/util/BaseLoginController';
import DeviceFingerprint from 'v1/util/DeviceFingerprint';
import CustomButtons from 'v1/views/primary-auth/CustomButtons';
import PrimaryAuthForm from 'v1/views/primary-auth/PrimaryAuthForm';
import Footer from 'v1/views/shared/Footer';
import FooterRegistration from 'v1/views/shared/FooterRegistration';
import FooterWithBackLink from 'v1/views/shared/FooterWithBackLink';
export default BaseLoginController.extend({
  className: 'primary-auth',

  state: { enabled: true },

  View: PrimaryAuthForm,

  constructor: function(options) {
    options.appState.unset('username');

    this.model = new PrimaryAuthModel(
      {
        multiOptionalFactorEnroll: options.settings.get('features.multiOptionalFactorEnroll'),
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
    if (this.options.appState.get('disableUsername')) {
      this.addFooterWithBackLink(this.options);
    }

    this.setUsername();
  },

  addFooter: function(options) {
    this.add(new Footer(this.toJSON({ appState: options.appState })));

    if (options.settings.get('features.registration') || options.appState.get('isIdxStateToken')) {
      this.add(
        new FooterRegistration({
          settings: this.settings,
          appState: options.appState,
        })
      );
    }
  },

  addFooterWithBackLink: function(options) {
    if (!this.$el.find('.footer-back-link').length) {
      this.add(new FooterWithBackLink(this.toJSON({ 
        appState: options.appState,
        className: 'auth-footer footer-back-link',
      })));
    }
  },

  setUsername: function() {
    const username = this.model.get('username');

    if (username) {
      this.options.appState.set('username', username);
    }
  },

  setUsernameFromIdpDiscovery: function() {
    const username = this.options.username;
    if (username) {
      this.model.set('username', username);
      this.options.appState.set('disableUsername', true);
    }
  },

  events: {
    'focusout input[name=username]': function() {
      if (this.shouldComputeDeviceFingerprint() && this.model.get('username')) {
        const self = this;

        this.options.appState.trigger('loading', true);
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
            self.options.appState.trigger('loading', false);
          });
      } else {
        this.options.appState.set('username', this.model.get('username'));
      }
    },
    'focusin input': function(e) {
      $(e.target.parentElement).addClass('focused-input');
    },
    'focusout input': function(e) {
      $(e.target.parentElement).removeClass('focused-input');
    },
  },

  // This model and the AppState both have a username property.
  // The controller updates the AppState's username when the user is
  // done editing (on blur) or deletes the username (see below).
  initialize: function() {
    this.options.appState.unset('deviceFingerprint');
    if (this.settings.get('features.prefillUsernameFromIdpDiscovery')) {
      this.setUsernameFromIdpDiscovery();
    }
    this.listenTo(this.model, 'change:username', function(model, value) {
      if (!value) {
        // reset AppState to an undefined user.
        this.options.appState.set('username', '');
      }
    });
    this.listenTo(this.model, 'save', function() {
      this.state.set('enabled', false);
    });
    this.listenTo(this.model, 'error', function() {
      this.state.set('enabled', true);
      if (this.options.appState.get('disableUsername')) {
        this.state.set('disableUsername', true);
        this.addFooterWithBackLink(this.options);
      }
    });
    this.listenTo(this.state, 'togglePrimaryAuthButton', function(buttonState) {
      this.toggleButtonState(buttonState);
    });
  },

  shouldComputeDeviceFingerprint: function() {
    return (
      this.settings.get('features.securityImage') &&
      this.settings.get('features.deviceFingerprinting') &&
      this.settings.get('features.useDeviceFingerprintForSecurityImage')
    );
  },
});
