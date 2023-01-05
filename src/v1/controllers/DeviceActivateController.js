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
import hbs from '@okta/handlebars-inline-precompile';
import {loc, View} from '@okta/courage';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import TextBox from 'v1/views/shared/TextBox';

const InvalidUserCodeErrorView = View.extend({
  template: hbs`
      <div class="okta-form-infobox-error infobox infobox-error" role="alert">
          <span class="icon error-16"></span>
           <p>{{i18n code="api.authn.error.PASSCODE_INVALID" bundle="login"}}</p>
      </div>
    `
});

export default FormController.extend({
  className: 'device-code-activate',
  Model: function() {
    return {
      props: {
        userCode: ['string', true, this.options?.appState?.get('userCode')],
        stateToken: 'string',
      },
      save: function() {
        const self = this;
        return this.doTransaction(function(transaction) {
          return transaction.deviceActivate({
            userCode: self.get('userCode')
          });
        });
      }
    };
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
      if (this.options.appState.get('deviceActivationStatus') === 'INVALID_USER_CODE') {
        this.add(InvalidUserCodeErrorView, '.o-form-error-container');
      }

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
