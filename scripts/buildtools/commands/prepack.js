const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const chalk = require('chalk');

const BUILD_DIR = path.resolve(__dirname, '..', '..', '..', 'dist');

exports.command = 'build:prepack';
exports.describe = 'Prepares the dist directory for publishing on npm';

exports.handler = async () => {
  shell.echo(chalk.cyan('Prepacking...'));

  shell.cp('-Rf', ['package.json', 'LICENSE', 'THIRD-PARTY-NOTICES', '*.md'], `${BUILD_DIR}`);

  shell.echo('Modifying final package.json');
  let packageJSON = JSON.parse(fs.readFileSync(`${BUILD_DIR}/package.json`));
  packageJSON.private = false;
  packageJSON.files = ['./'];

  // Remove "dist/" from the entrypoint paths.
  ['main', 'module', 'browser', 'types'].forEach(function(key) {
    const value = packageJSON[key];
    if (!!value) {
      if (typeof value === 'object' && value !== null) {
        packageJSON[key] = Object.keys(value).reduce((acc, curr) => {
          const newKey = curr.replace('dist/', '');
          acc[newKey] = value[curr].replace('dist/', '');
          return acc;
        }, {});
      } 
      else {
        packageJSON[key] = packageJSON[key].replace('dist/', '');
      }
    }
  });

  fs.writeFileSync(`${BUILD_DIR}/package.json`, JSON.stringify(packageJSON, null, 4));

  shell.echo(chalk.green('Prepack complete'));
};
