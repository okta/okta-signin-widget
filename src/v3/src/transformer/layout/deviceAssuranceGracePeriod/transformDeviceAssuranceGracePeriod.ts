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

import { h } from 'preact';
import WidgetMessageContainer from 'src/components/WidgetMessageContainer';

import {
  ButtonElement,
  ButtonType,
  IdxStepTransformer,
  InfoboxElement,
  TitleElement,
  ViewElement,
} from '../../../types';
import { buildEndUserRemediationMessages, getLinkReplacerFn, loc } from '../../../util';

export const transformDeviceAssuranceGracePeriod: IdxStepTransformer = ({
  formBag,
  transaction,
}) => {
  const { uischema } = formBag;
  const { messages = [] } = transaction;
  const warningMessage = messages.find((message) => message?.class === 'WARNING');
  const errorMessages = messages.filter((message) => message.class === 'ERROR');

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('idx.device_assurance.grace_period.title', 'login') },
  };

  uischema.elements.push(titleElement);

  if (warningMessage) {
    warningMessage.message = `<strong>${warningMessage.message}</strong>`;
    uischema.elements.push({
      type: 'InfoBox',
      options: {
        message: { ...warningMessage },
        class: 'WARNING',
        dataSe: 'callout',
      },
    } as InfoboxElement);
  }

  const remediationMessages = buildEndUserRemediationMessages(errorMessages);
  const remediationMessagesElements: ViewElement[] = remediationMessages?.map((msg) => ({
    type: 'View',
    options: {
      component: h(WidgetMessageContainer, {
        key: msg.message,
        message: msg,
        parserOptions: { replace: getLinkReplacerFn({} ) },
      }),
    },
  } as ViewElement)) ?? [];

  const continueButtonElement: ButtonElement = {
    type: 'Button',
    label: loc('idx.device_assurance.grace_period.continue_to_app', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  uischema.elements.push(...remediationMessagesElements, continueButtonElement);

  return formBag;
};
