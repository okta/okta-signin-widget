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
  IdxMessage,
  IdxTransaction,
} from '@okta/okta-auth-js';

import {
  DEVICE_CODE_ERROR_KEYS,
  DEVICE_ENROLLMENT_TYPE,
  TERMINAL_KEY,
  TERMINAL_KEYS_WITHOUT_CANCEL,
  TERMINAL_TITLE_KEY,
} from '../../constants';
import {
  FormBag,
  LinkElement,
  TitleElement,
  UISchemaLayout,
  WidgetProps,
} from '../../types';
import {
  containsMessageKey,
  containsMessageKeyPrefix,
  containsOneOfMessageKeys,
  getBackToSignInUri,
  getBaseUrl,
  getUserInfo,
  isOauth2Enabled,
  loc,
  removeUsernameCookie,
  SessionStorage,
  setUsernameCookie,
  shouldShowCancelLink,
} from '../../util';
import { redirectTransformer } from '../redirect';
import { setFocusOnFirstElement } from '../uischema';
import { createForm } from '../utils';
import { transformOdaEnrollment } from './odaEnrollment';
import { transformMdmTerminalView } from './transformMdmTerminalView';
import { transformTerminalMessages } from './transformTerminalMessages';

const getTitleKey = (messages?: IdxMessage[]): string | undefined => {
  if (!messages) {
    return undefined;
  }

  if (containsMessageKeyPrefix(TERMINAL_KEY.SAFE_MODE_KEY_PREFIX, messages)) {
    return 'oie.safe.mode.title';
  }

  const titleKeys = Object.keys(TERMINAL_TITLE_KEY);
  const titleKey = titleKeys.find((key) => containsMessageKey(key, messages));
  return titleKey && TERMINAL_TITLE_KEY[titleKey];
};

const appendTitleElement = (uischema: UISchemaLayout, messages?: IdxMessage[]): void => {
  const titleKey = getTitleKey(messages);
  if (!titleKey) {
    return;
  }
  uischema.elements.unshift({
    type: 'Title',
    options: { content: loc(titleKey, 'login') },
  } as TitleElement);
};

const appendViewLinks = (
  transaction: IdxTransaction,
  uischema: UISchemaLayout,
  widgetProps: WidgetProps,
  bootstrapFn: () => Promise<void>,
): void => {
  const { features } = widgetProps;
  const isCancelAvailable = shouldShowCancelLink(features);
  const cancelStep = transaction?.availableSteps?.find(({ name }) => name === 'cancel');
  const skipStep = transaction?.availableSteps?.find(({ name }) => name.includes('skip'));
  const cancelLink: LinkElement = {
    type: 'Link',
    options: {
      label: loc('goback', 'login'),
      step: 'cancel',
      isActionStep: true,
      dataSe: 'cancel',
    },
  };

  if (containsMessageKeyPrefix(TERMINAL_KEY.SAFE_MODE_KEY_PREFIX, transaction.messages)
    && transaction.context.intent === 'CREDENTIAL_ENROLLMENT') {
    return;
  }

  if (containsMessageKeyPrefix(TERMINAL_KEY.SAFE_MODE_KEY_PREFIX, transaction.messages)
      && skipStep) {
    cancelLink.options.label = loc('oie.enroll.skip.setup', 'login');
    cancelLink.options.step = skipStep.name;
    cancelLink.options.isActionStep = false;
    uischema.elements.push(cancelLink);
  } else if (containsOneOfMessageKeys(DEVICE_CODE_ERROR_KEYS, transaction.messages)
      && isCancelAvailable) {
    cancelLink.options.label = loc('oie.try.again', 'login');
    cancelLink.options.href = window.location.href;
    uischema.elements.push(cancelLink);
  } else if (cancelStep && isCancelAvailable) {
    uischema.elements.push(cancelLink);
  } else if (!transaction.actions?.cancel
      && !containsOneOfMessageKeys(TERMINAL_KEYS_WITHOUT_CANCEL, transaction.messages)
      && isCancelAvailable) {
    const backToSigninUri = getBackToSignInUri(widgetProps);
    if (backToSigninUri) {
      cancelLink.options.href = backToSigninUri;
    } else if (isOauth2Enabled(widgetProps)) {
      cancelLink.options.onClick = async () => {
        await bootstrapFn();
      };
    } else {
      cancelLink.options.href = getBaseUrl(widgetProps);
    }
    uischema.elements.push(cancelLink);
  }
};

const isSuccessfulAuthentication = (
  transction: IdxTransaction,
): boolean => !!(transction.context.success
  || transction.rawIdxState.successWithInteractionCode);

const updateIdentifierCookie = (transaction: IdxTransaction, rememberMe?: boolean): void => {
  if (rememberMe) {
    const userInfo = getUserInfo(transaction);
    if (userInfo.identifier) {
      setUsernameCookie(userInfo.identifier);
    }
  } else {
    removeUsernameCookie();
  }
};

export const transformTerminalTransaction = (
  transaction: IdxTransaction,
  widgetProps: WidgetProps,
  bootstrapFn: () => Promise<void>,
): FormBag => {
  const { authClient, features } = widgetProps;
  if (isSuccessfulAuthentication(transaction) && features?.rememberMyUsernameOnOIE) {
    // TODO: OKTA-506358 This identifier cookie can be removed once implemented in auth-js
    updateIdentifierCookie(transaction, features?.rememberMe);
  }

  if (isOauth2Enabled(widgetProps) && transaction.interactionCode) {
    // Interaction code flow handled by useInteractionCodeFlow hook
    return createForm();
  }

  if (transaction.context?.success?.href) {
    SessionStorage.removeStateHandle();
    return redirectTransformer(
      transaction,
      transaction.context.success.href,
      widgetProps,
    );
  }

  const { messages } = transaction;

  if (containsMessageKey(TERMINAL_KEY.SESSION_EXPIRED, messages)) {
    authClient?.transactionManager.clear();
    SessionStorage.removeStateHandle();
  }

  const formBag: FormBag = createForm();

  // @ts-expect-error Property 'deviceEnrollment' does not exist on type 'IdxContext' ts(2339)
  const deviceEnrollment = transaction.context?.deviceEnrollment?.value;
  if (typeof deviceEnrollment !== 'undefined') {
    if (deviceEnrollment.name === DEVICE_ENROLLMENT_TYPE.ODA) {
      return transformOdaEnrollment({ transaction, formBag, widgetProps });
    } if (deviceEnrollment.name === DEVICE_ENROLLMENT_TYPE.MDM) {
      return transformMdmTerminalView({ transaction, formBag, widgetProps });
    }
  }

  appendTitleElement(formBag.uischema, messages);

  transformTerminalMessages(transaction, formBag);

  appendViewLinks(transaction, formBag.uischema, widgetProps, bootstrapFn);

  setFocusOnFirstElement(formBag);

  return formBag;
};
