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

import { Layout, UISchemaElement } from '@jsonforms/core';
import { APIError, IdxMessage, IdxTransaction } from '@okta/okta-auth-js';

import { TERMINAL_KEYS } from '../../constants';
import {
  DescriptionElement,
  FormBag,
  MessageType,
  MessageTypeVariant,
  Modify,
} from '../../types';
import { containsTerminalKey } from '../../util';

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
      const infoBoxElement: UISchemaElement = {
        type: 'InfoBox',
        options: {
          message: message.message,
          class: MessageTypeVariant[message.class as MessageType] ?? MessageTypeVariant.WARNING,
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
    const infoBoxElement: UISchemaElement = {
      type: 'InfoBox',
      options: {
        message: (transaction.error as APIError)?.errorSummary,
        class: MessageTypeVariant.ERROR,
      },
    };
    uischema.elements.push(infoBoxElement);
    // If API error, display
    return formBag;
  }

  if (!messages?.length) {
    // N/A for this transformer
    return formBag;
  }

  const displayedMessages: ModifiedIdxMessage[] = messages;

  if (containsTerminalKey(TERMINAL_KEYS.OPERATION_CANCELED_ON_OTHER_DEVICE_KEY, messages)) {
    displayedMessages[0].message = 'idx.operation.cancelled.on.other.device';
    displayedMessages.push({ message: 'oie.consent.enduser.deny.description' });
  } else if (containsTerminalKey(TERMINAL_KEYS.UNLOCK_ACCOUNT_KEY, messages)) {
    displayedMessages[0].message = TERMINAL_KEYS.UNLOCK_ACCOUNT_KEY;
  } else if (containsTerminalKey(TERMINAL_KEYS.RETURN_TO_ORIGINAL_TAB_KEY, messages)) {
    displayedMessages[0].message = 'oie.consent.enduser.email.allow.description';
    displayedMessages.push({ message: 'oie.return.to.original.tab' });
  } else if (containsTerminalKey(TERMINAL_KEYS.TOO_MANY_REQUESTS, messages)) {
    displayedMessages[0].message = 'oie.tooManyRequests';
  } else if (containsTerminalKey(TERMINAL_KEYS.RETURN_LINK_EXPIRED_KEY, messages)) {
    displayedMessages[0].class = 'ERROR';
  } else if (containsTerminalKey(TERMINAL_KEYS.IDX_RETURN_LINK_OTP_ONLY, messages)) {
    // TODO: Build OTP Magic link Only View OKTA-491061
  }

  appendMessageElements(uischema, messages);

  return formBag;
};
