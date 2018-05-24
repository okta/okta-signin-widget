define([
  'okta/underscore',
  './BaseSelectize'
], function (_, BaseSelectize) {

  var DELIMITER = '|';
  var DQUOTE = '"';
  var ESCAPED_DQUOTE = '\\"';

  return BaseSelectize.extend({

    apiURL: '/apps/find',
    nameAttribute: 'displayName',
    retrieveLimit: 20,

    parse: function (row) {
      var splitData = row.split('|');
      var compiledData = this._parseHelper(splitData);
      return _.object(['displayName', 'id', 'logo', 'name'], compiledData);
    },

    parseAll: function (data) {
      if (_.isArray(data)) {
        return _.flatten(_.map(data, this.parseAll));
      } else if (_.isString(data)) {
        return _.map(data.split(/[\n\r]/), this.parse);
      } else {
        return data;
      }
    },

    buildPrefetchQuery: function (ids) {
      return {
        ids: ids.join(','),
        limit: ids.length // limit parameter is mandatory
      };
    },

    /* _parseHelper
    *
    * Splits on the delimiter (|) and reassembles any fragments
    * that shouldn't have been split because they were encased by
    * double quotes. The encasing double quotes are only removed if
    * they contain at least one delimiter.
    *
    * Behaves exactly like a CSV, except with (|) instead of (,).
    * valid ex:
    * ABC|DEF             -> {ABC, DEF}
    * "AB|C"|DEF          -> {AB|C, DEF}
    * "A\"B|C"|"D|EF"     -> {AB"|C, D|EF}
    * "A\"B|\"C\""|"DEF"  -> {A"B|"C", "DEF"}
    * "\"A\"B|C\""|"D|EF" -> {"A"B|C", D|EF}
    */
    /* eslint max-statements: [2, 15] */
    _parseHelper: function (splitData) {
      var isNextFragment = false;
      var compiledData = [];
      _.each(splitData, function (data) {
        if (data === undefined) {
          return;
        }
        if (data.charAt(0) === DQUOTE) {
          if (this.__completesFragment(data)) {
            isNextFragment = false;
          } else {
            isNextFragment = true;
            data = data.substr(1) + DELIMITER; // drop start quote
          }
          compiledData.push(this.__replaceEscapedDQuotes(data));
        } else if (isNextFragment) {
          if (this.__completesFragment(data)) {
            isNextFragment = false;
            data = data.substr(0, data.length - 1); // drop end quote
          } else {
            isNextFragment = true;
            data = data + DELIMITER;
          }
          compiledData.push(compiledData.pop() + this.__replaceEscapedDQuotes(data));
        } else {
          compiledData.push(data);
        }
      }, this);
      return compiledData;
    },

    /*
    * takes in a string, returns true if it has a double quotation mark
    * on the rightmost side and not one which has been escaped
    */
    __completesFragment(data) {
      return data.substr(data.length - 2) !== ESCAPED_DQUOTE && data.charAt(data.length - 1) == DQUOTE;
    },

    /*
    * takes in a string, replaces all occurances of escaped double quotes
    * with their plaintext equivalent
    */
    __replaceEscapedDQuotes(data) {
      return data.replace(/\\"/g, DQUOTE);
    }

  });

});
