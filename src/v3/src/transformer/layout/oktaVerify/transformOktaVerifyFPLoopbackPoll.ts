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
  ActionPendingElement,
  ButtonType,
  IdxStepTransformer,
  InfoboxElement,
  IWidgetContext,
  LinkElement,
  LoopbackProbeElement,
  StepperButtonElement,
  StepperLayout,
  TitleElement,
  UISchemaElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../../types';
import { hasMinAuthenticatorOptions, loc, updateTransactionWithNextStep } from '../../../util';

const getChromeLnaPermissionState = async (
  onPermissionChange: (currentPermissionState?: PermissionState, initialPermissionState?: PermissionState) => void,
) => {
  try {
    const result = await navigator.permissions.query({ name: 'local-network-access' as any });
    const initialState = result.state;
    
    // Call the callback once initially to handle the initial state
    onPermissionChange(result.state, initialState);

    // Listen for future permission changes
    const handlePermissionChange = () => {
      // We should only initiate loopback if the permission state is granted and started as granted
      // Otherwise, we will trigger loopback directly from the error callout screens, which is unexpected UX
      onPermissionChange(result.state, initialState);
    };
    
    result.addEventListener('change', handlePermissionChange);
  } catch (error) {
    onPermissionChange();
  }
};

export const transformOktaVerifyFPLoopbackPoll: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
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
      content: loc('chrome.lna.fast.pass.requires.permission.title', 'login')
    }
  }

  const cancelStep = transaction.nextStep?.name === IDX_STEP.DEVICE_CHALLENGE_POLL
    ? 'authenticatorChallenge-cancel' : 'currentAuthenticator-cancel';
  const deviceChallengePayload = transaction.nextStep?.name === IDX_STEP.DEVICE_CHALLENGE_POLL
    ? transaction.nextStep?.relatesTo?.value
    // @ts-expect-error challenge is not defined on contextualData
    : transaction.nextStep?.relatesTo?.value?.contextualData?.challenge?.value;

  const loopbackProbeElement: LoopbackProbeElement = {
    type: 'LoopbackProbe',
    options: {
      deviceChallengePayload,
      cancelStep,
      step: transaction.nextStep?.name!,
    }
  };

  const infoCallout: InfoboxElement = {
    type: 'InfoBox',
    options: {
      message: [
        {
          title: loc('chrome.lna.prompt.title', 'login'),
          message: loc('chrome.lna.prompt.description.part1', 'login'),
        },
        {
          message: loc('chrome.lna.prompt.description.part2', 'login'),
        },
        {
          message: loc(
            'chrome.lna.prompt.description.learn.more',
            'login',
            undefined,
            {
              $1: { element: 'a', attributes: { href: 'https://developer.chrome.com/blog/local-network-access', target: '_blank', rel: 'noopener noreferrer' } },
            },
          )
        },
      ],
      class: 'INFO'
    }
  };

  const errorCallout: InfoboxElement = {
    type: 'InfoBox',
    options: {
      message: [
        {
          title: loc('chrome.lna.error.title', 'login'),
          message: loc('chrome.lna.error.description.part1', 'login'),
        },
        {
          message: loc('chrome.lna.error.description.part2', 'login'),
        },
        {
          message: loc(
            'chrome.lna.error.description.more.information',
            'login',
            undefined,
            {
              $1: { element: 'a', attributes: { href: 'https://developer.chrome.com/blog/local-network-access', target: '_blank', rel: 'noopener noreferrer' } },
            },
          )
        }
      ],
      class: 'ERROR'
    }
  };
  
  const consentButton: StepperButtonElement = {
    type: 'StepperButton',
    label: loc('chrome.lna.open.prompt.label', 'login'),
    options: {
      type: ButtonType.BUTTON,
      variant: 'primary',
      nextStepIndex: 1,
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
  ]

  const loopbackProbeElements: UISchemaLayout["elements"] = [
    actionPendingElement,
    loopbackProbeElement,
    ...linkElements
  ];

  const infoCalloutElements: UISchemaLayout["elements"] = [
    oktaFPRequiresPermissionTitleElement,
    infoCallout,
    consentButton,
    ...linkElements
  ];

  const errorCalloutElements: UISchemaLayout["elements"] = [
    oktaFPRequiresPermissionTitleElement,
    errorCallout,
    ...linkElements
  ];

  getChromeLnaPermissionState((permissionState, initialPermissionState) => {
    uischema.elements = [];
    if (permissionState) {
      if (initialPermissionState === 'prompt') {
        const stepper: StepperLayout = {
          type: UISchemaLayoutType.STEPPER,
          elements: [
            {
              type: UISchemaLayoutType.VERTICAL,
              elements: infoCalloutElements.map((ele: UISchemaElement) => ({ ...ele, viewIndex: 0 })),
            } as UISchemaLayout,
            {
              type: UISchemaLayoutType.VERTICAL,
              elements: loopbackProbeElements
              .map((ele: UISchemaElement) => ({ ...ele, viewIndex: 1 })),
            } as UISchemaLayout,
          ],
        };
        uischema.elements.push(stepper);
      } else if (initialPermissionState === 'granted') {
        uischema.elements = loopbackProbeElements;
      } else if (initialPermissionState === 'denied') {
        uischema.elements = errorCalloutElements;
      }
    } else {
      uischema.elements = loopbackProbeElements;
    }
  });

  return formBag;
};
