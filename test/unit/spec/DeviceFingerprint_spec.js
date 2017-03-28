/*global JSON */
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
      DeviceFingerprint.generateDeviceFingerprint('file://', $sandbox)
      .then(function (fingerprint) {
        expect(fingerprint).toBe('thisIsTheFingerprint');
        done();
      })
      .fail(function () {
        done.fail('Fingerprint promise incorrectly failed');
      });
    });

    it('fails if there is a problem with communicating with the iframe', function (done) {
      mockIFrameMessages(false, null);
      DeviceFingerprint.generateDeviceFingerprint('file://', $sandbox)
      .then(function () {
        done.fail('Fingerprint promise incorrectly resolved successful');
      })
      .fail(function (reason) {
        expect(reason).not.toBeUndefined();
        done();
      });
    });

    it('fails if there iframe sends and invalid message content', function (done) {
      mockIFrameMessages(false, { type: 'InvalidMessageType' });
      DeviceFingerprint.generateDeviceFingerprint('file://', $sandbox)
      .then(function () {
        done.fail('Fingerprint promise incorrectly resolved successful');
      })
      .fail(function (reason) {
        expect(reason).not.toBeUndefined();
        done();
      });
    });

  });
});
