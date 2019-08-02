const data = {
  "status": 200,
  "responseType": "json",
  "response": {
    "stateHandle": "01tMP5_JnB1zSBiz-KfHp_Vw3yHNG04KeHkQTgMfum",
    "version": "1.0.0",
    "expiresAt": "2019-07-31T22:17:36.000Z",
    "step": "IDENTIFY",
    "intent": "LOGIN",
    "remediation": {
      "type": "array",
      "value": [
        {
          "rel": [
            "create-form"
          ],
          "name": "identify",
          "href": "http://rain.okta1.com:1802/api/v1/idx",
          "method": "POST",
          "accepts": "application/vnd.okta.v1+json",
          "value": [
            {
              "name": "identifier",
              "label": "identifier"
            },
            {
              "name": "stateHandle",
              "value": "01tMP5_JnB1zSBiz-KfHp_Vw3yHNG04KeHkQTgMfum",
              "visible": false
            }
          ]
        }
      ]
    },
    "cancel": {
      "rel": [
        "create-form"
      ],
      "name": "cancel",
      "href": "http://rain.okta1.com:1802/api/v1/idx/cancel",
      "method": "POST",
      "accepts": "application/vnd.okta.v1+json",
      "value": [
        {
          "name": "stateHandle",
          "value": "01tMP5_JnB1zSBiz-KfHp_Vw3yHNG04KeHkQTgMfum",
          "visible": false
        }
      ]
    },
    "context": {
      "rel": [
        "create-form"
      ],
      "name": "context",
      "href": "http://rain.okta1.com:1802/api/v1/idx/context",
      "method": "POST",
      "accepts": "application/vnd.okta.v1+json",
      "value": [
        {
          "name": "stateHandle",
          "value": "01tMP5_JnB1zSBiz-KfHp_Vw3yHNG04KeHkQTgMfum",
          "visible": false
        }
      ]
    }
  }
};
module.exports = data;
