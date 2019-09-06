const factorRequiredWithOptions = [
  require('./data/factor-required-password-with-options.json'),
  require('./data/factor-required-email-with-options.json')
];
const path = __dirname.slice(__dirname.indexOf('api') - 1);
const testData = factorRequiredWithOptions;

const responseConfig = require('../../../../../config/responseConfig');

let index = 0;
module.exports = {
  path,
  delay: [1000, 300],
  proxy: false,
  method: 'POST',
  template () {
    if (responseConfig.challenge !== 'default') {
      const fileName = responseConfig.challenge;
      return require('./data/' + fileName + '.json');
    }

    if (index >= testData.length) {
      index = 0;
    }
    return testData[index++];
  },
};
