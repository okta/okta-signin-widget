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
import { classifyError } from '../../util/errorClassifier';

/**
 * Build a normalized error object from various error shapes
 * (IDX response, API error, network error, etc.).
 *
 * @param {object} error - the raw error (or rawIdxState if already unwrapped)
 * @param {function} [onUnsupportedError] - optional callback invoked when error is unrecognized
 * @param {object} [originalError] - the original error before unwrapping rawIdxState,
 *   which may contain xhr/status info needed for classification
 * @returns {object} errorObj with responseJSON
 */
const buildErrorObject = (error, onUnsupportedError, originalError) => {
  if (IonResponseHelper.isIonErrorResponse(error)) {
    return IonResponseHelper.convertFormErrors(error);
  }

  // Classify the error (or original error before rawIdxState unwrapping) to
  // provide a specific, user-friendly message for network, server, parse, and
  // timeout errors instead of raw browser messages like "Failed to fetch".
  const errorToClassify = originalError || error;
  const i18nKey = classifyError(errorToClassify);
  if (i18nKey !== 'error.unsupported.response') {
    return { responseJSON: { errorSummary: loc(i18nKey, 'login') } };
  }

  if (error.errorSummary) {
    return { responseJSON: error };
  }

  if (typeof onUnsupportedError === 'function') {
    onUnsupportedError(error);
  }
  return { responseJSON: { errorSummary: loc('error.unsupported.response', 'login') } };
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
