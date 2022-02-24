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
 *
 * This file is used for Google authenticator and OV Push disabled. 
 */

import { _, loc, View } from 'okta';
import hbs from 'handlebars-inline-precompile';
import FactorUtil from 'util/FactorUtil';
import FormController from 'util/FormController';
import FormType from 'util/FormType';
import RouterUtil from 'util/RouterUtil';
import ManualSetupFooter from 'views/enroll-factors/ManualSetupFooter';
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
    subtitle: function() {
      const factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
      return _.partial(loc, 'enroll.totp.subtitle', 'login', [factorName]);
    },
    noButtonBar: true,
    attributes: { 'data-se': 'step-manual-setup' },

    formChildren: function() {
      const factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
      const step1Instruction = loc('enroll.totp.sharedSecretInstructions.step1', 'login', [factorName]);

      return [
        FormType.View({
          View: View.extend({
            className: 'secret-key-instructions',
            attributes: { 'data-se': 'secret-key-instructions'},
            template: hbs`
            <section aria-live="assertive">
              <p class="screen-reader-only">{{i18n code="enroll.totp.sharedSecretInstructions.aria.intro"
                bundle="login"}}</p>
              <ol>
                <li>{{step1Instruction}}</li>
                <li>{{i18n code="enroll.totp.sharedSecretInstructions.step2" bundle="login"}}</li>
                <li>{{i18n code="enroll.totp.sharedSecretInstructions.step3" bundle="login" 
                $1="<strong>$1</strong>" $2="<strong>$2</strong>"}}</li>
                <li>{{i18n code="enroll.totp.sharedSecretInstructions.step4" bundle="login"}}</li>
              </ol>
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
                sharedSecretKey: this.model.get('sharedSecret'),
                step1Instruction: step1Instruction
              };
            },
          }),
        }),
        FormType.Toolbar({
          noCancelButton: true,
          save: loc('enroll.totp.lastStepButton', 'login'),
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
