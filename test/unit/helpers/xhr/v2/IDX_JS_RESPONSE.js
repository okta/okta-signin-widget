const data = {
    "state": 200,
    "responseType": "json",
    "response": { 
        "neededToProceed":[
           {
            "accepts": "application/vnd.okta.v1+json",
            "action": "ƒ (_x)",
            "href": "http://rain.okta1.com:1802/idp/idx/identify",
            "method": "post",
            "name": "identify",
            "rel": ["create-form"],
            "value": [{
               "label": "Username",
               "method": "post",
               "name": "identifier"
            }]
           },
           {
            "accepts": "application/vnd.okta.v1+json",
            "action": "ƒ (_x)",
            "href": "http://rain.okta1.com:1802/idp/idx/enroll",
            "method": "post",
            "name": "select-enroll-profile",
            "rel": ["create-form"],
            "value": []
           }
         ],
        "actions":{ 
     
        },
        "context":{ 
           "stateHandle":"02TUQZl4LUdJRwP4yOW_6Ck7x2iCTAxjgZLuoMvwmZ",
           "version":"1.0.0",
           "expiresAt":"2020-02-20T06:25:38.000Z",
           "step":"IDENTIFY",
           "intent":"LOGIN"
        },
        "rawIdxState":{ 
           "stateHandle":"02TUQZl4LUdJRwP4yOW_6Ck7x2iCTAxjgZLuoMvwmZ",
           "version":"1.0.0",
           "expiresAt":"2020-02-20T06:25:38.000Z",
           "step":"IDENTIFY",
           "intent":"LOGIN",
           "remediation":{ 
              "type":"array",
              "value":[ 
                 { 
                    "rel":[ 
                       "create-form"
                    ],
                    "name":"identify",
                    "href":"http://rain.okta1.com:1802/idp/idx/identify",
                    "method":"POST",
                    "accepts":"application/vnd.okta.v1+json",
                    "value":[ 
                       { 
                          "name":"identifier",
                          "label":"Username"
                       },
                       { 
                          "name":"stateHandle",
                          "required":true,
                          "value":"02TUQZl4LUdJRwP4yOW_6Ck7x2iCTAxjgZLuoMvwmZ",
                          "visible":false,
                          "mutable":false
                       }
                    ]
                 },
                 { 
                    "rel":[ 
                       "create-form"
                    ],
                    "name":"select-enroll-profile",
                    "href":"http://rain.okta1.com:1802/idp/idx/enroll",
                    "method":"POST",
                    "accepts":"application/vnd.okta.v1+json",
                    "value":[ 
                       { 
                          "name":"stateHandle",
                          "required":true,
                          "value":"02TUQZl4LUdJRwP4yOW_6Ck7x2iCTAxjgZLuoMvwmZ",
                          "visible":false,
                          "mutable":false
                       }
                    ]
                 }
              ]
           },
           "cancel":{ 
              "rel":[ 
                 "create-form"
              ],
              "name":"cancel",
              "href":"http://rain.okta1.com:1802/idp/idx/cancel",
              "method":"POST",
              "accepts":"application/vnd.okta.v1+json",
              "value":[ 
                 { 
                    "name":"stateHandle",
                    "required":true,
                    "value":"02TUQZl4LUdJRwP4yOW_6Ck7x2iCTAxjgZLuoMvwmZ",
                    "visible":false,
                    "mutable":false
                 }
              ]
           },
           "context":{ 
              "rel":[ 
                 "create-form"
              ],
              "name":"context",
              "href":"http://rain.okta1.com:1802/idp/idx/context",
              "method":"POST",
              "accepts":"application/vnd.okta.v1+json",
              "value":[ 
                 { 
                    "name":"stateHandle",
                    "required":true,
                    "value":"02TUQZl4LUdJRwP4yOW_6Ck7x2iCTAxjgZLuoMvwmZ",
                    "visible":false,
                    "mutable":false
                 }
              ]
           }
        }
     },
  }

  module.exports = data;
  