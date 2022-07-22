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

import { IdxTransaction } from '@okta/okta-auth-js';

import { ButtonElement, ButtonType, FormBag } from '../../types';

export const transformButtons = (
  transaction: IdxTransaction,
) => (
  formbag: FormBag,
): FormBag => {
  const { availableSteps = [], nextStep } = transaction;

  return availableSteps
    .reduce((acc, step) => {
      // TODO: form can be rendered by steps other than nextStep
      // buttonType should depend on the selected step
      const buttonType = step.name === nextStep?.name
        ? ButtonType.SUBMIT
        : ButtonType.BUTTON;
      const stepName = step.name;
      // TODO: use only step as indicator once authjs supports it to proceed all steps
      const isAction = stepName.startsWith('currentAuthenticator') || stepName === 'cancel';
      const button: ButtonElement = {
        type: 'Button',
        options: {
          type: buttonType,
          step: stepName,
          ...(isAction && { actionName: stepName }),
        },
      };
      acc.uischema.elements.push(button);

      return acc;
    }, formbag);
};
