import Expect from 'helpers/util/Expect';
import $sandbox from 'sandbox';
import DeviceFingerprint from 'util/DeviceFingerprint';

Expect.describe('DeviceFingerprint', function () {
  function mockIFrameMessages (success, errorMessage) {
    const message = success
      ? {
        type: 'FingerprintAvailable',
        fingerprint: 'thisIsTheFingerprint',
      }
      : errorMessage;

    // TODO (jest): event is missing `origin` propety
    window.postMessage(JSON.stringify(message), '*');
  }

  function mockUserAgent (userAgent) {
    spyOn(DeviceFingerprint, 'getUserAgent').and.callFake(function () {
      return userAgent;
    });
  }

  function bypassMessageSourceCheck () {
    // since we mock the Iframe messages the check to see if the message
    // sent from right iframe would fail.
    spyOn(DeviceFingerprint, 'isMessageFromCorrectSource').and.callFake(function () {
      return true;
    });
  }

  const baseUrl = window.origin || 'file://';

  it('iframe is created with the right src and it is hidden', function () {
    spyOn(window, 'addEventListener');
    DeviceFingerprint.generateDeviceFingerprint('baseUrl', $sandbox);
    const $iFrame = $sandbox.find('iframe');

    expect($iFrame.length).toBe(1);
    expect($iFrame.attr('src')).toBe('baseUrl/auth/services/devicefingerprint');
    expect($iFrame.css('display')).toBe('none');
    expect(window.addEventListener).toHaveBeenCalledWith('message', jasmine.any(Function), false);
  });

  it('returns a fingerprint if the communication with the iframe is successfull', function () {
    mockIFrameMessages(true);
    bypassMessageSourceCheck();
    return DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox).then(function (fingerprint) {
      expect(fingerprint).toBe('thisIsTheFingerprint');
    });
  });

  it('fails if the iframe does not load', function (done) {
    DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
      .then(function () {
        done.fail('Fingerprint promise should have been rejected');
      })
      .catch(function (reason) {
        expect(reason).toBe('service not available');
        const $iFrame = $sandbox.find('iframe');

        expect($iFrame.length).toBe(0);
        done();
      });
  });

  it('clears iframe timeout once the iframe loads', function () {
    mockIFrameMessages(true);
    bypassMessageSourceCheck();
    const originalClearTimeout = window.clearTimeout;

    window.clearTimeout = jasmine.createSpy('clearTimeout');
    return DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox).then(function (fingerprint) {
      expect(fingerprint).toBe('thisIsTheFingerprint');
      expect(window.clearTimeout).toHaveBeenCalled();
      window.clearTimeout = originalClearTimeout;
    });
  });

  it('fails if there is a problem with communicating with the iframe', function (done) {
    mockIFrameMessages(false);
    bypassMessageSourceCheck();
    DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
      .then(function () {
        done.fail('Fingerprint promise should have been rejected');
      })
      .catch(function (reason) {
        expect(reason).toBe('no data');
        const $iFrame = $sandbox.find('iframe');

        expect($iFrame.length).toBe(0);
        done();
      });
  });

  it('fails if there iframe sends and invalid message content', function (done) {
    mockIFrameMessages(false, { type: 'InvalidMessageType' });
    bypassMessageSourceCheck();
    DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
      .then(function () {
        done.fail('Fingerprint promise should have been rejected');
      })
      .catch(function (reason) {
        expect(reason).toBe('no data');
        const $iFrame = $sandbox.find('iframe');

        expect($iFrame.length).toBe(0);
        done();
      });
  });

  it('fails if user agent is not defined', function (done) {
    mockUserAgent();
    mockIFrameMessages(true);
    DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
      .then(function () {
        done.fail('Fingerprint promise should have been rejected');
      })
      .catch(function (reason) {
        const $iFrame = $sandbox.find('iframe');

        expect($iFrame.length).toBe(0);
        expect(reason).toBe('user agent is not defined');
        done();
      });
  });

  it('fails if it is called from a Windows phone', function (done) {
    mockUserAgent('Windows Phone');
    mockIFrameMessages(true);
    DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
      .then(function () {
        done.fail('Fingerprint promise should have been rejected');
      })
      .catch(function (reason) {
        expect(reason).toBe('device fingerprint is not supported on Windows phones');
        const $iFrame = $sandbox.find('iframe');

        expect($iFrame.length).toBe(0);
        done();
      });
  });

  it('ignores if message is not from right iframe', function (done) {
    spyOn(DeviceFingerprint, 'isMessageFromCorrectSource').and.callFake(() => {
      return false;
    });
    mockIFrameMessages(true);
    const messageHandler = () => {
      expect(DeviceFingerprint.isMessageFromCorrectSource).toHaveBeenCalled();

      // When promise either resolved or rejected, the iframe will be removed.
      // Verify the exists of iframe implies promise is neither resolved nor rejected
      const $iFrame = $sandbox.find('iframe');

      expect($iFrame.length).toBe(1);
      expect($iFrame.attr('src')).toBe(baseUrl + '/auth/services/devicefingerprint');
      expect($iFrame.css('display')).toBe('none');

      window.removeEventListener('message', messageHandler, false);
      done();
    };

    DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox);
    expect(DeviceFingerprint.isMessageFromCorrectSource).not.toHaveBeenCalled();

    window.addEventListener('message', messageHandler, false);
  });
});
