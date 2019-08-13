/* global module */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'references-empty': [2, 'never'],
  },
  parserPreset: {
    parserOpts: {
      issuePrefixes: ['OKTA-']
    }
  }
};
