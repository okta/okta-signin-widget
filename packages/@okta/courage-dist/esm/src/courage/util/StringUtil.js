import oktaJQueryStatic from './jquery-wrapper.js';
import oktaUnderscore from './underscore-wrapper.js';
import Bundles from 'okta-i18n-bundles';

const entityMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': '\'',
  '&#039;': '\'',
  '&#x2F;': '/'
};
const emailValidator = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(?!-)((\[?[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\]?)|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
/**
* Converts the locale code identifier from "${languageCode}-${countryCode}" to "${languageCode}_${countryCode}"
* Follows the ISO-639-1 language code and 2-letter ISO-3166-1-alpha-2 country code structure.
* @param {String} locale code identifier
* @return {String} converted locale code identifier
*/

const parseLocale = locale => {
  if (/-/.test(locale)) {
    const parts = locale.split('-');
    parts[1] = parts[1].toUpperCase();
    return parts.join('_');
  }

  return locale;
};
/* eslint max-len: 0*/

/**
 * Returns the language bundle based on the current locale.
 * - If a locale is not provided, default to English ('en')
 * - Legacy Support: If the named language bundle does not exist, fall back to the default named bundle.
 *
 * @param {*} bundleName
 */


function getBundle(bundleName) {
  if (!bundleName) {
    return Bundles[oktaUnderscore.keys(Bundles)[0]];
  }

  const locale = parseLocale(window && window.okta && window.okta.locale) || 'en';
  return Bundles[`${bundleName}_${locale}`] || Bundles[bundleName];
}
/**
 *
 * CustomEvent polyfill for IE
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#polyfill
 */


function IECustomEvent(event, params) {
  params = params || {
    bubbles: false,
    cancelable: false,
    detail: null
  };
  var evt = document.createEvent('CustomEvent');
  evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
  return evt;
}
/**
 * Call the window.okta.emitL10nError function if it is defined
 * @param {String} key The i18n key
 * @param {String} bundleName The i18n bundle name
 * @param {String} reason Could be 'bundle' (Bundle not found), 'key' (Key not found) or 'parameters' (Parameters mismatch).
 */


function emitL10nError(key, bundleName, reason) {
  // CustomEvent polyfill for IE
  if (!window.CustomEvent) {
    window.CustomEvent = IECustomEvent;
  } // dispatchEvent for sentry


  if (typeof window.CustomEvent === 'function') {
    const event = new CustomEvent('okta-i18n-error', {
      detail: {
        type: 'l10n-error',
        key: key,
        bundleName: bundleName,
        reason: reason
      }
    });
    document.dispatchEvent(event);
  }
}

const StringUtil =
/** @lends module:Okta.internal.util.StringUtil */
{
  /** @static */
  sprintf: function () {
    const args = Array.prototype.slice.apply(arguments);
    let value = args.shift();
    let oldValue = value;
    /* eslint max-statements: [2, 15] */

    function triggerError() {
      throw new Error('Mismatch number of variables: ' + arguments[0] + ', ' + JSON.stringify(args));
    }

    for (var i = 0, l = args.length; i < l; i++) {
      const entity = args[i];
      const regex = new RegExp('\\{' + i + '\\}', 'g');
      value = value.replace(regex, entity);

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
   * @param  {String} query The query string
   * @return {Object} The map
   * @static
   * @example
   * StringUtil.parseQuery('foo=bar&baz=qux') // {foo: 'bar', baz: 'qux'}
   */
  parseQuery: function (query) {
    const params = {};
    const pairs = decodeURIComponent(query.replace(/\+/g, ' ')).split('&');

    for (var i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const data = pair.split('=');
      params[data.shift()] = data.join('=');
    }

    return params;
  },

  /** @static */
  encodeJSObject: function (jsObj) {
    return encodeURIComponent(JSON.stringify(jsObj));
  },

  /** @static */
  decodeJSObject: function (jsObj) {
    try {
      return JSON.parse(decodeURIComponent(jsObj));
    } catch (e) {
      return null;
    }
  },

  /** @static */
  unescapeHtml: function (string) {
    return String(string).replace(/&[\w#\d]{2,};/g, function (s) {
      return entityMap[s] || s;
    });
  },

  /**
   * Get the original i18n template directly without string format with parameters
   * @param {String} key The key
   * @param {String} bundle="messages"] The name of the i18n bundle. Defaults to the first bundle in the list.
   */
  getTemplate: function (key, bundleName) {
    const bundle = getBundle(bundleName);

    if (!bundle) {
      emitL10nError(key, bundleName, 'bundle');
      return 'L10N_ERROR[' + bundleName + ']';
    }

    if (bundle[key]) {
      return bundle[key];
    } else {
      emitL10nError(key, bundleName, 'key');
      return 'L10N_ERROR[' + key + ']';
    }
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
    const bundle = getBundle(bundleName);
    /* eslint complexity: [2, 6] */

    if (!bundle) {
      emitL10nError(key, bundleName, 'bundle');
      return 'L10N_ERROR[' + bundleName + ']';
    }

    let value = bundle[key];

    try {
      params = params && params.slice ? params.slice(0) : [];
      params.unshift(value);
      value = StringUtil.sprintf.apply(null, params);

      if (value) {
        return value;
      } else {
        emitL10nError(key, bundleName, 'key');
        return 'L10N_ERROR[' + key + ']';
      }
    } catch (e) {
      emitL10nError(key, bundleName, 'parameters');
      return 'L10N_ERROR[' + key + ']';
    }
  },

  /**
   * Convert a string to a float if valid, otherwise return the string.
   * Valid numbers may contain a negative sign and a decimal point.
   * @static
   * @param {String} string The string to convert to a number
   * @return {String|Number} Returns a number if the string can be casted, otherwise returns the original string
   */
  parseFloat: function (string) {
    const number = +string;
    return typeof string === 'string' && number === parseFloat(string) ? number : string;
  },

  /**
   * Convert a string to an integer if valid, otherwise return the string
   * @static
   * @param {String} string The string to convert to an integer
   * @return {String|integer} Returns an integer if the string can be casted, otherwise, returns the original string
   */
  parseInt: function (string) {
    const int = +string;
    return oktaUnderscore.isString(string) && int === parseInt(string, 10) ? int : string;
  },

  /**
   * Convert a string to an object if valid, otherwise return the string
   * @static
   * @param {String} string The string to convert to an object
   * @return {String|object} Returns an object if the string can be casted, otherwise, returns the original string
   */
  parseObject: function (string) {
    if (!oktaUnderscore.isString(string)) {
      return string;
    }

    try {
      const object = JSON.parse(string);
      return oktaJQueryStatic.isPlainObject(object) ? object : string;
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
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

    if (length === undefined) {
      length = oktaUnderscore.random(characters.length);
    } else if (length === 0) {
      return '';
    }

    const stringArray = [];

    while (length--) {
      stringArray.push(characters[oktaUnderscore.random(characters.length - 1)]);
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

  /** @static */
  isEmail: function (str) {
    const target = oktaJQueryStatic.trim(str);
    return !oktaUnderscore.isEmpty(target) && emailValidator.test(target);
  }
};

export { StringUtil as default };
