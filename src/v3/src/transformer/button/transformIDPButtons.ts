/*
 * Copyright (c) 2022-present, Okta, Inc. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant
 * to the Apache License, Version 2.0 (the "License.")
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NextStep } from '@okta/okta-auth-js';

import { IDX_STEP } from '../../constants';
import {
  ButtonElement,
  ButtonType,
  DividerElement,
  IWidgetContext,
  TransformStepFnWithOptions,
} from '../../types';
import { loc } from '../../util';

export const PIV_TYPE = 'X509';

// TODO: Implement CUSTOM IDP Buttons here
export const transformIDPButtons: TransformStepFnWithOptions = ({
  transaction,
  widgetProps,
}) => (
  formbag,
) => {
  const { neededToProceed: remediations } = transaction;
  const containsPivIDP = remediations.some(
    (remediation) => remediation.name === IDX_STEP.REDIRECT_IDP && remediation.type === PIV_TYPE,
  );
  if (!containsPivIDP) {
    return formbag;
  }

  const { piv, idpDisplay } = widgetProps;
  const isBottomDivider = typeof idpDisplay === 'undefined'
    ? true
    : idpDisplay.toUpperCase() === 'PRIMARY';
  const pivButton: ButtonElement = {
    type: 'Button',
    label: piv?.text || loc('piv.cac.card', 'login'),
    options: {
      type: ButtonType.BUTTON,
      step: IDX_STEP.PIV_IDP,
      dataSe: 'piv-card-button',
      classes: `${piv?.className || ''} piv-button`,
      variant: 'secondary',
      onClick: (widgetContext: IWidgetContext) => {
        // To render the PIV view, we have to use a remediation that is provided on initial load
        // This remeidation doesn't allow a network request, so we have to update the transaction
        // to set the NextStep as the PIV remediation and change the step name to match what
        // the transaction transformers expect to render PIV View.
        // NOTE: IDPs and PIV share the same remediation step name, this is why we update the name
        // for PIV
        // Additionally, we clear the messages and other remediations from the PIV view
        // to prevent the widget from displaying elements that are not related to PIV
        const { setIdxTransaction } = widgetContext;
        const pivRemediations = transaction.neededToProceed.filter(
          (remediation) => (remediation.name === IDX_STEP.REDIRECT_IDP
            && remediation.type === PIV_TYPE),
        ).map((remediation) => {
          if (remediation.name === IDX_STEP.REDIRECT_IDP) {
            return { ...remediation, name: IDX_STEP.PIV_IDP };
          }
          return remediation;
        });
        setIdxTransaction({
          ...transaction,
          messages: [],
          neededToProceed: pivRemediations,
          availableSteps: pivRemediations as NextStep[],
          nextStep: pivRemediations.find(({ name }) => name === IDX_STEP.PIV_IDP) as NextStep,
        });
      },
    },
  };

  const dividerElement: DividerElement = {
    type: 'Divider',
    options: { text: loc('socialauth.divider.text', 'login') },
  };

  if (isBottomDivider) {
    const titleIndex = formbag.uischema.elements.findIndex((element) => element.type === 'Title');
    const pivButtonPos = titleIndex !== -1 ? titleIndex + 1 : 0;
    // Add button after title (if exists) otherwise add to top of array
    formbag.uischema.elements.splice(pivButtonPos, 0, pivButton, dividerElement);
  } else {
    const firstLinkIndex = formbag.uischema.elements.findIndex((element) => element.type === 'Link');
    const firstButtonIndex = formbag.uischema.elements.findIndex((element) => element.type === 'Button');
    const firstButtonPos = firstButtonIndex !== -1 ? firstButtonIndex + 1 : 0;
    const pivButtonPos = firstLinkIndex !== -1 ? firstLinkIndex : firstButtonPos;
    // Add button after login form but before links (if any exists)
    formbag.uischema.elements.splice(pivButtonPos, 0, dividerElement, pivButton);
  }

  return formbag;
};
