/* eslint-disable no-unused-vars */
const recoveryByEmail = [
  require('../data/factor-verification-email.json'),
  require('../data/factor-verification-email.json'),
  require('../data/factor-verification-email.json'),
  require('../data/factor-verification-email.json'),
  require('../data/terminal-email-transfered.json'),
];
const path = __dirname.slice(__dirname.indexOf('api') - 1);

const responseConfig = require('../../../../../config/responseConfig');

let index = 0;

module.exports = {
  path,
  proxy: false,
  method: 'POST',
  template () {
    if (responseConfig.poll !== 'default') {
      const fileName = responseConfig.poll;
      return require('../data/' + fileName + '.json');
    }

    if (index >= recoveryByEmail.length) {
      index = 0;
    }
    return recoveryByEmail[index++];
  },
};
