const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const chalk = require('chalk');

const BUILD_DIR = path.resolve(__dirname, '..', '..', '..', 'dist');

exports.command = 'build:prepack';
exports.describe = 'Prepares the dist directory for publishing on npm';

exports.handler = async () => {
  shell.echo(chalk.cyan('Prepacking...'));

  shell.cp('-Rf', [
    'package.json',
    'LICENSE',
    'THIRD-PARTY-NOTICES',
    '*.md',
    'types',
    'src'
  ], `${BUILD_DIR}`);

  shell.echo('Modifying final package.json');
  let packageJSON = JSON.parse(fs.readFileSync(`${BUILD_DIR}/package.json`));
  packageJSON.private = false;

  function fixExportPath(val) {
    if (typeof val === 'string') {
      return val.replace('./target', './dist');
    }
  
    if (typeof val === 'object') {
      return Object.entries(val).reduce((acc, [key, value]) => {
        acc[key] = fixExportPath(value);
        return acc;
      }, {});
    }
  
    throw new Error('Value type not supported');
  }
  
  // Fix export paths.
  ['main', 'module', 'types', 'exports'].forEach(function(key) {
    packageJSON[key] = fixExportPath(packageJSON[key]);
  });

  fs.writeFileSync(`${BUILD_DIR}/package.json`, JSON.stringify(packageJSON, null, 4));

  shell.echo(chalk.green('Prepack complete'));
};
