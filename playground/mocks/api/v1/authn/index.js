// const data1 = require('./data/success-001.json');
// const data1 = require('./data/mfa-required-all');
const data1 = require('./data/recovery-challenge-sms-pwd');

module.exports = {
  path: '/api/v1/authn',
  proxy: false,
  method: 'POST',
  template: data1,
};
