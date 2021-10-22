const templateHelper = require('../../../../config/templateHelper');

const authn = [
  '/api/v1/authn/introspect',
  '/api/v1/authn/skip',
  '/api/v1/authn',
  '/api/v1/authn/device/activate',
  '/api/v1/authn/factors/:factorid/lifecycle/activate',
  '/api/v1/authn/factors/:factorid/lifecycle/resend',
  '/api/v1/authn/factors/:factorid/verify',
  '/api/v1/authn/factors/:factorid/verify/resend',
  '/api/v1/authn/factors',
].map(path => {
  return templateHelper({path});
});

module.exports = authn;
