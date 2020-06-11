/*! THIS FILE IS GENERATED FROM PACKAGE @okta/courage@4.6.0-beta.3298.g75d547c */
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 33);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_handlebars__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_underscore__ = __webpack_require__(35);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_underscore___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_underscore__);
/* eslint @okta/okta/enforce-requirejs-names: 0, @okta/okta/no-specific-methods: 0, @okta/okta/no-specific-modules: 0 */



const _ = __WEBPACK_IMPORTED_MODULE_1_underscore___default.a.noConflict();

_.mixin({
  resultCtx: function (object, property, context, defaultValue) {
    let value = _.isObject(object) ? object[property] : void 0;

    if (_.isFunction(value)) {
      value = value.call(context || object);
    }
    if (value) {
      return value;
    } else {
      return !_.isUndefined(defaultValue) ? defaultValue : value;
    }
  },

  isInteger: function (x) {
    return _.isNumber(x) && x % 1 === 0;
  },

  template: function (source, data) {
    const template = __WEBPACK_IMPORTED_MODULE_0_handlebars___default.a.compile(source);

    return data
      ? template(data)
      : function (data) {
        return template(data);
      };
  }
});

/* harmony default export */ __webpack_exports__["default"] = (_);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_backbone__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_backbone___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_backbone__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__framework_View__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__util_TemplateUtil__ = __webpack_require__(4);





const eventBus = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].clone(__WEBPACK_IMPORTED_MODULE_0_backbone___default.a.Events);

// add `broadcast` and `listen` functionality to all views
// We use one event emitter per all views
// This means we need to be very careful with event names

const proto = {
  constructor: function () {
    __WEBPACK_IMPORTED_MODULE_2__framework_View__["a" /* default */].apply(this, arguments);
    this.module && this.$el.attr('data-view', this.module.id);
  },

  /**
   * @deprecated Use {@link #removeChildren}
   */
  empty: function () {
    return this.removeChildren();
  },

  compileTemplate: __WEBPACK_IMPORTED_MODULE_3__util_TemplateUtil__["default"].tpl,

  /**
   *
   * Broadcasts a global event that all views and controllers can subscribe to
   * for framework use only - prefer using a shared model
   *
   * @param {String} eventName A unique identifier for the event
   * @param {...String} param Parameter to pass with the event (can pass more than one parameter)
   * @deprecated For internal use only
   * @private
   */
  broadcast: function () {
    eventBus.trigger.apply(eventBus, arguments);
    return this;
  },

  /**
   * Subscribe to broadcast events
   * for framework use only - prefer using a shared model
   *
   * @param {String} eventName The event identifier to subscribe
   * @param {Function} fn The callback function to invoke
   * @deprecated For internal use only
   * @private
   */
  listen: function (name, fn) {
    eventBus.off(name, fn);
    this.listenTo(eventBus, name, fn);
    return this;
  },

  /**
   * Shows a notification box
   * @param {String} level success / warning / error
   * @param {String} message The message to display
   * @param {Object} [options]
   * @param {Number} [options.width] Set a custom width
   * @param {String} [options.title] Set a custom title
   * @param {Boolean} [options.hide=true] Do we want to auto-hide this notification?
   * @param {Boolean} [options.dismissable] Show a dismiss button
   * @example
   * view.notify('success', 'Group created successfully');
   */
  notify: function (level, message, options) {
    this.broadcast('notification', __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].defaults({ message: message, level: level }, options));
    return this;
  },

  /**
   * Shows a confirmation dialog
   *
   * The main difference between this and the native javascript `confirm` method
   * Is this method is non blocking (note the callback pattern).
   *
   * The callback function will run in the context (`this`) of the invoking view.
   *
   * @param {String} [title] The title of the confirmation dialog
   * @param {String} [message] The message of the confirmation dialog
   * @param {Function} [okfn] The callback to run when the user hits "OK" (runs in the context of the invoking view)
   * @param {Function} [cancelfn] The callback to run when the user hits "Cancel"
   *        (runs in the context of the invoking view)
   * @example
   * view.confirm('Delete Group', 'Are you sure you want to delete the selected group?', function () {
   *   model.destroy();
   * });
   *
   * // title will be auto-set to "Okta"
   * view.confirm('Are you sure you want to delete the selected group?', function () {
   *   model.destroy();
   * });
   *
   * view.confirm({
   *   title: 'Delete Group', //=> Modal title
   *   subtitle: 'Are you sure you want to delete the selected group?', //=> Modal subtitle
   *   content: '<h3 color="red">THIS WILL DELETE THE GROUP!</h3>', //=> A template or a view to add to the modal
   *   save: 'Delete Group', //=> Button label
   *   ok: _.bind(model.save, model) // Callback function on hitting "ok" button
   *   cancel: 'Cancel', //=> Button label
   *   cancelFn: _.bind(model.destroy, model) // Callback function on hitting "cancel" button
   * });
   */
  confirm: function (title, message, okfn, cancelfn) {
    let options;
    /* eslint max-statements: [2, 12] */

    if (typeof title === 'object') {
      options = title;
    } else {
      if (arguments.length === 2 && __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(message)) {
        options = {
          title: 'Okta',
          subtitle: title,
          ok: message
        };
      } else {
        options = {
          title: title,
          subtitle: message,
          ok: okfn,
          cancelFn: cancelfn
        };
      }
    }
    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(options.ok)) {
      options.ok = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].bind(options.ok, this);
    }
    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(options.cancelFn)) {
      options.cancelFn = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].bind(options.cancelFn, this);
    }
    this.broadcast('confirmation', options);
    return this;
  },

  /**
   * Shows an alert box
   *
   * The main difference between this and the native javascript `alert` method
   * Is this method is non blocking.
   *
   * @param {String} message The message
   * @example
   * view.alert('Mission complete');
   */
  alert: function (params) {
    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isString(params)) {
      params = {
        subtitle: params
      };
    }
    this.confirm(
      __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].extend({}, params, {
        noCancelButton: true
      })
    );
    return this;
  }
};

/**
 * See {@link src/framework/View} for more detail and examples from the base class.
 * @class module:Okta.View
 * @extends src/framework/View
 */

/** @lends module:Okta.View.prototype */

/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_2__framework_View__["a" /* default */].extend(
  proto,
  /** @lends View.prototype */ {
    /** @method */
    decorate: function (TargetView) {
      const BaseViewView = TargetView.extend({});

      __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].defaults(BaseViewView.prototype, proto);
      return BaseViewView;
    }
  }
));


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* eslint-disable @okta/okta/enforce-requirejs-names, @okta/okta/no-specific-modules */


__WEBPACK_IMPORTED_MODULE_0_jquery___default.a.ajaxSetup({
  beforeSend: function (xhr) {
    xhr.setRequestHeader('X-Okta-XsrfToken', __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#_xsrfToken').text());
  },
  converters: {
    'text secureJSON': function (str) {
      if (str.substring(0, 11) === 'while(1){};') {
        str = str.substring(11);
      }
      return JSON.parse(str);
    }
  }
});

// Selenium Hook
// Widget such as autocomplete and autosuggest needs to be triggered from the running version of jQuery.
// We have 2 versions of jQuery running in parallel and they don't share the same events bus
window.jQueryCourage = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a;
/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0_jquery___default.a);


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__jquery_wrapper__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_okta_i18n_bundles__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_okta_i18n_bundles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_okta_i18n_bundles__);




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

/* eslint max-len: 0*/

const StringUtil = /** @lends module:Okta.internal.util.StringUtil */ {
  /** @static */
  sprintf: function () {
    const args = Array.prototype.slice.apply(arguments);
    let value = args.shift();
    let oldValue = value;
    /* eslint max-statements: [2, 13] */

    function triggerError() {
      throw new Error('Mismatch number of variables: ' + arguments[0] + ', ' + JSON.stringify(args));
    }

    for (var i = 0, l = args.length; i < l; i++) {
      const entity = args[i];

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
    const bundle = bundleName ? __WEBPACK_IMPORTED_MODULE_2_okta_i18n_bundles___default.a[bundleName] : __WEBPACK_IMPORTED_MODULE_2_okta_i18n_bundles___default.a[__WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].keys(__WEBPACK_IMPORTED_MODULE_2_okta_i18n_bundles___default.a)[0]];
    if (!bundle) {
      return 'L10N_ERROR[' + bundleName + ']';
    }
    return bundle[key] || 'L10N_ERROR[' + key + ']';
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
    const bundle = bundleName ? __WEBPACK_IMPORTED_MODULE_2_okta_i18n_bundles___default.a[bundleName] : __WEBPACK_IMPORTED_MODULE_2_okta_i18n_bundles___default.a[__WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].keys(__WEBPACK_IMPORTED_MODULE_2_okta_i18n_bundles___default.a)[0]];
    /* eslint complexity: [2, 7] */

    if (!bundle) {
      return 'L10N_ERROR[' + bundleName + ']';
    }

    let value = bundle[key];

    try {
      params = params && params.slice ? params.slice(0) : [];
      params.unshift(value);
      value = StringUtil.sprintf.apply(null, params);
    } catch (e) {
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

    return __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].isString(string) && int === parseInt(string, 10) ? int : string;
  },

  /**
   * Convert a string to an object if valid, otherwise return the string
   * @static
   * @param {String} string The string to convert to an object
   * @return {String|object} Returns an object if the string can be casted, otherwise, returns the original string
   */
  parseObject: function (string) {
    if (!__WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].isString(string)) {
      return string;
    }

    try {
      const object = JSON.parse(string);

      return __WEBPACK_IMPORTED_MODULE_0__jquery_wrapper__["default"].isPlainObject(object) ? object : string;
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
      length = __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].random(characters.length);
    } else if (length === 0) {
      return '';
    }

    const stringArray = [];

    while (length--) {
      stringArray.push(characters[__WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].random(characters.length - 1)]);
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
    const target = __WEBPACK_IMPORTED_MODULE_0__jquery_wrapper__["default"].trim(str);

    return !__WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].isEmpty(target) && emailValidator.test(target);
  }
};

/**
 * Handy utility functions to handle strings.
 *
 * @class module:Okta.internal.util.StringUtil
 * @hideconstructor
 */

/* harmony default export */ __webpack_exports__["default"] = (StringUtil);


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_handlebars__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__ = __webpack_require__(0);
/* eslint @okta/okta/no-specific-methods: 0 */



/**
 * @class module:Okta.internal.util.TemplateUtil
 * @hideconstructor
 */
/* harmony default export */ __webpack_exports__["default"] = ({
  /**
   * Compiles a Handlebars template
   * @static
   * @method
   */
  tpl: __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].memoize(function (tpl) {
    /* eslint okta/no-specific-methods: 0 */
    return __WEBPACK_IMPORTED_MODULE_0_handlebars___default.a.compile(tpl);
  })
});


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("handlebars");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("backbone");

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
function log(level, args) {
  if (window.console && window.okta && window.okta.debug) {
    window.console[level].apply(window.console, args);
  }
}

/**
 * Utility library of logging functions.
 * @class module:Okta.Logger
 */
/* harmony default export */ __webpack_exports__["default"] = ({
  /**
   * See [console.trace](https://developer.mozilla.org/en-US/docs/Web/API/Console.trace)
   * @static
   */
  trace: function () {
    return log('trace', arguments);
  },
  /**
   * See [console.dir](https://developer.mozilla.org/en-US/docs/Web/API/Console.dir)
   * @static
   */
  dir: function () {
    return log('dir', arguments);
  },
  /**
   * See [console.time](https://developer.mozilla.org/en-US/docs/Web/API/Console.time)
   * @static
   */
  time: function () {
    return log('time', arguments);
  },
  /**
   * See [console.timeEnd](https://developer.mozilla.org/en-US/docs/Web/API/Console.timeEnd)
   * @static
   */
  timeEnd: function () {
    return log('timeEnd', arguments);
  },
  /**
   * See [console.group](https://developer.mozilla.org/en-US/docs/Web/API/Console.group)
   * @static
   */
  group: function () {
    return log('group', arguments);
  },
  /**
   * See [console.groupEnd](https://developer.mozilla.org/en-US/docs/Web/API/Console.groupEnd)
   * @static
   */
  groupEnd: function () {
    return log('groupEnd', arguments);
  },
  /**
   * See [console.assert](https://developer.mozilla.org/en-US/docs/Web/API/Console.assert)
   * @static
   */
  assert: function () {
    return log('assert', arguments);
  },
  /**
   * See [console.log](https://developer.mozilla.org/en-US/docs/Web/API/Console.log)
   * @static
   */
  log: function () {
    return log('log', arguments);
  },
  /**
   * See [console.info](https://developer.mozilla.org/en-US/docs/Web/API/Console.info)
   * @static
   */
  info: function () {
    return log('info', arguments);
  },
  /**
   * See [console.warn](https://developer.mozilla.org/en-US/docs/Web/API/Console.warn)
   * @static
   */
  warn: function () {
    return log('warn', arguments);
  },
  /**
   * See [console.error](https://developer.mozilla.org/en-US/docs/Web/API/Console.error)
   * @static
   */
  error: function () {
    return log('error', arguments);
  }
});


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony default export */ __webpack_exports__["default"] = ({
  UP: 38,
  DOWN: 40,
  DEL: 46,
  TAB: 9,
  RETURN: 13,
  ENTER: 13,
  ESC: 27,
  COMMA: 188,
  PAGEUP: 33,
  PAGEDOWN: 34,
  SPACE: 32,
  BACKSPACE: 8,
  __isKey: function (e, key) {
    return (e.which || e.keyCode) === this[key];
  },
  isEnter: function (e) {
    return this.__isKey(e, 'ENTER');
  },
  isEsc: function (e) {
    return this.__isKey(e, 'ESC');
  },
  isSpaceBar: function (e) {
    return this.__isKey(e, 'SPACE');
  }
});


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util_ButtonFactory__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__util_StringUtil__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__BaseView__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_Callout__ = __webpack_require__(29);
/* eslint-env es6 */
/* eslint max-statements: [2, 17], max-len: [2, 160], max-params: [2, 6] */







/**
 * @class BaseInput
 * @private
 * An abstract object that defines an input for {@link Okta.Form}
 *
 * BaseInputs are typically not created directly, but being passed to {@link Okta.Form#addInput}
 * @extends Okta.View
 */

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_4__BaseView__["default"].extend({
  tagName: 'span',

  attributes: function () {
    return {
      'data-se': 'o-form-input-' + this.getNameString()
    };
  },

  /**
   * default placeholder text when options.placeholder is not defined
   */
  defaultPlaceholder: '',

  constructor: function (options) {
    /* eslint complexity: [2, 7] */
    options = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].defaults(options || {}, {
      inputId: options.id || __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].uniqueId('input'),
      placeholder: this.defaultPlaceholder,
      inlineValidation: true,
      validateOnlyIfDirty: false
    });

    delete options.id;

    // decorate the `enable` and `disable` and toggle the `o-form-disabled` class.
    // so we wont need to worry about this when overriding the methods
    const self = this;

    __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].each({ enable: 'removeClass', disable: 'addClass' }, function (method, action) {
      self[action] = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].wrap(self[action], function (fn) {
        fn.apply(self, arguments);
        self.$el[method]('o-form-disabled');
      });
    });

    __WEBPACK_IMPORTED_MODULE_4__BaseView__["default"].call(this, options);

    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(options, 'readOnly') !== true && __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(options, 'read') === true) {
      this.listenTo(this.model, 'change:__edit__', this.render);
    }

    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(this.focus)) {
      this.focus = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].debounce(__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].bind(this.focus, this), 50);
    }

    // Enable inline validation if this is not the first field in the form.
    if (!__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(options, 'validateOnlyIfDirty')) {
      this.addInlineValidation();
    }

    this.addModelListeners();
    this.$el.addClass('o-form-input-name-' + this.getNameString());
  },

  addAriaLabel: function () {
    const ariaLabel = this.options.ariaLabel;

    if (ariaLabel) {
      this.$(':input').attr('aria-label', ariaLabel);
    }
  },

  addInlineValidation: function () {
    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this.options, 'inlineValidation')) {
      this.$el.on('focusout', ':input', __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].bind(this.validate, this));
    }
  },

  toModelValue: function () {
    let value = this.val();

    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(this.to)) {
      value = this.to.call(this, value);
    }
    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(this.options.to)) {
      value = this.options.to.call(this, value);
    }
    return value;
  },

  __getDependencyCalloutBtn: function (btnConfig) {
    const self = this;

    const btnOptions = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].clone(btnConfig);

    const originalClick = btnOptions.click || function () {};
    // add onfocus listener to re-evaluate depedency when callout button is clicked

    btnOptions.click = function () {
      Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])(window).one('focus.dependency', function () {
        self.__showInputDependencies();
      });
      originalClick.call(self);
    };
    const BaseInputCalloutBtn = __WEBPACK_IMPORTED_MODULE_4__BaseView__["default"].extend({
      children: [__WEBPACK_IMPORTED_MODULE_2__util_ButtonFactory__["default"].create(btnOptions)]
    });

    return new BaseInputCalloutBtn();
  },

  getCalloutParent: function () {
    return this.$('input[value="' + this.getModelValue() + '"]').parent();
  },

  __getCalloutMsgContainer: function (calloutMsg) {
    return __WEBPACK_IMPORTED_MODULE_4__BaseView__["default"].extend({
      template: '\
        <span class="o-form-explain">\
           {{msg}}\
        </span>\
        ',
      getTemplateData: function () {
        return {
          msg: calloutMsg
        };
      }
    });
  },

  showCallout: function (calloutConfig, dependencyResolved) {
    const callout = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].clone(calloutConfig);

    callout.className = 'dependency-callout';
    if (callout.btn) {
      callout.content = this.__getDependencyCalloutBtn(callout.btn);
      delete callout.btn;
    }
    const dependencyCallout = __WEBPACK_IMPORTED_MODULE_5__components_Callout__["default"].create(callout);

    if (!dependencyResolved) {
      dependencyCallout.add(this.__getCalloutMsgContainer(__WEBPACK_IMPORTED_MODULE_3__util_StringUtil__["default"].localize('dependency.callout.msg', 'courage')));
    }
    const calloutParent = this.getCalloutParent();

    calloutParent.append(dependencyCallout.render().el);
    if (callout.type === 'success') {
      __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].delay(function () {
        // fade out success callout
        dependencyCallout.$el.fadeOut(800);
      }, 1000);
    }
  },

  removeCallout: function () {
    this.$el.find('.dependency-callout').remove();
  },

  __evaluateCalloutObject: function (dependencyResolved, calloutTitle) {
    let defaultCallout;

    if (dependencyResolved) {
      defaultCallout = {
        title: __WEBPACK_IMPORTED_MODULE_3__util_StringUtil__["default"].localize('dependency.action.completed', 'courage'),
        size: 'large',
        type: 'success'
      };
    } else {
      defaultCallout = {
        title: __WEBPACK_IMPORTED_MODULE_3__util_StringUtil__["default"].localize('dependency.action.required', 'courage', [calloutTitle]),
        size: 'large',
        type: 'warning'
      };
    }
    return defaultCallout;
  },

  __handleDependency: function (result, callout) {
    const self = this;
    const calloutConfig = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(callout)
      ? callout(result)
      : __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].extend({}, callout, self.__evaluateCalloutObject(result.resolved, callout.title));

    // remove existing callouts if any
    self.removeCallout();
    self.showCallout(calloutConfig, result.resolved);
  },

  __showInputDependencies: function () {
    const self = this;
    const fieldDependency = self.options.deps[self.getModelValue()];

    if (fieldDependency && __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(fieldDependency.func)) {
      fieldDependency
        .func()
        .done(function (data) {
          self.__handleDependency({ resolved: true, data: data }, fieldDependency.callout);
        })
        .fail(function (data) {
          self.__handleDependency({ resolved: false, data: data }, fieldDependency.callout);
        });
    } else {
      self.removeCallout();
    }
  },

  _isEdited: false,
  /**
   * updates the model with the input's value
   */
  update: function () {
    if (!this._isEdited && __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this.options, 'validateOnlyIfDirty')) {
      this._isEdited = true;
      this.addInlineValidation();
    }
    this.model.set(this.options.name, this.toModelValue());
    if (this.options.deps) {
      // check for dependencies
      this.__showInputDependencies();
    }
  },

  /**
   * Is the input in edit mode
   * @return {Boolean}
   */
  isEditMode: function () {
    const ret =
      !__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this.options, 'readOnly') &&
      (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this.options, 'read') !== true || this.model.get('__edit__') === true);

    return ret;
  },

  /**
   * Renders the input
   * @readonly
   */
  render: function () {
    this.preRender();
    const params = this.options.params;

    this.options.params = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].resultCtx(this.options, 'params', this);

    if (this.isEditMode()) {
      this.editMode();
      if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].resultCtx(this.options, 'disabled', this)) {
        this.disable();
      } else {
        this.enable();
      }
    } else {
      this.readMode();
    }

    this.options.params = params;
    this.addAriaLabel();
    this.postRender();

    return this;
  },

  /**
   * checks if the current value in the model is valid for this field
   */
  validate: function () {
    if (!this.model.get('__pending__') && this.isEditMode() && __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(this.model.validateField)) {
      const validationError = this.model.validateField(this.options.name);

      if (validationError) {
        __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].delay(
          function () {
            this.model.trigger('form:clear-error:' + this.options.name);
            this.model.trigger('invalid', this.model, validationError, false);
          }.bind(this),
          100
        );
      }
    }
  },

  /**
   * Add model event listeners
   */
  addModelListeners: function () {
    this.listenTo(this.model, 'form:field-error', function (name) {
      if (this.options.name === name) {
        this.__markError();
      }
    });
    this.listenTo(this.model, 'form:clear-errors change:' + this.options.name, this.__clearError);
    this.listenTo(this.model, 'form:clear-error:' + this.options.name, this.__clearError);
  },

  /**
   * The value of the input
   * @return {Mixed}
   */
  val: function () {
    throw new Error('val() is an abstract method');
  },

  /**
   * Set focus on the input
   */
  focus: function () {
    throw new Error('focus() is an abstract method');
  },

  /**
   * Default value in read mode
   * When model has no value for the field
   */
  defaultValue: function () {
    return '';
  },

  /**
   * Renders the input in edit mode
   */
  editMode: function () {
    const options = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].extend({}, this.options, {
      value: this.getModelValue()
    });

    this.$el.html(this.template(options));
    this.options.multi && this.$el.removeClass('margin-r');
    return this;
  },

  /**
   * Renders the readable value of the input in read mode
   */
  readMode: function () {
    this.$el.text(this.getReadModeString());
    this.$el.removeClass('error-field');
    this.options.multi && this.$el.addClass('margin-r');
    return this;
  },

  getReadModeString: function () {
    const readModeStr = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].resultCtx(this.options, 'readModeString', this);

    if (readModeStr) {
      return readModeStr;
    }
    return this.toStringValue();
  },

  /**
   * The model value off the field associated with the input
   * @return {Mixed}
   */
  getModelValue: function () {
    let value = this.model.get(this.options.name);

    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(this.from)) {
      value = this.from.call(this, value);
    }
    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(this.options.from)) {
      value = this.options.from.call(this, value);
    }
    return value;
  },

  /*
  * convenience method to get the textual value from the model
  * will return the textual label rather than value in case of select/radio
  * @return {String}
  */
  toStringValue: function () {
    let value = this.getModelValue();

    if (this.options.options) {
      // dropdown or radio
      value = this.options.options[value];
    }
    return value || this.defaultValue();
  },

  /**
   * Triggers a form:resize event in order to tell dialogs content size has changed
   */
  resize: function () {
    this.model.trigger('form:resize');
  },

  /**
   * Disable the input
   */
  disable: function () {
    this.$(':input').prop('disabled', true);
  },

  /**
   * Enable the input
   */
  enable: function () {
    this.$(':input').prop('disabled', false);
  },

  /**
   * Change the type of the input field. (e.g., text <--> password)
   * @param type
   */
  changeType: function (type) {
    this.$(':input').prop('type', type);
    // Update the options so that it keeps the uptodate state
    this.options.type = type;
  },

  getNameString: function () {
    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isArray(this.options.name)) {
      return this.options.name.join('-');
    }
    return this.options.name;
  },

  /**
   * Get parameters, computing _.result
   * @param  {[type]} options alternative options
   * @return {Object} the params
   */
  getParams: function (options) {
    const opts = options || this.options || {};

    return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].clone(__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].resultCtx(opts, 'params', this) || {});
  },

  /**
   * get a parameter from options.params, compute _.result when needed.
   * @param  {String} key
   * @param  {Object} defaultValue
   * @return {Object} the params
   */
  getParam: function (key, defaultValue) {
    const result = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].resultCtx(this.getParams(), key, this);

    return !__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isUndefined(result) ? result : defaultValue;
  },

  /**
   * Get a parameter from options.params or if empty, object attribute.
   *
   * @param  {String} key
   * @return {Object} the param or attribute
   */
  getParamOrAttribute: function (key) {
    return this.getParam(key) || __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, key);
  },

  __markError: function () {
    this.$el.addClass('o-form-has-errors');
  },

  __clearError: function () {
    this.$el.removeClass('o-form-has-errors');
  }
}));


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_Keys__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util_Logger__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__util_StringUtil__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__util_ViewUtil__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__BaseView__ = __webpack_require__(1);
/* eslint max-params: [2, 6] */






const LABEL_OPTIONS = ['model', 'id', 'inputId', 'type', 'label', 'sublabel', 'tooltip', 'name'];
const CONTAINER_OPTIONS = [
  'wide',
  'multi',
  'input',
  'label-top',
  'explain',
  'explain-top',
  'customExplain',
  'model',
  'name',
  'type',
  'autoRender'
];
const WRAPPER_OPTIONS = [
  'model',
  'name',
  'label-top',
  'readOnly',
  'events',
  'initialize',
  'showWhen',
  'bindings',
  'render',
  'className',
  'data-se',
  'toggleWhen',
];
const INPUT_OPTIONS = [
  'model',
  'name',
  'inputId',
  'type', // base options
  'input', // custom input
  'placeholder',
  'label', // labels
  'readOnly',
  'read',
  'disabled',
  'readModeString', // modes
  'options', // select/radio
  'deps', // used to specify inputs that have dependencies and show a callout to user on select
  'from',
  'to', // model transformers,
  'autoRender', // model attributes change event to trigger rerendering of the input
  'inlineValidation', // control inline validating against the model on focus lost
  'validateOnlyIfDirty', // check if field has been interacted with and then validate
  'ariaLabel', // 508 compliance for inputs that do not have label associated with them
  'params',
];
const // widgets params - for input specific widgets

      OTHER_OPTIONS = ['errorField'];

const ALL_OPTIONS = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].uniq(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].union(LABEL_OPTIONS, CONTAINER_OPTIONS, WRAPPER_OPTIONS, INPUT_OPTIONS, OTHER_OPTIONS));

const SAVE_BUTTON_PHASES = [
  '•         ',
  '•  •      ',
  '•  •  •   ',
  '•  •  •  •',
  '   •  •  •',
  '      •  •',
  '         •',
  '          ',
  '          ',
  '          ',
];

function decorateDoWhen(doWhen) {
  if (doWhen && !doWhen['__edit__']) {
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend({ __edit__: __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].constant(true) }, doWhen);
  }
}

function createButton(options) {
  options = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].pick(options || {}, 'action', 'id', 'className', 'text', 'type');

  let timeoutId;
  let intervalId;
  let phaseCount;

  return __WEBPACK_IMPORTED_MODULE_5__BaseView__["default"].extend({
    tagName: 'input',
    className: 'button',
    events: {
      click: function () {
        if (options.action && !this.disabled()) {
          options.action.call(this);
        }
      },
      keyup: function (e) {
        if (__WEBPACK_IMPORTED_MODULE_1__util_Keys__["default"].isEnter(e) && options.action && !this.disabled()) {
          options.action.call(this);
        }
      }
    },

    disabled: function () {
      return this.$el.prop('disabled') === true;
    },

    disable: function () {
      this.$el.prop('disabled', true);
      this.$el.addClass('btn-disabled');
    },

    enable: function () {
      this.$el.prop('disabled', false);
      this.$el.removeClass('btn-disabled');
    },

    initialize: function () {
      const self = this;

      this.$el.attr('type', options.type === 'save' ? 'submit' : 'button');
      this.$el.val(options.text);
      if (options.id) {
        this.$el.attr('id', options.id);
      }
      if (options.className) {
        this.$el.addClass(options.className);
      }
      if (options.type) {
        this.$el.attr('data-type', options.type);
      }

      this.$el.mousedown(function () {
        self.model.set('__pending__', true);
      });

      this.$el.mouseup(function () {
        self.model.set('__pending__', false);
      });

      this.listenTo(this.model, 'form:set-saving-state', function () {
        this.disable();
        if (options.type === 'save') {
          timeoutId = setTimeout(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].bind(this.__changeSaveText, this), 1000);
        }
      });
      this.listenTo(this.model, 'form:clear-saving-state', function () {
        this.enable();
        if (options.type === 'save') {
          clearTimeout(timeoutId);
          clearInterval(intervalId);
          this.$el.val(options.text);
        }
      });
    },

    __changeSaveText: function () {
      phaseCount = 0;
      intervalId = setInterval(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].bind(this.__showLoadingText, this), 200);
    },

    __showLoadingText: function () {
      this.$el.val(SAVE_BUTTON_PHASES[phaseCount++ % SAVE_BUTTON_PHASES.length]);
    }
  });
}

function validateInput(options, model) {
  /* eslint max-statements: 0, complexity: 0 */

  options || (options = {});

  if (options.type === 'label') {
    if (!options.label) {
      __WEBPACK_IMPORTED_MODULE_2__util_Logger__["default"].warn('A label input must have a "label" parameter', options);
    }
    return;
  }

  if (options.type === 'button') {
    if (!options.title && !options.icon) {
      __WEBPACK_IMPORTED_MODULE_2__util_Logger__["default"].warn('A button input must have a "title" and/or an "icon" parameter', options);
    }
    if (!options.click && !options.href) {
      __WEBPACK_IMPORTED_MODULE_2__util_Logger__["default"].warn('A button input must have a "click" and/or an "href" parameter', options);
    }
    return;
  }

  if (!options.name && !options.input) {
    __WEBPACK_IMPORTED_MODULE_2__util_Logger__["default"].warn('Missing "name" or "input" parameters', options);
  }

  if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(options.name) && __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(options.input)) {
    throw new Error('Not allowed to have both "name" and "input" defined as array.');
  }

  if (options.type !== 'list' && options.name && model && model.allows) {
    let names = [];

    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(options.name)) {
      names = options.name;
    } else {
      names.push(options.name);
    }
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(names, function (name) {
      if (!model.allows(name)) {
        throw new Error('field not allowed: ' + options.name);
      }
    });
  }

  if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(options.input) && options.type !== 'list') {
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(options.input, function (input) {
      validateInput(input, model);
    });
  }

  const keys = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].keys(options);

  const intersection = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].intersection(keys, ALL_OPTIONS);

  if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].size(intersection) !== __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].size(options)) {
    const fields = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].clone(ALL_OPTIONS);

    fields.unshift(keys);
    __WEBPACK_IMPORTED_MODULE_2__util_Logger__["default"].warn('Invalid input parameters', __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].without.apply(null, fields), options);
  }
}

function generateInputOptions(options, form, createFn) {
  options = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].clone(options);

  if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].contains(['list', 'group'], options.type)) {
    options.params = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults(
      {
        create: createFn,
        inputs: __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].map(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(options.input) ? options.input : [options.input], function (input) {
          return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].first(generateInputOptions(input, form, createFn));
        })
      },
      options.params || {}
    );
    delete options.input;
  }

  const inputs = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(options.input) ? __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].clone(options.input) : [options];

  return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].map(inputs, function (input) {
    const target = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults({ model: form.model }, input, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].omit(options, 'input', 'inputs'), form.options, {
      id: __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].uniqueId('input'),
      readOnly: form.isReadOnly(),
      read: form.hasReadMode()
    });

    if (form.isReadOnly()) {
      target.read = target.readOnly = true;
    }
    return target;
  });
}

/* harmony default export */ __webpack_exports__["default"] = ({
  LABEL_OPTIONS: LABEL_OPTIONS,
  CONTAINER_OPTIONS: CONTAINER_OPTIONS,
  WRAPPER_OPTIONS: WRAPPER_OPTIONS,
  INPUT_OPTIONS: INPUT_OPTIONS,

  generateInputOptions: generateInputOptions,

  changeEventString: function (fieldNames) {
    return 'change:' + fieldNames.join(' change:');
  },

  createReadFormButton: function (options) {
    let action;
    let text;
    let ariaLabel;

    if (options.type === 'cancel') {
      text = ariaLabel = __WEBPACK_IMPORTED_MODULE_3__util_StringUtil__["default"].localize('oform.cancel', 'courage');
      action = function () {
        this.model.trigger('form:cancel');
      };
    } else {
      text = __WEBPACK_IMPORTED_MODULE_3__util_StringUtil__["default"].localize('oform.edit', 'courage');
      ariaLabel = text + ' ' + options.formTitle;
      action = function () {
        this.model.set('__edit__', true);
      };
    }

    return __WEBPACK_IMPORTED_MODULE_5__BaseView__["default"].extend({
      tagName: 'a',
      attributes: {
        href: '#',
        'aria-label': ariaLabel
      },
      template: function () {
        return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].escape(text);
      },
      events: {
        click: function (e) {
          e.preventDefault();
          action.call(this);
        }
      }
    });
  },

  createButton: function (options) {
    options = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].clone(options);
    switch (options.type) {
    case 'save':
      __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults(options, { className: 'button-primary' });
      break;
    case 'cancel':
      __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults(options, {
        text: __WEBPACK_IMPORTED_MODULE_3__util_StringUtil__["default"].localize('oform.cancel', 'courage'),
        action: function () {
          this.model.trigger('form:cancel');
        }
      });
      break;
    case 'previous':
      __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults(options, {
        text: __WEBPACK_IMPORTED_MODULE_3__util_StringUtil__["default"].localize('oform.previous', 'courage'),
        action: function () {
          this.model.trigger('form:previous');
        }
      });
      break;
    }
    return createButton(options);
  },

  validateInput: validateInput,

  /**
   * Applies a show-when logic on a view instance.
   * The show-when is a map of a model field name -> a boolean or a function that returns a boolean.
   * The view will toggle based on the field value.
   *
   * @param  {Okta.View} view a view instance that has a this.model attached to it
   * @param  {Object} showWhen
   */
  applyShowWhen: function (view, showWhen) {
    const toggleAndResize = function (bool) {
      return function () {
        // The `toggle` is here since an event may be triggered before the el is in the DOM
        // and in that case slide events may not function as expected.
        view.$el.toggle(bool);
        view.model.trigger('form:resize');
      };
    };

    __WEBPACK_IMPORTED_MODULE_4__util_ViewUtil__["a" /* default */].applyDoWhen(view, decorateDoWhen(showWhen), function (bool, options) {
      if (!options.animate) {
        view.$el.toggle(bool);
      } else {
        view.$el['slide' + (bool ? 'Down' : 'Up')](200, toggleAndResize(bool));
      }
    });
  },

  applyToggleWhen: function (view, toggleWhen) {
    __WEBPACK_IMPORTED_MODULE_4__util_ViewUtil__["a" /* default */].applyDoWhen(view, decorateDoWhen(toggleWhen), function (bool, options) {
      view.$el.toggle(bool);
      view.model.trigger('form:resize');
      if (options.animate) {
        view.render();
      }
    });
  }
});


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__framework_Model__ = __webpack_require__(37);



/**
 * Wrapper around the more generic {@link src/framework/Model} that
 * contains Okta-specific logic.
 * @class module:Okta.Model
 * @extends src/framework/Model
 */
/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_1__framework_Model__["a" /* default */].extend(
  /** @lends module:Okta.Model.prototype */ {
    /**
     * Is the end point using the legacy "secureJSON" format
     * @type {Function|Boolean}
     */
    secureJSON: false,

    _builtInLocalProps: {
      __edit__: 'boolean',
      __pending__: 'boolean'
    },

    constructor: function () {
      this.local = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults({}, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'local'), this._builtInLocalProps);

      if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'secureJSON')) {
        this.sync = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].wrap(this.sync, function (sync, method, model, options) {
          return sync.call(this, method, model, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend({ dataType: 'secureJSON' }, options));
        });
      }

      __WEBPACK_IMPORTED_MODULE_1__framework_Model__["a" /* default */].apply(this, arguments);
    }
  }
));


/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("jquery");

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__StringUtil__ = __webpack_require__(3);


const loc = __WEBPACK_IMPORTED_MODULE_1__StringUtil__["default"].localize;
const SchemaUtils = {
  STRING: 'string',
  NUMBER: 'number',
  INTEGER: 'integer',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  FORMATDISPLAYTYPE: {
    'date-time': 'date',
    uri: 'uri',
    email: 'email',
    // TODO: settle on using EITHER underscores OR hyphens --- not both (OKTA-202818)
    'country-code': 'country-code',
    'language-code': 'language-code',
    'country_code': 'country_code',
    'language_code': 'language_code',
    locale: 'locale',
    timezone: 'timezone',
    'ref-id': 'reference'
  },
  ARRAYDISPLAYTYPE: {
    arrayofobject: 'arrayofobject',
    arrayofstring: 'arrayofstring',
    arrayofnumber: 'arrayofnumber',
    arrayofinteger: 'arrayofinteger',
    'arrayofref-id': 'arrayofref-id'
  },
  DISPLAYTYPES: {
    date: { type: 'string', format: 'date-time' },
    uri: { type: 'string', format: 'uri' },
    email: { type: 'string', format: 'email' },
    // TODO: Resolve inconsistencies in hyphens vs. underscores for these properties (OKTA-202818)
    'country-code': { type: 'string', format: 'country-code' },
    'language-code': { type: 'string', format: 'language-code' },
    'country_code': { type: 'string' },
    'language_code': { type: 'string' },
    locale: { type: 'string', format: 'locale' },
    timezone: { type: 'string', format: 'timezone' },
    string: { type: 'string' },
    number: { type: 'number' },
    boolean: { type: 'boolean' },
    integer: { type: 'integer' },
    reference: { type: 'string', format: 'ref-id' },
    arrayofobject: { type: 'array', items: { type: 'object' } },
    arrayofstring: { type: 'array', items: { type: 'string' } },
    arrayofnumber: { type: 'array', items: { type: 'number' } },
    arrayofinteger: { type: 'array', items: { type: 'integer' } },
    'arrayofref-id': { type: 'array', items: { type: 'string', format: 'ref-id' } },
    image: { type: 'image' },
    password: { type: 'string' }
  },
  SUPPORTSMINMAX: ['string', 'number', 'integer', 'password'],
  SUPPORTENUM: [
    'string',
    'number',
    'integer',
    'object',
    'arrayofstring',
    'arrayofnumber',
    'arrayofinteger',
    'arrayofobject',
  ],
  DATATYPE: {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    integer: 'integer',
    date: 'datetime',
    object: 'object',
    arrayofobject: 'object array',
    arrayofstring: 'string array',
    arrayofnumber: 'number array',
    arrayofinteger: 'integer array',
    'arrayofref-id': 'reference array',
    // TODO: settle on using EITHER underscores OR hyphens --- not both (OKTA-202818)
    'country-code': 'country code',
    'language-code': 'language code',
    'country_code': 'country code',
    'language_code': 'language code',
    reference: 'reference',
    timezone: 'timezone',
    image: 'image'
  },
  MUTABILITY: {
    READONLY: 'READ_ONLY',
    WRITEONLY: 'WRITE_ONLY',
    READWRITE: 'READ_WRITE',
    IMMUTABLE: 'IMMUTABLE'
  },
  SCOPE: {
    NONE: 'NONE',
    SELF: 'SELF',
    SYSTEM: 'SYSTEM'
  },
  DISPLAYSCOPE: {
    SELF: 'User personal',
    SYSTEM: 'System',
    NA: 'None'
  },
  UNION: {
    DISABLE: 'DISABLE',
    ENABLE: 'ENABLE'
  },
  UNION_OPTIONS: {
    DISABLE: loc('universal-directory.profiles.attribute.form.union.enable.display', 'courage'),
    ENABLE: loc('universal-directory.profiles.attribute.form.union.disable.display', 'courage')
  },
  PERMISSION: {
    HIDE: 'HIDE',
    READ_ONLY: 'READ_ONLY',
    WRITE_ONLY: 'WRITE_ONLY',
    READ_WRITE: 'READ_WRITE'
  },
  ENDUSER_ATTRIBUTE_PERMISSION_OPTIONS: {
    HIDE: loc('universal-directory.profiles.attribute.enduser.permission.hide', 'courage'),
    READ_ONLY: loc('universal-directory.profiles.attribute.enduser.permission.readonly', 'courage'),
    READ_WRITE: loc('universal-directory.profiles.attribute.enduser.permission.readwrite', 'courage')
  },
  ATTRIBUTE_LEVEL_MASTERING_OPTIONS: {
    INHERIT: loc('universal-directory.profiles.attribute.master.inherit', 'courage'),
    OKTA_MASTERED: loc('universal-directory.profiles.attribute.master.oktamastered', 'courage'),
    OVERRIDE: loc('universal-directory.profiles.attribute.master.override', 'courage')
  },
  USERNAMETYPE: {
    NONE: 'non-username',
    OKTA_TO_APP: 'okta-to-app-username',
    OKTA_TO_AD: 'okta-to-ad-username',
    APP_TO_OKTA: 'app-to-okta-username',
    IDP_TO_OKTA: 'idp-to-okta-username'
  },
  LOGINPATTERNFORMAT: {
    EMAIL: 'EMAIL',
    CUSTOM: 'CUSTOM',
    NONE: 'NONE'
  },
  UNIQUENESS: {
    NOT_UNIQUE: 'NOT_UNIQUE',
    PENDING_UNIQUENESS: 'PENDING_UNIQUENESS',
    UNIQUE_VALIDATED: 'UNIQUE_VALIDATED'
  },

  /*
   * Get a display string for a schema attribute type.
   * @param {String} type Type of an attribute
   * @param {String} format Format of an attribute
   * @param {String} itemType Item type of an attribute if an array
   * @param {String} defaultValue The default value if an attribute type is undefined
   * @return {String} the display value
   */
  getDisplayType: function (type, format, itemType, defaultValue) {
    let displayType;

    // type is undefined for
    // - an un-mapped source attribute from mapping
    // - an source attribute which is mapped to username target attribute
    if (type) {
      // format is only defined for complicated types (ex. reference, date time, array)
      // not for simple types (ex. string, integer, boolean)
      if (format) {
        displayType = this.FORMATDISPLAYTYPE[format];
      } else {
        // itemType is only defined for array type
        // to specify an array element type (ex. string, integer, number)
        displayType = itemType ? this.ARRAYDISPLAYTYPE[type + 'of' + itemType] : type;
      }
    }
    if (!displayType) {
      displayType = typeof defaultValue === 'undefined' ? '' : defaultValue;
    }
    return displayType;
  },

  /*
   * Get attribute mapping source attribute username type
   * @param {String} mappingDirection
   * @param {String} targetName The mapping target attribute name
   * @param {String} appName The app name that's mapped to/from Okta
   * @return {String} the source attribute username type value
   */
  getSourceUsernameType: function (mappingDirection, targetName, appName) {
    let sourceUsernameType = this.USERNAMETYPE.NONE;
    /* eslint complexity: [2, 7] */

    if (mappingDirection === 'oktaToApp') {
      if (targetName === 'userName') {
        sourceUsernameType = this.USERNAMETYPE.OKTA_TO_APP;
      } else if (targetName === 'cn') {
        sourceUsernameType = this.USERNAMETYPE.OKTA_TO_AD;
      }
    } else if (mappingDirection === 'appToOkta' && targetName === 'login') {
      if (appName === 'saml_idp') {
        sourceUsernameType = this.USERNAMETYPE.IDP_TO_OKTA;
      } else {
        sourceUsernameType = this.USERNAMETYPE.APP_TO_OKTA;
      }
    }
    return sourceUsernameType;
  },

  isArrayDataType: function (type) {
    return __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].contains(__WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].values(this.ARRAYDISPLAYTYPE), type);
  },

  isObjectDataType: function (type) {
    return this.DATATYPE.object === type;
  }
};
/* harmony default export */ __webpack_exports__["a"] = (SchemaUtils);


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__framework_Collection__ = __webpack_require__(36);



/**
 * Wrapper around the more generic {@link src/framework/Collection} that
 * contains Okta-specific logic.
 * @class module:Okta.Collection
 * @extends src/framework/Collection
 */
/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_1__framework_Collection__["a" /* default */].extend(
  /** @lends module:Okta.Collection.prototype */ {
    /**
     * Is the end point using the legacy "secureJSON" format
     * @type {Function|Boolean}
     */
    secureJSON: false,

    constructor: function () {
      if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'secureJSON')) {
        this.sync = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].wrap(this.sync, function (sync, method, collection, options) {
          return sync.call(this, method, collection, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend({ dataType: 'secureJSON' }, options));
        });
      }
      __WEBPACK_IMPORTED_MODULE_1__framework_Collection__["a" /* default */].apply(this, arguments);
    }
  }
));


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Model__ = __webpack_require__(11);



const hasProps = function (model) {
  const local = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].omit(model.local, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].keys(model._builtInLocalProps));

  return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].size(model.props) + __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].size(local) > 0;
};

/**
 * @class module:Okta.BaseModel
 * @extends module:Okta.Model
 * @deprecated Use {@link module:Okta.Model|Okta.Model} instead
 * @example
 * var Model = BaseModel.extend({
 *   defaults: {
 *     name: BaseModel.ComputedProperty(['fname', 'lname'], function (fname, lname) {
 *       return fname + ' ' + lname;
 *     })
 *   }
 * });
 * var model = new Model({fname: 'Joe', lname: 'Doe'});
 * model.get('name'); //=> "Joe Doe"
 * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
 *
 * model.set('__private__', 'private property');
 * model.get('__private__'); //=> "private property"
 * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
 */

const BaseModelBaseModel = __WEBPACK_IMPORTED_MODULE_1__Model__["default"].extend(
  /** @lends module:Okta.BaseModel.prototype */ {
    /**
     * @type {Boolean}
     */
    flat: false,

    constructor: function () {
      __WEBPACK_IMPORTED_MODULE_1__Model__["default"].apply(this, arguments);
      this.on('sync', this._setSynced);
    },

    allows: function () {
      if (hasProps(this)) {
        return __WEBPACK_IMPORTED_MODULE_1__Model__["default"].prototype.allows.apply(this, arguments);
      } else {
        return true;
      }
    },

    // bw compatibility support for old computed properties
    set: function (key, val) {
      let attrs;

      if (typeof key === 'object') {
        attrs = key;
      } else {
        (attrs = {})[key] = val;
      }

      // computed properties
      Object(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"])(attrs).each(function (fn, attr) {
        if (!fn || !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(fn.__attributes)) {
          return;
        }
        this.on(
          'change:' + fn.__attributes.join(' change:'),
          function () {
            const val = this.get(attr);

            if (val !== this['__schema__'].computedProperties[attr]) {
              this['__schema__'].computedProperties[attr] = val;
              this.trigger('change:' + attr, val);
            }
          },
          this
        );
      }, this);

      return __WEBPACK_IMPORTED_MODULE_1__Model__["default"].prototype.set.apply(this, arguments);
    },

    /**
     * Get the current value of an attribute from the model. For example: `note.get("title")`
     *
     * See [Model.get](http://backbonejs.org/#Model-get)
     * @param {String} attribute
     * @return {Mixed} The value of the model attribute
     */
    get: function () {
      const value = __WEBPACK_IMPORTED_MODULE_1__Model__["default"].prototype.get.apply(this, arguments);

      if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(value)) {
        return value.apply(this, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].map(value.__attributes || [], this.get, this));
      }
      return value;
    },

    /**
     * Return a shallow copy of the model's attributes for JSON stringification.
     * This can be used for persistence, serialization, or for augmentation before being sent to the server.
     * The name of this method is a bit confusing, as it doesn't actually return a JSON string —
     *  but I'm afraid that it's the way that the JavaScript API for JSON.stringify works.
     *
     * ```javascript
     * var artist = new Model({
     *   firstName: "Wassily",
     *   lastName: "Kandinsky"
     * });
     *
     * artist.set({birthday: "December 16, 1866"});
     * alert(JSON.stringify(artist)); // {"firstName":"Wassily","lastName":"Kandinsky","birthday":"December 16, 1866"}
     * ```
     * See [Model.toJSON](http://backbonejs.org/#Model-toJSON)
     * @param  {Object} options
     * @return {Object}
     */
    toJSON: function (options) {
      options || (options = {});
      const res = __WEBPACK_IMPORTED_MODULE_1__Model__["default"].prototype.toJSON.apply(this, arguments);

      // cleanup computed properties
      Object(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"])(res).each(function (value, key) {
        if (typeof value === 'function') {
          if (options.verbose) {
            res[key] = this.get(key);
          } else {
            delete res[key];
          }
        }
      }, this);

      // cleanup private properties
      if (!options.verbose) {
        Object(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"])(res).each(function (value, key) {
          if (/^__\w+__$/.test(key)) {
            delete res[key];
          }
        });
      }

      return res;
    },

    sanitizeAttributes: function (attributes) {
      const attrs = {};

      __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(attributes, function (value, key) {
        if (!__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(value)) {
          attrs[key] = value;
        }
      });
      return attrs;
    },

    reset: function (options) {
      this.clear(options);
      this.set(this.sanitizeAttributes(this.defaults), options);
    },

    clear: function (options) {
      const attrs = {};

      __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(this.sanitizeAttributes(this.attributes), function (value, key) {
        attrs[key] = void 0;
      });
      return this.set(attrs, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend({}, options, { unset: true }));
    },

    /**
     * @private
     */
    _setSynced: function (newModel) {
      this._syncedData = newModel && __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(newModel.toJSON) ? newModel.toJSON() : {};
    },

    /**
     * @private
     */
    _getSynced: function () {
      return this._syncedData;
    },

    isSynced: function () {
      return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isEqual(this._getSynced(), this.toJSON());
    }
  },
  /** @lends module:Okta.BaseModel.prototype */ {
    /**
     * @static
     *
     * Example:
     *
     * ```javascript
     * var Model = BaseModel.extend({
     *   defaults: {
     *     name: BaseModel.ComputedProperty(['fname', 'lname'], function (fname, lname) {
     *       return fname + ' ' + lname;
     *     })
     *   }
     * });
     * var model = new Model({fname: 'Joe', lname: 'Doe'});
     * model.get('name'); // Joe Doe
     * model.toJSON(); // {fname: 'Joe', lname: 'Doe'}
     * ```
     *
     * @param {Array} attributes - an array of the attribute names this method depends on
     * @param {Function} callback the function that computes the value of the property
     *
     * @deprecated Use {@link #derived} instead
     */
    ComputedProperty: function () {
      const args = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].toArray(arguments);

      const fn = args.pop();

      fn.__attributes = args.pop();
      return fn;
    }
  }
);
/* harmony default export */ __webpack_exports__["default"] = (BaseModelBaseModel);


/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__views_components_BaseButtonLink__ = __webpack_require__(43);
/* eslint '@okta/okta-ui/no-deprecated-methods': [0, [{ name: 'BaseButtonLink.extend', use: 'Okta.createButton'}, ]] */



/**
 * A factory method wrapper for {@link BaseButtonLink} creation
 * @class module:Okta.internal.util.ButtonFactory
 */

function normalizeEvents(options) {
  const events = __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].extend(options.click ? { click: options.click } : {}, options.events || {});

  const target = {};

  __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].each(events, function (fn, eventName) {
    target[eventName] = function (e) {
      if (!options.href) {
        e.preventDefault();
        e.stopPropagation();
      }
      fn.apply(this, arguments);
    };
  });
  return target;
}

/* harmony default export */ __webpack_exports__["default"] = ({
  /**
   * Creates a {@link module:Okta.internal.views.components.BaseButtonLink|BaseButtonLink}.
   * @param  {Object} options Options hash
   * @param  {String} [options.title] The button text
   * @param  {String} [options.icon]
   * CSS class for the icon to display. See [Style guide](http://rain.okta1.com:1802/su/dev/style-guide#icons)
   * @param {String} [options.href] The button link
   * @param {Function} [options.click] On click callback
   * @param {Object} [options.events] a [Backbone events](http://backbonejs.org/#View-delegateEvents) hash
   * @returns {module:Okta.internal.views.components.BaseButtonLink} BaseButtonLink prototype ("class")
   */
  create: function (options) {
    options = __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].clone(options);
    options.attrs = options.attributes;
    delete options.attributes;

    return __WEBPACK_IMPORTED_MODULE_1__views_components_BaseButtonLink__["a" /* default */].extend(
      __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].extend(options, {
        events: normalizeEvents(options)
      })
    );
  }
});


/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__views_BaseView__ = __webpack_require__(1);


/* harmony default export */ __webpack_exports__["default"] = ({
  redirect: function (url) {
    window.location = url;
  },

  reloadPage: function () {
    window.location.reload();
  },

  constantError: function (errorMessage) {
    return function () {
      throw new Error(errorMessage);
    };
  },

  /**
   * Simply convert an URL query key value pair object into an URL query string.
   * Remember NOT to escape the query string when using this util.
   * example:
   * input: {userId: 123, instanceId: undefined, expand: 'schema,app'}
   * output: '?userId=123&expand=schema,app'
   */
  getUrlQueryString: function (queries) {
    __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].isObject(queries) || (queries = {});

    const queriesString = __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].without(
      __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].map(queries, function (value, key) {
        if (value !== undefined && value !== null) {
          return key + '=' + encodeURIComponent(value);
        }
      }),
      undefined
    ).join('&');

    return __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].isEmpty(queriesString) ? '' : '?' + queriesString;
  },

  isABaseView(obj) {
    return obj instanceof __WEBPACK_IMPORTED_MODULE_1__views_BaseView__["default"] || obj.prototype instanceof __WEBPACK_IMPORTED_MODULE_1__views_BaseView__["default"] || obj === __WEBPACK_IMPORTED_MODULE_1__views_BaseView__["default"];
  }
});


/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__BaseCollection__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__BaseModel__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__util_Logger__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__util_StringUtil__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__views_forms_helpers_EnumTypeHelper__ = __webpack_require__(19);
/* eslint max-statements: [2, 16], complexity: [2, 8], max-params: [2, 8] */








const loc = __WEBPACK_IMPORTED_MODULE_6__util_StringUtil__["default"].localize;
const STRING = __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].STRING;
const NUMBER = __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].NUMBER;
const INTEGER = __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].INTEGER;
const OBJECT = __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].OBJECT;

const getArrayTypeName = function (type, elementType) {
  return type + 'of' + elementType;
};

const SchemaPropertySubSchema = __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].extend({
  defaults: {
    description: undefined,
    minLength: undefined,
    maxLength: undefined,
    format: undefined
  },
  parse: function (resp) {
    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isString(resp.format)) {
      const matcher = /^\/(.+)\/$/.exec(resp.format);

      if (matcher) {
        resp.format = matcher[1];
      }
    }
    return resp;
  }
});
const SchemaPropertySubSchemaCollection = __WEBPACK_IMPORTED_MODULE_2__BaseCollection__["default"].extend({
  model: SchemaPropertySubSchema
});
const SchemaPropertySubSchemaAllOfCollection = SchemaPropertySubSchemaCollection.extend({
  _type: 'allOf'
});
const SchemaPropertySubSchemaOneOfCollection = SchemaPropertySubSchemaCollection.extend({
  _type: 'oneOf'
});
const SchemaPropertySubSchemaNoneOfCollection = SchemaPropertySubSchemaCollection.extend({
  _type: 'noneOf'
});
const constraintTypeErrorMessages = {
  string: loc('schema.validation.field.value.must.string', 'courage'),
  number: loc('schema.validation.field.value.must.number', 'courage'),
  integer: loc('schema.validation.field.value.must.integer', 'courage'),
  object: loc('schema.validation.field.value.must.object', 'courage')
};
const loginFormatNonePattern = '.+';
const escapedLoginCharsRe = /[^a-zA-Z0-9-]/;
const SchemaPropertySchemaProperty = __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].extend({
  constraintHandlers: {
    between: '_checkBetweenConstraints',
    greaterThan: '_checkGreaterThanConstraint',
    lessThan: '_checkLessThanConstraint',
    equals: '_checkEqualsConstraint'
  },

  idAttribute: 'name',

  local: {
    __oneOf__: {
      type: 'array',
      minItems: 1
    }
  },

  defaults: {
    // OKTA-28445, set empty string by default as the key for each property when syncing with server
    // so that server can respond with error when a name is not provided
    name: '',
    title: undefined,
    type: undefined,
    description: undefined,
    required: false,
    format: undefined,
    // choose disable option be default.
    union: undefined,
    subSchemas: undefined,
    settings: { permissions: { SELF: __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].PERMISSION.READ_ONLY } },
    unique: undefined,
    __metadata__: undefined,
    __isSensitive__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['settings'], function (settings) {
      return !!(settings && settings.sensitive);
    }),
    __unique__: false,
    __isUniqueValidated__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['unique'], function (unique) {
      return unique === __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].UNIQUENESS.UNIQUE_VALIDATED;
    }),
    __isPendingUniqueness__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['unique'], function (unique) {
      return unique === __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].UNIQUENESS.PENDING_UNIQUENESS;
    }),
    __isUniqueness__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['__isUniqueValidated__', '__isPendingUniqueness__'], 
      function (isValidated, isPending) {
        return isValidated || isPending;
      }),
    __canBeSensitive__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['__metadata__'], function (metadata) {
      return !!(metadata && metadata.sensitivizable);
    }),
    __userPermission__: __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].PERMISSION.READ_ONLY,
    __displayType__: undefined,
    __displayTypeLabel__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['__displayType__'], function (displayType) {
      return __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].DATATYPE[displayType] || displayType;
    }),
    __supportsMinMax__: false,
    // use the private naming convention for these computed properties,
    // to deal with the complexity in cloning schema with properties (toJSON({verbose: true})),
    // to make sure these attributes are being excluded from api request
    __isReadOnly__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['mutability'], function (mutability) {
      return mutability === __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].MUTABILITY.READONLY;
    }),
    __isWriteOnly__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['mutability'], function (mutability) {
      return mutability === __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].MUTABILITY.WRITEONLY;
    }),
    __displayScope__: undefined,
    __isScopeSelf__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['scope'], function (scope) {
      return scope === __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].SCOPE.SELF;
    }),
    __isNoneScopeArrayType__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['__isScopeSelf__', '__displayType__'], function (
      isScopeSelf,
      displayType
    ) {
      return !isScopeSelf && __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].isArrayDataType(displayType);
    }),
    __isImported__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['externalName'], function (externalName) {
      return !!externalName;
    }),
    __isFromBaseSchema__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['__schemaMeta__'], function (schemaMeta) {
      return schemaMeta && schemaMeta.name === 'base';
    }),
    // Only UI can turn on __enumDefined__ and reprocess the enum/oneOf value; otherwise,
    // it should leave existing value untouch
    __enumDefined__: false,
    __supportEnum__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['__displayType__'], function (displayType) {
      return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].contains(__WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].SUPPORTENUM, displayType);
    }),
    __isNumberTypeEnum__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['__displayType__'], function (displayType) {
      return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].contains([__WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].NUMBER, __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].ARRAYDISPLAYTYPE.arrayofnumber], displayType);
    }),
    __isIntegerTypeEnum__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['__displayType__'], function (displayType) {
      return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].contains([__WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].INTEGER, __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].ARRAYDISPLAYTYPE.arrayofinteger], displayType);
    }),
    __isObjectTypeEnum__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['__displayType__'], function (displayType) {
      return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].contains([__WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].OBJECT, __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].ARRAYDISPLAYTYPE.arrayofobject], displayType);
    }),
    __isStringTypeEnum__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['__displayType__'], function (displayType) {
      return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].contains([__WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].STRING, __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].ARRAYDISPLAYTYPE.arrayofstring], displayType);
    }),
    __enumConstraintType__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(
      ['__isStringTypeEnum__', '__isNumberTypeEnum__', '__isIntegerTypeEnum__', '__isObjectTypeEnum__'],
      function (isStringType, isNumberType, isIntegerType, isObjectType) {
        if (isStringType) {
          return STRING;
        }
        if (isNumberType) {
          return NUMBER;
        }
        if (isIntegerType) {
          return INTEGER;
        }
        if (isObjectType) {
          return OBJECT;
        }
      }
    ),
    __isEnumDefinedAndSupported__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['__enumDefined__', '__supportEnum__'], function (
      enumDefined,
      supportEnum
    ) {
      return enumDefined && supportEnum;
    }),
    __isLoginOfBaseSchema__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['__isFromBaseSchema__', 'name'], function (
      isFromBaseSchema,
      name
    ) {
      return isFromBaseSchema && name === 'login';
    }),
    __isLoginFormatRestrictionToEmail__: __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].ComputedProperty(['__loginFormatRestriction__'], 
      function (loginFormatRestriction) {
        return loginFormatRestriction === __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].LOGINPATTERNFORMAT.EMAIL;
      })
  },

  initialize: function () {
    __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].prototype.initialize.apply(this, arguments);
    this.listenTo(this, 'change:__displayType__', this._updateTypeFormatConstraints);
    this.listenTo(this, 'change:type change:format change:items', this._updateDisplayType);
    this.listenTo(this, 'change:__minVal__ change:__maxVal__', this._updateMinMax);
    this.listenTo(this, 'change:__equals__', this._convertEqualsToMinMax);
    this.listenTo(this, 'change:__constraint__', this._setConstraintText);
    this._setConstraintText();
    this._setLoginPattern();
  },

  parse: function (resp) {
    /* eslint complexity: [2, 9] */
    resp = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].clone(resp);

    if (resp.type === 'object' && resp.extendedType === 'image') {
      resp.type = 'image';
    }
    resp['__displayType__'] = __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].getDisplayType(
      resp.type,
      resp.format,
      resp.items ? (resp.items.format ? resp.items.format : resp.items.type) : undefined
    );
    this._setRangeConstraints(resp);
    resp['__supportsMinMax__'] = __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].SUPPORTSMINMAX.indexOf(resp['__displayType__']) !== -1;
    resp['__displayScope__'] = __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].DISPLAYSCOPE[resp.scope] || __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].DISPLAYSCOPE.NA;
    if (resp.settings && resp.settings.permissions && resp.settings.permissions.SELF) {
      resp['__userPermission__'] = resp.settings.permissions.SELF;
    }
    this._setMasterOverride(resp);
    this._setSubSchemas(resp);
    this._setUniqueness(resp);
    return resp;
  },

  validate: function () {
    const enumValidationError = this._validateEnumOneOf();

    if (enumValidationError) {
      return enumValidationError;
    }

    if (!this.get('__supportsMinMax__') || !this.get('__constraint__')) {
      return undefined;
    }

    const constraitType = this.get('__constraint__');
    const constraitHandler = this[this.constraintHandlers[constraitType]];

    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(constraitHandler)) {
      return constraitHandler.call(this);
    } else {
      __WEBPACK_IMPORTED_MODULE_4__util_Logger__["default"].warn('No constraint handler found for: ' + constraitType);
      return undefined;
    }
  },

  _checkBetweenConstraints: function () {
    const minVal = this.get('__minVal__');
    const maxVal = this.get('__maxVal__');

    if (!minVal && !maxVal) {
      return;
    }
    if (!minVal) {
      return { __minVal__: 'Min value is required' };
    }
    if (!maxVal) {
      return { __maxVal__: 'Max value is required' };
    }

    let val = this._checkIntegerConstraints('__minVal__', 'Min value');

    if (val) {
      return val;
    }
    val = this._checkIntegerConstraints('__maxVal__', 'Max value');
    if (val) {
      return val;
    }
    if (+minVal >= +maxVal) {
      return { __maxVal__: 'Max val must be greater than min val' };
    }
  },

  _checkGreaterThanConstraint: function () {
    const minVal = this.get('__minVal__');

    if (!minVal) {
      return;
    }

    const val = this._checkIntegerConstraints('__minVal__', 'Min value');

    if (val) {
      return val;
    }
  },

  _checkLessThanConstraint: function () {
    const maxVal = this.get('__maxVal__');

    if (!maxVal) {
      return;
    }

    const val = this._checkIntegerConstraints('__maxVal__', 'Max value');

    if (val) {
      return val;
    }
  },

  _checkEqualsConstraint: function () {
    const equals = this.get('__equals__');

    if (!equals) {
      return;
    }

    const val = this._checkIntegerConstraints('__equals__', 'Constraint');

    if (val) {
      return val;
    }
  },

  _checkIntegerConstraints: function (field, name) {
    const val = this.get(field);
    const error = {};

    if (isNaN(val)) {
      error[field] = name + ' must be a number';
      return error;
    }
    if (+val < 0) {
      error[field] = name + ' must be greater than 0';
      return error;
    }
  },

  _setMasterOverride: function (resp) {
    if (resp.settings && resp.settings.masterOverride && resp.settings.masterOverride) {
      const masterOverrideValue = resp.settings.masterOverride.value;

      if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isArray(masterOverrideValue) && !__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isEmpty(masterOverrideValue)) {
        resp['__masterOverrideType__'] = 'OVERRIDE';
        resp['__masterOverrideValue__'] = masterOverrideValue || [];
      } else {
        resp['__masterOverrideType__'] = resp.settings.masterOverride.type;
      }
    } else {
      resp['__masterOverrideType__'] = 'INHERIT';
    }
  },

  _setRangeConstraints: function (resp) {
    /* eslint complexity: [2, 11] */
    if (resp['__displayType__'] === STRING) {
      resp['__minVal__'] = resp.minLength;
      resp['__maxVal__'] = resp.maxLength;
    } else if (resp['__displayType__'] === INTEGER || resp['__displayType__'] === NUMBER) {
      resp['__minVal__'] = resp.minimum;
      resp['__maxVal__'] = resp.maximum;
    }
    if (resp['__minVal__'] && resp['__maxVal__']) {
      if (resp['__minVal__'] === resp['__maxVal__']) {
        resp['__constraint__'] = 'equals';
        resp['__equals__'] = resp['__minVal__'];
      } else {
        resp['__constraint__'] = 'between';
      }
    } else if (!resp['__minVal__'] && resp['__maxVal__']) {
      resp['__constraint__'] = 'lessThan';
    } else if (!resp['__maxVal__'] && resp['__minVal__']) {
      resp['__constraint__'] = 'greaterThan';
    }
  },

  _setSubSchemas: function (resp) {
    if (resp.allOf) {
      resp['subSchemas'] = new SchemaPropertySubSchemaAllOfCollection(resp.allOf, { parse: true });
    } else if (resp.oneOf) {
      resp['subSchemas'] = new SchemaPropertySubSchemaOneOfCollection(resp.oneOf, { parse: true });
    } else if (resp.noneOf) {
      resp['subSchemas'] = new SchemaPropertySubSchemaNoneOfCollection(resp.noneOf, { parse: true });
    }
  },

  _setUniqueness: function (resp) {
    const unique = resp && resp.unique;
    resp['__unique__'] = !!(unique && 
      (unique === __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].UNIQUENESS.UNIQUE_VALIDATED || unique === __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].UNIQUENESS.PENDING_UNIQUENESS));
  },

  _setLoginPattern: function () {
    if (!this.get('__isLoginOfBaseSchema__')) {
      return;
    }

    const pattern = this.get('pattern');

    if (pattern === loginFormatNonePattern) {
      this.set('__loginFormatRestriction__', __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].LOGINPATTERNFORMAT.NONE);
    } else if (pattern) {
      this.set('__loginFormatRestriction__', __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].LOGINPATTERNFORMAT.CUSTOM);
      this.set('__loginFormatRestrictionCustom__', this._extractLoginPattern(pattern));
    } else {
      this.set('__loginFormatRestriction__', __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].LOGINPATTERNFORMAT.EMAIL);
    }
  },

  _updateDisplayType: function () {
    const type = this.get('type');

    if (type === STRING && this.get('format')) {
      this.set('__displayType__', __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].FORMATDISPLAYTYPE[this.get('format')]);
    } else {
      const items = this.get('items');
      const arraytype = items && (items.format ? items.format : items.type);

      if (type && arraytype) {
        this.set('__displayType__', __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].ARRAYDISPLAYTYPE[getArrayTypeName(type, arraytype)]);
      } else {
        this.set('__displayType__', type);
      }
    }
  },

  _validateEnumOneOf: function () {
    if (!this.get('__isEnumDefinedAndSupported__')) {
      return;
    }

    const enumOneOf = this.get('__oneOf__') || [];

    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isEmpty(enumOneOf)) {
      return { __oneOf__: loc('model.validation.field.blank', 'courage') };
    }

    if (!this._isValidateOneOfConstraint(enumOneOf)) {
      const constraintType = this.get('__enumConstraintType__');
      const errorTypeMsg = constraintTypeErrorMessages[constraintType];

      return { __oneOf__: errorTypeMsg };
    }
  },

  _isValidateOneOfConstraint: function (values) {
    const constraintType = this.get('__enumConstraintType__');

    return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].all(values, function (value) {
      return __WEBPACK_IMPORTED_MODULE_7__views_forms_helpers_EnumTypeHelper__["a" /* default */].isConstraintValueMatchType(value.const, constraintType);
    });
  },

  toJSON: function () {
    let json = __WEBPACK_IMPORTED_MODULE_3__BaseModel__["default"].prototype.toJSON.apply(this, arguments);

    json.settings = { permissions: {} };
    json.settings.permissions['SELF'] = this.get('__userPermission__');

    // omit "sensitive" filed will have default it value to false.
    if (this.get('__isSensitive__')) {
      json.settings.sensitive = this.get('__isSensitive__');
    }
    if (this.get('type') === 'image') {
      json.type = 'object';
      json.extendedType = 'image';
    }

    json = this._enumAssignment(json);
    json = this._attributeOverrideToJson(json);
    json = this._normalizeUnionValue(json);
    json = this._patternAssignment(json);
    json = this._uniquenessAssignment(json);
    return json;
  },

  _attributeOverrideToJson: function (json) {
    const masterOverrideType = this.get('__masterOverrideType__');
    const masterOverrideValue = this.get('__masterOverrideValue__');

    if (masterOverrideType === 'OKTA_MASTERED') {
      json.settings.masterOverride = { type: 'OKTA_MASTERED' };
    } else if (masterOverrideType === 'OVERRIDE') {
      json.settings.masterOverride = { type: 'ORDERED_LIST', value: [] };
      if (masterOverrideValue instanceof __WEBPACK_IMPORTED_MODULE_2__BaseCollection__["default"]) {
        __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].each(masterOverrideValue.toJSON(), function (overrideProfile) {
          json.settings.masterOverride.value.push(overrideProfile.id);
        });
      } else if (masterOverrideValue instanceof Array) {
        json.settings.masterOverride.value = masterOverrideValue;
      }
      if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isEmpty(json.settings.masterOverride.value)) {
        delete json.settings.masterOverride;
      }
    }

    if (masterOverrideType === 'INHERIT') {
      delete json.settings.masterOverride;
    }
    return json;
  },

  /**
   * Only allow set "union" value when isScopeSelf is NONE and displayType is
   * array of (string/number/integer), otherwise reset to default.
   *
   * @see /universal-directory/shared/views/components/UnionGroupValuesRadio.js
   */
  _normalizeUnionValue: function (json) {
    if (!this.get('__isNoneScopeArrayType__')) {
      json['union'] = undefined;
    }

    return json;
  },

  _enumAssignment: function (json) {
    if (!this.get('__isEnumDefinedAndSupported__')) {
      return json;
    }

    // backfill empty title by constraint

    const enumOneOf = this._getEnumOneOfWithTitleCheck();

    if (this.get('type') === 'array') {
      delete json.items.enum;
      json.items.oneOf = enumOneOf;
    } else {
      delete json.enum;
      json.oneOf = enumOneOf;
    }

    return json;
  },

  _patternAssignment: function (json) {
    if (!this.get('__isLoginOfBaseSchema__') || !this.get('__loginFormatRestriction__')) {
      return json;
    }

    switch (this.get('__loginFormatRestriction__')) {
    case __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].LOGINPATTERNFORMAT.EMAIL:
      delete json.pattern;
      break;
    case __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].LOGINPATTERNFORMAT.CUSTOM:
      json.pattern = this._buildLoginPattern(this.get('__loginFormatRestrictionCustom__'));
      break;
    case __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].LOGINPATTERNFORMAT.NONE:
      json.pattern = loginFormatNonePattern;
      break;
    }

    return json;
  },

  _uniquenessAssignment: function (json) {
    if (!this.get('__unique__')) {
      delete json.unique;
    } else if (!this.get('__isUniqueness__')) {
      json.unique = __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].UNIQUENESS.UNIQUE_VALIDATED;
    }

    return json;
  },

  /**
   * Character should be escaped except letters, digits and hyphen
   */
  _escapedRegexChar: function (pattern, index) {
    const char = pattern.charAt(index);

    if (escapedLoginCharsRe.test(char)) {
      return '\\' + char;
    }

    return char;
  },

  _buildLoginPattern: function (pattern) {
    let result = '';

    for (var i = 0; i < pattern.length; i++) {
      result = result + this._escapedRegexChar(pattern, i);
    }

    return '[' + result + ']+';
  },

  _extractLoginPattern: function (pattern) {
    const re = /^\[(.*)\]\+/;
    const matches = pattern.match(re);

    return matches ? matches[1].replace(/\\(.)/g, '$1') : pattern;
  },

  _getEnumOneOfWithTitleCheck: function () {
    const enumOneOf = this.get('__oneOf__');

    return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].map(enumOneOf, function (value) {
      if (__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"].trim(value.title) !== '') {
        return value;
      }

      value.title = !__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isString(value.const) ? JSON.stringify(value.const) : value.const;

      return value;
    });
  },

  _updateTypeFormatConstraints: function () {
    const displayType = this.get('__displayType__');

    // OKTA-31952 reset format according to its displayType
    this.unset('format', { silent: true });
    this.unset('items', { silent: true });
    this.set(__WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].DISPLAYTYPES[displayType]);
    if (displayType !== NUMBER && displayType !== INTEGER) {
      this.unset('minimum');
      this.unset('maximum');
    }
    if (displayType !== STRING) {
      this.unset('minLength');
      this.unset('maxLength');
    }

    this.unset('__minVal__');
    this.unset('__maxVal__');
    this.unset('__equals__');
    this.set('__supportsMinMax__', __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].SUPPORTSMINMAX.indexOf(this.get('__displayType__')) !== -1);
  },

  _updateMinMax: function () {
    let min;
    let max;
    const displayType = this.get('__displayType__');

    if (displayType === STRING) {
      min = 'minLength';
      max = 'maxLength';
    } else if (displayType === INTEGER || displayType === NUMBER) {
      min = 'minimum';
      max = 'maximum';
    }

    if (this.get('__minVal__')) {
      this.set(min, parseInt(this.get('__minVal__'), 10));
    } else {
      this.unset(min);
    }

    if (this.get('__maxVal__')) {
      this.set(max, parseInt(this.get('__maxVal__'), 10));
    } else {
      this.unset(max);
    }
  },

  _convertEqualsToMinMax: function () {
    const equals = this.get('__equals__');

    if (equals) {
      this.set('__minVal__', equals);
      this.set('__maxVal__', equals);
    }
  },

  /*
   Normally we would use a derived property here but derived properties do not work with the model Clone function
   so we use this workaround instead.
   */
  _setConstraintText: function () {
    const constraint = this.get('__constraint__');
    const min = this.get('__minVal__');
    const max = this.get('__maxVal__');
    const equals = this.get('__equals__');

    switch (constraint) {
    case 'between':
      this.set('__constraintText__', 'Between ' + min + ' and ' + max);
      break;
    case 'greaterThan':
      this.set('__constraintText__', 'Greater than ' + min);
      break;
    case 'lessThan':
      this.set('__constraintText__', 'Less than ' + max);
      break;
    case 'equals':
      this.set('__constraintText__', 'Equals ' + equals);
      break;
    default:
      this.set('__constraintText__', '');
      break;
    }
  },

  cleanup: function () {
    if (this.get('__constraint__') === 'lessThan') {
      this.unset('__minVal__');
    } else if (this.get('__constraint__') === 'greaterThan') {
      this.unset('__maxVal__');
    }
    if (this.get('scope') !== __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].SCOPE.SYSTEM) {
      if (this.get('__isScopeSelf__') === true) {
        this.set({ scope: __WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].SCOPE.SELF }, { silent: true });
      } else {
        this.unset('scope');
      }
    }

    if (!this.get('__unique__')) {
      this.unset('unique');
    }
  },

  /**
   * Since there is not an dedicated attribute to flag enum type,
   * use enum values to determine whether the property is enum type or not.
   */
  isEnumType: function () {
    return !!this.getEnumValues();
  },

  getEnumValues: function () {
    return (
      this.get('oneOf') ||
      this.get('enum') ||
      (this.get('items') && this.get('items')['oneOf']) ||
      (this.get('items') && this.get('items')['enum'])
    );
  },

  detectHasEnumDefined: function () {
    const enumValues = this.getEnumValues();

    if (!enumValues) {
      return;
    }

    this.set('__oneOf__', __WEBPACK_IMPORTED_MODULE_7__views_forms_helpers_EnumTypeHelper__["a" /* default */].convertToOneOf(enumValues));
    this.set('__enumDefined__', true);
  }
});
const SchemaPropertySchemaProperties = __WEBPACK_IMPORTED_MODULE_2__BaseCollection__["default"].extend({
  model: SchemaPropertySchemaProperty,
  clone: function () {
    return new this.constructor(this.toJSON({ verbose: true }), { parse: true });
  },
  areAllReadOnly: function () {
    return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].all(this.pluck('__isReadOnly__'));
  },
  createModelProperties: function () {
    return this.reduce(function (p, schemaProperty) {
      const type = schemaProperty.get('type');

      p[schemaProperty.id] = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].clone(__WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].DISPLAYTYPES[type]);
      if (__WEBPACK_IMPORTED_MODULE_5__util_SchemaUtil__["a" /* default */].SUPPORTSMINMAX.indexOf(type) !== -1) {
        p[schemaProperty.id].minLength = schemaProperty.get('minLength');
        p[schemaProperty.id].maxLength = schemaProperty.get('maxLength');
      }
      if (type === 'string') {
        p[schemaProperty.id].format = schemaProperty.get('format');
      }
      return p;
    }, {});
  }
});
/* harmony default export */ __webpack_exports__["default"] = ({
  Model: SchemaPropertySchemaProperty,
  Collection: SchemaPropertySchemaProperties
});


/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util_SchemaUtil__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__util_StringUtil__ = __webpack_require__(3);
/* eslint max-statements: 0 */




const NAME = 'name';
const ENUM_KEY_PREFIX = '_enum_';

/**
 * Generate Input Options in order to create an input in an Form for Enum type attribute.
 * @param {Object} config informations for creating input options
 *   config.name        schema property name
 *   config.title       schema property title
 *   config.readOnly    create an read only input?
 *   config.explain     sub-title to the input
 *   config.enumValues  list of enum values for creating input options (Dropdown/SimpleCheckBoxSet)
 *   config.displayType display type of schema property
 *
 * @return {Object} inputOptions options for create an Input view. (Dropdown/SimpleCheckBoxSet)
 *
 */
function getEnumInputOptions(config) {
  const enumOneOf = convertToOneOf(config.enumValues);
  const inputOptions = {
    name: config.name,
    label: config.title,
    readOnly: config.readOnly,
    customExplain: config.explain,
    params: { enumOneOf: enumOneOf },
    options: getDropdownOptionsFromOneOf(enumOneOf)
  };

  // input type
  if (__WEBPACK_IMPORTED_MODULE_2__util_SchemaUtil__["a" /* default */].isArrayDataType(config.displayType)) {
    inputOptions.type = 'checkboxset';
    inputOptions.to = valuesToEnumObjects;
    inputOptions.from = enumObjectsToValues;
  } else {
    inputOptions.type = 'select';
    inputOptions.to = valueToEnumObject;
    inputOptions.from = enumObjectToValue;
  }

  inputOptions.input = null;
  return inputOptions;
}

function getDropdownOptions(values) {
  return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isArray(values) ? getDropdownOptionsFromOneOf(convertToOneOf(values)) : {};
}

function getDropdownOptionsFromOneOf(values) {
  if (!isOneOfEnumObject(values)) {
    return {};
  }

  return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].reduce(
    values,
    function (options, value, index) {
      options[convertIndexToEnumIndex(index)] = value.title;
      return options;
    },
    {}
  );
}

function convertToOneOf(values) {
  // assume this is a legacy enum array and convert to oneOf object
  if (!__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].all(values, __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"].isPlainObject)) {
    return convertEnumToOneOf(values);

    // we assume object without const and title is an enum object which need special conversion
  } else if (!isOneOfEnumObject(values)) {
    return convertEnumObjectToOneOf(values);
  }

  return values;
}

function isOneOfEnumObject(values) {
  return (
    __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isArray(values) &&
    __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].all(values, function (value) {
      return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].has(value, 'const') && __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].has(value, 'title');
    })
  );
}

function convertEnumToOneOf(values) {
  return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].map(values, function (value) {
    return {
      const: value,
      title: valueToTitle(value)
    };
  });
}

function valueToTitle(value) {
  if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isObject(value)) {
    return JSON.stringify(value);
  }

  if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isNumber(value)) {
    return value + '';
  }

  return value;
}

function convertEnumObjectToOneOf(values) {
  const findKey = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].partial(__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].has, __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"], NAME);
  // If all object found the key NAME, use the NAME's value as display name

  if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].all(values, findKey)) {
    return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].chain(values)
      .filter(function (value) {
        return __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"].isPlainObject(value) && __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].has(value, NAME);
      })
      .map(function (value) {
        return { const: value, title: value[NAME] };
      })
      .value();
  }

  // Assume a legacy object array does not need special handling and just convert to const/title enum
  return convertEnumToOneOf(values);
}

function convertIndexToEnumIndex(index) {
  return `${ENUM_KEY_PREFIX}${index}`;
}

function enumObjectToValue(obj) {
  const index = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].findIndex(this.options.params.enumOneOf, function (oneOfObj) {
    return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isObject(obj) ? __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isEqual(oneOfObj.const, obj) : oneOfObj.const === obj;
  });
  // Cannot rely on comparator in findIndex when compare objects so need special handling

  return index > -1 ? convertIndexToEnumIndex(index) : obj;
}

function valueToEnumObject(val) {
  if (!__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isString(val) || val.indexOf(ENUM_KEY_PREFIX) !== 0) {
    return val;
  }

  const index = val.replace(ENUM_KEY_PREFIX, '');
  const enumValue =
    this.options.params && __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isArray(this.options.params.enumOneOf) ? this.options.params.enumOneOf[index] : null;

  // @see `getEnumInputOptions` how enumValues has been set.

  return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].has(enumValue, 'const') ? enumValue.const : enumValue;
}

function valuesToEnumObjects(values) {
  return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].map(values, valueToEnumObject.bind(this));
}

function enumObjectsToValues(values) {
  return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].map(values, enumObjectToValue.bind(this));
}

function isStringConstraint(value) {
  return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isString(value) && __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"].trim(value) !== '';
}

function isNumberConstraint(value) {
  return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isNumber(value) || __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isNumber(__WEBPACK_IMPORTED_MODULE_3__util_StringUtil__["default"].parseFloat(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"].trim(value)));
}

function isIntegerConstraint(value) {
  const integer = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isNumber(value) ? value : __WEBPACK_IMPORTED_MODULE_3__util_StringUtil__["default"].parseInt(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"].trim(value));

  return typeof integer === 'number' && isFinite(integer) && Math.floor(integer) === integer;
}

function isObjectConstraint(value) {
  if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isObject(value) && !__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isArray(value)) {
    return true;
  }

  const object = __WEBPACK_IMPORTED_MODULE_3__util_StringUtil__["default"].parseObject(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"].trim(value));

  return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isObject(object) && !__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isArray(object);
}

function isConstraintValueMatchType(value, type) {
  switch (type) {
  case __WEBPACK_IMPORTED_MODULE_2__util_SchemaUtil__["a" /* default */].STRING:
    return isStringConstraint(value);
  case __WEBPACK_IMPORTED_MODULE_2__util_SchemaUtil__["a" /* default */].NUMBER:
    return isNumberConstraint(value);
  case __WEBPACK_IMPORTED_MODULE_2__util_SchemaUtil__["a" /* default */].INTEGER:
    return isIntegerConstraint(value);
  case __WEBPACK_IMPORTED_MODULE_2__util_SchemaUtil__["a" /* default */].OBJECT:
    return isObjectConstraint(value);
  }
}

/* harmony default export */ __webpack_exports__["a"] = ({
  getEnumInputOptions: getEnumInputOptions,
  getDropdownOptions: getDropdownOptions,
  convertToOneOf: convertToOneOf,
  isConstraintValueMatchType: isConstraintValueMatchType
});


/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_backbone__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_backbone___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_backbone__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__jquery_wrapper__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Logger__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__SettingsModel__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_ConfirmationDialog__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_ConfirmationDialog___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_ConfirmationDialog__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__views_components_Notification__ = __webpack_require__(41);
/* eslint max-len: [2, 150], max-params: [2, 7] */








function getRoute(router, route) {
  const root = __WEBPACK_IMPORTED_MODULE_2__underscore_wrapper__["default"].result(router, 'root') || '';

  if (root && __WEBPACK_IMPORTED_MODULE_2__underscore_wrapper__["default"].isString(route)) {
    return [root, route].join('/').replace(/\/{2,}/g, '/');
  }
  return route;
}

/**
 * BaseRouter is a standard [Backbone.Router](http://backbonejs.org/#Router)
 * with a few additions:
 * - Explicit mapping between routes and controllers
 * - Support for rendering notification and confirmation dialogs
 *
 * Checkout the [Hello World Tutorial](https://github.com/okta/courage/wiki/Hello-World)
 * for a step-by-step guide to using this.
 *
 * @class module:Okta.Router
 * @extends external:Backbone.Router
 * @param {Object} options options hash
 * @param {String} options.el a jQuery selector string stating where to attach the controller in the DOM
 */
/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0_backbone___default.a.Router.extend(
  /** @lends module:Okta.Router.prototype */ {
    /**
     * The root URL for the router. When setting {@link http://backbonejs.org/#Router-routes|routes},
     * it will be prepended to each route.
     * @type {String|Function}
     */
    root: '',

    listen: __WEBPACK_IMPORTED_MODULE_6__views_components_Notification__["a" /* default */].prototype.listen,

    constructor: function (options) {
      options || (options = {});
      this.el = options.el;
      this.settings = new __WEBPACK_IMPORTED_MODULE_4__SettingsModel__["a" /* default */](__WEBPACK_IMPORTED_MODULE_2__underscore_wrapper__["default"].omit(options, 'el'));
      if (options.root) {
        this.root = options.root;
      }

      __WEBPACK_IMPORTED_MODULE_0_backbone___default.a.Router.apply(this, arguments);

      this.listen('notification', this._notify);
      this.listen('confirmation', this._confirm);
    },

    /**
     * Fires up a confirmation dialog
     *
     * @param  {Object} options Options Hash
     * @param  {String} options.title The title
     * @param  {String} options.subtitle The explain text
     * @param  {String} options.save The text for the save button
     * @param  {Function} options.ok The callback function to run when hitting "OK"
     * @param  {String} options.cancel The text for the cancel button
     * @param  {Function} options.cancelFn The callback function to run when hitting "Cancel"
     * @param  {Boolean} options.noCancelButton Don't render the cancel button (useful for alert dialogs)
     *
     * @private
     *
     * @return {Okta.View} the dialog view
     */
    _confirm: function (options) {
      options || (options = {});
      const Dialog = __WEBPACK_IMPORTED_MODULE_5_ConfirmationDialog___default.a.extend(
        __WEBPACK_IMPORTED_MODULE_2__underscore_wrapper__["default"].pick(options, 'title', 'subtitle', 'save', 'ok', 'cancel', 'cancelFn', 'noCancelButton', 'content', 'danger', 'type', 'closeOnOverlayClick')
      );
      const dialog = new Dialog({ model: this.settings });
      // The model is here because itsa part of the BaseForm paradigm.
      // It will be ignored in the context of a confirmation dialog.

      dialog.render();
      return dialog; // test hook
    },

    /**
     * Fires up a notification banner
     *
     * @param  {Object} options Options Hash
     * @return {Okta.View} the notification view
     * @private
     */
    _notify: function (options) {
      const notification = new __WEBPACK_IMPORTED_MODULE_6__views_components_Notification__["a" /* default */](options);

      Object(__WEBPACK_IMPORTED_MODULE_1__jquery_wrapper__["default"])('#content').prepend(notification.render().el);
      return notification; // test hook
    },

    /**
     * Renders a Controller
     * This will initialize new instance of a controller and call render on it
     *
     * @param  {Okta.Controller} Controller The controller Class we which to render
     * @param  {Object} [options] Extra options to the controller constructor
     */
    render: function (Controller, options) {
      this.unload();
      options = __WEBPACK_IMPORTED_MODULE_2__underscore_wrapper__["default"].extend(__WEBPACK_IMPORTED_MODULE_2__underscore_wrapper__["default"].pick(this, 'settings', 'el'), options || {});
      this.controller = new Controller(options);
      this.controller.render();
    },

    /**
     * Starts the backbone history object
     *
     * Waits for the dom to be ready before calling `Backbone.history.start()` (IE issue).
     *
     * See [Backbone History](http://backbonejs.org/#History) for more information.
     */
    start: function () {
      const args = arguments;

      Object(__WEBPACK_IMPORTED_MODULE_1__jquery_wrapper__["default"])(function () {
        if (__WEBPACK_IMPORTED_MODULE_0_backbone___default.a.History.started) {
          __WEBPACK_IMPORTED_MODULE_3__Logger__["default"].error('History has already been started');
          return;
        }
        __WEBPACK_IMPORTED_MODULE_0_backbone___default.a.history.start.apply(__WEBPACK_IMPORTED_MODULE_0_backbone___default.a.history, args);
      });
    },

    /**
     * Removes active controller and frees up event listeners
     */
    unload: function () {
      if (this.controller) {
        this.stopListening(this.controller);
        this.stopListening(this.controller.state);
        this.controller.remove();
      }
    },

    route: function (route, name, callback) {
      return __WEBPACK_IMPORTED_MODULE_0_backbone___default.a.Router.prototype.route.call(this, getRoute(this, route), name, callback);
    },

    navigate: function (fragment, options) {
      return __WEBPACK_IMPORTED_MODULE_0_backbone___default.a.Router.prototype.navigate.call(this, getRoute(this, fragment), options);
    }
  }
));


/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__models_Model__ = __webpack_require__(11);



/**
 * @class SettingsModel
 * @extends {Okta.Model}
 * @private
 */

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1__models_Model__["default"].extend({
  local: function () {
    const settings = (window.okta && window.okta.settings) || {};

    return {
      orgId: ['string', false, settings.orgId],
      orgName: ['string', false, settings.orgName],
      serverStatus: ['string', false, settings.serverStatus],
      persona: ['string', false, settings.persona],
      isDeveloperConsole: ['boolean', false, settings.isDeveloperConsole],
      isPreview: ['boolean', false, settings.isPreview],
      permissions: ['array', true, settings.permissions || []]
    };
  },

  extraProperties: true,

  constructor: function () {
    this.features = window._features || [];
    __WEBPACK_IMPORTED_MODULE_1__models_Model__["default"].apply(this, arguments);
  },

  /**
   * Checks if the user have a feature flag enabled (Based of the org level feature flag)
   * @param  {String}  feature Feature name
   * @return {Boolean}
   */
  hasFeature: function (feature) {
    if (window._possibleFeatures
          && !__WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].contains(window._possibleFeatures, feature)
          && window.okta
          && window.okta.logHasFeatureError) {
      window.okta.logHasFeatureError(feature);
    }
    return __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].contains(this.features, feature);
  },

  /**
   * Checks if any of the given feature flags are enabled (Based of the org level feature flags)
   * @param  {Array}  featureArray Features names
   * @return {Boolean} true if any of the give features are enabled. False otherwise
   */
  hasAnyFeature: function (featureArray) {
    return __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].some(featureArray, this.hasFeature, this);
  },

  /**
   * Checks if the user have a specific permission (based on data passed from JSP)
   * @param  {String}  permission Permission name
   * @return {Boolean}
   */
  hasPermission: function (permission) {
    return __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].contains(this.get('permissions'), permission);
  }
}));


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;

// TODO: maybe replaced by
// https://github.com/Calvein/empty-module
// https://github.com/crimx/empty-module-loader
!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_backbone__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_backbone___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_backbone__);




var CHILDREN = '__children__',
    RENDERED = '__rendered__',
    PARENT = '__parent__',
    CHILD_DEFINITIONS = '__children_definitions__',
    ADD_TO_CONTAINER = '__add_to_container__';

function getIndex(container, view) {
  for (var i = 0; i < container[CHILDREN].length; i++) {
    if (view.cid === container[CHILDREN][i].cid) {
      return i;
    }
  }
}

function noop() { }

function doRender(view) {
  view[RENDERED] = true;

  var html = view.renderTemplate(view.template);
  if (html) {
    view.$el.html(html);
  }
  else if (view.length) {
    view.$el.empty();
  }

  view.each(function (view) {
    view[ADD_TO_CONTAINER]();
  });
}

function subscribeEvents(view) {
  var isEventPropertyRe = /^(?!(?:delegate|undelegate|_))([a-zA-Z0-9]+)(?:Events)$/;
  __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].allKeys(view), function (key) {
    var matchKeys = key.match(isEventPropertyRe);
    if (!matchKeys) {
      return;
    }
    var bindings = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(view, key),
        entity = view.options[matchKeys[1]] || view[matchKeys[1]];
    if (!entity || !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isObject(bindings) || !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(entity.trigger)) {
      return;
    }
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(bindings, function (callback, event) {
      var callbacks = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(callback) ? [callback] : __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].reduce(callback.split(/\s+/), function (arr, name) {
        if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(view[name])) {
          arr.push(view[name]);
        }
        return arr;
      }, []);
      __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(callbacks, function (cb) {
        view.listenTo(entity, event, cb);
      });
    });
  });
}

/**
   * A View operates on a string template, an token based template, or a model based template, with a few added hooks.
   * It provides a collection of child views, when a child view could be a View or another View.
   * Conceptually, if we were in a file system, the View is a folder, when the concrete child views are files,
   * and the child Views are sub folders.
   *
   * *Technically, when using a View as a container, it could have its own concrete logic,
   * but conceptually we like to keep it separated so a view is either a concrete view or a collection of child views.*
   *
   * In addition to the standard backbone options, we added `settings` and `state` as first class options.
   * it will automatically assign `options` to `this.options` as an instance member.
   *
   * See [Backbone.View](http://backbonejs.org/#View).
   *
   * @class src/framework/View
   * @extends external:Backbone.View
   * @param {Object} [options] options hash
   * @example
   * var DocumentView = Archer.View.extend({
   *   template: [
   *     '<header></header>',
   *     '<article></article>',
   *     '<footer></footer>'
   *   ].join(''),
   *   children: [[HeaderView, 'header'], [ContentView, 'article'], [FooterView, 'footer']]
   * });
   */
var View = __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.View.extend(/** @lends src/framework/View.prototype */ {

  /**
     * An object listing events and callback bind to this.{entity}
     * @name *Events
     * @memberof src/framework/View
     * @type {(Object|Function)}
     * @instance
     * @example
     * var FooView = View.extend({
     *   modelEvents: {
     *     'change:name': 'render'
     *   }
     * })
     * //equivalent to ==>
     * var FooView = View.extend({
     *   initialize: function() {
     *     this.listenTo(this.model, 'change:name', this.render);
     *   }
     * });
     *
     *
     * //Multiple callbacks:
     * var FooView = View.extend({
     *   modelEvents: {
     *     'change:name': 'render foo'
     *   },
     *   foo: function() {}
     * });
     *
     * //Callbacks As Function:
     * var FooView = View.extend({
     *   stateEvents: {
     *     'change': function() {
     *   }
     * });
     *
     * //Event Configuration As Function
     * var FooView = View.extend({
     *   collectionEvents: function() {
     *     var events = { 'change:name deleteItem': 'render' };
     *     events['changeItem'] = 'spin';
     *     events['addItem'] = function() {};
     *     return events;
     *   }
     * });
     */

  constructor: function (options) {
    /* eslint max-statements: [2, 17] */
    this.options = options || {};
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend(this, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].pick(this.options, 'state', 'settings'));

    // init per-instance children collection
    this[CHILDREN] = [];
    this[RENDERED] = false;
    this[PARENT] = null;
    this[CHILD_DEFINITIONS] = this.children;

    // we want to make sure initialize is triggered *after* we append the views from the `this.views` array
    var initialize = this.initialize;
    this.initialize = noop;

    __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.View.apply(this, arguments);

    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, CHILD_DEFINITIONS), function (childDefinition) {
      this.add.apply(this, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(childDefinition) ? childDefinition : [childDefinition]);
    }, this);
    delete this[CHILD_DEFINITIONS];

    if (this.autoRender && this.model) {
      var event = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(this.autoRender) ? __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].map(this.autoRender, function (field) {
        return 'change:' + field;
      }).join(' ') : 'change';
      this.listenTo(this.model, event, function () {
        this.render();
      });
    }

    this.initialize = initialize;
    this.initialize.apply(this, arguments);
    subscribeEvents(this);
  },

  /**
     * Unregister view from container
     * Note: this will not remove the view from the dom
     * and will not call the `remove` method on the view
     *
     * @param {src/framework/View} view the view to unregister
     * @private
     */
  unregister: function (view) {

    this.stopListening(view);
    var viewIndex = getIndex(this, view);
    // viewIndex is undefined when the view is not found (may have been removed)
    // check if it is undefined to prevent unexpected thing to happen
    // array.splice(undefined, x) removes the first x element(s) from the array
    // this protects us against issues when calling `remove` on a child view multiple times
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isNumber(viewIndex)) {
      this[CHILDREN].splice(viewIndex, 1);
    }
  },

  /**
     * Should we auto render the view upon model change. Boolean or array of field names to listen to.
     * @type {Boolean|Array}
     * @deprecated Instead, please use modelEvents
     * @example
     * modelEvents: {
     *   change:name: 'render'
     * }
     */
  autoRender: false,

  /**
     *
     * When the template is an underscore template, the render method will pass the options has to the template
     * And the associated model, if exists, when it will prefer the model over the options in case of a conflict.
     * {@link #render View.render}
     * @type {(String|Function)}
     * @example
     * var View = View.extend({
     *   template: '<p class="name">{{name}}</p>'
     * };
     */
  template: null,

  /**
     * A list of child view definitions to be passed to {@link #add this.add()}.
     * Note: these definitions will be added **before** the {@link #constructor initiliaze} method invokes.
     * @type {(Array|Function)}
     * @example
     * var Container = View.extend({
     *    template: '<p class="content"></p>',
     *    children: [
     *      [ContentView, '.content'],
     *      [OtherContentView, '.content'],
     *      OtherView
     *    ]
     *  })
     *
     * var Container = View.extend({
     *    template: '<dov class="form-wrap"></div>',
     *    children: function () {
     *      return [
     *        [FormView, '.form-wrap', {options: {model: this.optiosn.otherModel}}]
     *      ]
     *    }
     *  })
     */
  children: [],

  /**
     * Add a child view to the container.
     * If the container is already rendered, will also render the view  and append it to the DOM.
     * Otherwise will render and append once the container is rendered.
     *
     * *We believe that for the sake of encapsulation, a view should control its own chilren, so we treat this method as
     * protected and even though technically you can call `view.add` externally we strongly discourage it.*
     *
     * @param {(src/framework/View|String)} view A class (or an instance which is discouraged) of a View - or an HTML
     * string/template
     * @param {String} [selector] selector in the view's template on which the view will be added to
     * @param {Object} [options]
     * @param {Boolean} [options.bubble=false] Bubble (proxy) events from this view up the chain
     * @param {Boolean} [options.prepend=false] Prepend the view instend of appending
     * @param {String} [options.selector] Selector in the view's template on which the view will be added to
     * @param {Object} [options.options] Extra options to pass to the child constructor
     * @protected
     * @returns {src/framework/View} - The instance of itself for the sake of chaining
     * @example
     * var Container = View.extend({
     *
     *   template: [
     *     '<h1></h1>',
     *     '<section></section>',
     *   ].join(''),
     *
     *   initalize: function () {
     *
     *     this.add(TitleView, 'h1'); // will be added to <h1>
     *
     *     this.add(ContentView1, 'section'); // will be added to <section>
     *
     *     this.add(ContentView2, 'section', {prepend: true}); // will be add into <section> **before** ContentView1
     *
     *     this.add(OtherView, {
     *       options: {
     *         model: new Model()
     *       }
     *     }); // will be added **after** the <section> element
     *
     *     this.add('<p class="name">some html</p>'); //=> "<p class="name">some html</p>"
     *     this.add('<p class="name">{{name}}</p>'); //=> "<p class="name">John Doe</p>"
     *     this.add('{{name}}') //=> "<div>John Doe</div>"
     *     this.add('<span>{{name}}</span> w00t') //=> "<div><span>John Doe</span> w00t</div>"
     *   }
     *
     * });
     *
     * var container - new View({name: 'John Doe'});
     */
  add: function (view, selector, bubble, prepend, extraOptions) {
    /* eslint max-statements: [2, 28], complexity: [2, 9] */

    var options = {},
        args = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].toArray(arguments);

    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isObject(selector)) {
      options = selector;
      selector = options.selector;
      bubble = options.bubble;
      prepend = options.prepend;
      extraOptions = options.options;
    }
    else if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isObject(bubble)) {
      options = bubble;
      bubble = options.bubble;
      prepend = options.prepend;
      extraOptions = options.options;
    }

    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isString(view)) {
      view = (function (template) {
        return View.extend({
          constructor: function () {
            try {
              var $el = __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.$(template);

              if ($el.length != 1) { throw 'invalid Element'; }

              var unescapingRexExp = /&(\w+|#x\d+);/g;
              var elementUnescapedOuterHTMLLength = $el.prop('outerHTML').replace(unescapingRexExp, ' ').length;
              var templateUnescapedLength = template.replace(unescapingRexExp, ' ').length;

              if (elementUnescapedOuterHTMLLength !== templateUnescapedLength) { throw 'invalid Element'; }

              this.template = $el.html();
              this.el = $el.empty()[0];
            }
            catch (e) { // not a valid html tag.
              this.template = template;
            }
            View.apply(this, arguments);
          }
        });
      }(view));
    }

    if (view.prototype && view.prototype instanceof View) {
      /* eslint new-cap: 0 */
      var viewOptions = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].omit(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend({}, this.options, extraOptions), 'el');
      args[0] = new view(viewOptions);
      return this.add.apply(this, args);
    }

    // prevent dups
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isNumber(getIndex(this, view))) {
      throw new Error('Duplicate child');
    }

    view[PARENT] = this;

    // make the view responsible for adding itself to the parent:
    // * register the selector in the closure
    // * register a reference the parent in the closure
    view[ADD_TO_CONTAINER] = (function (selector) {
      return function () {
        if (selector && view[PARENT].$(selector).length != 1) {
          throw new Error('Invalid selector: ' + selector);
        }
        var $el = selector ? this[PARENT].$(selector) : this[PARENT].$el;
        this.render();
        // we need to delegate events in case
        // the view was added and removed before
        this.delegateEvents();

        // this[PARENT].at(index).$el.before(this.el);
        prepend ? $el.prepend(this.el) : $el.append(this.el);
      };
    }).call(view, selector);

    // if flag to bubble events is set
    // proxy all child view events
    if (bubble) {
      this.listenTo(view, 'all', function () {
        this.trigger.apply(this, arguments);
      });
    }

    // add to the dom if `render` has been called
    if (this.rendered()) {
      view[ADD_TO_CONTAINER]();
    }

    // add view to child views collection
    this[CHILDREN].push(view);

    return this;

  },

  /**
     * Remove all children from container
     */
  removeChildren: function () {
    this.each(function (view) {
      view.remove();
    });
    return this;
  },

  /**
     *  Removes a view from the DOM, and calls stopListening to remove any bound events that the view has listenTo'd.
     *  Also removes all childern of the view if any, and removes itself from its parent view(s)
     */
  remove: function () {
    this.removeChildren();
    if (this[PARENT]) {
      this[PARENT].unregister(this);
    }
    return __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.View.prototype.remove.apply(this, arguments);
  },

  /**
     * Compile the template to function you can apply tokens on on render time.
     * Uses the underscore tempalting engine by default
     * @protected
     * @param  {String} template
     * @return {Function} a compiled template
     */
  compileTemplate: function (template) {
    /* eslint  @okta/okta/no-specific-methods: 0*/
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].template(template);
  },

  /**
     * Render a template with `this.model` and `this.options` as parameters
     * preferring the model over the options.
     *
     * @param  {(String|Function)} template The template to build
     * @return {String} An HTML string
     * @protected
     */
  renderTemplate: function (template) {
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isString(template)) {
      template = this.compileTemplate(template);
    }
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(template)) {
      return template(this.getTemplateData());
    }
  },

  /**
     * The data hash passed to the compiled template
     * @return {Object}
     * @protected
     */
  getTemplateData: function () {
    var modelData = this.model && this.model.toJSON({ verbose: true }) || {};
    var options = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].omit(this.options, ['state', 'settings', 'model', 'collection']);
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults({}, modelData, options);
  },

  /**
     * Renders the template to `$el` and append all children in order
     * {@link #template View.template}
     */
  render: function () {
    this.preRender();
    doRender(this);
    this.postRender();
    return this;
  },

  /**
     * Pre render routine. Will be called right *before* the logic in {@link #render} is executed
     * @method
     */
  preRender: noop,

  /**
     * Post render routine. Will be called right *after* the logic in {@link #render} is executed
     * @method
     */
  postRender: noop,

  /**
     * Was this instance rendered
     */
  rendered: function () {
    return this[RENDERED];
  },

  /**
     * Get all direct child views.
     * @returns {src/framework/View[]}
     * @example
     * var container = View.extend({
     *   children: [View1, View2]
     * }).render();
     * container.getChildren() //=> [view1, view2];
     */
  getChildren: function () {
    return this.toArray();
  },

  /**
     * Get a child by index
     * @param {number} index
     * @returns {src/framework/View} The child view
     */
  at: function (index) {
    return this.getChildren()[index];
  },

  /**
     * Invokes a method on all children down the tree
     *
     * @param {String} method The method to invoke
     */
  invoke: function (methodName) {
    var args = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].toArray(arguments);
    this.each(function (child) {
      // if child has children, bubble down the tree
      if (child.size()) {
        child.invoke.apply(child, args);
      }
      // run the function on the child
      if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(child[methodName])) {
        child[methodName].apply(child, args.slice(1));
      }
    });
    return this;
  }
});

// Code borrowed from Backbone.js source
// Underscore methods that we want to implement on the Container.
var methods = ['each', 'map', 'reduce', 'reduceRight', 'find', 'filter', 'reject', 'every',
  'some', 'contains', 'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without',
  'indexOf', 'shuffle', 'lastIndexOf', 'isEmpty', 'chain', 'where', 'findWhere'];

__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(methods, function (method) {
  View.prototype[method] = function () {
    var args = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].toArray(arguments);
    args.unshift(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].toArray(this[CHILDREN]));
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"][method].apply(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"], args);
  };
}, this);

/**
   * See [_.each](http://underscorejs.org/#each)
   * @name each
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} iterator
   * @param {Object} [context]
   */
/**
   * See [_.map](http://underscorejs.org/#map)
   * @name map
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} iterator
   * @param {Object} [context]
   */
/**
   * See [_.reduce](http://underscorejs.org/#reduce)
   * @name reduce
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} iterator
   * @param {Mixed} memo
   * @param {Object} [context]
   */

/**
   * See [_.reduceRight](http://underscorejs.org/#reduceRight)
   * @name reduceRight
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} iterator
   * @param {Mixed} memo
   * @param {Object} [context]
   */
/**
   * See [_.find](http://underscorejs.org/#find)
   * @name find
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} predicate
   * @param {Object} [context]
   */
/**
   * See [_.filter](http://underscorejs.org/#filter)
   * @name filter
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} predicate
   * @param {Object} [context]
   */
/**
   * See [_.reject](http://underscorejs.org/#reject)
   * @name reject
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} predicate
   * @param {Object} [context]
   */
/**
   * See [_.every](http://underscorejs.org/#every)
   * @name every
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} [predicate]
   * @param {Object} [context]
   */
/**
   * See [_.some](http://underscorejs.org/#some)
   * @name some
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} [predicate]
   * @param {Object} [context]
   */
/**
   * See [_.contains](http://underscorejs.org/#contains)
   * @name contains
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Mixed} value
   */
/**
   * See [_.toArray](http://underscorejs.org/#toArray)
   * @name toArray
   * @memberof src/framework/View
   * @method
   * @instance
   */
/**
   * See [_.size](http://underscorejs.org/#size)
   * @name size
   * @memberof src/framework/View
   * @method
   * @instance
   */
/**
   * See [_.first](http://underscorejs.org/#first)
   * @name first
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Number} [n]
   */
/**
   * See [_.initial](http://underscorejs.org/#initial)
   * @name initial
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Number} [n]
   */
/**
   * See [_.last](http://underscorejs.org/#last)
   * @name last
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Number} [n]
   */
/**
   * See [_.rest](http://underscorejs.org/#rest)
   * @name rest
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Number} [index]
   */
/**
   * See [_.without](http://underscorejs.org/#without)
   * @name without
   * @memberof src/framework/View
   * @method
   * @instance
   */
/**
   * See [_.indexOf](http://underscorejs.org/#indexOf)
   * @name indexOf
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Mixed} value
   * @param {Boolean} [isSorted]
   */
/**
   * See [_.shuffle](http://underscorejs.org/#shuffle)
   * @name shuffle
   * @memberof src/framework/View
   * @method
   * @instance
   */
/**
   * See [_.shuffle](http://underscorejs.org/#lastIndexOf)
   * @name lastIndexOf
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Mixed} value
   * @param {Number} [fromIndex]
   */
/**
   * See [_.isEmpty](http://underscorejs.org/#isEmpty)
   * @name isEmpty
   * @memberof src/framework/View
   * @method
   * @instance
   */
/**
   * See [_.chain](http://underscorejs.org/#chain)
   * @name chain
   * @memberof src/framework/View
   * @method
   * @instance
   */
/**
   * See [_.where](http://underscorejs.org/#where)
   * @name where
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Object} properties
   */
/**
   * See [_.findWhere](http://underscorejs.org/#findWhere)
   * @name findWhere
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Object} properties
   */

/* harmony default export */ __webpack_exports__["a"] = (View);


/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__ = __webpack_require__(0);


function changeEventString(doWhen) {
  return 'change:' + __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].keys(doWhen).join(' change:');
}

function calcDoWhen(value, key) {
  const modelValue = this.model.get(key);

  if (__WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].isFunction(value)) {
    return value.call(this, modelValue);
  } else {
    return value === modelValue;
  }
}

function _doWhen(view, doWhen, fn) {
  const toggle = __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].bind(fn, view, view, doWhen);

  view.render = __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].wrap(view.render, function (render) {
    const val = render.call(view);

    toggle({ animate: false });
    return val;
  });

  view.listenTo(view.model, changeEventString(doWhen), function () {
    toggle({ animate: true });
  });
}

/* harmony default export */ __webpack_exports__["a"] = ({
  applyDoWhen: function (view, doWhen, fn) {
    if (!(view.model && __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].isObject(doWhen) && __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].size(doWhen) && __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].isFunction(fn))) {
      return;
    }
    _doWhen(view, doWhen, function (view, doWhen, options) {
      const result = __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].every(__WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].map(doWhen, calcDoWhen, view));

      fn.call(view, result, options);
    });
  }
});


/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__BaseView__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__helpers_FormUtil__ = __webpack_require__(10);



/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_1__BaseView__["default"].extend({
  className: 'o-form-button-bar',

  initialize: function (options) {
    this.addButton({
      type: 'save',
      text: __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].resultCtx(options, 'save', this),
      id: __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].resultCtx(options, 'saveId', this),
      className: __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].resultCtx(options, 'saveClassName', this)
    });

    if (!options.noCancelButton) {
      this.addButton({ type: 'cancel', text: __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].resultCtx(options, 'cancel', this) });
    }

    if (options.hasPrevStep) {
      this.addButton({ type: 'previous' }, { prepend: true });
    }
  },

  /**
   * Adds a buttomn to the toolbar
   * @param {Object} params button parameters
   * @param {Object} options {@link Okta.View#add} options
   */
  addButton: function (params, options) {
    return this.add(__WEBPACK_IMPORTED_MODULE_2__helpers_FormUtil__["default"].createButton(params), options);
  }
}));


/***/ }),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);

const registry = {};

function isBaseInput(input) {
  if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(input)) {
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(input.prototype.editMode) && __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(input.prototype.readMode);
  } else {
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isObject(input) && __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(input.editMode) && __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(input.readMode);
  }
}

/**
 * @class module:Okta.internal.views.forms.helpers.InputRegistry
 */
/* harmony default export */ __webpack_exports__["default"] = ({
  isBaseInput: isBaseInput,

  /**
   * Register a form input
   * @param {String} type string identifier for the input
   * @param {BaseInput} input the input to register
   */
  register: function (type, input) {
    registry[type] = input;
  },

  /**
   * Get a form input by type
   * @param {Object} options input definition
   * @param {String} options.type string identifier for the input
   * @return {BaseInput} a matching input
   */
  get: function (options) {
    const input = registry[options.type];

    return input && (isBaseInput(input) ? input : input(options));
  },

  /**
   * Unregister an input type
   * @param {String} type
   */
  unregister: function (type) {
    delete registry[type];
  }
});


/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = require("qtip");

/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util_Keys__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__util_TemplateUtil__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vendor_plugins_chosen_jquery__ = __webpack_require__(67);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vendor_plugins_chosen_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_vendor_plugins_chosen_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__BaseInput__ = __webpack_require__(9);






const template = __WEBPACK_IMPORTED_MODULE_3__util_TemplateUtil__["default"].tpl('<select id="{{inputId}}" name="{{name}}"></select>');
const option = __WEBPACK_IMPORTED_MODULE_3__util_TemplateUtil__["default"].tpl('<option value="{{key}}">{{value}}</option>');
const CHOSEN_WINDOW_MARGIN = 20;

// Chosen has known problems when it's at the bottom of a container that has
// overflow:hidden set. Because it attaches to the parent container, its
// dropdown will be cut off in the UI. Any modal with a chosen select element
// at the bottom will manifest this behavior.
//
// The fix (aside from replacing Chosen) is to change Chosen's behavior -
// use the existing styles, but attach it to 'body' and position it correctly
// so that it is not affected by a parent overflow.
//
// More details can be found in OKTA-46489, OKTA-83570

const CHOSEN_MAX_HEIGHT = 240;
const CHOSEN_Z_INDEX = 50000;

function defer(fn) {
  if (this.params.autoWidth) {
    return fn.call(this);
  } else {
    return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].defer(__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].bind(fn, this));
  }
}

function findSelectWidth(self) {
  self.$select.hide();
  const select = Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])(self.$select[0]).hide();

  Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])('body').append(select);
  const width = (self.params.width = select.width() * 1.2 + 'px');

  self.$el.append(select.show());
  return width;
}

function recalculateChosen($chosen, $results, $clone) {
  const offset = $clone.offset();

  $chosen.css({
    left: offset.left,
    top: offset.top
  });
  // Update the max-height to fit within the constraints of the window. This
  // is especially important for modals because page scrolling is disabled.
  const $win = Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])(window);
  const rHeight = $results.outerHeight();
  const rBottom = rHeight + $results.offset().top - $win.scrollTop();
  const wHeight = $win.height() - CHOSEN_WINDOW_MARGIN;
  const maxHeight = Math.min(rHeight + wHeight - rBottom, CHOSEN_MAX_HEIGHT);

  $results.css('max-height', maxHeight);
}

function fixChosenModal($select) {
  const $chosen = $select.next('.chzn-container');
  const $clone = $chosen.clone();
  const $results = $chosen.find('.chzn-results');

  // Use a hidden clone to maintain layout and calculate offset. This is
  // necessary for more complex layouts (like adding a group rule) where
  // the chosen element is floated.
  $clone.css('visibility', 'hidden');
  $clone.removeAttr('id');
  $clone.find('li').removeAttr('id');

  // Save the original styles - we'll revert to them when the select closes
  const baseStyles = {
    left: $chosen.css('left'),
    top: $chosen.css('top'),
    position: $chosen.css('position'),
    float: $chosen.css('float'),
    'z-index': $chosen.css('z-index')
  };

  $results.hide();

  // Handler for any resize events that happen when the results list is open

  const resizeHandler = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].debounce(function () {
    recalculateChosen($chosen, $results, $clone);
  }, 10);

  // When the dropdown opens, attach it to body, with the correct absolute
  // position coordinates
  $select.off('.fixChosen'); // Remove events we could have added before
  $select.on('liszt:showing_dropdown.fixChosen', function () {
    $chosen.width($chosen.width());
    $select.after($clone);
    // .chzn-container can trigger the vertical scrollbar if it causes scrollHeight > window height after append to
    // the body. Force top -999999 to avoid the scrollbar so $chosen can find the right offset for relocation.
    $chosen.css({
      position: 'absolute',
      float: 'none',
      'z-index': CHOSEN_Z_INDEX,
      top: -999999
    });
    Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])('body').append($chosen);
    $results.show();
    recalculateChosen($chosen, $results, $clone);
    // Capture scroll events:
    // - for forms that use fixed positioning (like editing attributes in
    //   Profile Editor) - window scroll
    // - for forms that are too long for the modal - o-form-content scroll
    $select.parents().scroll(resizeHandler);
    Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])(window).on('resize scroll', resizeHandler);
  });

  // When the dropdown closes or the element is removed, revert to the
  // original styles and reattach it to its original placement in the dom.
  $select.on('liszt:hiding_dropdown.fixChosen remove.fixChosen', function () {
    $select.parents().off('scroll', resizeHandler);
    Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])(window).off('resize scroll', resizeHandler);
    $chosen.css(baseStyles);
    $results.hide();
    $results.css('max-height', CHOSEN_MAX_HEIGHT);
    $clone.remove();
    $select.after($chosen);
  });
}

/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_5__BaseInput__["a" /* default */].extend({
  className: 'o-form-select',

  /**
   * @Override
   */
  events: {
    'change select': 'update',
    'keyup .chzn-search > :text': function (e) {
      if (__WEBPACK_IMPORTED_MODULE_2__util_Keys__["default"].isEsc(e)) {
        this.$('.chzn-search > :text').val('');
        e.stopPropagation();
      }
    }
  },

  constructor: function () {
    this.template = template;
    this.option = option;
    __WEBPACK_IMPORTED_MODULE_5__BaseInput__["a" /* default */].apply(this, arguments);
    this.params = this.options.params || {};
  },

  /**
   * @Override
   */
  editMode: function () {
    /* eslint max-statements: [2, 13] */

    this.$el.html(template(this.options));
    this.$select = this.$('select');

    const options = this.getOptions();

    __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].each(
      options,
      function (value, key) {
        this.$select.append(option({ key: key, value: value }));
      },
      this
    );

    // Fix a regression in jQuery 1.x on Firefox
    // jQuery.val(value) prepends an empty option to the dropdown
    // if value doesnt exist in the dropdown.
    // http://bugs.jquery.com/ticket/13514
    const value = this.getModelValue();

    if (value) {
      this.$select.val(value);
    } else {
      this.$('option:first-child').prop('selected', true);
    }
    this.$el.addClass('o-form-control');

    if (this.params.chosen !== false) {
      this.__applyChosen();
    }
    return this;
  },

  __applyChosen: function (update) {
    let width = this.options.wide ? '100%' : this.params.width || '62%';

    if (this.params.autoWidth) {
      width = findSelectWidth(this);
    }

    defer.call(this, function () {
      const searchThreshold = this.getParam('searchThreshold', 10);

      if (!__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this.options, 'autoRender') && update !== false) {
        this.update();
      }
      this.$select.chosen({
        width: width,
        disable_search_threshold: searchThreshold, //eslint-disable-line camelcase
        placeholder_text: this.options['placeholder'], //eslint-disable-line camelcase
        search_contains: true //eslint-disable-line camelcase
      });
      fixChosenModal(this.$select);

      if (this.params.autoWidth) {
        // fix a chosen css bug
        this.$el.width(0);
      }

      this.model.trigger('form:resize');
    });
  },

  /**
   * @Override
   */
  val: function () {
    return this.$select && this.$select.val();
  },

  /**
   * @Override
   */
  focus: function () {
    if (this.$select) {
      return this.$select.focus();
    }
  },

  /**
   * @Override
   */
  toStringValue: function () {
    const selectedOption = this.getModelValue();
    let displayString = selectedOption;
    const options = this.getOptions();

    if (!__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isEmpty(options)) {
      displayString = options[selectedOption];
    }
    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isUndefined(displayString)) {
      displayString = this.defaultValue();
    }
    return displayString || '';
  },

  /**
   * Convert options to an object
   * support input options that is a
   * 1. a static object such as {key1: val1, key2: val2...}
   * 2. a function to be called to return a static object
   * will return an object with key-value pairs or with empty content
   * @return {Object} The value
   */
  getOptions: function () {
    let options = this.options.options;

    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(options)) {
      options = options.call(this);
    }

    return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isObject(options) ? options : {};
  },

  remove: function () {
    if (this.$select) {
      this.$select.trigger('remove');
    }
    return __WEBPACK_IMPORTED_MODULE_5__BaseInput__["a" /* default */].prototype.remove.apply(this, arguments);
  }
}));


/***/ }),
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_Time__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__BaseView__ = __webpack_require__(1);




function getOption(callout, option) {
  return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].resultCtx(callout.options, option, callout) || __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(callout, option);
}

function getTopClass(callout) {
  let klass = 'infobox clearfix infobox-' + getOption(callout, 'type');

  switch (getOption(callout, 'size')) {
  case 'standard':
    klass += '';
    break;
  case 'slim':
    klass += ' infobox-slim';
    break;
  case 'compact':
    klass += ' infobox-compact';
    break;
  case 'large':
    klass += ' infobox-md';
    break;
  }
  if (getOption(callout, 'dismissible')) {
    klass += ' infobox-dismiss';
  }
  return klass;
}

const events = {
  'click .infobox-dismiss-link': function (e) {
    e.preventDefault();
    this.$el.fadeOut(__WEBPACK_IMPORTED_MODULE_1__util_Time__["a" /* default */].UNLOADING_FADE, () => {
      this.trigger('dismissed');
      this.remove();
    });
  }
};
const template =
  '\
    {{#if dismissible}}\
      <a data-se="dismiss-link" class="infobox-dismiss-link" title="Dismiss" href="#">\
        <span data-se="icon" class="dismiss-icon"></span>\
      </a>\
    {{/if}}\
    <span data-se="icon" class="icon {{icon}}"></span>\
    {{#if title}}<h3 data-se="header">{{title}}</h3>{{/if}}\
    {{#if subtitle}}<p data-se="sub-header">{{subtitle}}</p>{{/if}}\
    {{#if bullets}}\
      <ul data-se="list" class="bullets">\
      {{#each bullets}}<li data-se="list-item">{{this}}</li>{{/each}}\
      </ul>\
    {{/if}}\
  ';
const CalloutCallout = __WEBPACK_IMPORTED_MODULE_2__BaseView__["default"].extend(
  /** @lends src/views/components/Callout.prototype */ {
    attributes: {
      'data-se': 'callout'
    },

    /**
     * Custom HTML or view to inject to the callout
     * @type {String|Okta.View}
     */
    content: null,

    /**
     * Size of icon. options are standard, large, compact
     * @type {String}
     */
    size: 'standard',

    /**
     * Type of the callout. Valid values are: info, success, warning, error, tip
     * @type {String}
     */
    type: 'info',

    /**
     * Can the callout be dismissed
     * @type {Boolean}
     */
    dismissible: false,

    /**
     * Callout title
     * @type {String}
     */
    title: null,

    /**
     * Callout subtitle
     * @type {String}
     */
    subtitle: null,

    /**
     * Array of strings to render as bullet points
     * @type {Array}
     */
    bullets: null,

    /**
     * Fired after the callout is dismised - applies when
     * {@link module:Okta.internal.views.components.Callout|dismissible} is set to true
     * @event src/views/components/Callout#dismissed
     */

    constructor: function () {
      this.events = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults(this.events || {}, events);

      __WEBPACK_IMPORTED_MODULE_2__BaseView__["default"].apply(this, arguments);

      this.$el.addClass(getTopClass(this));

      this.template = template;

      const content = getOption(this, 'content');

      if (content) {
        this.add(content);
      }
    },

    getTemplateData: function () {
      let icon = getOption(this, 'type');

      const size = getOption(this, 'size');
      if (icon === 'tip') {
        // css is inconsistent
        icon = 'light-bulb';
      }
      switch (size) {
      case 'slim':
        icon = '';
        break;
      case 'large':
        icon = [icon, '-', '24'].join('');
        break;
      default:
        icon = [icon, '-', '16'].join('');
      }
      return {
        icon,
        title: getOption(this, 'title'),
        subtitle: getOption(this, 'subtitle'),
        bullets: getOption(this, 'bullets'),
        dismissible: getOption(this, 'dismissible')
      };
    }
  }
);

/**
 * @class src/views/components/Callout
 * @extends module:Okta.View
 */

/**
 * @class module:Okta.internal.views.components.Callout
 */
/* harmony default export */ __webpack_exports__["default"] = ({
  /**
   * Creates a {@link src/views/components/Callout|Callout}.
   * @static
   * @param {Object} options
   * @param {String|Function} [options.size] Size of icon. options are standard, large, compact, slim
   * @param {String|Okta.View} [options.content] Custom HTML or view to inject to the callout
   * @param {String|Function} [options.title] Callout title
   * @param {String|Function} [options.subtitle] Callout subtitle
   * @param {Array|Function} [options.bullets] Array of strings to render as bullet points
   * @param {Boolean|Function} [options.dismissible] Can the callout be dismissed
   * @param {String|Function} [options.type] Callout type. Valid values are: info, success, warning, error, tip
   *
   * @return {src/views/components/Callout}
   */
  create: function (options) {
    return new CalloutCallout(options);
  }
});


/***/ }),
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ({
  DEBOUNCE_DELAY: 200,
  LOADING_FADE: 400,
  UNLOADING_FADE: 400,
  ROW_EXPANDER_TRANSITION: 150,
  HIDE_ADD_MAPPING_FORM: 300
});


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * There are following local modifications:
 * - Author: Uzi Kilon ukilon@okta.com
 *   Bug: OKTA-20830 - solves the conflict when there are multiple labels
 */
/**
 * --------------------------------------------------------------------
 * jQuery customInput plugin
 * Author: Maggie Costello Wachs maggie@filamentgroup.com, Scott Jehl, scott@filamentgroup.com
 * Copyright (c) 2009 Filament Group
 * licensed under MIT (filamentgroup.com/examples/mit-license.txt)
 * --------------------------------------------------------------------
*/
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(12)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (jQuery) {
  var $ = jQuery;
  jQuery.fn.customInput = function(){
    return $(this).each(function(){
      if($(this).is('[type=checkbox],[type=radio]')){
        var input = $(this);

        // get the associated label using the input's id
        var label = input.siblings('label[for="'+input.attr('id')+'"]:first');
        if (!label.length) {
          label = input.closest('label[for="'+input.attr('id')+'"]:first');
        }
        // wrap the input + label in a div
        input.add(label).wrapAll('<div class="custom-'+ input.attr('type') +'"></div>');

        // necessary for browsers that don't support the :hover pseudo class on labels
        label.hover(
          function(){ $(this).addClass('hover'); },
          function(){ $(this).removeClass('hover'); }
        );

        //bind custom event, trigger it, bind click,focus,blur events
        input.bind('updateState', function(){
          input.is(':checked') ? label.addClass('checked') : label.removeClass('checked checkedHover checkedFocus');
        })
        .trigger('updateState')
        .click(function(){
          $('input[name="'+ $(this).attr('name') +'"]').trigger('updateState');
        })
        .focus(function(){
          label.addClass('focus');
          if(input.is(':checked')){  $(this).addClass('checkedFocus'); }
        })
        .blur(function(){ label.removeClass('focus checkedFocus'); });
      }
    });
  };

}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 32 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_qtip__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_qtip___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_qtip__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util_Keys__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__util_TemplateUtil__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vendor_plugins_jquery_placeholder__ = __webpack_require__(72);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_vendor_plugins_jquery_placeholder___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_vendor_plugins_jquery_placeholder__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__BaseInput__ = __webpack_require__(9);






const className = 'okta-form-input-field input-fix';

function hasTitleAndText(options) {
  const title = options.title;
  const text = options.text;

  return title && text && title !== text;
}

// options may be a string or an object.
function createQtipContent(options) {
  if (hasTitleAndText(options)) {
    return options;
  }
  return { text: options.text || options };
}

/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_5__BaseInput__["a" /* default */].extend({
  template: __WEBPACK_IMPORTED_MODULE_3__util_TemplateUtil__["default"].tpl(
    '\
      {{#if params.innerTooltip}}\
        <span class="input-tooltip icon form-help-16"></span>\
      {{/if}}\
      {{#if params.icon}}\
        <span class="icon input-icon {{params.icon}}"></span>\
      {{/if}}\
      <input type="{{type}}" placeholder="{{placeholder}}" name="{{name}}" id="{{inputId}}"\
       value="{{value}}" aria-label="{{placeholder}}" autocomplete="off"/>\
      {{#if params.iconDivider}}\
        <span class="input-icon-divider"></span>\
      {{/if}}\
      '
  ),
  /**
   * @Override
   */
  events: {
    'input input': 'update',
    'change input': 'update',
    'keydown input': 'update',
    'keyup input': function (e) {
      if (__WEBPACK_IMPORTED_MODULE_2__util_Keys__["default"].isEnter(e)) {
        this.model.trigger('form:save');
      } else if (__WEBPACK_IMPORTED_MODULE_2__util_Keys__["default"].isEsc(e)) {
        this.model.trigger('form:cancel');
      }
    }
  },

  constructor: function () {
    __WEBPACK_IMPORTED_MODULE_5__BaseInput__["a" /* default */].apply(this, arguments);
    this.$el.addClass('o-form-control');
  },

  /**
   * @Override
   */
  editMode: function () {
    this.$el.addClass(className);
    __WEBPACK_IMPORTED_MODULE_5__BaseInput__["a" /* default */].prototype.editMode.apply(this, arguments);
    this.$('input').placeholder();
  },

  /**
   * @Override
   */
  readMode: function () {
    __WEBPACK_IMPORTED_MODULE_5__BaseInput__["a" /* default */].prototype.readMode.apply(this, arguments);
    if (this.options.type === 'password') {
      this.$el.text('********');
    }
    this.$el.removeClass(className);
  },

  /**
   * @Override
   */
  val: function () {
    let inputValue = this.$('input[type="' + this.options.type + '"]').val();
    //IE will only read clear text pw if type="password" is explicitly in selector

    if (this.options.type !== 'password') {
      inputValue = __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"].trim(inputValue);
    }
    return inputValue;
  },

  /**
   * @Override
   */
  focus: function () {
    return this.$('input').focus();
  },

  postRender: function () {
    const params = this.options.params;
    let content;

    if (params && params.innerTooltip) {
      content = createQtipContent(params.innerTooltip);
      this.$('.input-tooltip').qtip({
        content: content,
        style: { classes: 'okta-tooltip qtip-custom qtip-shadow' },
        position: {
          my: 'bottom left',
          // Note: qTip2 has a known issue calculating the tooltip offset when:
          // 1. A container element has both:
          //    a) position: relative/absolute
          //    b) overlay: value other than 'visible'
          // 2. The page is scrolled
          //
          // We set position:relative and overlay:auto on the body element,
          // where both are required for:
          // - Positioning the footer correctly
          // - Displaying long pages in embedded browsers
          //
          // The original design called for a fixed position relative to the
          // tooltip icon - this has been switched to "relative to mouse, and
          // update position when mouse moves" because of this constraint.
          target: 'mouse',
          adjust: {
            method: 'flip',
            mouse: true,
            y: -5,
            x: 5
          },
          viewport: Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])('body')
        }
      });
    }
  }
}));


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(34);


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _BaseCollection = __webpack_require__(14);

var _BaseCollection2 = _interopRequireDefault(_BaseCollection);

var _BaseModel = __webpack_require__(15);

var _BaseModel2 = _interopRequireDefault(_BaseModel);

var _BaseSchema = __webpack_require__(38);

var _BaseSchema2 = _interopRequireDefault(_BaseSchema);

var _Model = __webpack_require__(11);

var _Model2 = _interopRequireDefault(_Model);

var _SchemaProperty = __webpack_require__(18);

var _SchemaProperty2 = _interopRequireDefault(_SchemaProperty);

var _BaseController = __webpack_require__(40);

var _BaseController2 = _interopRequireDefault(_BaseController);

var _BaseRouter = __webpack_require__(20);

var _BaseRouter2 = _interopRequireDefault(_BaseRouter);

var _ButtonFactory = __webpack_require__(16);

var _ButtonFactory2 = _interopRequireDefault(_ButtonFactory);

var _Class = __webpack_require__(44);

var _Class2 = _interopRequireDefault(_Class);

var _Cookie = __webpack_require__(45);

var _Cookie2 = _interopRequireDefault(_Cookie);

var _Keys = __webpack_require__(8);

var _Keys2 = _interopRequireDefault(_Keys);

var _Logger = __webpack_require__(7);

var _Logger2 = _interopRequireDefault(_Logger);

var _StringUtil = __webpack_require__(3);

var _StringUtil2 = _interopRequireDefault(_StringUtil);

var _TemplateUtil = __webpack_require__(4);

var _TemplateUtil2 = _interopRequireDefault(_TemplateUtil);

var _Util = __webpack_require__(17);

var _Util2 = _interopRequireDefault(_Util);

var _handlebarsWrapper = __webpack_require__(47);

var _handlebarsWrapper2 = _interopRequireDefault(_handlebarsWrapper);

var _jqueryWrapper = __webpack_require__(2);

var _jqueryWrapper2 = _interopRequireDefault(_jqueryWrapper);

var _underscoreWrapper = __webpack_require__(0);

var _underscoreWrapper2 = _interopRequireDefault(_underscoreWrapper);

var _Backbone = __webpack_require__(54);

var _Backbone2 = _interopRequireDefault(_Backbone);

var _BaseView = __webpack_require__(1);

var _BaseView2 = _interopRequireDefault(_BaseView);

var _BaseDropDown = __webpack_require__(56);

var _BaseDropDown2 = _interopRequireDefault(_BaseDropDown);

var _BaseForm = __webpack_require__(57);

var _BaseForm2 = _interopRequireDefault(_BaseForm);

var _Toolbar = __webpack_require__(25);

var _Toolbar2 = _interopRequireDefault(_Toolbar);

var _FormUtil = __webpack_require__(10);

var _FormUtil2 = _interopRequireDefault(_FormUtil);

var _InputRegistry = __webpack_require__(26);

var _InputRegistry2 = _interopRequireDefault(_InputRegistry);

var _SchemaFormFactory = __webpack_require__(65);

var _SchemaFormFactory2 = _interopRequireDefault(_SchemaFormFactory);

var _CheckBox = __webpack_require__(70);

var _CheckBox2 = _interopRequireDefault(_CheckBox);

var _PasswordBox = __webpack_require__(71);

var _PasswordBox2 = _interopRequireDefault(_PasswordBox);

var _Radio = __webpack_require__(73);

var _Radio2 = _interopRequireDefault(_Radio);

var _Select = __webpack_require__(28);

var _Select2 = _interopRequireDefault(_Select);

var _InputGroup = __webpack_require__(74);

var _InputGroup2 = _interopRequireDefault(_InputGroup);

var _TextBox = __webpack_require__(32);

var _TextBox2 = _interopRequireDefault(_TextBox);

var _Callout = __webpack_require__(29);

var _Callout2 = _interopRequireDefault(_Callout);

var _backbone = __webpack_require__(6);

var _backbone2 = _interopRequireDefault(_backbone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Okta = {
  Backbone: _backbone2.default,

  $: _jqueryWrapper2.default,

  _: _underscoreWrapper2.default,

  Handlebars: _handlebarsWrapper2.default,

  loc: _StringUtil2.default.localize,

  createButton: _ButtonFactory2.default.create,

  createCallout: _Callout2.default.create,

  registerInput: _InputRegistry2.default.register,

  tpl: _TemplateUtil2.default.tpl,

  Model: _Model2.default,

  BaseModel: _BaseModel2.default,

  Collection: _BaseCollection2.default,

  View: _BaseView2.default,

  ListView: _Backbone2.default,

  Router: _BaseRouter2.default,

  Controller: _BaseController2.default,

  Form: _BaseForm2.default,

  internal: {
    util: {
      Util: _Util2.default,
      Cookie: _Cookie2.default,
      Logger: _Logger2.default,
      Class: _Class2.default,
      Keys: _Keys2.default
    },

    views: {
      components: {
        BaseDropDown: _BaseDropDown2.default
      },

      forms: {
        helpers: {
          FormUtil: _FormUtil2.default,
          SchemaFormFactory: _SchemaFormFactory2.default
        },

        components: {
          Toolbar: _Toolbar2.default
        },

        inputs: {
          TextBox: _TextBox2.default,
          PasswordBox: _PasswordBox2.default,
          CheckBox: _CheckBox2.default,
          Radio: _Radio2.default,
          Select: _Select2.default,
          InputGroup: _InputGroup2.default
        }
      }
    },

    models: {
      BaseSchema: _BaseSchema2.default,
      SchemaProperty: _SchemaProperty2.default
    }
  }
};

Okta.registerInput('text', _TextBox2.default);
Okta.registerInput('password', _PasswordBox2.default);
Okta.registerInput('checkbox', _CheckBox2.default);
Okta.registerInput('radio', _Radio2.default);
Okta.registerInput('select', _Select2.default);
Okta.registerInput('group', _InputGroup2.default);

module.exports = Okta;

/***/ }),
/* 35 */
/***/ (function(module, exports) {

module.exports = require("underscore");

/***/ }),
/* 36 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_backbone__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_backbone___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_backbone__);




var STATE = '__STATE__',
    FETCH_DATA = 'FETCH_DATA',
    PAGINATION_DATA = 'PAGINATION_DATA',
    DEFAULT_PARAMS = 'DEFAULT_PARAMS',
    LINK_BY_HEADER = 'LINK_BY_HEADER',
    XHR = 'XHR';

/*
 * Sets the next page URL on the collection from link headers
 * See: http://www.rfc-editor.org/rfc/rfc5988.txt
 *
 * This method is looking for a link header with `rel="next"`
 * An set's it as the next page's URL.
 *
 * If it doesn't find a next page, and current page is set by a link header
 * it assumes we are at the last page and deletes the current `next`
 */
function setLinkHeadersPagination(collection, xhr) {
  try {
    var links = parseLinkHeader(xhr.getResponseHeader('link'));
    collection[STATE].set(LINK_BY_HEADER, true);
    collection.setPagination(links['next'].href);
  }
  catch (e) {
    if (collection[STATE].get(LINK_BY_HEADER)) {
      collection.setPagination(null);
    }
  }
}

function parseQuery(url) {
  var params = {},
      rawQueryStr = url && url.split('?')[1],
      queryString = rawQueryStr && decodeURIComponent(rawQueryStr.split('#')[0]).replace(/\+/g, ' '),
      props = queryString ? queryString.split('&') : [];
  for (var i = 0; i < props.length; i++) {
    var parts = props[i].split('=');
    params[parts.shift()] = parts.join('=');
  }
  return params;
}

// ################################################
// # Source: https://gist.github.com/deiu/9335803
// ################################################

// unquote string (utility)
function unquote(value) {
  if (value.charAt(0) == '"' && value.charAt(value.length - 1) == '"') {
    return value.substring(1, value.length - 1);
  }
  return value;
}
/*
parse a Link header
Link:<https://example.org/.meta>; rel=meta
var r = parseLinkHeader(xhr.getResponseHeader('Link');
r['meta']['href'] outputs https://example.org/.meta
*/
function parseLinkHeader(header) {
  /* eslint max-statements: 0 */
  var linkexp = /<[^>]*>\s*(\s*;\s*[^()<>@,;:"/[\]?={} \t]+=(([^()<>@,;:"/[\]?={} \t]+)|("[^"]*")))*(,|$)/g,
      paramexp = /[^()<>@,;:"/[\]?={} \t]+=(([^()<>@,;:"/[\]?={} \t]+)|("[^"]*"))/g;

  var matches = header.match(linkexp);
  var rels = {};
  for (var i = 0; i < matches.length; i++) {
    var split = matches[i].split('>');
    var href = split[0].substring(1);
    var link = {};
    link.href = href;
    var s = split[1].match(paramexp);
    for (var j = 0; j < s.length; j++) {
      var paramsplit = s[j].split('=');
      var name = paramsplit[0];
      link[name] = unquote(paramsplit[1]);
    }

    if (link.rel !== undefined) {
      rels[link.rel] = link;
    }
  }

  return rels;
}

// ################################################
// # /Source
// ################################################
//

/**
 *
 * Archer.Collection is a standard [Backbone.Collection](http://backbonejs.org/#Collection) with pre-set `data`
 * parameters and built in pagination - works with [http link headers](https://tools.ietf.org/html/rfc5988)
 * out of the box:
 *
 * @class src/framework/Collection
 * @extends external:Backbone.Collection
 * @example
 * var Users = Archer.Collection.extend({
 *   url: '/api/v1/users'
 *   params: {expand: true}
 * });
 * var users = new Users(null, {params: {type: 'new'}}),
 *     $button = this.$('a.fetch-more');
 *
 * $button.click(function () {
 *   users.fetchMore();
 * });
 *
 * this.listenTo(users, 'sync', function () {
 *   $button.toggle(users.hasMore());
 * });
 *
 * collection.fetch(); //=> '/api/v1/users?expand=true&type=new'
 */

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1_backbone___default.a.Collection.extend(/** @lends src/framework/Collection.prototype */ {

  /**
   * Default fetch parameters
   * @type {Object}
   */
  params: {},

  constructor: function (models, options) {
    var state = this[STATE] = new __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.Model();
    state.set(DEFAULT_PARAMS, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults(options && options.params || {}, this.params || {}));
    __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.Collection.apply(this, arguments);
  },

  /**
   * See [Backbone Collection.sync](http://backbonejs.org/#Collection-sync).
   */
  sync: function (method, collection, options) {
    var self = this,
        success = options.success;
    options.success = function (resp, status, xhr) {
      // its important to set the pagination data *before* we call the success callback
      // because we want the pagination data to be ready when the collection triggers the `sync` event
      setLinkHeadersPagination(self, xhr);
      success.apply(null, arguments);
    };
    return __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.Collection.prototype.sync.call(this, method, collection, options);
  },

  /**
   * See [Backbone Collection.fetch](http://backbonejs.org/#Collection-fetch).
   */
  fetch: function (options) {
    options || (options = {});
    var state = this[STATE],
        xhr = state.get(XHR);

    options.data = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend({}, state.get(DEFAULT_PARAMS), options.data || {});
    options.fromFetch = true;

    state.set(FETCH_DATA, options.data);
    if (xhr && xhr.abort && options.abort !== false) {
      xhr.abort();
    }
    xhr = __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.Collection.prototype.fetch.call(this, options);
    state.set(XHR, xhr);
    return xhr;
  },

  /**
   * Set pagination data to get to the next page
   * @param {Mixed} params
   * @param {Object} [options]
   * @param {Boolean} [options.fromFetch] should we include data from the previous fetch call in this object
   * @example
   * collection.setPagination({q: 'foo', page: '2'}); //=> {q: 'foo', page: '2'}
   *
   * collection.setPagination('/path/to/resource?q=baz&page=4'); //=> {q: 'baz', page: '4'}
   *
   * collection.setPagination('/path/to/resource'); //=> {}
   *
   * collection.fetch({data: {q: 'foo'}});
   * collection.setPagination({page: 2}, {fromFetch: true}); //=> {q: 'foo', page: 2}
   *
   * any "falsy" value resets pagination
   * collection.setPagination(); //=> {}
   * collection.setPagination(null); //=> {}
   * collection.setPagination(false); //=> {}
   * collection.setPagination(''); //=> {}
   * collection.setPagination(0); //=> {}
   * @protected
   */
  setPagination: function (params, options) {
    /* eslint complexity: [2, 8] */
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isString(params) && params) {
      params = parseQuery(params);
    }
    if (!__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isObject(params) || __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(params) || !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].size(params)) {
      params = null;
    }
    else if (options && options.fromFetch) {
      params = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend({}, this.getFetchData(), params);
    }
    this[STATE].set(PAGINATION_DATA, params);
  },

  /**
   * Returns the `data` parameters applied in th most recent `fetch` call
   * It will include parameters set by {@link #params} and optios.params passed to the constructor
   * @return {Object}
   * @protected
   */
  getFetchData: function () {
    return this[STATE].get(FETCH_DATA) || {};
  },

  /**
   * Data object for constructing a request to fetch the next page
   * @return {Object}
   * @protected
   */
  getPaginationData: function () {
    return this[STATE].get(PAGINATION_DATA) || {};
  },

  /**
   * Does this collection have more data on the server (e.g is there a next "page")
   * @return {Boolean}
   */
  hasMore: function () {
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].size(this.getPaginationData()) > 0;
  },

  /**
   * Get the next page from the server
   * @return {Object} xhr returned by {@link #fetch}
   */
  fetchMore: function () {
    if (!this.hasMore()) {
      throw new Error('Invalid Request');
    }
    return this.fetch({ data: this.getPaginationData(), add: true, remove: false, update: true });
  },

  /**
   * See [Backbone Collection.reset](http://backbonejs.org/#Collection-reset).
   */
  reset: function (models, options) {
    options || (options = {});
    // only reset the pagination when reset is being called explicitly.
    // this is to avoid link headers pagination being overriden and reset when
    // fetching the collection using `collection.fetch({reset: true})`
    if (!options.fromFetch) {
      this.setPagination(null);
    }
    return __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.Collection.prototype.reset.apply(this, arguments);
  },

  // we want "where" to be able to search through derived properties as well
  where: function (attrs, first) {
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isEmpty(attrs)) {
      return first ? void 0 : [];
    }
    return this[first ? 'find' : 'filter'](function (model) {
      for (var key in attrs) {
        if (attrs[key] !== model.get(key)) {
          return false;
        }
      }
      return true;
    });
  },

  /**
   * See [Backbone Collection.create](http://backbonejs.org/#Collection-create).
   */
  create: function (model, options) {
    options || (options = {});
    if (!__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(model, 'urlRoot')) {
      options.url = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'url');
    }
    return __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.Collection.prototype.create.call(this, model, options);
  }

}));


/***/ }),
/* 37 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_backbone__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_backbone___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_backbone__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util_Logger__ = __webpack_require__(7);






/**
   * Archer.Model is a standard [Backbone.Model](http://backbonejs.org/#Model) with a few additions:
   *
   * - {@link src/framework/Model#derived Derived properties}
   * - {@link src/framework/Model#props Built in schema validation}
   * - {@link src/framework/Model#local Private properties (with schema validation)}
   * - {@link src/framework/Model#flat Flattening of nested objects}
   *
   * Both derived and private properties are filtered out when sending the data to the server.
   *
   * See [Backbone.Model](http://backbonejs.org/#Model-constructor).
   *
   * @class src/framework/Model
   * @extends external:Backbone.Model
   * @param {Object} [attributes] - Initial model attributes (data)
   * @param {Object} [options] - Options hash
   * @example
   * var Person = Archer.Model.extend({
   *   props: {
   *     'fname': 'string',
   *     'lname': 'string'
   *   },
   *   local: {
   *     isLoggedIn: 'boolean'
   *   },
   *   derived: {
   *     name: {
   *       deps: ['fname', 'lname'],
   *       fn: function (fname, lname) {
   *         return fname + ' ' + lname;
   *       }
   *     }
   *   }
   * });
   * var model = new Person({fname: 'Joe', lname: 'Doe'});
   * model.get('name'); //=> "Joe Doe"
   * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
   *
   * model.set('isLoggedIn', true);
   * model.get('isLoggedIn'); //=> true
   * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
   */
var Model;

function flatten(value, objectTypeFields, key, target) {
  var filter = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].contains(objectTypeFields, key);
  target || (target = {});
  if (!filter && __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isObject(value) && !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(value) && !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(value)) {
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(value, function (val, i) {
      flatten(val, objectTypeFields, key ? (key + '.' + i) : i, target);
    });
  }
  // Case where target is an empty object. Guard against returning {undefined: undefined}.
  else if (key !== undefined) {
    target[key] = value;
  }
  return target;
}

function unflatten(data) {
  __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(data, function (value, key, data) {
    if (key.indexOf('.') == -1) {
      return;
    }
    var part,
        ref = data,
        parts = key.split('.');
    while ((part = parts.shift()) !== undefined) {
      if (!ref[part]) {
        ref[part] = parts.length ? {} : value;
      }
      ref = ref[part];
    }
    delete data[key];
  });
  return data;
}

function createMessage(field, msg) {
  var obj = {};
  obj[field.name] = msg;
  return obj;
}

function normalizeSchemaDef(field, name) {
  var target;
  if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isString(field)) {
    target = {
      type: field
    };
  }
  else if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(field)) {
    target = {
      type: field[0],
      required: field[1],
      value: field[2]
    };
  }
  else {
    target = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].clone(field);
  }
  __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults(target, {required: false, name: name});
  return target;
}

function capitalize(string) {
  return string.toLowerCase().replace(/\b[a-z]/g, function (letter) {
    return letter.toUpperCase();
  });
}

function _validateRegex(value, pattern, error) {
  if (!pattern.test(value)) {
    return error;
  }
}

var StringFormatValidators = {
  /*eslint max-len: 0 */
  email: function (value) {
    // Taken from  http://emailregex.com/ on 2017-03-06.
    var pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return _validateRegex(value, pattern, Model.ERROR_INVALID_FORMAT_EMAIL);
  },
  uri: function (value) {
    // source: https://mathiasbynens.be/demo/url-regex
    var pattern = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    return _validateRegex(value, pattern, Model.ERROR_INVALID_FORMAT_URI);
  },
  ipv4: function (value) {
    // source: https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    var pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return _validateRegex(value, pattern, Model.ERROR_INVALID_FORMAT_IPV4);
  },
  hostname: function (value) {
    // source: http://www.regextester.com/23
    var pattern = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;
    return _validateRegex(value, pattern, Model.ERROR_INVALID_FORMAT_HOSTNAME);
  }
};

function validateStringFormat(field, value) {
  var validator = StringFormatValidators[field.format];
  if (field.format && !validator) {
    throw new TypeError(field.format + ' is not a supported string format');
  }
  return validator && validator(value);
}

function validateString(field, value) {
  var createMessageWith = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].partial(createMessage, field),
      invalidFormat = validateStringFormat(field, value);
  if (invalidFormat) {
    return createMessageWith(invalidFormat);
  }
  if (value && field.minLength && value.length < field.minLength) {
    return createMessageWith(Model.ERROR_STRING_STRING_MIN_LENGTH, value.length);
  }
  if (value && field.maxLength && value.length > field.maxLength) {
    return createMessageWith(Model.ERROR_STRING_STRING_MAX_LENGTH, value.length);
  }
}

function validateField(field, value) {
  /* eslint complexity: [2, 25], max-statements: [2, 27] */
  var createMessageWith = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].partial(createMessage, field),
      isDefined = !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isUndefined(value) && !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isNull(value),
      checkType,
      errorMessage;

  // If using an array validator, perform the validation
  if (Array.isArray(field.validate)) {
    let output = [];
    let foundError = false;
    let result;
    field.validate.forEach(item => {
      if (!value) {
        result = false;
      } else {
        switch (item.type.toLowerCase()) {
        case 'regex':
          result = (new RegExp(item.value.pattern, item.value.flags || '')).test(value);
          break;
        default:
          result = false;
        }
      }
      // Append the result.
      foundError = foundError || !result;
      output.push({
        message: item.hasOwnProperty('message') ? item.message : '',
        passed: result
      });
    });
    if (foundError) {
      return createMessageWith(output);
    }
    return;
  }

  // check required fields
  if (field.required && (!isDefined || __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isNull(value) || value === '')) {
    return createMessageWith(Model.ERROR_BLANK);
  }
  // check type
  checkType = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"]['is' + capitalize(field.type)];
  if (isDefined && field.type != 'any' && (!__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(checkType) || !checkType(value))) {
    return createMessageWith(Model.ERROR_WRONG_TYPE);
  }
  // validate string format
  if (value && field.type == 'string') {
    var error = validateString(field, value);
    if (error) {
      return error;
    }
  }
  // check pre set values (enum)
  if (isDefined && field.values && !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].contains(field.values, value)) {
    return createMessageWith(Model.ERROR_NOT_ALLOWED);
  }
  // check validate method
  if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(field.validate)) {
    var result = field.validate(value);
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isString(result) && result) {
      return createMessageWith(result);
    }
    else if (result === false) {
      return createMessageWith(Model.ERROR_INVALID);
    }
  }
  // check array items
  if (isDefined && field.type == 'array' && (errorMessage = validateArrayField(field, value))) {
    return createMessageWith(errorMessage);
  }
}

function validateArrayField(field, arr) {
  if (field.minItems && arr.length < field.minItems) {
    return 'model.validation.field.array.minItems';
  }
  else if (field.maxItems && arr.length > field.maxItems) {
    return 'model.validation.field.array.maxItems';
  }
  else if (field.uniqueItems && arr.length > __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].uniq(arr).length) {
    return Model.ERROR_IARRAY_UNIQUE;
  }
  else if (field.items) {
    /* eslint max-depth: [2, 3] */
    var arrayField = normalizeSchemaDef(field.items, 'placeholder');
    for (var i = 0; i < arr.length; i++) {
      var value = arr[i];
      var error = validateField(arrayField, value);
      if (error) {
        return error['placeholder'];
      }
    }
  }
}

Model = __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.Model.extend(/** @lends src/framework/Model.prototype */ {

  /**
     * Pass props as an object to extend, describing the observable properties of your model. The props
     * properties should not be set on an instance, as this won't define new properties, they should only be passed to
     * extend.
     * Properties can be defined in three different ways:
     *
     * - As a string with the expected dataType. One of string, number, boolean, array, object, date, or any.
     * Eg: `name: 'string'`.
     * - An array of `[dataType, required, default]`
     * - An object `{type: 'string', format: '', required: true, value: '', values: [], validate: function() {}`
     *   - `value` will be the value that the property will be set to if it is undefined, either by not being set during
     *   initialization, or by being explicitly set to undefined.
     *   - `format` is a json-schame derived string format. Supported formats are: `email`, `uri`, `hostname` and `ipv4`.
     *   - If `required` is true, one of two things will happen. If a default is set for the property, the property will
     *   start with that value. If a default is not set for the property, validation will fail
     *   - If `values` array is passed, then you'll be able to change a property to one of those values only.
     *   - If `validate` is defined, it should return false or a custom message string when the validation fails.
     *   - If the type is defined as `array`, the array elements could be defined by `minItems` (Number),
     *   `uniqueItems` (Boolean) and `items` (a field definition such as this one that will validate each array member)
     *   To the `validate` method
     *   - Trying to set a property to an invalid type will raise an exception.
     *
     * @type {Mixed}
     * @example
     * var Person = Model.extend({
     *   props: {
     *     name: 'string',
     *     age: 'number',
     *     paying: ['boolean', true, false], //required attribute, defaulted to false
     *     type: {
     *       type: 'string',
     *       values: ['regular-hero', 'super-hero', 'mega-hero']
     *     },
     *     likes: {
     *       type: 'string',
     *       validate: function (value) {
     *         return /^[\w]+ing$/.test(value)
     *       }
     *     }
     *   }
     * });
     */
  props: {},

  /**
     * Derived properties (also known as computed properties) are properties of the model that depend on the
     * other (props, local or even derived properties to determine their value. Best demonstrated with an example:
     *
     * Each derived property, is defined as an object with the current properties:
     *
     * - `deps` {Array} - An array of property names which the derived property depends on.
     * - `fn` {Function} - A function which returns the value of the computed property. It is called in the context of
     * the current object, so that this is set correctly.
     * - `cache` {Boolean} -  - Whether to cache the property. Uncached properties are computed every time they are
     * accessed. Useful if it depends on the current time for example. Defaults to `true`.
     *
     * Derived properties are retrieved and fire change events just like any other property. They cannot be set
     * directly.
     * @type {Object}
     * @example
     * var Person = Model.extend({
     *   props: {
     *     firstName: 'string',
     *     lastName: 'string'
     *   },
     *   derived: {
     *     fullName: {
     *       deps: ['firstName', 'lastName'],
     *       fn: function (firstName, lastName) {
     *         return firstName + ' ' + lastName;
     *       }
     *     }
     *   }
     * });
     *
     * var person = new Person({ firstName: 'Phil', lastName: 'Roberts' })
     * console.log(person.get('fullName')) //=> "Phil Roberts"
     *
     * person.set('firstName', 'Bob');
     * console.log(person.get('fullName')) //=> "Bob Roberts"
     */
  derived: {},

  /**
     * local properties are defined and work in exactly the same way as {@link src/framework/Model#props|props}, but generally only exist for
     * the lifetime of the page.
     * They would not typically be persisted to the server, and are not returned by calls to {@link src/framework/Model#toJSON|toJSON}.
     *
     * @type {Object}
     * @example
     * var Person = Model.extend({
     *   props: {
     *     name: 'string',
     *   },
     *   local: {
     *     isLoggedIn: 'boolean'
     *   }
     * );
     */
  local: {},

  /**
     * Flatten the payload into dot notation string keys:
     *
     * @type {Boolean}
     * @example
     * var Person = Model.extend({
     *   props: {
     *     'profile.fname': 'string',
     *     'profile.lname': 'string',
     *     'profile.languages': 'object'
     *   },
     *   flat: true
     * });
     * var person = new Person({'profile': {
     *                            'fname': 'John',
     *                            'lname': 'Doe',
     *                            'languages': {name: "English", value: "EN"}
     *                         }}, {parse: true});
     * person.get('profile'); //=> undefined
     * person.get('profile.fname'); //=> 'John'
     * person.get('profile.lname'); //=> 'Doe'
     * person.get('profile.languages'); //=> {name: "English", value: "EN"}
     * person.get('profile.languages.name'); //=> undefined
     * person.toJSON(); //=> {'profile': {'fname': 'John'} }
     */
  flat: true,

  /**
     * @deprecated
     * @alias Backbone.Model#defaults
     */
  defaults: {},

  constructor: function (options) {
    this.options = options || {};

    var schema = this['__schema__'] = {},
        objectTypeFields = [];

    schema.computedProperties = {};

    schema.props = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].clone(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'props') || {});
    schema.derived = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].clone(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'derived') || {});
    schema.local = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].clone(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'local') || {});

    var defaults = {};
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend({}, schema.props, schema.local), function (options, name) {
      var schemaDef = normalizeSchemaDef(options, name);
      if (!__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isUndefined(schemaDef.value)) {
        defaults[name] = schemaDef.value;
      }
      if (schemaDef.type === 'object') {
        objectTypeFields.push(name);
      }
    }, this);
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].size(defaults)) {
      var localDefaults = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'defaults');
      this.defaults = function () {
        return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults({}, defaults, localDefaults);
      };
    }

    // override `validate`
    this.validate = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].wrap(this.validate, function (validate) {
      var args = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].rest(arguments),
          res = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend(this._validateSchema.apply(this, args), validate.apply(this, args));
      return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].size(res) && res || undefined;
    });

    // override `parse`
    this.parse = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].wrap(this.parse, function (parse) {
      var target = parse.apply(this, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].rest(arguments));
      if (this.flat) {
        target = flatten(target, objectTypeFields);
      }
      return target;
    });

    __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.Model.apply(this, arguments);

    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(schema.derived, function (options, name) {
      schema.computedProperties[name] = this.__getDerivedValue(name); // set initial value;
      var deps = options.deps || [];
      if (deps.length) {
        this.on('cache:clear change:' + deps.join(' change:'), function () {
          var value = this.__getDerivedValue(name);
          if (value !== schema.computedProperties[name]) {
            schema.computedProperties[name] = value;
            this.trigger('change:' + name, this, value);
          }
        }, this);
      }
    }, this);

    this.on('sync', function () {
      this.__syncedData = this.toJSON();
    }, this);
  },

  validate: function () {},

  /**
     * Check if the schema settings allow this field to exist in the model
     * @param  {String} key
     * @return {Boolean}
     */
  allows: function (key) {
    var schema = this['__schema__'],
        all = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend({}, schema.props, schema.local);
    if (!__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].has(all, key)) {
      __WEBPACK_IMPORTED_MODULE_2__util_Logger__["default"].warn('Field not defined in schema', key);
    }
    return true;
  },

  /**
     * Returns the schema for the specific property
     *
     * @param propName - The name of the property
     * @returns {*} | null
     */
  getPropertySchema: function (propName) {
    var schema = this['__schema__'];
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].reduce([schema.props, schema.local], function (result, options) {
      return result || normalizeSchemaDef(options[propName], propName);
    }, null);
  },

  set: function (key, val) {
    var attrs;
    if (typeof key === 'object') {
      attrs = key;
    } else {
      (attrs = {})[key] = val;
    }

    // Don't override a computed properties
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(attrs, function (value, key) {
      if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].has(this['__schema__'].derived, key)) {
        throw 'overriding derived properties is not supported: ' + key;
      }
    }, this);

    // Schema validation
    var errorFields = [];
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(attrs, function (value, key) {
      this.allows(key) || errorFields.push(key);
    }, this);
    if (errorFields.length) {
      throw 'field not allowed: ' + errorFields.join(', ');
    }

    return __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.Model.prototype.set.apply(this, arguments);
  },

  get: function (attr) {
    var schema = this['__schema__'];
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].has(schema.derived, attr)) {
      if (schema.derived[attr].cache !== false) {
        return schema.computedProperties[attr];
      }
      else {
        return this.__getDerivedValue(attr);
      }
    }
    return __WEBPACK_IMPORTED_MODULE_1_backbone___default.a.Model.prototype.get.apply(this, arguments);
  },

  /**
     * Return a shallow copy of the model's attributes for JSON stringification.
     * This can be used for persistence, serialization, or for augmentation before being sent to the server.
     * The name of this method is a bit confusing, as it doesn't actually return a JSON string —
     * but I'm afraid that it's the way that the JavaScript API for JSON.stringify works.
     *
     * See [Backbone.Model.toJSON](http://backbonejs.org/#Model-toJSON)
     *
     * @param  {Object} options
     * @return {Object}
     * @example
     * var artist = new Model({
     *   firstName: 'Wassily',
     *   lastName: 'Kandinsky'
     * });
     *
     * artist.set({birthday: 'December 16, 1866'});
     * JSON.stringify(artist); //=> {'firstName':'Wassily','lastName':'Kandinsky','birthday':'December 16, 1866'}
     */
  toJSON: function (options) {
    options || (options = {});
    var res = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].clone(__WEBPACK_IMPORTED_MODULE_1_backbone___default.a.Model.prototype.toJSON.apply(this, arguments)),
        schema = this['__schema__'];

    // cleanup local properties
    if (!options.verbose) {
      res = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].omit(res, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].keys(schema.local));
    }
    else { // add derived properties
      __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(schema.derived, function (options, name) {
        res[name] = this.get(name);
      }, this);
    }

    if (this.flat) {
      res = unflatten(res);
    }

    return res;
  },

  /**
     * Removes all attributes from the model, including the id attribute.
     * Fires a `"change"` event unless `silent` is passed as an option.
     * Sets the default values to the model
     * @param {Object} [options]
     */
  reset: function (options) {
    this.clear(options);
    this.set(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'defaults'), options);
  },

  /**
     * Is the data on the model has local modifications since the last sync event?
     * @return {Boolean} is the model in sync with the server
     */
  isSynced: function () {
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isEqual(this.__syncedData, this.toJSON());
  },

  /**
     * validate a specific field in the model.
     * @param  {String} key
     * @return {Object} returns `{fieldName: errorMessage}` if invalid, otherwise undefined.
     * @readonly
     */
  validateField: function (key) {
    var schema = key && this.getPropertySchema(key);
    return schema && validateField(schema, this.get(key));
  },

  /**
     * Runs local schema validation. Invoked internally by {@link src/framework/Model#validate|validate}.
     * @return {Object}
     * @protected
     */
  _validateSchema: function () {
    var schema = this['__schema__'];
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].reduce(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend({}, schema.props, schema.local), function (memo, options, name) {
      return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend(memo, this.validateField(name) || {});
    }, {}, this);
  },

  __getDerivedValue: function (name) {
    var options = this['__schema__'].derived[name];
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isString(options)) {
      var key = options;
      options = {
        deps: [key],
        fn: function () {
          return this.get(key);
        }
      };
    }
    var deps = options.deps || [];
    return options.fn.apply(this, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].map(deps, this.get, this));
  }

},
{
  ERROR_BLANK: 'model.validation.field.blank',
  ERROR_WRONG_TYPE: 'model.validation.field.wrong.type',
  ERROR_NOT_ALLOWED: 'model.validation.field.value.not.allowed',
  ERROR_INVALID: 'model.validation.field.invalid',
  ERROR_IARRAY_UNIQUE: 'model.validation.field.array.unique',
  ERROR_INVALID_FORMAT_EMAIL: 'model.validation.field.invalid.format.email',
  ERROR_INVALID_FORMAT_URI: 'model.validation.field.invalid.format.uri',
  ERROR_INVALID_FORMAT_IPV4: 'model.validation.field.invalid.format.ipv4',
  ERROR_INVALID_FORMAT_HOSTNAME: 'model.validation.field.invalid.format.hostname',
  ERROR_STRING_STRING_MIN_LENGTH: 'model.validation.field.string.minLength',
  ERROR_STRING_STRING_MAX_LENGTH: 'model.validation.field.string.maxLength'
}
);

/* harmony default export */ __webpack_exports__["a"] = (Model);


/***/ }),
/* 38 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__BaseCollection__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__BaseModel__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__SchemaProperty__ = __webpack_require__(18);





const parseProperties = function (resp) {
  const schemaMeta = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].pick(resp, 'id', 'name', 'displayName');

  const properties = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].map(resp.schema.properties, function (property, name) {
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend({ name }, property);
  });

  __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(properties, function (property) {
    property['__schemaMeta__'] = schemaMeta;

    if (property.__metadata) {
      property['__metadata__'] = property.__metadata;
      delete property.__metadata;
    }
  });
  return properties;
};

const BaseSchemaSchema = __WEBPACK_IMPORTED_MODULE_2__BaseModel__["default"].extend({
  defaults: {
    id: undefined,
    displayName: undefined,
    name: undefined
  },

  constructor: function () {
    this.properties = new __WEBPACK_IMPORTED_MODULE_3__SchemaProperty__["default"].Collection();
    __WEBPACK_IMPORTED_MODULE_2__BaseModel__["default"].apply(this, arguments);
  },

  getProperties: function () {
    return this.properties;
  },

  clone: function () {
    const model = __WEBPACK_IMPORTED_MODULE_2__BaseModel__["default"].prototype.clone.apply(this, arguments);

    model.getProperties().set(this.getProperties().toJSON({ verbose: true }));
    return model;
  },

  parse: function (resp) {
    const properties = parseProperties(resp);

    this.properties.set(properties, { parse: true });
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].omit(resp, 'schema');
  },

  trimProperty: function (property) {
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].omit(property, 'name');
  },

  toJSON: function () {
    const json = __WEBPACK_IMPORTED_MODULE_2__BaseModel__["default"].prototype.toJSON.apply(this, arguments);

    json.schema = { properties: {} };
    this.getProperties().each(function (model) {
      const property = model.toJSON();

      json.schema.properties[property.name] = this.trimProperty(property);
    }, this);
    return json;
  },

  save: function () {
    this.getProperties().each(function (model) {
      model.cleanup();
    });
    return __WEBPACK_IMPORTED_MODULE_2__BaseModel__["default"].prototype.save.apply(this, arguments);
  }
});
const BaseSchemaSchemas = __WEBPACK_IMPORTED_MODULE_1__BaseCollection__["default"].extend({
  model: BaseSchemaSchema
});
/* harmony default export */ __webpack_exports__["default"] = ({
  parseProperties: parseProperties,
  Model: BaseSchemaSchema,
  Collection: BaseSchemaSchemas
});


/***/ }),
/* 39 */
/***/ (function(module, exports) {

module.exports = require("okta-i18n-bundles");

/***/ }),
/* 40 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__jquery_wrapper__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__BaseRouter__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__SettingsModel__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__StateMachine__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__views_BaseView__ = __webpack_require__(1);
/* eslint max-len: [2, 150] */







function clean(obj) {
  const res = {};

  __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].each(obj, function (value, key) {
    if (!__WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].isNull(value)) {
      res[key] = value;
    }
  });
  return res;
}

/**
 * A Controller is our application control flow component.
 *
 * Typically it will:
 * - Initialize the models, controller and main views
 * - Listen to events
 * - Create, read, update and delete models
 * - Create modal dialogs, confirmation dialogs and alert dialogs
 * - Control the application flow
 *
 * The constructor is responsible for:
 * - Create the application state object
 * - Assign or creates the application settings object
 * - Create an instance of the main view with the relevant parameters
 *
 * See:
 * [Hello World Tutorial](https://github.com/okta/courage/wiki/Hello-World),
 * [Jasmine Spec](https://github.com/okta/okta-core/blob/master/WebContent/js/test/unit/spec/shared/util/BaseController_spec.js)
 *
 * @class module:Okta.Controller
 * @param {Object} options Options Hash
 * @param {SettingsModel} [options.settings] Application Settings Model
 * @param {String} options.el a jQuery selector string stating where to attach the controller in the DOM
 */
/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_5__views_BaseView__["default"].extend(
  /** @lends module:Okta.Controller.prototype */ {
    constructor: function (options) {
      /* eslint max-statements: [2, 15], complexity: [2, 9]*/
      options || (options = {});

      // If 'state' is passed down as options, use it, else create a 'new StateMachine()'
      if (options.state instanceof __WEBPACK_IMPORTED_MODULE_4__StateMachine__["a" /* default */] || this.state instanceof __WEBPACK_IMPORTED_MODULE_4__StateMachine__["a" /* default */]) {
        this.state = options.state || this.state;
      }
      else {
        const stateData = __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].defaults(clean(options.state), this.state || {});
        this.state = new __WEBPACK_IMPORTED_MODULE_4__StateMachine__["a" /* default */](stateData);
        delete options.state;
      }

      if (options.settings) {
        this.settings = options.settings;
      } else {
        // allow the controller to live without a router
        this.settings = options.settings = new __WEBPACK_IMPORTED_MODULE_3__SettingsModel__["a" /* default */](__WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].omit(options || {}, 'el'));
        this.listen('notification', __WEBPACK_IMPORTED_MODULE_2__BaseRouter__["default"].prototype._notify);
        this.listen('confirmation', __WEBPACK_IMPORTED_MODULE_2__BaseRouter__["default"].prototype._confirm);
      }

      __WEBPACK_IMPORTED_MODULE_5__views_BaseView__["default"].call(this, options);

      this.listenTo(this.state, '__invoke__', function () {
        const args = __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].toArray(arguments);

        const method = args.shift();

        if (__WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].isFunction(this[method])) {
          this[method].apply(this, args);
        }
      });

      if (this.View) {
        this.add(new this.View(this.toJSON()));
      }
    },

    /**
     * The default values of our application state
     * @type {Object}
     * @default {}
     */
    state: {},

    /**
     * The main view this controller operate on
     * @type {module:Okta.View}
     * @default null
     */
    View: null,

    /**
     * Renders the {@link module:Okta.Controller#View|main view} after the DOM is ready
     * in case the controller is the root component of the page (e.g there's no router)
     */
    render: function () {
      const args = arguments;
      const self = this;

      Object(__WEBPACK_IMPORTED_MODULE_0__jquery_wrapper__["default"])(function () {
        __WEBPACK_IMPORTED_MODULE_5__views_BaseView__["default"].prototype.render.apply(self, args);
      });
      return this;
    },

    /**
     * Creates the view constructor options
     * @param {Object} [options] Extra options
     * @return {Object} The view constructor options
     */
    toJSON: function (options) {
      return __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].extend(__WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].pick(this, 'state', 'settings', 'collection', 'model'), options || {});
    },

    /**
     * Removes the child views, empty the DOM element and stop listening to events
     */
    remove: function () {
      this.removeChildren();
      this.stopListening();
      this.$el.empty();
      return this;
    }
  }
));


/***/ }),
/* 41 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__BaseView__ = __webpack_require__(1);



const defaults = {
  level: 'success',
  message: 'Great Success!',
  hide: true,
  fade: 400,
  delay: 3000,
  width: 0,
  dismissable: false
};
/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_2__BaseView__["default"].extend({
  className: 'infobox infobox-confirm infobox-confirm-fixed',

  events: {
    'click .infobox-dismiss-link': function (e) {
      e.preventDefault();
      this.fadeOut();
    }
  },

  template:
    '\
      {{#if dismissable}}\
      <a class="infobox-dismiss-link" title="Dismiss" href="#">\
        <span class="dismiss-icon"></span>\
      </a>\
      {{/if}}\
      <span class="icon {{level}}-16"></span>\
      {{#if title}}<h3>{{title}}</h3>{{/if}}\
      <p>{{message}}</p>\
    ',

  initialize: function () {
    this.options = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].defaults({}, this.options, defaults);
    this.$el.addClass('infobox-' + this.options.level);
    if (this.options.width) {
      this.$el.width(this.options.width).css({
        'margin-left': '0px',
        left: Math.round((Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])(window).width() - this.options.width) / 2)
      });
    }
  },

  getTemplateData: function () {
    return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].extend(__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].pick(this.options, 'level', 'message', 'title'), {
      dismissable: this.options.hide === false || this.options.dismissable === true
    });
  },

  postRender: function () {
    if (this.options.hide) {
      __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].delay(__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].bind(this.fadeOut, this), this.options.delay);
    }
  },

  fadeOut: function () {
    this.$el.fadeOut(this.options.fade, __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].bind(this.remove, this));
  }
}));


/***/ }),
/* 42 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__models_Model__ = __webpack_require__(11);



/**
 * @class StateMachine
 * @extends Okta.Model
 * @private
 *
 * A state object that holds the applciation state
 */

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1__models_Model__["default"].extend({
  extraProperties: true,
  /**
   * Invokes a method on the applicable {@link Okta.Controller}
   *
   * ```javascript
   * state.invoke('methodName', 'param1', 'param2')
   * // Will call
   * contoller.methodName('param1', 'param2')
   * ```
   * @param {String} methodName the name of the controller method to invoke on the controller
   */
  invoke: function () {
    const args = __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].toArray(arguments);

    args.unshift('__invoke__');
    this.trigger.apply(this, args);
  }
}));


/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_ViewUtil__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__BaseView__ = __webpack_require__(1);



const disabledEvents = {
  click: function (e) {
    e.preventDefault();
    e.stopPropagation();
  }
};

/**
 * A configurable button
 * @class module:Okta.internal.views.components.BaseButtonLink
 * @extends module:Okta.View
 * @example
 * var View = BaseButtonLink.extend({
 *   title: 'Click Me',
 *   icon: 'help-text'
 * })
 */
/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_2__BaseView__["default"].extend(
  /** @lends module:Okta.internal.views.components.BaseButtonLink.prototype */ {
    attributes() {
      const defaultAttrs = {
        'data-se': 'button'
      };
      const additionalAttr = this.__getAttribute('attrs');
      return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend(defaultAttrs, additionalAttr);
    },
    /**
     * The main text for the button
     * @name title
     * @memberof module:Okta.internal.views.components.BaseButtonLink
     * @type {(String|Function)}
     * @instance
     */

    /**
     * The link for the button
     * @name href
     * @memberof module:Okta.internal.views.components.BaseButtonLink
     * @type {(String|Function)}
     * @instance
     */

    /**
     * CSS class for the icon to display. See [Style guide](http://rain.okta1.com:1802/su/dev/style-guide#icons)
     * @name icon
     * @memberof module:Okta.internal.views.components.BaseButtonLink
     * @type {(String|Function)}
     * @instance
     */

    /**
     * A [Backbone events](http://backbonejs.org/#View-delegateEvents) hash
     * @name events
     * @memberof module:Okta.internal.views.components.BaseButtonLink
     * @type {Object}
     * @instance
     */

    tagName: 'a',

    template: '{{#if icon}}<span class="icon {{icon}}"></span>{{/if}}{{#if title}}{{title}}{{/if}}',

    /**
     * Make this button visible, default to true.
     * @type {(Boolean|Function)}
     * @default true
     */
    visible: true,

    /**
     * Make this button enabled, default to true.
     * @type {(Boolean|Function)}
     * @default true
     */
    enabled: true,

    /**
     * The setting to determine when the button is enabled, default to {} and
     * enabled takes a higher priority.
     * @type {(Object|Function)}
     * @default {}
     */
    enableWhen: {},

    /**
     * The setting to determine when the button is visible, default to {} and
     * visible takes a higher priority.
     * @type {(Object|Function)}
     * @default {}
     */
    showWhen: {},

    constructor: function (options) {
      this.options = options || {};
      const data = this.getTemplateData();

      this.disabled = false;

      __WEBPACK_IMPORTED_MODULE_2__BaseView__["default"].apply(this, arguments);

      this.$el.addClass('link-button');
      if (data.icon) {
        this.$el.addClass('link-button-icon');
        if (!data.title) {
          this.$el.addClass('icon-only');
        }
      }
    },

    getTemplateData: function () {
      return {
        href: this.__getAttribute('href'),
        title: this.__getAttribute('title'),
        icon: this.__getAttribute('icon')
      };
    },

    initialize: function () {
      __WEBPACK_IMPORTED_MODULE_1__util_ViewUtil__["a" /* default */].applyDoWhen(this, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].resultCtx(this, 'enableWhen', this), this.toggle);
      __WEBPACK_IMPORTED_MODULE_1__util_ViewUtil__["a" /* default */].applyDoWhen(this, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].resultCtx(this, 'showWhen', this), this.toggleVisible);
    },

    render: function () {
      __WEBPACK_IMPORTED_MODULE_2__BaseView__["default"].prototype.render.apply(this, arguments);

      if (!__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'enabled')) {
        this.toggle(false);
      }

      if (!__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'visible')) {
        this.toggleVisible(false);
      }

      const data = this.getTemplateData();

      this.$el.attr('href', data.href || '#');

      return this;
    },

    __getAttribute: function (name, defaultValue) {
      let value = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].resultCtx(this.options, name, this);

      if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isUndefined(value)) {
        value = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, name);
      }
      return !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isUndefined(value) ? value : defaultValue;
    },

    enable: function () {
      this.toggle(true);
    },

    disable: function () {
      this.toggle(false);
    },

    show: function () {
      this.toggleVisible(true);
    },

    hide: function () {
      this.toggleVisible(false);
    },

    toggle: function (enable) {
      const bool = !!enable && __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'enabled');
      //this is to toggle the enability

      this.disabled = !bool;
      this.$el.toggleClass('link-button-disabled btn-disabled disabled', this.disabled);
      this.delegateEvents(this.disabled ? disabledEvents : null);
    },

    toggleVisible: function (visible) {
      const hidden = !visible || !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'visible');

      this.$el.toggleClass('hide', hidden);
    }
  }
));


/***/ }),
/* 44 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_backbone__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_backbone___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_backbone__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__ = __webpack_require__(0);



function Class(options) {
  this.options = __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].clone(options || {});
  this.cid = __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].uniqueId('class');
  this.initialize.apply(this, arguments);
}

__WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].extend(Class.prototype, __WEBPACK_IMPORTED_MODULE_0_backbone___default.a.Events, {
  initialize: function () {}
});

Class.extend = __WEBPACK_IMPORTED_MODULE_0_backbone___default.a.Model.extend;

/* harmony default export */ __webpack_exports__["default"] = (Class);


/***/ }),
/* 45 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vendor_lib_js_cookie__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vendor_lib_js_cookie___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_vendor_lib_js_cookie__);


const SECURED_COOKIE = /^https/.test(window.location.href);
/* harmony default export */ __webpack_exports__["default"] = ({
  setCookie: function (name, value, options) {
    __WEBPACK_IMPORTED_MODULE_1_vendor_lib_js_cookie___default.a.set(
      name,
      value,
      __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].defaults(options || {}, {
        secure: SECURED_COOKIE,
        path: '/'
      })
    );
  },

  getCookie: function () {
    return __WEBPACK_IMPORTED_MODULE_1_vendor_lib_js_cookie___default.a.get.apply(__WEBPACK_IMPORTED_MODULE_1_vendor_lib_js_cookie___default.a, arguments);
  },

  removeCookie: function () {
    return __WEBPACK_IMPORTED_MODULE_1_vendor_lib_js_cookie___default.a.remove.apply(__WEBPACK_IMPORTED_MODULE_1_vendor_lib_js_cookie___default.a, arguments);
  }
});


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * JavaScript Cookie v2.1.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
(function (factory) {
	if (true) {
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		var _OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = _OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
					attributes.path    && '; path=' + attributes.path,
					attributes.domain  && '; domain=' + attributes.domain,
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var name = parts[0].replace(rdecode, decodeURIComponent);
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.get = api.set = api;
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));


/***/ }),
/* 47 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_handlebars__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__handlebars_helper_date__ = __webpack_require__(48);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__handlebars_helper_i18n__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__handlebars_helper_img__ = __webpack_require__(50);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__handlebars_helper_markdown__ = __webpack_require__(51);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__handlebars_helper_xsrfTokenInput__ = __webpack_require__(53);
/* eslint @okta/okta/no-specific-modules: 0 */







/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a);


/***/ }),
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_handlebars__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_moment__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_moment___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_moment__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__underscore_wrapper__ = __webpack_require__(0);
/* eslint @okta/okta/enforce-requirejs-names: 0, @okta/okta/no-specific-modules: 0, max-params: 0, max-statements: 0 */




function formatDate(format, dateInISOString) {
  return __WEBPACK_IMPORTED_MODULE_1_moment___default.a
    .utc(dateInISOString)
    .utcOffset('-07:00')
    .format(format);
}

__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a.registerHelper('shortDate', __WEBPACK_IMPORTED_MODULE_2__underscore_wrapper__["default"].partial(formatDate, 'MMM Do'));
__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a.registerHelper('mediumDate', __WEBPACK_IMPORTED_MODULE_2__underscore_wrapper__["default"].partial(formatDate, 'MMMM DD, YYYY'));
__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a.registerHelper('longDate', __WEBPACK_IMPORTED_MODULE_2__underscore_wrapper__["default"].partial(formatDate, 'MMMM DD, YYYY, h:mma'));
__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a.registerHelper('formatDate', formatDate);

/* unused harmony default export */ var _unused_webpack_default_export = (__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a);


/***/ }),
/* 49 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_handlebars__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__StringUtil__ = __webpack_require__(3);
/* eslint @okta/okta/no-specific-modules: 0 */




function trim(str) {
  return str && str.replace(/^\s+|\s+$/g, '');
}

__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a.registerHelper('i18n', function (options) {
  let params;
  const key = trim(options.hash.code);
  const bundle = trim(options.hash.bundle);
  const args = trim(options.hash['arguments']);

  if (args) {
    params = __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].map(
      trim(args).split(';'),
      function (param) {
        param = trim(param);
        let val;
        const data = this;

        /*
       * the context(data) may be a deep object, ex {user: {name: 'John', gender: 'M'}}
       * arguments may be 'user.name'
       * return data['user']['name']
       */
        __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].each(param.split('.'), function (p) {
          val = val ? val[p] : data[p];
        });
        return val;
      },
      this
    );
  }

  return __WEBPACK_IMPORTED_MODULE_2__StringUtil__["default"].localize(key, bundle, params);
});

/* unused harmony default export */ var _unused_webpack_default_export = (__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a);


/***/ }),
/* 50 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_handlebars__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__ = __webpack_require__(0);
/* eslint @okta/okta/no-specific-modules: 0 */


const CACHE_BUST_URL_PREFIX = '/assets';

function prependCachebustPrefix(path) {
  if (path.indexOf(CACHE_BUST_URL_PREFIX) === 0) {
    return path;
  }
  return CACHE_BUST_URL_PREFIX + path;
}

__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a.registerHelper('img', function (options) {
  const cdn = (typeof okta !== 'undefined' && okta.cdnUrlHostname) || '';
  /*global okta */

  const hash = __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].pick(options.hash, ['src', 'alt', 'width', 'height', 'class', 'title']);

  hash.src = '' + cdn + prependCachebustPrefix(hash.src);

  const attrs = __WEBPACK_IMPORTED_MODULE_1__underscore_wrapper__["default"].map(hash, function (value, attr) {
    return attr + '="' + __WEBPACK_IMPORTED_MODULE_0_handlebars___default.a.Utils.escapeExpression(value) + '"';
  });

  return new __WEBPACK_IMPORTED_MODULE_0_handlebars___default.a.SafeString('<img ' + attrs.join(' ') + '/>');
});

/* unused harmony default export */ var _unused_webpack_default_export = (__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a);


/***/ }),
/* 51 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_handlebars__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__markdownToHtml__ = __webpack_require__(52);
/* eslint @okta/okta/no-specific-modules: 0 */



__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a.registerHelper('markdown', function (mdText) {
  return Object(__WEBPACK_IMPORTED_MODULE_1__markdownToHtml__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a, mdText);
});

/* unused harmony default export */ var _unused_webpack_default_export = (__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a);


/***/ }),
/* 52 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = mdToHtml;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__ = __webpack_require__(0);
// Simple "markdown parser" - just handles markdown formatted links. If we
// find that we need more extensive markdown support, we should include
// a fully formulated markdown library like:
// https://github.com/evilstreak/markdown-js

const RE_LINK = /\[[^\]]*\]\([^)]*\)/gi;
const RE_LINK_HREF = /\]\(([^)]*)\)/i;
const RE_LINK_TEXT = /\[([^\]]*)\]/i;
const RE_LINK_JS = /javascript:/gi;

// Converts links
// FROM:
// [some link text](http://the/link/url)
// TO:
// <a href="http://the/link/url">some link text</a>
function mdToHtml(Handlebars, markdownText) {
  const linkTemplate = Handlebars.compile('<a href="{{href}}">{{text}}</a>');
  /* eslint  @okta/okta/no-specific-methods: 0*/

  let res;

  if (!__WEBPACK_IMPORTED_MODULE_0__underscore_wrapper__["default"].isString(markdownText)) {
    res = '';
  } else {
    res = Handlebars.Utils.escapeExpression(markdownText)
      .replace(RE_LINK_JS, '')
      .replace(RE_LINK, function (mdLink) {
        return linkTemplate({
          href: mdLink.match(RE_LINK_HREF)[1],
          text: mdLink.match(RE_LINK_TEXT)[1]
        });
      });
  }
  return new Handlebars.SafeString(res);
}


/***/ }),
/* 53 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_handlebars___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_handlebars__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__jquery_wrapper__ = __webpack_require__(2);
/* eslint @okta/okta/no-specific-modules: 0 */



__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a.registerHelper('xsrfTokenInput', function () {
  return new __WEBPACK_IMPORTED_MODULE_0_handlebars___default.a.SafeString(
    '<input type="hidden" class="hide" name="_xsrfToken" ' + 'value="' + Object(__WEBPACK_IMPORTED_MODULE_1__jquery_wrapper__["default"])('#_xsrfToken').text() + '">'
  );
});

/* unused harmony default export */ var _unused_webpack_default_export = (__WEBPACK_IMPORTED_MODULE_0_handlebars___default.a);


/***/ }),
/* 54 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__framework_ListView__ = __webpack_require__(55);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__BaseView__ = __webpack_require__(1);



/**
 * See {@link src/framework/ListView} for more detail and examples from the base class.
 * @class module:Okta.ListView
 * @extends src/framework/ListView
 * @mixes module:Okta.View
 */
/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_1__BaseView__["default"].decorate(__WEBPACK_IMPORTED_MODULE_0__framework_ListView__["a" /* default */]));


/***/ }),
/* 55 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__View__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__ = __webpack_require__(0);
/* eslint-disable max-statements */



/**
   * Archer.ListView is a {@link src/framework/View} that operates on a
   * collection and builds a list of "things" of the same type.
   *
   * Automagically adds, removes and sorts upon standard collection events.
   *
   * Listen to collection events so the ListView will do the right thing when
   * a model is added or the collection is reset or sorted.
   *
   * @class src/framework/ListView
   * @extends src/framework/View
   * @param {Object} options options hash
   * @param {Object} options.collection The collection which this view operates on
   * @example
   * var UserList = Archer.ListView.extend({
   *   tagName: 'ul',
   *   item: '<li>{{fname}} {{lname}}</li>'
   * });
   *
   * var users = new Archer.Collection([
   *   {fname: 'John', lname: 'Doe'},
   *   {fname: 'Jane', lname: 'Doe'}
   * ]);
   *
   * var userList = new UserList({collection: users}).render();
   * userList.el; //=> "<ul><li>John Doe</li><li>Jane Doe</li></ul>"
   *
   * users.push({fname: 'Jim', lname: 'Doe'});
   * userList.el; //=> "<ul><li>John Doe</li><li>Jane Doe</li><li>Jim Doe</li></ul>"
   *
   * users.first().destroy();
   * userList.el; //=> "<ul><li>Jane Doe</li><li>Jim Doe</li></ul>"
   */
/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_0__View__["a" /* default */].extend(/** @lends src/framework/ListView.prototype */ {

  constructor: function () {
    __WEBPACK_IMPORTED_MODULE_0__View__["a" /* default */].apply(this, arguments);
    if (!this.collection) {
      throw new Error('Missing collection');
    }
    this.listenTo(this.collection, 'reset sort', this.reset);
    this.listenTo(this.collection, 'add', this.addItem);

    if (this.fetchCollection) {
      this.collection.fetch();
    } else {
      this.collection.each(this.addItem, this);
    }
  },

  /**
     * The view/template we will use to render each model in the collection.
     * @type {String|module:Okta.View}
     */
  item: null,

  /**
     * A selector in the local template where to append each item
     * @type {String}
     */
  itemSelector: null,

  /**
     * Empty the list and re-add everything from the collection.
     * Usefull for handling `collection.reset()` or for handling the initial load
     * @protected
     */
  reset: function () {
    this.removeChildren();
    this.collection.each((model, index) => {
      this.addItem(model, index);
    });
    return this;
  },

  /**
     * Add an item view to the list that will represent one model from the collection
     *
     * Listen to the model so when it is destoyed or removed from the collection
     * this item will remove itself from the list
     *
     * @param {Backbone.Model} model The model this row operates on
     * @protected
     */
  addItem: function (model) {
    var view = this.add(this.item, this.itemSelector, {options: {model: model}}).last();
    if (this.state && this.state.get('trackItemAdded')) {
      this.state.trigger('itemAdded', view);
    }
    view.listenTo(model, 'destroy remove', view.remove);
    return this;
  },

  addShowMore: __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].noop

}));


/***/ }),
/* 56 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util_TemplateUtil__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__BaseView__ = __webpack_require__(1);




const optionsTemplate = __WEBPACK_IMPORTED_MODULE_2__util_TemplateUtil__["default"].tpl(
  '\
    <a href="" class="icon-16 {{className}}" data-se="{{seleniumId}}">\
      {{#if icon}}\
      <span class="icon {{icon}}"></span>\
      {{/if}}\
      {{#if title}}\
      {{title}}\
      {{/if}}\
      {{#if subtitle}}\
        <p class="option-subtitle">{{subtitle}}</p>\
      {{/if}}\
   </a>\
   '
);
const BaseDropDownDropDownOption = __WEBPACK_IMPORTED_MODULE_3__BaseView__["default"].extend({
  tagName: 'li',

  events: {
    click: function (e) {
      e.preventDefault();
      this.action && this.action.call(this);
    }
  },

  constructor: function () {
    __WEBPACK_IMPORTED_MODULE_3__BaseView__["default"].apply(this, arguments);
    this.$el.addClass('okta-dropdown-option option');
  },

  render: function () {
    this.$el.html(
      optionsTemplate({
        icon: __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'icon'),
        className: __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'className') || '',
        title: __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'title'),
        subtitle: __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'subtitle'),
        seleniumId: __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'seleniumId')
      })
    );
    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'disabled')) {
      this.disable();
    }
    return this;
  },

  disable: function () {
    this.$el.addClass('option-disabled');
    this.$el.find('a').attr('tabindex', '-1');
  }
});
/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_3__BaseView__["default"].extend({
  events: {
    'click a.option-selected': function (e) {
      e.preventDefault();
      if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'disabled')) {
        e.stopPropagation();
      }
    },
    'click .dropdown-disabled': function (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  },

  items: [],

  constructor: function () {
    const className = this.className;

    // In this very specific case we want to NOT append className to $el
    // but to the <a> tag in the template
    // so we want to disable backbone default functionality.

    this.className = null;

    __WEBPACK_IMPORTED_MODULE_3__BaseView__["default"].apply(this, arguments);

    this.className = className;

    this.$el.addClass('dropdown more-actions float-l');

    __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].each(
      __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'items'),
      function (option) {
        this.addOption(option, this.options);
      },
      this
    );
  },

  template:
    '\
      <a href="#" class="link-button {{className}} link-button-icon option-selected center"\
        aria-expanded="false" aria-controls="okta-dropdown-options">\
        {{#if icon}}\
        <span class="icon {{icon}}"></span>\
        {{/if}}\
        {{#if screenReaderText}}\
        <span class="off-screen">{{screenReaderText}}</span>\
        {{/if}}\
        <span class="option-selected-text">{{title}}</span>\
        <span class="icon-dm"></span>\
      </a>\
      <div id="okta-dropdown-options" class="options clearfix" style="display: none;">\
      <ul class="okta-dropdown-list options-wrap clearfix"></ul>\
      </div>\
    ',

  getTemplateData: function () {
    const className = [__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'className') || '', __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'disabled') ? 'dropdown-disabled' : ''];

    return {
      icon: __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'icon'),
      className: __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"].trim(className.join(' ')),
      title: __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'title'),
      screenReaderText: __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'screenReaderText')
    };
  },

  addOption: function (proto, options) {
    this.add(BaseDropDownDropDownOption.extend(proto), 'ul.options-wrap', { options: options || {} });
  }
}));


/***/ }),
/* 57 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util_StringUtil__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__util_TemplateUtil__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__BaseView__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_ReadModeBar__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_Toolbar__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__helpers_ErrorBanner__ = __webpack_require__(59);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__helpers_ErrorParser__ = __webpack_require__(60);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__helpers_FormUtil__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__helpers_InputContainer__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__helpers_InputFactory__ = __webpack_require__(62);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__helpers_InputLabel__ = __webpack_require__(63);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__helpers_InputWrapper__ = __webpack_require__(64);
/* eslint max-statements: [2, 11] */














const template =
  '\
    {{#if hasReadMode}}\
      <h2 class="o-form-title-bar" data-se="o-form-title-bar">\
        {{title}}\
      </h2>\
    {{/if}}\
    <div data-se="o-form-content" class="o-form-content {{layout}} clearfix">\
      {{#unless hasReadMode}}\
        {{#if title}}\
          <h2 data-se="o-form-head" class="okta-form-title o-form-head">{{title}}</h2>\
        {{/if}}\
      {{/unless}}\
      {{#if subtitle}}\
        <p class="okta-form-subtitle o-form-explain" data-se="o-form-explain">{{subtitle}}</p>\
      {{/if}}\
      <div class="o-form-error-container" data-se="o-form-error-container"></div>\
      <div class="o-form-fieldset-container" data-se="o-form-fieldset-container"></div>\
    </div>\
  ';
const pointerEventsSupported = Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])('<div>').css({ 'pointer-events': 'auto' })[0].style.pointerEvents === 'auto';

// polyfill for `pointer-events: none;` in IE < 11
// Logic borrowed from https://github.com/kmewhort/pointer_events_polyfill (BSD)

function pointerEventsPolyfill(e) {
  if (!pointerEventsSupported && this.$el.hasClass('o-form-saving')) {
    const $el = Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])(e.currentTarget);

    $el.css('display', 'none');
    const underneathElem = document.elementFromPoint(e.clientX, e.clientY);

    $el.css('display', 'block');

    e.target = underneathElem;
    Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])(underneathElem).trigger(e);

    return false;
  }
}

const events = {
  submit: function (e) {
    e.preventDefault();
    this.__save();
  }
};

__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].each(['click', 'dblclick', 'mousedown', 'mouseup'], function (event) {
  events[event + ' .o-form-input'] = pointerEventsPolyfill;
});

const attributes = function (model) {
  model || (model = {});
  const collection = (model && model.collection) || {};

  return {
    method: 'POST',
    action: __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(model, 'urlRoot') || __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(collection, 'url') || window.location.pathname,
    'data-se': 'o-form',
    slot: 'content'
  };
};

const convertSavingState = function (rawSavingStateEvent, defaultEvent) {
  rawSavingStateEvent || (rawSavingStateEvent = '');
  let savingStateEvent = [];

  if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isString(rawSavingStateEvent)) {
    savingStateEvent = rawSavingStateEvent.split(' ');
  }
  savingStateEvent = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].union(savingStateEvent, defaultEvent);
  return savingStateEvent.join(' ');
};

const getErrorSummary = function (responseJSON = {}) {
  if (Array.isArray(responseJSON.errorCauses) && responseJSON.errorCauses.length > 0) {
    //set errorSummary from first errorCause which is not field specific error
    return responseJSON.errorCauses[0].errorSummary;
  } else {
    //set errorSummary from top level errorSummary
    return responseJSON.errorSummary;
  }
};
/**
 * A Form utility framework
 *
 * Okta.Form is a form that operates on one flat model
 * It exposes one main factory method, {@link module:Okta.Form#addInput|addInput}, which add inputs to the form,
 * and each input operates on one field in the model, identified by the `name` field.
 *
 * See:
 * [Basic O-Form Tutorial](https://github.com/okta/courage/wiki/Basic-O-Form)
 *
 * @class module:Okta.Form
 * @extends module:Okta.View
 * @param {Object} options options hash (See {@link module:Okta.View|View})
 * @param {Object} options.model the model this form operates on
 * @param {Boolean} [options.label-top=false] position label on top of inputs
 * @param {Boolean} [options.wide=false] Use a wide input layout for all input
 */

/**
 * Fired when the "Save" button is clicked
 * @event module:Okta.Form#save
 * @param {module:Okta.Model} model Model used in the form
 */

/**
 * Fired after the model is successfully saved - applies when {@link module:Okta.Form#autoSave|autoSave}
 * is set to true
 * @event module:Okta.Form#saved
 * @param {module:Okta.Model} model Model used in the form
 */

/**
 * Fired when the model fires an invalid event or an error event;
 * @event module:Okta.Form#error
 * @param {module:Okta.Model} model Model used in the form
 */

/**
 * Fired when the form layout is likely to be resized
 * @event module:Okta.Form#resize
 * @param {module:Okta.Model} model Model used in the form
 */

/**
 * Fired when the "Cancel" button is clicked
 * @event module:Okta.Form#cancel
 */

/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_4__BaseView__["default"].extend(
  /** @lends module:Okta.Form.prototype */ {
    /**
     * Specifies how to validate form:
     * - In case "local" string provided as a value of the property,
     * the form will validate only fields added as inputs to the form;
     * - In case array is provided, the validation will be performed only for fields specified in array;
     * - In case function is provided, provided function will be used as a validation function,
     * it must return an error object with the format {fieldName: 'error text'} with as many fields as you need.
     * @name validate
     * @memberof module:Okta.Form
     * @type {String|Array|Function}
     * @instance
     */

    constructor: function (options) {
      /* eslint max-statements: 0, complexity: 0 */
      options || (options = {});
      this.options = options;

      this.id = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].uniqueId('form');
      this.tagName = 'form';

      __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].defaults(this.events, events);
      __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].defaults(this.attributes, attributes(options.model));

      this.__buttons = [];
      this.__errorFields = {};

      this.__saveModelState(options.model);

      if (this.step) {
        if (!this.save) {
          this.save = !this.totalSteps || this.step === this.totalSteps ? 'Finish' : 'Next';
        }
        this.className += ' wizard';
      }
      this.className += ' o-form';

      this.__toolbar = this.__createToolbar(options);

      __WEBPACK_IMPORTED_MODULE_4__BaseView__["default"].call(this, options);

      __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].each(
        __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, 'inputs') || [],
        function (input) {
          // to ingore extra argumests from `each` iteratee function
          // http://underscorejs.org/#each
          this.__addLayoutItem(input);
        },
        this
      );

      this.add(this.__toolbar, '');

      this.listenTo(this.model, 'change:__edit__', this.__applyMode);

      this.listenTo(
        this.model,
        'invalid error',
        __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].throttle(
          function (model, resp, showBanner) {
            this.__showErrors(model, resp, showBanner !== false);
          },
          100,
          { trailing: false }
        )
      );

      this.listenTo(this.model, 'form:resize', function () {
        this.trigger('resize');
      });

      this.listenTo(this.model, 'form:cancel', __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].throttle(this.__cancel, 100, { trailing: false }));
      this.listenTo(this.model, 'form:previous', __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].throttle(this.__previous, 100, { trailing: false }));

      this.__save = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].throttle(this.__save, 200, { trailing: false });
      this.listenTo(this.model, 'form:save', function () {
        this.$el.submit();
      });

      this.listenTo(this.model, 'sync', function () {
        if (this.model.get('__edit__')) {
          this.model.set('__edit__', false, { silent: true });
        }
        this.__saveModelState(this.model);
        this.render();
      });

      let hasSavingState = this.getAttribute('hasSavingState');

      if (this.getAttribute('autoSave')) {
        this.listenTo(this, 'save', function (model) {
          const xhr = model.save();

          if (xhr && xhr.done) {
            xhr.done(() => {
              this.trigger('saved', model);
            });
          }
        });
        if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isUndefined(hasSavingState)) {
          hasSavingState = true;
        }
      }

      /*
     * Attach model event listeners
     * by default, model's request event starts the form saving state,
     * error and sync event stops it
     * you can define customized saving start and stop state, like
     * customSavingState: {start: 'requestingAdditionalInfo', stop: 'retrievedAdditionalInfo'}
     * doing this does not override the default events
     */
      if (hasSavingState) {
        const customSavingState = this.getAttribute('customSavingState', {});

        this.listenTo(
          this.model,
          convertSavingState(customSavingState.start || '', ['request']),
          this.__setSavingState
        );
        this.listenTo(
          this.model,
          convertSavingState(customSavingState.stop || '', ['error', 'sync']),
          this.__clearSavingState
        );
      }
    },

    /**
     * Create the bottom button bar
     * @param  {Object} options options h
     * @return {Okta.View} The toolbar
     * @private
     */
    __createToolbar: function (options) {
      const danger = this.getAttribute('danger');
      const saveBtnClassName = danger === true ? 'button-error' : 'button-primary';
      const toolbar = new __WEBPACK_IMPORTED_MODULE_6__components_Toolbar__["default"](
        __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].extend(
          {
            save: this.save || __WEBPACK_IMPORTED_MODULE_2__util_StringUtil__["default"].localize('oform.save', 'courage'),
            saveId: this.saveId,
            saveClassName: saveBtnClassName,
            cancel: this.cancel || __WEBPACK_IMPORTED_MODULE_2__util_StringUtil__["default"].localize('oform.cancel', 'courage'),
            noCancelButton: this.noCancelButton || false,
            hasPrevStep: this.step && this.step > 1
          },
          options || this.options
        )
      );

      __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].each(this.__buttons, function (args) {
        toolbar.addButton.apply(toolbar, args);
      });

      return toolbar;
    },

    className: '',

    attributes: {},

    events: {},

    /**
     * An array of input configurations to render in the form
     * @type {Array}
     */
    inputs: [],

    template: null,

    /**
     * Does the form support read/edit toggle.
     * @type {Boolean|Function}
     * @default false
     */
    read: false,

    /**
     * Is the form in readOnly mode.
     * @type {Boolean|Function}
     * @default false
     */
    readOnly: false,

    /**
     * Should we not render the button bar
     * @type {Boolean|Function}
     * @default false
     */
    noButtonBar: false,

    /**
     * Should we not render a cancel button
     * @type {Boolean|Function}
     * @default false
     */
    noCancelButton: false,

    /**
     * The text on the save button
     * @type {String}
     * @default "Save"
     */
    save: null,

    /**
     * The text on the cancel button
     * @type {String}
     * @default "Cancel"
     */
    cancel: null,

    /**
     * To use button-error to style the submit button instead of button-primary.
     * @type {Boolean|Function}
     * @default false
     */
    danger: false,

    /**
     * A layout CSS class to add to the form
     * @type {String|Function}
     * @default ""
     */
    layout: '',

    /**
     * The step this form is in the context of a wizard
     * @type {Number}
     */
    step: undefined,

    /**
     * The total numbers of steps the wizard this form is a part of has
     * @type {Number}
     */
    totalSteps: undefined,

    /**
     * The form's title
     * @type {String|Function}
     */
    title: null,

    /**
     * The form's subtitle
     * @type {String|Function}
     */
    subtitle: null,

    /**
     * Auto-save the model when hitting save. Triggers a `saved` event when done
     * @type {Boolean}
     * @default false
     */
    autoSave: false,

    /**
     * Scroll to the top of the form on error
     * @type {Boolean|Function}
     * @default true
     */
    scrollOnError: true,

    /**
     * Show the error banner upon error
     * @type {Boolean|Function}
     * @default true
     */
    showErrors: true,

    /**
     * The form's scrollable area
     * @type {String}
     * @default ".o-form-content"
     */
    resizeSelector: '.o-form-content',

    /**
     * Sets whether or not the form shows the saving state when
     * the model is saved.  Has no effect on setSavingState and clearSavingState as those are manual calls
     * to trigger/clear the saving state.
     * @name hasSavingState
     * @memberof module:Okta.Form
     * @type {Boolean}
     * @default false
     * @instance
     */

    /**
     * Get an attribute value from options or instance.
     * Prefer options value over instance value
     * @param  {String} name Name of the attribute
     * @param  {Object} defaultValue the default value to return if the attribute is not found
     * @return {Object} The value
     */
    getAttribute: function (name, defaultValue) {
      let value = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].resultCtx(this.options, name, this);

      if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isUndefined(value)) {
        value = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].result(this, name);
      }
      return !__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isUndefined(value) ? value : defaultValue;
    },

    /**
     * Does this form have a "read" mode
     * @return {Boolean}
     */
    hasReadMode: function () {
      return !!this.getAttribute('read');
    },

    /**
     * Is this form in "read only" mode
     * @return {Boolean}
     */
    isReadOnly: function () {
      return !!this.getAttribute('readOnly');
    },

    /**
     * Does this form have a button bar
     * @return {Boolean}
     */
    hasButtonBar: function () {
      return !(this.getAttribute('noButtonBar') || this.isReadOnly());
    },

    render: function () {
      this.__readModeBar && this.__readModeBar.remove();
      if (this.hasReadMode() && !this.isReadOnly()) {
        const readModeBar = __WEBPACK_IMPORTED_MODULE_5__components_ReadModeBar__["a" /* default */].extend({
          formTitle: this.getAttribute('title', '')
        });

        this.__readModeBar = this.add(readModeBar, '.o-form-title-bar').last();
      }

      const html = __WEBPACK_IMPORTED_MODULE_3__util_TemplateUtil__["default"].tpl(template)({
        layout: this.getAttribute('layout', ''),
        title: this.getAttribute('title', '', true),
        subtitle: this.getAttribute('subtitle', '', true),
        hasReadMode: this.hasReadMode()
      });

      this.$el.html(html);
      delete this.template;

      __WEBPACK_IMPORTED_MODULE_4__BaseView__["default"].prototype.render.apply(this, arguments);

      this.__applyMode();

      return this;
    },

    /**
     * Changes form UI to indicate saving.  Disables all inputs and buttons.  Use this function if you have set
     * hasSavingState to false on the the form
     * @private
     */
    __setSavingState: function () {
      this.model.trigger('form:set-saving-state');
      this.$el.addClass('o-form-saving');
    },

    /**
     * Changes form UI back to normal from the saving state.  Use this function if you are have set hasSavingState
     * to false on the form
     * @private
     */
    __clearSavingState: function () {
      this.model.trigger('form:clear-saving-state');
      this.$el.removeClass('o-form-saving');
    },

    /**
     * Toggles the visibility of the bottom button bar
     * @private
     */
    __toggleToolbar: function () {
      this.__toolbar && this.__toolbar.remove();
      if (this.hasButtonBar() && this._editMode()) {
        this.__toolbar = this.__createToolbar();
        this.add(this.__toolbar, '');
      }
      this.trigger('resize');
    },

    /**
     * Cancels this form
     * - Reset the model to the previous state
     * - Clears all errors
     * - Triggers a `cancel` event
     * - Sets the model to read mode (if applicable)
     * @private
     * @fires cancel
     */
    __cancel: function () {
      const edit = this.model.get('__edit__');
      /* eslint max-statements: [2, 12] */

      this.model.clear({ silent: true });
      let data;

      if (this.model.sanitizeAttributes) {
        data = this.model.sanitizeAttributes(this.__originalModel);
      } else {
        data = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].clone(this.__originalModel);
      }
      this.model.set(data, { silent: true });
      this.trigger('cancel', this.model);
      this.model.trigger('cache:clear');
      if (edit) {
        this.model.set('__edit__', false, { silent: true });
        this.model.trigger('change:__edit__', this.model, false);
      }
      this.clearErrors();
    },

    /**
     * Runs {@link module:Okta.Form#validate|validate} to check the model state.
     * Triggers an "invalid" event on the model if validation fails
     * @returns {Boolean}
     */
    isValid: function () {
      let res;
      const self = this;

      function validateArray(arr) {
        return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].reduce(
          arr,
          function (memo, fieldName) {
            return __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].extend(memo, self.model.validateField(fieldName));
          },
          {}
        );
      }

      if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isUndefined(this.validate)) {
        return this.model.isValid();
      } else if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(this.validate)) {
        res = this.validate();
      } else if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isArray(this.validate)) {
        res = validateArray(this.validate);
      } else if (this.validate === 'local') {
        res = validateArray(
          this.getInputs().map(function (input) {
            return input.options.name;
          })
        );
      }

      if (!__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isEmpty(res)) {
        this.model.trigger('invalid', this.model, res);
        return false;
      } else {
        return true;
      }
    },

    /**
     * A throttled function that saves the form not more than once every 100 ms
     * Basically all this method does is trigger a `save` event
     * @fires save
     * @private
     */
    __save: function () {
      this.clearErrors();
      if (this.isValid()) {
        this.trigger('save', this.model);
      }
    },

    /**
     * In the context of a wizard, go to previous state
     * Technically all this method does is trigger a `previous` event
     * @param  {Event} e
     * @private
     */
    __previous: function () {
      this.trigger('previous', this.model);
    },

    /**
     * Renders the form in the correct mode based on the model.
     * @private
     */
    __applyMode: function () {
      this.clearErrors();
      this.__toggleToolbar();

      if (this._editMode()) {
        this.$el.addClass('o-form-edit-mode');
        this.$el.removeClass('o-form-read-mode');
        this.$('.o-form-content').removeClass('rounded-btm-4');
        this.focus();
      } else {
        this.$el.removeClass('o-form-edit-mode');
        this.$el.addClass('o-form-read-mode');
        this.$('.o-form-content').addClass('rounded-btm-4');
      }
    },

    /**
     * Is the form in edit mode
     * @return {Boolean}
     * @private
     */
    _editMode: function () {
      return this.model.get('__edit__') || !this.hasReadMode();
    },

    /**
     * Function can be overridden to alter top level error summary.
     * @param {Object} responseJSON
     *
     * @example
     * // responseJSON object
     * {
     *  errorCauses: [{errorSummary: "At least one of Proxy Status, Location, or ASN should be configured."}]
     *  errorSummary: "At least one of Proxy Status, Location, or ASN should be configured."
     *  errorCode: "E0000001"
     *  errorId: "oaepsrTCHrhT-eIi8XTm6KWWg"
     *  errorLink: "E0000001"
     *  errorSummary: "Api validation failed: networkZone"
     * }
     *
     * @method
     * @default _.identity
     */
    parseErrorMessage: __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].identity,

    /**
     * Show an error message based on an XHR error
     * @param  {Okta.BaseModel} model the model
     * @param  {jqXHR} xhr The jQuery XmlHttpRequest Object
     * @private
     */
    __showErrors: function (model, resp, showBanner) {
      this.trigger('error', model);

      /* eslint max-statements: 0 */
      if (this.getAttribute('showErrors')) {
        let errorSummary;
        let responseJSON = __WEBPACK_IMPORTED_MODULE_8__helpers_ErrorParser__["a" /* default */].getResponseJSON(resp);
        const validationErrors = __WEBPACK_IMPORTED_MODULE_8__helpers_ErrorParser__["a" /* default */].parseFieldErrors(resp);

        // trigger events for field validation errors
        if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].size(validationErrors)) {
          __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].each(
            validationErrors,
            function (errors, field) {
              this.model.trigger(
                'form:field-error',
                this.__errorFields[field] || field,
                __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].map(errors, function (error) {
                  return /^model\.validation/.test(error) ? __WEBPACK_IMPORTED_MODULE_2__util_StringUtil__["default"].localize(error, 'courage') : error;
                })
              );
            },
            this
          );
        } else {
          responseJSON = this.parseErrorMessage(responseJSON);
          errorSummary = getErrorSummary(responseJSON);
        }

        // show the error message
        if (showBanner) {
          this.$('.o-form-error-container').addClass('o-form-has-errors');
          this.add(__WEBPACK_IMPORTED_MODULE_7__helpers_ErrorBanner__["a" /* default */], '.o-form-error-container', { options: { errorSummary: errorSummary } });
        }

        // slide to and focus on the error message
        if (this.getAttribute('scrollOnError')) {
          const $el = Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])('#' + this.id + ' .o-form-error-container');

          $el.length && Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])('html, body').animate({ scrollTop: $el.offset().top }, 400);
        }

        this.model.trigger('form:resize');
      }
    },

    /**
     * Clears the error banner
     * @private
     */
    clearErrors: function () {
      this.$('.o-form-error-container').removeClass('o-form-has-errors');
      this.model.trigger('form:clear-errors');
      this.model.trigger('form:resize');
    },

    /**
     * Toggles between edit and read mode
     */
    toggle: function () {
      this.model.set('__edit__', !this.hasReadMode() || !this.model.get('__edit__'));
      return this;
    },

    __addLayoutItem: function (input) {
      if (__WEBPACK_IMPORTED_MODULE_11__helpers_InputFactory__["a" /* default */].supports(input)) {
        this.addInput(input);
      } else {
        this.__addNonInputLayoutItem(input);
      }
    },

    __addNonInputLayoutItem: function (item) {
      const itemOptions = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].omit(item, 'type');

      switch (item.type) {
      case 'sectionTitle':
        this.addSectionTitle(item.title, __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].omit(itemOptions, 'title'));
        break;
      case 'divider':
        this.addDivider(itemOptions);
        break;
      default:
        throw new Error('unknown input: ' + item.type);
      }
    },

    /**
     * Adds a view to the buttons tool bar
     * @param {Object} params parameterized button options
     * @param {Object} options options to send to {@link module:Okta.View#add|View.add}
     */
    addButton: function (params, options) {
      this.__toolbar && this.__toolbar.addButton(params, options);
      this.__buttons.push([params, options]);
    },

    /**
     * Adds a divider
     */
    addDivider: function (options) {
      this.add('<div class="okta-form-divider form-divider"></div>');
      __WEBPACK_IMPORTED_MODULE_9__helpers_FormUtil__["default"].applyShowWhen(this.last(), options && options.showWhen);
      __WEBPACK_IMPORTED_MODULE_9__helpers_FormUtil__["default"].applyToggleWhen(this.last(), options && options.toggleWhen);
      return this;
    },

    /**
     * Adds section header
     * @param {String} title
     */
    addSectionTitle: function (title, options) {
      this.add(__WEBPACK_IMPORTED_MODULE_3__util_TemplateUtil__["default"].tpl('<h2 class="o-form-head">{{title}}</h2>')({ title: title }));
      __WEBPACK_IMPORTED_MODULE_9__helpers_FormUtil__["default"].applyShowWhen(this.last(), options && options.showWhen);
      __WEBPACK_IMPORTED_MODULE_9__helpers_FormUtil__["default"].applyToggleWhen(this.last(), options && options.toggleWhen);
      return this;
    },

    /**
     * Add a form input
     * @param {Object} options Options to describe the input
     * @param {String} options.type The input type.
     * The options are: `text`, `textarea`, `select`, `checkbox`, `radio`, `switch`,
     * `password`, `number`, `textselect`, `date`, `grouppicker`, `admingrouppicker`, `su-orgspicker`
     * `file/image`, `file/cert`, `checkboxset`, `list`, `group`, `zonepicker`
     * @param {String} options.name The name of the model field this input mutates
     * @param {String|Function} [options.label]
     * The input label text.
     * When passed as a function, will invoke the function (in the context of the {@link InputLabel})
     * on render time, and use the returned value.
     * @param {String} [options.sublabel] The input sub label text
     * @param {String} [options.tooltip] A popover tooltip to be displayed next to the label
     * @param {String} [options.placeholder] Placeholder text.
     * @param {String} [options.explain] Explanation text to render below the input
     * @param {Okta.View} [options.customExplain] A custom view to render below the input (deprecated)
     * @param {Boolean} [options.disabled=false] Make this input disabled
     * @param {Boolean} [options.wide=false] Use a wide input layout
     * @param {Boolean} [options.label-top=false] position label on top of an input
     * @param {Boolean} [options.explain-top=false] position explain on top of an input (requires label-top=true)
     * @param {Number} [options.multi] have multiple in-line inputs. useful when `input` is passed as an array of inputs
     * @param {String} [options.errorField] The API error field here that maps to this input
     * @param {Boolean} [options.inlineValidation=true] Validate input on focusout
     * @param {String} [options.ariaLabel] Used to add aria-label attribute to the input when label is not present.
     * @param {Object} [options.options]
     * In the context of `radio` and `select`, a key/value set of options
     *
     * @param {Object} [options.params]
     * Widget specific parameters. Varies per input.
     *
     * @param {BaseInput|Object[]} [options.input]
     * - A custom input "class" or instance - preferably a **class**, so we can automagically assign the right
     * parameters when initializing it
     * - An array of input definition object literals (such as this one)
     *
     * @param {Object} [options.showWhen]
     * Setting to define when to show (or hide) the input. The input is visible by default.
     *
     * @param {Object} [options.bindings]
     * Bind a certain model attribute to a callback function, so the function is being called on render,
     * and any time this model field changes.
     * This is similar to `showWhen` but is not limited to toggling.
     *
     * @param {Function} [options.render]
     * A post-render hook that will run upon render on InputWrapper
     *
     * @param {String|Function} className   A className to apply on the {@link InputWrapper}
     *
     * @param {Function} [options.initialize]
     * An `initialize` function to run when initializing the {@link InputWrapper}
     * Useful for state mutation on start time, and complex state logic
     *
     * @example
     * // showhen: the field will be visible when `advanced` is set to `true`
     * // and `mode` is set to `"ON"`.
     * showWhen: {
     *   'advanced': true,
     *   'mode': function (value) {
     *     return value == 'ON'; // this is identical to this.model.get('mode') == 'ON'
     *   }
     * }
     *
     * @example
     * // bindings
     * bindings: {
     *   'status mode': function (status, mode) {
     *      var labelView = this.getLabel();
     *      if (status == 1) {
     *        labelView.options.label = 'Something';
     *      }
     *      else {
     *        labelView.options.label = mode;
     *      }
     *      labelView.render();
     *   }
     * }
     */
    addInput: function (_options) {
      _options = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].clone(_options);

      __WEBPACK_IMPORTED_MODULE_9__helpers_FormUtil__["default"].validateInput(_options, this.model);

      const inputsOptions = __WEBPACK_IMPORTED_MODULE_9__helpers_FormUtil__["default"].generateInputOptions(_options, this, this.__createInput).reverse();

      // We need a local variable here to keep track
      // as addInput can be called either directy or through the inputs array.
      if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isEmpty(this.getInputs().toArray())) {
        __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].extend(inputsOptions[0], { validateOnlyIfDirty: true });
      }

      const inputs = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].map(inputsOptions, this.__createInput, this);

      __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].each(
        inputsOptions,
        function (input) {
          if (input.errorField) {
            this.__errorFields[input.errorField] = input.name;
          }
        },
        this
      );

      const options = {
        inputId: __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].last(inputs).options.inputId,
        input: inputs,
        multi: inputsOptions.length > 1 ? inputsOptions.length : undefined
      };

      __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].extend(options, __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].omit(this.options, 'input'), __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].omit(_options, 'input'));

      const inputWrapper = this.__createWrapper(options);

      if (options.label !== false) {
        inputWrapper.add(this.__createLabel(options));
      }
      inputWrapper.add(this._createContainer(options));
      inputWrapper.type = options.type || options.input.type || 'custom';

      const args = [inputWrapper].concat(__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].rest(arguments));

      return this.add.apply(this, args);
    },

    /**
     * @private
     */
    __createInput: function (options) {
      options = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].pick(options, __WEBPACK_IMPORTED_MODULE_9__helpers_FormUtil__["default"].INPUT_OPTIONS);
      return __WEBPACK_IMPORTED_MODULE_11__helpers_InputFactory__["a" /* default */].create(options);
    },

    /**
     * @private
     */
    __createWrapper: function (options) {
      options = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].pick(options, __WEBPACK_IMPORTED_MODULE_9__helpers_FormUtil__["default"].WRAPPER_OPTIONS);
      return new __WEBPACK_IMPORTED_MODULE_13__helpers_InputWrapper__["a" /* default */](options);
    },

    /**
     * @private
     */
    __createLabel: function (options) {
      options = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].pick(options, __WEBPACK_IMPORTED_MODULE_9__helpers_FormUtil__["default"].LABEL_OPTIONS);
      return new __WEBPACK_IMPORTED_MODULE_12__helpers_InputLabel__["a" /* default */](options);
    },

    /**
     * @private
     */
    _createContainer: function (options) {
      options = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].pick(options, __WEBPACK_IMPORTED_MODULE_9__helpers_FormUtil__["default"].CONTAINER_OPTIONS);
      return new __WEBPACK_IMPORTED_MODULE_10__helpers_InputContainer__["a" /* default */](options);
    },

    /**
     * Stores the current attributes of the model to a private property
     * @param  {Okta.BaseModel} model The model
     * @private
     */
    __saveModelState: function (model) {
      this.__originalModel = __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"].extend(true, {}, model.attributes);
    },

    /**
     * @override
     * @ignore
     */
    add: function () {
      const args = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].toArray(arguments);

      typeof args[1] === 'undefined' && (args[1] = '> div.o-form-content > .o-form-fieldset-container');
      return __WEBPACK_IMPORTED_MODULE_4__BaseView__["default"].prototype.add.apply(this, args);
    },

    /**
     * Set the focus on the first input in the form
     */
    focus: function () {
      const first = this.getInputs().first();

      if (first && first.focus) {
        first.focus();
      }
      return this;
    },

    /**
     * Disable all inputs in the form
     * @deprecated not currently in use
     */
    disable: function () {
      this.invoke('disable');
      return this;
    },

    /**
     * Enable all inputs in the form
     * @deprecated not currently in use
     */
    enable: function () {
      this.invoke('enable');
    },

    /**
     * Set the max-height for o-form-content class container within the form if a height is provided,
     * otherwise, get its computed inner height
     * @param {Number} the height in pixel to set for class o-form-content
     * @return {Number}
     */
    contentHeight: function (height) {
      const content = this.$('.o-form-content');

      if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isNumber(height)) {
        content.css('max-height', height);
      } else {
        return content.height();
      }
    },

    /**
     * Get only the input children
     * @return {InputWrapper[]} An underscore wrapped array of {@link InputWrapper} instances
     */
    getInputs: function () {
      return Object(__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"])(
        this.filter(function (view) {
          return view instanceof __WEBPACK_IMPORTED_MODULE_13__helpers_InputWrapper__["a" /* default */];
        })
      );
    }
  }
));


/***/ }),
/* 58 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BaseView__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__helpers_FormUtil__ = __webpack_require__(10);


/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_0__BaseView__["default"].extend({
  el: '<span class="o-form-toggle" data-type="header-btn"></span>',

  formTitle: '',

  modelEvents: {
    'change:__edit__': 'toggle'
  },

  initialize: function () {
    this.addButton();
  },

  addButton: function () {
    if (this.model.get('__edit__')) {
      this.add(__WEBPACK_IMPORTED_MODULE_1__helpers_FormUtil__["default"].createReadFormButton({ type: 'cancel' }));
    } else {
      this.add(
        __WEBPACK_IMPORTED_MODULE_1__helpers_FormUtil__["default"].createReadFormButton({
          type: 'edit',
          formTitle: this.formTitle
        })
      );
    }
  },

  toggle: function () {
    this.removeChildren();
    this.addButton();
  }
}));


/***/ }),
/* 59 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__BaseView__ = __webpack_require__(1);

const template =
  '\
    <div class="okta-form-infobox-error infobox infobox-error" role="alert">\
      <span class="icon error-16"></span>\
      {{#if errorSummary}}\
        <p>{{errorSummary}}</p>\
      {{else}}\
        <p>{{i18n code="oform.errorbanner.title" bundle="courage"}}</p>\
      {{/if}}\
    </div>\
  ';
/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_0__BaseView__["default"].extend({
  template: template,
  modelEvents: {
    'form:clear-errors': 'remove'
  }
}));


/***/ }),
/* 60 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_StringUtil__ = __webpack_require__(3);


const FIELD_REGEX = /^([\S]+): (.+)$/;
/* harmony default export */ __webpack_exports__["a"] = ({
  /**
   * Helper function that returns the json output of an xhr objext
   * @param  {jqXhr} xhr
   * @return {Object}
   */
  getResponseJSON: function (xhr) {
    try {
      return xhr.responseJSON || JSON.parse(xhr.responseText);
    } catch (e) {
      return;
    }
  },

  /**
   * Parses an error summary to extract a field name and an error message
   * @param  {String} errorSummary The raw error summary
   * @return {String[]} An array with two members: [field name, error message]
   */
  parseErrorSummary: function (errorSummary) {
    const matches = errorSummary.match(FIELD_REGEX);
    // error format is: `fieldName: The field cannot be left blank`

    if (matches) {
      return [matches[1], matches[2]];
    }
  },

  /**
   * Parses an error cause object to extract a field name from property attribute
   * and an error message form errorSummary attribute. It looks to see if there is
   * a custom override/translation for the erorrCause.reason before using the errorSummary
   * @param  {Object} errorCause object
   * @return {String[]} An array with two members: [field name, error message]
   */
  parseErrorCauseObject: function (errorCause) {
    if (errorCause.property && errorCause.errorSummary) {
      const localizedMsg = __WEBPACK_IMPORTED_MODULE_1__util_StringUtil__["default"].localize(errorCause.reason);
      const apiMsg = errorCause.errorSummary;
      const field = errorCause.property;
      const errorMessage = localizedMsg.indexOf('L10N_ERROR[') === -1 ? localizedMsg : apiMsg;

      return [field, errorMessage];
    }
  },

  parseErrors: function (resp) {
    const responseJSON = this.getResponseJSON(resp);

    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].map((responseJSON && responseJSON.errorCauses) || [], function (errorCause) {
      return ('' + errorCause.errorSummary).replace(FIELD_REGEX, '$2');
    });
  },

  /**
   * Parses the response for errors
   * Returns a map of field names > array or error messages
   * Example:
   * ```javascript
   * {
   *   url: ['The field cannot be left blank', 'The field has to be a valid URI'],
   *   name: ['The field cannot be left blank']
   * }
   * ```
   * @param  {Object} resp
   * @return {Object}
   */
  parseFieldErrors: function (resp) {
    const responseJSON = this.getResponseJSON(resp);
    const errors = {};

    // xhr error object
    if (responseJSON) {
      /* eslint complexity: [2, 7] */
      __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(
        responseJSON.errorCauses || [],
        function (cause) {
          let res = [];

          if (cause.property && cause.errorSummary) {
            res = this.parseErrorCauseObject(cause);
          } else {
            res = this.parseErrorSummary((cause && cause.errorSummary) || '');
          }
          if (res) {
            const fieldName = res[0];
            const message = res[1];

            errors[fieldName] || (errors[fieldName] = []);
            errors[fieldName].push(message);
          }
        },
        this
      );
    }
    // validation key/value object
    else if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isObject(resp) && __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].size(resp)) {
      __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(resp, function (msg, field) {
        errors[field] = [msg];
      });
    }
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].size(errors) ? errors : undefined;
  }
});


/***/ }),
/* 61 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_Logger__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util_TemplateUtil__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__util_Util__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__util_StringUtil__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__BaseView__ = __webpack_require__(1);






const isABaseView = __WEBPACK_IMPORTED_MODULE_3__util_Util__["default"].isABaseView;
/**
 * @class InputContainer
 * @private
 *
 * TODO: OKTA-80796
 * Attention: Please change with caution since this is used in other places
 */

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_5__BaseView__["default"].extend({
  attributes: function () {
    return {
      'data-se': 'o-form-input-container'
    };
  },

  className: function () {
    let className = 'o-form-input';

    if (this.options.wide) {
      className += ' o-form-wide';
    }
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].contains([1, 2, 3, 4], this.options.multi)) {
      className += ' o-form-multi-input-' + this.options.multi;
      if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(this.options.input)) {
        const inputGroup = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].find(this.options.input, function (input) {
          return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].contains(['text+select', 'select+text'], input.options.type);
        });

        inputGroup && (className += ' o-form-multi-input-group-' + this.options.multi);
      }
    }
    return className;
  },

  _getNames: function () {
    const names = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(this.options.name) ? this.options.name : [this.options.name];
    /*eslint complexity: 0 */

    if (this.options.type === 'group') {
      names.push.apply(names, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].pluck(this.options.input[0].options.params.inputs, 'name'));
    } else if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(this.options.name)) {
      if (this.options.input && this.options.input.options && this.options.input.options.name) {
        names.push(this.options.input.options.name);
      }
    } else if (this.options.input) {
      if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(this.options.input)) {
        __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(this.options.input, function (inputItem) {
          names.push(inputItem.options.name);
        });
      } else {
        names.push(this.options.input.options.name);
      }
    }
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].uniq(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].compact(names));
  },

  constructor: function () {
    /* eslint max-statements: [2, 18] */
    __WEBPACK_IMPORTED_MODULE_5__BaseView__["default"].apply(this, arguments);

    const explainTop = this.options['explain-top'] && this.options['label-top'];
    if (this.options.input) {
      if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(this.options.input)) {
        __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(
          this.options.input,
          function (inputItem) {
            this.add(inputItem, { prepend: !explainTop });
          },
          this
        );
      } else {
        this.add(this.options.input, { prepend: !explainTop });
      }
    }

    this.__setExplain(this.options);

    const names = this._getNames();

    this.listenTo(this.model, 'form:field-error', function (name, errors) {
      if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].contains(names, name)) {
        this.__setError(errors, explainTop);
      }
    });

    this.listenTo(this.model, 'form:clear-errors change:' + names.join(' change:'), this.__clearError);
    this.listenTo(this.model, 'form:clear-error:' + names.join(' form:clear-error:'), this.__clearError);

    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].resultCtx(this.options, 'autoRender', this)) {
      this.listenTo(this.model, 'change:' + this.options.name, this.render);
    }

    this.__errorState = false;
  },

  /**
   * Populates the explain on the input container (if it exists). There are
   * two ways to use this:
   * 1. Raw text - wraps in the correct html template
   * 2. Custom html
   *    - pass in a View class (preferred)
   *    - pass in an instance of a View
   * Some additional notes:
   * - You can pass a function that returns any of the above
   * - This maintains support for the deprecated "customExplain" property
   *   that was used before. This pattern is superseded by explain, so use
   *   that instead.
   * @private
   */
  __setExplain: function (options) {
    let explain;

    // Deprecated - if you need custom html, use explain instead
    if (options.customExplain) {
      __WEBPACK_IMPORTED_MODULE_1__util_Logger__["default"].warn('Deprecated - use explain instead of customExplain');
      this.add(this.options.customExplain);
      return;
    }

    explain = options.explain;
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(explain) && !isABaseView(explain)) {
      explain = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].resultCtx(this.options, 'explain', this);
    }
    if (!explain) {
      return;
    }

    if (isABaseView(explain)) {
      this.template = '<p class="o-form-explain"></p>';
      this.add(explain, '.o-form-explain');
    } else {
      this.template = '<p class="o-form-explain">{{explain}}</p>';
    }
  },

  /**
   * Highlight the input as invalid (validation failed)
   * Adds an explaination message of the error
   * @private
   */
  __setError: function (errors, explainTop) {
    this.__errorState = true;
    this.$el.addClass('o-form-has-errors');

    const errorId = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].uniqueId('input-container-error');
    const tmpl = [
      '<p id="{{errorId}}" class="okta-form-input-error o-form-input-error o-form-explain" role="alert">',
      '<span class="icon icon-16 error-16-small" role="img" aria-label="{{iconLabel}}"></span>',
      '{{text}}',
      '</p>',
    ].join('');

    const iconLabel = __WEBPACK_IMPORTED_MODULE_4__util_StringUtil__["default"].localize('oform.error.icon.ariaLabel', 'courage'); // 'Error'
    const html = __WEBPACK_IMPORTED_MODULE_2__util_TemplateUtil__["default"].tpl(tmpl)({
      errorId: errorId,
      iconLabel: iconLabel,
      text: errors.join(', ')
    });

    const $elExplain = this.$('.o-form-explain')
      .not('.o-form-input-error')
      .first();

    if ($elExplain.length && !explainTop) {
      $elExplain.before(html);
    } else {
      this.$el.append(html);
    }

    this.$el.attr('aria-describedby', errorId);
  },

  /**
   * Un-highlight the input and remove explaination text
   * @private
   */
  __clearError: function () {
    if (this.__errorState) {
      this.$('.o-form-input-error').remove();
      this.$el.attr('aria-describedby', null);
      this.$el.removeClass('o-form-has-errors');
      this.__errorState = false;
      __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defer(() => {
        this.model.trigger('form:resize');
      });
    }
  },

  focus: function () {
    this.each(function (view) {
      if (view.focus) {
        return view.focus();
      }
    });

    return this;
  }
}));


/***/ }),
/* 62 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__InputRegistry__ = __webpack_require__(26);
/* eslint complexity: 0, max-statements: 0 */



function createInput(Input, options) {
  if (__WEBPACK_IMPORTED_MODULE_1__InputRegistry__["default"].isBaseInput(Input)) {
    return Input.prototype ? new Input(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].omit(options, 'input')) : Input;
  } else {
    return Input;
  }
}

function create(options) {
  options = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].clone(options);
  if (options.input) {
    return createInput(options.input, options);
  }
  const Input = __WEBPACK_IMPORTED_MODULE_1__InputRegistry__["default"].get(options);

  if (!Input) {
    throw new Error('unknown input: ' + options.type);
  }
  return createInput(Input, options);
}

function supports(options) {
  return !!options.input || !!__WEBPACK_IMPORTED_MODULE_1__InputRegistry__["default"].get(options);
}

/* harmony default export */ __webpack_exports__["a"] = ({
  create: create,
  supports: supports
});


/***/ }),
/* 63 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_qtip__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_qtip___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_qtip__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util_TemplateUtil__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__BaseView__ = __webpack_require__(1);





/**
 * @class InputLabel
 * @extends {Okta.View}
 * @private
 * The input's label.
 */
/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_3__BaseView__["default"].extend({
  className: 'okta-form-label o-form-label',

  attributes: {
    'data-se': 'o-form-label'
  },

  /**
   * @constructor
   * @param  {Object} options options hash
   * @param  {String} [options.type] Input type
   * @param  {String|Function} [options.label] Label text
   * @param  {String|Function} [options.sublabel] Sub label text
   * @param  {String|Function} [options.tooltip] Tooltip text
   * @param  {String|Function} [options.inputId] Id of the inputs
   * @param  {String|Function} [options.id] Id of the inputs
   */
  constructor: function (options) {
    /* eslint max-statements: [2, 16] complexity: [2, 7]*/
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults(options, { inputId: options.id });
    delete options.id;

    __WEBPACK_IMPORTED_MODULE_3__BaseView__["default"].apply(this, arguments);

    let template;

    if (this._isLabelView(options.label)) {
      template = '<label for="{{inputId}}"></label>';
    } else if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].contains(['radio', 'checkbox'], options.type) || !options.label) {
      template = '{{label}}';
    } else {
      //space added in the end of the label to avoid selecting label text with double click in read mode
      template = '<label for="{{inputId}}">{{label}}&nbsp;</label>';
    }
    if (options.sublabel) {
      template += '<span class="o-form-explain">{{sublabel}}</span>';
    }
    if (options.tooltip) {
      if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isString(options.tooltip)) {
        options.tooltip = {
          text: options.tooltip
        };
      }
      template += '<span class="o-form-tooltip icon-16 icon-only form-help-16" title="{{tooltip.text}}"></span>';
    }
    this.template = __WEBPACK_IMPORTED_MODULE_2__util_TemplateUtil__["default"].tpl(template);
  },

  getTemplateData: function () {
    const options = { label: '' };

    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(
      ['inputId', 'label', 'sublabel', 'tooltip'],
      function (option) {
        options[option] = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].resultCtx(this.options, option, this);
      },
      this
    );

    return options;
  },

  _isLabelView: function (label) {
    return !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isUndefined(label) && label instanceof __WEBPACK_IMPORTED_MODULE_3__BaseView__["default"];
  },

  postRender: function () {
    const options = this.getTemplateData();

    if (this._isLabelView(options.label)) {
      this.removeChildren();
      this.add(options.label, 'label');
    }

    if (options.tooltip) {
      this.$('.o-form-tooltip').qtip(
        __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend(
          {
            style: { classes: 'qtip-custom qtip-shadow' },
            position: {
              my: 'bottom left',
              at: 'top center'
            },
            hide: { fixed: true },
            show: { delay: 0 }
          },
          options.tooltip.options
        )
      );
    }
  }
}));


/***/ }),
/* 64 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__BaseView__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__FormUtil__ = __webpack_require__(10);




function runCallback(callback, field) {
  callback.apply(
    this,
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].map(
      field.split(/\s+/),
      function (field) {
        return this.model.get(field);
      },
      this
    )
  );
}

function runIf(fn, ctx) {
  if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isFunction(fn)) {
    fn.call(ctx);
  }
}

/**
 * @class InputWrapper
 * @extends Okta.View
 * @private
 * The outer wrapper that warps the label and the input container
 */
/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_1__BaseView__["default"].extend({
  className: function () {
    let className = 'o-form-fieldset';

    if (this.options['label-top']) {
      className += ' o-form-label-top';
    }

    if (this.options.readOnly) {
      className += ' o-form-read-mode';
    }

    return className;
  },

  attributes: function () {
    return {
      'data-se': this.options['data-se'] || 'o-form-fieldset'
    };
  },

  /**
   * @constructor
   * @param  {Object} options options hash
   * @param  {Object} [options.events]
   * @param  {Object} [options.bindings]
   * @param  {Object} [options.showWhen]
   * @param  {Function} [options.initialize] post initialize callback
   * @param  {Function} [options.render] post render callback
   */
  constructor: function (options) {
    if (options.className) {
      this.inputWrapperClassName = this.className;
      this.optionsClassName = options.className;
      options.className = function () {
        return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'inputWrapperClassName', '') + ' ' + __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].result(this, 'optionsClassName');
      };
    }
    __WEBPACK_IMPORTED_MODULE_1__BaseView__["default"].apply(this, arguments);
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(
      options.events || {},
      function (callback, event) {
        this.listenTo(this.model, event, callback);
      },
      this
    );

    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(
      options.bindings || {},
      function (callback, field) {
        this.listenTo(
          this.model,
          __WEBPACK_IMPORTED_MODULE_2__FormUtil__["default"].changeEventString(field.split(/\s+/)),
          __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].bind(runCallback, this, callback, field)
        );
      },
      this
    );

    __WEBPACK_IMPORTED_MODULE_2__FormUtil__["default"].applyShowWhen(this, options.showWhen);
    __WEBPACK_IMPORTED_MODULE_2__FormUtil__["default"].applyToggleWhen(this, options.toggleWhen);

    runIf(options.initialize, this);
  },

  postRender: function () {
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(this.options.bindings || {}, runCallback, this);
    runIf(this.options.render, this);
  },

  /**
   * @return {InputLabel}
   */
  getLabel: function () {
    return this.size() > 1 ? this.at(0) : null;
  },
  /**
   * @deprecated ambiguous naming, use {@link #getInputContainer}
   */
  getInput: function () {
    return this.getInputContainer();
  },

  /**
   * @return {InputContainer}
   */
  getInputContainer: function () {
    return this.at(this.size() > 1 ? 1 : 0);
  },

  /**
   * @return {BaseInput[]}
   */
  getInputs: function () {
    return this.getInputContainer().toArray();
  },

  focus: function () {
    return this.getInput().focus();
  }
}));


/***/ }),
/* 65 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_StringUtil__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__inputs_BooleanSelect__ = __webpack_require__(66);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__inputs_TextBoxSet__ = __webpack_require__(68);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__EnumTypeHelper__ = __webpack_require__(19);
/* eslint max-statements: 0, max-params: 0 */






// Maps each __displayType__ to a basic set of inputOptions.
function defaultOptions(property) {
  const type = property.get('__displayType__');
  const values = property.get('__possibleValues__');
  const name = property.get('name');
  const title = property.get('title');
  /* eslint complexity: [2, 24] */

  const inputOptions = {
    type: 'text',
    name: name,
    label: title || name
  };

  // @see customOptions for enum complex "object" type,
  // a.k.a "object" or "arrayofobject" type has enum values defined.
  // Other cases (e.g., nested object type) are not support yet.

  switch (type) {
  case 'arrayofstring':
    inputOptions.input = __WEBPACK_IMPORTED_MODULE_3__inputs_TextBoxSet__["a" /* default */];
    inputOptions.params = { itemType: 'string' };
    break;
  case 'arrayofnumber':
    inputOptions.input = __WEBPACK_IMPORTED_MODULE_3__inputs_TextBoxSet__["a" /* default */];
    inputOptions.params = { itemType: 'number' };
    break;
  case 'arrayofinteger':
    inputOptions.input = __WEBPACK_IMPORTED_MODULE_3__inputs_TextBoxSet__["a" /* default */];
    inputOptions.params = { itemType: 'integer' };
    break;
  case 'arrayofobject':
    inputOptions.input = __WEBPACK_IMPORTED_MODULE_3__inputs_TextBoxSet__["a" /* default */];
    inputOptions.params = { itemType: property.get('items').type };
    break;
  case 'arrayofref-id':
    inputOptions.input = __WEBPACK_IMPORTED_MODULE_3__inputs_TextBoxSet__["a" /* default */];
    inputOptions.params = { itemType: property.get('items').format };
    break;
  case 'boolean':
    inputOptions.input = __WEBPACK_IMPORTED_MODULE_2__inputs_BooleanSelect__["a" /* default */];
    break;
  case 'integer':
  case 'number':
    inputOptions.to = convertStringToNumber;
    break;
  case 'reference':
    inputOptions.type = 'select';
    inputOptions.options = getChoices(values);
    break;
  case 'image':
    inputOptions.readOnly = true;
    inputOptions.from = function (value) {
      return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isEmpty(value) ? '' : __WEBPACK_IMPORTED_MODULE_1__util_StringUtil__["default"].localize('user.profile.image.image_set', 'courage'); //TODO
    };
    break;
  case 'password':
    inputOptions.type = 'password';
    break;
  case 'date':
    inputOptions.type = 'date';
    break;
  case 'uri':
  case 'country-code':
  case 'country_code':
  case 'language-code':
  case 'language_code':
  case 'email':
  case 'locale':
  case 'timezone':
  case 'string':
  case 'object':
    //default input options
    break;
  default:
    throw new Error('unknown type: ' + type);
  }
  return inputOptions;
}

// Sets nonbasic inputOptions, such as an array with possible values
function customOptions(property) {
  let inputOptions = {};
  const name = property.get('name');
  const type = property.get('__displayType__');
  const values = property.get('__possibleValues__');
  const prefix = property.get('__fieldNamePrefix__');

  if (prefix) {
    inputOptions.name = prefix + name;
    inputOptions.errorField = name;
  }

  if (property.isEnumType()) {
    const configs = {
      displayType: type,
      title: property.get('title'),
      enumValues: property.getEnumValues()
    };

    inputOptions = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend({}, __WEBPACK_IMPORTED_MODULE_4__EnumTypeHelper__["a" /* default */].getEnumInputOptions(configs), inputOptions);
  } else if (isArray(type) && values) {
    inputOptions.type = 'checkboxset';
    inputOptions.input = null;
    inputOptions.options = getChoices(values);
  }

  return inputOptions;
}

function convertStringToNumber(string) {
  const number = __WEBPACK_IMPORTED_MODULE_1__util_StringUtil__["default"].parseFloat(string);

  return string === '' ? null : number;
}

function isArray(type) {
  return type && type.indexOf('array') >= 0;
}

// converts possibleValues to choices
// [a, b, c] => {a: a, b: b, c: c}
function getChoices(values) {
  return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].object(values, values);
}

// A schema property may have an objectName either
// at the root level or nested in the items object
function getObjectName(schemaProp) {
  const items = schemaProp.get('items');

  if (items) {
    return items.objectName;
  } else {
    return schemaProp.get('objectName');
  }
}

function augmentSchemaProp(schemaProp, possibleValues, profile) {
  const name = schemaProp.get('name');
  const prefix = profile['__nestedProperty__'];
  let defaultValues = possibleValues[name];
  const userValues = profile.get(name);
  let //TODO: Not implemented
      fixedValues;
  let values;

  // If API responds with a field name that differs from the form-field name
  // example: Model's 'profile.username' vs. server's 'username'
  if (prefix) {
    schemaProp.set('__fieldNamePrefix__', prefix);
  }

  // case 1: objectName - fixed list of values are set for the input
  fixedValues = possibleValues[getObjectName(schemaProp)];

  // case 2: name only - default list of values are provided, user can add more
  // TODO: this case does not yet exist, so it is not tested
  if (defaultValues && userValues) {
    defaultValues = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].union(defaultValues, userValues);
  }

  // If both fixed and default values exist,
  // take the fixed values unless they are empty
  if (fixedValues && fixedValues.length) {
    values = fixedValues;
  } else if (defaultValues && defaultValues.length) {
    values = defaultValues;
  }

  schemaProp.set('__possibleValues__', values);
}

function augmentSchemaProps(schemaProps, possibleValues, profile) {
  schemaProps.each(function (schemaProp) {
    augmentSchemaProp(schemaProp, possibleValues, profile);
  });

  return schemaProps;
}

/**
 * Remove invalid schema properties from a collection
 *
 * @param {SchemaProperties Collection} [properties] A collection of schema properties
 * @param {Object} [values] An object of the form { key: [value1, value2]}
 * @return {Array} An array of valid schema models, this can be used to reset
 * a schema properties collection for example.
 * @private
 */
function cleanSchema(properties, values) {
  return properties.filter(function (schema) {
    return isValidSchemaProp(schema, values);
  });
}

/**
 * Checks the validity of a schema property.
 *
 * @param {SchemaProperty} [schemaProp] A schema property backbone model
 * @param {Object} [values] An object of the form { key: [value1, value2]}
 * @return {Boolean} true/false
 * @private
 */
function isValidSchemaProp(schemaProp, values) {
  const objectName = getObjectName(schemaProp);
  const results = values[objectName];

  // a schema property that references an empty list of values
  // Im looking at you, google apps.
  if (objectName && Object(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"])(results).isEmpty()) {
    return false;
  }
  return true;
}

/* harmony default export */ __webpack_exports__["default"] = ({
  /**
   * Creates the options hash for BaseForm.addInput from a prepared schema
   * property.
   *
   * @param {Okta.Model} [preparedSchemaProp] A schema property backbone model
   * that has been standardized by the prepareSchema method.
   * @return {Object} An object containing all of the options needed by
   * BaseForm's addInput()
   */
  createInputOptions: function (preparedSchemaProp) {
    const custom = customOptions(preparedSchemaProp);
    const standard = defaultOptions(preparedSchemaProp);

    // underscore did not support nested extend
    // https://github.com/jashkenas/underscore/issues/162
    if (custom.params && standard.params) {
      custom.params = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults(custom.params, standard.params);
    }
    return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults(custom, standard);
  },

  hasValidSchemaProps: function (schemaProps, possibleValues) {
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isEmpty(schemaProps)) {
      return false;
    } else {
      const validSchema = cleanSchema(schemaProps, possibleValues);

      return !!validSchema.length;
    }
  },

  /**
   * This method is responsible for preparing a collection for the form
   * factory to use by putting all of the information to create an input
   * into the schema property and removing invalid properties.
   * The typical UD form takes 3 models:
   * The data model has the input values.
   * The schema model describes which input to use, such as a textbox or a checkbox.
   * The possible values model provide a list of default options to display, for example in a drop down menu.
   *
   * @param {SchemaProperty Collection} [schemaProps] A schema property backbone model.
   * @param {Object} [possibleValues] An object of the form { key: [value1, value2]}
   * @param {Okta.Model} [profile] A backbone model containing the property described by the schema property.
   * @return {SchemaProperty Collection} A schema property collection with standardized models.
   * The standard schema model adds a couple of additional private properties to
   * allow the form factory to reference lookup values or name prefixes without going to a second model.
   */
  prepareSchema: function (schemaProps, possibleValues, profile) {
    schemaProps.reset(cleanSchema(schemaProps, possibleValues));
    return augmentSchemaProps(schemaProps, possibleValues, profile);
  },

  /**
   * `prepareSchema` will reset the property list which may not be necessary at some case.
   * like when setting default value for schema properties.
   * (more detail about such case @see wiki UX, App+Entitlements+for+Provisioning)
   *
   * @param { }
   * @return {String}
   */

  augmentSchemaProps: augmentSchemaProps,

  augmentSchemaProp: augmentSchemaProp
});


/***/ }),
/* 66 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Select__ = __webpack_require__(28);

const options = {
  undefined: 'undefined',
  true: 'true',
  false: 'false'
};

const from = function (val) {
  if (val) {
    return 'true';
  }
  if (val === false) {
    return 'false';
  }
  return 'undefined';
};

const to = function (val) {
  switch (val) {
  case 'undefined':
    return null;
  case 'true':
    return true;
  case 'false':
    return false;
  default:
    return null;
  }
};

/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_0__Select__["default"].extend({
  initialize: function () {
    this.options.options = options;
    this.options.from = from;
    this.options.to = to;
  }
}));


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// Chosen, a Select Box Enhancer for jQuery and Prototype
// by Patrick Filler for Harvest, http://getharvest.com
//
// Version 0.11.1
// Full source at https://github.com/harvesthq/chosen
// Copyright (c) 2011 Harvest http://getharvest.com

// MIT License, https://github.com/harvesthq/chosen/blob/master/LICENSE.md
// This file is generated by `grunt build`, do not edit it by hand.

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(12)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (jQuery) {
  (function() {
    var SelectParser;

    SelectParser = (function() {
      function SelectParser() {
        this.options_index = 0;
        this.parsed = [];
      }

      SelectParser.prototype.add_node = function(child) {
        if (child.nodeName.toUpperCase() === "OPTGROUP") {
          return this.add_group(child);
        } else {
          return this.add_option(child);
        }
      };

      SelectParser.prototype.add_group = function(group) {
        var group_position, option, _i, _len, _ref, _results;

        group_position = this.parsed.length;
        this.parsed.push({
          array_index: group_position,
          group: true,
          label: group.label,
          children: 0,
          disabled: group.disabled
        });
        _ref = group.childNodes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          option = _ref[_i];
          _results.push(this.add_option(option, group_position, group.disabled));
        }
        return _results;
      };

      SelectParser.prototype.add_option = function(option, group_position, group_disabled) {
        if (option.nodeName.toUpperCase() === "OPTION") {
          if (option.text !== "") {
            if (group_position != null) {
              this.parsed[group_position].children += 1;
            }
            this.parsed.push({
              array_index: this.parsed.length,
              options_index: this.options_index,
              value: option.value,
              text: option.text,
              html: option.innerHTML,
              selected: option.selected,
              disabled: group_disabled === true ? group_disabled : option.disabled,
              group_array_index: group_position,
              classes: option.className,
              style: option.style.cssText
            });
          } else {
            this.parsed.push({
              array_index: this.parsed.length,
              options_index: this.options_index,
              empty: true
            });
          }
          return this.options_index += 1;
        }
      };

      return SelectParser;

    })();

    SelectParser.select_to_array = function(select) {
      var child, parser, _i, _len, _ref;

      parser = new SelectParser();
      _ref = select.childNodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        parser.add_node(child);
      }
      return parser.parsed;
    };

    this.SelectParser = SelectParser;

  }).call(this);

  (function() {
    var AbstractChosen, root;

    root = this;

    AbstractChosen = (function() {
      function AbstractChosen(form_field, options) {
        this.form_field = form_field;
        this.options = options != null ? options : {};
        if (!AbstractChosen.browser_is_supported()) {
          return;
        }
        this.is_multiple = this.form_field.multiple;
        this.set_default_text();
        this.set_default_values();
        this.setup();
        this.set_up_html();
        this.register_observers();
        this.finish_setup();
      }

      AbstractChosen.prototype.set_default_values = function() {
        var _this = this;

        this.click_test_action = function(evt) {
          return _this.test_active_click(evt);
        };
        this.activate_action = function(evt) {
          return _this.activate_field(evt);
        };
        this.active_field = false;
        this.mouse_on_container = false;
        this.results_showing = false;
        this.result_highlighted = null;
        this.result_single_selected = null;
        this.allow_single_deselect = (this.options.allow_single_deselect != null) && (this.form_field.options[0] != null) && this.form_field.options[0].text === "" ? this.options.allow_single_deselect : false;
        this.disable_search_threshold = this.options.disable_search_threshold || 0;
        this.disable_search = this.options.disable_search || false;
        this.enable_split_word_search = this.options.enable_split_word_search != null ? this.options.enable_split_word_search : true;
        this.search_contains = this.options.search_contains || false;
        this.single_backstroke_delete = this.options.single_backstroke_delete || false;
        this.max_selected_options = this.options.max_selected_options || Infinity;
        return this.inherit_select_classes = this.options.inherit_select_classes || false;
      };

      AbstractChosen.prototype.set_default_text = function() {
        if (this.form_field.getAttribute("data-placeholder")) {
          this.default_text = this.form_field.getAttribute("data-placeholder");
        } else if (this.is_multiple) {
          this.default_text = this.options.placeholder_text_multiple || this.options.placeholder_text || AbstractChosen.default_multiple_text;
        } else {
          this.default_text = this.options.placeholder_text_single || this.options.placeholder_text || AbstractChosen.default_single_text;
        }
        return this.results_none_found = this.form_field.getAttribute("data-no_results_text") || this.options.no_results_text || AbstractChosen.default_no_result_text;
      };

      AbstractChosen.prototype.mouse_enter = function() {
        return this.mouse_on_container = true;
      };

      AbstractChosen.prototype.mouse_leave = function() {
        return this.mouse_on_container = false;
      };

      AbstractChosen.prototype.input_focus = function(evt) {
        var _this = this;

        if (this.is_multiple) {
          if (!this.active_field) {
            return setTimeout((function() {
              return _this.container_mousedown();
            }), 50);
          }
        } else {
          if (!this.active_field) {
            return this.activate_field();
          }
        }
      };

      AbstractChosen.prototype.input_blur = function(evt) {
        var _this = this;

        if (!this.mouse_on_container) {
          this.active_field = false;
          return setTimeout((function() {
            return _this.blur_test();
          }), 100);
        }
      };

      AbstractChosen.prototype.result_add_option = function(option) {
        var classes, style;

        option.dom_id = this.container_id + "_o_" + option.array_index;
        classes = [];
        if (!option.disabled && !(option.selected && this.is_multiple)) {
          classes.push("active-result");
        }
        if (option.disabled && !(option.selected && this.is_multiple)) {
          classes.push("disabled-result");
        }
        if (option.selected) {
          classes.push("result-selected");
        }
        if (option.group_array_index != null) {
          classes.push("group-option");
        }
        if (option.classes !== "") {
          classes.push(option.classes);
        }
        style = option.style.cssText !== "" ? " style=\"" + option.style + "\"" : "";
        return '<li id="' + option.dom_id + '" class="' + classes.join(' ') + '"' + style + '>' + option.html + '</li>';
      };

      AbstractChosen.prototype.results_update_field = function() {
        this.set_default_text();
        if (!this.is_multiple) {
          this.results_reset_cleanup();
        }
        this.result_clear_highlight();
        this.result_single_selected = null;
        return this.results_build();
      };

      AbstractChosen.prototype.results_toggle = function() {
        if (this.results_showing) {
          return this.results_hide();
        } else {
          return this.results_show();
        }
      };

      AbstractChosen.prototype.results_search = function(evt) {
        if (this.results_showing) {
          return this.winnow_results();
        } else {
          return this.results_show();
        }
      };

      AbstractChosen.prototype.choices_count = function() {
        var option, _i, _len, _ref;

        if (this.selected_option_count != null) {
          return this.selected_option_count;
        }
        this.selected_option_count = 0;
        _ref = this.form_field.options;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          option = _ref[_i];
          if (option.selected) {
            this.selected_option_count += 1;
          }
        }
        return this.selected_option_count;
      };

      AbstractChosen.prototype.choices_click = function(evt) {
        evt.preventDefault();
        if (!(this.results_showing || this.is_disabled)) {
          return this.results_show();
        }
      };

      AbstractChosen.prototype.keyup_checker = function(evt) {
        var stroke, _ref;

        stroke = (_ref = evt.which) != null ? _ref : evt.keyCode;
        this.search_field_scale();
        switch (stroke) {
          case 8:
            if (this.is_multiple && this.backstroke_length < 1 && this.choices_count() > 0) {
              return this.keydown_backstroke();
            } else if (!this.pending_backstroke) {
              this.result_clear_highlight();
              return this.results_search();
            }
            break;
          case 13:
            evt.preventDefault();
            if (this.results_showing) {
              return this.result_select(evt);
            }
            break;
          case 27:
            if (this.results_showing) {
              this.results_hide();
            }
            return true;
          case 9:
          case 38:
          case 40:
          case 16:
          case 91:
          case 17:
            break;
          default:
            return this.results_search();
        }
      };

      AbstractChosen.prototype.generate_field_id = function() {
        var new_id;

        new_id = this.generate_random_id();
        this.form_field.id = new_id;
        return new_id;
      };

      AbstractChosen.prototype.generate_random_char = function() {
        var chars, newchar, rand;

        chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        rand = Math.floor(Math.random() * chars.length);
        return newchar = chars.substring(rand, rand + 1);
      };

      AbstractChosen.prototype.container_width = function() {
        if (this.options.width != null) {
          return this.options.width;
        } else {
          return "" + this.form_field.offsetWidth + "px";
        }
      };

      AbstractChosen.browser_is_supported = function() {
        var _ref;

        if (window.navigator.appName === "Microsoft Internet Explorer") {
          return (null !== (_ref = document.documentMode) && _ref >= 8);
        }
        return true;
      };

      AbstractChosen.default_multiple_text = "Select Some Options";

      AbstractChosen.default_single_text = "Select an Option";

      AbstractChosen.default_no_result_text = "No results match";

      return AbstractChosen;

    })();

    root.AbstractChosen = AbstractChosen;

  }).call(this);

  (function() {
    var $, Chosen, root, _ref,
      __hasProp = {}.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

    root = this;

    // OKTA-93521 - plugin assumes root is global scope
    var AbstractChosen = root.AbstractChosen;

    $ = jQuery;

    $.fn.extend({
      chosen: function(options) {
        if (!AbstractChosen.browser_is_supported()) {
          return this;
        }
        return this.each(function(input_field) {
          var $this;

          $this = $(this);
          if (!$this.hasClass("chzn-done")) {
            return $this.data('chosen', new Chosen(this, options));
          }
        });
      }
    });

    Chosen = (function(_super) {
      __extends(Chosen, _super);

      function Chosen() {
        _ref = Chosen.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Chosen.prototype.setup = function() {
        this.form_field_jq = $(this.form_field);
        this.current_selectedIndex = this.form_field.selectedIndex;
        return this.is_rtl = this.form_field_jq.hasClass("chzn-rtl");
      };

      Chosen.prototype.finish_setup = function() {
        return this.form_field_jq.addClass("chzn-done");
      };

      Chosen.prototype.set_up_html = function() {
        var container_classes, container_props;

        this.container_id = this.form_field.id.length ? this.form_field.id.replace(/[^\w]/g, '_') : this.generate_field_id();
        this.container_id += "_chzn";
        container_classes = ["chzn-container"];
        container_classes.push("chzn-container-" + (this.is_multiple ? "multi" : "single"));
        if (this.inherit_select_classes && this.form_field.className) {
          container_classes.push(this.form_field.className);
        }
        if (this.is_rtl) {
          container_classes.push("chzn-rtl");
        }
        container_props = {
          'id': this.container_id,
          'class': container_classes.join(' '),
          'style': "width: " + (this.container_width()) + ";",
          'title': this.form_field.title
        };
        this.container = $("<div />", container_props);
        if (this.is_multiple) {
          this.container.html('<ul class="chzn-choices"><li class="search-field"><input type="text" value="' + this.default_text + '" class="default" autocomplete="off" style="width:25px;" /></li></ul><div class="chzn-drop"><ul class="chzn-results"></ul></div>');
        } else {
          this.container.html('<a href="javascript:void(0)" class="chzn-single chzn-default" tabindex="-1"><span>' + this.default_text + '</span><div><b></b></div></a><div class="chzn-drop"><div class="chzn-search"><input type="text" autocomplete="off" /></div><ul class="chzn-results"></ul></div>');
        }
        this.form_field_jq.hide().after(this.container);
        this.dropdown = this.container.find('div.chzn-drop').first();
        this.search_field = this.container.find('input').first();
        this.search_results = this.container.find('ul.chzn-results').first();
        this.search_field_scale();
        this.search_no_results = this.container.find('li.no-results').first();
        if (this.is_multiple) {
          this.search_choices = this.container.find('ul.chzn-choices').first();
          this.search_container = this.container.find('li.search-field').first();
        } else {
          this.search_container = this.container.find('div.chzn-search').first();
          this.selected_item = this.container.find('.chzn-single').first();
        }
        this.results_build();
        this.set_tab_index();
        this.set_label_behavior();
        return this.form_field_jq.trigger("liszt:ready", {
          chosen: this
        });
      };

      Chosen.prototype.register_observers = function() {
        var _this = this;

        this.container.mousedown(function(evt) {
          _this.container_mousedown(evt);
        });
        this.container.mouseup(function(evt) {
          _this.container_mouseup(evt);
        });
        this.container.mouseenter(function(evt) {
          _this.mouse_enter(evt);
        });
        this.container.mouseleave(function(evt) {
          _this.mouse_leave(evt);
        });
        this.search_results.mouseup(function(evt) {
          _this.search_results_mouseup(evt);
        });
        this.search_results.mouseover(function(evt) {
          _this.search_results_mouseover(evt);
        });
        this.search_results.mouseout(function(evt) {
          _this.search_results_mouseout(evt);
        });
        this.search_results.bind('mousewheel DOMMouseScroll', function(evt) {
          _this.search_results_mousewheel(evt);
        });
        this.form_field_jq.bind("liszt:updated", function(evt) {
          _this.results_update_field(evt);
        });
        this.form_field_jq.bind("liszt:activate", function(evt) {
          _this.activate_field(evt);
        });
        this.form_field_jq.bind("liszt:open", function(evt) {
          _this.container_mousedown(evt);
        });
        this.search_field.blur(function(evt) {
          _this.input_blur(evt);
        });
        this.search_field.keyup(function(evt) {
          _this.keyup_checker(evt);
        });
        this.search_field.keydown(function(evt) {
          _this.keydown_checker(evt);
        });
        this.search_field.focus(function(evt) {
          _this.input_focus(evt);
        });
        if (this.is_multiple) {
          return this.search_choices.click(function(evt) {
            _this.choices_click(evt);
          });
        } else {
          return this.container.click(function(evt) {
            evt.preventDefault();
          });
        }
      };

      Chosen.prototype.search_field_disabled = function() {
        this.is_disabled = this.form_field_jq[0].disabled;
        if (this.is_disabled) {
          this.container.addClass('chzn-disabled');
          this.search_field[0].disabled = true;
          if (!this.is_multiple) {
            this.selected_item.unbind("focus", this.activate_action);
          }
          return this.close_field();
        } else {
          this.container.removeClass('chzn-disabled');
          this.search_field[0].disabled = false;
          if (!this.is_multiple) {
            return this.selected_item.bind("focus", this.activate_action);
          }
        }
      };

      Chosen.prototype.container_mousedown = function(evt) {
        if (!this.is_disabled) {
          if (evt && evt.type === "mousedown" && !this.results_showing) {
            evt.preventDefault();
          }
          if (!((evt != null) && ($(evt.target)).hasClass("search-choice-close"))) {
            if (!this.active_field) {
              if (this.is_multiple) {
                this.search_field.val("");
              }
              $(document).click(this.click_test_action);
              this.results_show();
            } else if (!this.is_multiple && evt && (($(evt.target)[0] === this.selected_item[0]) || $(evt.target).parents("a.chzn-single").length)) {
              evt.preventDefault();
              this.results_toggle();
            }
            return this.activate_field();
          }
        }
      };

      Chosen.prototype.container_mouseup = function(evt) {
        if (evt.target.nodeName === "ABBR" && !this.is_disabled) {
          return this.results_reset(evt);
        }
      };

      Chosen.prototype.search_results_mousewheel = function(evt) {
        var delta, _ref1, _ref2;

        delta = -((_ref1 = evt.originalEvent) != null ? _ref1.wheelDelta : void 0) || ((_ref2 = evt.originialEvent) != null ? _ref2.detail : void 0);
        if (delta != null) {
          evt.preventDefault();
          if (evt.type === 'DOMMouseScroll') {
            delta = delta * 40;
          }
          return this.search_results.scrollTop(delta + this.search_results.scrollTop());
        }
      };

      Chosen.prototype.blur_test = function(evt) {
        if (!this.active_field && this.container.hasClass("chzn-container-active")) {
          return this.close_field();
        }
      };

      Chosen.prototype.close_field = function() {
        $(document).unbind("click", this.click_test_action);
        this.active_field = false;
        this.results_hide();
        this.container.removeClass("chzn-container-active");
        this.clear_backstroke();
        this.show_search_field_default();
        return this.search_field_scale();
      };

      Chosen.prototype.activate_field = function() {
        this.container.addClass("chzn-container-active");
        this.active_field = true;
        this.search_field.val(this.search_field.val());
        return this.search_field.focus();
      };

      Chosen.prototype.test_active_click = function(evt) {
        if ($(evt.target).parents('#' + this.container_id).length) {
          return this.active_field = true;
        } else {
          return this.close_field();
        }
      };

      Chosen.prototype.results_build = function() {
        var content, data, _i, _len, _ref1;

        this.parsing = true;
        this.selected_option_count = null;
        this.results_data = root.SelectParser.select_to_array(this.form_field);
        if (this.is_multiple) {
          this.search_choices.find("li.search-choice").remove();
        } else if (!this.is_multiple) {
          this.selected_item.addClass("chzn-default").find("span").text(this.default_text);
          if (this.disable_search || this.form_field.options.length <= this.disable_search_threshold) {
            this.search_field[0].readOnly = true;
            this.container.addClass("chzn-container-single-nosearch");
          } else {
            this.search_field[0].readOnly = false;
            this.container.removeClass("chzn-container-single-nosearch");
          }
        }
        content = '';
        _ref1 = this.results_data;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          data = _ref1[_i];
          if (data.group) {
            content += this.result_add_group(data);
          } else if (!data.empty) {
            content += this.result_add_option(data);
            if (data.selected && this.is_multiple) {
              this.choice_build(data);
            } else if (data.selected && !this.is_multiple) {
              this.selected_item.removeClass("chzn-default").find("span").text(data.text);
              if (this.allow_single_deselect) {
                this.single_deselect_control_build();
              }
            }
          }
        }
        this.search_field_disabled();
        this.show_search_field_default();
        this.search_field_scale();
        this.search_results.html(content);
        return this.parsing = false;
      };

      Chosen.prototype.result_add_group = function(group) {
        group.dom_id = this.container_id + "_g_" + group.array_index;
        return '<li id="' + group.dom_id + '" class="group-result">' + $("<div />").text(group.label).html() + '</li>';
      };

      Chosen.prototype.result_do_highlight = function(el) {
        var high_bottom, high_top, maxHeight, visible_bottom, visible_top;

        if (el.length) {
          this.result_clear_highlight();
          this.result_highlight = el;
          this.result_highlight.addClass("highlighted");
          maxHeight = parseInt(this.search_results.css("maxHeight"), 10);
          visible_top = this.search_results.scrollTop();
          visible_bottom = maxHeight + visible_top;
          high_top = this.result_highlight.position().top + this.search_results.scrollTop();
          high_bottom = high_top + this.result_highlight.outerHeight();
          if (high_bottom >= visible_bottom) {
            return this.search_results.scrollTop((high_bottom - maxHeight) > 0 ? high_bottom - maxHeight : 0);
          } else if (high_top < visible_top) {
            return this.search_results.scrollTop(high_top);
          }
        }
      };

      Chosen.prototype.result_clear_highlight = function() {
        if (this.result_highlight) {
          this.result_highlight.removeClass("highlighted");
        }
        return this.result_highlight = null;
      };

      Chosen.prototype.results_show = function() {
        if (this.is_multiple && this.max_selected_options <= this.choices_count()) {
          this.form_field_jq.trigger("liszt:maxselected", {
            chosen: this
          });
          return false;
        }
        this.container.addClass("chzn-with-drop");
        this.form_field_jq.trigger("liszt:showing_dropdown", {
          chosen: this
        });
        this.results_showing = true;
        this.search_field.focus();
        this.search_field.val(this.search_field.val());
        return this.winnow_results();
      };

      Chosen.prototype.results_hide = function() {
        if (this.results_showing) {
          this.result_clear_highlight();
          this.container.removeClass("chzn-with-drop");
          this.form_field_jq.trigger("liszt:hiding_dropdown", {
            chosen: this
          });
        }
        return this.results_showing = false;
      };

      Chosen.prototype.set_tab_index = function(el) {
        var ti;

        if (this.form_field_jq.attr("tabindex")) {
          ti = this.form_field_jq.attr("tabindex");
          this.form_field_jq.attr("tabindex", -1);
          return this.search_field.attr("tabindex", ti);
        }
      };

      Chosen.prototype.set_label_behavior = function() {
        var _this = this;

        this.form_field_label = this.form_field_jq.parents("label");
        if (!this.form_field_label.length && this.form_field.id.length) {
          this.form_field_label = $("label[for='" + this.form_field.id + "']");
        }
        if (this.form_field_label.length > 0) {
          return this.form_field_label.click(function(evt) {
            if (_this.is_multiple) {
              return _this.container_mousedown(evt);
            } else {
              return _this.activate_field();
            }
          });
        }
      };

      Chosen.prototype.show_search_field_default = function() {
        if (this.is_multiple && this.choices_count() < 1 && !this.active_field) {
          this.search_field.val(this.default_text);
          return this.search_field.addClass("default");
        } else {
          this.search_field.val("");
          return this.search_field.removeClass("default");
        }
      };

      Chosen.prototype.search_results_mouseup = function(evt) {
        var target;

        target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
        if (target.length) {
          this.result_highlight = target;
          this.result_select(evt);
          return this.search_field.focus();
        }
      };

      Chosen.prototype.search_results_mouseover = function(evt) {
        var target;

        target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
        if (target) {
          return this.result_do_highlight(target);
        }
      };

      Chosen.prototype.search_results_mouseout = function(evt) {
        if ($(evt.target).hasClass("active-result" || $(evt.target).parents('.active-result').first())) {
          return this.result_clear_highlight();
        }
      };

      Chosen.prototype.choice_build = function(item) {
        var choice, close_link,
          _this = this;

        choice = $('<li />', {
          "class": "search-choice"
        }).html("<span>" + item.html + "</span>");
        if (item.disabled) {
          choice.addClass('search-choice-disabled');
        } else {
          close_link = $('<a />', {
            href: '#',
            "class": 'search-choice-close',
            rel: item.array_index
          });
          close_link.click(function(evt) {
            return _this.choice_destroy_link_click(evt);
          });
          choice.append(close_link);
        }
        return this.search_container.before(choice);
      };

      Chosen.prototype.choice_destroy_link_click = function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (!this.is_disabled) {
          return this.choice_destroy($(evt.target));
        }
      };

      Chosen.prototype.choice_destroy = function(link) {
        if (this.result_deselect(link.attr("rel"))) {
          this.show_search_field_default();
          if (this.is_multiple && this.choices_count() > 0 && this.search_field.val().length < 1) {
            this.results_hide();
          }
          link.parents('li').first().remove();
          return this.search_field_scale();
        }
      };

      Chosen.prototype.results_reset = function() {
        this.form_field.options[0].selected = true;
        this.selected_option_count = null;
        this.selected_item.find("span").text(this.default_text);
        if (!this.is_multiple) {
          this.selected_item.addClass("chzn-default");
        }
        this.show_search_field_default();
        this.results_reset_cleanup();
        this.form_field_jq.trigger("change");
        if (this.active_field) {
          return this.results_hide();
        }
      };

      Chosen.prototype.results_reset_cleanup = function() {
        this.current_selectedIndex = this.form_field.selectedIndex;
        return this.selected_item.find("abbr").remove();
      };

      Chosen.prototype.result_select = function(evt) {
        var high, high_id, item, position;

        if (this.result_highlight) {
          high = this.result_highlight;
          high_id = high.attr("id");
          this.result_clear_highlight();
          if (this.is_multiple && this.max_selected_options <= this.choices_count()) {
            this.form_field_jq.trigger("liszt:maxselected", {
              chosen: this
            });
            return false;
          }
          if (this.is_multiple) {
            high.removeClass("active-result");
          } else {
            this.search_results.find(".result-selected").removeClass("result-selected");
            this.result_single_selected = high;
            this.selected_item.removeClass("chzn-default");
          }
          high.addClass("result-selected");
          position = high_id.substr(high_id.lastIndexOf("_") + 1);
          item = this.results_data[position];
          item.selected = true;
          this.form_field.options[item.options_index].selected = true;
          this.selected_option_count = null;
          if (this.is_multiple) {
            this.choice_build(item);
          } else {
            this.selected_item.find("span").first().text(item.text);
            if (this.allow_single_deselect) {
              this.single_deselect_control_build();
            }
          }
          if (!((evt.metaKey || evt.ctrlKey) && this.is_multiple)) {
            this.results_hide();
          }
          this.search_field.val("");
          if (this.is_multiple || this.form_field.selectedIndex !== this.current_selectedIndex) {
            this.form_field_jq.trigger("change", {
              'selected': this.form_field.options[item.options_index].value
            });
          }
          this.current_selectedIndex = this.form_field.selectedIndex;
          return this.search_field_scale();
        }
      };

      Chosen.prototype.result_activate = function(el, option) {
        if (option.disabled) {
          return el.addClass("disabled-result");
        } else if (this.is_multiple && option.selected) {
          return el.addClass("result-selected");
        } else {
          return el.addClass("active-result");
        }
      };

      Chosen.prototype.result_deactivate = function(el) {
        return el.removeClass("active-result result-selected disabled-result");
      };

      Chosen.prototype.result_deselect = function(pos) {
        var result, result_data;

        result_data = this.results_data[pos];
        if (!this.form_field.options[result_data.options_index].disabled) {
          result_data.selected = false;
          this.form_field.options[result_data.options_index].selected = false;
          this.selected_option_count = null;
          result = $("#" + this.container_id + "_o_" + pos);
          result.removeClass("result-selected").addClass("active-result").show();
          this.result_clear_highlight();
          this.winnow_results();
          this.form_field_jq.trigger("change", {
            deselected: this.form_field.options[result_data.options_index].value
          });
          this.search_field_scale();
          return true;
        } else {
          return false;
        }
      };

      Chosen.prototype.single_deselect_control_build = function() {
        if (!this.allow_single_deselect) {
          return;
        }
        if (!this.selected_item.find("abbr").length) {
          this.selected_item.find("span").first().after("<abbr class=\"search-choice-close\"></abbr>");
        }
        return this.selected_item.addClass("chzn-single-with-deselect");
      };

      Chosen.prototype.winnow_results = function() {
        var found, option, part, parts, regex, regexAnchor, result, result_id, results, searchText, startpos, text, zregex, _i, _j, _len, _len1, _ref1;

        this.no_results_clear();
        results = 0;
        searchText = this.search_field.val() === this.default_text ? "" : $('<div/>').text($.trim(this.search_field.val())).html();
        regexAnchor = this.search_contains ? "" : "^";
        regex = new RegExp(regexAnchor + searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
        zregex = new RegExp(searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
        _ref1 = this.results_data;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          option = _ref1[_i];
          if (!option.empty) {
            if (option.group) {
              $('#' + option.dom_id).css('display', 'none');
            } else {
              found = false;
              result_id = option.dom_id;
              result = $("#" + result_id);
              if (regex.test(option.html)) {
                found = true;
                results += 1;
              } else if (this.enable_split_word_search && (option.html.indexOf(" ") >= 0 || option.html.indexOf("[") === 0)) {
                parts = option.html.replace(/\[|\]/g, "").split(" ");
                if (parts.length) {
                  for (_j = 0, _len1 = parts.length; _j < _len1; _j++) {
                    part = parts[_j];
                    if (regex.test(part)) {
                      found = true;
                      results += 1;
                    }
                  }
                }
              }
              if (found) {
                if (searchText.length) {
                  startpos = option.html.search(zregex);
                  text = option.html.substr(0, startpos + searchText.length) + '</em>' + option.html.substr(startpos + searchText.length);
                  text = text.substr(0, startpos) + '<em>' + text.substr(startpos);
                } else {
                  text = option.html;
                }
                result.html(text);
                this.result_activate(result, option);
                if (option.group_array_index != null) {
                  $("#" + this.results_data[option.group_array_index].dom_id).css('display', 'list-item');
                }
              } else {
                if (this.result_highlight && result_id === this.result_highlight.attr('id')) {
                  this.result_clear_highlight();
                }
                this.result_deactivate(result);
              }
            }
          }
        }
        if (results < 1 && searchText.length) {
          return this.no_results(searchText);
        } else {
          return this.winnow_results_set_highlight();
        }
      };

      Chosen.prototype.winnow_results_set_highlight = function() {
        var do_high, selected_results;

        if (!this.result_highlight) {
          selected_results = !this.is_multiple ? this.search_results.find(".result-selected.active-result") : [];
          do_high = selected_results.length ? selected_results.first() : this.search_results.find(".active-result").first();
          if (do_high != null) {
            return this.result_do_highlight(do_high);
          }
        }
      };

      Chosen.prototype.no_results = function(terms) {
        var no_results_html;

        no_results_html = $('<li class="no-results">' + this.results_none_found + ' "<span></span>"</li>');
        no_results_html.find("span").first().html(terms);
        return this.search_results.append(no_results_html);
      };

      Chosen.prototype.no_results_clear = function() {
        return this.search_results.find(".no-results").remove();
      };

      Chosen.prototype.keydown_arrow = function() {
        var next_sib;

        if (this.results_showing && this.result_highlight) {
          next_sib = this.result_highlight.nextAll("li.active-result").first();
          if (next_sib) {
            return this.result_do_highlight(next_sib);
          }
        } else {
          return this.results_show();
        }
      };

      Chosen.prototype.keyup_arrow = function() {
        var prev_sibs;

        if (!this.results_showing && !this.is_multiple) {
          return this.results_show();
        } else if (this.result_highlight) {
          prev_sibs = this.result_highlight.prevAll("li.active-result");
          if (prev_sibs.length) {
            return this.result_do_highlight(prev_sibs.first());
          } else {
            if (this.choices_count() > 0) {
              this.results_hide();
            }
            return this.result_clear_highlight();
          }
        }
      };

      Chosen.prototype.keydown_backstroke = function() {
        var next_available_destroy;

        if (this.pending_backstroke) {
          this.choice_destroy(this.pending_backstroke.find("a").first());
          return this.clear_backstroke();
        } else {
          next_available_destroy = this.search_container.siblings("li.search-choice").last();
          if (next_available_destroy.length && !next_available_destroy.hasClass("search-choice-disabled")) {
            this.pending_backstroke = next_available_destroy;
            if (this.single_backstroke_delete) {
              return this.keydown_backstroke();
            } else {
              return this.pending_backstroke.addClass("search-choice-focus");
            }
          }
        }
      };

      Chosen.prototype.clear_backstroke = function() {
        if (this.pending_backstroke) {
          this.pending_backstroke.removeClass("search-choice-focus");
        }
        return this.pending_backstroke = null;
      };

      Chosen.prototype.keydown_checker = function(evt) {
        var stroke, _ref1;

        stroke = (_ref1 = evt.which) != null ? _ref1 : evt.keyCode;
        this.search_field_scale();
        if (stroke !== 8 && this.pending_backstroke) {
          this.clear_backstroke();
        }
        switch (stroke) {
          case 8:
            this.backstroke_length = this.search_field.val().length;
            break;
          case 9:
            if (this.results_showing && !this.is_multiple) {
              this.result_select(evt);
            }
            this.mouse_on_container = false;
            break;
          case 13:
            evt.preventDefault();
            break;
          case 38:
            evt.preventDefault();
            this.keyup_arrow();
            break;
          case 40:
            evt.preventDefault();
            this.keydown_arrow();
            break;
        }
      };

      Chosen.prototype.search_field_scale = function() {
        var div, h, style, style_block, styles, w, _i, _len;

        if (this.is_multiple) {
          h = 0;
          w = 0;
          style_block = "position:absolute; left: -1000px; top: -1000px; display:none;";
          styles = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
          for (_i = 0, _len = styles.length; _i < _len; _i++) {
            style = styles[_i];
            style_block += style + ":" + this.search_field.css(style) + ";";
          }
          div = $('<div />', {
            'style': style_block
          });
          div.text(this.search_field.val());
          $('body').append(div);
          w = div.width() + 25;
          div.remove();
          if (!this.f_width) {
            this.f_width = this.container.outerWidth();
          }
          if (w > this.f_width - 10) {
            w = this.f_width - 10;
          }
          return this.search_field.css({
            'width': w + 'px'
          });
        }
      };

      Chosen.prototype.generate_random_id = function() {
        var string;

        string = "sel" + this.generate_random_char() + this.generate_random_char() + this.generate_random_char();
        while ($("#" + string).length > 0) {
          string += this.generate_random_char();
        }
        return string;
      };

      return Chosen;

    })(AbstractChosen);

    root.Chosen = Chosen;

  }).call(this);

}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 68 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_SchemaUtil__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__BaseInput__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__DeletableBox__ = __webpack_require__(69);




/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_2__BaseInput__["a" /* default */].extend({
  className: 'array-input',

  template: '<a href="#" class="array-inputs-button link-button">Add Another</a>',

  params: {
    itemType: 'string'
  },

  events: {
    'click .array-inputs-button': function (e) {
      e.preventDefault();
      if (this.isEditMode()) {
        this.addNewElement();
      }
    }
  },

  initialize: function (options) {
    options || (options = {});
    this.params = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults(options.params || {}, this.params);
    this.uniqueIdPrefix = 'array';
  },

  // api returns null for an array that does not have value
  // convert it to an empty array
  from: function (val) {
    if (!__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(val)) {
      return [];
    }
    return val;
  },

  // @Override
  editMode: function () {
    this._setArrayObject();
    this.$el.html(this.template);
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(this.arrayObject, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].bind(this._addDeletableBox, this));

    return this;
  },

  // @Override
  readMode: function () {
    this.editMode();
    this.$('.array-inputs-button').addClass('link-button-disabled');
  },

  // @Override
  // converts arrayObject to a plain array
  // for string type array, returns all values
  // for number/integer type array, returns values in number type
  val: function () {
    let values = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].values(this.arrayObject);

    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].contains([__WEBPACK_IMPORTED_MODULE_1__util_SchemaUtil__["a" /* default */].DATATYPE.number, __WEBPACK_IMPORTED_MODULE_1__util_SchemaUtil__["a" /* default */].DATATYPE.integer], this.params.itemType)) {
      values = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].filter(values, __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isNumber);
    }
    return values;
  },

  focus: function () {},

  addNewElement: function () {
    const value = '';

    const key = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].uniqueId(this.uniqueIdPrefix);

    this.arrayObject[key] = value;
    this._addDeletableBox(value, key);
    // update is called to make sure an empty string value is added for string type array
    this.update();
  },

  _addDeletableBox: function (value, key) {
    const deletableBox = new __WEBPACK_IMPORTED_MODULE_3__DeletableBox__["a" /* default */](
      __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].pick(this.options, 'read', 'readOnly', 'model'), {
        key: key,
        value: value,
        itemType: this.params.itemType
      })
    );

    this.listenTo(deletableBox, 'updateArray', function (updatedValue) {
      if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isNull(updatedValue)) {
        delete this.arrayObject[key];
        this.stopListening(deletableBox);
      } else {
        this.arrayObject[key] = updatedValue;
      }
      this.update();
    });

    deletableBox.render().$el.hide();
    this.$('.array-inputs-button').before(deletableBox.el);
    deletableBox.$el.slideDown();

    return deletableBox;
  },

  _setArrayObject: function () {
    const array = this.model.get(this.options.name);

    this.arrayObject = {};
    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isArray(array) && !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isEmpty(array)) {
      const keys = [];
      const self = this;

      Object(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"])(array.length).times(function () {
        keys.push(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].uniqueId(self.uniqueIdPrefix));
      });
      this.arrayObject = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].object(keys, array);
    }
  }
}));


/***/ }),
/* 69 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_SchemaUtil__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util_StringUtil__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__util_TemplateUtil__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__util_Time__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__BaseView__ = __webpack_require__(1);







const isVowel = function (string) {
  return /^[aeiou]/.test(string);
};

const getArticle = function (string) {
  return isVowel(string) ? 'an' : 'a';
};

const template = __WEBPACK_IMPORTED_MODULE_3__util_TemplateUtil__["default"].tpl(
  '\
    <div class="o-form-input-group-controls">\
      <span class="input-fix o-form-control">\
        <input type="text" class="o-form-text" name="{{key}}" id="{{key}}" value="{{value}}" \
        placeholder="{{placeholder}}"/>\
      </span>\
      <a href="#" class="link-button link-button-icon icon-only">\
        <span class="icon clear-input-16 "></span>\
      </a>\
    </div>\
    <p class="o-form-input-error o-form-explain">\
      <span class="icon icon-16 error-16-small"></span> {{errorExplain}}\
    </p>\
  '
);
const errorClass = 'o-form-has-errors';
const updateArrayEvent = 'updateArray';
/* harmony default export */ __webpack_exports__["a"] = (__WEBPACK_IMPORTED_MODULE_5__BaseView__["default"].extend({
  tagName: 'div',

  className: 'o-form-input-group',

  events: {
    'click a': function (e) {
      e.preventDefault();
      this.remove();
    },
    'keyup input': function () {
      this.update();
    }
  },

  isEditMode: function () {
    return !this.options.readOnly && (this.options.read !== true || this.model.get('__edit__') === true);
  },

  initialize: function () {
    this.template = template(
      __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend(this.options, {
        placeholder: this.getPlaceholderText(),
        errorExplain: this.getErrorExplainText()
      })
    );
    this.update = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].debounce(this.update, this.options.debounceDelay || __WEBPACK_IMPORTED_MODULE_4__util_Time__["a" /* default */].DEBOUNCE_DELAY);
  },

  render: function () {
    if (this.isEditMode()) {
      this.$el.html(this.template);
    } else {
      this.$el.text(this.options.value);
      this.$('a').hide();
    }
    return this;
  },

  remove: function () {
    this.trigger(updateArrayEvent, null);
    this.$el.slideUp(() => {
      __WEBPACK_IMPORTED_MODULE_5__BaseView__["default"].prototype.remove.call(this, arguments);
    });
  },

  update: function () {
    let updatedValue = this.$('input').val();

    const parseFunc = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].object(
      [__WEBPACK_IMPORTED_MODULE_1__util_SchemaUtil__["a" /* default */].DATATYPE.number, __WEBPACK_IMPORTED_MODULE_1__util_SchemaUtil__["a" /* default */].DATATYPE.integer],
      [__WEBPACK_IMPORTED_MODULE_2__util_StringUtil__["default"].parseFloat, this.parseInt]
    );

    if (__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].has(parseFunc, this.options.itemType)) {
      updatedValue = parseFunc[this.options.itemType](updatedValue);
      !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isNumber(updatedValue) ? this.markInvalid() : this.clearInvalid();
    }
    this.trigger(updateArrayEvent, updatedValue);
  },

  markInvalid: function () {
    this.$el.addClass(errorClass);
  },

  clearInvalid: function () {
    this.$el.removeClass(errorClass);
  },

  getPlaceholderText: function () {
    const text = ['Enter'];

    text.push(getArticle(this.options.itemType));
    text.push(this.options.itemType.toLowerCase());
    return text.join(' ');
  },

  getErrorExplainText: function () {
    const text = ['Value must be'];

    text.push(getArticle(this.options.itemType));
    text.push(this.options.itemType.toLowerCase());
    return text.join(' ');
  },

  parseInt: function (string) {
    // native javascript parseInt is aggressive
    // there're cases we don't want a string to be parsed even though it is convertable
    // so that we don't convert a string silently before warning a user the potential error
    // this is to make sure the string is in an integer format before we parse it
    if (/^-?\d+$/.test(string)) {
      const num = parseInt(string, 10);

      return !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].isNaN(num) ? num : string;
    }
    return string;
  }
}));


/***/ }),
/* 70 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_Keys__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util_TemplateUtil__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_vendor_plugins_jquery_custominput__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_vendor_plugins_jquery_custominput___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_vendor_plugins_jquery_custominput__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__BaseInput__ = __webpack_require__(9);





const template = __WEBPACK_IMPORTED_MODULE_2__util_TemplateUtil__["default"].tpl(
  '\
    <input type="checkbox" name="{{name}}" id="{{inputId}}"/>\
    <label for="{{inputId}}" data-se-for-name="{{name}}">{{placeholder}}</label>\
  '
);
/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_4__BaseInput__["a" /* default */].extend({
  template: template,
  /**
   * @Override
   */
  events: {
    'change :checkbox': 'update',
    keyup: function (e) {
      if (__WEBPACK_IMPORTED_MODULE_1__util_Keys__["default"].isSpaceBar(e)) {
        this.$(':checkbox').click();
      } else if (__WEBPACK_IMPORTED_MODULE_1__util_Keys__["default"].isEnter(e)) {
        this.model.trigger('form:save');
      }
    }
  },

  /**
   * @Override
   */
  editMode: function () {
    let placeholder = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].resultCtx(this.options, 'placeholder', this);

    if (placeholder === '') {
      placeholder = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].resultCtx(this.options, 'label', this);
    } else if (placeholder === false) {
      placeholder = '';
    }

    this.$el.html(this.template(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend(__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].omit(this.options, 'placeholder'), { placeholder: placeholder })));
    const $input = this.$(':checkbox');

    $input.prop('checked', this.getModelValue() || false);

    this.$('input').customInput();
    this.model.trigger('form:resize');

    return this;
  },

  /**
   * @Override
   */
  readMode: function () {
    this.editMode();
    this.$(':checkbox').prop('disabled', true);
    return this;
  },

  /**
   * @Override
   */
  val: function () {
    return this.$(':checkbox').prop('checked');
  },

  /**
   * @Override
   */
  focus: function () {
    return this.$(':checkbox').focus();
  }
}));


/***/ }),
/* 71 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_TemplateUtil__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__TextBox__ = __webpack_require__(32);
/*!
 * Copyright (c) 2015-2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */




const toggleTemplate = __WEBPACK_IMPORTED_MODULE_1__util_TemplateUtil__["default"].tpl(
  '\
      <span class="password-toggle">\
        <span class="eyeicon visibility-16 button-show"></span>\
        <span class="eyeicon visibility-off-16 button-hide"></span>\
      </span>\
  '
);
const toggleTimeout = 30000;
/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_2__TextBox__["default"].extend({
  initialize: function () {
    if (this.__showPasswordToggle()) {
      this.events['click .password-toggle .button-show'] = '__showPassword';
      this.events['click .password-toggle .button-hide'] = '__hidePassword';
    }
    this.delegateEvents();
  },

  postRender: function () {
    if (this.isEditMode() && this.__showPasswordToggle()) {
      this.$el.append(toggleTemplate);
      this.$el.find('input[type="password"]').addClass('password-with-toggle');
    }
    __WEBPACK_IMPORTED_MODULE_2__TextBox__["default"].prototype.postRender.apply(this, arguments);
  },

  __showPasswordToggle: function () {
    return this.options.params && this.options.params.showPasswordToggle;
  },

  __showPassword: function () {
    __WEBPACK_IMPORTED_MODULE_2__TextBox__["default"].prototype.changeType.apply(this, ['text']);
    this.$('.password-toggle .button-show').hide();
    this.$('.password-toggle .button-hide').show();
    this.passwordToggleTimer = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].delay(() => {
      this.__hidePassword();
    }, toggleTimeout);
  },

  __hidePassword: function () {
    __WEBPACK_IMPORTED_MODULE_2__TextBox__["default"].prototype.changeType.apply(this, ['password']);
    this.$('.password-toggle .button-show').show();
    this.$('.password-toggle .button-hide').hide();
    // clear timeout
    if (this.passwordToggleTimer) {
      clearTimeout(this.passwordToggleTimer);
    }
  }
}));


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! http://mths.be/placeholder v2.0.7 by @mathias */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(12)], __WEBPACK_AMD_DEFINE_RESULT__ = (function($){

	var isInputSupported = 'placeholder' in document.createElement('input'),
	    isTextareaSupported = 'placeholder' in document.createElement('textarea'),
	    prototype = $.fn,
	    valHooks = $.valHooks,
	    hooks,
	    placeholder;

	if (isInputSupported && isTextareaSupported) {

		placeholder = prototype.placeholder = function() {
			return this;
		};

		placeholder.input = placeholder.textarea = true;

	} else {

		placeholder = prototype.placeholder = function() {
			var $this = this;
			$this
				.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
				.not('.placeholder')
				.bind({
					'focus.placeholder': clearPlaceholder,
					'blur.placeholder': setPlaceholder
				})
				.data('placeholder-enabled', true)
				.trigger('blur.placeholder');
			return $this;
		};

		placeholder.input = isInputSupported;
		placeholder.textarea = isTextareaSupported;

		hooks = {
			'get': function(element) {
				var $element = $(element);
				return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
			},
			'set': function(element, value) {
				var $element = $(element);
				if (!$element.data('placeholder-enabled')) {
					return element.value = value;
				}
				if (value == '') {
					element.value = value;
					// Issue #56: Setting the placeholder causes problems if the element continues to have focus.
					if (element != document.activeElement) {
						// We can't use `triggerHandler` here because of dummy text/password inputs :(
						setPlaceholder.call(element);
					}
				} else if ($element.hasClass('placeholder')) {
					clearPlaceholder.call(element, true, value) || (element.value = value);
				} else {
					element.value = value;
				}
				// `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
				return $element;
			}
		};

		isInputSupported || (valHooks.input = hooks);
		isTextareaSupported || (valHooks.textarea = hooks);

		$(function() {
			// Look for forms
			$(document).delegate('form', 'submit.placeholder', function() {
				// Clear the placeholder values so they don't get submitted
				var $inputs = $('.placeholder', this).each(clearPlaceholder);
				setTimeout(function() {
					$inputs.each(setPlaceholder);
				}, 10);
			});
		});

		// Clear placeholder values upon page reload
		$(window).bind('beforeunload.placeholder', function() {
			$('.placeholder').each(function() {
				this.value = '';
			});
		});

	}

	function args(elem) {
		// Return an object of element attributes
		var newAttrs = {},
		    rinlinejQuery = /^jQuery\d+$/;
		$.each(elem.attributes, function(i, attr) {
			if (attr.specified && !rinlinejQuery.test(attr.name)) {
				newAttrs[attr.name] = attr.value;
			}
		});
		return newAttrs;
	}

	function clearPlaceholder(event, value) {
		var input = this,
		    $input = $(input);
		if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
			if ($input.data('placeholder-password')) {
				$input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
				// If `clearPlaceholder` was called from `$.valHooks.input.set`
				if (event === true) {
					return $input[0].value = value;
				}
				$input.focus();
			} else {
				input.value = '';
				$input.removeClass('placeholder');
				input == document.activeElement && input.select();
			}
		}
	}

	function setPlaceholder() {
		var $replacement,
		    input = this,
		    $input = $(input),
		    $origInput = $input,
		    id = this.id;
		if (input.value == '') {
			if (input.type == 'password') {
				if (!$input.data('placeholder-textinput')) {
					try {
						$replacement = $input.clone().attr({ 'type': 'text' });
					} catch(e) {
						$replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
					}
					$replacement
						.removeAttr('name')
						.data({
							'placeholder-password': true,
							'placeholder-id': id
						})
						.bind('focus.placeholder', clearPlaceholder);
					$input
						.data({
							'placeholder-textinput': $replacement,
							'placeholder-id': id
						})
						.before($replacement);
				}
				$input = $input.removeAttr('id').hide().prev().attr('id', id).show();
				// Note: `$input[0] != input` now!
			}
			$input.addClass('placeholder');
			$input[0].value = $input.attr('placeholder');
		} else {
			$input.removeClass('placeholder');
		}
	}
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 73 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util_Keys__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__util_Util__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__BaseView__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_vendor_plugins_jquery_custominput__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_vendor_plugins_jquery_custominput___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_vendor_plugins_jquery_custominput__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__BaseInput__ = __webpack_require__(9);
/* eslint max-statements: [2, 12], max-params: [2, 6] */







const isABaseView = __WEBPACK_IMPORTED_MODULE_3__util_Util__["default"].isABaseView;
const RadioRadioOption = __WEBPACK_IMPORTED_MODULE_4__BaseView__["default"].extend({
  template:
    '\
      <input type="radio" name="{{name}}" data-se-name="{{realName}}" value="{{value}}" id="{{optionId}}">\
      <label for="{{optionId}}" data-se-for-name="{{realName}}" class="radio-label">\
        {{label}}\
      </label>\
    ',
  initialize: function (options) {
    let explain;

    explain = options.explain;
    if (__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isFunction(explain) && !isABaseView(explain)) {
      explain = __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].resultCtx(this.options, 'explain', this);
    }
    if (!explain) {
      return;
    }

    if (isABaseView(explain)) {
      this.add('<p class="o-form-explain"></p>', '.radio-label');
      this.add(explain, '.o-form-explain');
    } else {
      this.add('<p class="o-form-explain">{{explain}}</p>', '.radio-label');
    }
  }
});
/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_6__BaseInput__["a" /* default */].extend({
  /**
   * @Override
   */
  events: {
    'change :radio': 'update',
    keyup: function (e) {
      if (__WEBPACK_IMPORTED_MODULE_2__util_Keys__["default"].isSpaceBar(e)) {
        Object(__WEBPACK_IMPORTED_MODULE_0__util_jquery_wrapper__["default"])(e.target).click();
      } else if (__WEBPACK_IMPORTED_MODULE_2__util_Keys__["default"].isEnter(e)) {
        this.model.trigger('form:save');
      }
    }
  },

  /**
   * @Override
   */
  editMode: function () {
    const templates = [];

    this.$el.empty();

    __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].each(
      this.options.options,
      function (value, key) {
        const options = {
          optionId: __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].uniqueId('option'),
          name: this.options.inputId,
          realName: this.options.name,
          value: key
        };

        if (!__WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].isObject(value)) {
          value = { label: value };
        }
        __WEBPACK_IMPORTED_MODULE_1__util_underscore_wrapper__["default"].extend(options, value);

        templates.push(new RadioRadioOption(options).render().el);
      },
      this
    );
    this.$el.append(templates);
    let value = this.getModelValue();

    if (value) {
      this.$(':radio[value=' + value + ']').prop('checked', true);
    }

    this.$('input').customInput();
    this.model.trigger('form:resize');

    if (this.getParam('inline') === true) {
      this.$('div.custom-radio').addClass('inline');
    }

    return this;
  },

  /**
   * @Override
   */
  readMode: function () {
    this.editMode();
    this.$(':radio').prop('disabled', true);
    return this;
  },

  /**
   * @Override
   */
  val: function () {
    return this.$(':radio:checked').val();
  },

  /**
   * @Override
   */
  focus: function () {
    return this.$('label:eq(0)').focus();
  }
}));


/***/ }),
/* 74 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util_ButtonFactory__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__BaseView__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__BaseInput__ = __webpack_require__(9);





function countInputs(inputs) {
  return __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].filter(inputs || [], function (input) {
    return !__WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].contains(['label', 'button', 'select'], input.type);
  }).length;
}

const InputGroupLabelInput = __WEBPACK_IMPORTED_MODULE_3__BaseInput__["a" /* default */].extend({
  tagName: 'span',
  initialize: function () {
    this.$el.text(this.getModelValue());
  },
  editMode: function () {
    this.toggle(true);
  },
  readMode: function () {
    this.toggle(false);
  },
  getModelValue: function () {
    return this.options.label;
  },
  toggle: function (isEditMode) {
    this.$el.toggleClass('o-form-label-inline', isEditMode);
    this.$el.toggleClass('o-form-control', !isEditMode);
  },
  focus: __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].noop
});

function createButtonInput(options) {
  return __WEBPACK_IMPORTED_MODULE_1__util_ButtonFactory__["default"].create(
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults(
      {
        getReadModeString: __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].constant(' '),
        focus: __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].noop
      },
      __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].pick(options, 'click', 'title', 'href', 'icon')
    )
  );
}

const InputGroupInputGroupView = __WEBPACK_IMPORTED_MODULE_2__BaseView__["default"].extend({
  getParams: __WEBPACK_IMPORTED_MODULE_3__BaseInput__["a" /* default */].prototype.getParams,
  getParam: __WEBPACK_IMPORTED_MODULE_3__BaseInput__["a" /* default */].prototype.getParam,

  className: function () {
    let className;

    if (this.getParam('display') === 'text') {
      className = 'o-form-input-group-subtle';
    } else {
      className = 'o-form-input-group';
    }
    if (countInputs(this.getParam('inputs')) > 1) {
      className += ' o-form-input-group-2';
    }
    return className;
  },

  initialize: function () {
    __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].each(
      this.getParam('inputs'),
      function (input) {
        switch (input.type) {
        case 'label':
          this.add(InputGroupLabelInput, { options: input });
          break;
        case 'button':
          this.add(createButtonInput(input));
          break;
        default:
          input = __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].defaults(
            {
              model: this.model,
              params: __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].extend(
                {
                  autoWidth: true
                },
                input.params || {}
              )
            },
            input
          );
          this.add(this.getParams().create(input));
        }
      },
      this
    );
  },

  focus: function () {
    this.first().focus();
  }
});
/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_3__BaseInput__["a" /* default */].extend(
  {
    constructor: function (options) {
      this.inputGroupView = new InputGroupInputGroupView(options);
      __WEBPACK_IMPORTED_MODULE_3__BaseInput__["a" /* default */].apply(this, arguments);
    },

    editMode: function () {
      this.inputGroupView.remove();
      this.inputGroupView = new InputGroupInputGroupView(this.options);
      this.$el.html(this.inputGroupView.render().el);
    },

    toStringValue: function () {
      const strings = this.inputGroupView.map(function (input) {
        return input.getReadModeString();
      });

      return strings.length && __WEBPACK_IMPORTED_MODULE_0__util_underscore_wrapper__["default"].every(strings) ? strings.join(' ') : ' ';
    },

    focus: function () {
      this.inputGroupView.focus();
    }
  },
  {
    // test hooks
    LabelInput: InputGroupLabelInput,
    InputGroupView: InputGroupInputGroupView
  }
));


/***/ })
/******/ ]);
//# sourceMappingURL=okta.js.map