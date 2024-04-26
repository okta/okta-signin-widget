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

import { AuthApiError, OAuthError } from '@okta/okta-auth-js';

import { getMessage } from '../../../../v2/ion/i18nUtils';
import { TERMINAL_KEY, TERMINAL_TITLE_KEY } from '../../constants';
import {
  FormBag,
  InfoboxElement,
  WidgetMessage,
  WidgetProps,
} from '../../types';
import { loc, SessionStorage } from '../../util';
import { createForm } from '../utils';

type ErrorTransformer = (widgetProps: WidgetProps, error?: (AuthApiError | OAuthError)) => FormBag;
type ErrorTester<T extends (AuthApiError | OAuthError)> = {
  tester: (err?: T) => boolean,
  message: (err?: T) => WidgetMessage,
};

const getWidgetMessage = (
  error?: (AuthApiError | OAuthError),
  widgetProps?: WidgetProps,
) : WidgetMessage => {
  const authApiErrorChecks: ErrorTester<AuthApiError>[] = [
    // error message comes from server response
    {
      tester: (err?: AuthApiError) => !!(err && err.xhr && !err.errorSummary && err.xhr.responseText?.includes('messages')),
      message: (err?: AuthApiError) => {
        const errorResponse = JSON.parse(err!.xhr!.responseText);
        const { messages: { value: [message] } } = errorResponse;

        // TODO: re-visit, handle side effects in hooks
        // If the session expired, this clears session to allow new transaction bootstrap
        if (widgetProps && message?.i18n?.key === 'idx.session.expired') {
          const { authClient } = widgetProps;
          authClient?.transactionManager.clear();
          SessionStorage.removeStateHandle();
        }

        return {
          class: 'ERROR',
          message: getMessage(message),
          i18n: { key: message.i18n?.key },
        };
      },
    },
    // special error messages
    {
      tester: (err?: AuthApiError) => !!err?.errorCode && !!err?.errorSummary,
      message: (err?: AuthApiError) => ({
        class: 'ERROR',
        message: err!.errorSummary,
      }),
    },
  ];
  const oauthErrorChecks: ErrorTester<OAuthError>[] = [
    {
      tester: (err?: OAuthError) => err?.error === 'invalid_request' && err?.error_description === 'The recovery token is invalid',
      message: () => ({
        class: 'ERROR',
        message: loc('oie.invalid.recovery.token', 'login'),
        i18n: { key: 'oie.invalid.recovery.token' },
      }),
    },
    {
      tester: (err?: OAuthError) => err?.error === 'invalid_request' && err?.error_description === 'The activation token is invalid',
      message: () => ({
        class: 'ERROR',
        title: loc(TERMINAL_TITLE_KEY[TERMINAL_KEY.EMAIL_ACTIVATION_EMAIL_INVALID], 'login'),
        message: loc(TERMINAL_KEY.EMAIL_ACTIVATION_EMAIL_INVALID, 'login'),
        i18n: { key: TERMINAL_KEY.EMAIL_ACTIVATION_EMAIL_INVALID },
      }),
    },
    {
      tester: (err?: OAuthError) => err?.error === 'access_denied' && !!err?.error_description,
      message: () => ({
        class: 'ERROR',
        message: loc('oie.feature.disabled', 'login'),
        i18n: { key: 'oie.feature.disabled' },
      }),
    },
    {
      tester: (err?: OAuthError) => !!err?.error && !!err?.error_description,
      message: () => ({
        class: 'ERROR',
        message: loc('oie.configuration.error', 'login'),
        i18n: { key: 'oie.configuration.error' },
      }),
    },
  ];

  // find the message that meets the tester condition
  let message: WidgetMessage | undefined;
  switch (error?.name) {
    case 'AuthApiError':
      message = authApiErrorChecks
        .find(({ tester }) => tester(error as AuthApiError))?.message(error as AuthApiError);
      break;
    case 'OAuthError':
      message = oauthErrorChecks
        .find(({ tester }) => tester(error as OAuthError))?.message(error as OAuthError);
      break;
    default:
      // intentionally fall through
  }
  // default fall back for unknown errors
  return message || {
    class: 'ERROR',
    message: loc('oform.error.unexpected', 'login'),
    i18n: { key: 'oform.error.unexpected' },
  };
};

export const transformUnhandledErrors: ErrorTransformer = (widgetProps, error) => {
  const formBag: FormBag = createForm();

  formBag.uischema.elements = [{
    type: 'InfoBox',
    options: {
      message: getWidgetMessage(error, widgetProps),
      class: 'ERROR',
      dataSe: 'callout',
    },
  } as InfoboxElement];

  return formBag;
};
