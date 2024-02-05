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

import { CHALLENGE_METHOD, IDX_STEP } from '../../../constants';
import {
  ChromeDtcContainerElement,
  DescriptionElement,
  IdxStepTransformer,
  IStepperContext,
  IWidgetContext,
  LinkElement,
  OpenOktaVerifyFPButtonElement,
  SpinnerElement,
  StepperNavigatorElement,
  TitleElement,
  UISchemaElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../../types';
import { hasMinAuthenticatorOptions, loc, updateTransactionWithNextStep } from '../../../util';

const getTitleText = (challengeMethod: string) => {
  switch (challengeMethod) {
    case CHALLENGE_METHOD.APP_LINK:
      return loc('appLink.title', 'login');

    case CHALLENGE_METHOD.CHROME_DTC:
      // reusing the existing message for Chrome DTC
      return loc('deviceTrust.sso.redirectText', 'login');

    case CHALLENGE_METHOD.CUSTOM_URI:
      return loc('customUri.title', 'login');

    case CHALLENGE_METHOD.UNIVERSAL_LINK:
      return loc('universalLink.title', 'login');

    default:
      return '';
  }
};

const getDescriptionText = (challengeMethod: string) => {
  switch (challengeMethod) {
    case CHALLENGE_METHOD.APP_LINK:
      return loc('appLink.content', 'login');

    case CHALLENGE_METHOD.CUSTOM_URI:
      return loc('customUri.required.content.prompt', 'login');

    case CHALLENGE_METHOD.UNIVERSAL_LINK:
      return loc('universalLink.content', 'login');

    default:
      return '';
  }
};

export const transformOktaVerifyDeviceChallengePoll: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
  const { nextStep = {} as NextStep } = transaction;
  const { uischema } = formBag;
  const FASTPASS_FALLBACK_SPINNER_TIMEOUT = 4000;

  const deviceChallengePayload = transaction.nextStep?.name === IDX_STEP.DEVICE_CHALLENGE_POLL
    ? transaction.nextStep?.relatesTo?.value
    // @ts-expect-error challenge is not defined on contextualData
    : transaction.nextStep?.relatesTo?.value?.contextualData?.challenge?.value;
  const { challengeMethod, href, downloadHref } = deviceChallengePayload;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: getTitleText(challengeMethod),
    },
  };

  const descriptionElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: getDescriptionText(challengeMethod),
    },
  };

  const spinnerElement = {
    type: 'Spinner',
  } as SpinnerElement;

  const openOktaVerifyButton: OpenOktaVerifyFPButtonElement = {
    type: 'OpenOktaVerifyFPButton',
    options: {
      step: nextStep.name,
      href,
      challengeMethod,
    },
  };

  const chromeDtcContainer: ChromeDtcContainerElement = {
    type: 'ChromeDtcContainer',
    options: {
      href,
    },
  };

  const cancelLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('goback', 'login'),
      isActionStep: true,
      step: 'cancel',
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
  const selectLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('oie.verification.switch.authenticator', 'login'),
      step: selectVerifyStep?.name || '',
      onClick: (widgetContext?: IWidgetContext): unknown => {
        if (typeof widgetContext === 'undefined' || typeof selectVerifyStep === 'undefined') {
          return;
        }
        updateTransactionWithNextStep(transaction, selectVerifyStep, widgetContext);
      },
    },
  };

  uischema.elements.unshift(titleElement);

  // if the current step is device-challenge-poll and the challenge method is APP_LINK,
  // we delay displaying the content because of a cold start issue with Okta Verify
  if (challengeMethod === CHALLENGE_METHOD.APP_LINK
      && nextStep?.name === IDX_STEP.DEVICE_CHALLENGE_POLL) {
    // this element changes the stepper layout index after a delay
    const stepperNavigatorElement: StepperNavigatorElement = {
      type: 'StepperNavigator',
      options: {
        callback: (stepperContext: IStepperContext) => {
          const { setStepIndex } = stepperContext;
          setTimeout(() => setStepIndex!(1), FASTPASS_FALLBACK_SPINNER_TIMEOUT);
        },
      },
    };
    uischema.elements.push({
      type: UISchemaLayoutType.STEPPER,
      elements: [
        {
          type: UISchemaLayoutType.VERTICAL,
          elements: [
            stepperNavigatorElement,
            spinnerElement,
            ...(selectVerifyStep && hasMinAuthOptions ? [selectLink] : []),
            // cancel polling link is displayed during delay
            {
              type: 'Link',
              contentType: 'footer',
              options: {
                label: loc('goback', 'login'),
                isActionStep: true,
                step: 'authenticatorChallenge-cancel',
                actionParams: {
                  reason: 'USER_CANCELED',
                  statusCode: null,
                },
              },
            } as LinkElement,
          ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 0 })),
        } as UISchemaLayout,
        {
          type: UISchemaLayoutType.VERTICAL,
          elements: [
            descriptionElement,
            openOktaVerifyButton,
            ...(selectVerifyStep && hasMinAuthOptions ? [selectLink] : []),
            // update footer link to standard cancel link
            cancelLink,
          ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 1 })),
        } as UISchemaLayout],
    });

    return formBag;
  }

  if ([
    CHALLENGE_METHOD.APP_LINK,
    CHALLENGE_METHOD.CHROME_DTC,
    CHALLENGE_METHOD.UNIVERSAL_LINK,
  ].includes(challengeMethod)) {
    uischema.elements.push(spinnerElement);
  }

  if ([
    CHALLENGE_METHOD.APP_LINK,
    CHALLENGE_METHOD.CUSTOM_URI,
    CHALLENGE_METHOD.UNIVERSAL_LINK,
  ].includes(challengeMethod)) {
    uischema.elements.push(descriptionElement);
    uischema.elements.push(openOktaVerifyButton);
  }

  if (challengeMethod === CHALLENGE_METHOD.CHROME_DTC) {
    uischema.elements.push(chromeDtcContainer);
  }

  if (challengeMethod === CHALLENGE_METHOD.CUSTOM_URI) {
    uischema.elements.push({
      type: 'Description',
      contentType: 'subtitle',
      options: { content: loc('customUri.required.content.download.title', 'login') },
    } as DescriptionElement);

    uischema.elements.push({
      type: 'Link',
      options: {
        label: loc('customUri.required.content.download.linkText', 'login'),
        href: downloadHref,
      },
    } as LinkElement);
  }

  if (selectVerifyStep && hasMinAuthOptions) {
    uischema.elements.push(selectLink);
  }
  // standard cancel link is used when there is no delay
  uischema.elements.push(cancelLink);

  return formBag;
};
