/* global module */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'references-empty': [2, 'never'],
    'header-max-length': [2, 'always', 80]
  },
  parserPreset: {
    parserOpts: {
      issuePrefixes: ['OKTA-']
    }
  }
};
