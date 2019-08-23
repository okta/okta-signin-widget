const fs = require('fs');
const widgetrc = JSON.parse(fs.readFileSync('.widgetrc'));
const data = {
  jwt: widgetrc.widgetOptions.mockDeviceFactorEnrollmentResponseJwt,
};

module.exports = {
  path: '/loopback/factorEnrollChallenge/:port',
  proxy: false,
  method: 'POST',
  template: (params, query, body, cookies, headers) => {
    if (params.port === '41244') {
      return data;
    }
  },
  status: (req, res, next) => {
    const portNumber = req.params.port;
    switch(portNumber) {
    case '41236':
      res.status(400);
      break;
    case '41238':
      res.status(401);
      break;
    case '41240':
      res.status(403);
      break;
    case '41242':
      res.status(406);
      break;
    case '41244':
      res.status(200);
      break;
    default:
      res.status(400);
    }
    next();
  },
};
