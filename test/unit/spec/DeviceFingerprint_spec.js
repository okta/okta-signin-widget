define([
  'okta/jquery',
  'vendor/lib/q',
  'helpers/util/Expect',
  'sandbox',
  'util/DeviceFingerprint'
],
function ($, Q, Expect, $sandbox, DeviceFingerprint) {

  Expect.describe('DeviceFingerprint', function () {

    function mockIFrameMessages(success, errorMessage) {
      var message = success ? {
        type: 'FingerprintAvailable',
        fingerprint: 'thisIsTheFingerprint'
      } : errorMessage;
      window.postMessage(JSON.stringify(message), '*');
    }

    function mockUserAgent(userAgent) {
      spyOn(DeviceFingerprint, 'getUserAgent').and.callFake(function() {
        return userAgent;
      });
    }

    function bypassMessageSourceCheck() {
      // since we mock the Iframe messages the check to see if the message
      // sent from right iframe would fail.
      spyOn(DeviceFingerprint, 'isMessageFromCorrectSource').and.callFake(function() {
        return true;
      });
    }

    var baseUrl = window.origin || 'file://';

    it('iframe is created with the right src and it is hidden', function () {
      spyOn(window, 'addEventListener');
      DeviceFingerprint.generateDeviceFingerprint('baseUrl', $sandbox);
      var $iFrame = $sandbox.find('iframe');
      expect($iFrame).toExist();
      expect($iFrame.attr('src')).toBe('baseUrl/auth/services/devicefingerprint');
      expect($iFrame.is(':visible')).toBe(false);
      expect(window.addEventListener).toHaveBeenCalledWith('message', jasmine.any(Function), false);
    });

    it('returns a fingerprint if the communication with the iframe is successfull', function (done) {
      mockIFrameMessages(true);
      bypassMessageSourceCheck();
      DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
      .then(function (fingerprint) {
        expect(fingerprint).toBe('thisIsTheFingerprint');
        done();
      })
      .fail(function (reason) {
        done.fail('Fingerprint promise incorrectly failed. ' + reason);
      });
    });

    it('fails if there is a problem with communicating with the iframe', function (done) {
      mockIFrameMessages(false, null);
      bypassMessageSourceCheck();
      DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
      .then(function () {
        done.fail('Fingerprint promise should have been rejected');
      })
      .fail(function (reason) {
        expect(reason).not.toBeUndefined();
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
      .fail(function (reason) {
        expect(reason).not.toBeUndefined();
        done();
      });
    });

    it('fails if user agent is not defined', function (done) {
      mockUserAgent(undefined);
      mockIFrameMessages(true);
      DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
        .then(function () {
          done.fail('Fingerprint promise should have been rejected');
        })
        .fail(function (reason) {
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
      .fail(function (reason) {
        expect(reason).toBe('device fingerprint is not supported on Windows phones');
        done();
      });
    });

    it('ignores if message is not from right iframe', function(done) {
      mockIFrameMessages(true);
      DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
        .then(function () {
          done.fail('Fingerprint promise should not have been resolved');
        })
        .fail(function (reason) {
          done.fail('Fingerprint promise should not have been rejected. ' +  reason);
        });
      Expect.tick().then(function() {
        // give it time to check if promise resolves or rejects.
        var $iFrame = $sandbox.find('iframe');
        expect($iFrame).toExist();
        done();
      });
    });

  });
});
