define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "testStateToken",
    "expiresAt": "2018-08-17T02:38:18.000Z",
    "status": "MFA_ENROLL_ACTIVATE",
    "_embedded": {
      "user": {
        "id": "00ukjpMDb9O7CjJbx0g3",
        "passwordChanged": "2018-08-15T18:31:57.000Z",
        "profile": {
          "login": "exampleUser@example.com",
          "firstName": "Test",
          "lastName": "User",
          "locale": "en_US",
          "timeZone": "America/Los_Angeles"
        }
      },
      "factor": {
        "id":"fuf52dhWPdJAbqiUU0g4",
        "factorType":"webauthn",
        "provider":"FIDO",
        "vendorName":"FIDO",
        "_embedded":{
          "activation":{
            "rp": {
              "name": "acme"
            },
            "user": {
              "id": "00u1212qZXXap6Cts0g4",
              "name": "yuming.cao@okta.com",
              "displayName": "Test User"
            },
            "pubKeyCredParams": [{
              "type": "public-key",
              "alg": -7
            }],
            "challenge": "G7bIvwrJJ33WCEp6GGSH",
            "authenticatorSelection": {
              "authenticatorAttachment": "cross-platform",
              "requireResidentKey": false,
              "userVerification": "preferred"
            },
            "u2fParams": {
              "appid": "https://test.okta.com"
            }
          }
        }
      }
    },
    "_links": {
      "next": {
        "name": "activate",
        "href": "https://test.okta.com/api/v1/authn/factors/fuf52dhWPdJAbqiUU0g4/lifecycle/activate",
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
