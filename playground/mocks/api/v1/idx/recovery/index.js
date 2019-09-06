/* eslint-disable no-unused-vars */
const recoveryByEmail = [
  require('../data/factor-required-email.json'),
];
const path = __dirname.slice(__dirname.indexOf('api') - 1);

const responseConfig = require('../../../../../config/responseConfig');

let index = 0;

module.exports = {
  path,
  delay: [1000, 3000],
  proxy: false,
  method: 'POST',
  template () {
    if (responseConfig.recovery !== 'default') {
      const fileName = responseConfig.recovery;
      return require('../data/' + fileName + '.json');
    }

    if (index >= recoveryByEmail.length) {
      index = 0;
    }
    return recoveryByEmail[index++];
  },
};
