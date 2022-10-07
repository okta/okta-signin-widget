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

import { IdxMessage, IdxRemediation, IdxTransaction } from '@okta/okta-auth-js';

import {
  AUTHENTICATOR_KEY,
  EMAIL_AUTHENTICATOR_TERMINAL_KEYS,
  IDX_STEP,
} from '../constants';
import {
  AppInfo,
  AuthCoinProps,
  IdxMessageWithName,
  RequiredKeys,
  UserInfo,
  WidgetProps,
} from '../types';
import { getAuthenticatorKey } from './getAuthenticatorKey';
import { loc } from './locUtil';

export const getUserInfo = (transaction: IdxTransaction): UserInfo => {
  const { context: { user } } = transaction;

  if (!user) {
    return {};
  }
  return user.value as UserInfo;
};

export const getAppInfo = (transaction: IdxTransaction): AppInfo => {
  const { context: { app } } = transaction;

  if (!app) {
    return {};
  }
  return app.value as AppInfo;
};

export const containsMessageKey = (
  key: string,
  messages?: IdxMessage[],
): boolean => (messages?.some((message) => message.i18n?.key === key) ?? false);

export const containsMessageKeyPrefix = (
  prefix: string,
  messages?: IdxMessage[],
): boolean => (messages?.some((message) => message.i18n?.key?.startsWith(prefix)) ?? false);

export const containsOneOfMessageKeys = (
  keys: string[],
  messages?: IdxMessage[],
): boolean => keys.some((key) => containsMessageKey(key, messages));

export const updatePasswordRequirementsNotMetMessage = (
  messages: IdxMessageWithName[],
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

export const buildAuthCoinProps = (
  transaction?: IdxTransaction | null,
): AuthCoinProps | undefined => {
  if (!transaction) {
    return undefined;
  }

  const { nextStep, messages } = transaction;
  if (containsOneOfMessageKeys(EMAIL_AUTHENTICATOR_TERMINAL_KEYS, messages)
    || nextStep?.name === IDX_STEP.EMAIL_CHALLENGE_CONSENT) {
    return { authenticatorKey: AUTHENTICATOR_KEY.EMAIL };
  }

  const authenticatorKey = getAuthenticatorKey(transaction);
  if (authenticatorKey) {
    return { authenticatorKey };
  }

  return undefined;
};

export const hasMinAuthenticatorOptions = (
  transaction: IdxTransaction,
  stepName: string,
  min: number,
): boolean => {
  const excludedPages = [
    IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
    IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
  ];
  if (excludedPages.includes(transaction.nextStep?.name ?? '')) {
    return false;
  }

  const step: IdxRemediation | undefined = transaction.neededToProceed.find(
    ({ name }) => name === stepName,
  );
  if (!step) {
    return false;
  }

  return (step.value?.find(({ name }) => name === 'authenticator')?.options?.length ?? 0) > min;
};

export const isAuthClientSet = (
  props: WidgetProps,
): props is RequiredKeys<WidgetProps, 'authClient'> => !!props.authClient;

export const areTransactionsEqual = (
  tx1: IdxTransaction | undefined,
  tx2: IdxTransaction | undefined,
): boolean => {
  if (tx1?.nextStep?.name !== tx2?.nextStep?.name) {
    return false;
  }

  const tx1AuthKey = tx1 && getAuthenticatorKey(tx1);
  const tx2AuthKey = tx2 && getAuthenticatorKey(tx2);
  if (tx1AuthKey !== tx2AuthKey) {
    return false;
  }

  const tx1AuthId = tx1?.context.currentAuthenticator?.value?.id;
  const tx2AuthId = tx2?.context.currentAuthenticator?.value?.id;
  if (tx1AuthId !== tx2AuthId) {
    return false;
  }

  return true;
};
