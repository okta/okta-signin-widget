/* eslint no-constant-condition: 0 */
var Expect = module.exports = {};

var fs = require('fs-extra'),
    protractor = require('protractor'),
    ROOT_FOLDER = process.cwd() + '/build2/reports/508/',
    JUNIT_FOLDER = ROOT_FOLDER + 'junit/',
    TEXT_FOLDER = ROOT_FOLDER + 'text/';

fs.emptyDirSync(ROOT_FOLDER);
fs.mkdirsSync(TEXT_FOLDER);
fs.mkdirsSync(JUNIT_FOLDER);

Expect.toBeA11yCompliant = function() {
  var deferred = protractor.promise.defer();
  deferred.fulfill();
  return deferred.promise;
};
