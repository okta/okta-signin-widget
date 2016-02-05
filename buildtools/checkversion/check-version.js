/*global module */
var semver = require('semver'),
    exec = require('child_process').exec;

var failMessage = 'Package version must be > latest package version';

module.exports = function (grunt) {

  function writeCheckStyle(file, hasError) {
    var checkStyle = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<checkstyle version="1.5.6">'
    ];
    if (hasError) {
      checkStyle.push(
        '<file name="package.json">',
        '<error severity="warning" message="' + failMessage + '" />',
        '</file>'
      );
    }
    checkStyle.push('</checkstyle>');
    grunt.log.ok('Writing results to', file);
    grunt.file.write(file, checkStyle.join(''));
  }

  grunt.registerTask(

    'check-version',

    'Fails task if package version is <= latest published module',

    function () {
      var done = this.async(),
          options = this.options(),
          reporter = options.reporter,
          reporterOutput = options.reporterOutput,
          hasReporter = reporter && reporterOutput,
          force = options.force,
          currentPackage = grunt.config('pkg'),
          cmd = 'npm view ' + currentPackage.name + ' version';

      grunt.log.ok('Running', cmd);

      exec(cmd, {}, function (err, latestPublishedVersion) {

        if (err) {
          grunt.fail.fatal(err);
        }

        grunt.log.ok('Package version: ', currentPackage.version);
        grunt.log.ok('Latest published version: ', latestPublishedVersion);

        var isOkay = semver.gt(currentPackage.version, latestPublishedVersion);

        if (hasReporter) {
          writeCheckStyle(reporterOutput, !isOkay);
        }

        if (isOkay) {
          grunt.log.ok('Package version is > latest package version');
          done();
        }
        else if (force) {
          grunt.log.error(failMessage);
          done();
        }
        else {
          grunt.fail.fatal(failMessage);
        }

      });

    }

  );

};
