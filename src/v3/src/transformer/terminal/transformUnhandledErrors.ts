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

import {
  FormBag,
  InfoboxElement,
  MessageTypeVariant,
  UISchemaElement,
  WidgetProps,
} from '../../types';
import { createForm } from '../utils';

type ErrorTransformer = (widgetProps: WidgetProps, error?: AuthApiError) => FormBag;

const appendSpecialErrorMessages = (
  elements: UISchemaElement[],
  errorDescription: string,
  error?: string,
) => {
  let message;
  if (error === 'invalid_request' && errorDescription === 'The recovery token is invalid') {
    message = 'oie.invalid.recovery.token';
  } else if (error === 'access_denied' && !!errorDescription) {
    message = 'oie.feature.disabled';
  } else {
    message = 'oie.configuration.error';
  }

  elements.push({
    type: 'InfoBox',
    options: {
      message,
      class: MessageTypeVariant.ERROR,
    },
  } as InfoboxElement);
};

export const transformUnhandledErrors: ErrorTransformer = (widgetProps, error) => {
  const formBag: FormBag = createForm();

  if (!error) {
    formBag.uischema.elements.push({
      type: 'InfoBox',
      options: {
        message: 'oform.error.unexpected',
        class: MessageTypeVariant.ERROR,
        contentType: 'string',
      },
    } as InfoboxElement);
    return formBag;
  }

  if (error && error.xhr && !error.errorSummary) {
    const { xhr } = error;
    if (xhr && xhr.responseText?.includes('messages')) {
      const errorResponse = JSON.parse(xhr.responseText);
      const { messages: { value: [message] } } = errorResponse;
      formBag.uischema.elements.push({
        type: 'InfoBox',
        options: {
          message: message.i18n.key,
          contentParams: message.i18n.params,
          class: MessageTypeVariant.ERROR,
          contentType: 'string',
        },
      } as InfoboxElement);

      // TODO: re-visit, handle side effects in hooks
      // If the session expired, this clears session to allow new transaction bootstrap
      if (message.i18n.key === 'idx.session.expired') {
        const { authClient } = widgetProps;
        authClient?.transactionManager.clear();
      }

      return formBag;
    }
  }

  appendSpecialErrorMessages(formBag.uischema.elements, error.errorSummary, error.errorCode);

  return formBag;
};
