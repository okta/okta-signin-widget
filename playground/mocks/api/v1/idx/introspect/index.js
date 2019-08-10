const data1 = require('./data/identify.json');
// const data1 = require('../data/factor-enroll-options.json');
// const data1 = require('../data/factor-verification-email.json');
// const data1 = require('../data/terminal.json');
const path = __dirname.slice(__dirname.indexOf('api') - 1);

module.exports = {
  path,
  delay: [1000, 300],
  proxy: false,
  method: 'POST',
  template: data1,
};
