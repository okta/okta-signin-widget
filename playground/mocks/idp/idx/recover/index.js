/* eslint-disable no-unused-vars */
const recoverByEmail = [
  require('../data/factor-required-email.json'),
];
const path = __dirname.slice(__dirname.indexOf('idp') - 1);

let index = 0;

module.exports = {
  path,
  delay: [1000, 3000],
  proxy: false,
  method: 'POST',
  template () {
    if (index >= recoverByEmail.length) {
      index = 0;
    }
    return recoverByEmail[index++];
  },
};
