const fs = require('fs');
const widgetrc = JSON.parse(fs.readFileSync('.widgetrc'));
const data = {
  jwt: widgetrc.widgetOptions.mockDeviceProbeChallengeResponseJwt,
};

module.exports = {
  path: '/loopback/deviceProbe/:port',
  proxy: false,
  method: 'POST',
  template: (params, query, body, cookies, headers) => {
    if (params.port === '5008') {
      return data;
    }
  },
  status: (req, res, next) => {
    const portNumber = req.params.port;
    switch(portNumber) {
    case '5000':
      res.status(400);
      break;
    case '5002':
      res.status(401);
      break;
    case '5004':
      res.status(403);
      break;
    case '5006':
      res.status(406);
      break;
    case '5008':
    default:
      res.status(200);
    }
    next();
  },
};
