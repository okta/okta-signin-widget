/*!
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
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
  IdxContext,
  IdxMessages,
  IdxResponse,
  RawIdxResponse
} from '@okta/okta-auth-js';
import { loc } from '@okta/courage';

export interface LegacyIdxError {
  error: string;
  details: IdxResponse
}

export interface StandardApiError {
  error: string;
  error_description: string;
}

export function isInvalidRecoveryTokenError(error): error is StandardApiError {
  // special case: error from interact when passing an (invalid) recovery token
  return (error?.error === 'invalid_request' && error.error_description === 'The recovery token is invalid');
}

export function isInvalidActivationTokenError(error): error is StandardApiError {
  // special case: error from interact when passing an (invalid) activation token
  return (error?.error === 'invalid_request' && error.error_description === 'The activation token is invalid');
}

export function formatInvalidRecoveryTokenError(error: StandardApiError) {
  // This error comes from `oauth2/interact` so is not an IDX error.
  // simulate an IDX-JS error response
  const idxError = formatIDXError(error);
  const { details } = idxError;
  const messages: IdxMessages = {
    type: 'array',
    value: [
      {
        message: error.error_description,
        i18n: {
          key: 'oie.invalid.recovery.token'
        },
        class: 'ERROR'
      }
    ],
  };
  details.rawIdxState.messages = messages;
  details.context.messages = messages;
  return idxError;
}

export function formatInvalidActivationTokenError(error: StandardApiError) {
  // This error comes from `oauth2/interact` so is not an IDX error.
  // simulate an IDX-JS error response
  const idxError = formatIDXError(error);
  const { details } = idxError;
  const messages: IdxMessages = {
    type: 'array',
    value: [
      {
        message: error.error_description,
        i18n: {
          key: 'idx.missing.activation.token'
        },
        class: 'ERROR'
      }
    ],
  };
  details.rawIdxState.messages = messages;
  details.context.messages = messages;
  return idxError;
}

export function isOIENotEnabledError(error): error is StandardApiError {
  // special case: error from interact when the Org does not have OIE enabled
  // The response is not in IDX format. See playground/mocks/data/oauth2/error-feature-not-enabled.json
  return (error?.error === 'access_denied' && error.error_description);
}

export function formatOIENotEnabledError(error: StandardApiError) {
  // This error comes from `oauth2/interact` so the error is in OAuth format
  // simulate an IDX-JS error response
  const idxError = formatIDXError(error);
  const { details } = idxError;
  const messages: IdxMessages = {
    type: 'array',
    value: [
      {
        message: error.error_description,
        i18n: {
          key: 'oie.feature.disabled'
        },
        class: 'ERROR'
      }
    ],
  };
  details.rawIdxState.messages = messages;
  details.context.messages = messages;
  return error;
}

export function isOIEConfigurationError(error): error is StandardApiError {
  return (error?.error && error.error_description);
}

export function formatOIEConfigurationError(error) {
  // This error comes from `oauth2/interact` so the error is in OAuth format
  // simulate an IDX-JS error response
  const idxError = formatIDXError(error);
  const { details } = idxError;
  const messages: IdxMessages = {
    type: 'array',
    value: [
      {
        message: loc('oie.configuration.error', 'login'),
        class: 'ERROR',
        i18n: undefined
      }
    ],
  };
  details.rawIdxState.messages = messages;
  details.context.messages = messages;
  return error;
}

export function formatIDXError(error: LegacyIdxError | StandardApiError | Error): LegacyIdxError {
  // Make the error object resemble an IDX response
  const idxError = error as LegacyIdxError;
  idxError.details = idxError.details || {} as IdxResponse;
  const { details } = idxError;
  details.rawIdxState = details.rawIdxState || {} as RawIdxResponse;
  details.context = details.context || {} as IdxContext;
  details.neededToProceed = details.neededToProceed || [];

  // Populate generic error message if there isn't any.
  if (!details.rawIdxState.messages) {
    const idxMessage: IdxMessages = {
      type: 'array',
      value: [
        {
          message: loc('oform.error.unexpected', 'login'),
          class: 'ERROR',
          i18n: undefined
        }
      ]
    };
    details.rawIdxState.messages = idxMessage;
    details.context.messages = idxMessage;
  }

  return idxError;
}

export function formatError(error: string | Error | LegacyIdxError | StandardApiError) {
  // If the error is a string, wrap it in an Error object
  if (typeof error === 'string') {
    error = new Error(error);
  }

  // special case error handling

  // invalid reccovery token
  if (isInvalidRecoveryTokenError(error)) {
    return formatInvalidRecoveryTokenError(error);
  }

  // invalid activation token
  if (isInvalidActivationTokenError(error)) {
    return formatInvalidActivationTokenError(error);
  }

  // OIE is not enabled
  if (isOIENotEnabledError(error)) {
    return formatOIENotEnabledError(error);
  }

  // Other errors from /interact in OAuth format
  if (isOIEConfigurationError(error)) {
    return formatOIEConfigurationError(error);
  }

  error = formatIDXError(error);
  return error;
}