module.exports = {
  extends: 'plugin:jasmine/recommended',
  plugins: [
    'jasmine'
  ],
  env: {
    node: true,
    jasmine: true
  },
  rules: {
    'max-len': 0,
    'complexity': 0,
    'max-params': 0,
    'max-statements': 0,
  
    'jasmine/new-line-before-expect': 0,
    'jasmine/new-line-between-declarations': 0,

    // Consider enabling these
    'jasmine/no-unsafe-spy': 0,
    'jasmine/prefer-toHaveBeenCalledWith': 0
  }
};
