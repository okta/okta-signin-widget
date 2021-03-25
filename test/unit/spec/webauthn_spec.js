import Expect from 'helpers/util/Expect';
import Q from 'q';
import webauthn from 'util/webauthn';

Expect.describe('webauthn', function() {
  function setupMsCredentials() {
    window.msCredentials = {
      makeCredential: function() /*accountInfo, cryptoParams, challenge*/ {
        const result = Q.defer();

        result.resolve({
          id: 'msCredentials_ID',
          algorithm: 'msCredentials_ALGO',
          publicKey: 'msCredentials_PUBLIC',
        });

        return result.promise;
      },

      getAssertion: function() /*challenge, filters*/ {
        const result = Q.defer();

        result.resolve({
          id: 'msCredentials_ID',
          signature: {
            clientData: 'CLIENT_DATA',
            authnrData: 'AUTH_DATA',
            signature: 'SIGNATURE',
          },
        });

        return result.promise;
      },
    };

    spyOn(window.msCredentials, 'makeCredential').and.callThrough();
    spyOn(window.msCredentials, 'getAssertion').and.callThrough();
  }

  afterEach(function() {
    delete window.msCredentials;
  });

  it('isAvailable returns false if window.msCredentials is undefined', function() {
    expect(webauthn.isAvailable()).toBe(false);
  });

  it('isAvailable returns true if window.msCredentials is not undefined', function() {
    setupMsCredentials();
    expect(webauthn.isAvailable()).toBe(true);
  });

  it('msCredentials.makeCredential was called with correct parameters', function() {
    setupMsCredentials();

    webauthn.makeCredential({ userId: 'SomeUserId' }, [{ algorithm: 'RSASSA-PKCS1-v1_5' }]);
    expect(window.msCredentials.makeCredential).toHaveBeenCalledWith(
      { userId: 'SomeUserId' },
      [{ type: 'FIDO_2_0', algorithm: 'RSASSA-PKCS1-v1_5' }],
      undefined
    );
  });

  it('msCredentials.getAssertion was called with correct parameters', function() {
    setupMsCredentials();

    webauthn.getAssertion('SomeChallenge', [{ id: 'msCredentials_ID' }]);
    expect(window.msCredentials.getAssertion).toHaveBeenCalledWith('SomeChallenge', {
      accept: [{ type: 'FIDO_2_0', id: 'msCredentials_ID' }],
    });
  });
});
