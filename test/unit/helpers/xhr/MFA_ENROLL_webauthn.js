define({
    "status": 200,
    "responseType": "json",
    "response": {
      "stateToken": "testStateToken",
      "expiresAt": "2015-06-15T21:06:04.794Z",
      "status": "MFA_ENROLL",
      "_embedded": {
        "user": {
          "id": "00uhncCcppZD2158x0g3",
          "profile": {
            "login": "administrator1@clouditude.net",
            "firstName": "Add-Min",
            "lastName": "O'Cloudy Tud",
            "locale": "en_US",
            "timeZone": "America\/Los_Angeles"
          }
        },
        "factors": [{
          "enrollment": "OPTIONAL",
          "status": "NOT_SETUP",
          "factorType": "webauthn",
          "provider": "FIDO",
          "vendorName": "FIDO",
          "_links": {
            "enroll": {
              "href": "https:\/\/foo.com\/api\/v1\/authn\/factors",
              "hints": {
                "allow": [
                  "POST"
                ]
              }
            }
          }
        }]
      },
      "_links": {
        "skip": {
          "href": "https:\/\/foo.com\/api\/v1\/authn\/skip",
          "hints": {
            "allow": [
              "POST"
            ]
          }
        },
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
