// bump-prerelease-version
//
// Bumps package.json to the next prerelease version:
// 1. Fetches current published versions
// 2. Finds latest published version in current prerelease line
// 3. Increments according to semver rules, and writes to package.json
//
// Prerelease lines are defined as:
// beta - commits to the master branch
// alpha - commits to topic branches
//
// Example master branch commit with package.json version of 1.1.0 and no
// previous beta versions:
// grunt bump-prerelease-version --branch=master
// > 1.1.1-beta.0
//
// If that version is published, the next time you run the command yields:
// > 1.1.1-beta.1
//
// Note: This is a task that should only run in Bacon - more info on how
// we version NPM modules:
// https://oktawiki.atlassian.net/wiki/x/sIDABQ

/*global module, process, JSON */
/* eslint quotes: 0 */

var semver = require('semver'),
    exec = require('child_process').execSync,
    _ = require('lodash'),
    PACKAGE_JSON = 'package.json';

module.exports = function (grunt) {

  // This script expects the branch name to be passed in:
  // grunt bump-prerelease-version --branch={{branch}}
  //
  // This logic exists here (vs doing it in a more idiomatic grunt way) to
  // make it easier to drop into other repos.
  function getPrereleaseName() {
    grunt.log.subhead('Determining prerelease name');
    var branch;
    process.argv.forEach(function (val) {
      if (!val || val.indexOf('--branch=') === -1) {
        return;
      }
      branch = val.substring(val.indexOf('=') + 1);
      grunt.log.ok('Found branch:', branch);
    });
    if (!branch) {
      grunt.fail.fatal('Must pass in the current branch name: --branch={{branch}}');
    }
    else if (branch === 'master') {
      grunt.log.ok('Prerelease name is "beta"');
      return 'beta';
    }
    else {
      grunt.log.ok('Prerelease name is "alpha"');
      return 'alpha';
    }
  }

  function getPublishedVersions(packageName) {
    grunt.log.subhead('Downloading all published versions');
    var cmd, result;
    cmd = 'npm view ' + packageName + ' versions --json';
    grunt.log.writeln('Running:', cmd);
    result = exec(cmd, { encoding: 'utf8' });
    grunt.log.ok(result);
    return JSON.parse(result);
  }

  function getPrereleaseLine(currentVersion, prereleaseName) {
    grunt.log.subhead('Finding prerelease line');
    var version, line;
    version = semver.inc(currentVersion, 'prerelease', prereleaseName);
    grunt.log.ok('Current stable version:', currentVersion);
    grunt.log.ok('Next prerelease version:', version);
    line = version.substring(0, version.lastIndexOf('.'));
    grunt.log.ok('Prerelease line:', line);
    return line;
  }

  function getLastPublishedVersionInLine(publishedVersions, prereleaseLine) {
    grunt.log.subhead('Finding last published version in line', prereleaseLine);
    var last = _.reduce(publishedVersions, function (memo, val) {
      if (val.indexOf(prereleaseLine) === -1) {
        return memo;
      }
      if (!memo) {
        return val;
      }
      return semver.lt(memo, val) ? val : memo;
    }, null);
    if (last) {
      grunt.log.ok('Found last published version:', last);
    } else {
      grunt.log.ok('No published versions in prerelease line');
    }
    return last;
  }

  function getNextVersion(lastPublishedVersion, currentVersion, prereleaseName) {
    grunt.log.subhead('Incrementing version');
    var oldVersion = lastPublishedVersion || currentVersion,
        nextVersion = semver.inc(oldVersion, 'prerelease', prereleaseName);
    grunt.log.ok('Next version is', nextVersion);
    return nextVersion;
  }

  function writeNextVersionToPackageJson(packageJson, nextVersion) {
    grunt.log.subhead('Writing next version to package.json');
    packageJson.version = nextVersion;
    grunt.file.write(PACKAGE_JSON, JSON.stringify(packageJson, null, 2) + "\n");
    grunt.log.ok('Wrote', nextVersion, 'to package.json');
  }

  grunt.registerTask(

    'bump-prerelease-version',

    'Finds the next prerelease version, and writes to package.json',

    function () {
      var prereleaseName = getPrereleaseName(),
          packageJson = grunt.file.readJSON(PACKAGE_JSON),
          lastPublishedVersionInLine,
          nextVersion;

      lastPublishedVersionInLine = getLastPublishedVersionInLine(
        getPublishedVersions(packageJson.name),
        getPrereleaseLine(packageJson.version, prereleaseName)
      );

      nextVersion = getNextVersion(
        lastPublishedVersionInLine,
        packageJson.version,
        prereleaseName
      );

      writeNextVersionToPackageJson(packageJson, nextVersion);

      grunt.log.writeln(
        "\n\n" +
        "WARNING: DO NOT COMMIT THIS NEW VERSION!\n\n" +
        "Dev versions are only published, but never committed to master. For\n" +
        "more information, read the 'Solution: One NPM registry.' section\n" +
        "on this page:\n\n" +
        "https://oktawiki.atlassian.net/wiki/x/sIDABQ\n"
      );

    }

  );

};
