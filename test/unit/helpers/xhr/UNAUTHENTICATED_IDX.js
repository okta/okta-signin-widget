define({
    "status": 200,
    "responseType": "json",
    "response": {
        "stateToken": "01StateToken",
        "status": "UNAUTHENTICATED",
        "type": "LOGIN",
        "_embedded": {},
        "_links": {
            "cancel": {
                "href": "https://foo.okta.com/api/v1/authn/cancel",
                "hints": {
                    "allow": [
                        "POST"
                    ]
                }
            },
            "recoverLogin": {
                "href": "https://foo.okta.com/api/v1/authn/recoverLogin",
                "hints": {
                    "allow": [
                        "POST"
                    ]
                }
            },
            "enroll": {
                "href": "https://foo.okta.com/api/v1/authn/enroll",
                "hints": {
                    "allow": [
                        "POST"
                    ]
                }
            },
            "login": {
                "href": "https://foo.okta.com/api/v1/authn/login",
                "hints": {
                    "allow": [
                        "POST"
                    ]
                }
            }
        }
    }
});