/* eslint-disable no-unused-vars */

const factorRequiredEmail = [
  require('./data/factor-required-email.json'),
  require('./data/factor-verification-email.json'),
  require('./data/terminal-email-return.json'),
];

const factorRequiredPassword = [
  require('./data/factor-required-password.json'),
  require('./data/success.json'),
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

const unknownUser = [
  require('./data/unknown-user.json'),
];

const factorRequiredMultiple = [
  require('./data/factor-required-options.json')
];

const path = __dirname.slice(__dirname.indexOf('idp') - 1);
const templateHelper = require('../../../config/templateHelper');
let index = 0;
module.exports = {
  path,
  delay: [1000, 3000],
  proxy: false,
  method: 'POST',
  template () {
    const filePath = templateHelper.getTemplatePath(path, index++);
    return require(filePath);
  },
};
