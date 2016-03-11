/*global module, JSON */
/* eslint max-len: [2, 150], no-unused-vars: 0 */
var rp = require('request-promise');
var _ = require('lodash');

var METADATA_URI = 'https://raw.githubusercontent.com/googlei18n/libphonenumber/master/javascript/i18n/phonenumbers/metadata.js';

module.exports = function (grunt) {

  grunt.registerTask(
    'generate-latest-phone-codes',
    'Downloads latest metadata from google libphonenumber and generates ' +
    'json we use to map region codes to country calling codes',
    function () {
      var done = this.async();
      var fileToWrite = grunt.config()['generate-latest-phone-codes'].options.out;
      grunt.log.writeln('Downloading latest metadata from google libphonenumber...');
      rp(METADATA_URI)
      .then(function (body) {
        grunt.log.ok('Downloaded');
        var regionCodesToCallingCodeMap = {};
        var goog = { provide: function () {} };
        var i18n = { phonenumbers: { metadata: {} }};
        eval(body);
        _.each(i18n.phonenumbers.metadata.countryCodeToRegionCodeMap, function (regionCodes, callingCode) {
          _.each(regionCodes, function (regionCode) {
            regionCodesToCallingCodeMap[regionCode] = callingCode;
          });
        });

        // Add in extra codes that are not in the metadata but appear in
        // our country.properties list. Sourced from:
        // https://en.wikipedia.org/wiki/List_of_country_calling_codes
        // http://www.auslandsvorwahlen.net/en/
        // http://www.listofcountriesoftheworld.com/country-dialling-codes.html
        // Note: TF, BV, and HM do not have phone codes
        regionCodesToCallingCodeMap['GS'] = 500;
        regionCodesToCallingCodeMap['PN'] = 64;
        regionCodesToCallingCodeMap['AQ'] = 672;
        regionCodesToCallingCodeMap['UM'] = 1;
        regionCodesToCallingCodeMap['AN'] = 599;

        var contents = 'define(' + JSON.stringify(regionCodesToCallingCodeMap) + ')';
        grunt.file.write(fileToWrite, contents);
        grunt.log.ok('Wrote to: ' + fileToWrite);
      })
      .fail(grunt.log.error)
      .fin(done);
    }
  );

};
