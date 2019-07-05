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
        "factorType": "question",
        "provider": "OKTA",
        "vendorName": "OKTA",
        "_links": {
          "questions": {
            "href": "https:\/\/foo.com\/api\/v1\/users\/00uhncCcppZD2158x0g3\/factors\/questions",
            "hints": {
              "allow": [
                "GET"
              ]
            }
          },
          "enroll": {
            "href": "https:\/\/foo.com\/api\/v1\/authn\/factors",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          }
        }
      }, {
        "enrollment": "OPTIONAL",
        "status": "ACTIVE",
        "factorType": "token:hotp",
        "provider": "CUSTOM",
        "profiles": [{
          "id": '123',
          "name": 'Entrust',
          "_embedded": {
            "enrolledFactors": []
          }
        }, {
          "id": '124',
          "name": 'Entrust2',
          "_embedded": {
            "enrolledFactors": [{"name": 'test'}]
          }
        }],
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
