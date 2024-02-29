const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const shell = require('shelljs');
const chalk = require('chalk');

const BUILD_DIR = path.resolve(__dirname, '..', '..', '..', 'dist');
const JS_DIR = path.join(BUILD_DIR, 'dist/js');
const CSS_DIR = path.join(BUILD_DIR, 'dist/css');

function generateSris () {
  const jsFiles = fs.readdirSync(JS_DIR);
  const cssFiles = fs.readdirSync(CSS_DIR);
  return [
    ...jsFiles.map(file => path.join(JS_DIR, file)), 
    ...cssFiles.map(file => path.join(CSS_DIR, file))
  ]
  .filter(path => !path.endsWith('.map'))
  .reduce((acc, path) => {
    // get filename (key)
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    const content = fs.readFileSync(path, { encoding: 'utf8' });
    // generate sri (value)
    const hash = crypto.createHash('sha384').update(content, 'utf8');
    const hashBase64 = hash.digest('base64');
    const sri = 'sha384-' + hashBase64;
    // add sri in map
    return { ...acc, [filename]: sri }
  }, {});
}

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
  const sri = generateSris();
  packageJSON.sri = sri;

  fs.writeFileSync(`${BUILD_DIR}/package.json`, JSON.stringify(packageJSON, null, 4));

  shell.echo(chalk.green('Prepack complete'));
};
