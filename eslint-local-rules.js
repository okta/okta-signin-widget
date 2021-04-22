var noBareTemplates = require('./packages/@okta/eslint-plugin-okta-ui/lib/rules/no-bare-templates');
var noMissingKeys = require('./packages/@okta/eslint-plugin-okta-ui/lib/rules/no-missing-keys');
var noMissingAPIKeys = require('./packages/@okta/eslint-plugin-okta-ui/lib/rules/no-missing-api-keys');

module.exports = {
  'no-bare-templates': noBareTemplates,
  'no-missing-keys': noMissingKeys,
  'no-missing-api-keys': noMissingAPIKeys
};
