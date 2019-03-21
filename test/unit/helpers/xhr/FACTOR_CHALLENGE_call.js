define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "01bfpkAkRyqUZQAe3IzERUqZGOfvYhX83QYCQIDnKZ",
    "type": "LOGIN",
    "expiresAt": "2019-03-13T21:06:34.000Z",
    "status": "FACTOR_CHALLENGE",
    "_embedded": {
      "request": {
        "ip": "127.0.0.1",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36"
      },
      "factor": {
        "id": "clfk6mRsVLrhHznVe0g3",
        "factorType": "call",
        "provider": "OKTA",
        "vendorName": "OKTA",
        "profile": {
          "phoneNumber": "+1 XXX-XXX-9999"
        }
      },
      "user": {
        "id": "00usj67FGNVmLa7GQ0g3",
        "passwordChanged": "2019-03-13T18:46:49.000Z",
        "profile": {
          "login": "evra@rain.com",
          "firstName": "pat",
          "lastName": "evra",
          "locale": "en",
          "timeZone": "America/Los_Angeles"
        }
      },
      "authentication": {
        "protocol": "OAUTH2.0",
        "request": {
          "scope": "openid profile",
          "response_type": "id_token",
          "redirect_uri": "https://foo.com",
          "nonce": "ituqknjm",
          "response_mode": "fragment"
        },
        "issuer": {
          "name": "Rain-Cloud59",
          "uri": "https://foo.com"
        },
        "client": {
          "id": "0oarygXgXKauBFLWo0g3",
          "name": "IDX",
          "_links": {

          }
        }
      }
    },
    "_links": {
      "next": {
        "name": "verify",
        "href": "https://foo.com/api/v1/authn/factors/clfk6mRsVLrhHznVe0g3/verify",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "cancel": {
        "href": "https://foo.com/api/v1/authn/cancel",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "resend": [
        {
          "name": "call",
          "href": "https://foo.com/api/v1/authn/factors/clfk6mRsVLrhHznVe0g3/verify/resend",
          "hints": {
            "allow": [
              "POST"
            ]
          }
        }
      ]
    }
  }
});
