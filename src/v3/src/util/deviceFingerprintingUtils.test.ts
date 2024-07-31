/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { OktaAuth, OktaAuthIdxInterface } from '@okta/okta-auth-js';
import * as DeviceFingerprintingUtils from './deviceFingerprintingUtils';

describe('DeviceFingerprintingUtils', () => {
  let authClient: OktaAuthIdxInterface;

  beforeAll(() => {
    authClient = new OktaAuth({
      issuer: window.location.origin,
    }) as OktaAuthIdxInterface;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockIFrameMessages = (success: boolean, errorMessage?: { type: string }) => {
    const message = success
      ? { type: 'FingerprintAvailable', fingerprint: 'thisIsTheFingerprint' }
      : errorMessage;

    const iframe = document.querySelector('iframe');
    window.dispatchEvent(new MessageEvent('message', {
      source: iframe?.contentWindow,
      origin: window.location.origin,
      data: JSON.stringify(message)
    }));
  };

  const mockUserAgent = (userAgent: string) => {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
  };

  it('creates hidden iframe during fingerprint generation', async () => {
    const fingerprintPromise = DeviceFingerprintingUtils.generateDeviceFingerprint(authClient);
    let iframe = document.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe).not.toBeVisible();
    expect(iframe?.getAttribute('src')).toBe(window.location.origin + '/auth/services/devicefingerprint');
    mockIFrameMessages(true);
    await fingerprintPromise;
    iframe = document.querySelector('iframe');
    expect(iframe).toBeNull();
  });

  it('returns a fingerprint if the communication with the iframe is successful', async () => {
    const fingerprintPromise = DeviceFingerprintingUtils.generateDeviceFingerprint(authClient);
    mockIFrameMessages(true);
    const fingerprint = await fingerprintPromise;
    expect(fingerprint).toBe('thisIsTheFingerprint');
  });

  it('fails if there is a problem with communicating with the iframe', async () => {
    const fingerprintPromise = DeviceFingerprintingUtils.generateDeviceFingerprint(authClient);
    mockIFrameMessages(false);
    await expect(fingerprintPromise)
      .rejects
      .toThrow('Fingerprinting timed out');
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeNull();
  });

  it('fails if the iframe sends invalid message content', async () => {
    const fingerprintPromise = DeviceFingerprintingUtils.generateDeviceFingerprint(authClient);
    mockIFrameMessages(false, { type: 'InvalidMessageType' });
    await expect(fingerprintPromise)
      .rejects
      .toThrow('No data');
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeNull();
  });

  it('fails if user agent is not defined', async () => {
    mockUserAgent('');
    const fingerprintPromise = DeviceFingerprintingUtils.generateDeviceFingerprint(authClient);
    mockIFrameMessages(true);
    await expect(fingerprintPromise)
      .rejects
      .toThrow('Fingerprinting is not supported on this device');
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeNull();
  });

  it('fails if it is called from a Windows phone', async () => {
    mockUserAgent('Windows Phone');
    const fingerprintPromise = DeviceFingerprintingUtils.generateDeviceFingerprint(authClient);
    mockIFrameMessages(true);
    await expect(fingerprintPromise)
      .rejects
      .toThrow('Fingerprinting is not supported on this device');
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeNull();
  });

  it('fails if the iframe does not receive any messages', async () => {
    // Not sending any mock messages should trigger a timeout
    const fingerprintPromise = DeviceFingerprintingUtils.generateDeviceFingerprint(authClient, 1000);
    await expect(fingerprintPromise)
      .rejects
      .toThrow('Fingerprinting timed out');
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeNull();
  });
});
