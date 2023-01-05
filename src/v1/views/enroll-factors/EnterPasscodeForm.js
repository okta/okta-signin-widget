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

import { _, loc } from '@okta/courage';
import FactorUtil from 'util/FactorUtil';
import FormType from 'v1/util/FormType';
import Util from 'util/Util';
import TextBox from 'v1/views/shared/TextBox';
const form = {
  title: function() {
    const factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));

    return loc('enroll.totp.title', 'login', [factorName]);
  },
  subtitle: _.partial(loc, 'enroll.totp.enterCode', 'login'),
  autoSave: true,
  noButtonBar: true,
  attributes: { 'data-se': 'step-sendcode' },

  formChildren: function() {
    return [
      FormType.Input({
        label: loc('mfa.challenge.enterCode.placeholder', 'login'),
        'label-top': true,
        explain: Util.createInputExplain(
          'mfa.challenge.enterCode.tooltip',
          'mfa.challenge.enterCode.placeholder',
          'login'
        ),
        'explain-top': true,
        name: 'passCode',
        input: TextBox,
        type: 'tel',
      }),
      FormType.Toolbar({
        noCancelButton: true,
        save: loc('oform.verify', 'login'), // TODO: deprecated by mfa.challenge.verify
      }),
    ];
  },
};
export default form;
