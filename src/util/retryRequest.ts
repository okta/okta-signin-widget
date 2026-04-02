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

import { classifyError } from './errorClassifier';

const RETRYABLE_ERROR_KEYS = [
  'error.network.connection',
  'error.request.timeout',
  // A proxy/VPN 403 is retryable — the VPN may connect within the retry delay
  'error.network.policy',
];

function isRetryableError(error: unknown): boolean {
  const i18nKey = classifyError(error);
  return RETRYABLE_ERROR_KEYS.includes(i18nKey);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

/**
 * Wrap an async function with a single automatic retry on network errors.
 * If the function throws a retryable error (network or timeout), it waits
 * `delayMs` and retries once. Non-retryable errors are re-thrown immediately.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function withNetworkRetry<T = any>(
  fn: () => Promise<T> | T,
  { maxRetries = 1, delayMs = 1000 } = {},
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries && isRetryableError(error)) {
        await delay(delayMs);
      } else {
        throw error;
      }
    }
  }
  // Should not be reached, but satisfy TypeScript
  throw lastError;
}
