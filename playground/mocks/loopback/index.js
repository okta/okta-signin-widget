const data = {
  jwt: 'eyJraWQiOiI4aXptaXpyemw0Y2R5N2V4MWpucyIsImFsZyI6IlJTMjU2In0.eyJkZXZpY2VFbnJvbGxtZW50SWQiOiJkZW4xMnl4R0VNUGppaW96dDBnNCIsIm5vbmNlIjoiPGZpbGxJbj4iLCJkZXZpY2Vfb3MiOiJ3aW5kb3dzIn0.IX4y5D0DrnKDUYZH1kLJc8UEMvWiS7Jld7ggorWbdOQv1j0qGFQb2SlI24d2l86I73eZV-4d6h0mn8O_XpcVafKJjUAuvvCz7jXZr8qIiVR3o-Lcpdjc3T9OWLKZOQEz4INxJ3Oh-3K2xZrDmf-5db-ylV_y9kXtEZtQHSBV8y_WwLZ6sHIOZ4og8D6jScbiy7wSs5YHRRsQ5I1qdUvNdUtmxOEoLrycz2vWTiMpkfkUi9wjU9mdmUtpb3L052eJTnpXwz_-oS7Dce3KYisiPZBHzl8xCkPnXp3dTeZ3wBsfOihS167SgQqMutqNSIcCJVS7h7m0F77YkVTo_9ukwg',
};

module.exports = {
  path: '/loopback/:port',
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
