const data1 = require('./data/identify.json');
// const data1 = require('../data/factor-enroll-email.json');
//const data1 = require('../data/factor-enroll-password.json');
// const data1 = require('../data/factor-enroll-options.json');
// const data1 = require('../data/factor-verification-email.json');
//const data1 = require('../data/terminal-email-return.json');
// const data1 = require('../data/terminal-email-transfered.json');
//const data1 = require('../data/success.json');

const path = __dirname.slice(__dirname.indexOf('api') - 1);

const responseConfig = require('../../../../../config/responseConfig');

module.exports = {
  path,
  delay: [1000, 300],
  proxy: false,
  method: 'POST',
  template() {
    if (responseConfig.introspect !== 'default') {
      const fileName = responseConfig.introspect;
      return require('./data/' + fileName + '.json');
    }

    return data1
  },
};
