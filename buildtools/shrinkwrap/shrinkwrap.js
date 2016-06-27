// shrinkwrap-remove-resolved
//
// Runs "npm shrinkwrap --dev", then removes resolved properties from the
// generated shrinkwrap file.
//
// This is necessary because shrinkwrap will write our internal registry urls
// to the npm-shrinkwrap.json file, which will cause builds outside of our vpn
// to fail. By removing the resolved fields, we only enforce module and
// version numbers (but not the registry a specific package was downloaded from)
//
// See more discussion here:
// https://github.com/npm/npm/issues/6444
// https://github.com/npm/npm/issues/3581#issuecomment-58516251
// https://github.com/npm/npm/issues/6445

/*global module, JSON */
/*jshint quotmark:false */

var _ = require('lodash'),
    exec = require('child_process').execSync,
    SHRINKWRAP_FILE = 'npm-shrinkwrap.json';

module.exports = function (grunt) {

  function removeResolvedAndFrom(json) {
    _.each(json.dependencies, function (dependency) {
      if (dependency.dependencies) {
        removeResolvedAndFrom(dependency);
      }
      delete dependency.resolved;
      delete dependency.from;
    });
  }

  grunt.registerTask(
    'shrinkwrap-remove-resolved-and-from',
    'Runs shrinkwrap and removes resolved and from properties',
    function () {
      var json;

      grunt.log.ok('Running npm shrinkwrap');
      exec('npm shrinkwrap --dev');

      grunt.log.ok('Removing resolved and from fields');
      json = grunt.file.readJSON(SHRINKWRAP_FILE);
      removeResolvedAndFrom(json);

      grunt.log.ok('Writing back to shrinkwrap');
      grunt.file.write(SHRINKWRAP_FILE, JSON.stringify(json, null, 2) + "\n");
    }
  );

};
