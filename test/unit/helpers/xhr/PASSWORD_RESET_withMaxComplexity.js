define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "testStateToken",
    "expiresAt": "2015-07-17T02:33:34.874Z",
    "status": "PASSWORD_RESET",
    "_embedded": {
      "policy": {
        "complexity": {
          "minLength": 8,
          "minLowerCase": 1,
          "minUpperCase": 1,
          "minNumber": 1,
          "minSymbol": 1,
          "excludeUsername": true
        }
      },
      "user": {
        "id": "00uhveDu5xF26YA0j0g3",
        "profile": {
          "login": "administrator1@clouditude.net",
          "firstName": "Add-Min",
          "lastName": "O'Cloudy Tud",
          "locale": "en_US",
          "timeZone": "America\/Los_Angeles"
        }
      }
    },
    "_links": {
      "next": {
        "name": "resetPassword",
        "href": "https:\/\/foo.com\/api\/v1\/authn\/credentials\/reset_password",
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
