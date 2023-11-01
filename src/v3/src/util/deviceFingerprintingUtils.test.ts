import DeviceFingerprintingUtils from './deviceFingerprintingUtils';

describe('DeviceFingerprintingUtils', () => {
  const oktaDomainUrl = '';

  beforeAll(() => {
    const mockForm = document.createElement('form');
    mockForm.setAttribute('data-se', 'o-form');
    document.body.append(mockForm);
  })

  function mockIFrameMessages(success: boolean, errorMessage?: { type: string }) {
    const message = success
      ? { type: 'FingerprintAvailable', fingerprint: 'thisIsTheFingerprint' }
      : errorMessage;

    // TODO (jest): event is missing `origin` property
    window.postMessage(JSON.stringify(message), '*');
  }

  function mockUserAgent(userAgent: string) {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
  }

  function bypassMessageSourceCheck() {
    jest.spyOn(DeviceFingerprintingUtils, 'isMessageFromCorrectSource').mockReturnValue(true);
  }

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

  it('fails if the iframe does not load', async () => {
    try {
      await DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl);
      fail('Fingerprint promise should have been rejected');
    } catch (reason) {
      expect(reason).toBe('Service not available');
      const iframe = document.getElementById('device-fingerprint-container');
      expect(iframe).toBeNull();
    }
  });

  it('clears iframe timeout once the iframe loads', async () => {
    mockIFrameMessages(true);
    bypassMessageSourceCheck();

    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

    return DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl)
      .then(fingerprint => {
        expect(fingerprint).toBe('thisIsTheFingerprint');
        expect(clearTimeoutSpy).toHaveBeenCalled();
      });
  });

  it('fails if there is a problem with communicating with the iframe', async () => {
    mockIFrameMessages(false);
    bypassMessageSourceCheck();
    try {
      await DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl);
      fail('Fingerprint promise should have been rejected');
    } catch (reason) {
      expect(reason).toBe('No data');
      const iframe = document.getElementById('device-fingerprint-container');
      expect(iframe).toBeNull();
    }
  });

  it('fails if there iframe sends and invalid message content', async () => {
    mockIFrameMessages(false, { type: 'InvalidMessageType' });
    bypassMessageSourceCheck();

    try {
      await DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl);
      fail('Fingerprint promise should have been rejected');
    } catch (reason) {
      expect(reason).toBe('No data');
      const iframe = document.getElementById('device-fingerprint-container');
      expect(iframe).toBeNull();
    }
  });

  it('fails if user agent is not defined', async () => {
    mockUserAgent('');
    mockIFrameMessages(true);
    try {
      await DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl);
      fail('Fingerprint promise should have been rejected');
    } catch (reason) {
      expect(reason).toBe('User agent is not defined');
      const iframe = document.getElementById('device-fingerprint-container');
      expect(iframe).toBeNull();
    }
  });

  it('fails if it is called from a Windows phone', async () => {
    mockUserAgent('Windows Phone');
    mockIFrameMessages(true);
    try {
      await DeviceFingerprintingUtils.generateDeviceFingerprint(oktaDomainUrl);
      fail('Fingerprint promise should have been rejected');
    } catch (reason) {
      expect(reason).toBe('Device fingerprint is not supported on Windows phones');
      const iframe = document.getElementById('device-fingerprint-container');
      expect(iframe).toBeNull();
    }
  });
});
