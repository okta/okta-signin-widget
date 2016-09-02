define([
  'vendor/lib/q',
  'helpers/util/Expect',
  'util/webauthn'
],
function (Q, Expect, webauthn) {
  /* globals fail */

  Expect.describe('webauthn', function () {

    function setupMsCredentials() {
      window.msCredentials = {
        makeCredential: function (accountInfo/*, cryptoParams, challenge*/) {
          var result = Q.defer();

          switch (accountInfo.userId) {
          case 'NotSupportedUserId':
            result.reject({
              message: 'NotSupportedError'
            });
            break;

          default:
            result.resolve({
              id: 'msCredentials_ID',
              algorithm: 'msCredentials_ALGO',
              publicKey: 'msCredentials_PUBLIC'
            });
            break;
          }

          return result.promise;
        },

        getAssertion: function (challenge/*, filters*/) {
          var result = Q.defer();

          switch (challenge) {
          case 'NotSupported':
            result.reject({
              message: 'NotSupportedError'
            });
            break;

          default:
            result.resolve({
              id: 'msCredentials_ID',
              signature: {
                clientData: 'CLIENT_DATA',
                authnrData: 'AUTH_DATA',
                signature: 'SIGNATURE'
              }
            });
            break;
          }

          return result.promise;
        }
      };
    }

    afterEach(function () {
      delete window.msCredentials;
    });

    it('isAvailable returns false if window.msCredentials is undefined', function () {
      expect(webauthn.isAvailable()).toBe(false);
    });

    it('isAvailable returns true if window.msCredentials is not undefined', function () {
      setupMsCredentials();
      expect(webauthn.isAvailable()).toBe(true);
    });

    it('makeCredential response has xhr.responseJSON.errorSummary if NotSupportedError is triggered',
      function (done) {
        setupMsCredentials();

        webauthn.makeCredential({userId: 'NotSupportedUserId'}, [{algorithm: 'RSASSA-PKCS1-v1_5'}])
        .then(function () {
          fail('Promise should be failed.');
        })
        .fail(function (error) {
          expect(error.xhr.responseJSON.errorSummary).toBeDefined();
          done();
        });
      });

    it('getAssertion response has xhr.responseJSON.errorSummary if NotSupportedError is triggered',
      function (done) {
        setupMsCredentials();

        webauthn.getAssertion('NotSupported', [{id: 'msCredentials_ID'}])
        .then(function () {
          fail('Promise should be failed.');
        })
        .fail(function (error) {
          expect(error.xhr.responseJSON.errorSummary).toBeDefined();
          done();
        });
      });
  });
});
