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

import { IdxTransaction } from '@okta/okta-auth-js';

import { ChromeLNADeniedError } from '../../../util/Errors';

export const isAndroid = (): boolean => (
  // Windows Phone also contains "Android"
  /android/i.test(navigator.userAgent)
    && !/windows phone/i.test(navigator.userAgent)
);

export const isIOS = (): boolean => (
  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  /iPad|iPhone|iPod/i.test(navigator.userAgent)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
);

export const getChromeLNAPermissionState = async (
  handlePermissionState: (currPermissionState?: PermissionState) => void,
) => {
  if (!navigator.permissions || typeof navigator.permissions.query !== 'function') {
    handlePermissionState(undefined);
    return;
  }

  try {
    let result: PermissionStatus;
    try {
      // Query for the new granular `loopback-network` permission only available on Chromium 145+
      result = await navigator.permissions.query({ name: 'loopback-network' as any });
    } catch (e) {
      // Fallback to the legacy `local-network-access` aggregate permission on < Chromium 145
      result = await navigator.permissions.query({ name: 'local-network-access' as any });
    }
    handlePermissionState(result.state);
  } catch (error) {
    if (error instanceof ChromeLNADeniedError) {
      throw error; // Rethrow custom Chrome LNA denied error so Sentry can capture it for monitoring
    }

    // If both queries fail or the browser blocks the API entirely
    handlePermissionState(undefined);
  }
};

export const isAndroidOrIOS = (): boolean => isAndroid() || isIOS();

// Marker property set on a client-side (cloned) transaction to signal that a FastPass
// loopback attempt failed while the browser reported the Local Network Access (LNA)
// permission as blocked. When present:
//  - transformOktaVerifyFPLoopbackPoll renders the LNA remediation view instead of the
//    LoopbackProbe (so it does not re-probe), and
//  - usePolling stops polling (getPollingStep returns undefined),
// giving a stable terminal error with no server round-trip. See LoopbackProbe.tsx.
const CHROME_LNA_DENIED_MARKER = 'chromeLNADenied';

type ChromeLNADeniedMarked = { [CHROME_LNA_DENIED_MARKER]?: boolean };

export const markChromeLNADeniedTransaction = (
  transaction: IdxTransaction,
): IdxTransaction => ({
  ...transaction,
  [CHROME_LNA_DENIED_MARKER]: true,
} as IdxTransaction);

export const isChromeLNADeniedTransaction = (transaction?: unknown): boolean => (
  !!transaction && (transaction as ChromeLNADeniedMarked)[CHROME_LNA_DENIED_MARKER] === true
);
