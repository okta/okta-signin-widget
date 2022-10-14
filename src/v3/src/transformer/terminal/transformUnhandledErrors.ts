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

import { AuthApiError } from '@okta/okta-auth-js';

import { getMessage } from '../../../../v2/ion/i18nTransformer';
import {
  FormBag,
  InfoboxElement,
  WidgetProps,
} from '../../types';
import { loc } from '../../util';
import { createForm } from '../utils';

type ErrorTransformer = (widgetProps: WidgetProps, error: AuthApiError) => FormBag;

const getErrorMessage = (error: AuthApiError, widgetProps?: WidgetProps) : string => {
  const errorChecks = [
    // error message comes from server response
    {
      tester: (err: AuthApiError) => err && err.xhr && !err.errorSummary && err.xhr.responseText?.includes('messages'),
      message: (err: AuthApiError) => {
        const errorResponse = JSON.parse(err.xhr!.responseText);
        const { messages: { value: [message] } } = errorResponse;

        // TODO: re-visit, handle side effects in hooks
        // If the session expired, this clears session to allow new transaction bootstrap
        if (widgetProps && message.i18n.key === 'idx.session.expired') {
          const { authClient } = widgetProps;
          authClient?.transactionManager.clear();
        }

        return getMessage(message);
      },
    },
    // special error messages
    {
      tester: (err: AuthApiError) => err?.errorCode === 'invalid_request' && err?.errorSummary === 'The recovery token is invalid',
      message: () => loc('oie.invalid.recovery.token', 'login'),
    },
    {
      tester: (err: AuthApiError) => err?.errorCode === 'access_denied' && !!err?.errorSummary,
      message: () => loc('oie.feature.disabled', 'login'),
    },
    {
      tester: (err: AuthApiError) => err?.errorCode && !!err?.errorSummary,
      message: () => loc('oie.configuration.error', 'login'),
    },
    // default fall back for unknown errors
    {
      tester: () => true,
      message: () => loc('oform.error.unexpected', 'login'),
    },
  ];

  // find the message that meets the tester condition
  return errorChecks.find(({ tester }) => tester(error))?.message(error);
};

export const transformUnhandledErrors: ErrorTransformer = (widgetProps, error) => {
  const formBag: FormBag = createForm();

  formBag.uischema.elements = [{
    type: 'InfoBox',
    options: {
      message: getErrorMessage(error, widgetProps),
      class: 'ERROR',
      contentType: 'string',
    },
  } as InfoboxElement];

  return formBag;
};
