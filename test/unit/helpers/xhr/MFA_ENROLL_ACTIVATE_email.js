define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "dummy-token",
    "expiresAt": "2015-11-03T10:15:57.000Z",
    "status": "MFA_ENROLL_ACTIVATE",
    "_embedded": {
      "user": {
        "id": "00ub0oNGTSWTBKOLGLNR",
        "passwordChanged": "2015-09-08T20:14:45.000Z",
        "profile": {
          "login": "dade.murphy@example.com",
          "firstName": "Dade",
          "lastName": "Murphy",
          "locale": "en_US",
          "timeZone": "America/Los_Angeles"
        }
      },
      "factor": {
        "id": "eml198rKSEWOSKRIVIFT",
        "factorType": "email",
        "provider": "OKTA",
        "profile": {
          "email": "t....son@okta.com"
        }
      }
    },
    "_links": {
      "next": {
        "name": "activate",
        "href": "http://localhost:3000/api/v1/authn/factors/eml198rKSEWOSKRIVIFT/lifecycle/activate",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "cancel": {
        "href": "http://localhost:3000/api/v1/authn/cancel",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "prev": {
        "href": "http://localhost:3000/api/v1/authn/previous",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "resend": [
        {
          "name": "email",
          "href": "http://localhost:3000/api/v1/authn/factors/eml198rKSEWOSKRIVIFT/lifecycle/resend",
          "hints": {
            "allow": [
              "POST"
            ]
          }
        }
      ]
    }
  }

});
