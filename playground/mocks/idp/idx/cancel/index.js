const data  = require('./data/cancel.json');
const path = __dirname.slice(__dirname.indexOf('idp') - 1);

module.exports = {
  path,
  delay: [1000, 300],
  proxy: false,
  method: 'POST',
  template: data,
};
