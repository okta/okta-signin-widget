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
  'views/enroll-factors/Footer'
],
function (Okta, FormType, FormController, Footer) {

  var _ = Okta._;

  function isRSA(provider) {
    return provider === 'RSA';
  }

  function getClassName(provider) {
    return isRSA(provider) ? 'enroll-rsa' : 'enroll-onprem';
  }

  return FormController.extend({
    className: function () {
      return getClassName(this.options.provider);
    },
    Model: function () {
      var provider = this.options.provider;
      return {
        props: {
          credentialId: ['string', true],
          passCode: ['string', true],
          factorId: 'string'
        },
        save: function () {
          return this.doTransaction(function(transaction) {
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
        formChildren: [
          FormType.Input({
            name: 'credentialId',
            type: 'text',
            placeholder: Okta.loc('enroll.onprem.username.placeholder', 'login', [vendorName]),
            params: {
              innerTooltip: Okta.loc('enroll.onprem.username.tooltip', 'login', [vendorName])
            }
          }),
          FormType.Input({
            name: 'passCode',
            type: 'text',
            placeholder: Okta.loc('enroll.onprem.passcode.placeholder', 'login', [vendorName]),
            params: {
              innerTooltip: Okta.loc('enroll.onprem.passcode.tooltip', 'login', [vendorName])
            }
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
