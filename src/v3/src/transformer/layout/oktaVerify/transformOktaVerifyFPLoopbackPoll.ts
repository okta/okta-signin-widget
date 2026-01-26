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

import { NextStep } from '@okta/okta-auth-js';

import { ChromeLNADeniedError } from '../../../../../util/Errors';
import { IDX_STEP } from '../../../constants';
import {
  ActionPendingElement,
  DeviceChallengePayload,
  IdxStepTransformer,
  InfoboxElement,
  IWidgetContext,
  LinkElement,
  LoopbackProbeElement,
  TitleElement,
  UISchemaLayout,
} from '../../../types';
import {
  getChromeLNAPermissionState,
  hasMinAuthenticatorOptions,
  loc,
  updateTransactionWithNextStep,
} from '../../../util';

export const transformOktaVerifyFPLoopbackPoll: IdxStepTransformer = ({
  prevTransaction,
  transaction,
  formBag,
}) => {
  const { nextStep: { name: prevStepName } = {} as NextStep } = prevTransaction ?? {};
  // If there is no previous transaction, it is a silent probe triggered by the registered condition
  const isRegisteredConditionSilentProbe = prevStepName === undefined;
  const { uischema } = formBag;

  const actionPendingElement: ActionPendingElement = {
    type: 'ActionPending',
    options: {
      content: loc('deviceTrust.sso.redirectText', 'login'),
    },
  };

  const oktaFPRequiresPermissionTitleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('chrome.lna.fastpass.requires.permission.title', 'login'),
    },
  };

  const cancelStep = transaction.nextStep?.name === IDX_STEP.DEVICE_CHALLENGE_POLL
    ? 'authenticatorChallenge-cancel' : 'currentAuthenticator-cancel';
  const deviceChallengePayload: DeviceChallengePayload = transaction.nextStep?.name
    === IDX_STEP.DEVICE_CHALLENGE_POLL
    ? transaction.nextStep?.relatesTo?.value
    // @ts-expect-error challenge is not defined on contextualData
    : transaction.nextStep?.relatesTo?.value?.contextualData?.challenge?.value;

  const { chromeLocalNetworkAccessDetails } = deviceChallengePayload;

  const errorCallout: InfoboxElement = {
    type: 'InfoBox',
    options: {
      message: [
        {
          title: loc('chrome.lna.error.title', 'login'),
          message: loc('chrome.lna.error.description.intro', 'login'),
        },
        {
          options: [
            {
              type: 'text',
              label: loc('chrome.lna.error.description.step1', 'login'),
            },
            {
              type: 'text',
              label: loc('chrome.lna.error.description.step2', 'login'),
            },
            {
              type: 'text',
              label: loc('chrome.lna.error.description.step3', 'login'),
            },
          ],
          listStyleType: 'decimal',
        },
        {
          message: loc(
            'chrome.lna.error.description.more.information',
            'login',
            undefined,
            {
              $1: {
                element: 'a',
                attributes: {
                  href: chromeLocalNetworkAccessDetails?.chromeLNAHelpLink,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                },
              },
            },
          ),
        },
      ],
      class: 'ERROR',
    },
  };

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

  // Since this transformer is shared, we have to add applicable buttons manually
  const hasMinAuthOptions = hasMinAuthenticatorOptions(
    transaction,
    IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    1, // Min # of auth options for link to display
  );
  const selectVerifyStep = transaction.availableSteps
    ?.find(({ name }) => name === IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE);
  let selectLink: LinkElement | undefined;
  if (selectVerifyStep && hasMinAuthOptions) {
    selectLink = {
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
  }

  const linkElements: LinkElement[] = [
    ...(selectLink ? [selectLink] : []),
    cancelLink,
  ];

  const loopbackProbeElement : LoopbackProbeElement = {
    type: 'LoopbackProbe',
    options: {
      deviceChallengePayload,
      cancelStep,
      step: transaction.nextStep?.name,
    },
  } as LoopbackProbeElement;

  const loopbackProbeElements: UISchemaLayout['elements'] = [
    actionPendingElement,
    loopbackProbeElement,
    ...linkElements,
  ];

  const chromeLNAErrorCalloutElements: UISchemaLayout['elements'] = [
    oktaFPRequiresPermissionTitleElement,
    errorCallout,
    ...linkElements,
  ];

  if (chromeLocalNetworkAccessDetails) {
    getChromeLNAPermissionState((currPermissionState) => {
      switch (currPermissionState) {
        case 'prompt':
          uischema.elements = loopbackProbeElements;
          break;
        case 'granted':
          uischema.elements = loopbackProbeElements;
          break;
        case 'denied':
          if (isRegisteredConditionSilentProbe) {
            uischema.elements = loopbackProbeElements;
          } else {
            uischema.elements = chromeLNAErrorCalloutElements;
            // Log error for Sentry monitoring
            throw new ChromeLNADeniedError('Chrome Local Network Access permission was denied for FastPass.');
          }
          break;
        default:
          uischema.elements = loopbackProbeElements;
          break;
      }
    });
  } else {
    uischema.elements = loopbackProbeElements;
  }

  return formBag;
};
