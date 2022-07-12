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
  IdxStatus,
  IdxTransaction,
} from '@okta/okta-auth-js';

import {
  DEVICE_CODE_ERROR_KEYS,
  TERMINAL_KEY,
  TERMINAL_KEYS_WITHOUT_CANCEL,
  TERMINAL_TITLE_KEY,
} from '../../constants';
import {
  ButtonElement,
  ButtonType,
  FormBag,
  LinkElement,
  SpinnerElement,
  TitleElement,
  UISchemaLayout,
  Undefinable,
  WidgetProps,
} from '../../types';
import {
  containsMessageKey,
  containsMessageKeyPrefix,
  containsOneOfMessageKeys,
  getUserInfo,
  isAuthClientSet,
  removeUsernameCookie,
  setUsernameCookie,
} from '../../util';
import { redirectTransformer } from '../redirect';
import { createForm } from '../utils';
import { transformTerminalMessages } from './transformTerminalMessages';

const getTitleKey = (messages?: IdxMessage[]): Undefinable<string> => {
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
    options: { content: titleKey },
  } as TitleElement);
};

const appendViewLinks = (
  transaction: IdxTransaction,
  uischema: UISchemaLayout,
  widgetProps: WidgetProps,
): void => {
  const { baseUrl } = widgetProps;
  const cancelStep = transaction?.availableSteps?.find(({ name }) => name === 'cancel');
  const cancelLink: LinkElement = {
    type: 'Link',
    options: {
      label: 'goback',
      // eslint-disable-next-line no-script-url
      href: cancelStep?.action ? 'javascript:void(0)' : (baseUrl || '/'),
      action: cancelStep?.action,
    },
  };

  if (containsMessageKeyPrefix(TERMINAL_KEY.SAFE_MODE_KEY_PREFIX, transaction.messages)) {
    const skipElement: ButtonElement = {
      type: 'Button',
      label: 'oie.enroll.skip.setup',
      scope: `#/properties/${ButtonType.SUBMIT}`,
      options: {
        type: ButtonType.SUBMIT,
        action: cancelStep?.action,
      },
    };
    uischema.elements.push(skipElement);
  } else if (containsOneOfMessageKeys(DEVICE_CODE_ERROR_KEYS, transaction.messages)) {
    cancelLink.options.label = 'oie.try.again';
    uischema.elements.push(cancelLink);
  } else if (transaction.actions?.cancel
    || !containsOneOfMessageKeys(TERMINAL_KEYS_WITHOUT_CANCEL, transaction.messages)) {
    uischema.elements.push(cancelLink);
  }
};

const buildFormBagForInteractionCodeFlow = (
  transaction: IdxTransaction,
  widgetProps: WidgetProps,
): FormBag => {
  if (!isAuthClientSet(widgetProps)) {
    throw new Error('authClient is required');
  }
  const {
    authClient,
    useInteractionCodeFlow,
    codeChallenge,
    redirectUri,
    redirect,
  } = widgetProps;
  const { interactionCode } = transaction;
  const transactionMeta = authClient.idx.getSavedTransactionMeta() ?? transaction.meta;
  const state = authClient.options.state || transactionMeta?.state;
  const redirectParams = { interaction_code: interactionCode || '', state: state || '' };

  const isRemediationMode = useInteractionCodeFlow && codeChallenge;
  if (isRemediationMode) {
    authClient.idx.clearTransactionMeta();
  }

  const shouldRedirect = redirect === 'always';
  if (shouldRedirect) {
    if (!redirectUri) {
      throw new Error('redirectUri is required');
    }

    const searchParams = new URLSearchParams(redirectParams);
    return redirectTransformer(
      transaction,
      `${redirectUri}?${searchParams.toString()}`,
      widgetProps,
    );
  }

  const formBag: FormBag = createForm();
  formBag.uischema.elements.push({
    type: 'Spinner',
    options: {
      label: 'loading.label',
      valueText: 'loading.label',
    },
  } as SpinnerElement);

  if (isRemediationMode) {
    formBag.uischema.elements.push({
      type: 'SuccessCallback',
      options: {
        data: {
          status: IdxStatus.SUCCESS,
          ...redirectParams,
        },
      },
    } as any);
    return formBag;
  }

  // Operating in "relying-party" mode. The widget owns this transaction.
  // Complete the transaction client-side and call success/resolve promise
  if (!transactionMeta) {
    throw new Error('Could not load transaction data from storage');
  }

  formBag.uischema.elements.push({
    type: 'SuccessCallback',
    options: {
      data: {
        status: IdxStatus.SUCCESS,
        tokens: transaction.tokens,
      },
    },
  } as any);
  return formBag;
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
): FormBag => {
  const { useInteractionCodeFlow, features } = widgetProps;
  if (isSuccessfulAuthentication(transaction) && features?.rememberMyUsernameOnOIE) {
    // TODO: OKTA-506358 This identifier cookie can be removed once implemented in auth-js
    updateIdentifierCookie(transaction, features?.rememberMe);
  }

  if (useInteractionCodeFlow && transaction.interactionCode) {
    return buildFormBagForInteractionCodeFlow(
      transaction,
      widgetProps,
    );
  }

  if (transaction.context?.success?.href) {
    return redirectTransformer(
      transaction,
      transaction.context.success.href,
      widgetProps,
    );
  }

  const { messages } = transaction;

  if (!messages && transaction.interactionCode && !useInteractionCodeFlow) {
    throw new Error('Set "useInteractionCodeFlow" to true in configuration to enable the '
      + 'interaction_code" flow for self-hosted widget.');
  }

  const formBag: FormBag = createForm();

  appendTitleElement(formBag.uischema, messages);

  transformTerminalMessages(transaction, formBag);

  appendViewLinks(transaction, formBag.uischema, widgetProps);

  return formBag;
};
