const path = __dirname.slice(__dirname.indexOf('idp') - 1);
const templateHelper = require('../../../config/templateHelper');
let index = 0;
module.exports = {
  path,
  delay: [1000, 3000],
  proxy: false,
  method: 'POST',
  template () {
    const filePath = templateHelper.getTemplatePath(path, index++);
    return require(filePath);
  },
};
