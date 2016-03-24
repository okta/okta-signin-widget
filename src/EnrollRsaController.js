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

  return FormController.extend({
    className: 'enroll-rsa',
    Model: {
      props: {
        credentialId: ['string', true],
        passCode: ['string', true],
        factorId: 'string'
      },
      save: function () {
        return this.doTransaction(function(transaction) {
          var factor = _.findWhere(transaction.factors, {
            factorType: 'token',
            provider: 'RSA'
          });
          return factor.enroll({
            passCode: this.get('passCode'),
            profile: {credentialId: this.get('credentialId')}
          });
        });
      }
    },

    Form: {
      title: Okta.loc('factor.totpHard.rsaSecurId', 'login'),
      noButtonBar: true,
      autoSave: true,
      className: 'enroll-rsa',
      formChildren: [
        FormType.Input({
          name: 'credentialId',
          type: 'text',
          placeholder: Okta.loc('enroll.rsa.username.placeholder', 'login'),
          params: {
            innerTooltip: Okta.loc('enroll.rsa.username.tooltip', 'login')
          }
        }),
        FormType.Input({
          name: 'passCode',
          type: 'text',
          placeholder: Okta.loc('enroll.rsa.passcode.placeholder', 'login'),
          params: {
            innerTooltip: Okta.loc('enroll.rsa.passcode.tooltip', 'login')
          }
        }),
        FormType.Toolbar({
          noCancelButton: true,
          save: Okta.loc('mfa.challenge.verify', 'login')
        })
      ]
    },

    Footer: Footer

  });

});
