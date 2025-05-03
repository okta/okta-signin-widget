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

import { getMessage } from '../../../../v2/ion/i18nUtils';
import { WidgetMessage } from '../../types';
import { loc } from '../locUtil';

export const containsMessageKey = (
  key: string,
  messages?: WidgetMessage[],
): boolean => (messages?.some((message) => message.i18n?.key === key) ?? false);

export const containsMessageKeyPrefix = (
  prefix: string,
  messages?: WidgetMessage[],
): boolean => (messages?.some((message) => message.i18n?.key?.startsWith(prefix)) ?? false);

export const containsOneOfMessageKeys = (
  keys: string[],
  messages?: WidgetMessage[],
): boolean => keys.some((key) => containsMessageKey(key, messages));

export const convertIdxMessageToWidgetMessage = (
  messages?: any[],
): WidgetMessage[] | undefined => messages?.map((message) => {
  // If message is an array, it has already been translated earlier in the flow
  if (Array.isArray(message?.message)) {
    return message as WidgetMessage;
  }
  return {
    ...(message as IdxMessage),
    message: getMessage(message),
  };
});

export const updatePasswordRequirementsNotMetMessage = (
  messages: IdxMessage[],
): IdxMessage[] => (
  messages.map((message) => {
    if (message.i18n?.key?.includes('password.passwordRequirementsNotMet')) {
      return {
        ...message,
        i18n: {
          key: 'registration.error.password.passwordRequirementsNotMet',
          params: undefined,
        },
        message: loc('registration.error.password.passwordRequirementsNotMet', 'login'),
      };
    }
    return message;
  })
);
