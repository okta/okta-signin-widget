define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "aStateToken",
    "status": "UNAUTHENTICATED",
    "_embedded": {},
    "_links": {
      "next": {
        "name": "authentication",
        "href": "http://rain.okta1.com:1802/api/v1/authn",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }
    }
  }
});