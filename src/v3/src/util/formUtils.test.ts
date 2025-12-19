/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { getSignInWithPasskeyButtonElement } from './formUtils';

describe('getSignInWithPasskeyButtonElement', () => {
  it('returns empty array if no LAUNCH_PASSKEYS_AUTHENTICATOR step', () => {
    const transaction = { availableSteps: [] };
    expect(getSignInWithPasskeyButtonElement(transaction as any)).toEqual([]);
  });

  it('returns button element if LAUNCH_PASSKEYS_AUTHENTICATOR step exists', () => {
    const transaction = {
      availableSteps: [
        {
          name: 'launch-passkeys-authenticator',
          relatesTo: { value: { challengeData: { foo: 'bar' } } },
        },
      ],
    };
    const result = getSignInWithPasskeyButtonElement(transaction as any);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('LaunchPasskeysAuthenticatorButton');
    expect(typeof result[0].options.getCredentials).toBe('function');
  });
});
