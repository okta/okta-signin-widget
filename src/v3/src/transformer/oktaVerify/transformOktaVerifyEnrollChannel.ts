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

import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  TitleElement,
  UISchemaElement,
} from '../../types';
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
  formBag,
}) => {
  const { context } = transaction;
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
      content: CHANNEL_TO_KEY_MAP.title[selectedChannel],
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
    options: {
      content: CHANNEL_TO_KEY_MAP.description[selectedChannel],
    },
  } as DescriptionElement);

  elements.push({
    type: 'Button',
    label: 'oie.enroll.okta_verify.setupLink',
    scope: '#/properties/setupLink',
    options: {
      type: ButtonType.SUBMIT,
    },
  } as ButtonElement);

  elements.push({
    type: 'Button',
    label: 'next.enroll.okta_verify.switch.channel.link.text',
    options: {
      type: ButtonType.BUTTON,
      variant: 'secondary',
      step: 'select-enrollment-channel',
      stepToRender: 'select-enrollment-channel',
    },
  } as ButtonElement);

  uischema.elements = elements;

  return formBag;
};
