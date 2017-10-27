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

define([
  'okta',
  'views/primary-auth/PrimaryAuthForm',
  'views/primary-auth/CustomButtons',
  'views/shared/FooterRegistration',
  'models/PrimaryAuth',
  'views/shared/Footer',
  'util/BaseLoginController'
],
function (Okta, PrimaryAuthForm, CustomButtons, FooterRegistration, PrimaryAuthModel, Footer, BaseLoginController) {

  var $ = Okta.$;

  return BaseLoginController.extend({
    className: 'primary-auth',

    state: { enabled: true },

    View: PrimaryAuthForm,

    constructor: function (options) {
      options.appState.unset('username');

      this.model = new PrimaryAuthModel({
        multiOptionalFactorEnroll: options.settings.get('features.multiOptionalFactorEnroll'),
        settings: options.settings,
        appState: options.appState
      }, { parse: true });

      BaseLoginController.apply(this, arguments);

      this.addListeners();

      // If social auth is configured, 'socialAuthPositionTop' will determine
      // the order in which the social auth and primary auth are shown on the screen.
      if (options.settings.get('hasConfiguredButtons')) {
        this.add(CustomButtons, {prepend: options.settings.get('socialAuthPositionTop')});
      }
      this.add(new Footer(this.toJSON({appState: options.appState})));

      if (options.settings.get('features.registration')) {
        this.add(new FooterRegistration({
          settings: this.settings,
          appState: options.appState
        }));
      }
      this.setUsername();
    },

    setUsername : function() {
      var username = this.model.get('username');
      if (username) {
        this.options.appState.set('username', username);
      }
    },

    events: {
      'focusout input[name=username]': function () {
        this.options.appState.set('username', this.model.get('username'));
      },
      'focusin input': function (e) {
        $(e.target.parentElement).addClass('focused-input');
      },
      'focusout input': function (e) {
        $(e.target.parentElement).removeClass('focused-input');
      }
    },

    // This model and the AppState both have a username property.
    // The controller updates the AppState's username when the user is
    // done editing (on blur) or deletes the username (see below).
    initialize: function () {
      this.listenTo(this.model, 'change:username', function (model, value) {
        if (!value) {
          // reset AppState to an undefined user.
          this.options.appState.set('username', '');
        }
      });
      this.listenTo(this.model, 'save', function () {
        this.state.set('enabled', false);
      });
      this.listenTo(this.model, 'error', function () {
        this.state.set('enabled', true);
      });
    }

  });

});
