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

import { IdxActionParams } from '@okta/okta-auth-js';
import { loc } from 'okta';

import {
  ButtonType,
  IdxStepTransformer,
  ReminderElement,
  StepperButtonElement,
  StepperLayout,
  TitleElement,
  UISchemaElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { isAndroidOrIOS } from '../../util';
import { transformOktaVerifyChannelSelection } from './transformOktaVerifyChannelSelection';
import { appendDescriptionElements, createNavButtonConfig, getTitleKey } from './utils';

const REMINDER_CHANNELS = ['sms', 'email'];
const CHANNEL_TO_CTA_KEY: { [channel: string]: string } = {
  email: 'next.enroll.okta_verify.email.notReceived',
  sms: 'next.enroll.okta_verify.sms.notReceived',
};

export const transformOktaVerifyEnrollPoll: IdxStepTransformer = (
  transaction,
  formBag,
  widgetProps,
) => {
  const { context, availableSteps } = transaction;
  const { uischema, data } = formBag;
  const { authClient } = widgetProps;

  data['authenticator.channel'] = 'email';

  // TODO: OKTA-503490 temporary sln to access missing relatesTo obj
  const authenticator = context?.currentAuthenticator?.value;
  if (!authenticator) {
    return formBag;
  }
  const selectedChannel = authenticator.contextualData?.selectedChannel;
  const channelSelectionFormBag = transformOktaVerifyChannelSelection(
    transaction,
    formBag,
    widgetProps,
  );

  // Mobile devices cannot scan QR codes while navigating through flow
  // so we force them to select either email / sms for enrollment
  if (isAndroidOrIOS() && selectedChannel === 'qrcode') {
    return channelSelectionFormBag;
  }

  const stepOneElements: UISchemaElement[] = [];
  const resendStep = availableSteps?.find(({ name }) => name?.endsWith('resend'));
  if (transaction.nextStep.canResend
    && selectedChannel
    && REMINDER_CHANNELS.includes(selectedChannel) && resendStep) {
    const { name } = resendStep;
    stepOneElements.push({
      type: 'Reminder',
      options: {
        ctaText: loc(CHANNEL_TO_CTA_KEY[selectedChannel], 'login'),
        // @ts-ignore OKTA-512706 temporary until auth-js applies this fix
        action: (params?: IdxActionParams) => {
          const { stateHandle, ...rest } = params ?? {};
          return authClient?.idx.proceed({
            // @ts-ignore stateHandle can be undefined
            stateHandle,
            actions: [{ name, params: rest }],
          });
        },
      },
    } as ReminderElement);
  }

  stepOneElements.push({
    type: 'Title',
    options: {
      content: loc(getTitleKey(selectedChannel), 'login'),
    },
  } as TitleElement);

  appendDescriptionElements(stepOneElements, authenticator);

  const navBtnConfig = createNavButtonConfig(!!authenticator?.contextualData?.qrcode);
  stepOneElements.push({
    type: 'StepperButton',
    label: loc(navBtnConfig.navButtonsConfig.next.label, 'login'),
    options: {
      type: ButtonType.BUTTON,
      variant: navBtnConfig.navButtonsConfig.next.variant,
      nextStepIndex: 1,
    },
  } as StepperButtonElement);

  if (navBtnConfig.navButtonsConfig.prev) {
    channelSelectionFormBag.uischema.elements.push({
      type: 'StepperButton',
      label: loc(navBtnConfig.navButtonsConfig.prev.label, 'login'),
      options: {
        type: ButtonType.BUTTON,
        variant: navBtnConfig.navButtonsConfig.prev.variant,
        nextStepIndex: 0,
      },
    } as StepperButtonElement);
  }

  const stepper: StepperLayout = {
    type: UISchemaLayoutType.STEPPER,
    elements: [
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: stepOneElements,
      } as UISchemaLayout,
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [...channelSelectionFormBag.uischema.elements],
      } as UISchemaLayout,
    ],
  };

  // prepend
  uischema.elements.unshift(stepper);

  return formBag;
};
