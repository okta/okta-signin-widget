/*
 * getpkginfo
 *
 * Provides to stdout the required package information for external consumption.
 *
 * For details check README.md
*/

/*jshint node: true */
/*global console, process */
'use strict';

var program = require('commander'),
    getpkg = require('./getpkginfo-tasks');

program
  .option('-t, --target <target>', 'Name of getpkg task to run')
  .parse(process.argv);

switch(program.target) {
  case 'fullversion':
    console.log(getpkg.fullversion());
    break;
  case 'dataload':
    console.log(getpkg.dataload());
    break;
  case 'pkgsemver':
    console.log(getpkg.pkgsemver());
    break;
  case 'pkgname':
    console.log(getpkg.pkgname());
    break;
  default:
    console.error('Target is empty or not supported');
    process.exit(1);
}
