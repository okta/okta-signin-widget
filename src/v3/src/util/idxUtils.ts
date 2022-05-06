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

import { IdxMessage, IdxTransaction, NextStep } from '@okta/okta-auth-js';
import { IdxRemediation } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { AuthCoinProps, IdxTransactionWithNextStep, UserInfo } from 'src/types';

import { AUTHENTICATOR_KEY, EMAIL_AUTHENTICATOR_TERMINAL_KEYS, IDX_STEP } from '../constants';
import { isNextStepAvailable } from '../transformer/utils';

export const getUserInfo = (transaction: IdxTransaction): UserInfo => {
  const { context: { user } } = transaction;

  if (!user) {
    return {};
  }
  return user.value as UserInfo;
};

export const containsTerminalKey = (
  key: string,
  messages?: IdxMessage[],
): boolean => (messages?.some((message) => message.i18n?.key === key) ?? false);

export const containsTerminalKeyPrefix = (
  prefix: string,
  messages?: IdxMessage[],
): boolean => (messages?.some((message) => message.i18n?.key?.startsWith(prefix)) ?? false);

export const containsOneOfTerminalKeys = (
  keys: string[],
  messages?: IdxMessage[],
): boolean => keys.some((key) => containsTerminalKey(key, messages));

export const buildAuthCoinProps = (transaction?: IdxTransaction): AuthCoinProps | undefined => {
  if (!transaction) {
    return undefined;
  }

  const { nextStep, messages } = transaction;
  if (containsOneOfTerminalKeys(EMAIL_AUTHENTICATOR_TERMINAL_KEYS, messages)
    || nextStep?.name === IDX_STEP.CONSENT_EMAIL_CHALLENGE) {
    return { authenticatorKey: AUTHENTICATOR_KEY.EMAIL };
  }

  if (!nextStep?.authenticator?.key) {
    return undefined;
  }

  return { authenticatorKey: nextStep.authenticator.key };
};

// This may not be necessary after auth-js changes OKTA-484930
const generateAvailableSteps = (remediations: IdxRemediation[]): NextStep[] => {
  const steps: NextStep[] = [];

  remediations.forEach((remediation) => {
    steps.push({
      name: remediation.name,
      inputs: remediation.value,
    });
  });

  return steps;
};

// This may not be necessary after auth-js changes OKTA-484930
export const checkIdxTransactionWithNextStep: (
  transaction: IdxTransaction,
) => asserts transaction is IdxTransactionWithNextStep = (transaction) => {
  if (!transaction.availableSteps?.length) {
    // eslint-disable-next-line no-param-reassign
    transaction.availableSteps = generateAvailableSteps(transaction.neededToProceed);
  }

  if (!transaction.nextStep && transaction.availableSteps.length) {
    const [nextStep] = transaction.availableSteps;
    // eslint-disable-next-line no-param-reassign
    transaction.nextStep = nextStep;
  }

  if (!isNextStepAvailable(transaction)) {
    throw new Error('Unable to bootstrap sign-in widget, no step available');
  }
};
