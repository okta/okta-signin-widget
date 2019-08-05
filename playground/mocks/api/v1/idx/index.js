/* eslint-disable no-unused-vars */
const factorRequiredEmail = [
  require('./data/factor-required-email.json'),
  require('./data/factor-verification-email.json'),
];
const factorRequiredPassword = [
  require('./data/factor-required-password.json'),
];
const path = __dirname.slice(__dirname.indexOf('api') - 1);

let index = 0;

module.exports = {
  path,
  delay: [1000, 3000],
  proxy: false,
  method: 'POST',
  template () {
    if (index >= factorRequiredPassword.length) {
      index = 0;
    }
    return factorRequiredPassword[index++];
  },
};
