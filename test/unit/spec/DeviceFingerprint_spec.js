define([
  'helpers/util/Expect',
  'sandbox',
  'util/DeviceFingerprint'
], function (Expect, $sandbox, DeviceFingerprint) {

  Expect.describe('DeviceFingerprint', function () {

    function mockIFrameMessages (success, errorMessage) {
      var message = success ? {
        type: 'FingerprintAvailable',
        fingerprint: 'thisIsTheFingerprint'
      } : errorMessage;
      window.postMessage(JSON.stringify(message), '*');
    }

    function mockIFrameMessagesFingerprintServiceReady () {
      var message = {
        type: 'FingerprintServiceReady',
      };
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
      bypassMessageSourceCheck();
      DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
        .then(function (fingerprint) {
          var $iFrame = $sandbox.find('iframe');
          expect($iFrame).not.toExist();
          expect(fingerprint).toBe('thisIsTheFingerprint');
          done();
        })
        .fail(function (reason) {
          done.fail('Fingerprint promise incorrectly failed. ' + reason);
        });

      mockIFrameMessages(true);
    });

    it('notifies iframe if the message type is "finger print ready"', function (done) {
      bypassMessageSourceCheck();
      DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox);

      $sandbox.find('iframe')[0].contentWindow.addEventListener(
        'message',
        (event) => {
          expect(JSON.parse(event.data)).toEqual({
            type: 'GetFingerprint'
          });
          expect(event.origin).toBe(baseUrl);

          var $iFrame = $sandbox.find('iframe');
          expect($iFrame).toExist();
          done();
        },
        false
      );

      mockIFrameMessagesFingerprintServiceReady();
    });

    it('fails if there is a problem with communicating with the iframe', function (done) {
      bypassMessageSourceCheck();
      DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
        .then(function () {
          done.fail('Fingerprint promise should have been rejected');
        })
        .fail(function (reason) {
          var $iFrame = $sandbox.find('iframe');
          expect($iFrame).not.toExist();
          expect(reason).not.toBeUndefined();
          done();
        });
      mockIFrameMessages(false);
    });

    it('fails if there iframe sends and invalid message content', function (done) {
      bypassMessageSourceCheck();
      DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
        .then(function () {
          done.fail('Fingerprint promise should have been rejected');
        })
        .fail(function (reason) {
          var $iFrame = $sandbox.find('iframe');
          expect($iFrame).not.toExist();
          expect(reason).toBe('no data');
          done();
        });

      mockIFrameMessages(false, { type: 'InvalidMessageType' });
    });

    it('fails if user agent is not defined', function (done) {
      mockUserAgent();
      DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
        .then(function () {
          done.fail('Fingerprint promise should have been rejected');
        })
        .fail(function (reason) {
          var $iFrame = $sandbox.find('iframe');
          expect($iFrame).not.toExist();
          expect(reason).toBe('user agent is not defined');
          done();
        });
      mockIFrameMessages(true);
    });

    it('fails if it is called from a Windows phone', function (done) {
      mockUserAgent('Windows Phone');
      DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox)
        .then(function () {
          done.fail('Fingerprint promise should have been rejected');
        })
        .fail(function (reason) {
          var $iFrame = $sandbox.find('iframe');
          expect($iFrame).not.toExist();
          expect(reason).toBe('device fingerprint is not supported on Windows phones');
          done();
        });

      mockIFrameMessages(true);
    });

    it('ignores if message is not from right iframe', function (done) {
      spyOn(DeviceFingerprint, 'isMessageFromCorrectSource').and.callFake(() => {
        return false;
      });
      DeviceFingerprint.generateDeviceFingerprint(baseUrl, $sandbox);
      expect(DeviceFingerprint.isMessageFromCorrectSource).not.toHaveBeenCalled();

      window.addEventListener('message', () => {
        expect(DeviceFingerprint.isMessageFromCorrectSource).toHaveBeenCalled();

        // either resolve or reject, the iframe will be removed.
        // verify the exists of iframe implies promise is
        // neither resolved or rejected
        var $iFrame = $sandbox.find('iframe');
        expect($iFrame).toExist();
        expect($iFrame.attr('src')).toBe(baseUrl + '/auth/services/devicefingerprint');
        expect($iFrame.is(':visible')).toBe(false);
        done();
      });

      mockIFrameMessages(true);
    });

  });
});
