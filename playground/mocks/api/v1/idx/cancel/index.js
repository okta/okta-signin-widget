const data  = require('./data/cancel.json');
const path = __dirname.slice(__dirname.indexOf('api') - 1);

const responseConfig = require('../../../../../config/responseConfig');

module.exports = {
  path,
  delay: [1000, 300],
  proxy: false,
  method: 'POST',
  template() {
    if (responseConfig.cancel !== 'default') {
      const fileName = responseConfig.cancel;
      return require('./data/' + fileName + '.json');
    }

    return data;
  },
};
