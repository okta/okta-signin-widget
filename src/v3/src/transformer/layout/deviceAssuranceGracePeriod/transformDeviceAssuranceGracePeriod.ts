/*
 * Copyright (c) 2024-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { transactionMessageTransformer } from 'src/transformer/i18n';

import {
  ButtonElement,
  ButtonType,
  IdxStepTransformer,
  InfoboxElement,
  TitleElement,
} from '../../../types';
import { buildEndUserRemediationMessages, getLanguageCode, loc } from '../../../util';

export const transformDeviceAssuranceGracePeriod: IdxStepTransformer = ({
  formBag,
  transaction,
  widgetProps,
}) => {
  const { uischema } = formBag;
  const { messages = [] } = transaction;
  const languageCode = getLanguageCode(widgetProps);

  // Normally, the transactionMessageTransformer runs after this transformer, but buildEndUserRemediationMessages()
  // expects localized transaction messages so we have to call this transformer here.
  transactionMessageTransformer(transaction);

  const remediationMessages = buildEndUserRemediationMessages(messages, languageCode);

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('idx.device_assurance.grace_period.title', 'login') },
  };

  uischema.elements.push(titleElement);

  if (remediationMessages) {
    uischema.elements.push({
      type: 'InfoBox',
      options: {
        message: remediationMessages,
        class: 'WARNING',
        dataSe: 'callout',
      },
    } as InfoboxElement);
  }

  const continueButtonElement: ButtonElement = {
    type: 'Button',
    label: loc('idx.device_assurance.grace_period.continue_to_app', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  uischema.elements.push(continueButtonElement);

  return formBag;
};
