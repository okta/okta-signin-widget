const factorRequiredWithOptions = [
  require('./data/factor-required-password-with-options.json'),
  require('./data/factor-required-email-with-options.json')
];
const path = __dirname.slice(__dirname.indexOf('idp') - 1);
const testData = factorRequiredWithOptions;
let index = 0;
module.exports = {
  path,
  delay: [1000, 300],
  proxy: false,
  method: 'POST',
  template () {
    if (index >= testData.length) {
      index = 0;
    }
    return testData[index++];
  },
};
