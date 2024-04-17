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

import { IDX_STEP } from '../../constants';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  TextWithActionLinkElement,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { loc } from '../../util';
import { getUIElementWithName } from '../utils';

const CHANNELS = ['phoneNumber', 'email'];
const CHANNEL_TO_KEY_MAP: {
  title: { [channel: string]: string },
  description: { [channel: string]: string },
} = {
  description: {
    email: 'oie.enroll.okta_verify.channel.email.description',
    sms: 'oie.enroll.okta_verify.channel.sms.description',
  },
  title: {
    email: 'oie.enroll.okta_verify.enroll.channel.email.title',
    sms: 'oie.enroll.okta_verify.enroll.channel.sms.title',
  },
};

export const transformOktaVerifyEnrollChannel: IdxStepTransformer = ({
  transaction,
  widgetProps,
  formBag,
}) => {
  const { context, nextStep: { name } = {} } = transaction;
  const authenticator = context.currentAuthenticator.value;
  const { uischema } = formBag;
  const selectedChannel = authenticator.contextualData?.selectedChannel;
  if (!selectedChannel) {
    return formBag;
  }

  const elements: UISchemaElement[] = [];

  elements.push({
    type: 'Title',
    options: {
      content: loc(CHANNEL_TO_KEY_MAP.title[selectedChannel], 'login'),
    },
  } as TitleElement);

  CHANNELS.forEach((channelName) => {
    const element = getUIElementWithName(
      channelName,
      uischema.elements as UISchemaElement[],
    );
    if (element) {
      elements.push(element);
    }
  });

  elements.push({
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc(CHANNEL_TO_KEY_MAP.description[selectedChannel], 'login'),
    },
  } as DescriptionElement);

  elements.push({
    type: 'Button',
    label: loc('oie.enroll.okta_verify.setupLink', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: name,
    },
  } as ButtonElement);

  const { features: { sameDeviceOVEnrollmentEnabled = false } = {} } = widgetProps;
  if (!sameDeviceOVEnrollmentEnabled) {
    const switchChannelLink: TextWithActionLinkElement = {
      type: 'TextWithActionLink',
      options: {
        content: loc('oie.enroll.okta_verify.switch.channel.link.text', 'login'),
        contentClassname: 'switch-channel-link',
        step: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
        stepToRender: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
      },
    };
    elements.push(switchChannelLink);
  }

  uischema.elements = elements;

  return formBag;
};
