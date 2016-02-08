define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "testStateToken",
    "expiresAt": "2015-07-08T16:43:47.608Z",
    "status": "PASSWORD_EXPIRED",
    "_embedded": {
      "user": {
        "id": "00uhuhIeUK9Htah8Z0g3",
        "profile": {
          "login": "inca@clouditude.net",
          "firstName": "Inca-Louise",
          "lastName": "O'Rain Dum",
          "locale": "en_US",
          "timeZone": "America\/Los_Angeles"
        }
      }
    },
    "_links": {
      "next": {
        "name": "changePassword",
        "href": "https://foo.com/api/v1/authn/credentials/change_password",
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
