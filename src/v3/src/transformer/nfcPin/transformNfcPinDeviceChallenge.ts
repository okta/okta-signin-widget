/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { CHALLENGE_METHOD, IDX_STEP } from '../../constants';
import {
  DescriptionElement,
  IdxStepTransformer,
  IWidgetContext,
  LinkElement,
  OpenOktaVerifyFPButtonElement,
  TitleElement,
} from '../../types';
import { hasMinAuthenticatorOptions, loc, updateTransactionWithNextStep } from '../../util';
import { transformOktaVerifyFPLoopbackPoll } from '../layout/oktaVerify';

const getTitle = (challengeMethod: string): string => {
  switch (challengeMethod) {
    case 'APP_LINK':
      return loc('appLink.title', 'login');
    case 'UNIVERSAL_LINK':
      return loc('universalLink.title', 'login');
    case 'CUSTOM_URI':
    default:
      return loc('customUri.title', 'login');
  }
};

const getDescription = (challengeMethod: string): string => {
  switch (challengeMethod) {
    case 'APP_LINK':
      return loc('appLink.content', 'login');
    case 'UNIVERSAL_LINK':
      return loc('universalLink.content', 'login');
    case 'CUSTOM_URI':
    default:
      return loc('customUri.required.content.prompt', 'login');
  }
};

/**
 * NFC PIN device challenge transformer.
 * Matches FastPass CUSTOM_URI behavior: auto-launches OV on mount,
 * shows "Click Open Okta Verify on the browser prompt" screen.
 */
export const transformNfcPinDeviceChallenge: IdxStepTransformer = (params) => {
  const { transaction, formBag } = params;
  const { uischema } = formBag;

  // @ts-expect-error contextualData is not fully typed
  const challengeData = transaction.nextStep?.relatesTo?.value?.contextualData?.challenge?.value ?? {};
  const { challengeMethod, href, downloadHref } = challengeData;

  // Reuse FastPass loopback transformer for LOOPBACK challenge method
  if (challengeMethod === CHALLENGE_METHOD.LOOPBACK) {
    return transformOktaVerifyFPLoopbackPoll(params);
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: getTitle(challengeMethod) },
  };

  const descriptionElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: { content: getDescription(challengeMethod) },
  };

  const openOktaVerifyButton: OpenOktaVerifyFPButtonElement = {
    type: 'OpenOktaVerifyFPButton',
    options: {
      step: transaction.nextStep!.name,
      href,
      challengeMethod,
    },
  };

  const downloadTitle: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: { content: loc('customUri.required.content.download.title', 'login') },
  };

  const downloadLink: LinkElement = {
    type: 'Link',
    options: {
      label: loc('customUri.required.content.download.linkText', 'login'),
      href: downloadHref,
      step: '',
    },
  };

  const hasMinAuthOptions = hasMinAuthenticatorOptions(
    transaction,
    IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    1,
  );
  const selectVerifyStep = transaction.availableSteps
    ?.find(({ name }) => name === IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE);
  const selectLink: LinkElement | undefined = (selectVerifyStep && hasMinAuthOptions) ? {
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
  } : undefined;

  const cancelLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('goback', 'login'),
      isActionStep: true,
      step: 'cancel',
    },
  };

  uischema.elements = [
    titleElement,
    descriptionElement,
    openOktaVerifyButton,
    downloadTitle,
    downloadLink,
    ...(selectLink ? [selectLink] : []),
    cancelLink,
  ];

  return formBag;
};
