define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "dummy-token",
    "expiresAt": "2020-01-07T20:45:17.000Z",
    "status": "MFA_ENROLL",
    "_embedded": {
      "user": {
        "id": "00uttkZ6XrlzA58Q10g3",
        "passwordChanged": "2020-01-07T20:28:11.000Z",
        "profile": {
          "login": "stu@okta.com",
          "firstName": "Stuart",
          "lastName": "Minion",
          "locale": "en",
          "timeZone": "America/Los_Angeles"
        }
      },
      "factors": [
        {
          "factorType": "email",
          "provider": "OKTA",
          "vendorName": "OKTA",
          "_links": {
            "enroll": {
              "href": "http://localhost:3000/api/v1/authn/factors",
              "hints": {
                "allow": [
                  "POST"
                ]
              }
            }
          },
          "status": "NOT_SETUP",
          "enrollment": "OPTIONAL",
          "_embedded": {
            "emails": []
          }
        },
        {
          "factorType": "sms",
          "provider": "OKTA",
          "vendorName": "OKTA",
          "_links": {
            "enroll": {
              "href": "http://localhost:3000/api/v1/authn/factors",
              "hints": {
                "allow": [
                  "POST"
                ]
              }
            }
          },
          "status": "ACTIVE",
          "enrollment": "REQUIRED"
        }
      ]
    },
    "_links": {
      "cancel": {
        "href": "http://localhost:3000/api/v1/authn/cancel",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }
    }
  }
});
