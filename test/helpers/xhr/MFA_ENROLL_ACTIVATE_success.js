define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "testStateToken",
    "expiresAt": "2015-06-29T16:31:53.390Z",
    "status": "MFA_ENROLL_ACTIVATE",
    "_embedded": {
      "user": {
        "id": "00uhq1wvfbisestwN0g3",
        "profile": {
          "login": "inca@clouditude.net",
          "firstName": "Inca-Louise",
          "lastName": "O'Rain Dum",
          "locale": "en_US",
          "timeZone": "America\/Los_Angeles"
        }
      },
      "factor": {
        "id": "mbli45IDbggtwb4j40g3",
        "factorType": "sms",
        "provider": "OKTA",
        "profile": {
          "phoneNumber": "+1 XXX-XXX-6688"
        }
      }
    },
    "_links": {
      "next": {
        "name": "activate",
        "href": "https:\/\/foo.com\/api\/v1\/authn\/factors\/mbli45IDbggtwb4j40g3\/lifecycle\/activate",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "cancel": {
        "href": "https:\/\/foo.com\/api\/v1\/authn\/cancel",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "prev": {
        "href": "https:\/\/foo.com\/api\/v1\/authn\/previous",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      },
      "resend": [{
        "name": "sms",
        "href": "https:\/\/foo.com\/api\/v1\/authn\/factors\/mbli45IDbggtwb4j40g3\/lifecycle\/resend",
        "hints": {
          "allow": [
            "POST"
          ]
        }
      }]
    }
  }
});
