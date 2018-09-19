/*!
 * Copyright (c) 2018-2019, Okta, Inc. and/or its affiliates. All rights reserved.
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
  'util/FormController',
  'views/shared/FooterSignout',
  'util/FactorUtil'
],
function (Okta, FormController, FooterSignout, FactorUtil) {

  var _ = Okta._;
  var { Util } = Okta.internal.util;

  return FormController.extend({

    className: 'verify-custom-factor custom-factor-form',

    Model: {
      props: {
        rememberDevice: 'boolean'
      },

      initialize: function () {
        var rememberDevice = FactorUtil.getRememberDeviceValue(this.appState);
        // set the initial value for remember device (Cannot do this while defining the
        // local property because this.settings would not be initialized there yet).
        this.set('rememberDevice', rememberDevice);
      },

      save: function () {
        var rememberDevice = !!this.get('rememberDevice');
        return this.manageTransaction((transaction, setTransaction) => {
          var data = {
            rememberDevice: rememberDevice
          };
          var factor = _.findWhere(transaction.factors, {
            provider: this.get('provider'),
            factorType: this.get('factorType')
          });
          return factor.verify(data)
          .then((trans) => {
            setTransaction(trans);
            var url = this.appState.get('verifyCustomFactorRedirectUrl');
            if(url !== null) {
              Util.redirect(url);
            }
          })
          .fail(function (err) {
            throw err;
          });
        });
      }
    },

    Form: function() {
      var factors = this.options.appState.get('factors');
      var factor = factors.findWhere({
        provider: this.options.provider,
        factorType: this.options.factorType
      });
      var vendorName = factor.get('vendorName');
      var saveText = Okta.loc('mfa.challenge.verify', 'login');
      var subtitle = Okta.loc('verify.customFactor.subtitle', 'login', [vendorName]);
      return {
        autoSave: true,
        title: vendorName,
        save: saveText,
        subtitle: subtitle,
        attributes: { 'data-se': 'factor-custom' },
        initialize: function () {
          if (this.options.appState.get('allowRememberDevice')) {
            this.addInput({
              label: false,
              'label-top': true,
              placeholder: this.options.appState.get('rememberDeviceLabel'),
              className: 'margin-btm-0',
              name: 'rememberDevice',
              type: 'checkbox'
            });
          }
        }
      };
    },

    Footer: FooterSignout,

    trapAuthResponse: function () {
      if (this.options.appState.get('isMfaChallenge')) {
        return true;
      }
    },

    back: function() {
      // Empty function on verify controllers to prevent users
      // from navigating back during 'verify' using the browser's
      // back button. The URL will still change, but the view will not
      // More details in OKTA-135060.
    },

    initialize: function () {
      this.model.set('provider', this.options.provider);
      this.model.set('factorType', this.options.factorType);
    }

  });

});
