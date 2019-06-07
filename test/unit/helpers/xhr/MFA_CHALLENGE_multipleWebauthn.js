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
      "challenge": {challenge: "kygOUtSWURMv_t_Gj71Y", extensions: {"appid": "https://foo.com"}},
      "factors": [{
        "id": "webauthnFactorId1",
        "factorType": "webauthn",
        "provider": "FIDO",
        "vendorName": "FIDO",
        "profile": {"credentialId": "vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZw"},
        "_embedded": {
          "challenge": {
            "challenge": "challenge1",
            "extensions": {
              "appid": "https://foo.com"
            }
          }
        }
      },
      {
        "id": "webauthnFactorId2",
        "factorType": "webauthn",
        "provider": "FIDO",
        "vendorName": "FIDO",
        "profile": {"credentialId": "vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZw"},
        "_embedded": {
          "challenge": {
            "challenge": "challenge2",
            "extensions": {
              "appid": "https://foo.com"
            }
          }
        }
      },
      {
        "id": "webauthnFactorId3",
        "factorType": "webauthn",
        "provider": "FIDO",
        "vendorName": "FIDO",
        "profile": {"credentialId": "vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZw"},
        "_embedded": {
          "challenge": {
            "challenge": "challenge3",
            "extensions": {
              "appid": "https://foo.com"
            }
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
        "href": "https://test.okta.com/api/v1/authn/factors/webauthn/verify",
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
