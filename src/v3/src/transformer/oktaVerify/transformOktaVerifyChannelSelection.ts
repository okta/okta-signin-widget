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

import { loc } from 'okta';
import { IDX_STEP } from '../../constants';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  IdxStepTransformer,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { isAndroidOrIOS } from '../../util';
import { getUIElementWithName } from '../utils';

export const CHANNEL_SCOPE = '#/properties/authenticator/properties/channel';
const CHANNEL_TO_LABEL_KEY_MAP: { [channel: string]: string } = {
  qrcode: 'oie.enroll.okta_verify.select.channel.qrcode.label',
  email: 'oie.enroll.okta_verify.select.channel.email.label',
  sms: 'oie.enroll.okta_verify.select.channel.sms.label',
};

export const transformOktaVerifyChannelSelection: IdxStepTransformer = ({
  prevTransaction,
  formBag,
}) => {
  const { data, uischema } = formBag;

  const isAndroidOrIOSView = isAndroidOrIOS();
  // eslint-disable-next-line max-len
  const lastSelectedChannel = prevTransaction?.context.currentAuthenticator.value.contextualData?.selectedChannel as string;
  const elements: UISchemaElement[] = [];

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: isAndroidOrIOSView
        ? loc('oie.enroll.okta_verify.setup.title', 'login')
        : loc('oie.enroll.okta_verify.select.channel.title', 'login'),
    },
  };
  elements.push(titleElement);

  const channelSelectionElement = getUIElementWithName(
    'authenticator.channel',
    formBag.uischema.elements as UISchemaElement[],
  ) as FieldElement;
  channelSelectionElement.label = loc('oie.enroll.okta_verify.select.channel.description', 'login');
  channelSelectionElement.options.format = 'radio';
  const { options: { inputMeta: { options = [] } } } = channelSelectionElement;
  channelSelectionElement.options.customOptions = options
    .filter((opt) => opt.value !== lastSelectedChannel)
    .map((opt) => ({
      value: opt.value as string,
      label: loc(CHANNEL_TO_LABEL_KEY_MAP[opt.value as string], 'login'),
    }));
  elements.push(channelSelectionElement);

  data['authenticator.channel'] = channelSelectionElement.options.customOptions[0].value;

  const submitButton: ButtonElement = {
    type: 'Button',
    label: loc('oform.next', 'login'),
    scope: `#/properties/${ButtonType.SUBMIT}`,
    options: {
      type: ButtonType.SUBMIT,
      step: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
    },
  };
  elements.push(submitButton);

  if (!['email', 'sms'].includes(lastSelectedChannel)) {
    const switchChannelButton = {
      type: 'Button',
      label: loc('next.enroll.okta_verify.switch.channel.link.text', 'login'),
      options: {
        type: ButtonType.BUTTON,
        step: 'select-enrollment-channel',
        variant: 'secondary',
      },
    };
    elements.push(switchChannelButton);
  }

  uischema.elements = elements;

  return formBag;
};
