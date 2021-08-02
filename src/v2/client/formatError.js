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

import { loc } from 'okta';

export function isOIENotEnabledError(error) {
  // special case: error from interact. `useInteractionCodeFlow` is true but the Org does not have OIE enabled
  // The response is not in IDX format. See playground/mocks/data/oauth2/error-feature-not-enabled.json
  return (error?.error === 'access_denied' && error.error_description);
}

export function formatOIENotEnabledError(error) {
  // This error comes from `oauth2/introspect` so is not an IDX error.
  // simulate an IDX-JS error response
  error = formatIDXError(error);
  const { details } = error;
  const messages = {
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

export function formatIDXError(error) {
  // Make the error object resemble an IDX response
  error.details = error.details || {};
  const { details } = error;
  details.rawIdxState = details.rawIdxState || {};
  details.context = details.context || {};
  details.neededToProceed = details.neededToProceed || [];

  // Populate generic error message if there isn't any.
  if (!details.rawIdxState.messages) {
    const idxMessage = {
      type: 'array',
      value: [
        {
          message: loc('oform.error.unexpected', 'login'),
          class: 'ERROR'
        }
      ]
    };
    details.rawIdxState.messages = idxMessage;
    details.context.messages = idxMessage;
  }

  return error;
}

export function formatError(error) {
  // If the error is a string, wrap it in an Error object
  if (typeof error === 'string') {
    error = new Error(error);
  }

  // special case: error from interact. `useInteractionCodeFlow` is true but the Org does not have OIE enabled
  // The response is not in IDX format. See playground/mocks/data/oauth2/error-feature-not-enabled.json
  if (isOIENotEnabledError(error)) {
    return formatOIENotEnabledError(error);
  }
  
  error = formatIDXError(error);
  return error;
}