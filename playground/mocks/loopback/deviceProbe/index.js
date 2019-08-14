// Uncomment for Jintai:
// const data = {
// eslint-disable-next-line max-len
//   jwt: 'eyJraWQiOiI4aXptaXpyemw0Y2R5N2V4MWpucyIsImFsZyI6IlJTMjU2In0.eyJkZXZpY2VFbnJvbGxtZW50SWQiOiJkZW4xMnl4R0VNUGppaW96dDBnNCIsIm5vbmNlIjoiPGZpbGxJbj4iLCJkZXZpY2Vfb3MiOiJ3aW5kb3dzIn0.IX4y5D0DrnKDUYZH1kLJc8UEMvWiS7Jld7ggorWbdOQv1j0qGFQb2SlI24d2l86I73eZV-4d6h0mn8O_XpcVafKJjUAuvvCz7jXZr8qIiVR3o-Lcpdjc3T9OWLKZOQEz4INxJ3Oh-3K2xZrDmf-5db-ylV_y9kXtEZtQHSBV8y_WwLZ6sHIOZ4og8D6jScbiy7wSs5YHRRsQ5I1qdUvNdUtmxOEoLrycz2vWTiMpkfkUi9wjU9mdmUtpb3L052eJTnpXwz_-oS7Dce3KYisiPZBHzl8xCkPnXp3dTeZ3wBsfOihS167SgQqMutqNSIcCJVS7h7m0F77YkVTo_9ukwg',
// };

// Uncomment for Lars:
const data = {
  // eslint-disable-next-line max-len
  jwt: 'eyJraWQiOiIwdHIwYjJlcGEyZXV6andzNDgzeCIsImFsZyI6IlJTMjU2In0.eyJkZXZpY2VFbnJvbGxtZW50SWQiOiJkZW50MjNublB2NUhkeWVMdTBnMyIsImFwcF9tYW5hZ2VkIjoiZmFsc2UiLCJub25jZSI6IjxmaWxsSW4-IiwiZGV2aWNlX29zIjoiaW9zIn0.HNTXAICEUWpFW_0yG5J-OiRCYVrOrNhZYbe6GdwSYXV92WadStxcOaE_d3eRY9yMKDOlRXXdKE0eIyY_6k5QJv5udcy6-TTJAB6_nxPQCtlXmXqoat61n6l57AnElstZJvjwruIdzCw-B5nP_HLr2wSXkOukF7-J9sZXec5Rh-TDrYR2TXv2fAsuH1v02g3ZpZ8FVV2OuNcWlkg0f1-lSPXTgr1Keasqdm3nIxqwOWcxT1AWcepMdSWhY1t8seu3BqN1oH2GLMdiCxSAjhTtr4NIbLcR4uPXI_gJieGdZmL2xd2ZA_t6d1sUAYy62JFELfwM8NAORI3oorHRn27SJw',
}

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
