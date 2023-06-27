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

import { IDX_STEP } from '../../../constants';
import {
  IdxStepTransformer,
  IWidgetContext,
  LinkElement,
  LoopbackProbeElement,
  SpinnerElement,
  TitleElement,
} from '../../../types';
import { hasMinAuthenticatorOptions, loc, updateTransactionWithNextStep } from '../../../util';

export const transformOktaVerifyFPLoopbackPoll: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
  const { uischema } = formBag;

  uischema.elements.unshift({
    type: 'Title',
    options: { content: loc('deviceTrust.sso.redirectText', 'login') },
  } as TitleElement);

  uischema.elements.push({
    type: 'Spinner',
  } as SpinnerElement);

  const cancelStep = transaction.nextStep?.name === IDX_STEP.DEVICE_CHALLENGE_POLL
    ? 'authenticatorChallenge-cancel' : 'currentAuthenticator-cancel';
  const deviceChallengePayload = transaction.nextStep?.name === IDX_STEP.DEVICE_CHALLENGE_POLL
    ? transaction.nextStep?.relatesTo?.value
    // @ts-expect-error challenge is not defined on contextualData
    : transaction.nextStep?.relatesTo?.value?.contextualData?.challenge?.value;

  uischema.elements.push({
    type: 'LoopbackProbe',
    options: {
      deviceChallengePayload,
      cancelStep,
      step: transaction.nextStep?.name,
    },
  } as LoopbackProbeElement);

  // Since this transformer is shared, we have to add applicable buttons manually
  const hasMinAuthOptions = hasMinAuthenticatorOptions(
    transaction,
    IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    1, // Min # of auth options for link to display
  );
  const selectVerifyStep = transaction.availableSteps
    ?.find(({ name }) => name === IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE);
  if (selectVerifyStep && hasMinAuthOptions) {
    const selectLink: LinkElement = {
      type: 'Link',
      contentType: 'footer',
      options: {
        label: loc('oie.verification.switch.authenticator', 'login'),
        step: selectVerifyStep.name,
        onClick: (widgetContext?: IWidgetContext): unknown => {
          if (typeof widgetContext === 'undefined') {
            return;
          }
          updateTransactionWithNextStep(transaction, selectVerifyStep, widgetContext);
        },
      },
    };
    uischema.elements.push(selectLink);
  }

  const cancelLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('goback', 'login'),
      isActionStep: true,
      step: cancelStep,
      actionParams: {
        reason: 'USER_CANCELED',
        statusCode: null,
      },
    },
  };
  uischema.elements.push(cancelLink);

  return formBag;
};
