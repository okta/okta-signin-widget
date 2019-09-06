/* eslint-disable no-unused-vars */
const factorRequiredEmail = [
  require('./data/factor-required-email.json'),
  require('./data/factor-verification-email.json'),
  require('./data/terminal-email-return.json'),
];

const factorRequiredPassword = [
  require('./data/factor-required-password.json'),
];

const factorEnrollEmail = [
  require('./data/factor-enroll-options.json'),
  require('./data/factor-enroll-email.json'),
  require('./data/factor-verification-email.json'),
  require('./data/terminal-email-transfered.json'),
];

const factorEnrollPassword = [
  require('./data/factor-enroll-options.json'),
  require('./data/factor-enroll-password.json'),
];

const success = [
  require('./data/success.json'),
];

const factorRequiredMultiple = [
  require('./data/factor-required-options.json')
];

const responseConfig = require('../../../../config/responseConfig');

const path = __dirname.slice(__dirname.indexOf('api') - 1);

const testData = success;

let index = 0;

module.exports = {
  path,
  delay: [1000, 3000],
  proxy: false,
  method: 'POST',
  template () {
    if (responseConfig.idx !== 'default') {
      const fileName = responseConfig.idx;
      return require('./data/' + fileName + '.json');
    }

    if (index >= testData.length) {
      index = 0;
    }
    return testData[index++];
  },
};
