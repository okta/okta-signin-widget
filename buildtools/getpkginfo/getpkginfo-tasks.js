/*
 * getpkginfo-tasks
 *
 * An API for interacting with package information for internal CI.
 *
 * For details check README.md
*/

/*jshint -W024, node: true */
/*global module, process */
'use strict';

var appRoot = require('app-root-path'),
    PACKAGE_JSON = require(appRoot + '/package.json'),
    git = require('git-rev-sync'),
    normalizeUrl = require('normalize-url'),
    moment = require('moment');

function fullversion() {
  var currentDate = moment().format('YYYYMMDDHHss'),
      version = PACKAGE_JSON.version + '-' + currentDate + '-' + git.short();

  return version;
}

function pkgsemver() {
  return PACKAGE_JSON.version;
}

function pkgname() {
  return PACKAGE_JSON.name;
}

function dataload() {
  var REGISTRY_URLBASE = (process.env.REGISTRY_URLBASE === undefined) ?
                         'https://artifacts.aue1d.saasure.com/artifactory' : process.env.REGISTRY_URLBASE;

  var dataload = normalizeUrl(
                   REGISTRY_URLBASE +
                   '/api/storage/npm-okta/' +
                   pkgname() +
                   '/-/' +
                   pkgname() +
                   '-' +
                   pkgsemver() +
                   '.tgz?properties=buildVersion=' +
                   fullversion()
                 );

  return dataload;
}

module.exports = {
  fullversion : fullversion,
  dataload : dataload,
  pkgsemver : pkgsemver,
  pkgname : pkgname
};
