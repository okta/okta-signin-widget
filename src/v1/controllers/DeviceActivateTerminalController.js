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
import {_, loc, View} from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';

const DEVICE_ACTIVATED = 'DEVICE_ACTIVATED';
const DEVICE_NOT_ACTIVATED_CONSENT_DENIED = 'DEVICE_NOT_ACTIVATED_CONSENT_DENIED';
const DEVICE_NOT_ACTIVATED = 'DEVICE_NOT_ACTIVATED';
const DEVICE_CODE_ERROR_KEYS = [
  DEVICE_NOT_ACTIVATED_CONSENT_DENIED,
  DEVICE_NOT_ACTIVATED
];

export default FormController.extend({
  className: 'device-code-terminal',
  postRender: function() {
    FormController.prototype.postRender.apply(this, arguments);

    // show device code terminal icons
    const iconClass = this.options.appState.get('deviceActivationStatus') === DEVICE_ACTIVATED
      ? 'success-24-green' : 'error-24-red';
    this.$('.o-form-head').before('<div class="device-code-terminal--icon-container">' +
      '<span class="device-code-terminal--icon ' + iconClass + '"></span>' +
      '</div>');
  },
  Model: {},
  Form: {
    noCancelButton: true,
    noButtonBar: true,
    title: function() {
      const deviceActivationStatus = this.options.appState.get('deviceActivationStatus');
      if (deviceActivationStatus === DEVICE_ACTIVATED) {
        return loc('device.code.activated.success.title', 'login');
      }
      if (_.contains(DEVICE_CODE_ERROR_KEYS, deviceActivationStatus)) {
        return loc('device.code.activated.error.title', 'login');
      }
    },
    subtitle: function() {
      const deviceActivationStatus = this.options.appState.get('deviceActivationStatus');
      if (deviceActivationStatus === DEVICE_ACTIVATED) {
        return loc('idx.device.activated', 'login');
      }
      if (deviceActivationStatus === DEVICE_NOT_ACTIVATED_CONSENT_DENIED) {
        return loc('idx.device.not.activated.consent.denied', 'login');
      }
      if (deviceActivationStatus === DEVICE_NOT_ACTIVATED) {
        return loc('idx.device.not.activated.internal.error', 'login');
      }
    },
    formChildren: function() {
      return [
        FormType.View({
          View: View.extend({
            template: hbs(
              '{{#if isDeviceCodeError}}\
                  <a href="/activate" class="button button-primary text-align-c retry-button" data-se="try-again">\
                    {{i18n code="oie.try.again" bundle="login"}}\
                  </a>\
               {{/if}}\
              '
            ),
            getTemplateData: function() {
              return {
                isDeviceCodeError: _.contains(DEVICE_CODE_ERROR_KEYS, this.options.appState.get('deviceActivationStatus'))
              };
            },
          }),
        }),
      ];
    }
  }
});
