define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "testStateToken",
    "expiresAt": "2015-07-08T16:43:47.608Z",
    "status": "PASSWORD_WARN",
    "_embedded": {
      "user": {
        "id": "00uhuhIeUK9Htah8Z0g3",
        "passwordChanged": "2015-06-28T01:05:35.000Z",
        "profile": {
          "login": "inca@clouditude.net",
          "firstName": "Inca-Louise",
          "lastName": "O'Rain Dum",
          "locale": "en_US",
          "timeZone": "America\/Los_Angeles"
        }
      },
      "policy": {
        "expiration": {
          "passwordExpireDays": 4
        },
        "complexity": {
          "minLength": 8,
          "minLowerCase": 1,
          "minUpperCase": 1,
          "minNumber": 1,
          "minSymbol": 0
        }
      }
    },
    "_links": {
      "next": {
        "name": "changePassword",
        "title": "Google",
        "href": "https://www.google.com",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "skip": {
        "name": "skip",
        "href": "https://foo.com/api/v1/authn/skip",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
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
