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
        "href": "https://foo.okta.com/api/v1/authn",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }
    }
  }
});