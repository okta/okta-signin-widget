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

import {
  CUSTOM_APP_UV_ENABLE_BIOMETRIC_SERVER_KEY,
  OV_UV_ENABLE_BIOMETRIC_SERVER_KEY,
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP,
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE,
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_WINDOWS,
} from '../constants/idxConstants';
import { getBiometricsErrorMessageElement, getSignInWithPasskeyButtonElement } from './formUtils';

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

describe('getBiometricsErrorMessageElement', () => {
  it('returns 3 bullets with displayName for custom app biometrics key', () => {
    const result = getBiometricsErrorMessageElement(CUSTOM_APP_UV_ENABLE_BIOMETRIC_SERVER_KEY, 'MyApp');
    expect(result).toEqual({
      class: 'ERROR',
      title: 'oie.authenticator.custom_app.method.push.verify.enable.biometrics.title',
      description: 'oie.authenticator.custom_app.method.push.verify.enable.biometrics.description',
      message: [
        { class: 'INFO', message: 'oie.authenticator.custom_app.method.push.verify.enable.biometrics.point1' },
        { class: 'INFO', message: 'oie.authenticator.custom_app.method.push.verify.enable.biometrics.point2' },
        { class: 'INFO', message: 'oie.authenticator.custom_app.method.push.verify.enable.biometrics.point3' },
      ],
    });
  });

  it('returns 2 bullets for FastPass Windows key', () => {
    const result = getBiometricsErrorMessageElement(OV_UV_ENABLE_BIOMETRICS_FASTPASS_WINDOWS);
    expect(result).toEqual({
      class: 'ERROR',
      title: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.windows.title',
      description: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.windows.description',
      message: [
        { class: 'INFO', message: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.windows.point1' },
        { class: 'INFO', message: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.windows.point2' },
      ],
    });
  });

  it('returns 4 bullets for FastPass Desktop key', () => {
    const result = getBiometricsErrorMessageElement(OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP);
    expect(result).toEqual({
      class: 'ERROR',
      title: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.title',
      description: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.description',
      message: [
        { class: 'INFO', message: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point1' },
        { class: 'INFO', message: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point2' },
        { class: 'INFO', message: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point3' },
        { class: 'INFO', message: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point4' },
      ],
    });
  });

  it('returns 3 bullets for FastPass Mobile key', () => {
    const result = getBiometricsErrorMessageElement(OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE);
    expect(result).toEqual({
      class: 'ERROR',
      title: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.title',
      description: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.description',
      message: [
        { class: 'INFO', message: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point1' },
        { class: 'INFO', message: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point2' },
        { class: 'INFO', message: 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point3' },
      ],
    });
  });

  it('returns 3 bullets for default OV push/TOTP key', () => {
    const result = getBiometricsErrorMessageElement(OV_UV_ENABLE_BIOMETRIC_SERVER_KEY);
    expect(result).toEqual({
      class: 'ERROR',
      title: 'oie.authenticator.app.method.push.verify.enable.biometrics.title',
      description: 'oie.authenticator.app.method.push.verify.enable.biometrics.description',
      message: [
        { class: 'INFO', message: 'oie.authenticator.app.method.push.verify.enable.biometrics.point1' },
        { class: 'INFO', message: 'oie.authenticator.app.method.push.verify.enable.biometrics.point2' },
        { class: 'INFO', message: 'oie.authenticator.app.method.push.verify.enable.biometrics.point3' },
      ],
    });
  });
});
