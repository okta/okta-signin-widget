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

import { IdxMessage } from '@okta/okta-auth-js';

import {
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP,
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE,
  TERMINAL_KEY,
} from '../../constants';
import {
  DescriptionElement,
  InfoboxElement,
  Modify,
  TerminalKeyTransformer,
  UISchemaLayout,
} from '../../types';
import { containsMessageKey, containsMessageKeyPrefix, loc } from '../../util';
import { transactionMessageTransformer } from '../i18n';
import { transformEmailMagicLinkOTPOnly } from './transformEmailMagicLinkOTPOnlyElements';

type ModifiedIdxMessage = Modify<IdxMessage, {
  class?: string;
  i18n?: {
    key: string;
    params?: unknown[];
  };
  title?: string;
}>;

const appendMessageElements = (uischema: UISchemaLayout, messages: ModifiedIdxMessage[]): void => {
  messages.forEach((message) => {
    if (!message.class || message.class === 'INFO') {
      const messageElement: DescriptionElement = {
        type: 'Description',
        contentType: 'subtitle',
        options: { content: message.message },
      };
      uischema.elements.push(messageElement);
    } else {
      const messageClass = message.class ?? 'WARNING';
      const infoBoxElement: InfoboxElement = {
        type: 'InfoBox',
        options: {
          message: message.message,
          class: messageClass,
          dataSe: 'callout',
          title: message.title,
        },
      };
      uischema.elements.push(infoBoxElement);
    }
  });
};

const appendBiometricsErrorBox = (
  uischema: UISchemaLayout,
  isBiometricsRequiredDesktop = false,
) => {
  const bulletPoints = [
    loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point1', 'login'),
    loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point2', 'login'),
    loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point3', 'login'),
  ];

  // Add an additional bullet point for desktop devices
  if (isBiometricsRequiredDesktop) {
    bulletPoints.push(
      loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point4', 'login'),
    );
  }

  uischema.elements.push({
    type: 'InfoBox',
    options: {
      message: loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.description', 'login'),
      title: loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.title', 'login'),
      class: 'ERROR',
      contentType: 'string',
      dataSe: 'callout',
      listOptions: { items: bulletPoints },
    },
  } as InfoboxElement);
};

export const transformTerminalMessages: TerminalKeyTransformer = (transaction, formBag) => {
  const { messages, requestDidSucceed } = transaction;
  const { uischema } = formBag;
  if (transaction.error) {
    uischema.elements.push({
      type: 'InfoBox',
      options: {
        message: loc('oform.error.unexpected', 'login'),
        class: 'ERROR',
      },
    } as InfoboxElement);
    return formBag;
  }

  if (!messages?.length) {
    if (requestDidSucceed === false) {
      uischema.elements.push({
        type: 'InfoBox',
        options: {
          message: loc('error.unsupported.response', 'login'),
          class: 'ERROR',
        },
      } as InfoboxElement);
    }
    return formBag;
  }

  transactionMessageTransformer(transaction);

  const displayedMessages: ModifiedIdxMessage[] = messages;

  if (containsMessageKey(TERMINAL_KEY.OPERATION_CANCELED_ON_OTHER_DEVICE_KEY, messages)) {
    displayedMessages[0].message = loc('idx.operation.cancelled.on.other.device', 'login');
    displayedMessages.push({ message: loc('oie.consent.enduser.deny.description', 'login') });
  } else if (containsMessageKey(TERMINAL_KEY.UNLOCK_ACCOUNT_KEY, messages)) {
    displayedMessages[0].message = loc(TERMINAL_KEY.UNLOCK_ACCOUNT_KEY, 'login');
  } else if (containsMessageKey(TERMINAL_KEY.RETURN_TO_ORIGINAL_TAB_KEY, messages)) {
    displayedMessages[0].message = loc('oie.consent.enduser.email.allow.description', 'login');
    displayedMessages.push({ message: loc('oie.return.to.original.tab', 'login') });
  } else if (containsMessageKey(TERMINAL_KEY.TOO_MANY_REQUESTS, messages)) {
    displayedMessages[0].message = loc('oie.tooManyRequests', 'login');
  } else if (containsMessageKey(TERMINAL_KEY.RETURN_LINK_EXPIRED_KEY, messages)) {
    displayedMessages[0].class = 'ERROR';
  } else if (containsMessageKey(TERMINAL_KEY.SESSION_EXPIRED, messages)) {
    displayedMessages[0].class = 'ERROR';
    displayedMessages[0].message = loc(TERMINAL_KEY.SESSION_EXPIRED, 'login');
  } else if (containsMessageKeyPrefix('core.auth.factor.signedNonce.error', messages)) {
    // custom title for signed nonce errors
    displayedMessages[0].title = loc('user.fail.verifyIdentity', 'login');
  } else if (containsMessageKey(TERMINAL_KEY.IDX_RETURN_LINK_OTP_ONLY, messages)) {
    return transformEmailMagicLinkOTPOnly(transaction, formBag);
  } else if (containsMessageKey(OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE, messages)) {
    appendBiometricsErrorBox(uischema);
    return formBag;
  } else if (containsMessageKey(OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP, messages)) {
    appendBiometricsErrorBox(uischema, true);
    return formBag;
  }

  appendMessageElements(uischema, messages);

  return formBag;
};
