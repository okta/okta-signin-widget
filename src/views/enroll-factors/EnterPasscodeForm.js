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
  'util/FactorUtil',
  'util/FormType',
  'util/Util',
  'views/shared/TextBox'
], function (Okta, FactorUtil, FormType, Util, TextBox) {

  var _ = Okta._;

  var form = {
    title: function () {
      var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
      return Okta.loc('enroll.totp.title', 'login', [factorName]);
    },
    subtitle: _.partial(Okta.loc, 'enroll.totp.enterCode', 'login'),
    autoSave: true,
    noButtonBar: true,
    attributes: { 'data-se': 'step-sendcode' },

    formChildren: function () {
      return [
        FormType.Input({
          label: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
          'label-top': true,
          explain: Util.createInputExplain(
            'mfa.challenge.enterCode.tooltip',
            'mfa.challenge.enterCode.placeholder',
            'login'),
          'explain-top': true,
          name: 'passCode',
          input: TextBox,
          type: 'tel'
        }),

        FormType.Toolbar({
          noCancelButton: true,
          save: Okta.loc('oform.verify', 'login')
        })
      ];
    }
  };

  return form;
});
