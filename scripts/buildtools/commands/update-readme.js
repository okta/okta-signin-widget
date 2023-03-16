const { resolve, join } = require('path');
const { execSync } = require('child_process');
const replace = require('replace-in-file');
const pkg = require('../../../package.json');

const ROOT_DIR = resolve(__dirname, '../../../');

function getPublishedWidgetVersion() {
  const stdout = execSync('yarn info @okta/okta-signin-widget --json');
  const meta = JSON.parse(stdout);
  const version = meta.data['dist-tags'].latest;
  console.log('Last published okta-signin-widget version: ', version);
  return version;
}

exports.command = 'update-readme';
exports.describe = 'Updates CDN URLs in the README file';
exports.builder = {
  ver: {
    description: 'Use specific widget version. default to latest publish version.',
  },
};
exports.handler = (argv) => {
  let version = pkg.version;
  if (argv.ver) {
    version = argv.ver;
  }
  if (argv.publishedVer) {
    version = getPublishedWidgetVersion();
  }
  const options = {
    files: [
      resolve(join(ROOT_DIR, 'README.md')),
      resolve(join(ROOT_DIR, 'polyfill', 'README.md')),
    ],
    from: /https:\/\/global\.oktacdn\.com\/okta-signin-widget\/\d+\.\d+\.\d+/g,
    to: `https://global.oktacdn.com/okta-signin-widget/${version}`
  };
  const results = replace.sync(options);
  console.log(results); // Results will say hasChanged: true|false. https://www.npmjs.com/package/replace-in-file
};
