const templateHelper = require('../../config/templateHelper');

const wellKnown = [
  '/oauth2/default/.well-known/openid-configuration',
].map(path => {
  return templateHelper({path, method: 'GET' });
});

const apiEndpoints = [
  '/oauth2/default/v1/interact',
  '/oauth2/default/v1/token'
].map(path => {
  return templateHelper({path});
});

module.exports = wellKnown.concat(apiEndpoints);
