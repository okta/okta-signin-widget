define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "01MMFqbYA4dwgGi0t5I78wIhcvHS1pOxKJE_B6jiUk",
    "expiresAt": "2015-09-27T01:14:24.573Z",
    "status": "FACTOR_CHALLENGE",
    "_embedded": {
      "user": {
        "id": "00ui5n6MuauCZVNbX0g3",
        "passwordChanged": "2015-09-26T22:29:11.000Z",
        "profile": {
          "login": "administrator1@clouditude.net",
          "firstName": "Add-Min",
          "lastName": "O'Cloudy Tud",
          "locale": "en_US",
          "timeZone": "America/Los_Angeles"
        }
      },
      "factor": {
        "id": "emailhp9NXcoXu8z2wN0g3",
        "factorType": "email",
        "provider": "OKTA",
        "profile": {
          "email": "a...1@clouditude.net"
        },
        "_embedded": {
          "verification": null
        }
      }
    },
    "_links": {
      "cancel": {
        "href": "https://foo.com/api/v1/authn/cancel",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }
    }
  }
});
