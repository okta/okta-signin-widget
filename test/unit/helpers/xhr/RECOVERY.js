define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "testStateToken",
    "status": "RECOVERY",
    "recoveryType": "PASSWORD",
    "_embedded": {
      "user": {
        "id": "00uhveDu5xF26YA0j0g3",
        "profile": {
          "login": "administrator1@clouditude.net",
          "firstName": "Add-Min",
          "lastName": "O'Cloudy Tud",
          "locale": "en_US",
          "timeZone": "America\/Los_Angeles"
        },
        "recovery_question": {
          "question": "Last 4 digits of your social security number?"
        }
      }
    },
    "_links": {
      "next": {
        "name": "answer",
        "href": "https:\/\/foo.com\/api\/v1\/authn\/recovery\/answer",
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
