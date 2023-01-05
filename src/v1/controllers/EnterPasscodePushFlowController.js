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

import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import FormController from 'v1/util/FormController';
import RouterUtil from 'v1/util/RouterUtil';
import EnterPasscodeForm from 'v1/views/enroll-factors/EnterPasscodeForm';
const EnterPasscodePushFlowControllerFooter = View.extend({
  template: hbs(
    '\
      <a href="#" class="link help js-back" data-se="back-link">\
        {{i18n code="oform.back" bundle="login"}}\
      </a>\
    '
  ),
  className: 'auth-footer',
  events: {
    'click .js-back': function(e) {
      e.preventDefault();
      this.back();
    },
  },
  back: function() {
    const url = RouterUtil.createActivateFactorUrl(
      this.options.appState.get('activatedFactorProvider'),
      'push',
      'manual'
    );

    this.options.appState.trigger('navigate', url);
  },
});
export default FormController.extend({
  className: 'activate-push',
  Model: function() {
    return {
      props: {
        factorId: ['string', true, this.options.appState.get('activatedFactorId')],
        passCode: ['string', true],
      },
      local: {
        __factorType__: ['string', false, this.options.factorType],
        __provider__: ['string', false, this.options.provider],
      },
      save: function() {
        return this.doTransaction(function(transaction) {
          return transaction.activate({
            passCode: this.get('passCode'),
          });
        });
      },
    };
  },

  Form: EnterPasscodeForm,

  Footer: EnterPasscodePushFlowControllerFooter,
});
