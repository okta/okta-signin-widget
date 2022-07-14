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

import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';

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
import { transformStepInputs } from '../field';
import { getUIElementWithName } from '../utils';

export const CHANNEL_SCOPE = '#/properties/authenticator/properties/channel';
const CHANNEL_TO_LABEL_KEY_MAP: { [channel: string]: string } = {
  qrcode: 'oie.enroll.okta_verify.select.channel.qrcode.label',
  email: 'oie.enroll.okta_verify.select.channel.email.label',
  sms: 'oie.enroll.okta_verify.select.channel.sms.label',
};

export const transformOktaVerifyChannelSelection: IdxStepTransformer = (transaction) => {
  const { context } = transaction;
  // TODO: OKTA-503490 temporary sln to access missing relatesTo obj
  const authenticator = context?.currentAuthenticator?.value;
  const selectedChannel = authenticator?.contextualData?.selectedChannel;
  const isAndroidOrIOSView = isAndroidOrIOS();

  const channelSelectionStep = transaction.availableSteps?.find(
    ({ name }) => name === IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
  );
  const formBag = transformStepInputs(channelSelectionStep);

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

  const channelSelectionElement = getUIElementWithName(
    'authenticator.channel',
    formBag.uischema.elements as UISchemaElement[],
  ) as FieldElement;
  if (channelSelectionElement) {
    channelSelectionElement.label = 'oie.enroll.okta_verify.select.channel.description';
    const { options: { inputMeta: { options = [] } } } = channelSelectionElement;
    const choices: IdxOption[] = options
      .filter(({ value }: IdxOption) => (isAndroidOrIOSView ? (value !== 'qrcode') : value !== selectedChannel))
      .map((opt: IdxOption) => ({
        value: opt.value as string,
        label: CHANNEL_TO_LABEL_KEY_MAP[opt.value as string],
      }));

    // Set the default value
    // formBag.data[channelSelectionElement.name] = choices[0].value;
    channelSelectionElement.options = {
      ...channelSelectionElement.options,
      format: 'radio',
      customOptions: choices,
      defaultOption: choices[0].value as string,
    };
  }

  formBag.uischema.elements.push({
    type: 'Button',
    label: 'oform.next',
    scope: `#/properties/${ButtonType.SUBMIT}`,
    options: {
      type: ButtonType.SUBMIT,
      step: channelSelectionStep!.name,
    },
  } as ButtonElement);

  return formBag;
};
