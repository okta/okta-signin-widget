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

import { Layout } from '@jsonforms/core';
import {
  IdxMessage,
  IdxTransaction,
} from '@okta/okta-auth-js';

import { TERMINAL_KEY } from '../../constants';
import {
  DescriptionElement,
  FormBag,
  InfoboxElement,
  MessageType,
  MessageTypeVariant,
  Modify,
} from '../../types';
import { containsMessageKey } from '../../util';

type TerminalKeyTransformer = (transaction: IdxTransaction, formBag: FormBag) => FormBag;
type ModifiedIdxMessage = Modify<IdxMessage, {
  class?: string;
  i18n?: {
    key: string;
    params?: unknown[];
  };
}>;

const appendMessageElements = (uischema: Layout, messages: IdxMessage[]): void => {
  messages.forEach((message) => {
    if (!message.class || message.class === MessageType.INFO) {
      const messageElement: DescriptionElement = {
        type: 'Description',
        options: { content: message.message },
      };
      uischema.elements.push(messageElement);
    } else {
      const infoBoxElement: InfoboxElement = {
        type: 'InfoBox',
        options: {
          message: message.message,
          class: MessageTypeVariant[message.class as MessageType] ?? MessageTypeVariant.WARNING,
          contentType: 'string',
        },
      };
      uischema.elements.push(infoBoxElement);
    }
  });
};

export const transformTerminalMessages: TerminalKeyTransformer = (transaction, formBag) => {
  const { messages } = transaction;
  const { uischema } = formBag;

  if (transaction.error) {
    uischema.elements.push({
      type: 'InfoBox',
      options: {
        message: 'oform.error.unexpected',
        class: MessageTypeVariant.ERROR,
        contentType: 'string',
      },
    });
    return formBag;
  }

  if (!messages?.length) {
    // N/A for this transformer
    return formBag;
  }

  const displayedMessages: ModifiedIdxMessage[] = messages;

  if (containsMessageKey(TERMINAL_KEY.OPERATION_CANCELED_ON_OTHER_DEVICE_KEY, messages)) {
    displayedMessages[0].message = 'idx.operation.cancelled.on.other.device';
    displayedMessages.push({ message: 'oie.consent.enduser.deny.description' });
  } else if (containsMessageKey(TERMINAL_KEY.UNLOCK_ACCOUNT_KEY, messages)) {
    displayedMessages[0].message = TERMINAL_KEY.UNLOCK_ACCOUNT_KEY;
  } else if (containsMessageKey(TERMINAL_KEY.RETURN_TO_ORIGINAL_TAB_KEY, messages)) {
    displayedMessages[0].message = 'oie.consent.enduser.email.allow.description';
    displayedMessages.push({ message: 'oie.return.to.original.tab' });
  } else if (containsMessageKey(TERMINAL_KEY.TOO_MANY_REQUESTS, messages)) {
    displayedMessages[0].message = 'oie.tooManyRequests';
  } else if (containsMessageKey(TERMINAL_KEY.RETURN_LINK_EXPIRED_KEY, messages)) {
    displayedMessages[0].class = 'ERROR';
  } else if (containsMessageKey(TERMINAL_KEY.IDX_RETURN_LINK_OTP_ONLY, messages)) {
    // TODO: Build OTP Magic link Only View OKTA-491061
  }

  appendMessageElements(uischema, messages);

  return formBag;
};
