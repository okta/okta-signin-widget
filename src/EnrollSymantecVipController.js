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
  'views/shared/TextBox'],
function (Okta, FormType, FormController, Util, Footer, TextBox) {

  var _ = Okta._;

  return FormController.extend({
    className: 'enroll-symantec',
    Model: {
      props: {
        credentialId: ['string', true],
        passCode: ['string', true],
        nextPassCode: ['string', true],
        factorId: 'string'
      },
      save: function () {
        return this.doTransaction(function (transaction) {

          var factor = _.findWhere(transaction.factors, {
            factorType: 'token',
            provider: 'SYMANTEC'
          });
          return factor.enroll({
            passCode: this.get('passCode'),
            nextPassCode: this.get('nextPassCode'),
            profile: {credentialId: this.get('credentialId')}
          });
        });
      }
    },

    Form: {
      title: _.partial(Okta.loc, 'factor.totpHard.symantecVip', 'login'),
      subtitle: _.partial(Okta.loc, 'enroll.symantecVip.subtitle', 'login'),
      noButtonBar: true,
      autoSave: true,
      className: 'enroll-symantec',
      formChildren: function () {
        return [
          FormType.Input({
            label: Okta.loc('enroll.symantecVip.credentialId.placeholder', 'login'),
            'label-top': true,
            explain: Util.createInputExplain(
              'enroll.symantecVip.credentialId.tooltip',
              'enroll.symantecVip.credentialId.placeholder',
              'login'),
            'explain-top': true,
            name: 'credentialId',
            input: TextBox,
            type: 'text'
          }),
          FormType.Input({
            label: Okta.loc('enroll.symantecVip.passcode1.placeholder', 'login'),
            'label-top': true,
            explain: Util.createInputExplain(
              'enroll.symantecVip.passcode1.tooltip',
              'enroll.symantecVip.passcode1.placeholder',
              'login'),
            'explain-top': true,
            name: 'passCode',
            input: TextBox,
            type: 'text'
          }),
          FormType.Input({
            label: Okta.loc('enroll.symantecVip.passcode2.placeholder', 'login'),
            'label-top': true,
            explain: Util.createInputExplain(
              'enroll.symantecVip.passcode2.tooltip',
              'enroll.symantecVip.passcode2.placeholder',
              'login'),
            'explain-top': true,
            name: 'nextPassCode',
            input: TextBox,
            type: 'text'
          }),
          FormType.Toolbar({
            noCancelButton: true,
            save: Okta.loc('mfa.challenge.verify', 'login')
          })
        ];
      }
    },

    Footer: Footer

  });

});
