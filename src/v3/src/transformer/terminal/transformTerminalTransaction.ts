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
  isOauth2Enabled,
  loc,
  SessionStorage,
  shouldShowCancelLink,
} from '../../util';
import { redirectTransformer } from '../redirect';
import { setFocusOnFirstElement } from '../uischema';
import { createIdentifierContainer } from '../uischema/createIdentifierContainer';
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

const appendTitleElement = (uischema: FormBag['uischema'], messages?: IdxMessage[]): void => {
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
  uischema: FormBag['uischema'],
  widgetProps: WidgetProps,
  bootstrapFn: () => Promise<void>,
): void => {
  const { features, authClient } = widgetProps;
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
        authClient?.transactionManager.clear();
        // We have to directly delete the recoveryToken since it is set once upon authClient instantiation
        delete authClient?.options.recoveryToken;
        await bootstrapFn();
      };
    } else {
      cancelLink.options.href = getBaseUrl(widgetProps);
    }
    uischema.elements.push(cancelLink);
  }
};

export const transformTerminalTransaction = (
  transaction: IdxTransaction,
  widgetProps: WidgetProps,
  bootstrapFn: () => Promise<void>,
): FormBag => {
  const { authClient } = widgetProps;

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

  if (transaction.context?.failure?.href) {
    // Direct auth clients display the error instead of redirecting
    // when redirect option is set to 'always' it will override the default behavior
    const shouldRedirect = isOauth2Enabled(widgetProps) === false || widgetProps.redirect === 'always';
    if (shouldRedirect) {
      SessionStorage.removeStateHandle();
      return redirectTransformer(
        transaction,
        transaction.context.failure.href,
        widgetProps,
      );
    }
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
    } if (deviceEnrollment.name === DEVICE_ENROLLMENT_TYPE.MDM
            || deviceEnrollment.name === DEVICE_ENROLLMENT_TYPE.WS1) {
      return transformMdmTerminalView({ transaction, formBag, widgetProps });
    }
  }

  appendTitleElement(formBag.uischema, messages);

  transformTerminalMessages(transaction, formBag);

  appendViewLinks(transaction, formBag.uischema, widgetProps, bootstrapFn);

  setFocusOnFirstElement(formBag);

  createIdentifierContainer({
    transaction,
    widgetProps,
    step: '',
    setMessage: () => {},
    isClientTransaction: false,
  })(formBag);

  return formBag;
};
