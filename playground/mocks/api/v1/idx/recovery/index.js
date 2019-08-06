/* eslint-disable no-unused-vars */
const recoveryByEmail = [
  require('../data/factor-required-email.json'),
  require('../data/factor-verification-email.json'),
];
const path = __dirname.slice(__dirname.indexOf('api') - 1);

let index = 0;

module.exports = {
  path,
  delay: [1000, 3000],
  proxy: false,
  method: 'POST',
  template () {
    if (index >= recoveryByEmail.length) {
      index = 0;
    }
    return recoveryByEmail[index++];
  },
};
