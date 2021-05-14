/*!
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint max-len: [2, 160] */
import { loc } from 'okta';
import FormController from 'util/FormController';
import FormType from 'util/FormType';
import TextBox from './views/shared/TextBox';

export default FormController.extend({
  className: 'device-code-activate',
  Model: {
    props: {
      userCode: ['string', true],
      stateToken: 'string',
    },
    save: function() {
      const self = this;
      return this.doTransaction(function(transaction) {
        return transaction.deviceActivate({
          userCode: self.get('userCode')
        });
      });
    },
  },
  Form: {
    noCancelButton: true,
    autoSave: true,
    save: function() {
      return loc('oform.next', 'login');
    },
    title: function() {
      return loc('device.code.activate.title', 'login');
    },
    subtitle() {
      return loc('device.code.activate.subtitle', 'login');
    },
    formChildren: function() {
      return [
        FormType.Input({
          label: loc('device.code.activate.label', 'login'),
          'label-top': true,
          name: 'userCode',
          input: TextBox,
          inputId: 'user-code',
          type: 'text',
          inlineValidation: false,
        })
      ];
    },
    events: {
      'keyup input[name="userCode"]': function(e) {
        e.preventDefault();
        this.addHyphen(e);
      }
    },
    addHyphen(evt) {
      const currentVal = evt.target.value;
      // add hyphen after 4th character
      if (currentVal && currentVal.length === 4 && !['Backspace', 'Delete', '-'].includes(evt.key)) {
        evt.target.value = currentVal.concat('-');
      }
    }
  },
});
