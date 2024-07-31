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

import * as DeviceFingerprintingUtils from './deviceFingerprintingUtils';

describe('DeviceFingerprintingUtils', () => {
  const oktaDomainUrl = '';

  beforeAll(() => {
    const mockForm = document.createElement('form');
    mockForm.setAttribute('data-se', 'o-form');
    document.body.append(mockForm);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockIFrameMessages = (success: boolean, errorMessage?: { type: string }) => {
    const message = success
      ? { type: 'FingerprintAvailable', fingerprint: 'thisIsTheFingerprint' }
      : errorMessage;

    // TODO (jest): event is missing `origin` property
    window.postMessage(JSON.stringify(message), '*');
  };

  const mockUserAgent = (userAgent: string) => {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
  };

  const bypassMessageSourceCheck = () => {
    jest.spyOn(DeviceFingerprintingUtils, 'isMessageFromCorrectSource').mockReturnValue(true);
  };

  it('creates hidden iframe during fingerprint generation', async () => {
    mockIFrameMessages(true);
    bypassMessageSourceCheck();
    const fingerprintPromise = DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl);
    let iframe = document.getElementById('device-fingerprint-container');
    expect(iframe).not.toBeNull();
    expect(iframe).not.toBeVisible();
    expect(iframe?.getAttribute('src')).toBe('/auth/services/devicefingerprint');
    await fingerprintPromise;
    iframe = document.getElementById('device-fingerprint-container');
    expect(iframe).toBeNull();
  });

  it('returns a fingerprint if the communication with the iframe is successful', async () => {
    mockIFrameMessages(true);
    bypassMessageSourceCheck();
    const fingerprint = await DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl);
    expect(fingerprint).toBe('thisIsTheFingerprint');
  });

  it('fails if there is a problem with communicating with the iframe', async () => {
    mockIFrameMessages(false);
    bypassMessageSourceCheck();

    await expect(DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl))
      .rejects
      .toThrow('No data');
    const iframe = document.getElementById('device-fingerprint-container');
    expect(iframe).toBeNull();
  });

  it('fails if the iframe sends invalid message content', async () => {
    mockIFrameMessages(false, { type: 'InvalidMessageType' });
    bypassMessageSourceCheck();

    await expect(DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl))
      .rejects
      .toThrow('No data');
    const iframe = document.getElementById('device-fingerprint-container');
    expect(iframe).toBeNull();
  });

  it('fails if user agent is not defined', async () => {
    mockUserAgent('');
    mockIFrameMessages(true);
    bypassMessageSourceCheck();

    await expect(DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl))
      .rejects
      .toThrow('User agent is not defined');
    const iframe = document.getElementById('device-fingerprint-container');
    expect(iframe).toBeNull();
  });

  it('fails if it is called from a Windows phone', async () => {
    mockUserAgent('Windows Phone');
    mockIFrameMessages(true);
    bypassMessageSourceCheck();

    await expect(DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl))
      .rejects
      .toThrow('Device fingerprint is not supported on Windows phones');
    const iframe = document.getElementById('device-fingerprint-container');
    expect(iframe).toBeNull();
  });

  it('fails if the iframe does not receive any messages', async () => {
    // Not sending any mock messages should trigger a timeout
    await expect(DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl, 1000))
      .rejects
      .toThrow('Device fingerprinting timed out');
    const iframe = document.getElementById('device-fingerprint-container');
    expect(iframe).toBeNull();
  });

  it('fails if there is no form to attach the iframe to', async () => {
    const form = document.querySelector('form[data-se="o-form"]');
    expect(form).not.toBeNull();
    document.body.removeChild(form!);
    await expect(DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl))
      .rejects
      .toThrow('Form does not exist');
    const iframe = document.getElementById('device-fingerprint-container');
    expect(iframe).toBeNull();
  });
});
