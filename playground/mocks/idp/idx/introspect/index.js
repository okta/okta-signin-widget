const templateHelper = require('../../../../config/templateHelper');

const path = __dirname.slice(__dirname.indexOf('idp') - 1);
let index = 0;
module.exports = {
  path,
  delay: [1000, 300],
  proxy: false,
  method: 'POST',
  template () {
    const filePath = templateHelper.getTemplatePath(path, index++);
    return require(filePath);
  },
};
