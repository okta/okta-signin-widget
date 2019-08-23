const fs = require('fs');
const widgetrc = JSON.parse(fs.readFileSync('.widgetrc'));
const request = require('request');

var makeRequest = function (data) {
  request.post(widgetrc.widgetOptions.baseUrl + '/api/v1/authn/factors/' + data.factorId + '/verify', {
    json: {
      stateToken: data.stateToken,
      devicePostureJwt: data.jwt
    }
  });
};

var randomTimeout = function () {
  var min=4;
  var max=8;
  return Math.floor(Math.random() * (+max - +min)) + +min;
};

module.exports = {
  path: '/asyncLink/factorVerification',
  proxy: false,
  method: 'POST',
  status: (req, res, next) => {
    var nonce = req.body.nonce;
    var stateToken = req.body.stateToken;
    var factorId = req.body.factorId;
    var jwt = widgetrc.widgetOptions.mockDeviceFactorChallengeResponseJwt;
    setTimeout(makeRequest, randomTimeout(), {
      stateToken: stateToken,
      jwt: jwt,
      factorId: factorId
    });
    next();
  },
};
