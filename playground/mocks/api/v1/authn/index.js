const data1 = require('./data/success-001.json');

module.exports = {
  path: '/api/v1/authn',
  proxy: false,
  method: 'POST',
  template: data1,
};
