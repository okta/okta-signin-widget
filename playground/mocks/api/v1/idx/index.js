/* eslint-disable no-unused-vars */
const factorRequiredEmail = [
  require('./data/factor-required-email.json'),
  require('./data/factor-verification-email.json'),
];
const factorRequiredPassword = [
  require('./data/factor-required-password.json'),
];

const factorEnrollEmail = [
  require('./data/factor-enroll-options.json'),
  require('./data/factor-enroll-email.json'),
  require('./data/factor-verification-email.json'),
];

const factorEnrollPassword = [
  require('./data/factor-enroll-options.json'),
  require('./data/factor-enroll-password.json'),
];
const path = __dirname.slice(__dirname.indexOf('api') - 1);

let index = 0;

module.exports = {
  path,
  delay: [1000, 3000],
  proxy: false,
  method: 'POST',
  template () {
    if (index >= factorEnrollEmail.length) {
      index = 0;
    }
    return factorEnrollEmail[index++];
  },
};
