/* eslint no-console: 0 */
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const ROOT_DIR = path.resolve(__dirname, '..');

var DEFAULTS = require('./env.defaults');
var VALUES = {};

function config() {

  // Read environment variables from "testenv". Override environment vars if they are already set.
  const TESTENV = path.resolve(ROOT_DIR, 'testenv');
  if (fs.existsSync(TESTENV)) {
    const envConfig = dotenv.parse(fs.readFileSync(TESTENV));
    Object.keys(envConfig).forEach((k) => {
      process.env[k] = envConfig[k];
    });
  }

  // Set defaults, populate VALUES
  Object.keys(DEFAULTS).forEach(function(key) {
    if (!process.env[key]) {
      // Allow use of default value
      process.env[key] = DEFAULTS[key];
    }
    VALUES[key] = process.env[key];
  });
}

function checkValues() {
  Object.keys(DEFAULTS).forEach(function(key) {
    if (!VALUES[key]) {
      console.error('ERROR: no value set for environment variable: ' + key);
    }
  });
}

function printValues() {
  Object.keys(VALUES).forEach(function(key) {
    console.log(key + ' = ', VALUES[key]);
  });
}

function getValues() {
  return VALUES;
}

module.exports = {
  config: config,
  checkValues: checkValues,
  printValues: printValues,
  getValues: getValues
};
