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

import { ControlElement } from '@jsonforms/core';

import { IDX_STEP } from '../../constants';
import {
  Choice,
  IdxStepTransformer,
  TitleElement,
} from '../../types';
import { isAndroidOrIOS } from '../../util';
import { ButtonOptionType } from '../getButtonControls';
import { transformStep } from '../step';
import { getUIElementWithScope, removeUIElementWithScope } from '../utils';

export const CHANNEL_SCOPE = '#/properties/authenticator/properties/channel';
const CHANNEL_TO_LABEL_KEY_MAP: { [channel: string]: string } = {
  qrcode: 'oie.enroll.okta_verify.select.channel.qrcode.label',
  email: 'oie.enroll.okta_verify.select.channel.email.label',
  sms: 'oie.enroll.okta_verify.select.channel.sms.label',
};

// TODO: OKTA-499556 - OV enrollment is not working, need auth-js ticket completed first
export const transformOktaVerifyChannelSelection: IdxStepTransformer = (transaction) => {
  const { nextStep: { authenticator } } = transaction;
  const selectedChannel = authenticator?.contextualData?.selectedChannel;
  const isAndroidOrIOSView = isAndroidOrIOS();

  const channelSelectionStep = transaction.availableSteps?.find(
    ({ name }) => name === IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
  );
  const formBag = transformStep(channelSelectionStep);

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: isAndroidOrIOSView
        ? 'oie.enroll.okta_verify.setup.title'
        : 'oie.enroll.okta_verify.select.channel.title',
    },
  };

  // Title should be first element
  formBag.uischema.elements.unshift(titleElement);

  formBag.uischema.elements = removeUIElementWithScope(
    CHANNEL_SCOPE,
    formBag.uischema.elements as ControlElement[],
  );
  const idElement = getUIElementWithScope(
    '#/properties/authenticator/properties/id',
    formBag.uischema.elements as ControlElement[],
  );
  if (idElement) {
    idElement.options = {
      ...idElement.options,
      type: 'hidden',
    };
  }

  if (channelSelectionStep?.options) {
    const choices = channelSelectionStep.options
      .filter(({ value }) => (isAndroidOrIOSView ? (value !== 'qrcode') : value !== selectedChannel))
      .map((opt) => ({
        key: opt.value,
        value: CHANNEL_TO_LABEL_KEY_MAP[opt.value as string],
      } as Choice));
    formBag.uischema.elements.push({
      type: 'Control',
      label: 'oie.enroll.okta_verify.select.channel.description',
      scope: CHANNEL_SCOPE,
      options: {
        format: 'radio',
        optionalLabel: !isAndroidOrIOSView && 'optional',
        choices,
      },
    } as ControlElement);
  }

  formBag.uischema.elements.push({
    type: 'Control',
    label: 'oform.next',
    scope: `#/properties/${ButtonOptionType.SUBMIT}`,
    options: {
      format: 'button',
      type: ButtonOptionType.SUBMIT,
    },
  } as ControlElement);

  return formBag;
};
