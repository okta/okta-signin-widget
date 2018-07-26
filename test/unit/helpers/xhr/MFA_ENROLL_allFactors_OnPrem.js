define({
  "status": 200,
  "responseType": "json",
  "response": {
    "stateToken": "testStateToken",
    "expiresAt": "2015-06-15T21:06:04.794Z",
    "status": "MFA_ENROLL",
    "_embedded": {
      "user": {
        "id": "00uhncCcppZD2158x0g3",
        "profile": {
          "login": "administrator1@clouditude.net",
          "firstName": "Add-Min",
          "lastName": "O'Cloudy Tud",
          "locale": "en_US",
          "timeZone": "America\/Los_Angeles"
        }
      },
      "factors": [{
        "enrollment": "OPTIONAL",
        "status": "NOT_SETUP",
        "factorType": "token:software:totp",
        "provider": "OKTA",
        "_links": {
          "enroll": {
            "href": "https:\/\/foo.com\/api\/v1\/authn\/factors",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          }
        }
      }, {
        "enrollment": "OPTIONAL",
        "status": "NOT_SETUP",
        "factorType": "push",
        "provider": "OKTA",
        "_links": {
          "enroll": {
            "href": "https:\/\/foo.com\/api\/v1\/authn\/factors",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          }
        }
      },{
        "enrollment": "OPTIONAL",
        "status": "NOT_SETUP",
        "factorType": "question",
        "provider": "OKTA",
        "vendorName": "OKTA",
        "_links": {
          "questions": {
            "href": "https:\/\/foo.com\/api\/v1\/users\/00uhncCcppZD2158x0g3\/factors\/questions",
            "hints": {
              "allow": [
                "GET"
              ]
            }
          },
          "enroll": {
            "href": "https:\/\/foo.com\/api\/v1\/authn\/factors",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          }
        }
      }, {
        "enrollment": "OPTIONAL",
        "status": "NOT_SETUP",
        "factorType": "token:software:totp",
        "provider": "GOOGLE",
        "vendorName": "GOOGLE",
        "_links": {
          "enroll": {
            "href": "https:\/\/foo.com\/api\/v1\/authn\/factors",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          }
        }
      }, {
        "enrollment": "OPTIONAL",
        "status": "NOT_SETUP",
        "factorType": "token",
        "provider": "DEL_OATH",
        "vendorName": "On-Prem MFA",
        "_links": {
          "enroll": {
            "href": "https:\/\/foo.com\/api\/v1\/authn\/factors",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          }
        },
        "profile": {
          "credentialId": "test123"
        }
      }, {
        "enrollment": "OPTIONAL",
        "status": "NOT_SETUP",
        "factorType": "token",
        "provider": "SYMANTEC",
        "vendorName": "SYMANTEC",
        "_links": {
          "enroll": {
            "href": "https:\/\/foo.com\/api\/v1\/authn\/factors",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          }
        }
      }, {
        "enrollment": "OPTIONAL",
        "status": "NOT_SETUP",
        "factorType": "token:hardware",
        "provider": "YUBICO",
        "vendorName": "YUBICO",
        "_links": {
          "enroll": {
            "href": "https://foo.com/api/v1/authn/factors",
            "hints": {
              "allow": ["POST"]
            }
          }
        }
      }, {
        "enrollment": "OPTIONAL",
        "status": "NOT_SETUP",
        "factorType": "sms",
        "provider": "OKTA",
        "vendorName": "OKTA",
        "_links": {
          "enroll": {
            "href": "https:\/\/foo.com\/api\/v1\/authn\/factors",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          }
        }
      },  {
        "enrollment": "OPTIONAL",
        "status": "NOT_SETUP",
        "factorType": "call",
        "provider": "OKTA",
        "vendorName": "OKTA",
        "_links": {
          "enroll": {
            "href": "https:\/\/foo.com\/api\/v1\/authn\/factors",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          }
        }
      }, {
        "enrollment": "OPTIONAL",
        "status": "NOT_SETUP",
        "factorType": "web",
        "provider": "DUO",
        "vendorName": "DUO",
        "_links": {
          "enroll": {
            "href": "https:\/\/foo.com\/api\/v1\/authn\/factors",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          }
        }
      }, {
        "enrollment": "OPTIONAL",
        "status": "NOT_SETUP",
        "factorType": "webauthn",
        "provider": "FIDO",
        "vendorName": "FIDO",
        "_links": {
          "enroll": {
            "href": "https:\/\/foo.com\/api\/v1\/authn\/factors",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          }
        }
      }, {
        "enrollment": "OPTIONAL",
        "status": "NOT_SETUP",
        "factorType": "u2f",
        "provider": "FIDO",
        "vendorName": "FIDO",
        "_links": {
          "enroll": {
            "href": "https:\/\/foo.com\/api\/v1\/authn\/factors",
            "hints": {
              "allow": [
                "POST"
              ]
            }
          }
        }
      }, {
        "enrollment": "OPTIONAL",
        "status": "NOT_SETUP",
        "factorType":"assertion:saml2",
        "provider":"GENERIC_SAML",
        "vendorName":"Third Party Factor",
        "_links":{  
           "enroll":{  
              "href":"http://rain.okta1.com:1802/api/v1/authn/factors",
              "hints":{  
                 "allow":[  
                    "POST"
                 ]
              }
           }
        },
        "profile":{  
           "user":"inca@clouditude.net"
        }
     }]
    },
    "_links": {
      "skip": {
        "href": "https:\/\/foo.com\/api\/v1\/authn\/skip",
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
      }
    }
  }
});
