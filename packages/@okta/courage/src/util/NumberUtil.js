define([
  'okta/underscore'
], function (_) {

  var regNumberToLocaleString = new RegExp('(\\d)(?=(\\d{3})+(?!\\d))', 'g');

  return {
    /**
     * Format number by inserting thousands separator.
     *
     * @param number {number}
     * @param delimitersThousands {string} [Optional] default to ','
     * @return an formatted string with thousands separator insereted.
     *         '0' when input is not an number.
     */
    numberToString: function (number, delimitersThousands) {
      var delimiter = delimitersThousands || ',';

      return _.isNumber(number) ? String(number).replace(regNumberToLocaleString, '$1' + delimiter) : '0';
    }
  };
});
