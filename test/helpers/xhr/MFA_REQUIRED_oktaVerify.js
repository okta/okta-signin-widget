define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "testStateToken",
    "expiresAt": "2015-06-11T21:33:24.778Z",
    "status": "MFA_REQUIRED",
    "_embedded": {
      "user": {
        "id": "00uhn6dAGR4nUB4iY0g3",
        "profile": {
          "login": "administrator1@clouditude.net",
          "firstName": "Add-Min",
          "lastName": "O'Cloudy Tud",
          "locale": "en_US",
          "timeZone": "America\/Los_Angeles"
        }
      },
      "policy": {
        "allowRememberDevice": true,
        "rememberDeviceLifetimeInMinutes": 0,
        "rememberDeviceByDefault": false
      },
      "factors": [
        {
          "id": "opfhw7v2OnxKpftO40g3",
          "factorType": "push",
          "provider": "OKTA",
          "vendorName": "OKTA",
          "profile": {
            "credentialId": "administrator1@clouditude.net",
            "deviceType": "SmartPhone_IPhone",
            "keys": [{
              "kty": "PKIX",
              "use": "sig",
              "kid": "default",
              "x5c": [
                "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7FChGVis3ZuMsu2gkpzNvwQ7KZ8hO98/\nVxptGzx6K5uZPNjGxtE8wxkbvjZXQ5m5FTRNp4flVQ7ZuPhl/T+g7vAfhZZ+vjQAzyA3Ep5GsDBG\nnhQAYmsfJrVX8GH0TQx20kbBW4LsW4odQaITvLb1p3iudj7765KVPRFu0B3zY4niOkiJ94FU9r1w\nBi0EjFBP4Z0HBM2/7pKi338jmVIujLJFQbh1iqM6XxfAHYAajeD9mfyJshlpLMK4Yn/a7OEMpUIw\nrhDykhgaZJv6M0npd9mhitBkxdu3xPEZVUFB2tWN8M9D97BTl+tmMDALkW2wFaeg5UDFfy4dZY1S\nAN8lmwIDAQAB\n"
              ]
            }],
            "name": "Yuming's iPhone",
            "platform": "IOS",
            "version": "9.3.1"
          },
          "_links": {
            "verify": {
              "href": "https:\/\/foo.com\/api\/v1\/authn\/factors\/opfhw7v2OnxKpftO40g3\/verify",
              "hints": {
                "allow": [
                  "POST"
                ]
              }
            }
          }
        },
        {
          "id": "osthw62MEvG6YFuHe0g3",
              "factorType": "token:software:totp",
              "provider": "OKTA",
              "vendorName": "OKTA",
              "profile": {
            "credentialId": "administrator1@clouditude.net"
          },
          "_links": {
            "verify": {
              "href": "https:\/\/foo.com\/api\/v1\/authn\/factors\/osthw62MEvG6YFuHe0g3\/verify",
                  "hints": {
                "allow": [
                  "POST"
                ]
              }
            }
          }
        }
      ]
    },
    "_links": {
      "cancel": {
        "href": "https:\/\/rc.okta1.com:80\/api\/v1\/authn\/cancel",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }
    }
  }
});
