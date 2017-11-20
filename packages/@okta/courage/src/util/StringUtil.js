define([
  'okta/underscore',
  'okta/jquery',
  'shared/util/Bundles',
  'vendor/lib/json2'
],
function (_, $, Bundles) {

  /**
   * @class StringUtil
   * @private
   *
   * Handy utility functions to handle strings.
   */

  var entityMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': '\'',
    '&#039;': '\'',
    '&#x2F;': '/'
  };

  /* eslint max-len: 0*/
  var emailValidator = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(?!-)((\[?[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\]?)|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  var StringUtil = {
    sprintf: function () {
      /* eslint max-statements: [2, 11] */

      var args = Array.prototype.slice.apply(arguments),
          value = args.shift(),
          oldValue = value;

      function triggerError() {
        throw new Error('Mismatch number of variables: ' + arguments[0] + ', ' + JSON.stringify(args));
      }

      for (var i = 0, l = args.length; i < l; i++) {
        var entity = args[i];
        value = value.replace('{' + i + '}', entity);
        if (entity === undefined || entity === null || value === oldValue) {
          triggerError();
        }
        oldValue = value;
      }

      if (/\{[\d+]\}/.test(value)) {
        triggerError();
      }

      return value;
    },

    /**
     * Converts a URI encoded query string into a hash map
     *
     * ### Example:
     *
     *  ```javascript
     *  StringUtil.parseQuery('foo=bar&baz=qux') // {foo: 'bar', baz: 'qux'}
     *
     * ```
     * @static
     * @param  {String} query The query string
     * @return {Object} The map
     */
    parseQuery: function (query) {
      var params = {};
      var pairs = decodeURIComponent(query.replace(/\+/g, ' ')).split('&');
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var data = pair.split('=');
        params[data.shift()] = data.join('=');
      }
      return params;
    },

    encodeJSObject: function (jsObj) {
      return encodeURIComponent(JSON.stringify(jsObj));
    },

    decodeJSObject: function (jsObj) {
      try {
        return JSON.parse(decodeURIComponent(jsObj));
      } catch (e) {
        return null;
      }
    },

    unescapeHtml: function (string) {
      return String(string).replace(/&[\w\#\d]{2,};/g, function (s) {
        return entityMap[s] || s;
      });
    },

    /**
     * Translate a key to the localized value
     * @static
     * @param  {String} key The key
     * @param  {String} [bundle="messages"] The name of the i18n bundle. Defaults to the first bundle in the list.
     * @param  {Array} [params] A list of parameters to apply as tokens to the i18n value
     * @return {String} The localized value
     */
    localize: function (key, bundleName, params) {
      var bundle = bundleName ? Bundles[bundleName] : Bundles[_.keys(Bundles)[0]];

      if (!bundle) {
        return 'L10N_ERROR[' + (bundleName) + ']';
      }

      var value = bundle[key];

      try {
        params = params && params.slice ? params.slice(0) : [];
        params.unshift(value);
        value = StringUtil.sprintf.apply(null, params);
      }
      catch (e) {
        value = null;
      }

      return value || 'L10N_ERROR[' + key + ']';
    },

    /**
    * Convert a string to a float if valid, otherwise return the string.
    * Valid numbers may contain a negative sign and a decimal point.
    * @static
    * @param {String} string The string to convert to a number
    * @return {String|Number} Returns a number if the string can be casted, otherwise returns the original string
    */
    parseFloat: function (string) {
      var number = +string;
      return typeof string == 'string' && number === parseFloat(string) ? number : string;
    },

    /**
     * Convert a string to an integer if valid, otherwise return the string
     * @static
     * @param {String} string The string to convert to an integer
     * @return {String|integer} Returns an integer if the string can be casted, otherwise, returns the original string
     */
    parseInt: function (string) {
      var int = +string;
      return _.isString(string) && int === parseInt(string, 10) ? int : string;
    },

    /**
     * Convert a string to an object if valid, otherwise return the string
     * @static
     * @param {String} string The string to convert to an object
     * @return {String|object} Returns an object if the string can be casted, otherwise, returns the original string
     */
    parseObject: function (string) {
      if (!_.isString(string)) {
        return string;
      }

      try {
        var object = JSON.parse(string);
        return $.isPlainObject(object) ? object : string;
      } catch (e) {
        return string;
      }
    },

    /**
     * Returns a random string from [a-z][A-Z][0-9] of a given length
     * @static
     * @param {Number} length The length of the random string.
     * @return {String} Returns a random string from [a-z][A-Z][0-9] of a given length
     */
    randomString: function (length) {
      var characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

      if (length === undefined) {
        length = _.random(characters.length);
      } else if (length === 0) {
        return '';
      }

      var stringArray = [];
      while (length--) {
        stringArray.push(characters[_.random(characters.length - 1)]);
      }
      return stringArray.join('');
    },

    /**
     * Returns if a str ends with another string
     * @static
     * @param {String} str The string to search
     * @param {String} ends The string it should end with
     *
     * @return {Boolean} Returns if the str ends with ends
     */
    endsWith: function (str, ends) {
      str += '';
      ends += '';
      return str.length >= ends.length && str.substring(str.length - ends.length) === ends;
    },

    isEmail: function (str) {
      var target = $.trim(str);
      return !_.isEmpty(target) && emailValidator.test(target);
    }

  };

  return StringUtil;
});
