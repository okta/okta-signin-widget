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
      "factors": [{
        "id": "ost947vv5GOSPjt9C0g4",
        "factorType": "web",
        "provider": "DUO",
        "profile": {
          "credentialId": "new@mail.com"
        },
        "_links": {
          "verify": {
            "href": "https:\/\/foo.com\/api\/v1\/authn\/factors\/ost947vv5GOSPjt9C0g4\/verify",
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
