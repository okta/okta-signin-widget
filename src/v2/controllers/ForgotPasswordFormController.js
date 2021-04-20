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
import { FORMS, ACTIONS } from '../ion/RemediationConstants';
import { FORGOT_PASSWORD_NOT_ENABLED } from '../view-builder/views/TerminalView';

/**
 * Render Password Reset Form immediately as long as
 * the remediation form is available and default remediation is Identify.
 * Otherwise show error messages that feature is not supported.
 */
export default FormController.extend({

  postRender() {
    // Auto switch to porfile enroll (register) page
    // basically mimic the flow that show identify page and click sign-up link.
    // Or show error messages.
    if (this.options.appState.get('currentFormName') === FORMS.IDENTIFY) {
      if (this.options.appState.getActionByPath(ACTIONS.ORG_PASSWORD_RECOVERY_LINK)) {
        this.handleInvokeAction(ACTIONS.ORG_PASSWORD_RECOVERY_LINK);
      } else {
        const messages = {
          type: 'array',
          value: [
            {
              message: 'Forgot password is not enabled for this organization.',
              i18n: {
                key: FORGOT_PASSWORD_NOT_ENABLED,
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
        this.options.appState.trigger('remediationSuccess', resp);
      }
    } else {
      // otherwise behavior as default FormController to handle remediations.
      FormController.prototype.postRender.apply(this, arguments);
    }
  }
});
