/*global module, process */
var exec = require('child_process').exec;

module.exports = function (grunt) {

  // Creating our own simple scss-lint task because the original
  // grunt-scss-lint module does not have the option to output to checkstyle
  //
  // Note: This differs from the original - it uses the .scss-lint.yml file for
  // most configuration (which sass files to lint, which to exclude, etc)
  grunt.registerMultiTask(
    'scss-lint',
    'Runs scss lint, now with checkstyle reporting!',
    function () {
      var done = this.async(),
          options = this.options(),
          reporter = options.reporter,
          reporterOutput = options.reporterOutput,
          hasReporter = reporter && reporterOutput,
          force = options.force,
          args = ['scss-lint'],
          execOptions = {};

      if (hasReporter) {
        if (reporter !== 'checkstyle') {
          grunt.fail.fatal('If using a reporter, it must be "checkstyle"');
        }
        args.push('--require=scss_lint_reporter_checkstyle');
        args.push('--format=Checkstyle');
      }

      execOptions.maxBuffer = 'Infinity';
      execOptions.cwd = process.cwd();

      grunt.log.ok('Running: ' + args.join(' '));

      exec(args.join(' '), execOptions, function (err, stdOut) {
        if (hasReporter) {
          grunt.log.ok('Writing results to ' + reporterOutput);
          grunt.file.write(reporterOutput, stdOut);
        } else {
          grunt.log.write(stdOut);
        }

        if (err) {
          grunt.log.error('There were scss linting errors');
          if (!force) {
            done(false);
          }
        }

        done();
      });

    }
  );

};
