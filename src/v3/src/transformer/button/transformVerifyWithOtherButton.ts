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
  LinkElement,
  TransformStepFnWithOptions,
} from '../../types';
import { hasMinAuthenticatorOptions, loc } from '../../util';

export const transformVerifyWithOtherButton: TransformStepFnWithOptions = ({
  transaction,
}) => (
  formbag,
) => {
  const shouldAddButton = hasMinAuthenticatorOptions(
    transaction,
    IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    1, // Min # of auth options for link to display
  );
  const selectVerifyStep = transaction.availableSteps
    ?.find(({ name }) => name === IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE);
  if (!shouldAddButton || typeof selectVerifyStep === 'undefined') {
    return formbag;
  }

  const { name: step } = selectVerifyStep;
  const listLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('oie.verification.switch.authenticator', 'login'),
      step,
    },
  };
  formbag.uischema.elements.push(listLink);

  return formbag;
};
