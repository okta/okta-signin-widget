const data = {
  "status": 200,
  "responseType": "json",
  "response": {
    "version": "1.0.0",
    "stateHandle": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
    "expiresAt": "2018-09-17T23:08:56.000Z",
    "step": "FACTOR_VERIFICATION_REQUIRED",
    "remediation": {
      "type": "array",
      "value": [
        {
          "rel": [
            "create-form"
          ],
          "name": "factor-poll-verification",
          "href": "https://your-org.okta.com/api/v2/authn/",
          "method": "POST",
          "refresh": 2000,
          "value": [
            {
              "name": "stateHandle",
              "value": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
              "visible": false
            }
          ]
        }
      ]
    },
    "factor": {
      "type": "object",
      "value": {
        "factorType": "push",
        "provider": "okta",
        "profile": {
          "email": "omgm@foo.dev"
        },
        "qr": {
          "href": ":link/:to/:qrcode"
        },
        "refresh": {
          "rel": [
            "create-form"
          ],
          "href": "https://your-org.okta.com/api/v2/authn/refresh",
          "name": "refresh",
          "method": "post",
          "value": [
            {
              "name": "stateHandle",
              "value": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
              "visible": false
            }
          ]
        },
        "resend": {
          "rel": [
            "create-form"
          ],
          "href": "https://your-org.okta.com/api/v2/authn/resend",
          "name": "resend",
          "method": "post",
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
      "href": "https://your-org.okta.com/api/v2/authn/cancel",
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
      "href": "https://your-org.okta.com/api/v2/authn/context",
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
