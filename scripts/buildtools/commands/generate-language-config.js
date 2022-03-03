const { resolve } = require('path');
const { writeFileSync, mkdirpSync } = require('fs-extra');
const glob = require('glob');

const ROOT_DIR = resolve(__dirname, '../../../');
const packageJson = require(ROOT_DIR + '/package.json');
const languageGlob = ROOT_DIR + '/packages/@okta/i18n/src/json/login_*.json';
const OUTPUT_DIR = resolve(ROOT_DIR, 'src/config');
const OUTPUT_FILE = resolve(OUTPUT_DIR, 'config.json');
const DEFAULT_LANGUAGE = 'en';

exports.command = 'generate-language-config';
exports.describe = 'generate-language-config';
exports.handler = () => {
  mkdirpSync(OUTPUT_DIR);

  const config = {
    defaultLanguage: DEFAULT_LANGUAGE
  };

  // 1. Add current widget version number
  config.version = packageJson.version;
  console.log('config.version: ' + config.version);
  const versionParts = config.version.split('-');
  if (versionParts.length > 1) {
    console.log('version contains hash. language assets will be served based on version without hash');
    config.version = versionParts[0];
  }

  // 2. Add list of supported languages
  const re = new RegExp('/[a-z]+_([^.]+).json');
  const supportedLanguages = glob.sync(languageGlob).map((file) => {
    // Language codes use a hyphen instead of an underscore, i.e.
    // login_zh_TW.json -> zh-TW
    return re.exec(file)[1].replace('_', '-');
  });
  // Default language is special - it is just login.json, and is ignored in our glob.
  supportedLanguages.unshift(DEFAULT_LANGUAGE);
  config.supportedLanguages = supportedLanguages;
  console.log('config.supportedLanguages:');
  console.log(config.supportedLanguages.join(', '));

  writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2));
  console.log('Wrote config to ' + OUTPUT_FILE);
};
