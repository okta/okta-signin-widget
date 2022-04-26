module.exports = {
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  'env': {
    'browser': true,
    'node': true,
    'amd': true
  },
  'parser': '@typescript-eslint/parser',
  'overrides': [
    {
      'files': ['*.ts'],
      'parserOptions': {
        'ecmaVersion': 2020,
        'sourceType': 'module',
        'project': 'types/tsconfig.json',
      }
    }
  ],
  'parserOptions': {
    'project': 'types/tsconfig.json',
  },
  'plugins': [
    '@typescript-eslint'
  ],
  'rules': {
    'no-var': "off",
    'no-use-before-define': "off",
    "no-dupe-class-members": "off",
    "@typescript-eslint/array-type": ["warn", { "default": "generic" }],
    "@typescript-eslint/no-dupe-class-members": "error",
    "@typescript-eslint/unified-signatures": "off",
    "@typescript-eslint/consistent-indexed-object-style": ["warn", "index-signature"],
    "@typescript-eslint/explicit-module-boundary-types": ["error"],
    "@typescript-eslint/member-delimiter-style": ["warn"],
    "@typescript-eslint/method-signature-style": ["warn"],
    "@typescript-eslint/explicit-function-return-type": ["warn"],
    "@typescript-eslint/no-invalid-void-type": "off",
    "@typescript-eslint/no-unnecessary-type-constraint": ["warn"],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/consistent-indexed-object-style": "off",
    "@typescript-eslint/method-signature-style": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@okta/okta/no-exclusive-language": "off"
  }
};
