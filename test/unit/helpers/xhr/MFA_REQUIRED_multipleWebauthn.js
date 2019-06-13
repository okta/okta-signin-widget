define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "testStateToken",
    "expiresAt": "2015-06-11T21:33:24.778Z",
    "status": "MFA_REQUIRED",
    "_embedded": {
      "user": {
        "id": "00uhn6dAGR4nUB4iY0g3",
        "profile": {
          "login": "administrator1@clouditude.net",
          "firstName": "Add-Min",
          "lastName": "O'Cloudy Tud",
          "locale": "en_US",
          "timeZone": "America\/Los_Angeles"
        }
      },
      "policy": {
        "allowRememberDevice": true,
        "rememberDeviceLifetimeInMinutes": 0,
        "rememberDeviceByDefault": false
      },
      "factorTypes": [{
        "factorType": "webauthn",
        "_links": {
          "next": {
            "href": "https://foo.com/api/v1/authn/factors/webauthn/verify",
            "hints": {"allow": ["POST"]},
            "name": "verify"
          }
        }
      }],
      "factors": [{
        "id": "webauthnFactorId1",
        "factorType": "webauthn",
        "provider": "FIDO",
        "vendorName": "FIDO",
        "profile": {"credentialId": "vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZw"},
        "_links": {
          "verify": {
            "href": "https://foo.com/api/v1/authn/factors/webauthnFactorId1/verify",
            "hints": {"allow": ["POST"]}
          }
        }
      },
      {
        "id": "webauthnFactorId2",
        "factorType": "webauthn",
        "provider": "FIDO",
        "vendorName": "FIDO",
        "profile": {"credentialId": "vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZw"},
        "_links": {
          "verify": {
            "href": "https://foo.com/api/v1/authn/factors/webauthnFactorId2/verify",
            "hints": {"allow": ["POST"]}
          }
        }
      },
      {
        "id": "webauthnFactorId3",
        "factorType": "webauthn",
        "provider": "FIDO",
        "vendorName": "FIDO",
        "profile": {"credentialId": "vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZw"},
        "_links": {
          "verify": {
            "href": "https://foo.com/api/v1/authn/factors/webauthnFactorId3/verify",
            "hints": {"allow": ["POST"]}
          }
        }
      }]
    },
    "_links": {
      "cancel": {
        "href": "https:\/\/foo.com\/api\/v1\/authn\/cancel",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }
    }
  }
});
