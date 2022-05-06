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

import { ControlElement, Layout } from '@jsonforms/core';
import { IdxMessage, IdxTransaction } from '@okta/okta-auth-js';

import {
  DEVICE_CODE_ERROR_KEYS,
  TERMINAL_KEYS,
  TERMINAL_KEYS_WITHOUT_CANCEL,
  TERMINAL_TITLE_KEYS,
} from '../../constants';
import { FormBag, LinkElement } from '../../types';
import {
  containsOneOfTerminalKeys,
  containsTerminalKey,
  containsTerminalKeyPrefix,
} from '../../util';
import { ButtonOptionType } from '../getButtonControls';
import { transformTerminalMessages } from './transformTerminalMessages';

const getTitleKey = (messages?: IdxMessage[]): string | undefined => {
  if (!messages) {
    return undefined;
  }

  if (containsTerminalKeyPrefix(TERMINAL_KEYS.SAFE_MODE_KEY_PREFIX, messages)) {
    return 'oie.safe.mode.title';
  }

  const titleKeys = Object.keys(TERMINAL_TITLE_KEYS);
  const titleKey = titleKeys.find((key) => containsTerminalKey(key, messages));
  return titleKey && TERMINAL_TITLE_KEYS[titleKey];
};

const appendTitleElement = (uischema: Layout, messages?: IdxMessage[]): void => {
  const titleKey = getTitleKey(messages);
  if (!titleKey) {
    return;
  }
  uischema.elements.unshift({
    type: 'Title',
    options: {
      content: titleKey,
    },
  });
};

const appendViewLinks = (transaction: IdxTransaction, uischema: Layout): void => {
  const cancelLink: LinkElement = {
    type: 'Link',
    options: {
      label: 'goback',
      // eslint-disable-next-line no-script-url
      href: 'javascript:void(0)',
    },
  };

  if (containsTerminalKeyPrefix(TERMINAL_KEYS.SAFE_MODE_KEY_PREFIX, transaction.messages)) {
    const skipElement: ControlElement = {
      type: 'Control',
      label: 'oie.enroll.skip.setup',
      scope: `#/properties/${ButtonOptionType.SUBMIT}`,
      options: {
        format: 'button',
        type: ButtonOptionType.SUBMIT,
        idxMethod: 'proceed',
        idxMethodParams: { skip: true },
      },
    };
    uischema.elements.push(skipElement);
  } else if (containsOneOfTerminalKeys(DEVICE_CODE_ERROR_KEYS, transaction.messages)) {
    cancelLink.options.label = 'oie.try.again';
    // TODO: OKTA-491054 use baseURL passed into widget props when available
    cancelLink.options.href = '/';
    uischema.elements.push(cancelLink);
  } else if (transaction.actions?.cancel
    || !containsOneOfTerminalKeys(TERMINAL_KEYS_WITHOUT_CANCEL, transaction.messages)) {
    // TODO: OKTA-491054 use baseURL passed into widget props when available
    cancelLink.options.href = '/';
    uischema.elements.push(cancelLink);
  }
};

export default (transaction: IdxTransaction): FormBag => {
  const { messages } = transaction;

  const formBag: FormBag = {
    envelope: {},
    schema: {
      type: 'object',
      properties: {},
      required: [],
    },
    uischema: {
      type: 'VerticalLayout',
      elements: [],
    },
    data: {},
  };

  appendTitleElement(formBag.uischema, messages);

  transformTerminalMessages(transaction, formBag);

  appendViewLinks(transaction, formBag.uischema);

  return formBag;
};
