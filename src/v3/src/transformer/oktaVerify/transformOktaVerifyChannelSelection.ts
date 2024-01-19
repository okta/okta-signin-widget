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
  FieldElement,
  IdxStepTransformer,
  TextWithActionLinkElement,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { isAndroidOrIOS, loc } from '../../util';
import { getUIElementWithName } from '../utils';

const CHANNEL_TO_LABEL_KEY_MAP: { [channel: string]: string } = {
  qrcode: 'oie.enroll.okta_verify.select.channel.qrcode.label',
  email: 'oie.enroll.okta_verify.select.channel.email.label',
  sms: 'oie.enroll.okta_verify.select.channel.sms.label',
};

export const transformOktaVerifyChannelSelection: IdxStepTransformer = ({
  prevTransaction,
  transaction,
  widgetProps,
  formBag,
}) => {
  const { context } = prevTransaction || {};
  const { context: currentTransactionContext } = transaction;
  const { data, uischema } = formBag;

  const isAndroidOrIOSView = isAndroidOrIOS();
  // Checking first if it's in the prev transaction otherwise, pulling from the current
  // transaction (it has to be in one or the other)
  const lastSelectedChannel = (
    context?.currentAuthenticator?.value?.contextualData?.selectedChannel
    || currentTransactionContext?.currentAuthenticator?.value?.contextualData?.selectedChannel
  ) as string;
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
    options: {
      type: ButtonType.SUBMIT,
      step: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
    },
  };
  elements.push(submitButton);

  const { features: { sameDeviceOVEnrollmentEnabled = false } = {} } = widgetProps;
  if (!sameDeviceOVEnrollmentEnabled && !['email', 'sms'].includes(lastSelectedChannel)) {
    const switchChannelTextLink: TextWithActionLinkElement = {
      type: 'TextWithActionLink',
      options: {
        content: loc('oie.enroll.okta_verify.switch.channel.link.text', 'login'),
        contentClassname: 'switch-channel-link',
        step: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
      },
    };
    elements.push(switchChannelTextLink);
  }

  uischema.elements = elements;

  return formBag;
};
