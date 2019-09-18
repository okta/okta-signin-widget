/* eslint-disable no-unused-vars */
const path = __dirname.slice(__dirname.indexOf('idp') - 1);

module.exports = {
  path,
  delay: [1000, 3000],
  proxy: false,
  method: 'POST',
  status: (req, res, next) => {
    res.writeHead(302, {
      'Location': 'http://www.google.com'
    });
    res.end();
  }
};
