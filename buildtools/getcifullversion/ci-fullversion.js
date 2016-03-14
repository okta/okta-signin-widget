/*
 * ci-fullversion
 *
 * A task for printing to stdout the fullversion of the package including git commit id for reference.
 *
 * Internal full version is defined as:
 *   <semver>-<datetime>-<short git sha>
 * where datetime is equivalent to cmd output:
 *   date +"%Y%m%d%H%M"
 *
 * Example:
 *   node ci-fullversion.js
 *   > 1.1.1-201603151046-d117b77
*/

/*jshint -W024 */
/*global console*/

var appRoot = require('app-root-path'),
    PACKAGE_JSON = require(appRoot + '/package.json'),
    git = require('git-rev-sync'),
    moment = require('moment');

function getFullVersion() {
    var currentDate = moment().format('YYYYMMDDHHss');
    return PACKAGE_JSON.version + '-' + currentDate + '-' + git.short();
}

console.log(getFullVersion());

