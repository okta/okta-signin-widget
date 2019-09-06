const data1 = require('./data/enroll-profile.json');
const path = __dirname.slice(__dirname.indexOf('api') - 1);

const responseConfig = require('../../../../../config/responseConfig');

module.exports = {
  path,
  delay: [1000, 300],
  proxy: false,
  method: 'POST',
  template() {
    if (responseConfig.enroll !== 'default') {
      const fileName = responseConfig.enroll;
      return require('./data/' + fileName + '.json');
    }

    return data1
  },
};
