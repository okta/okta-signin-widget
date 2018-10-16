define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "testStateToken",
    "expiresAt": "2016-08-17T02:29:38.000Z",
    "status": "MFA_CHALLENGE",
    "_embedded": {
      "challenge": {
        "nonce": "someNonce",
        "timeoutSeconds": 20
      },
      "user": {
        "id": "00ukjpMDb9O7CjJbx0g3",
        "passwordChanged": "2016-08-15T18:31:57.000Z",
        "profile": {
          "login": "exampleUser@example.com",
          "firstName": "Test",
          "lastName": "User",
          "locale": "en_US",
          "timeZone": "America/Los_Angeles"
        }
      },
      "factors": [{
        "id": "u2fFactorId",
        "factorType": "u2f",
        "provider": "FIDO",
        "vendorName": "FIDO",
        "profile": {
          "credentialId": "someCredentialId",
          "appId": "http://rain.okta1.com:1802",
          "version": "U2F_V2"
        },
        "_links": {
          "verify": {
            "href": "https://foo.com/api/v1/authn/factors/u2fFactorId/verify",
            "hints": {"allow": ["POST"]}
          }
        }
      },
      {
        "id": "u2fFactorId2",
        "factorType": "u2f",
        "provider": "FIDO",
        "vendorName": "FIDO",
        "profile": {
          "credentialId": "someCredentialId2",
          "appId": "http://rain.okta1.com:1802",
          "version": "U2F_V2"
        },
        "_links": {
          "verify": {
            "href": "https://foo.com/api/v1/authn/factors/u2fFactorId2/verify",
            "hints": {"allow": ["POST"]}
          }
        }
      },
      {
        "id": "u2fFactorId3",
        "factorType": "u2f",
        "provider": "FIDO",
        "vendorName": "FIDO",
        "profile": {
          "credentialId": "someCredentialId3",
          "appId": "http://rain.okta1.com:1802",
          "version": "U2F_V2"
        },
        "_links": {
          "verify": {
            "href": "https://foo.com/api/v1/authn/factors/u2fFactorId3/verify",
            "hints": {"allow": ["POST"]}
          }
        }
      }],
      "policy": {
        "allowRememberDevice": false,
        "rememberDeviceLifetimeInMinutes": 0,
        "rememberDeviceByDefault": false
      }
    },
    "_links": {
      "next": {
        "name": "verify",
        "href": "https://test.okta.com/api/v1/authn/factors/u2fFactorId/verify",
        "hints": { "allow": [ "POST" ]}
      },
      "cancel": {
        "href": "https://test.okta.com/api/v1/authn/cancel",
        "hints": { "allow": [ "POST" ]}
      },
      "prev": {
        "href": "https://test.okta.com/api/v1/authn/previous",
        "hints": { "allow": [ "POST" ]}
      }
    }
  }
});
