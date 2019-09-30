/* eslint-disable no-unused-vars */
const recoverByEmail = [
  require('../data/factor-verification-email.json'),
  require('../data/factor-verification-email.json'),
  require('../data/factor-verification-email.json'),
  require('../data/factor-verification-email.json'),
  require('../data/terminal-transfered-email.json'),
];
const path = __dirname.slice(__dirname.indexOf('idp') - 1);

let index = 0;

module.exports = {
  path,
  proxy: false,
  method: 'POST',
  template () {
    if (index >= recoverByEmail.length) {
      index = 0;
    }
    return recoverByEmail[index++];
  },
};
