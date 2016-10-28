var Expect = module.exports = {};

var _ = require('lodash'),
    grunt = require('grunt'),
    axe = require('axe-webdriverjs'),
    protractor = require('protractor');

Expect.toBeA11yCompliant = function () {
  var deferred = protractor.promise.defer();
  if ('{{{CHECK_A11Y}}}' === 'true') {
    axe(browser.driver)
    .analyze(function (result) {
      var violations = result.violations,
          violationsCount = violations.length;
      if (violationsCount > 0) {
        grunt.log.subhead('  Accessibility violations');

        _.each(violations, function (violation) {
          var severity  = violation.impact,
              help      = violation.help;
          grunt.log.writeln();
          grunt.log.writeln('    ' + severity + ': ' + help);
          _.each(violation.nodes, function (node) {
            var htmlsnippet = node.html;
            grunt.log.writeln('    - ' + htmlsnippet);
          });
        });
      } else {
        grunt.log.subhead('  There are no accessibility violations');
      }

      expect(violations).toBeNull();
      deferred.fulfill();
    });
  } else {
    deferred.fulfill();
  }
  return deferred.promise;
};
