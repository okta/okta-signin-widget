const { resolve, join } = require('path');
const shell = require('shelljs');
const replace = require('replace-in-file');

const ROOT_DIR = resolve(__dirname, '../../');

function getPublishedWidgetVersion () {
  const stdout = shell.exec('yarn info @okta/okta-signin-widget versions', { silent: true });
  const arrayStr = stdout.substring(stdout.indexOf('['), stdout.lastIndexOf(']') + 1).replace(/'/g, '"');
  const versions = JSON.parse(arrayStr);
  const version = versions[versions.length - 1];
  console.log('Last published okta-signin-widget version: ', version);
  return version;
}

exports.command = 'update-readme';
exports.describe = 'Updates CDN URLs in the README file';
exports.handler = () => {
  console.log('updating readme..');
  const version = getPublishedWidgetVersion();
  const options = {
    files: resolve(join(ROOT_DIR, 'README.md')),
    from: /https:\/\/global\.oktacdn\.com\/okta-signin-widget\/\d+\.\d+\.\d+/g,
    to: `https://global.oktacdn.com/okta-signin-widget/${version}`
  };
  const results = replace.sync(options);
  console.log('results', results);
};
