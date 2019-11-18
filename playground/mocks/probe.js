// To use this mock,
// in terminal, run `authenticator` to start the authenticator mock server
// in DeviceChallangePollView.js,
// change the getAuthenticatorUrl to return something like 
// http://localhost:4000/probe?authenticator=6512

module.exports = {
  path: '/probe',
  method: 'GET',
  status: (req, res, next) => {
    // send a 200 response with 500ms delay if foo is 6512
    // otherwise, timeout the the response (client is expecting to receive response within 1000ms)
    setTimeout(next, req.query.authenticator === '6512' ? 500 : 1500);
  }
};
