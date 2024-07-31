import $sandbox from 'sandbox';
import { OktaAuth } from '@okta/okta-auth-js';
import DeviceFingerprinting from 'v2/view-builder/utils/DeviceFingerprinting';

describe('DeviceFingerprinting', () => {
  const testContext = {};

  beforeEach(() => {
    testContext.authClient = new OktaAuth({
      issuer: window.location.origin,
    });
  });

  afterEach(() => {
    $sandbox.empty();
  });

  function mockIFrameMessages(success, errorMessage) {
    const message = success
      ? { type: 'FingerprintAvailable', fingerprint: 'thisIsTheFingerprint' }
      : errorMessage;

    const iframe = document.querySelector('iframe');
    window.dispatchEvent(new MessageEvent('message', {
      source: iframe?.contentWindow,
      origin: window.location.origin,
      data: JSON.stringify(message)
    }));
  }

  function mockUserAgent(userAgent) {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
  }

  it('creates hidden iframe during fingerprint generation', async () => {
    const fingerprintPromise = DeviceFingerprinting.generateDeviceFingerprint(testContext.authClient, $sandbox);
    mockIFrameMessages(true);
    let $iFrame = $sandbox.find('iframe');
    expect($iFrame.length).toBe(1);
    expect($iFrame.is(':hidden')).toBe(true);
    expect($iFrame.attr('src')).toBe(window.location.origin + '/auth/services/devicefingerprint');
    await fingerprintPromise;
    $iFrame = $sandbox.find('iframe');
    expect($iFrame.length).toBe(0);
  });

  it('returns a fingerprint if the communication with the iframe is successful', async () => {
    const fingerprintPromise = DeviceFingerprinting.generateDeviceFingerprint(testContext.authClient, $sandbox);
    mockIFrameMessages(true);
    const fingerprint = await fingerprintPromise;
    expect(fingerprint).toBe('thisIsTheFingerprint');
  });

  it('fails if the iframe does not load', async () => {
    try {
      const fingerprintPromise = DeviceFingerprinting.generateDeviceFingerprint(testContext.authClient, $sandbox);
      await fingerprintPromise;
      fail('Fingerprint promise should have been rejected');
    } catch (e) {
      expect(e.message).toBe('Fingerprinting timed out');
      const $iFrame = $sandbox.find('iframe');
      expect($iFrame.length).toBe(0);
    }
  });

  it('clears iframe timeout once the iframe loads', async () => {
    const fingerprintPromise = DeviceFingerprinting.generateDeviceFingerprint(testContext.authClient, $sandbox);
    mockIFrameMessages(true);

    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

    return fingerprintPromise
      .then(fingerprint => {
        expect(fingerprint).toBe('thisIsTheFingerprint');
        expect(clearTimeoutSpy).toHaveBeenCalled();
      });
  });

  it('fails if there is a problem with communicating with the iframe', async () => {
    const fingerprintPromise = DeviceFingerprinting.generateDeviceFingerprint(testContext.authClient, $sandbox);
    mockIFrameMessages(false);
    try {
      await fingerprintPromise;
      fail('Fingerprint promise should have been rejected');
    } catch (e) {
      expect(e.message).toBe('Fingerprinting timed out');
      const $iFrame = $sandbox.find('iframe');
      expect($iFrame.length).toBe(0);
    }
  });

  it('fails if there iframe sends and invalid message content', async () => {
    const fingerprintPromise = DeviceFingerprinting.generateDeviceFingerprint(testContext.authClient, $sandbox);
    mockIFrameMessages(false, { type: 'InvalidMessageType' });

    try {
      await fingerprintPromise;
      fail('Fingerprint promise should have been rejected');
    } catch (e) {
      expect(e.message).toBe('No data');
      const $iFrame = $sandbox.find('iframe');
      expect($iFrame.length).toBe(0);
    }
  });

  it('fails if user agent is not defined', async () => {
    mockUserAgent();
    const fingerprintPromise = DeviceFingerprinting.generateDeviceFingerprint(testContext.authClient, $sandbox);
    mockIFrameMessages(true);
    try {
      await fingerprintPromise;
      fail('Fingerprint promise should have been rejected');
    } catch (e) {
      const $iFrame = $sandbox.find('iframe');

      expect($iFrame.length).toBe(0);
      expect(e.message).toBe('Fingerprinting is not supported on this device');
    }
  });

  it('fails if it is called from a Windows phone', async () => {
    mockUserAgent('Windows Phone');
    const fingerprintPromise = DeviceFingerprinting.generateDeviceFingerprint(testContext.authClient, $sandbox);
    mockIFrameMessages(true);
    try {
      await fingerprintPromise;
      fail('Fingerprint promise should have been rejected');
    } catch (e) {
      const $iFrame = $sandbox.find('iframe');

      expect($iFrame.length).toBe(0);
      expect(e.message).toBe('Fingerprinting is not supported on this device');
    }
  });
});
