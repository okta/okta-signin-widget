/*!
 * Copyright (c) 2026, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { loc } from '@okta/courage';
import IonResponseHelper from './IonResponseHelper';

/**
 * Build a normalized error object from various error shapes
 * (IDX response, API error, network error, etc.).
 *
 * @param {object} error - the raw error (or rawIdxState if already unwrapped)
 * @param {function} [onUnsupportedError] - optional callback invoked when error is unrecognized
 * @returns {object} errorObj with responseJSON
 */
const buildErrorObject = (error, onUnsupportedError) => {
  if (IonResponseHelper.isIonErrorResponse(error)) {
    return IonResponseHelper.convertFormErrors(error);
  } else if (error.errorSummary) {
    return { responseJSON: error };
  } else {
    if (typeof onUnsupportedError === 'function') {
      onUnsupportedError(error);
    }
    return { responseJSON: { errorSummary: loc('error.unsupported.response', 'login') } };
  }
};

/**
 * Check if error is a rate limit error (429).
 * Handles both IDX API errors (tooManyRequests key) and standard API errors (E0000047 errorCode).
 */
const isRateLimitError = (error) => {
  return !!(error.responseJSON?.errorSummaryKeys?.includes('tooManyRequests')
    || ((error.responseJSON?.errorCode === 'E0000047') && !error.responseJSON?.errorIntent));
};

export default {
  buildErrorObject,
  isRateLimitError,
};
