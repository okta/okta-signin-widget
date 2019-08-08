const data1 = require('./data/enroll-profile.json');
const path = __dirname.slice(__dirname.indexOf('api') - 1);

module.exports = {
  path,
  delay: [1000, 300],
  proxy: false,
  method: 'POST',
  template: data1,
};
