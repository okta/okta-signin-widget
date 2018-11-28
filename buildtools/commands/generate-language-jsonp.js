const { basename } = require('path');
const { resolve } = require('path');
const { writeFileSync, readFileSync, mkdirpSync } = require('fs-extra');

const glob = require('glob');

const ROOT_DIR = resolve(__dirname, '../../');
const languageGlob = ROOT_DIR + '/target/labels/json/{login,country}*.json';
const OUTPUT_DIR = ROOT_DIR + '/target/labels/jsonp';

// Name will be the base property file, i.e. "login" or "country"
function wrapperName (fileName) {
  const base = basename(fileName, '.json');
  return base.split('_')[0];
}

// Wraps json in this format:
// jsonp_{{name}}(contents);
//
// For example:
// jsonp_login({ key: 'val' });
function wrap (name, contents) {
  return 'jsonp_' + name + '(' + contents + ');';
}

exports.command = 'generate-language-jsonp';
exports.describe = 'generate-language-jsonp';
exports.handler = () => {

  mkdirpSync(OUTPUT_DIR);

  glob.sync(languageGlob).forEach(function (fileSrc) {
    const canonicalName = wrapperName(fileSrc);
    const contents = readFileSync(fileSrc);
    const dest = fileSrc.replace(/json/g, 'jsonp');

    console.log('Writing jsonp to ' + dest + ' with wrapper ' + canonicalName);
    writeFileSync(dest, wrap(canonicalName, contents));
  });

};
