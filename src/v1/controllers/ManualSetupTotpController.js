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

import { _, loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import FactorUtil from 'util/FactorUtil';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import RouterUtil from 'v1/util/RouterUtil';
import ManualSetupFooter from 'v1/views/enroll-factors/ManualSetupFooter';
export default FormController.extend({
  className: 'enroll-manual-totp',
  Model: function() {
    return {
      local: {
        sharedSecret: ['string', false, this.options.appState.get('sharedSecret')],
        __factorType__: ['string', false, this.options.factorType],
        __provider__: ['string', false, this.options.provider],
      },
    };
  },

  Form: {
    title: function() {
      const factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));

      return loc('enroll.totp.title', 'login', [factorName]);
    },
    subtitle: _.partial(loc, 'enroll.totp.cannotScanBarcode', 'login'),
    noButtonBar: true,
    attributes: { 'data-se': 'step-manual-setup' },

    formChildren: function() {
      const instructions = this.settings.get('brandName')
        ? loc('enroll.totp.manualSetupInstructions.specific', 'login', [this.settings.get('brandName')])
        : loc('enroll.totp.manualSetupInstructions.generic', 'login');

      return [
        FormType.View({
          View: View.extend({
            className: 'secret-key-instructions',
            attributes: { 'data-se': 'secret-key-instructions'},
            template: hbs`
             <section aria-live="assertive">
                <p  class="okta-form-subtitle o-form-explain text-align-c">
                  {{instructions}}
                </p>
                <p class="shared-key margin-top-10" tabindex=0 
                aria-label="{{i18n code="enroll.totp.sharedSecretInstructions.aria.secretKey" bundle="login"
                arguments="sharedSecretKey"}}">{{sharedSecretKey}}</p>
              </section>
              `,
            initialize: function(){
              this.listenTo(this.model, 'change:sharedSecret', this.render);
            },
            getTemplateData: function() {
              return {
                instructions: instructions,
                sharedSecretKey: this.model.get('sharedSecret')
              };
            },
          })
        }),
        FormType.Toolbar({
          noCancelButton: true,
          save: loc('oform.next', 'login'),
        }),
      ];
    },
  },

  Footer: ManualSetupFooter,

  initialize: function() {
    this.listenTo(this.form, 'save', function() {
      const url = RouterUtil.createActivateFactorUrl(
        this.model.get('__provider__'),
        this.model.get('__factorType__'),
        'activate'
      );

      this.options.appState.trigger('navigate', url);
    });
  },
});
