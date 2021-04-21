import $sandbox from 'sandbox';
import DeviceFingerprint from 'util/DeviceFingerprint';

describe('DeviceFingerprint', () => {
  function mockIFrameMessages(success, errorMessage) {
    const message = success
      ? { type: 'FingerprintAvailable', fingerprint: 'thisIsTheFingerprint' }
      : errorMessage;

    // TODO (jest): event is missing `origin` propety
    window.postMessage(JSON.stringify(message), '*');
  }

  function mockUserAgent(userAgent) {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
  }

  function bypassMessageSourceCheck(bypass = true) {
    // since we mock the Iframe messages the check to see if the message
    // sent from right iframe would fail.
    jest.spyOn(DeviceFingerprint, 'isMessageFromCorrectSource').mockReturnValue(bypass);
  }

  // HACK - mock events do not have the "origin". We can get around this by setting the
  // checked domain to an empty string.
  const baseUrl = '';

  it('iframe is created with the right src and it is hidden', () => {
    jest.spyOn(window, 'addEventListener');
    DeviceFingerprint.generateDeviceFingerprint('baseUrl', $sandbox);
    const $iFrame = $sandbox.find('iframe');

    expect($iFrame.length).toBe(1);
    expect($iFrame.attr('src')).toBe('baseUrl/auth/services/devicefingerprint');
    expect($iFrame.css('display')).toBe('none');
    expect(window.addEventListener).toHaveBeenCalledWith('message', expect.any(Function), false);
  });

  it('returns a fingerprint if the communication with the iframe is successful', async () => {
    mockIFrameMessages(true);
    bypassMessageSourceCheck();
    const fingerprint = await DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox);
    expect(fingerprint).toBe('thisIsTheFingerprint');
  });

  it('fails if the iframe does not load', async () => {
    try {
      await DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox);
      fail('Fingerprint promise should have been rejected');
    } catch (reason) {
      expect(reason).toBe('service not available');
      const $iFrame = $sandbox.find('iframe');
      expect($iFrame.length).toBe(0);
    }
  });

  it('clears iframe timeout once the iframe loads', async () => {
    mockIFrameMessages(true);
    bypassMessageSourceCheck();
    
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    const fingerprint = await DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox);
    expect(fingerprint).toBe('thisIsTheFingerprint');
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('fails if there is a problem with communicating with the iframe', async () => {
    mockIFrameMessages(false);
    bypassMessageSourceCheck();

    try {
      await DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox);
      fail('Fingerprint promise should have been rejected');
    } catch (reason) {
      expect(reason).toBe('no data');
      const $iFrame = $sandbox.find('iframe');
      expect($iFrame.length).toBe(0);
    }
  });

  it('fails if there iframe sends and invalid message content', async () => {
    mockIFrameMessages(false, { type: 'InvalidMessageType' });
    bypassMessageSourceCheck();

    try {
      await DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox);
      fail('Fingerprint promise should have been rejected');
    } catch (reason) {
      expect(reason).toBe('no data');
      const $iFrame = $sandbox.find('iframe');
      expect($iFrame.length).toBe(0);
    }
  });

  it('fails if user agent is not defined', async () => {
    mockUserAgent();
    mockIFrameMessages(true);

    try {
      await DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox);
      fail('Fingerprint promise should have been rejected');
    } catch (reason) {
      const $iFrame = $sandbox.find('iframe');
      expect($iFrame.length).toBe(0);
      expect(reason).toBe('user agent is not defined');
    }
  });

  it('fails if it is called from a Windows phone', async () => {
    mockUserAgent('Windows Phone');
    mockIFrameMessages(true);

    try {
      await DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox);
      fail('Fingerprint promise should have been rejected');
    } catch (reason) {
      expect(reason).toBe('device fingerprint is not supported on Windows phones');
      const $iFrame = $sandbox.find('iframe');
      expect($iFrame.length).toBe(0);
    }
  });

  it('ignores if message is not from right iframe', async () => {
    bypassMessageSourceCheck(false);
    mockIFrameMessages(true);

    const messageHandler = () => {
      // When promise either resolved or rejected, the iframe will be removed.
      // Verify the exists of iframe implies promise is neither resolved nor rejected
      const $iFrame = $sandbox.find('iframe');

      expect($iFrame.length).toBe(1);
      expect($iFrame.attr('src')).toBe(baseUrl + '/auth/services/devicefingerprint');
      expect($iFrame.css('display')).toBe('none');

      window.removeEventListener('message', messageHandler, false);
    };

    window.addEventListener('message', messageHandler, false);

    try {
      await DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox);
      fail('Fingerprint promise should have been rejected');
    } catch {
      expect(DeviceFingerprint.isMessageFromCorrectSource).toHaveBeenCalled();
    }
  });
});
