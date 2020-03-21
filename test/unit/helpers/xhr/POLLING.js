define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken":"00_J1qxqyLs-6ZutUUWfbqm-1nqnW6n2o5z2wnBRHs",
    "type":"SESSION_STEP_UP",
    "expiresAt":"2020-03-23T17:09:34.000Z",
    "status":"POLL",
    "_embedded":{
       "factor":{
          "id":"okta-poll",
          "factorType":"okta-poll",
          "provider":"OKTA",
          "profile":{
             "refresh": 1000
          }
       }
    },
    "_links":{
       "next":{
          "name":"poll",
          "href":"https://example.okta.com/api/v1/authn/factors/okta-poll/poll",
          "hints":{
             "allow":[
                "POST"
             ]
          }
       },
       "cancel":{
          "href":"https://example.okta.com/api/v1/authn/cancel",
          "hints":{
             "allow":[
                "POST"
             ]
          }
       }
    }
  }
});
