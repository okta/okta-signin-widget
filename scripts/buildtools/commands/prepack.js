const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const chalk = require('chalk');

const BUILD_DIR = path.resolve(__dirname, '..', '..', '..', 'dist');
const WIDGET_MAIN_ENTRY = './dist/js/okta-sign-in.entry.js';
const WIDGET_MODULE_ENTRY = './dist/esm/src/index.js';

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
  packageJSON.main = WIDGET_MAIN_ENTRY;
  packageJSON.module = WIDGET_MODULE_ENTRY;
  fs.writeFileSync(`${BUILD_DIR}/package.json`, JSON.stringify(packageJSON, null, 4));

  shell.echo(chalk.green('Prepack complete'));
};
