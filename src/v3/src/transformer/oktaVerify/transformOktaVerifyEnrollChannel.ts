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

import merge from 'lodash/merge';

import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  StepperButtonElement,
  StepperLayout,
  TitleElement,
  UISchemaElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { getUIElementWithName, removeUIElementWithName } from '../utils';
import { transformOktaVerifyChannelSelection } from './transformOktaVerifyChannelSelection';

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

export const transformOktaVerifyEnrollChannel: IdxStepTransformer = (
  transaction,
  formBag,
  widgetProps,
) => {
  const { context } = transaction;
  // TODO: OKTA-503490 temporary sln access missing relatesTo obj
  const authenticator = context?.currentAuthenticator?.value;
  if (!authenticator) {
    return formBag;
  }
  const { uischema } = formBag;
  const selectedChannel = authenticator.contextualData?.selectedChannel;
  if (!selectedChannel) {
    return formBag;
  }

  const stepOneElements: UISchemaElement[] = [];
  stepOneElements.push({
    type: 'Title',
    options: {
      content: CHANNEL_TO_KEY_MAP.title[selectedChannel],
    },
  } as TitleElement);

  CHANNELS.forEach((channelName) => {
    const element = getUIElementWithName(
      channelName,
      formBag.uischema.elements as UISchemaElement[],
    );
    if (element) {
      stepOneElements.push(element);

      uischema.elements = removeUIElementWithName(
        channelName,
        formBag.uischema.elements as UISchemaElement[],
      );
    }
  });

  stepOneElements.push({
    type: 'Description',
    options: {
      content: CHANNEL_TO_KEY_MAP.description[selectedChannel],
    },
  } as DescriptionElement);

  stepOneElements.push({
    type: 'Button',
    label: 'oie.enroll.okta_verify.setupLink',
    scope: '#/properties/setupLink',
    options: {
      type: ButtonType.SUBMIT,
    },
  } as ButtonElement);

  stepOneElements.push({
    type: 'StepperButton',
    label: 'next.enroll.okta_verify.switch.channel.link.text',
    options: {
      variant: 'secondary',
      nextStepIndex: 1,
    },
  } as StepperButtonElement);

  const channelSelectionFormBag = transformOktaVerifyChannelSelection(
    transaction,
    formBag,
    widgetProps,
  );
  merge(formBag.schema, channelSelectionFormBag.schema);

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
