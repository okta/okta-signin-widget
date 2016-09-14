define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "00_sxrUO9R5qFiSy5bb7vbyjftsAAMJDSGIHYvs_88",
    "expiresAt": "2016-09-21T18:38:04.000Z",
    "status": "RECOVERY_CHALLENGE",
    "factorType": "CALL",
    "recoveryType": "PASSWORD",
    "_links": {
      "next": {
        "name": "verify",
        "href": "https:\/\/rain.okta1.com:80\/api\/v1\/authn\/recovery\/factors\/CALL\/verify",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "cancel": {
        "href": "https:\/\/rain.okta1.com:80\/api\/v1\/authn\/cancel",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "resend": {
        "name": "CALL",
        "href": "https:\/\/rain.okta1.com:80\/api\/v1\/authn\/recovery\/factors\/CALL\/resend",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }
    }
  }
});
