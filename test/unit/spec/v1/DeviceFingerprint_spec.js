import $sandbox from 'sandbox';
import { OktaAuth } from '@okta/okta-auth-js';
import DeviceFingerprint from 'v1/util/DeviceFingerprint';

describe('DeviceFingerprint', () => {
  function mockIFrameMessages(success, errorMessage, source) {
    const message = success
      ? { type: 'FingerprintAvailable', fingerprint: 'thisIsTheFingerprint' }
      : errorMessage;

    const iframe = document.querySelector('iframe:last-child');
    window.dispatchEvent(new MessageEvent('message', {
      source: source ?? iframe?.contentWindow,
      origin: window.location.origin,
      data: JSON.stringify(message)
    }));
  }

  function setup() {
    const authClient = new OktaAuth({
      issuer: window.location.origin,
    });
    const fingerprintPromise = DeviceFingerprint.generateDeviceFingerprint(authClient, $sandbox[0]);
    const $iFrame = $sandbox.find('iframe');
    return {
      authClient,
      $iFrame,
      fingerprintPromise,
    };
  }

  function mockUserAgent(userAgent) {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
  }

  it('iframe is created with the right src and it is hidden', async () => {
    jest.spyOn(window, 'addEventListener');
    const { $iFrame, fingerprintPromise } = setup();
    expect($iFrame.length).toBe(1);
    expect($iFrame.attr('src')).toBe(window.location.origin + '/auth/services/devicefingerprint');
    expect($iFrame.css('display')).toBe('none');
    expect(window.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    try {
      await fingerprintPromise;
      fail('Fingerprint promise should have been rejected');
    } catch (_e) {
      const $iFrame = $sandbox.find('iframe');
      expect($iFrame.length).toBe(0);
    }
  });

  it('returns a fingerprint if the communication with the iframe is successful', async () => {
    const { fingerprintPromise } = setup();
    mockIFrameMessages(true);
    const fingerprint = await fingerprintPromise;
    expect(fingerprint).toBe('thisIsTheFingerprint');
  });

  it('fails if the iframe does not load', async () => {
    const { fingerprintPromise } = setup();
    try {
      await fingerprintPromise;
      fail('Fingerprint promise should have been rejected');
    } catch (e) {
      expect(e.message).toBe('Fingerprinting timed out');
      const $iFrame = $sandbox.find('iframe');
      expect($iFrame.length).toBe(0);
    }
  });

  it('clears iframe timeout once the iframe loads', async () => {
    const { fingerprintPromise } = setup();
    mockIFrameMessages(true);
    
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    const fingerprint = await fingerprintPromise;
    expect(fingerprint).toBe('thisIsTheFingerprint');
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('fails if there is a problem with communicating with the iframe', async () => {
    const { fingerprintPromise } = setup();
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
    const { fingerprintPromise } = setup();
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
    const { fingerprintPromise } = setup();
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
    const { fingerprintPromise } = setup();
    mockIFrameMessages(true);

    try {
      await fingerprintPromise;
      fail('Fingerprint promise should have been rejected');
    } catch (e) {
      expect(e.message).toBe('Fingerprinting is not supported on this device');
      const $iFrame = $sandbox.find('iframe');
      expect($iFrame.length).toBe(0);
    }
  });

  it('ignores if message is not from right iframe', async () => {
    const { fingerprintPromise } = setup();
    mockIFrameMessages(true, undefined, window);

    try {
      await fingerprintPromise;
      fail('Fingerprint promise should have been rejected');
    } catch {
      const $iFrame = $sandbox.find('iframe');
      expect($iFrame.length).toBe(0);
    }
  });
});
