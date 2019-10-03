const data = {
  "status": 200,
  "responseType": "json",
  "response": {
    "version": "1.0.0",
    "stateHandle": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
    "expiresAt": "2018-09-17T23:08:56.000Z",
    "step": "FACTOR_ENROLL",
    "intent": "login",
    "remediation": {
      "type": "array",
      "value": [
        {
          "rel": [
            "create-form"
          ],
          "name": "select-factor",
          "href": "http://localhost:3000/idp/idx",
          "method": "POST",
          "value": [
            {
              "name": "factorProfileId",
              "type": "set",
              "options": [
                {
                  "label": "Password",
                  "value": "00u2j17ObFUsbGfLg0g4"
                },
                {
                  "label": "E-mail",
                  "value": "emf2j1ccd6CF4IWFY0g3"
                }
              ]
            },
            {
              "name": "stateHandle",
              "value": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
              "visible": false
            }
          ]
        }
      ]
    },
    "factors": {
      "type": "array",
      "value": [
        {
          "factorType": "password",
          "factorProfileId": "00u2j17ObFUsbGfLg0g4"
        },
        {
          "factorType": "email",
          "factorProfileId": "emf2j1ccd6CF4IWFY0g3"
        }
      ]
    },
    "user": {
      "type": "object",
      "value": {
        "id": "I9bvFiq01cRFgbn",
        "passwordChanged": "2019-05-03T19:00:00.000Z",
        "profile": {
          "login": "foo@example.com",
          "firstName": "Foo",
          "lastName": "Bar",
          "locale": "en-us",
          "timeZone": "UTC"
        }
      }
    },
    "cancel": {
      "rel": [
        "create-form"
      ],
      "name": "cancel",
      "href": "http://localhost:3000/idp/idx/cancel",
      "method": "POST",
      "value": [
        {
          "name": "stateHandle",
          "value": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
          "visible": false
        }
      ]
    },
    "context": {
      "rel": [
        "create-form"
      ],
      "name": "context",
      "href": "http://localhost:3000/idp/idx/context",
      "method": "POST",
      "value": [
        {
          "name": "stateHandle",
          "value": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
          "visible": false
        }
      ]
    }
  }
};

module.exports = data;
