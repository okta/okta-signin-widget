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

import { AUTHENTICATOR_KEY, IDX_STEP } from '../../constants';
import {
  IWidgetContext,
  LinkElement,
  TransformStepFnWithOptions,
} from '../../types';
import {
  getAuthenticatorKey,
  hasMinAuthenticatorOptions,
  loc,
  updateTransactionWithNextStep,
} from '../../util';
import TransformerMap from '../layout/idxTransformerMapping';

export const transformReturnToAuthenticatorListButton: TransformStepFnWithOptions = ({
  transaction,
  step,
}) => (
  formbag,
) => {
  const shouldAddButton = hasMinAuthenticatorOptions(
    transaction,
    IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
    0, // Min # of auth options for link to display
  );
  const authenticatorKey = getAuthenticatorKey(transaction) ?? AUTHENTICATOR_KEY.DEFAULT;
  const customTransformer = TransformerMap[step]?.[authenticatorKey];
  const shouldAddDefaultLink = customTransformer?.buttonConfig?.showReturnToAuthListLink ?? true;
  const selectEnrollStep = transaction.availableSteps
    ?.find(({ name }) => name === IDX_STEP.SELECT_AUTHENTICATOR_ENROLL);
  if (!shouldAddButton || !shouldAddDefaultLink || typeof selectEnrollStep === 'undefined') {
    return formbag;
  }

  const { name: stepName } = selectEnrollStep;
  const listLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('oie.enroll.switch.authenticator', 'login'),
      step: stepName,
      onClick: (widgetContext?: IWidgetContext): unknown => {
        if (typeof widgetContext === 'undefined') {
          return;
        }
        updateTransactionWithNextStep(transaction, selectEnrollStep, widgetContext);
      },
    },
  };
  formbag.uischema.elements.push(listLink);

  return formbag;
};
