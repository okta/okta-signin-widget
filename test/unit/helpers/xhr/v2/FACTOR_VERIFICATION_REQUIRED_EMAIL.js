const data = {
  "status": 200,
  "responseType": "json",
  "response": {
    "version": "1.0.0",
    "stateHandle": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
    "expiresAt": "2018-09-17T23:08:56.000Z",
    "step": "FACTOR_VERIFICATION_REQUIRED",
    "intent": "login",
    "remediation": {
      "type": "array",
      "value": [
        {
          "rel": [
            "create-form"
          ],
          "name": "otp",
          "href": "http://localhost:3000/api/v1/idx/",
          "method": "POST",
          "value": [
            {
              "name": "otp",
              "label": "Passcode",
              "minLength": 4
            }
          ]
        }
      ]
    },
    "factor": {
      "type": "object",
      "value": {
        "factorType": "email",
        "provider": "okta",
        "profile": {
          "email": "o*****m@abbott.dev"
        },
        "poll": {
          "rel": [
            "create-form"
          ],
          "name": "poll",
          "href": "http://localhost:3000/api/v1/idx/poll",
          "method": "POST",
          "refresh": 2000,
          "value": [
            {
              "name": "stateHandle",
              "value": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
              "visible": false
            }
          ]
        },
        "resend": {
          "name": "resend",
          "rel": [
            "create-form"
          ],
          "href": "http://localhost:3000/api/v1/idx/resend",
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
      "href": "http://localhost:3000/api/v1/idx/cancel",
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
      "href": "http://localhost:3000/api/v1/idx/context",
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
