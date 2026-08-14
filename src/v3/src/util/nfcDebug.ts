/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/*
 * ============================================================================
 * TEMPORARY DEBUG INSTRUMENTATION — OKTA-1250822 (v3 NFC deeplink not re-firing)
 * ----------------------------------------------------------------------------
 * This whole file, and every `nfcDebugLog(...)` / `jtiFromUrl(...)` call that
 * imports it, is throwaway diagnostic logging (custom-uri deep-link tracing).
 * Remove it once the root cause is confirmed. Grep the console for the
 * "[NFC-DEBUG]" prefix to see the trace.
 * ============================================================================
 */
/* eslint-disable no-console */

const decodeJti = (challengeRequest?: string | null): string | undefined => {
  if (!challengeRequest) {
    return undefined;
  }
  try {
    let payload = challengeRequest.split('.')[1];
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4 !== 0) {
      payload += '=';
    }
    // eslint-disable-next-line no-restricted-globals
    const claims = JSON.parse(typeof atob === 'function' ? atob(payload) : '{}');
    return claims.jti as string | undefined;
  } catch {
    return undefined;
  }
};

/**
 * Extracts the `challengeRequest` JWT from a device-challenge URL and returns its
 * `jti`, so console logs can be correlated with the jti values seen in the HAR
 * (e.g. attempt-1 challenge A vs attempt-2 challenge B).
 */
export const jtiFromUrl = (url?: string): string | undefined => {
  if (!url || url.indexOf('challengeRequest=') === -1) {
    return undefined;
  }
  try {
    const query = url.split('?')[1] ?? '';
    return decodeJti(new URLSearchParams(query).get('challengeRequest'));
  } catch {
    return undefined;
  }
};

/**
 * Logs a labelled diagnostic line. If the payload carries a `url`/`href`/
 * `deviceChallengeUrl`, its challenge `jti` is decoded and appended so each log
 * line can be matched to the exact challenge in the HAR.
 */
export const nfcDebugLog = (label: string, data: Record<string, unknown> = {}): void => {
  // Fully defensive: diagnostic logging must NEVER throw or break the auth flow,
  // regardless of what (possibly undefined/malformed) data is passed in.
  try {
    const safeData = data ?? {};
    const url = (safeData.url ?? safeData.href
      ?? safeData.deviceChallengeUrl) as string | undefined;
    const challengeJti = jtiFromUrl(url);
    console.log(`[NFC-DEBUG] ${label}`, { ...safeData, ...(challengeJti ? { challengeJti } : {}) });
  } catch {
    // swallow — never let debug logging surface an error
  }
};
