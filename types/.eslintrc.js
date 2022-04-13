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
    'no-use-before-define': 0,
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
    "@typescript-eslint/no-unnecessary-type-constraint": ["warn"]
  }
};
