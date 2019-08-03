const data = [
  require('./data/factor-required-email.json'),
  require('./data/factor-verification-email.json'),
];
const path = __dirname.slice(__dirname.indexOf('api') - 1);

let index = 0;

module.exports = {
  path,
  delay: [1000, 3000],
  proxy: false,
  method: 'POST',
  template () {
    if (index >= data.length) {
      index = 0;
    }
    return data[index++];
  },
};
