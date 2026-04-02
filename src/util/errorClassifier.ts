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
 * Check whether a response originated from an Okta server rather than a
 * network intermediary (corporate proxy, VPN gateway, WAF, CDN, etc.).
 *
 * auth-js's fetchRequest.js already converts all response headers into a
 * plain object with lowercase keys on the xhr.headers property:
 *
 *   for (const pair of response.headers.entries()) {
 *     headers[pair[0]] = pair[1];
 *   }
 *
 * Okta always includes x-okta-request-id on every HTTP response (including
 * error responses like 401/403). A response without this header almost
 * certainly came from a non-Okta intermediary.
 */
function isOktaResponse(xhr: Record<string, unknown> | undefined): boolean {
  if (!xhr) return false;
  const headers = xhr.headers as Record<string, string> | undefined;
  // Header keys are lowercase per fetchRequest.js formatResult()
  return !!headers?.['x-okta-request-id'];
}

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

  // Network policy block: 403 from a non-Okta intermediary (VPN/proxy/WAF).
  // When a laptop wakes from sleep and the VPN hasn't reconnected yet, a
  // corporate proxy or network zone DENY rule may return 403 before the
  // request reaches Okta. We distinguish this from a legitimate Okta 403
  // by checking for the x-okta-request-id header, which is present on all
  // Okta-originated responses but absent from proxy/gateway responses.
  if (xhr && xhr.status === 403 && !isOktaResponse(xhr)) {
    return 'error.network.policy';
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

// 30 minutes in milliseconds
const STALE_SESSION_THRESHOLD_MS = 30 * 60 * 1000;

/**
 * Determine if a failed request is likely due to a stale/expired session.
 * Returns true when a network or server error occurs AND the session is
 * older than the staleness threshold (30 minutes).
 *
 * This heuristic catches the "laptop closed overnight" scenario where the
 * server-side session has expired but the client still has a stateHandle.
 */
export function isLikelyStaleSession(error: unknown, sessionAgeMs: number): boolean {
  if (sessionAgeMs < STALE_SESSION_THRESHOLD_MS) {
    return false;
  }
  const i18nKey = classifyError(error);
  return i18nKey === 'error.network.connection'
    || i18nKey === 'error.request.timeout'
    || i18nKey === 'error.server.internal'
    || i18nKey === 'error.network.policy';
}
