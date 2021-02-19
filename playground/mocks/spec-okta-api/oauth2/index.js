const templateHelper = require('../../config/templateHelper');

const wellKnown = [
  '/oauth2/default/.well-known/openid-configuration',
].map(path => {
  return templateHelper({path, method: 'GET' });
});

const apiEndpoints = [
  '/oauth2/default/v1/interact',
].map(path => {
  return templateHelper({path});
});

module.exports = Object.assign({}, wellKnown, apiEndpoints);
