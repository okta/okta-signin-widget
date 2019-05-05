/* global __dirname */
const path = require('path');
const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');
const PACKAGE_JSON = require(path.join(ROOT_DIR, 'package.json'));
const MAIN_ENTRY = path.resolve(ROOT_DIR, PACKAGE_JSON.main);

const fs = require('fs');
if (!fs.existsSync(MAIN_ENTRY)) {
  throw new Error(`The main project must be built before building the test app. File not found: ${MAIN_ENTRY}`);
}

module.exports = {
  webpack: function (config /*, env */) {
    // Set aliases to built outputs
    Object.assign(config.resolve.alias, {
      '@okta/okta-signin-widget': MAIN_ENTRY,
      'okta-sign-in.min.css': path.resolve(ROOT_DIR, 'dist', 'css', 'okta-sign-in.min.css'),
      'okta-theme.css': path.resolve(ROOT_DIR, 'dist', 'css', 'okta-theme.css'),
    });
    // Remove the 'ModuleScopePlugin' which keeps us from requiring outside the src/ dir
    config.resolve.plugins = [];

    return config;
  }
};
