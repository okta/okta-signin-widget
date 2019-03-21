define({
    "status": 200,
    "responseType": "json",
    "response": {
        "stateToken": "01auGQpCX-zX6JpxjaTJsYpm4YG4hJ94ZD0pgsCv7I",
        "type": "LOGIN",
        "expiresAt": "2019-03-08T21:35:40.000Z",
        "status": "FACTOR_REQUIRED",
        "_embedded": {
            "request": {
                "ip": "127.0.0.1",
                "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36"
            },
            "user": {
                "id": "00uwd7cBE4Zzg7nVj0g3",
                "passwordChanged": "2019-02-02T00:15:12.000Z",
                "profile": {
                    "login": "evra@rain.com",
                    "firstName": "pat",
                    "lastName": "evra",
                    "locale": "en",
                    "timeZone": "America/Los_Angeles"
                }
            },
            "factors": [
                {
                    "id": "ufs14lvnwBy531Tck0g4",
                    "factorType": "question",
                    "provider": "OKTA",
                    "vendorName": "OKTA",
                    "profile": {
                        "question": "name_of_first_plush_toy",
                        "questionText": "What is the name of your first stuffed animal?"
                    },
                    "_links": {
                        "verify": {
                            "href": "http://rain.okta1.com:1802/api/v1/authn/factors/ufs14lvnwBy531Tck0g4/verify",
                            "hints": {
                                "allow": [
                                    "POST"
                                ]
                            }
                        }
                    }
                }
            ],
            "authentication": {
                "protocol": "OAUTH2.0",
                "request": {
                    "scope": "openid profile",
                    "response_type": "id_token",
                    "redirect_uri": "http://rain.okta1.com:1802",
                    "nonce": "5vty5ytu",
                    "response_mode": "fragment"
                },
                "issuer": {
                    "name": "Rain-Cloud59",
                    "uri": "http://nikhil.sigmanetcorp.us:1802"
                },
                "client": {
                    "id": "0oat59f8prmWrik500g3",
                    "name": "IDX",
                    "_links": {

                    }
                }
            }
        },
        "_links": {
            "cancel": {
                "href": "http://rain.okta1.com:1802/api/v1/authn/cancel",
                "hints": {
                    "allow": [
                        "POST"
                    ]
                }
            }
        }
    }
});
