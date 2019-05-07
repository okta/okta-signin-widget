/* eslint no-console: 0 */
const path = require('path');
var DEFAULTS = require('./env.defaults');
var VALUES = {};

function config () {
  require('dotenv').config({
    path: path.resolve(__dirname, '../..', '.env')
  });


  Object.keys(DEFAULTS).forEach(function (key) {
    if (!process.env[key]) {
      // Allow use of default value
      process.env[key] = DEFAULTS[key];
    }
    VALUES[key] = process.env[key];

    if (!VALUES[key]) {
      console.error('ERROR: no value set for environment variable: ' + key);
    }

  });
}

function printValues () {
  Object.keys(VALUES).forEach(function (key) {
    console.log(key + ' = ', VALUES[key]);
  });
}

function getValues () {
  return VALUES;
}

module.exports = {
  config: config,
  printValues: printValues,
  getValues: getValues
};
