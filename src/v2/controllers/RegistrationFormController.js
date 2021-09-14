/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import FormController from './FormController';
import { FORMS } from '../ion/RemediationConstants';
import { REGISTRATION_NOT_ENABLED } from '../view-builder/views/TerminalView';

/**
 * Render Registration Form (a.k.a profile enroll) immediately as long as
 * the remediation form is available and default remediation is Identify.
 * Otherwise show error messages that feature is not supported.
 *
 */
export default FormController.extend({

  // TODO: what if user navigate to this page but there is valid state token in session storage?
  // The flow is like
  // 1. User tries to sign-in
  // 2. During the middle of sign-in, change URL to /signin/register/
  //
  // User probably expects to see sign-up page
  // But user will continue sign-in flow due to the saved state token
  postRender() {
    // Auto switch to porfile enroll (register) page
    // basically mimic the flow that show identify page and click sign-up link.
    // Or show error messages.
    if (this.options.appState.get('currentFormName') === FORMS.IDENTIFY) {
      if (this.options.appState.hasRemediationObject(FORMS.SELECT_ENROLL_PROFILE)) {
        this.handleInvokeAction(FORMS.SELECT_ENROLL_PROFILE);
      } else {
        const messages = {
          type: 'array',
          value: [
            {
              message: 'Sign up is not enabled for this organization.',
              i18n: {
                key: REGISTRATION_NOT_ENABLED,
              },
              class: 'ERROR',
            }
          ]
        };

        const resp = {
          neededToProceed: [],
          // OKTA-382410 so bad that has to leverage rawIdxState
          rawIdxState: {
            messages,
          },
          context: {
            messages,
          }
        };
        this.options.appState.trigger('updateAppState', resp);
      }
    } else {
      // otherwise behavior as default FormController to handle remediations.
      FormController.prototype.postRender.apply(this, arguments);
    }
  }
});
