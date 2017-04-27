define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "aStateToken",
    "type": "SESSION_STEP_UP",
    "expiresAt": "2017-04-25T18:57:48.000Z",
    "status": "SUCCESS",
    "_embedded": {
      "user": {
        "id": "00ulwproRw0cPUGAF0g3",
        "passwordChanged": "2017-04-13T22:00:23.000Z",
        "profile": {
          "login": "administrator1@clouditude.net",
          "firstName": "Add-Min",
          "lastName": "O'Cloudy Tud",
          "locale": "en_US",
          "timeZone": "America\/Los_Angeles"
        }
      },
      "target": {
        "type": "APP",
        "name": "salesforce",
        "label": "Salesforce.com",
        "_links": {
          "logo": [
            {
              "name": "medium",
              "href": "http://foo.okta.com/assets/img/logos/salesforce_logo.png",
              "type": "image/png"
            }
          ]
        }
      }
    },
    "_links": {
      "next": {
        "name": "original",
        "href": "http://foo.okta.com/login/step-up/redirect?stateToken=aStateToken",
        "hints": {
          "allow": [
            "GET"
          ]
        }
      }
    }
  }
});
