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

import { UISchemaElement } from '@jsonforms/core';
import { APIError } from '@okta/okta-auth-js';

import {
  FormBag,
  MessageTypeVariant,
} from '../../types';
import { createForm } from '../utils';

type ErrorTransformer = (error?: APIError) => FormBag;

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
  });
};

export const transformUnhandledErrors: ErrorTransformer = (error) => {
  const formBag: FormBag = createForm();

  if (!error) {
    formBag.uischema.elements.push({
      type: 'InfoBox',
      options: {
        message: 'oform.error.unexpected',
        class: MessageTypeVariant.ERROR,
        contentType: 'string',
      },
    });
    return formBag;
  }

  appendSpecialErrorMessages(formBag.uischema.elements, error.errorSummary, error.errorCode);

  return formBag;
};
