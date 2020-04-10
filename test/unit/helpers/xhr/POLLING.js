define({
  "status": 200,
  "responseType": "json",
  "response": {
   "stateToken":"00caLtr2zn6rEXWaHyNNmTfczuToPNY2R8y3f0yAK_",
   "type":"SESSION_STEP_UP",
   "expiresAt":"2020-04-10T17:17:34.000Z",
   "status":"POLL",
   "_embedded":{
      "transaction":{
         "profile":{
            "refresh": 800
         }
      }
   },
   "_links":{
      "next":{
         "name":"poll",
         "href":"https://example.okta.com/api/v1/authn/poll",
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
