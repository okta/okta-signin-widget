/* eslint no-constant-condition: 0 */
var Expect = module.exports = {};

var _ = require('lodash'),
    fs = require('fs-extra'),
    axe = require('axe-webdriverjs'),
    protractor = require('protractor'),
    textReporter = require('./text-reporter'),
    junitReporter = require('./junit-reporter'),

    ROOT_FOLDER = process.cwd() + '/build2/reports/508/',
    JUNIT_FOLDER = ROOT_FOLDER + 'junit/',
    TEXT_FOLDER = ROOT_FOLDER + 'text/';

function makeFileName(url) {
  return JUNIT_FOLDER + url.split('://').pop().replace(/[.:/]/g, '-') + _.uniqueId('_') + '.xml';
}

fs.emptyDirSync(ROOT_FOLDER);
fs.mkdirsSync(TEXT_FOLDER);
fs.mkdirsSync(JUNIT_FOLDER);

var textWriter = fs.createWriteStream(TEXT_FOLDER + 'report.txt');

Expect.toBeA11yCompliant = function() {
  var deferred = protractor.promise.defer();
  if ('{{{CHECK_A11Y}}}' === 'true') {
    axe(browser.driver)
      .analyze(function(result) {
        textReporter(result, -1, textWriter);
        junitReporter(result, makeFileName(result.url));
        deferred.fulfill();
      });
  } else {
    deferred.fulfill();
  }
  return deferred.promise;
};
