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
    className: 'enroll-yubikey',
    Model: {
      props: {
        passCode: ['string', true],
        factorId: 'string'
      },
      save: function () {
        return this.doTransaction(function(transaction) {
          var factor = _.findWhere(transaction.factors, {
            factorType: 'token:hardware',
            provider: 'YUBICO'
          });
          return factor.enroll({
            passCode: this.get('passCode')
          });
        });
      }
    },

    Form: {
      title: Okta.loc('enroll.yubikey.title', 'login'),
      subtitle: Okta.loc('enroll.yubikey.subtitle', 'login'),
      noCancelButton: true,
      save: Okta.loc('mfa.challenge.verify', 'login'),
      autoSave: true,
      className: 'enroll-yubikey',
      formChildren: [
        FormType.View({
          View: '<div class="yubikey-demo" data-type="yubikey-example"></div>'
        }),
        FormType.Input({
          name: 'passCode',
          type: 'password'
        })
      ]
    },

    Footer: Footer
  });

});
