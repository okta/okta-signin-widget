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

const NETWORK_ERROR_PATTERN = /Failed to fetch|Load failed|NetworkError|Network request failed/i;
const TIMEOUT_ERROR_PATTERN = /aborted|timeout|timed out/i;
const PARSE_ERROR_SUMMARY = 'Could not parse server response';

/**
 * Classify an unrecognized error and return the appropriate i18n key
 * for displaying a user-friendly message.
 *
 * This should only be called for errors that are NOT ION responses
 * and do NOT have a usable errorSummary. It inspects properties
 * like xhr, status, name, and errorSummary text to determine the
 * error category.
 */
export function classifyError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'error.unsupported.response';
  }

  const err = error as Record<string, unknown>;
  const xhr = err.xhr as Record<string, unknown> | undefined;
  const errorSummary = (err.errorSummary ?? err.message) as string | undefined;
  const name = err.name as string | undefined;

  // Network error: fetch itself failed (no xhr) with network-related message
  if (!xhr && typeof errorSummary === 'string' && NETWORK_ERROR_PATTERN.test(errorSummary)) {
    return 'error.network.connection';
  }

  // Network error: xhr exists but status is 0 (connection failed)
  if (xhr && xhr.status === 0) {
    return 'error.network.connection';
  }

  // Timeout/abort error
  if (name === 'AbortError'
    || (typeof errorSummary === 'string' && TIMEOUT_ERROR_PATTERN.test(errorSummary))) {
    return 'error.request.timeout';
  }

  // Server error: 5xx status codes
  if (xhr && typeof xhr.status === 'number' && xhr.status >= 500) {
    return 'error.server.internal';
  }

  // Parse error: server returned non-JSON response
  if (typeof errorSummary === 'string' && errorSummary === PARSE_ERROR_SUMMARY) {
    return 'error.server.parse';
  }

  return 'error.unsupported.response';
}
