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

import { Layout, UISchemaElement } from '@jsonforms/core';
import merge from 'lodash/merge';

import {
  IdxStepTransformer,
  LayoutType,
  ReminderElement,
  StepperLayout,
} from '../../types';
import { isAndroidOrIOS } from '../../util';
import { getCurrentTimestamp } from '../utils';
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
  const { nextStep: { authenticator } } = transaction;
  const { uischema } = formBag;

  const selectedChannel = authenticator?.contextualData?.selectedChannel ?? '';
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

  merge(formBag.schema, channelSelectionFormBag.schema);

  const stepOneElements: UISchemaElement[] = [];
  if (transaction.nextStep.canResend && REMINDER_CHANNELS.includes(selectedChannel)) {
    stepOneElements.push({
      type: 'Reminder',
      options: {
        ctaText: CHANNEL_TO_CTA_KEY[selectedChannel],
      },
    } as ReminderElement);
  }

  stepOneElements.push({
    type: 'Title',
    options: {
      content: getTitleKey(selectedChannel),
    },
  });

  appendDescriptionElements(stepOneElements, authenticator);

  const stepper: StepperLayout = {
    type: LayoutType.STEPPER,
    elements: [
      {
        type: LayoutType.VERTICAL,
        elements: stepOneElements,
      } as Layout,
      {
        type: LayoutType.VERTICAL,
        elements: [...channelSelectionFormBag.uischema.elements],
      } as Layout,
    ],
    options: {
      key: `${getCurrentTimestamp()}-${selectedChannel}`,
      ...createNavButtonConfig(!!authenticator?.contextualData?.qrcode),
    },
  };

  // prepend
  uischema.elements.unshift(stepper);

  return formBag;
};
