/* eslint-disable */

export default {
    "version": "1.0.0",
    "stateHandle": "randomstringvalue",
    "expiresAt": "2021-11-18T20:23:20.000Z",
    "intent": "LOGIN",
    "remediation": {
        "type": "array",
        "value": [
            {
                "rel": [
                    "create-form"
                ],
                "name": "identify",
                "href": "http://localhost:3005/idp/idx/identify",
                "method": "POST",
                "produces": "application/ion+json; okta-version=1.0.0",
                "value": [
                    {
                        "name": "identifier",
                        "label": "Username"
                    },
                    {
                        "name": "credentials",
                        "type": "object",
                        "form": {
                            "value": [
                                {
                                    "name": "passcode",
                                    "label": "Password",
                                    "secret": true
                                }
                            ]
                        },
                        "required": true
                    },
                    {
                        "name": "rememberMe",
                        "type": "boolean",
                        "label": "Remember this device"
                    },
                    {
                        "name": "stateHandle",
                        "required": true,
                        "value": "randomstringvalue",
                        "visible": false,
                        "mutable": false
                    }
                ],
                "accepts": "application/json; okta-version=1.0.0"
            },
            {
                "rel": [
                    "create-form"
                ],
                "name": "select-enroll-profile",
                "href": "http://localhost:3005/idp/idx/enroll",
                "method": "POST",
                "produces": "application/ion+json; okta-version=1.0.0",
                "value": [
                    {
                        "name": "stateHandle",
                        "required": true,
                        "value": "randomstringvalue",
                        "visible": false,
                        "mutable": false
                    }
                ],
                "accepts": "application/json; okta-version=1.0.0"
            },
            {
                "rel": [
                    "create-form"
                ],
                "name": "unlock-account",
                "href": "http://localhost:3005/idp/idx/unlock-account",
                "method": "POST",
                "produces": "application/ion+json; okta-version=1.0.0",
                "value": [
                    {
                        "name": "stateHandle",
                        "required": true,
                        "value": "randomstringvalue",
                        "visible": false,
                        "mutable": false
                    }
                ],
                "accepts": "application/json; okta-version=1.0.0"
            }
        ]
    },
    "currentAuthenticator": {
        "type": "object",
        "value": {
            "recover": {
                "rel": [
                    "create-form"
                ],
                "name": "recover",
                "href": "http://localhost:3005/idp/idx/recover",
                "method": "POST",
                "produces": "application/ion+json; okta-version=1.0.0",
                "value": [
                    {
                        "name": "stateHandle",
                        "required": true,
                        "value": "randomstringvalue",
                        "visible": false,
                        "mutable": false
                    }
                ],
                "accepts": "application/json; okta-version=1.0.0"
            },
            "type": "password",
            "key": "okta_password",
            "id": "anotherstringid",
            "displayName": "Password",
            "methods": [
                {
                    "type": "password"
                }
            ]
        }
    },
    "cancel": {
        "rel": [
            "create-form"
        ],
        "name": "cancel",
        "href": "http://localhost:3005/idp/idx/cancel",
        "method": "POST",
        "produces": "application/ion+json; okta-version=1.0.0",
        "value": [
            {
                "name": "stateHandle",
                "required": true,
                "value": "randomstringvalue",
                "visible": false,
                "mutable": false
            }
        ],
        "accepts": "application/json; okta-version=1.0.0"
    },
    "app": {
        "type": "object",
        "value": {
            "name": "oidc_client",
            "label": "Test App",
            "id": "appstringid"
        }
    }
  }