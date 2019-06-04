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
  'util/FormType',
  'util/FormController',
  'util/Util',
  'views/enroll-factors/Footer',
  'views/shared/TextBox'
],
function (Okta, FormType, FormController, Util, Footer, TextBox) {

  var _ = Okta._;

  function isRSA (provider) {
    return provider === 'RSA';
  }

  function getClassName (provider) {
    return isRSA(provider) ? 'enroll-rsa' : 'enroll-onprem';
  }

  return FormController.extend({
    className: function () {
      return getClassName(this.options.provider);
    },
    Model: function () {
      var provider = this.options.provider;
      var factors = this.options.appState.get('factors');
      var factor = factors.findWhere(_.pick(this.options, 'provider', 'factorType'));
      var profile = factor.get('profile');
      var credentialId = (profile && profile.credentialId) ?  profile.credentialId : '';
      return {
        props: {
          credentialId: ['string', true, credentialId],
          passCode: ['string', true],
          factorId: 'string'
        },
        save: function () {
          return this.doTransaction(function (transaction) {
            var factor = _.findWhere(transaction.factors, {
              factorType: 'token',
              provider: provider
            });
            return factor.enroll({
              passCode: this.get('passCode'),
              profile: {credentialId: this.get('credentialId')}
            });
          });
        }
      };
    },

    Form: function () {
      var provider = this.options.provider;
      var factors = this.options.appState.get('factors');
      var factor = factors.findWhere(_.pick(this.options, 'provider', 'factorType'));
      var vendorName = factor.get('vendorName');
      var title = isRSA(provider) ? Okta.loc('factor.totpHard.rsaSecurId', 'login') : vendorName;

      return {
        title: title,
        noButtonBar: true,
        autoSave: true,
        className: getClassName(provider),
        initialize: function () {
          this.listenTo(this.model, 'error', _.bind(function (source, error) {
            if (error && error.status === 409) {
              // 409 means we are in change pin, so we should clear out answer input
              this.$('.o-form-input-name-passCode input').val('');
              this.$('.o-form-input-name-passCode input').trigger('change');
              this.$('.o-form-input-name-passCode input').focus();
            }
          }, this));
        },
        formChildren: [
          FormType.Input({
            label: Okta.loc('enroll.onprem.username.placeholder', 'login', [vendorName]),
            'label-top': true,
            explain: Util.createInputExplain(
              'enroll.onprem.username.tooltip',
              'enroll.onprem.username.placeholder',
              'login',
              [vendorName],
              [vendorName]),
            'explain-top': true,
            name: 'credentialId',
            input: TextBox,
            type: 'text'
          }),
          FormType.Input({
            label: Okta.loc('enroll.onprem.passcode.placeholder', 'login', [vendorName]),
            'label-top': true,
            explain: Util.createInputExplain(
              'enroll.onprem.passcode.tooltip',
              'enroll.onprem.passcode.placeholder',
              'login',
              [vendorName],
              [vendorName]),
            'explain-top': true,
            name: 'passCode',
            input: TextBox,
            type: 'password'
          }),
          FormType.Toolbar({
            noCancelButton: true,
            save: Okta.loc('mfa.challenge.verify', 'login')
          })
        ]
      };
    },

    Footer: Footer

  });

});
