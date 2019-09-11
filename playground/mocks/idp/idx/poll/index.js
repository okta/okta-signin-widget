/* eslint-disable no-unused-vars */
const recoveryByEmail = [
  require('../data/factor-verification-email.json'),
  require('../data/factor-verification-email.json'),
  require('../data/factor-verification-email.json'),
  require('../data/factor-verification-email.json'),
  require('../data/terminal-email-transfered.json'),
];
const path = __dirname.slice(__dirname.indexOf('idp') - 1);

let index = 0;

module.exports = {
  path,
  proxy: false,
  method: 'POST',
  template () {
    if (index >= recoveryByEmail.length) {
      index = 0;
    }
    return recoveryByEmail[index++];
  },
};
