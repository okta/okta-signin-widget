/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IDX_STEP } from '../../constants';
import {
  DividerElement, LaunchAuthenticatorButtonElement, TransformStepFnWithOptions,
} from '../../types';
import { loc } from '../../util';

export const transformLaunchAuthenticatorButton: TransformStepFnWithOptions = ({
  transaction,
}) => (
  formBag,
) => {
  const { neededToProceed: remediations } = transaction;
  const containsLaunchAuthenticator = remediations.some(
    (remediation) => remediation.name === IDX_STEP.LAUNCH_AUTHENTICATOR,
  );
  if (!containsLaunchAuthenticator) {
    return formBag;
  }

  const launchAuthenticatorButton: LaunchAuthenticatorButtonElement = {
    type: 'LaunchAuthenticatorButton',
    label: loc('oktaVerify.button', 'login'),
    options: {
      step: IDX_STEP.LAUNCH_AUTHENTICATOR,
    },
  };

  const dividerElement: DividerElement = {
    type: 'Divider',
    options: { text: loc('socialauth.divider.text', 'login') },
  };

  const titleIndex = formBag.uischema.elements.findIndex((element) => element.type === 'Title');
  const pivButtonPos = titleIndex !== -1 ? titleIndex + 1 : 0;

  formBag.uischema.elements.splice(pivButtonPos, 0, launchAuthenticatorButton, dividerElement);

  return formBag;
};
