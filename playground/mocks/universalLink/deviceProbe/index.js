const fs = require('fs');
const widgetrc = JSON.parse(fs.readFileSync('.widgetrc'));
const request = require('request');

var makeRequest = function (data) {
  request.post(widgetrc.widgetOptions.baseUrl + '/api/v1/authn/probe/verify', {
    json: {
      stateToken: data.stateToken,
      challengeResponse: data.jwt
    }
  });
};

var randomTimeout = function () {
  var min=5;
  var max=8;
  return Math.floor(Math.random() * (+max - +min)) + +min;
};

module.exports = {
  path: '/universalLink/deviceProbe',
  proxy: false,
  method: 'POST',
  status: (req, res, next) => {
    var nonce = req.body.nonce;
    var stateToken = req.body.stateToken;
    var jwt = widgetrc.widgetOptions.mockDeviceProbeChallengeResponseJwt;
    setTimeout(makeRequest, randomTimeout(), {
      stateToken: stateToken,
      jwt: jwt
    });
    next();
  },
};
