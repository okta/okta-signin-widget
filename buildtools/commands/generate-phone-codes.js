/* eslint no-eval: 0, max-len: 0, no-unused-vars: 0 */
const { resolve } = require('path');
const { writeFileSync } = require('fs');
const axios = require('axios');
/* eslint-disable-next-line @okta/okta/no-exclusive-language */
const METADATA_URI = 'https://raw.githubusercontent.com/googlei18n/libphonenumber/master/javascript/i18n/phonenumbers/metadata.js';
const ROOT_DIR = resolve(__dirname, '../../');
const OUTPUT_FILE = resolve(ROOT_DIR, 'src/util/countryCallingCodes.js');

exports.command = 'generate-phone-codes';
exports.describe = 'Downloads latest metadata from google libphonenumber and generates ' +
  'json we use to map region codes to country calling codes';
exports.handler = () => {
  console.log('Downloading latest metadata from google libphonenumber...');
  axios.get(METADATA_URI)
    .then(function({ data }) {
      const regionCodesToCallingCodeMap = {};
      const goog = { provide: function() { } };
      const i18n = { phonenumbers: { metadata: {} } };
      eval(data);
      Object.keys(i18n.phonenumbers.metadata.countryCodeToRegionCodeMap)
        .forEach(function(callingCode) {
          const regionCodes = i18n.phonenumbers.metadata.countryCodeToRegionCodeMap[callingCode];
          regionCodes.forEach(function(regionCode) {
            regionCodesToCallingCodeMap[regionCode] = Number(callingCode);
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
      regionCodesToCallingCodeMap['XK'] = 383;

      const contents = 'define(' + JSON.stringify(regionCodesToCallingCodeMap, null, 2) + ')';
      writeFileSync(OUTPUT_FILE, contents);

      console.log(`Wrote to ${OUTPUT_FILE}`);
    })
    .catch(function(error) {
      console.log(error);
    });

};
