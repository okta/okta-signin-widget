define({
    "status": 200,
    "responseType": "json",
    "response": {
    "stateToken": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
    "expiresAt": "2018-09-17T23:08:56.000Z",
    "status": "FACTOR_REQUIRED",
    "intent": "login",
    "remediation": [{
      "type": "array",
      "rel": ["create-form"],
      "name": "submit-factor",
      "href": "https://your-org.okta.com/api/v2/authn/",
      "method": "POST",
      "value": [{
        "name": "email",
        "placeholder": "Enter code",
        "required": true,
        "type": "text"
      }, {
        "name": "stateToken",
        "value": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
        "visible": false
      }]
    }],
    "factor": {
      "type": "object",
      "value": {
        "id": "emf1axecbKovLJPWl0g4",
        "factorType": "email",
        "provider": "OKTA",
        "vendorName": "OKTA",
        "profile": {
          "email": "e...a@rain.com"
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
      "rel": ["create-form"],
      "name": "cancel",
      "href": "https://your-org.okta.com/api/v2/authn/cancel",
      "method": "POST",
      "value": [{
        "name": "stateToken",
        "value": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
        "visible": false
      }]
    },
    "context": {
      "rel": ["create-form"],
      "name": "context",
      "href": "https://your-org.okta.com/api/v2/authn/context",
      "method": "POST",
      "value": [{
        "name": "stateToken",
        "value": "01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82",
        "visible": false
      }]
    }   
    }
});
