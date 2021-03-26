import $sandbox from 'sandbox';
import DeviceFingerprinting from 'v2/view-builder/utils/DeviceFingerprinting';

describe('DeviceFingerprinting', function () {
  const testContext = {};

  beforeEach(() => {
    testContext.fingerprintData = {
      // HACK - mock events do not have the "origin". We can get around this by setting the
      // checked domain to an empty string.
      oktaDomainUrl: '',
      element: $sandbox,
    };
  });

  afterEach(() => {    
    $sandbox.empty();
  });

  function mockIFrameMessages (success, errorMessage) {
    const message = success
      ? { type: 'FingerprintAvailable', fingerprint: 'thisIsTheFingerprint' }
      : errorMessage;

    // TODO (jest): event is missing `origin` property
    window.postMessage(JSON.stringify(message), '*');
  }

  function mockUserAgent (userAgent) {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
  }

  function bypassMessageSourceCheck () {
    jest.spyOn(DeviceFingerprinting, 'isMessageFromCorrectSource').mockReturnValue(true);
  }

  it('returns a fingerprint if the communication with the iframe is successful', async () => {
    mockIFrameMessages(true);
    bypassMessageSourceCheck();
    const fingerprint = await DeviceFingerprinting.generateDeviceFingerprint(testContext.fingerprintData);
    expect(fingerprint).toBe('thisIsTheFingerprint');
  });

  it('fails if the iframe does not load', async () => {
    try {
      await DeviceFingerprinting.generateDeviceFingerprint(testContext.fingerprintData);
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

    return DeviceFingerprinting.generateDeviceFingerprint(testContext.fingerprintData)
      .then(fingerprint => {
        expect(fingerprint).toBe('thisIsTheFingerprint');
        expect(clearTimeoutSpy).toHaveBeenCalled();
      });
  });

  it('fails if there is a problem with communicating with the iframe', async () => {
    mockIFrameMessages(false);
    bypassMessageSourceCheck();
    try {
      await DeviceFingerprinting.generateDeviceFingerprint(testContext.fingerprintData);
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
      await DeviceFingerprinting.generateDeviceFingerprint(testContext.fingerprintData);
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
      await DeviceFingerprinting.generateDeviceFingerprint(testContext.fingerprintData);
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
      await DeviceFingerprinting.generateDeviceFingerprint(testContext.fingerprintData);
      fail('Fingerprint promise should have been rejected');
    } catch (reason) {
      const $iFrame = $sandbox.find('iframe');

      expect($iFrame.length).toBe(0);
      expect(reason).toBe('device fingerprint is not supported on Windows phones');
    }
  });
});
