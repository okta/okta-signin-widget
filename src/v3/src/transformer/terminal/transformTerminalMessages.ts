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

import {
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP,
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE,
  TERMINAL_KEY,
} from '../../constants';
import {
  DescriptionElement,
  InfoboxElement,
  TerminalKeyTransformer,
  UISchemaLayout,
  WidgetMessage,
} from '../../types';
import {
  buildEndUserRemediationError,
  containsMessageKey, containsMessageKeyPrefix, containsOneOfMessageKeys, loc,
} from '../../util';
import { transactionMessageTransformer } from '../i18n';
import { transformEmailMagicLinkOTPOnly } from './transformEmailMagicLinkOTPOnlyElements';

const appendMessageElements = (uischema: UISchemaLayout, messages: WidgetMessage[]): void => {
  messages.forEach((message) => {
    if (!message.class || message.class === 'INFO') {
      const messageElement: DescriptionElement = {
        type: 'Description',
        contentType: 'subtitle',
        options: { content: (message.message! as string) },
      };
      uischema.elements.push(messageElement);
    } else {
      const messageClass = message.class ?? 'WARNING';
      const infoBoxElement: InfoboxElement = {
        type: 'InfoBox',
        options: {
          message,
          class: messageClass,
          dataSe: 'callout',
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
  const listMessages: WidgetMessage[] = [
    loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point1', 'login'),
    loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point2', 'login'),
    loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point3', 'login'),
  ].map((msg: string) => ({ class: 'INFO', message: msg }));

  // Add an additional bullet point for desktop devices
  if (isBiometricsRequiredDesktop) {
    listMessages.push({
      class: 'INFO',
      message: loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point4', 'login'),
    });
  }

  uischema.elements.push({
    type: 'InfoBox',
    options: {
      class: 'ERROR',
      dataSe: 'callout',
      message: {
        type: 'list',
        class: 'ERROR',
        title: loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.title', 'login'),
        description: loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.description', 'login'),
        message: listMessages,
      },
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
        message: {
          class: 'ERROR',
          message: loc('oform.error.unexpected', 'login'),
          i18n: { key: 'oform.error.unexpected' },
        },
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
          message: {
            class: 'ERROR',
            message: loc('error.unsupported.response', 'login'),
            i18n: { key: 'error.unsupported.response' },
          },
          class: 'ERROR',
        },
      } as InfoboxElement);
    }
    return formBag;
  }

  transactionMessageTransformer(transaction);

  const displayedMessages: WidgetMessage[] = messages.map((message) => (message));

  if (containsMessageKey(TERMINAL_KEY.OPERATION_CANCELED_ON_OTHER_DEVICE_KEY, displayedMessages)) {
    displayedMessages[0].message = loc('idx.operation.cancelled.on.other.device', 'login');
    displayedMessages.push({ message: loc('oie.consent.enduser.deny.description', 'login') });
  } else if (containsMessageKey(TERMINAL_KEY.UNLOCK_ACCOUNT_KEY, displayedMessages)) {
    displayedMessages[0].message = loc(TERMINAL_KEY.UNLOCK_ACCOUNT_KEY, 'login');
  } else if (containsMessageKey(TERMINAL_KEY.RETURN_TO_ORIGINAL_TAB_KEY, displayedMessages)) {
    displayedMessages[0].message = loc('oie.consent.enduser.email.allow.description', 'login');
    displayedMessages.push({ message: loc('oie.return.to.original.tab', 'login') });
  } else if (containsMessageKey(TERMINAL_KEY.TOO_MANY_REQUESTS, displayedMessages)) {
    displayedMessages[0].message = loc('oie.tooManyRequests', 'login');
  } else if (containsMessageKey(TERMINAL_KEY.RETURN_LINK_EXPIRED_KEY, displayedMessages)) {
    displayedMessages[0].class = 'ERROR';
  } else if (containsMessageKey(TERMINAL_KEY.SESSION_EXPIRED, displayedMessages)) {
    displayedMessages[0].class = 'ERROR';
    displayedMessages[0].message = loc(TERMINAL_KEY.SESSION_EXPIRED, 'login');
  } else if (containsMessageKeyPrefix(TERMINAL_KEY.SIGNED_NONCE_ERROR, displayedMessages)) {
    // custom title for signed nonce errors
    displayedMessages[0].title = loc('user.fail.verifyIdentity', 'login');
  } else if (
    containsMessageKeyPrefix(TERMINAL_KEY.END_USER_REMEDIATION_ERROR_PREFIX, displayedMessages)
  ) {
    // OKTA-630044 - messages from rawIdxState are used until this issue is solved
    const userRemediationErrorElement = buildEndUserRemediationError(
      transaction.rawIdxState.messages?.value || [],
    );
    if (userRemediationErrorElement) {
      uischema.elements.push(userRemediationErrorElement);
    }
    return formBag;
  } else if (containsMessageKey(TERMINAL_KEY.IDX_RETURN_LINK_OTP_ONLY, displayedMessages)) {
    return transformEmailMagicLinkOTPOnly(transaction, formBag);
  } else if (containsMessageKey(TERMINAL_KEY.DEVICE_ACTIVATED, displayedMessages)) {
    // Displays device activated terminal state title as a success InfoBox instead of a title
    const deviceActivatedAsSuccessMessage: WidgetMessage = {
      class: 'SUCCESS',
      message: loc('device.code.activated.success.title', 'login'),
      i18n: { key: 'device.code.activated.success.title' },
    };
    displayedMessages.unshift(deviceActivatedAsSuccessMessage);
  } else if (containsOneOfMessageKeys([TERMINAL_KEY.DEVICE_NOT_ACTIVATED_CONSENT_DENIED,
    TERMINAL_KEY.DEVICE_NOT_ACTIVATED_INTERNAL_ERROR], displayedMessages)) {
    // Displays device not activated terminal states titles as an error InfoBox instead of a title
    const deviceNotActivatedAsErrorMessage: WidgetMessage = {
      class: 'ERROR',
      message: loc('device.code.activated.error.title', 'login'),
      i18n: { key: 'device.code.activated.error.title' },
    };
    displayedMessages.unshift(deviceNotActivatedAsErrorMessage);
  } else if (
    containsOneOfMessageKeys(
      [OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE, OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP],
      displayedMessages,
    )
  ) {
    appendBiometricsErrorBox(
      uischema,
      containsMessageKey(OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP, displayedMessages),
    );
    return formBag;
  }

  appendMessageElements(uischema, displayedMessages);

  return formBag;
};
