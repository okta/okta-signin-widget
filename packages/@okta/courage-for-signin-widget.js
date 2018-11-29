/*! THIS FILE IS GENERATED FROM PACKAGE @okta/courage@4.4.0 */
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
/******/ 	return __webpack_require__(__webpack_require__.s = 36);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint @okta/okta/enforce-requirejs-names: 0, @okta/okta/no-specific-methods: 0, @okta/okta/no-specific-modules: 0 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(16), __webpack_require__(17)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (underscore, Handlebars) {

  var _ = underscore.noConflict();

  _.mixin({

    resultCtx: function resultCtx(object, property, context, defaultValue) {
      var value = _.isObject(object) ? object[property] : void 0;
      if (_.isFunction(value)) {
        value = value.call(context || object);
      }
      if (value) {
        return value;
      } else {
        return !_.isUndefined(defaultValue) ? defaultValue : value;
      }
    },

    isInteger: function isInteger(x) {
      return _.isNumber(x) && x % 1 === 0;
    },

    template: function template(source, data) {
      var template = Handlebars.compile(source);
      return data ? template(data) : function (data) {
        return template(data);
      };
    }

  });

  return _;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(5), __webpack_require__(3), __webpack_require__(24)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, Backbone, TemplateUtil, View) {

  // add `broadcast` and `listen` functionality to all views
  // We use one event emitter per all views
  // This means we need to be very careful with event names

  var eventBus = _.clone(Backbone.Events);

  /**
   * See {@link src/framework/View} for more detail and examples from the base class.
   * @class module:Okta.View
   * @extends src/framework/View
   */

  /** @lends module:Okta.View.prototype */
  var proto = {

    constructor: function constructor() {
      View.apply(this, arguments);
      this.module && this.$el.attr('data-view', this.module.id);
    },

    /**
     * @deprecated Use {@link #removeChildren}
     */
    empty: function empty() {
      return this.removeChildren();
    },

    compileTemplate: TemplateUtil.tpl,

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
    broadcast: function broadcast() {
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
    listen: function listen(name, fn) {
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
    notify: function notify(level, message, options) {
      this.broadcast('notification', _.defaults({ message: message, level: level }, options));
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
    confirm: function confirm(title, message, okfn, cancelfn) {
      /* eslint max-statements: [2, 12] */

      var options;
      if ((typeof title === 'undefined' ? 'undefined' : _typeof(title)) == 'object') {
        options = title;
      } else {
        if (arguments.length == 2 && _.isFunction(message)) {
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
      if (_.isFunction(options.ok)) {
        options.ok = _.bind(options.ok, this);
      }
      if (_.isFunction(options.cancelFn)) {
        options.cancelFn = _.bind(options.cancelFn, this);
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
    alert: function alert(params) {
      if (_.isString(params)) {
        params = {
          subtitle: params
        };
      }
      this.confirm(_.extend({}, params, {
        noCancelButton: true
      }));
      return this;
    }
  };

  return View.extend(proto, /** @lends View.prototype */{
    /** @method */
    decorate: function decorate(TargetView) {
      var View = TargetView.extend({});
      _.defaults(View.prototype, proto);
      return View;
    }
  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint-disable @okta/okta/enforce-requirejs-names, @okta/okta/no-specific-modules */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(6)], __WEBPACK_AMD_DEFINE_RESULT__ = (function ($) {
  $.ajaxSetup({
    beforeSend: function beforeSend(xhr) {
      xhr.setRequestHeader('X-Okta-XsrfToken', $('#_xsrfToken').text());
    },
    converters: {
      'text secureJSON': function textSecureJSON(str) {
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
  window.jQueryCourage = $;
  return $;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint @okta/okta/enforce-requirejs-names: 0, @okta/okta/no-specific-methods: 0 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(18)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, Handlebars) {

  /**
   * @class module:Okta.internal.util.TemplateUtil
   * @hideconstructor
   */
  return (/** @lends module:Okta.internal.util.TemplateUtil */{

      /**
       * Compiles a Handlebars template
       * @static
       * @method
       */
      tpl: _.memoize(function (tpl) {
        /* eslint okta/no-specific-methods: 0 */
        return Handlebars.compile(tpl);
      })

    }
  );
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(2), __webpack_require__(38), __webpack_require__(19)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, $, Bundles) {

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
  var emailValidator = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(?!-)((\[?[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\]?)|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  /**
   * Handy utility functions to handle strings.
   *
   * @class module:Okta.internal.util.StringUtil
   * @hideconstructor
   */
  var StringUtil = /** @lends module:Okta.internal.util.StringUtil */{
    /** @static */
    sprintf: function sprintf() {
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
     * @param  {String} query The query string
     * @return {Object} The map
     * @static
     * @example
     * StringUtil.parseQuery('foo=bar&baz=qux') // {foo: 'bar', baz: 'qux'}
     */
    parseQuery: function parseQuery(query) {
      var params = {};
      var pairs = decodeURIComponent(query.replace(/\+/g, ' ')).split('&');
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var data = pair.split('=');
        params[data.shift()] = data.join('=');
      }
      return params;
    },

    /** @static */
    encodeJSObject: function encodeJSObject(jsObj) {
      return encodeURIComponent(JSON.stringify(jsObj));
    },

    /** @static */
    decodeJSObject: function decodeJSObject(jsObj) {
      try {
        return JSON.parse(decodeURIComponent(jsObj));
      } catch (e) {
        return null;
      }
    },

    /** @static */
    unescapeHtml: function unescapeHtml(string) {
      return String(string).replace(/&[\w#\d]{2,};/g, function (s) {
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
    localize: function localize(key, bundleName, params) {
      /* eslint complexity: [2, 7] */
      var bundle = bundleName ? Bundles[bundleName] : Bundles[_.keys(Bundles)[0]];

      if (!bundle) {
        return 'L10N_ERROR[' + bundleName + ']';
      }

      var value = bundle[key];

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
    parseFloat: function (_parseFloat) {
      function parseFloat(_x) {
        return _parseFloat.apply(this, arguments);
      }

      parseFloat.toString = function () {
        return _parseFloat.toString();
      };

      return parseFloat;
    }(function (string) {
      var number = +string;
      return typeof string == 'string' && number === parseFloat(string) ? number : string;
    }),

    /**
     * Convert a string to an integer if valid, otherwise return the string
     * @static
     * @param {String} string The string to convert to an integer
     * @return {String|integer} Returns an integer if the string can be casted, otherwise, returns the original string
     */
    parseInt: function (_parseInt) {
      function parseInt(_x2) {
        return _parseInt.apply(this, arguments);
      }

      parseInt.toString = function () {
        return _parseInt.toString();
      };

      return parseInt;
    }(function (string) {
      var int = +string;
      return _.isString(string) && int === parseInt(string, 10) ? int : string;
    }),

    /**
     * Convert a string to an object if valid, otherwise return the string
     * @static
     * @param {String} string The string to convert to an object
     * @return {String|object} Returns an object if the string can be casted, otherwise, returns the original string
     */
    parseObject: function parseObject(string) {
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
    randomString: function randomString(length) {
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
    endsWith: function endsWith(str, ends) {
      str += '';
      ends += '';
      return str.length >= ends.length && str.substring(str.length - ends.length) === ends;
    },

    /** @static */
    isEmail: function isEmail(str) {
      var target = $.trim(str);
      return !_.isEmpty(target) && emailValidator.test(target);
    }

  };

  return StringUtil;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//     Backbone.js 1.3.3

//     (c) 2010-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function (factory) {

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) == 'object' && self.self === self && self || (typeof global === 'undefined' ? 'undefined' : _typeof(global)) == 'object' && global.global === global && global;

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(16), __webpack_require__(6), exports], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

    // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore'),
        $;
    try {
      $ = require('jquery');
    } catch (e) {}
    factory(root, exports, _, $);

    // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, root.jQuery || root.Zepto || root.ender || root.$);
  }
})(function (root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to a common array method we'll want to use later.
  var _slice = Array.prototype.slice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.3.3';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function () {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... this will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Proxy Backbone class methods to Underscore functions, wrapping the model's
  // `attributes` object or collection's `models` array behind the scenes.
  //
  // collection.filter(function(model) { return model.get('age') > 10 });
  // collection.each(this.addView);
  //
  // `Function#apply` can be slow so we use the method's arg count, if we know it.
  var addMethod = function addMethod(length, method, attribute) {
    switch (length) {
      case 1:
        return function () {
          return _[method](this[attribute]);
        };
      case 2:
        return function (value) {
          return _[method](this[attribute], value);
        };
      case 3:
        return function (iteratee, context) {
          return _[method](this[attribute], cb(iteratee, this), context);
        };
      case 4:
        return function (iteratee, defaultVal, context) {
          return _[method](this[attribute], cb(iteratee, this), defaultVal, context);
        };
      default:
        return function () {
          var args = _slice.call(arguments);
          args.unshift(this[attribute]);
          return _[method].apply(_, args);
        };
    }
  };
  var addUnderscoreMethods = function addUnderscoreMethods(Class, methods, attribute) {
    _.each(methods, function (length, method) {
      if (_[method]) Class.prototype[method] = addMethod(length, method, attribute);
    });
  };

  // Support `collection.sortBy('attr')` and `collection.findWhere({id: 1})`.
  var cb = function cb(iteratee, instance) {
    if (_.isFunction(iteratee)) return iteratee;
    if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
    if (_.isString(iteratee)) return function (model) {
      return model.get(iteratee);
    };
    return iteratee;
  };
  var modelMatcher = function modelMatcher(attrs) {
    var matcher = _.matches(attrs);
    return function (model) {
      return matcher(model.attributes);
    };
  };

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // a custom event channel. You may bind a callback to an event with `on` or
  // remove with `off`; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {};

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Iterates over the standard `event, callback` (as well as the fancy multiple
  // space-separated events `"change blur", callback` and jQuery-style event
  // maps `{event: callback}`).
  var eventsApi = function eventsApi(iteratee, events, name, callback, opts) {
    var i = 0,
        names;
    if (name && (typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
      for (names = _.keys(name); i < names.length; i++) {
        events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
      }
    } else if (name && eventSplitter.test(name)) {
      // Handle space-separated event names by delegating them individually.
      for (names = name.split(eventSplitter); i < names.length; i++) {
        events = iteratee(events, names[i], callback, opts);
      }
    } else {
      // Finally, standard events.
      events = iteratee(events, name, callback, opts);
    }
    return events;
  };

  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  Events.on = function (name, callback, context) {
    return internalOn(this, name, callback, context);
  };

  // Guard the `listening` argument from the public API.
  var internalOn = function internalOn(obj, name, callback, context, listening) {
    obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
      context: context,
      ctx: obj,
      listening: listening
    });

    if (listening) {
      var listeners = obj._listeners || (obj._listeners = {});
      listeners[listening.id] = listening;
    }

    return obj;
  };

  // Inversion-of-control versions of `on`. Tell *this* object to listen to
  // an event in another object... keeping track of what it's listening to
  // for easier unbinding later.
  Events.listenTo = function (obj, name, callback) {
    if (!obj) return this;
    var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var listening = listeningTo[id];

    // This object is not listening to any other events on `obj` yet.
    // Setup the necessary references to track the listening callbacks.
    if (!listening) {
      var thisId = this._listenId || (this._listenId = _.uniqueId('l'));
      listening = listeningTo[id] = { obj: obj, objId: id, id: thisId, listeningTo: listeningTo, count: 0 };
    }

    // Bind callbacks on obj, and keep track of them on listening.
    internalOn(obj, name, callback, this, listening);
    return this;
  };

  // The reducing API that adds a callback to the `events` object.
  var onApi = function onApi(events, name, callback, options) {
    if (callback) {
      var handlers = events[name] || (events[name] = []);
      var context = options.context,
          ctx = options.ctx,
          listening = options.listening;
      if (listening) listening.count++;

      handlers.push({ callback: callback, context: context, ctx: context || ctx, listening: listening });
    }
    return events;
  };

  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  Events.off = function (name, callback, context) {
    if (!this._events) return this;
    this._events = eventsApi(offApi, this._events, name, callback, {
      context: context,
      listeners: this._listeners
    });
    return this;
  };

  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  Events.stopListening = function (obj, name, callback) {
    var listeningTo = this._listeningTo;
    if (!listeningTo) return this;

    var ids = obj ? [obj._listenId] : _.keys(listeningTo);

    for (var i = 0; i < ids.length; i++) {
      var listening = listeningTo[ids[i]];

      // If listening doesn't exist, this object is not currently
      // listening to obj. Break out early.
      if (!listening) break;

      listening.obj.off(name, callback, this);
    }

    return this;
  };

  // The reducing API that removes a callback from the `events` object.
  var offApi = function offApi(events, name, callback, options) {
    if (!events) return;

    var i = 0,
        listening;
    var context = options.context,
        listeners = options.listeners;

    // Delete all events listeners and "drop" events.
    if (!name && !callback && !context) {
      var ids = _.keys(listeners);
      for (; i < ids.length; i++) {
        listening = listeners[ids[i]];
        delete listeners[listening.id];
        delete listening.listeningTo[listening.objId];
      }
      return;
    }

    var names = name ? [name] : _.keys(events);
    for (; i < names.length; i++) {
      name = names[i];
      var handlers = events[name];

      // Bail out if there are no events stored.
      if (!handlers) break;

      // Replace events if there are any remaining.  Otherwise, clean up.
      var remaining = [];
      for (var j = 0; j < handlers.length; j++) {
        var handler = handlers[j];
        if (callback && callback !== handler.callback && callback !== handler.callback._callback || context && context !== handler.context) {
          remaining.push(handler);
        } else {
          listening = handler.listening;
          if (listening && --listening.count === 0) {
            delete listeners[listening.id];
            delete listening.listeningTo[listening.objId];
          }
        }
      }

      // Update tail event if the list has any events.  Otherwise, clean up.
      if (remaining.length) {
        events[name] = remaining;
      } else {
        delete events[name];
      }
    }
    return events;
  };

  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, its listener will be removed. If multiple events
  // are passed in using the space-separated syntax, the handler will fire
  // once for each event, not once for a combination of all events.
  Events.once = function (name, callback, context) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
    if (typeof name === 'string' && context == null) callback = void 0;
    return this.on(events, callback, context);
  };

  // Inversion-of-control versions of `once`.
  Events.listenToOnce = function (obj, name, callback) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
    return this.listenTo(obj, events);
  };

  // Reduces the event callbacks into a map of `{event: onceWrapper}`.
  // `offer` unbinds the `onceWrapper` after it has been called.
  var onceMap = function onceMap(map, name, callback, offer) {
    if (callback) {
      var once = map[name] = _.once(function () {
        offer(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
    }
    return map;
  };

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  Events.trigger = function (name) {
    if (!this._events) return this;

    var length = Math.max(0, arguments.length - 1);
    var args = Array(length);
    for (var i = 0; i < length; i++) {
      args[i] = arguments[i + 1];
    }eventsApi(triggerApi, this._events, name, void 0, args);
    return this;
  };

  // Handles triggering the appropriate event callbacks.
  var triggerApi = function triggerApi(objEvents, name, callback, args) {
    if (objEvents) {
      var events = objEvents[name];
      var allEvents = objEvents.all;
      if (events && allEvents) allEvents = allEvents.slice();
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, [name].concat(args));
    }
    return objEvents;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function triggerEvents(events, args) {
    var ev,
        i = -1,
        l = events.length,
        a1 = args[0],
        a2 = args[1],
        a3 = args[2];
    switch (args.length) {
      case 0:
        while (++i < l) {
          (ev = events[i]).callback.call(ev.ctx);
        }return;
      case 1:
        while (++i < l) {
          (ev = events[i]).callback.call(ev.ctx, a1);
        }return;
      case 2:
        while (++i < l) {
          (ev = events[i]).callback.call(ev.ctx, a1, a2);
        }return;
      case 3:
        while (++i < l) {
          (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
        }return;
      default:
        while (++i < l) {
          (ev = events[i]).callback.apply(ev.ctx, args);
        }return;
    }
  };

  // Aliases for backwards compatibility.
  Events.bind = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function (attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId(this.cidPrefix);
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    var defaults = _.result(this, 'defaults');
    attrs = _.defaults(_.extend({}, defaults, attrs), defaults);
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // The prefix is used to create the client id which is used to identify models locally.
    // You may want to override this if you're experiencing name clashes with model ids.
    cidPrefix: 'c',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function initialize() {},

    // Return a copy of the model's `attributes` object.
    toJSON: function toJSON(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function sync() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function get(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function escape(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function has(attr) {
      return this.get(attr) != null;
    },

    // Special-cased proxy to underscore's `_.matches` method.
    matches: function matches(attrs) {
      return !!_.iteratee(attrs, this)(this.attributes);
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function set(key, val, options) {
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      var unset = options.unset;
      var silent = options.silent;
      var changes = [];
      var changing = this._changing;
      this._changing = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }

      var current = this.attributes;
      var changed = this.changed;
      var prev = this._previousAttributes;

      // For each `set` attribute, update or delete the current value.
      for (var attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          changed[attr] = val;
        } else {
          delete changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Update the `id`.
      if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0; i < changes.length; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function unset(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, { unset: true }));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function clear(options) {
      var attrs = {};
      for (var key in this.attributes) {
        attrs[key] = void 0;
      }return this.set(attrs, _.extend({}, options, { unset: true }));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function hasChanged(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function changedAttributes(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      var changed = {};
      for (var attr in diff) {
        var val = diff[attr];
        if (_.isEqual(old[attr], val)) continue;
        changed[attr] = val;
      }
      return _.size(changed) ? changed : false;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function previous(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function previousAttributes() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server, merging the response with the model's
    // local attributes. Any changed attributes will trigger a "change" event.
    fetch: function fetch(options) {
      options = _.extend({ parse: true }, options);
      var model = this;
      var success = options.success;
      options.success = function (resp) {
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (!model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function save(key, val, options) {
      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (key == null || (typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({ validate: true, parse: true }, options);
      var wait = options.wait;

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !wait) {
        if (!this.set(attrs, options)) return false;
      } else if (!this._validate(attrs, options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      var attributes = this.attributes;
      options.success = function (resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (wait) serverAttrs = _.extend({}, attrs, serverAttrs);
        if (serverAttrs && !model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      // Set temporary attributes if `{wait: true}` to properly find new ids.
      if (attrs && wait) this.attributes = _.extend({}, attributes, attrs);

      var method = this.isNew() ? 'create' : options.patch ? 'patch' : 'update';
      if (method === 'patch' && !options.attrs) options.attrs = attrs;
      var xhr = this.sync(method, this, options);

      // Restore attributes.
      this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function destroy(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      var wait = options.wait;

      var destroy = function destroy() {
        model.stopListening();
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function (resp) {
        if (wait) destroy();
        if (success) success.call(options.context, model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      var xhr = false;
      if (this.isNew()) {
        _.defer(options.success);
      } else {
        wrapError(this, options);
        xhr = this.sync('delete', this, options);
      }
      if (!wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function url() {
      var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      var id = this.get(this.idAttribute);
      return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function parse(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function clone() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function isNew() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function isValid(options) {
      return this._validate({}, _.extend({}, options, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function _validate(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, { validationError: error }));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model, mapped to the
  // number of arguments they take.
  var modelMethods = { keys: 1, values: 1, pairs: 1, invert: 1, pick: 0,
    omit: 0, chain: 1, isEmpty: 1 };

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  addUnderscoreMethods(Model, modelMethods, 'attributes');

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analogous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function (models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({ silent: true }, options));
  };

  // Default options for `Collection#set`.
  var setOptions = { add: true, remove: true, merge: true };
  var addOptions = { add: true, remove: false };

  // Splices `insert` into `array` at index `at`.
  var splice = function splice(array, insert, at) {
    at = Math.min(Math.max(at, 0), array.length);
    var tail = Array(array.length - at);
    var length = insert.length;
    var i;
    for (i = 0; i < tail.length; i++) {
      tail[i] = array[i + at];
    }for (i = 0; i < length; i++) {
      array[i + at] = insert[i];
    }for (i = 0; i < tail.length; i++) {
      array[i + length + at] = tail[i];
    }
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function initialize() {},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function toJSON(options) {
      return this.map(function (model) {
        return model.toJSON(options);
      });
    },

    // Proxy `Backbone.sync` by default.
    sync: function sync() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set. `models` may be Backbone
    // Models or raw JavaScript objects to be converted to Models, or any
    // combination of the two.
    add: function add(models, options) {
      return this.set(models, _.extend({ merge: false }, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function remove(models, options) {
      options = _.extend({}, options);
      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();
      var removed = this._removeModels(models, options);
      if (!options.silent && removed.length) {
        options.changes = { added: [], merged: [], removed: removed };
        this.trigger('update', this, options);
      }
      return singular ? removed[0] : removed;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function set(models, options) {
      if (models == null) return;

      options = _.extend({}, setOptions, options);
      if (options.parse && !this._isModel(models)) {
        models = this.parse(models, options) || [];
      }

      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();

      var at = options.at;
      if (at != null) at = +at;
      if (at > this.length) at = this.length;
      if (at < 0) at += this.length + 1;

      var set = [];
      var toAdd = [];
      var toMerge = [];
      var toRemove = [];
      var modelMap = {};

      var add = options.add;
      var merge = options.merge;
      var remove = options.remove;

      var sort = false;
      var sortable = this.comparator && at == null && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      var model, i;
      for (i = 0; i < models.length; i++) {
        model = models[i];

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        var existing = this.get(model);
        if (existing) {
          if (merge && model !== existing) {
            var attrs = this._isModel(model) ? model.attributes : model;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            toMerge.push(existing);
            if (sortable && !sort) sort = existing.hasChanged(sortAttr);
          }
          if (!modelMap[existing.cid]) {
            modelMap[existing.cid] = true;
            set.push(existing);
          }
          models[i] = existing;

          // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(model, options);
          if (model) {
            toAdd.push(model);
            this._addReference(model, options);
            modelMap[model.cid] = true;
            set.push(model);
          }
        }
      }

      // Remove stale models.
      if (remove) {
        for (i = 0; i < this.length; i++) {
          model = this.models[i];
          if (!modelMap[model.cid]) toRemove.push(model);
        }
        if (toRemove.length) this._removeModels(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      var orderChanged = false;
      var replace = !sortable && add && remove;
      if (set.length && replace) {
        orderChanged = this.length !== set.length || _.some(this.models, function (m, index) {
          return m !== set[index];
        });
        this.models.length = 0;
        splice(this.models, set, 0);
        this.length = this.models.length;
      } else if (toAdd.length) {
        if (sortable) sort = true;
        splice(this.models, toAdd, at == null ? this.length : at);
        this.length = this.models.length;
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({ silent: true });

      // Unless silenced, it's time to fire all appropriate add/sort/update events.
      if (!options.silent) {
        for (i = 0; i < toAdd.length; i++) {
          if (at != null) options.index = at + i;
          model = toAdd[i];
          model.trigger('add', model, this, options);
        }
        if (sort || orderChanged) this.trigger('sort', this, options);
        if (toAdd.length || toRemove.length || toMerge.length) {
          options.changes = {
            added: toAdd,
            removed: toRemove,
            merged: toMerge
          };
          this.trigger('update', this, options);
        }
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function reset(models, options) {
      options = options ? _.clone(options) : {};
      for (var i = 0; i < this.models.length; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({ silent: true }, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function push(model, options) {
      return this.add(model, _.extend({ at: this.length }, options));
    },

    // Remove a model from the end of the collection.
    pop: function pop(options) {
      var model = this.at(this.length - 1);
      return this.remove(model, options);
    },

    // Add a model to the beginning of the collection.
    unshift: function unshift(model, options) {
      return this.add(model, _.extend({ at: 0 }, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function shift(options) {
      var model = this.at(0);
      return this.remove(model, options);
    },

    // Slice out a sub-array of models from the collection.
    slice: function slice() {
      return _slice.apply(this.models, arguments);
    },

    // Get a model from the set by id, cid, model object with id or cid
    // properties, or an attributes object that is transformed through modelId.
    get: function get(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] || this._byId[this.modelId(obj.attributes || obj)] || obj.cid && this._byId[obj.cid];
    },

    // Returns `true` if the model is in the collection.
    has: function has(obj) {
      return this.get(obj) != null;
    },

    // Get the model at the given index.
    at: function at(index) {
      if (index < 0) index += this.length;
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function where(attrs, first) {
      return this[first ? 'find' : 'filter'](attrs);
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function findWhere(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function sort(options) {
      var comparator = this.comparator;
      if (!comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      var length = comparator.length;
      if (_.isFunction(comparator)) comparator = _.bind(comparator, this);

      // Run sort based on type of `comparator`.
      if (length === 1 || _.isString(comparator)) {
        this.models = this.sortBy(comparator);
      } else {
        this.models.sort(comparator);
      }
      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function pluck(attr) {
      return this.map(attr + '');
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function fetch(options) {
      options = _.extend({ parse: true }, options);
      var success = options.success;
      var collection = this;
      options.success = function (resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success.call(options.context, collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function create(model, options) {
      options = options ? _.clone(options) : {};
      var wait = options.wait;
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function (m, resp, callbackOpts) {
        if (wait) collection.add(m, callbackOpts);
        if (success) success.call(callbackOpts.context, m, resp, callbackOpts);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function parse(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function clone() {
      return new this.constructor(this.models, {
        model: this.model,
        comparator: this.comparator
      });
    },

    // Define how to uniquely identify models in the collection.
    modelId: function modelId(attrs) {
      return attrs[this.model.prototype.idAttribute || 'id'];
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function _reset() {
      this.length = 0;
      this.models = [];
      this._byId = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function _prepareModel(attrs, options) {
      if (this._isModel(attrs)) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method called by both remove and set.
    _removeModels: function _removeModels(models, options) {
      var removed = [];
      for (var i = 0; i < models.length; i++) {
        var model = this.get(models[i]);
        if (!model) continue;

        var index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;

        // Remove references before triggering 'remove' event to prevent an
        // infinite loop. #3693
        delete this._byId[model.cid];
        var id = this.modelId(model.attributes);
        if (id != null) delete this._byId[id];

        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }

        removed.push(model);
        this._removeReference(model, options);
      }
      return removed;
    },

    // Method for checking whether an object should be considered a model for
    // the purposes of adding to the collection.
    _isModel: function _isModel(model) {
      return model instanceof Model;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function _addReference(model, options) {
      this._byId[model.cid] = model;
      var id = this.modelId(model.attributes);
      if (id != null) this._byId[id] = model;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function _removeReference(model, options) {
      delete this._byId[model.cid];
      var id = this.modelId(model.attributes);
      if (id != null) delete this._byId[id];
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function _onModelEvent(event, model, collection, options) {
      if (model) {
        if ((event === 'add' || event === 'remove') && collection !== this) return;
        if (event === 'destroy') this.remove(model, options);
        if (event === 'change') {
          var prevId = this.modelId(model.previousAttributes());
          var id = this.modelId(model.attributes);
          if (prevId !== id) {
            if (prevId != null) delete this._byId[prevId];
            if (id != null) this._byId[id] = model;
          }
        }
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var collectionMethods = { forEach: 3, each: 3, map: 3, collect: 3, reduce: 0,
    foldl: 0, inject: 0, reduceRight: 0, foldr: 0, find: 3, detect: 3, filter: 3,
    select: 3, reject: 3, every: 3, all: 3, some: 3, any: 3, include: 3, includes: 3,
    contains: 3, invoke: 0, max: 3, min: 3, toArray: 1, size: 1, first: 3,
    head: 3, take: 3, initial: 3, rest: 3, tail: 3, drop: 3, last: 3,
    without: 0, difference: 0, indexOf: 3, shuffle: 1, lastIndexOf: 3,
    isEmpty: 1, chain: 1, sample: 3, partition: 3, groupBy: 3, countBy: 3,
    sortBy: 3, indexBy: 3, findIndex: 3, findLastIndex: 3 };

  // Mix in each Underscore method as a proxy to `Collection#models`.
  addUnderscoreMethods(Collection, collectionMethods, 'models');

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function (options) {
    this.cid = _.uniqueId('view');
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be set as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function $(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function initialize() {},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function render() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function remove() {
      this._removeElement();
      this.stopListening();
      return this;
    },

    // Remove this view's element from the document and all event listeners
    // attached to it. Exposed for subclasses using an alternative DOM
    // manipulation API.
    _removeElement: function _removeElement() {
      this.$el.remove();
    },

    // Change the view's element (`this.el` property) and re-delegate the
    // view's events on the new element.
    setElement: function setElement(element) {
      this.undelegateEvents();
      this._setElement(element);
      this.delegateEvents();
      return this;
    },

    // Creates the `this.el` and `this.$el` references for this view using the
    // given `el`. `el` can be a CSS selector or an HTML string, a jQuery
    // context or an element. Subclasses can override this to utilize an
    // alternative DOM manipulation API and are only required to set the
    // `this.el` property.
    _setElement: function _setElement(el) {
      this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
      this.el = this.$el[0];
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    delegateEvents: function delegateEvents(events) {
      events || (events = _.result(this, 'events'));
      if (!events) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[method];
        if (!method) continue;
        var match = key.match(delegateEventSplitter);
        this.delegate(match[1], match[2], _.bind(method, this));
      }
      return this;
    },

    // Add a single event listener to the view's element (or a child element
    // using `selector`). This only works for delegate-able events: not `focus`,
    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
    delegate: function delegate(eventName, selector, listener) {
      this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Clears all callbacks previously bound to the view by `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function undelegateEvents() {
      if (this.$el) this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
    undelegate: function undelegate(eventName, selector, listener) {
      this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Produces a DOM element to be assigned to your view. Exposed for
    // subclasses using an alternative DOM manipulation API.
    _createElement: function _createElement(tagName) {
      return document.createElement(tagName);
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function _ensureElement() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        this.setElement(this._createElement(_.result(this, 'tagName')));
        this._setAttributes(attrs);
      } else {
        this.setElement(_.result(this, 'el'));
      }
    },

    // Set attributes from a hash on this view's element.  Exposed for
    // subclasses using an alternative DOM manipulation API.
    _setAttributes: function _setAttributes(attributes) {
      this.$el.attr(attributes);
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function (method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = { type: type, dataType: 'json' };

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? { model: params.data } : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function (xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // Pass along `textStatus` and `errorThrown` from jQuery.
    var error = options.error;
    options.error = function (xhr, textStatus, errorThrown) {
      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch': 'PATCH',
    'delete': 'DELETE',
    'read': 'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function () {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function (options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam = /(\(\?)?:\w+/g;
  var splatParam = /\*\w+/g;
  var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function initialize() {},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function route(_route, name, callback) {
      if (!_.isRegExp(_route)) _route = this._routeToRegExp(_route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(_route, function (fragment) {
        var args = router._extractParameters(_route, fragment);
        if (router.execute(callback, args, name) !== false) {
          router.trigger.apply(router, ['route:' + name].concat(args));
          router.trigger('route', name, args);
          Backbone.history.trigger('route', router, name, args);
        }
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function execute(callback, args, name) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function navigate(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function _bindRoutes() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route,
          routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function _routeToRegExp(route) {
      route = route.replace(escapeRegExp, '\\$&').replace(optionalParam, '(?:$1)?').replace(namedParam, function (match, optional) {
        return optional ? match : '([^/?]+)';
      }).replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function _extractParameters(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function (param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function () {
    this.handlers = [];
    this.checkUrl = _.bind(this.checkUrl, this);

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function atRoot() {
      var path = this.location.pathname.replace(/[^\/]$/, '$&/');
      return path === this.root && !this.getSearch();
    },

    // Does the pathname match the root?
    matchRoot: function matchRoot() {
      var path = this.decodeFragment(this.location.pathname);
      var rootPath = path.slice(0, this.root.length - 1) + '/';
      return rootPath === this.root;
    },

    // Unicode characters in `location.pathname` are percent encoded so they're
    // decoded for comparison. `%25` should not be decoded since it may be part
    // of an encoded parameter.
    decodeFragment: function decodeFragment(fragment) {
      return decodeURI(fragment.replace(/%25/g, '%2525'));
    },

    // In IE6, the hash fragment and search params are incorrect if the
    // fragment contains `?`.
    getSearch: function getSearch() {
      var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
      return match ? match[0] : '';
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function getHash(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the pathname and search params, without the root.
    getPath: function getPath() {
      var path = this.decodeFragment(this.location.pathname + this.getSearch()).slice(this.root.length - 1);
      return path.charAt(0) === '/' ? path.slice(1) : path;
    },

    // Get the cross-browser normalized URL fragment from the path or hash.
    getFragment: function getFragment(fragment) {
      if (fragment == null) {
        if (this._usePushState || !this._wantsHashChange) {
          fragment = this.getPath();
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function start(options) {
      if (History.started) throw new Error('Backbone.history has already been started');
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options = _.extend({ root: '/' }, this.options, options);
      this.root = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._hasHashChange = 'onhashchange' in window && (document.documentMode === void 0 || document.documentMode > 7);
      this._useHashChange = this._wantsHashChange && this._hasHashChange;
      this._wantsPushState = !!this.options.pushState;
      this._hasPushState = !!(this.history && this.history.pushState);
      this._usePushState = this._wantsPushState && this._hasPushState;
      this.fragment = this.getFragment();

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          var rootPath = this.root.slice(0, -1) || '/';
          this.location.replace(rootPath + '#' + this.getPath());
          // Return immediately as browser will do redirect to new url
          return true;

          // Or if we've started out with a hash-based route, but we're currently
          // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot()) {
          this.navigate(this.getHash(), { replace: true });
        }
      }

      // Proxy an iframe to handle location events if the browser doesn't
      // support the `hashchange` event, HTML5 history, or the user wants
      // `hashChange` but not `pushState`.
      if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
        this.iframe = document.createElement('iframe');
        this.iframe.src = 'javascript:0';
        this.iframe.style.display = 'none';
        this.iframe.tabIndex = -1;
        var body = document.body;
        // Using `appendChild` will throw on IE < 9 if the document is not ready.
        var iWindow = body.insertBefore(this.iframe, body.firstChild).contentWindow;
        iWindow.document.open();
        iWindow.document.close();
        iWindow.location.hash = '#' + this.fragment;
      }

      // Add a cross-platform `addEventListener` shim for older browsers.
      var addEventListener = window.addEventListener || function (eventName, listener) {
        return attachEvent('on' + eventName, listener);
      };

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._usePushState) {
        addEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        addEventListener('hashchange', this.checkUrl, false);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function stop() {
      // Add a cross-platform `removeEventListener` shim for older browsers.
      var removeEventListener = window.removeEventListener || function (eventName, listener) {
        return detachEvent('on' + eventName, listener);
      };

      // Remove window listeners.
      if (this._usePushState) {
        removeEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        removeEventListener('hashchange', this.checkUrl, false);
      }

      // Clean up the iframe if necessary.
      if (this.iframe) {
        document.body.removeChild(this.iframe);
        this.iframe = null;
      }

      // Some environments will throw when clearing an undefined interval.
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function route(_route2, callback) {
      this.handlers.unshift({ route: _route2, callback: callback });
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function checkUrl(e) {
      var current = this.getFragment();

      // If the user pressed the back button, the iframe's hash will have
      // changed and we should use that for comparison.
      if (current === this.fragment && this.iframe) {
        current = this.getHash(this.iframe.contentWindow);
      }

      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function loadUrl(fragment) {
      // If the root doesn't match, no routes can match either.
      if (!this.matchRoot()) return false;
      fragment = this.fragment = this.getFragment(fragment);
      return _.some(this.handlers, function (handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function navigate(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = { trigger: !!options };

      // Normalize the fragment.
      fragment = this.getFragment(fragment || '');

      // Don't include a trailing slash on the root.
      var rootPath = this.root;
      if (fragment === '' || fragment.charAt(0) === '?') {
        rootPath = rootPath.slice(0, -1) || '/';
      }
      var url = rootPath + fragment;

      // Strip the hash and decode for matching.
      fragment = this.decodeFragment(fragment.replace(pathStripper, ''));

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._usePushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

        // If hash changes haven't been explicitly disabled, update the hash
        // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && fragment !== this.getHash(this.iframe.contentWindow)) {
          var iWindow = this.iframe.contentWindow;

          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if (!options.replace) {
            iWindow.document.open();
            iWindow.document.close();
          }

          this._updateHash(iWindow.location, fragment, options.replace);
        }

        // If you've told us that you explicitly don't want fallback hashchange-
        // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function _updateHash(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History();

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function extend(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function child() {
        return parent.apply(this, arguments);
      };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    child.prototype = _.create(parent.prototype, protoProps);
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function urlError() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function wrapError(model, options) {
    var error = options.error;
    options.error = function (resp) {
      if (error) error.call(options.context, model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(41)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery JavaScript Library v1.12.4
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2017-10-25T15:48Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//"use strict";
var deletedIds = [];

var document = window.document;

var slice = deletedIds.slice;

var concat = deletedIds.concat;

var push = deletedIds.push;

var indexOf = deletedIds.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	version = "1.12.4",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1, IE<9
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: deletedIds.sort,
	splice: deletedIds.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type( obj ) === "array";
	},

	isWindow: function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {

		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	isPlainObject: function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {

			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call( obj, "constructor" ) &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {

			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if ( !support.ownFirst ) {
			for ( key in obj ) {
				return hasOwn.call( obj, key );
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {

			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data ); // jscs:ignore requireDotNotation
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1, IE<9
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( indexOf ) {
				return indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {

				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		while ( j < len ) {
			first[ i++ ] = second[ j++ ];
		}

		// Support: IE<9
		// Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
		if ( len !== len ) {
			while ( second[ j ] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: function() {
		return +( new Date() );
	},

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

// JSHint would error on this code due to the Symbol not being defined in ES5.
// Defining this global in .jshintrc would create a danger of using the global
// unguarded in another place, it seems safer to just disable JSHint for these
// three lines.
/* jshint ignore: start */
if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = deletedIds[ Symbol.iterator ];
}
/* jshint ignore: end */

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.1
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-10-17
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, nidselect, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
					while ( i-- ) {
						groups[i] = nidselect + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( (parent = document.defaultView) && parent.top !== parent ) {
		// Support: IE 11
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				return m ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( (oldCache = uniqueCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		} );

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) > -1 ) !== not;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i,
			ret = [],
			self = this,
			len = self.length;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// init accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt( 0 ) === "<" &&
				selector.charAt( selector.length - 1 ) === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {

						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[ 2 ] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[ 0 ] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof root.ready !== "undefined" ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter( function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

				// Always skip document fragments
				if ( cur.nodeType < 11 && ( pos ?
					pos.index( cur ) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector( cur, selectors ) ) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[ 0 ], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem, this );
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				ret = jQuery.uniqueSort( ret );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}
		}

		return this.pushStack( ret );
	};
} );
var rnotwhite = ( /\S+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = true;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this === promise ? newDefer.promise() : this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add( function() {

					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 ||
				( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred.
			// If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );

					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.progress( updateFunc( i, progressContexts, progressValues ) )
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
} );


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {

	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
} );

/**
 * Clean-up method for dom ready events
 */
function detach() {
	if ( document.addEventListener ) {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );

	} else {
		document.detachEvent( "onreadystatechange", completed );
		window.detachEvent( "onload", completed );
	}
}

/**
 * The ready event handler and self cleanup method
 */
function completed() {

	// readyState === "complete" is good enough for us to call the dom ready in oldIE
	if ( document.addEventListener ||
		window.event.type === "load" ||
		document.readyState === "complete" ) {

		detach();
		jQuery.ready();
	}
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// Support: IE6-10
		// Older IE sometimes signals "interactive" too soon
		if ( document.readyState === "complete" ||
			( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed );

		// If IE event model is used
		} else {

			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch ( e ) {}

			if ( top && top.doScroll ) {
				( function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {

							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll( "left" );
						} catch ( e ) {
							return window.setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				} )();
			}
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Support: IE<9
// Iteration over object's inherited properties before its own
var i;
for ( i in jQuery( support ) ) {
	break;
}
support.ownFirst = i === "0";

// Note: most support tests are defined in their respective modules.
// false until the test is run
support.inlineBlockNeedsLayout = false;

// Execute ASAP in case we need to set body.style.zoom
jQuery( function() {

	// Minified: var a,b,c,d
	var val, div, body, container;

	body = document.getElementsByTagName( "body" )[ 0 ];
	if ( !body || !body.style ) {

		// Return for frameset docs that don't have a body
		return;
	}

	// Setup
	div = document.createElement( "div" );
	container = document.createElement( "div" );
	container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
	body.appendChild( container ).appendChild( div );

	if ( typeof div.style.zoom !== "undefined" ) {

		// Support: IE<8
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		div.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1";

		support.inlineBlockNeedsLayout = val = div.offsetWidth === 3;
		if ( val ) {

			// Prevent IE 6 from affecting layout for positioned elements #11048
			// Prevent IE from shrinking the body in IE 7 mode #12869
			// Support: IE<8
			body.style.zoom = 1;
		}
	}

	body.removeChild( container );
} );


( function() {
	var div = document.createElement( "div" );

	// Support: IE<9
	support.deleteExpando = true;
	try {
		delete div.test;
	} catch ( e ) {
		support.deleteExpando = false;
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();
var acceptData = function( elem ) {
	var noData = jQuery.noData[ ( elem.nodeName + " " ).toLowerCase() ],
		nodeType = +elem.nodeType || 1;

	// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
	return nodeType !== 1 && nodeType !== 9 ?
		false :

		// Nodes accept data unless otherwise specified; rejection can be conditional
		!noData || noData !== true && elem.getAttribute( "classid" ) === noData;
};




var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :

					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[ name ] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

function internalData( elem, name, data, pvt /* Internal Use Only */ ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var ret, thisCache,
		internalKey = jQuery.expando,

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( ( !id || !cache[ id ] || ( !pvt && !cache[ id ].data ) ) &&
		data === undefined && typeof name === "string" ) {
		return;
	}

	if ( !id ) {

		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {

		// Avoid exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( typeof name === "string" ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var thisCache, i,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split( " " );
					}
				}
			} else {

				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			i = name.length;
			while ( i-- ) {
				delete thisCache[ name[ i ] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( pvt ? !isEmptyDataObject( thisCache ) : !jQuery.isEmptyObject( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	/* jshint eqeqeq: false */
	} else if ( support.deleteExpando || cache != cache.window ) {
		/* jshint eqeqeq: true */
		delete cache[ id ];

	// When all else fails, undefined
	} else {
		cache[ id ] = undefined;
	}
}

jQuery.extend( {
	cache: {},

	// The following elements (space-suffixed to avoid Object.prototype collisions)
	// throw uncatchable exceptions if you attempt to set expando properties
	noData: {
		"applet ": true,
		"embed ": true,

		// ...but Flash objects (which have this classid) *can* handle expandos
		"object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[ jQuery.expando ] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Special expections of .data basically thwart jQuery.access,
		// so implement the relevant behavior ourselves

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				jQuery.data( this, key );
			} );
		}

		return arguments.length > 1 ?

			// Sets one value
			this.each( function() {
				jQuery.data( this, key, value );
			} ) :

			// Gets one value
			// Try to fetch any internally stored data first
			elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : undefined;
	},

	removeData: function( key ) {
		return this.each( function() {
			jQuery.removeData( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object,
	// or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );


( function() {
	var shrinkWrapBlocksVal;

	support.shrinkWrapBlocks = function() {
		if ( shrinkWrapBlocksVal != null ) {
			return shrinkWrapBlocksVal;
		}

		// Will be changed later if needed.
		shrinkWrapBlocksVal = false;

		// Minified: var b,c,d
		var div, body, container;

		body = document.getElementsByTagName( "body" )[ 0 ];
		if ( !body || !body.style ) {

			// Test fired too early or in an unsupported environment, exit.
			return;
		}

		// Setup
		div = document.createElement( "div" );
		container = document.createElement( "div" );
		container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
		body.appendChild( container ).appendChild( div );

		// Support: IE6
		// Check if elements with layout shrink-wrap their children
		if ( typeof div.style.zoom !== "undefined" ) {

			// Reset CSS: box-sizing; display; margin; border
			div.style.cssText =

				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;" +
				"padding:1px;width:1px;zoom:1";
			div.appendChild( document.createElement( "div" ) ).style.width = "5px";
			shrinkWrapBlocksVal = div.offsetWidth !== 3;
		}

		body.removeChild( container );

		return shrinkWrapBlocksVal;
	};

} )();
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {

		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" ||
			!jQuery.contains( elem.ownerDocument, elem );
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() { return tween.cur(); } :
			function() { return jQuery.css( elem, prop, "" ); },
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		length = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < length; i++ ) {
				fn(
					elems[ i ],
					key,
					raw ? value : value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			length ? fn( elems[ 0 ], key ) : emptyGet;
};
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([\w:-]+)/ );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );

var rleadingWhitespace = ( /^\s+/ );

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|" +
		"details|dialog|figcaption|figure|footer|header|hgroup|main|" +
		"mark|meter|nav|output|picture|progress|section|summary|template|time|video";



function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}


( function() {
	var div = document.createElement( "div" ),
		fragment = document.createDocumentFragment(),
		input = document.createElement( "input" );

	// Setup
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// IE strips leading whitespace when .innerHTML is used
	support.leadingWhitespace = div.firstChild.nodeType === 3;

	// Make sure that tbody elements aren't automatically inserted
	// IE will insert them into empty tables
	support.tbody = !div.getElementsByTagName( "tbody" ).length;

	// Make sure that link elements get serialized correctly by innerHTML
	// This requires a wrapper element in IE
	support.htmlSerialize = !!div.getElementsByTagName( "link" ).length;

	// Makes sure cloning an html5 element does not cause problems
	// Where outerHTML is undefined, this still works
	support.html5Clone =
		document.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>";

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	input.type = "checkbox";
	input.checked = true;
	fragment.appendChild( input );
	support.appendChecked = input.checked;

	// Make sure textarea (and checkbox) defaultValue is properly cloned
	// Support: IE6-IE11+
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// #11217 - WebKit loses check when the name is after the checked attribute
	fragment.appendChild( div );

	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input = document.createElement( "input" );
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Cloned elements keep attachEvent handlers, we use addEventListener on IE9+
	support.noCloneEvent = !!div.addEventListener;

	// Support: IE<9
	// Since attributes and properties are the same in IE,
	// cleanData must set properties to undefined rather than use removeAttribute
	div[ jQuery.expando ] = 1;
	support.attributes = !div.getAttribute( jQuery.expando );
} )();


// We have to close these tags to support XHTML (#13200)
var wrapMap = {
	option: [ 1, "<select multiple='multiple'>", "</select>" ],
	legend: [ 1, "<fieldset>", "</fieldset>" ],
	area: [ 1, "<map>", "</map>" ],

	// Support: IE8
	param: [ 1, "<object>", "</object>" ],
	thead: [ 1, "<table>", "</table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
	// unless wrapped in a div with non-breaking characters in front of it.
	_default: support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>" ]
};

// Support: IE8-IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== "undefined" ?
				context.querySelectorAll( tag || "*" ) :
				undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context;
			( elem = elems[ i ] ) != null;
			i++
		) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; ( elem = elems[ i ] ) != null; i++ ) {
		jQuery._data(
			elem,
			"globalEval",
			!refElements || jQuery._data( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/,
	rtbody = /<tbody/i;

function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

function buildFragment( elems, context, scripts, selection, ignored ) {
	var j, elem, contains,
		tmp, tag, tbody, wrap,
		l = elems.length,

		// Ensure a safe fragment
		safe = createSafeFragment( context ),

		nodes = [],
		i = 0;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || safe.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;

				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Manually add leading whitespace removed by IE
				if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
					nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[ 0 ] ) );
				}

				// Remove IE's autoinserted <tbody> from table fragments
				if ( !support.tbody ) {

					// String was a <table>, *may* have spurious <tbody>
					elem = tag === "table" && !rtbody.test( elem ) ?
						tmp.firstChild :

						// String was a bare <thead> or <tfoot>
						wrap[ 1 ] === "<table>" && !rtbody.test( elem ) ?
							tmp :
							0;

					j = elem && elem.childNodes.length;
					while ( j-- ) {
						if ( jQuery.nodeName( ( tbody = elem.childNodes[ j ] ), "tbody" ) &&
							!tbody.childNodes.length ) {

							elem.removeChild( tbody );
						}
					}
				}

				jQuery.merge( nodes, tmp.childNodes );

				// Fix #12392 for WebKit and IE > 9
				tmp.textContent = "";

				// Fix #12392 for oldIE
				while ( tmp.firstChild ) {
					tmp.removeChild( tmp.firstChild );
				}

				// Remember the top-level container for proper cleanup
				tmp = safe.lastChild;
			}
		}
	}

	// Fix #11356: Clear elements from fragment
	if ( tmp ) {
		safe.removeChild( tmp );
	}

	// Reset defaultChecked for any radios and checkboxes
	// about to be appended to the DOM in IE 6/7 (#8060)
	if ( !support.appendChecked ) {
		jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
	}

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}

			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( safe.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	tmp = null;

	return safe;
}


( function() {
	var i, eventName,
		div = document.createElement( "div" );

	// Support: IE<9 (lack submit/change bubble), Firefox (lack focus(in | out) events)
	for ( i in { submit: true, change: true, focusin: true } ) {
		eventName = "on" + i;

		if ( !( support[ i ] = eventName in window ) ) {

			// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
			div.setAttribute( eventName, "t" );
			support[ i ] = div.attributes[ eventName ].expando === false;
		}
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();


var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE9
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" &&
					( !e || jQuery.event.triggered !== e.type ) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};

			// Add elem as a property of the handle fn to prevent a memory leak
			// with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] &&
				jQuery._data( cur, "handle" );

			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if (
				( !special._default ||
				 special._default.apply( eventPath.pop(), data ) === false
				) && acceptData( elem )
			) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {

						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Support (at least): Chrome, IE9
		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		//
		// Support: Firefox<=42+
		// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
		if ( delegateCount && cur.nodeType &&
			( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

			/* jshint eqeqeq: false */
			for ( ; cur != this; cur = cur.parentNode || this ) {
				/* jshint eqeqeq: true */

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push( { elem: cur, handlers: matches } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Safari 6-8+
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
		"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split( " " ),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: ( "button buttons clientX clientY fromElement offsetX offsetY " +
			"pageX pageY screenX screenY toElement" ).split( " " ),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX +
					( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
					( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY +
					( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
					( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ?
					original.toElement :
					fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {

						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	// Piggyback on a donor event to simulate a different one
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true

				// Previously, `originalEvent: {}` was set here, so stopPropagation call
				// would not be triggered on donor event, since in our own
				// jQuery.event.stopPropagation function we had a check for existence of
				// originalEvent.stopPropagation method, so, consequently it would be a noop.
				//
				// Guard for simulated events was moved to jQuery.event.stopPropagation function
				// since `originalEvent` should point to the original event for the
				// constancy with other events and for more focused logic
			}
		);

		jQuery.event.trigger( e, null, elem );

		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event,
			// to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: IE < 9, Android < 4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( !e || this.isSimulated ) {
			return;
		}

		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://code.google.com/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

// IE submit delegation
if ( !support.submit ) {

	jQuery.event.special.submit = {
		setup: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {

				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ?

						// Support: IE <=8
						// We use jQuery.prop instead of elem.form
						// to allow fixing the IE8 delegated submit issue (gh-2332)
						// by 3rd party polyfills/workarounds.
						jQuery.prop( elem, "form" ) :
						undefined;

				if ( form && !jQuery._data( form, "submit" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submitBubble = true;
					} );
					jQuery._data( form, "submit", true );
				}
			} );

			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {

			// If form was submitted by the user, bubble the event up the tree
			if ( event._submitBubble ) {
				delete event._submitBubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event );
				}
			}
		},

		teardown: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !support.change ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {

				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._justChanged = true;
						}
					} );
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._justChanged && !event.isTrigger ) {
							this._justChanged = false;
						}

						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event );
					} );
				}
				return false;
			}

			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "change" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event );
						}
					} );
					jQuery._data( elem, "change", true );
				}
			} );
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger ||
				( elem.type !== "radio" && elem.type !== "checkbox" ) ) {

				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Support: Firefox
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome, Safari
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				jQuery._data( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					jQuery._removeData( doc, fix );
				} else {
					jQuery._data( doc, fix, attaches );
				}
			}
		};
	} );
}

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	},

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


var rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp( "<(?:" + nodeNames + ")[\\s/>]", "i" ),
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

	// Support: IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement( "div" ) );

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName( "tbody" )[ 0 ] ||
			elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( jQuery.find.attr( elem, "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}
	return elem;
}

function cloneCopyEvent( src, dest ) {
	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( support.html5Clone && ( src.innerHTML && !jQuery.trim( dest.innerHTML ) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {

		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var first, node, hasScripts,
		scripts, doc, fragment,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android<4.1, PhantomJS<2
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!jQuery._data( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							jQuery.globalEval(
								( node.text || node.textContent || node.innerHTML || "" )
									.replace( rcleanScript, "" )
							);
						}
					}
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		elems = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = elems[ i ] ) != null; i++ ) {

		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( support.html5Clone || jQuery.isXMLDoc( elem ) ||
			!rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {

			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( ( !support.noCloneEvent || !support.noCloneChecked ) &&
				( elem.nodeType === 1 || elem.nodeType === 11 ) && !jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; ( node = srcElements[ i ] ) != null; ++i ) {

				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[ i ] ) {
					fixCloneNodeIssues( node, destElements[ i ] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; ( node = srcElements[ i ] ) != null; i++ ) {
					cloneCopyEvent( node, destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems, /* internal */ forceAcceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			attributes = support.attributes,
			special = jQuery.event.special;

		for ( ; ( elem = elems[ i ] ) != null; i++ ) {
			if ( forceAcceptData || acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// Support: IE<9
						// IE does not allow us to delete expando properties from nodes
						// IE creates expando attributes along with the property
						// IE does not have a removeAttribute function on Document nodes
						if ( !attributes && typeof elem.removeAttribute !== "undefined" ) {
							elem.removeAttribute( internalKey );

						// Webkit & Blink performance suffers when deleting properties
						// from DOM nodes, so set to undefined instead
						// https://code.google.com/p/chromium/issues/detail?id=378607
						} else {
							elem[ internalKey ] = undefined;
						}

						deletedIds.push( id );
					}
				}
			}
		}
	}
} );

jQuery.fn.extend( {

	// Keep domManip exposed until 3.0 (gh-2225)
	domManip: domManip,

	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append(
					( this[ 0 ] && this[ 0 ].ownerDocument || document ).createTextNode( value )
				);
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {

			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {

						// Remove element nodes and prevent memory leaks
						elem = this[ i ] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );


var iframe,
	elemdisplay = {

		// Support: Firefox
		// We have to pre-define these values for FF (#10227)
		HTML: "block",
		BODY: "block"
	};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */

// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		display = jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
				.appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[ 0 ].contentWindow || iframe[ 0 ].contentDocument ).document;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var documentElement = document.documentElement;



( function() {
	var pixelPositionVal, pixelMarginRightVal, boxSizingReliableVal,
		reliableHiddenOffsetsVal, reliableMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	div.style.cssText = "float:left;opacity:.5";

	// Support: IE<9
	// Make sure that element opacity exists (as opposed to filter)
	support.opacity = div.style.opacity === "0.5";

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!div.style.cssFloat;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container = document.createElement( "div" );
	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	div.innerHTML = "";
	container.appendChild( div );

	// Support: Firefox<29, Android 2.3
	// Vendor-prefix box-sizing
	support.boxSizing = div.style.boxSizing === "" || div.style.MozBoxSizing === "" ||
		div.style.WebkitBoxSizing === "";

	jQuery.extend( support, {
		reliableHiddenOffsets: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableHiddenOffsetsVal;
		},

		boxSizingReliable: function() {

			// We're checking for pixelPositionVal here instead of boxSizingReliableVal
			// since that compresses better and they're computed together anyway.
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},

		pixelMarginRight: function() {

			// Support: Android 4.0-4.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelMarginRightVal;
		},

		pixelPosition: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelPositionVal;
		},

		reliableMarginRight: function() {

			// Support: Android 2.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginRightVal;
		},

		reliableMarginLeft: function() {

			// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginLeftVal;
		}
	} );

	function computeStyleTests() {
		var contents, divStyle,
			documentElement = document.documentElement;

		// Setup
		documentElement.appendChild( container );

		div.style.cssText =

			// Support: Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";

		// Support: IE<9
		// Assume reasonable values in the absence of getComputedStyle
		pixelPositionVal = boxSizingReliableVal = reliableMarginLeftVal = false;
		pixelMarginRightVal = reliableMarginRightVal = true;

		// Check for getComputedStyle so that this code is not run in IE<9.
		if ( window.getComputedStyle ) {
			divStyle = window.getComputedStyle( div );
			pixelPositionVal = ( divStyle || {} ).top !== "1%";
			reliableMarginLeftVal = ( divStyle || {} ).marginLeft === "2px";
			boxSizingReliableVal = ( divStyle || { width: "4px" } ).width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = ( divStyle || { marginRight: "4px" } ).marginRight === "4px";

			// Support: Android 2.3 only
			// Div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			contents = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			contents.style.cssText = div.style.cssText =

				// Support: Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
			contents.style.marginRight = contents.style.width = "0";
			div.style.width = "1px";

			reliableMarginRightVal =
				!parseFloat( ( window.getComputedStyle( contents ) || {} ).marginRight );

			div.removeChild( contents );
		}

		// Support: IE6-8
		// First check that getClientRects works as expected
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.style.display = "none";
		reliableHiddenOffsetsVal = div.getClientRects().length === 0;
		if ( reliableHiddenOffsetsVal ) {
			div.style.display = "";
			div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
			div.childNodes[ 0 ].style.borderCollapse = "separate";
			contents = div.getElementsByTagName( "td" );
			contents[ 0 ].style.cssText = "margin:0;border:0;padding:0;display:none";
			reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			if ( reliableHiddenOffsetsVal ) {
				contents[ 0 ].style.display = "";
				contents[ 1 ].style.display = "none";
				reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			}
		}

		// Teardown
		documentElement.removeChild( container );
	}

} )();


var getStyles, curCSS,
	rposition = /^(top|right|bottom|left)$/;

if ( window.getComputedStyle ) {
	getStyles = function( elem ) {

		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

	curCSS = function( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		if ( computed ) {

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value"
			// instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values,
			// but width seems to be reliably pixels
			// this is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "";
	};
} else if ( documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, computed ) {
		var left, rs, rsLeft, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed[ name ] : undefined;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are
		// proportional to the parent element instead
		// and we can't measure the parent instead because it
		// might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "" || "auto";
	};
}




function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

		ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/i,

	// swappable if display is none or starts with table except
	// "table", "table-cell", or "table-caption"
	// see here for display values:
	// https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;


// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt( 0 ).toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {

			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] =
					jQuery._data( elem, "olddisplay", defaultDisplay( elem.nodeName ) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display && display !== "none" || !hidden ) {
				jQuery._data(
					elem,
					"olddisplay",
					hidden ? display : jQuery.css( elem, "display" )
				);
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?

		// If we already have the right measurement, avoid augmentation
		4 :

		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {

		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = support.boxSizing &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {

		// normalize float css property
		"float": support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set. See: #7116
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight
			// (for every problematic property) identical functions
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				// Support: IE
				// Swallow errors from 'invalid' CSS values (#5509)
				try {
					style[ name ] = value;
				} catch ( e ) {}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
					elem.offsetWidth === 0 ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					support.boxSizing &&
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
} );

if ( !support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {

			// IE uses filters for opacity
			return ropacity.test( ( computed && elem.currentStyle ?
				elem.currentStyle.filter :
				elem.style.filter ) || "" ) ?
					( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
					computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist -
			// attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule
				// or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return (
				parseFloat( curCSS( elem, "marginLeft" ) ) ||

				// Support: IE<=11+
				// Running getBoundingClientRect on a disconnected node in IE throws an error
				// Support: IE8 only
				// getClientRects() errors on disconnected elems
				( jQuery.contains( elem.ownerDocument, elem ) ?
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} ) :
					0
				)
			) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// we're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = jQuery._data( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			jQuery._data( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !support.inlineBlockNeedsLayout || defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";
			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !support.shrinkWrapBlocks() ) {
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show
				// and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = jQuery._data( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done( function() {
				jQuery( elem ).hide();
			} );
		}
		anim.done( function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		} );
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnotwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ?
			jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	window.clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var a,
		input = document.createElement( "input" ),
		div = document.createElement( "div" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	// Setup
	div = document.createElement( "div" );
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Support: Windows Web Apps (WWA)
	// `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "checkbox" );
	div.appendChild( input );

	a = div.getElementsByTagName( "a" )[ 0 ];

	// First batch of tests.
	a.style.cssText = "top:1px";

	// Test setAttribute on camelCase class.
	// If it works, we need attrFixes when doing get/setAttribute (ie6/7)
	support.getSetAttribute = div.className !== "t";

	// Get the style information from getAttribute
	// (IE uses .cssText instead)
	support.style = /top/.test( a.getAttribute( "style" ) );

	// Make sure that URLs aren't manipulated
	// (IE normalizes it by default)
	support.hrefNormalized = a.getAttribute( "href" ) === "/a";

	// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
	support.checkOn = !!input.value;

	// Make sure that a selected-by-default option has a working selected property.
	// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
	support.optSelected = opt.selected;

	// Tests for enctype support on a form (#6743)
	support.enctype = !!document.createElement( "form" ).enctype;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE8 only
	// Check if we can trust getAttribute("value")
	input = document.createElement( "input" );
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";
} )();


var rreturn = /\r/g,
	rspaces = /[\x20\t\r\n\f]+/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if (
					hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?

					// handle most common string cases
					ret.replace( rreturn, "" ) :

					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					jQuery.trim( jQuery.text( elem ) ).replace( rspaces, " " );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ?
								!option.disabled :
								option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled ||
								!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					if ( jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1 ) {

						// Support: IE6
						// When new option element is added to select box we need to
						// force reflow of newly added node in order to workaround delay
						// of initialization properties
						try {
							option.selected = optionSet = true;

						} catch ( _ ) {

							// Will be executed only in IE6
							option.scrollHeight;
						}

					} else {
						option.selected = false;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}

				return options;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = support.getSetAttribute,
	getSetInput = support.input;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {

					// Setting the type on a radio button after the value resets the value in IE8-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {

					// Set corresponding property to false
					if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
						elem[ propName ] = false;

					// Support: IE<9
					// Also clear defaultChecked/defaultSelected (if appropriate)
					} else {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {

			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		} else {

			// Support: IE<9
			// Use defaultChecked and defaultSelected for oldIE
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} else {
		attrHandle[ name ] = function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem[ jQuery.camelCase( "default-" + name ) ] ?
					name.toLowerCase() :
					null;
			}
		};
	}
} );

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {

				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {

				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = {
		set: function( elem, value, name ) {

			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					( ret = elem.ownerDocument.createAttribute( name ) )
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			if ( name === "value" || value === elem.getAttribute( name ) ) {
				return value;
			}
		}
	};

	// Some attributes are constructed with empty-string values when not defined
	attrHandle.id = attrHandle.name = attrHandle.coords =
		function( elem, name, isXML ) {
			var ret;
			if ( !isXML ) {
				return ( ret = elem.getAttributeNode( name ) ) && ret.value !== "" ?
					ret.value :
					null;
			}
		};

	// Fixing value retrieval on a button requires this module
	jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			if ( ret && ret.specified ) {
				return ret.value;
			}
		},
		set: nodeHook.set
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each( [ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		};
	} );
}

if ( !support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {

			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case sensitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}




var rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each( function() {

			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch ( e ) {}
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							-1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !support.hrefNormalized ) {

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each( [ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	} );
}

// Support: Safari, IE9+
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		},
		set: function( elem ) {
			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );

// IE6/7 call enctype encoding
if ( !support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}




var rclass = /[\t\r\n\f]/g;

function getClass( elem ) {
	return jQuery.attr( elem, "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnotwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// store className if set
					jQuery._data( this, "__className__", className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				jQuery.attr( this, "class",
					className || value === false ?
					"" :
					jQuery._data( this, "__className__" ) || ""
				);
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + getClass( elem ) + " " ).replace( rclass, " " )
					.indexOf( className ) > -1
			) {
				return true;
			}
		}

		return false;
	}
} );




// Return jQuery for attributes-only inclusion


jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );


var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;

jQuery.parseJSON = function( data ) {

	// Attempt to parse using the native JSON parser first
	if ( window.JSON && window.JSON.parse ) {

		// Support: Android 2.3
		// Workaround failure to string-cast null input
		return window.JSON.parse( data + "" );
	}

	var requireNonComma,
		depth = null,
		str = jQuery.trim( data + "" );

	// Guard against invalid (and possibly dangerous) input by ensuring that nothing remains
	// after removing valid tokens
	return str && !jQuery.trim( str.replace( rvalidtokens, function( token, comma, open, close ) {

		// Force termination if we see a misplaced comma
		if ( requireNonComma && comma ) {
			depth = 0;
		}

		// Perform no more replacements after returning to outermost depth
		if ( depth === 0 ) {
			return token;
		}

		// Commas must not follow "[", "{", or ","
		requireNonComma = open || comma;

		// Determine new depth
		// array/object open ("[" or "{"): depth += true - false (increment)
		// array/object close ("]" or "}"): depth += false - true (decrement)
		// other cases ("," or primitive): depth += true - true (numeric cast)
		depth += !close - !open;

		// Remove this token
		return "";
	} ) ) ?
		( Function( "return " + str ) )() :
		jQuery.error( "Invalid JSON: " + data );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	try {
		if ( window.DOMParser ) { // Standard
			tmp = new window.DOMParser();
			xml = tmp.parseFromString( data, "text/xml" );
		} else { // IE
			xml = new window.ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}
	} catch ( e ) {
		xml = undefined;
	}
	if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,

	// IE leaves an \r character at EOL
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Document location
	ajaxLocation = location.href,

	// Segment location into parts
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType.charAt( 0 ) === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) { // jscs:ignore requireDotNotation
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var

			// Cross-domain detection vars
			parts,

			// Loop variable
			i,

			// URL without anti-cache param
			cacheURL,

			// Response headers as string
			responseHeadersString,

			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,

			// Response headers
			responseHeaders,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// The jqXHR state
			state = 0,

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {

								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" )
			.replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );

				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapAll( html.call( this, i ) );
			} );
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			var wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function() {
		return this.parent().each( function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		} ).end();
	}
} );


function getDisplay( elem ) {
	return elem.style && elem.style.display || jQuery.css( elem, "display" );
}

function filterHidden( elem ) {

	// Disconnected elements are considered hidden
	if ( !jQuery.contains( elem.ownerDocument || document, elem ) ) {
		return true;
	}
	while ( elem && elem.nodeType === 1 ) {
		if ( getDisplay( elem ) === "none" || elem.type === "hidden" ) {
			return true;
		}
		elem = elem.parentNode;
	}
	return false;
}

jQuery.expr.filters.hidden = function( elem ) {

	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return support.reliableHiddenOffsets() ?
		( elem.offsetWidth <= 0 && elem.offsetHeight <= 0 &&
			!elem.getClientRects().length ) :
			filterHidden( elem );
};

jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {

			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} ) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?

	// Support: IE6-IE8
	function() {

		// XHR cannot access local files, always use ActiveX for that case
		if ( this.isLocal ) {
			return createActiveXHR();
		}

		// Support: IE 9-11
		// IE seems to error on cross-domain PATCH requests when ActiveX XHR
		// is used. In IE 9+ always use the native XHR.
		// Note: this condition won't catch Edge as it doesn't define
		// document.documentMode but it also doesn't support ActiveX so it won't
		// reach this code.
		if ( document.documentMode > 8 ) {
			return createStandardXHR();
		}

		// Support: IE<9
		// oldIE XHR does not support non-RFC2616 methods (#13240)
		// See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx
		// and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9
		// Although this check for six methods instead of eight
		// since IE also does not support "trace" and "connect"
		return /^(get|post|head|put|delete|options)$/i.test( this.type ) &&
			createStandardXHR() || createActiveXHR();
	} :

	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

var xhrId = 0,
	xhrCallbacks = {},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE<10
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	} );
}

// Determine support properties
support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport( function( options ) {

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !options.crossDomain || support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr(),
						id = ++xhrId;

					// Open the socket
					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {

						// Support: IE<9
						// IE's ActiveXObject throws a 'Type Mismatch' exception when setting
						// request header to a null-value.
						//
						// To keep consistent with other XHR implementations, cast the value
						// to string and ignore `undefined`.
						if ( headers[ i ] !== undefined ) {
							xhr.setRequestHeader( i, headers[ i ] + "" );
						}
					}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( options.hasContent && options.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, statusText, responses;

						// Was never called and is aborted or complete
						if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

							// Clean up
							delete xhrCallbacks[ id ];
							callback = undefined;
							xhr.onreadystatechange = jQuery.noop;

							// Abort manually if needed
							if ( isAbort ) {
								if ( xhr.readyState !== 4 ) {
									xhr.abort();
								}
							} else {
								responses = {};
								status = xhr.status;

								// Support: IE<10
								// Accessing binary-data responseText throws an exception
								// (#11426)
								if ( typeof xhr.responseText === "string" ) {
									responses.text = xhr.responseText;
								}

								// Firefox throws an exception when accessing
								// statusText for faulty cross-domain requests
								try {
									statusText = xhr.statusText;
								} catch ( e ) {

									// We normalize with Webkit giving an empty statusText
									statusText = "";
								}

								// Filter status for non standard behaviors

								// If the request is local and we have data: assume a success
								// (success with no data won't get notified, that's the best we
								// can do given current implementations)
								if ( !status && options.isLocal && !options.crossDomain ) {
									status = responses.text ? 200 : 404;

								// IE - #1450: sometimes returns 1223 when it should be 204
								} else if ( status === 1223 ) {
									status = 204;
								}
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, xhr.getAllResponseHeaders() );
						}
					};

					// Do send the request
					// `xhr.send` may raise an exception, but it will be
					// handled in jQuery.ajax (so no try/catch here)
					if ( !options.async ) {

						// If we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {

						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						window.setTimeout( callback );
					} else {

						// Register the callback, but delay it in case `xhr.send` throws
						// Add to the list of active xhr callbacks
						xhr.onreadystatechange = xhrCallbacks[ id ] = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	} );
}

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch ( e ) {}
}




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
// https://oktainc.atlassian.net/browse/OKTA-131142
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery( "head" )[ 0 ] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// data: string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = jQuery.trim( url.slice( off, url.length ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};





/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			jQuery.inArray( "auto", [ curCSSTop, curCSSLeft ] ) > -1;

		// need to be able to calculate position if either top or left
		// is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var docElem, win,
			box = { top: 0, left: 0 },
			elem = this[ 0 ],
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// If we don't have gBCR, just use 0,0 rather than error
		// BlackBerry 5, iOS 3 (original iPhone)
		if ( typeof elem.getBoundingClientRect !== "undefined" ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
			left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? ( prop in win ) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
} );

// Support: Safari<7-8+, Chrome<37-44+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
	function( defaultExtra, funcName ) {

		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only,
					// but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( true ) {
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() {
		return jQuery;
	}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
}



var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

//9/10/2018 - OKTA-187649 - Expose jQuery in the global window object to externalize it
//OKTA-Core loads jquery as part of the saasure.min.js file & in other repo's playgrounds, we're exclusively loading the jQuery now

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}

return jQuery;
}));


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {

  function _log(level, args) {
    if (window.console && window.okta && window.okta.debug) {
      window.console[level].apply(window.console, args);
    }
  }

  /**
   * Utility library of logging functions.
   * @class module:Okta.Logger
   */
  return (/** @lends module:Okta.Logger */{

      /**
       * See [console.trace](https://developer.mozilla.org/en-US/docs/Web/API/Console.trace)
       * @static
       */
      trace: function trace() {
        return _log('trace', arguments);
      },
      /**
       * See [console.dir](https://developer.mozilla.org/en-US/docs/Web/API/Console.dir)
       * @static
       */
      dir: function dir() {
        return _log('dir', arguments);
      },
      /**
       * See [console.time](https://developer.mozilla.org/en-US/docs/Web/API/Console.time)
       * @static
       */
      time: function time() {
        return _log('time', arguments);
      },
      /**
       * See [console.timeEnd](https://developer.mozilla.org/en-US/docs/Web/API/Console.timeEnd)
       * @static
       */
      timeEnd: function timeEnd() {
        return _log('timeEnd', arguments);
      },
      /**
       * See [console.group](https://developer.mozilla.org/en-US/docs/Web/API/Console.group)
       * @static
       */
      group: function group() {
        return _log('group', arguments);
      },
      /**
       * See [console.groupEnd](https://developer.mozilla.org/en-US/docs/Web/API/Console.groupEnd)
       * @static
       */
      groupEnd: function groupEnd() {
        return _log('groupEnd', arguments);
      },
      /**
       * See [console.assert](https://developer.mozilla.org/en-US/docs/Web/API/Console.assert)
       * @static
       */
      assert: function assert() {
        return _log('assert', arguments);
      },
      /**
       * See [console.log](https://developer.mozilla.org/en-US/docs/Web/API/Console.log)
       * @static
       */
      log: function log() {
        return _log('log', arguments);
      },
      /**
       * See [console.info](https://developer.mozilla.org/en-US/docs/Web/API/Console.info)
       * @static
       */
      info: function info() {
        return _log('info', arguments);
      },
      /**
       * See [console.warn](https://developer.mozilla.org/en-US/docs/Web/API/Console.warn)
       * @static
       */
      warn: function warn() {
        return _log('warn', arguments);
      },
      /**
       * See [console.error](https://developer.mozilla.org/en-US/docs/Web/API/Console.error)
       * @static
       */
      error: function error() {
        return _log('error', arguments);
      }
    }
  );
}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


!(module.exports = {
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
  __isKey: function __isKey(e, key) {
    return (e.which || e.keyCode) == this[key];
  },
  isEnter: function isEnter(e) {
    return this.__isKey(e, 'ENTER');
  },
  isEsc: function isEsc(e) {
    return this.__isKey(e, 'ESC');
  },
  isSpaceBar: function isSpaceBar(e) {
    return this.__isKey(e, 'SPACE');
  }
});

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint max-params: [2, 6] */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(4), __webpack_require__(1), __webpack_require__(8), __webpack_require__(7), __webpack_require__(25)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, StringUtil, BaseView, Keys, Logger, ViewUtil) {

  var LABEL_OPTIONS = ['model', 'id', 'inputId', 'type', 'label', 'sublabel', 'tooltip', 'name'],
      CONTAINER_OPTIONS = ['wide', 'multi', 'input', 'explain', 'customExplain', 'model', 'name', 'type', 'autoRender'],
      WRAPPER_OPTIONS = ['model', 'name', 'label-top', 'readOnly', 'events', 'initialize', 'showWhen', 'bindings', 'render', 'className', 'data-se', 'toggleWhen'],
      INPUT_OPTIONS = ['model', 'name', 'inputId', 'type', // base options
  'input', // custom input
  'placeholder', 'label', // labels
  'readOnly', 'read', 'disabled', 'readModeString', // modes
  'options', // select/radio
  'deps', // used to specify inputs that have dependencies and show a callout to user on select
  'from', 'to', // model transformers,
  'autoRender', // model attributes change event to trigger rerendering of the input
  'inlineValidation', // control inline validating against the model on focus lost
  'validateOnlyIfDirty', // check if field has been interacted with and then validate
  'ariaLabel', // 508 compliance for inputs that do not have label associated with them
  'params'],
      // widgets params - for input specific widgets

  OTHER_OPTIONS = ['errorField'];

  var ALL_OPTIONS = _.uniq(_.union(LABEL_OPTIONS, CONTAINER_OPTIONS, WRAPPER_OPTIONS, INPUT_OPTIONS, OTHER_OPTIONS));

  var SAVE_BUTTON_PHASES = ['•         ', '•  •      ', '•  •  •   ', '•  •  •  •', '   •  •  •', '      •  •', '         •', '          ', '          ', '          '];

  function decorateDoWhen(doWhen) {
    if (doWhen && !doWhen['__edit__']) {
      return _.extend({ '__edit__': _.constant(true) }, doWhen);
    }
  }

  function _createButton(options) {

    options = _.pick(options || {}, 'action', 'id', 'className', 'text', 'type');

    var timeoutId, intervalId, phaseCount;

    return BaseView.extend({
      tagName: 'input',
      className: 'button',
      events: {
        'click': function click() {
          if (options.action && !this.disabled()) {
            options.action.call(this);
          }
        },
        'keyup': function keyup(e) {
          if (Keys.isEnter(e) && options.action && !this.disabled()) {
            options.action.call(this);
          }
        }
      },

      disabled: function disabled() {
        return this.$el.prop('disabled') === true;
      },

      disable: function disable() {
        this.$el.prop('disabled', true);
        this.$el.addClass('btn-disabled');
      },

      enable: function enable() {
        this.$el.prop('disabled', false);
        this.$el.removeClass('btn-disabled');
      },

      initialize: function initialize() {
        var self = this;

        this.$el.attr('type', options.type == 'save' ? 'submit' : 'button');
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
          if (options.type == 'save') {
            timeoutId = setTimeout(_.bind(this.__changeSaveText, this), 1000);
          }
        });
        this.listenTo(this.model, 'form:clear-saving-state', function () {
          this.enable();
          if (options.type == 'save') {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
            this.$el.val(options.text);
          }
        });
      },

      __changeSaveText: function __changeSaveText() {
        phaseCount = 0;
        intervalId = setInterval(_.bind(this.__showLoadingText, this), 200);
      },

      __showLoadingText: function __showLoadingText() {
        this.$el.val(SAVE_BUTTON_PHASES[phaseCount++ % SAVE_BUTTON_PHASES.length]);
      }
    });
  }

  function validateInput(options, model) {
    /* eslint max-statements: 0, complexity: 0 */

    options || (options = {});

    if (options.type == 'label') {
      if (!options.label) {
        Logger.warn('A label input must have a "label" parameter', options);
      }
      return;
    }

    if (options.type == 'button') {
      if (!options.title && !options.icon) {
        Logger.warn('A button input must have a "title" and/or an "icon" parameter', options);
      }
      if (!options.click && !options.href) {
        Logger.warn('A button input must have a "click" and/or an "href" parameter', options);
      }
      return;
    }

    if (!options.name && !options.input) {
      Logger.warn('Missing "name" or "input" parameters', options);
    }

    if (_.isArray(options.name) && _.isArray(options.input)) {
      throw new Error('Not allowed to have both "name" and "input" defined as array.');
    }

    if (options.type != 'list' && options.name && model && model.allows) {
      var names = [];
      if (_.isArray(options.name)) {
        names = options.name;
      } else {
        names.push(options.name);
      }
      _.each(names, function (name) {
        if (!model.allows(name)) {
          throw new Error('field not allowed: ' + options.name);
        }
      });
    }

    if (_.isArray(options.input) && options.type != 'list') {
      _.each(options.input, function (input) {
        validateInput(input, model);
      });
    }

    var keys = _.keys(options),
        intersection = _.intersection(keys, ALL_OPTIONS);

    if (_.size(intersection) != _.size(options)) {
      var fields = _.clone(ALL_OPTIONS);
      fields.unshift(keys);
      Logger.warn('Invalid input parameters', _.without.apply(null, fields), options);
    }
  }

  function generateInputOptions(options, form, createFn) {
    options = _.clone(options);

    if (_.contains(['list', 'group'], options.type)) {
      options.params = _.defaults({
        create: createFn,
        inputs: _.map(_.isArray(options.input) ? options.input : [options.input], function (input) {
          return _.first(generateInputOptions(input, form, createFn));
        })
      }, options.params || {});
      delete options.input;
    }

    var inputs = _.isArray(options.input) ? _.clone(options.input) : [options];

    return _.map(inputs, function (input) {
      var target = _.defaults({ model: form.model }, input, _.omit(options, 'input', 'inputs'), form.options, {
        id: _.uniqueId('input'),
        readOnly: form.isReadOnly(),
        read: form.hasReadMode()
      });
      if (form.isReadOnly()) {
        target.read = target.readOnly = true;
      }
      return target;
    });
  }

  return {

    LABEL_OPTIONS: LABEL_OPTIONS,
    CONTAINER_OPTIONS: CONTAINER_OPTIONS,
    WRAPPER_OPTIONS: WRAPPER_OPTIONS,
    INPUT_OPTIONS: INPUT_OPTIONS,

    generateInputOptions: generateInputOptions,

    changeEventString: function changeEventString(fieldNames) {
      return 'change:' + fieldNames.join(' change:');
    },

    createReadFormButton: function createReadFormButton(options) {

      var action, text, ariaLabel;
      if (options.type == 'cancel') {
        text = ariaLabel = StringUtil.localize('oform.cancel', 'courage');
        action = function action() {
          this.model.trigger('form:cancel');
        };
      } else {
        text = StringUtil.localize('oform.edit', 'courage');
        ariaLabel = text + ' ' + options.formTitle;
        action = function action() {
          this.model.set('__edit__', true);
        };
      }

      return BaseView.extend({
        tagName: 'a',
        attributes: {
          href: '#',
          'aria-label': ariaLabel
        },
        template: function template() {
          return _.escape(text);
        },
        events: {
          click: function click(e) {
            e.preventDefault();
            action.call(this);
          }
        }
      });
    },

    createButton: function createButton(options) {
      options = _.clone(options);
      switch (options.type) {
        case 'save':
          _.defaults(options, { className: 'button-primary' });
          break;
        case 'cancel':
          _.defaults(options, {
            text: StringUtil.localize('oform.cancel', 'courage'),
            action: function action() {
              this.model.trigger('form:cancel');
            }
          });
          break;
        case 'previous':
          _.defaults(options, {
            text: StringUtil.localize('oform.previous', 'courage'),
            action: function action() {
              this.model.trigger('form:previous');
            }
          });
          break;
      }
      return _createButton(options);
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
    applyShowWhen: function applyShowWhen(view, showWhen) {
      var toggleAndResize = function toggleAndResize(bool) {
        return function () {
          // The `toggle` is here since an event may be triggered before the el is in the DOM
          // and in that case slide events may not function as expected.
          view.$el.toggle(bool);
          view.model.trigger('form:resize');
        };
      };

      ViewUtil.applyDoWhen(view, decorateDoWhen(showWhen), function (bool, options) {
        if (!options.animate) {
          view.$el.toggle(bool);
        } else {
          view.$el['slide' + (bool ? 'Down' : 'Up')](200, toggleAndResize(bool));
        }
      });
    },

    applyToggleWhen: function applyToggleWhen(view, toggleWhen) {
      ViewUtil.applyDoWhen(view, decorateDoWhen(toggleWhen), function (bool, options) {
        view.$el.toggle(bool);
        view.model.trigger('form:resize');
        if (options.animate) {
          view.render();
        }
      });
    }
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint-env es6 */
/* eslint max-statements: [2, 17], max-len: [2, 160], max-params: [2, 6] */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(2), __webpack_require__(1), __webpack_require__(68), __webpack_require__(23), __webpack_require__(4)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, $, BaseView, Callout, ButtonFactory, StringUtil) {

  /**
   * @class BaseInput
   * @private
   * An abstract object that defines an input for {@link Okta.Form}
   *
   * BaseInputs are typically not created directly, but being passed to {@link Okta.Form#addInput}
   * @extends Okta.View
   */

  return BaseView.extend({

    tagName: 'span',

    attributes: function attributes() {
      return {
        'data-se': 'o-form-input-' + this.getNameString()
      };
    },

    /**
    * default placeholder text when options.placeholder is not defined
    */
    defaultPlaceholder: '',

    constructor: function constructor(options) {
      /* eslint complexity: [2, 7] */
      options = _.defaults(options || {}, {
        inputId: options.id || _.uniqueId('input'),
        placeholder: this.defaultPlaceholder,
        inlineValidation: true,
        validateOnlyIfDirty: false
      });

      delete options.id;

      // decorate the `enable` and `disable` and toggle the `o-form-disabled` class.
      // so we wont need to worry about this when overriding the methods
      var self = this;
      _.each({ enable: 'removeClass', disable: 'addClass' }, function (method, action) {
        self[action] = _.wrap(self[action], function (fn) {
          fn.apply(self, arguments);
          self.$el[method]('o-form-disabled');
        });
      });

      BaseView.call(this, options);

      if (_.result(options, 'readOnly') !== true && _.result(options, 'read') === true) {
        this.listenTo(this.model, 'change:__edit__', this.render);
      }

      if (_.isFunction(this.focus)) {
        this.focus = _.debounce(_.bind(this.focus, this), 50);
      }

      // Enable inline validation if this is not the first field in the form.
      if (!_.result(options, 'validateOnlyIfDirty')) {
        this.addInlineValidation();
      }

      this.addModelListeners();
      this.$el.addClass('o-form-input-name-' + this.getNameString());
    },

    addAriaLabel: function addAriaLabel() {
      var ariaLabel = this.options.ariaLabel;
      if (ariaLabel) {
        this.$(':input').attr('aria-label', ariaLabel);
      }
    },

    addInlineValidation: function addInlineValidation() {
      if (_.result(this.options, 'inlineValidation')) {
        this.$el.on('focusout', ':input', _.bind(this.validate, this));
      }
    },

    toModelValue: function toModelValue() {
      var value = this.val();
      if (_.isFunction(this.to)) {
        value = this.to.call(this, value);
      }
      if (_.isFunction(this.options.to)) {
        value = this.options.to.call(this, value);
      }
      return value;
    },

    __getDependencyCalloutBtn: function __getDependencyCalloutBtn(btnConfig) {
      var self = this;
      var btnOptions = _.clone(btnConfig);
      // add onfocus listener to re-evaluate depedency when callout button is clicked
      var originalClick = btnOptions.click || function () {};
      btnOptions.click = function () {
        $(window).one('focus.dependency', function () {
          self.__showInputDependencies();
        });
        originalClick.call(self);
      };
      var CalloutBtn = BaseView.extend({
        children: [ButtonFactory.create(btnOptions)]
      });
      return new CalloutBtn();
    },

    getCalloutParent: function getCalloutParent() {
      return this.$('input[value="' + this.getModelValue() + '"]').parent();
    },

    __getCalloutMsgContainer: function __getCalloutMsgContainer(calloutMsg) {
      return BaseView.extend({
        template: '\
        <span class="o-form-explain">\
           {{msg}}\
        </span>\
        ',
        getTemplateData: function getTemplateData() {
          return {
            msg: calloutMsg
          };
        }
      });
    },

    showCallout: function showCallout(calloutConfig, dependencyResolved) {
      var callout = _.clone(calloutConfig);
      callout.className = 'dependency-callout';
      if (callout.btn) {
        callout.content = this.__getDependencyCalloutBtn(callout.btn);
        delete callout.btn;
      }
      var dependencyCallout = Callout.create(callout);
      if (!dependencyResolved) {
        dependencyCallout.add(this.__getCalloutMsgContainer(StringUtil.localize('dependency.callout.msg', 'courage')));
      }
      var calloutParent = this.getCalloutParent();
      calloutParent.append(dependencyCallout.render().el);
      if (callout.type == 'success') {
        _.delay(function () {
          // fade out success callout
          dependencyCallout.$el.fadeOut(800);
        }, 1000);
      }
    },

    removeCallout: function removeCallout() {
      this.$el.find('.dependency-callout').remove();
    },

    __evaluateCalloutObject: function __evaluateCalloutObject(dependencyResolved, calloutTitle) {
      var defaultCallout;
      if (dependencyResolved) {
        defaultCallout = {
          title: StringUtil.localize('dependency.action.completed', 'courage'),
          size: 'large',
          type: 'success'
        };
      } else {
        defaultCallout = {
          title: StringUtil.localize('dependency.action.required', 'courage', [calloutTitle]),
          size: 'large',
          type: 'warning'
        };
      }
      return defaultCallout;
    },

    __handleDependency: function __handleDependency(result, callout) {
      var self = this;
      var calloutConfig = _.isFunction(callout) ? callout(result) : _.extend({}, callout, self.__evaluateCalloutObject(result.resolved, callout.title));
      // remove existing callouts if any
      self.removeCallout();
      self.showCallout(calloutConfig, result.resolved);
    },

    __showInputDependencies: function __showInputDependencies() {
      var self = this;
      var fieldDependency = self.options.deps[self.getModelValue()];
      if (fieldDependency && _.isFunction(fieldDependency.func)) {
        fieldDependency.func().done(function (data) {
          self.__handleDependency({ resolved: true, data: data }, fieldDependency.callout);
        }).fail(function (data) {
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
    update: function update() {
      if (!this._isEdited && _.result(this.options, 'validateOnlyIfDirty')) {
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
    isEditMode: function isEditMode() {
      var ret = !_.result(this.options, 'readOnly') && (_.result(this.options, 'read') !== true || this.model.get('__edit__') === true);
      return ret;
    },

    /**
     * Renders the input
     * @readonly
     */
    render: function render() {
      this.preRender();
      var params = this.options.params;
      this.options.params = _.resultCtx(this.options, 'params', this);

      if (this.isEditMode()) {
        this.editMode();
        if (_.resultCtx(this.options, 'disabled', this)) {
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
    validate: function validate() {
      if (!this.model.get('__pending__') && this.isEditMode() && _.isFunction(this.model.validateField)) {
        var validationError = this.model.validateField(this.options.name);
        if (validationError) {
          _.delay(function () {
            this.model.trigger('form:clear-error:' + this.options.name);
            this.model.trigger('invalid', this.model, validationError, false);
          }.bind(this), 100);
        }
      }
    },

    /**
    * Add model event listeners
    */
    addModelListeners: function addModelListeners() {
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
    val: function val() {
      throw new Error('val() is an abstract method');
    },

    /**
    * Set focus on the input
    */
    focus: function focus() {
      throw new Error('focus() is an abstract method');
    },

    /**
    * Default value in read mode
    * When model has no value for the field
    */
    defaultValue: function defaultValue() {
      return '';
    },

    /**
    * Renders the input in edit mode
    */
    editMode: function editMode() {
      var options = _.extend({}, this.options, {
        value: this.getModelValue()
      });
      this.$el.html(this.template(options));
      this.options.multi && this.$el.removeClass('margin-r');
      return this;
    },

    /**
    * Renders the readable value of the input in read mode
    */
    readMode: function readMode() {
      this.$el.text(this.getReadModeString());
      this.$el.removeClass('error-field');
      this.options.multi && this.$el.addClass('margin-r');
      return this;
    },

    getReadModeString: function getReadModeString() {
      var readModeStr = _.resultCtx(this.options, 'readModeString', this);
      if (readModeStr) {
        return readModeStr;
      }
      return this.toStringValue();
    },

    /**
     * The model value off the field associated with the input
     * @return {Mixed}
     */
    getModelValue: function getModelValue() {
      var value = this.model.get(this.options.name);

      if (_.isFunction(this.from)) {
        value = this.from.call(this, value);
      }
      if (_.isFunction(this.options.from)) {
        value = this.options.from.call(this, value);
      }
      return value;
    },

    /*
    * convenience method to get the textual value from the model
    * will return the textual label rather than value in case of select/radio
    * @return {String}
    */
    toStringValue: function toStringValue() {
      var value = this.getModelValue();
      if (this.options.options) {
        // dropdown or radio
        value = this.options.options[value];
      }
      return value || this.defaultValue();
    },

    /**
     * Triggers a form:resize event in order to tell dialogs content size has changed
     */
    resize: function resize() {
      this.model.trigger('form:resize');
    },

    /**
     * Disable the input
     */
    disable: function disable() {
      this.$(':input').prop('disabled', true);
    },

    /**
     * Enable the input
     */
    enable: function enable() {
      this.$(':input').prop('disabled', false);
    },

    /**
     * Change the type of the input field. (e.g., text <--> password)
     * @param type
     */
    changeType: function changeType(type) {
      this.$(':input').prop('type', type);
      // Update the options so that it keeps the uptodate state
      this.options.type = type;
    },

    getNameString: function getNameString() {
      if (_.isArray(this.options.name)) {
        return this.options.name.join('-');
      }
      return this.options.name;
    },

    /**
     * Get parameters, computing _.result
     * @param  {[type]} options alternative options
     * @return {Object} the params
     */
    getParams: function getParams(options) {
      var opts = options || this.options || {};
      return _.clone(_.resultCtx(opts, 'params', this) || {});
    },

    /**
     * get a parameter from options.params, compute _.result when needed.
     * @param  {String} key
     * @param  {Object} defaultValue
     * @return {Object} the params
     */
    getParam: function getParam(key, defaultValue) {
      var result = _.resultCtx(this.getParams(), key, this);
      return !_.isUndefined(result) ? result : defaultValue;
    },

    /**
     * Get a parameter from options.params or if empty, object attribute.
     *
     * @param  {String} key
     * @return {Object} the param or attribute
     */
    getParamOrAttribute: function getParamOrAttribute(key) {
      return this.getParam(key) || _.result(this, key);
    },

    __markError: function __markError() {
      this.$el.addClass('o-form-has-errors');
    },

    __clearError: function __clearError() {
      this.$el.removeClass('o-form-has-errors');
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(40)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, Model) {
  /**
   * Wrapper around the more generic {@link src/framework/Model} that
   * contains Okta-specific logic.
   * @class module:Okta.Model
   * @extends src/framework/Model
   */
  return Model.extend( /** @lends module:Okta.Model.prototype */{

    /**
     * Is the end point using the legacy "secureJSON" format
     * @type {Function|Boolean}
     */
    secureJSON: false,

    _builtInLocalProps: {
      '__edit__': 'boolean',
      '__pending__': 'boolean'
    },

    constructor: function constructor() {
      this.local = _.defaults({}, _.result(this, 'local'), this._builtInLocalProps);

      if (_.result(this, 'secureJSON')) {
        this.sync = _.wrap(this.sync, function (sync, method, model, options) {
          return sync.call(this, method, model, _.extend({ dataType: 'secureJSON' }, options));
        });
      }

      Model.apply(this, arguments);
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(4)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, StringUtil) {

  var loc = StringUtil.localize;

  var SchemaUtils = {
    STRING: 'string',
    NUMBER: 'number',
    INTEGER: 'integer',
    BOOLEAN: 'boolean',
    OBJECT: 'object',
    FORMATDISPLAYTYPE: {
      'date-time': 'date',
      'uri': 'uri',
      'email': 'email',
      'country-code': 'country-code',
      'language-code': 'language-code',
      'locale': 'locale',
      'timezone': 'timezone',
      'ref-id': 'reference'
    },
    ARRAYDISPLAYTYPE: {
      'arrayofobject': 'arrayofobject',
      'arrayofstring': 'arrayofstring',
      'arrayofnumber': 'arrayofnumber',
      'arrayofinteger': 'arrayofinteger',
      'arrayofref-id': 'arrayofref-id'
    },
    DISPLAYTYPES: {
      'date': { 'type': 'string', 'format': 'date-time' },
      'uri': { 'type': 'string', 'format': 'uri' },
      'email': { 'type': 'string', 'format': 'email' },
      'country-code': { 'type': 'string', 'format': 'country-code' },
      'language-code': { 'type': 'string', 'format': 'language-code' },
      'locale': { 'type': 'string', 'format': 'locale' },
      'timezone': { 'type': 'string', 'format': 'timezone' },
      'string': { 'type': 'string' },
      'number': { 'type': 'number' },
      'boolean': { 'type': 'boolean' },
      'integer': { 'type': 'integer' },
      'reference': { 'type': 'string', 'format': 'ref-id' },
      'arrayofobject': { 'type': 'array', 'items': { 'type': 'object' } },
      'arrayofstring': { 'type': 'array', 'items': { 'type': 'string' } },
      'arrayofnumber': { 'type': 'array', 'items': { 'type': 'number' } },
      'arrayofinteger': { 'type': 'array', 'items': { 'type': 'integer' } },
      'arrayofref-id': { 'type': 'array', 'items': { 'type': 'string', 'format': 'ref-id' } },
      'image': { 'type': 'image' },
      'password': { 'type': 'string' }
    },
    SUPPORTSMINMAX: ['string', 'number', 'integer', 'password'],
    SUPPORTENUM: ['string', 'number', 'integer', 'object', 'arrayofstring', 'arrayofnumber', 'arrayofinteger', 'arrayofobject'],
    DATATYPE: {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'integer': 'integer',
      'date': 'datetime',
      'object': 'object',
      'arrayofobject': 'object array',
      'arrayofstring': 'string array',
      'arrayofnumber': 'number array',
      'arrayofinteger': 'integer array',
      'arrayofref-id': 'reference array',
      'country-code': 'country code',
      'language-code': 'language code',
      'reference': 'reference',
      'timezone': 'timezone',
      'image': 'image'
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
      'DISABLE': loc('universal-directory.profiles.attribute.form.union.enable.display', 'courage'),
      'ENABLE': loc('universal-directory.profiles.attribute.form.union.disable.display', 'courage')
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

    /*
     * Get a display string for a schema attribute type.
     * @param {String} type Type of an attribute
     * @param {String} format Format of an attribute
     * @param {String} itemType Item type of an attribute if an array
     * @param {String} defaultValue The default value if an attribute type is undefined
     * @return {String} the display value
     */
    getDisplayType: function getDisplayType(type, format, itemType, defaultValue) {
      var displayType;
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
        displayType = typeof defaultValue == 'undefined' ? '' : defaultValue;
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
    getSourceUsernameType: function getSourceUsernameType(mappingDirection, targetName, appName) {
      /* eslint complexity: [2, 7] */
      var sourceUsernameType = this.USERNAMETYPE.NONE;
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

    isArrayDataType: function isArrayDataType(type) {
      return _.contains(_.values(this.ARRAYDISPLAYTYPE), type);
    },

    isObjectDataType: function isObjectDataType(type) {
      return this.DATATYPE.object === type;
    }
  };

  return SchemaUtils;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(11)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, Model) {

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

  var hasProps = function hasProps(model) {
    var local = _.omit(model.local, _.keys(model._builtInLocalProps));
    return _.size(model.props) + _.size(local) > 0;
  };

  var BaseModel = Model.extend( /** @lends module:Okta.BaseModel.prototype */{
    /**
     * @type {Boolean}
     */
    flat: false,

    constructor: function constructor() {
      Model.apply(this, arguments);
      this.on('sync', this._setSynced);
    },

    allows: function allows() {
      if (hasProps(this)) {
        return Model.prototype.allows.apply(this, arguments);
      } else {
        return true;
      }
    },

    // bw compatibility support for old computed properties
    set: function set(key, val) {
      var attrs;
      if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
        attrs = key;
      } else {
        (attrs = {})[key] = val;
      }

      // computed properties
      _(attrs).each(function (fn, attr) {
        if (!fn || !_.isArray(fn.__attributes)) {
          return;
        }
        this.on('change:' + fn.__attributes.join(' change:'), function () {
          var val = this.get(attr);
          if (val !== this['__schema__'].computedProperties[attr]) {
            this['__schema__'].computedProperties[attr] = val;
            this.trigger('change:' + attr, val);
          }
        }, this);
      }, this);

      return Model.prototype.set.apply(this, arguments);
    },

    /**
     * Get the current value of an attribute from the model. For example: `note.get("title")`
     *
     * See [Model.get](http://backbonejs.org/#Model-get)
     * @param {String} attribute
     * @return {Mixed} The value of the model attribute
     */
    get: function get() {
      var value = Model.prototype.get.apply(this, arguments);
      if (_.isFunction(value)) {
        return value.apply(this, _.map(value.__attributes || [], this.get, this));
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
    toJSON: function toJSON(options) {
      options || (options = {});
      var res = Model.prototype.toJSON.apply(this, arguments);

      // cleanup computed properties
      _(res).each(function (value, key) {
        if (typeof value == 'function') {
          if (options.verbose) {
            res[key] = this.get(key);
          } else {
            delete res[key];
          }
        }
      }, this);

      // cleanup private properties
      if (!options.verbose) {
        _(res).each(function (value, key) {
          if (/^__\w+__$/.test(key)) {
            delete res[key];
          }
        });
      }

      return res;
    },

    sanitizeAttributes: function sanitizeAttributes(attributes) {
      var attrs = {};
      _.each(attributes, function (value, key) {
        if (!_.isFunction(value)) {
          attrs[key] = value;
        }
      });
      return attrs;
    },

    reset: function reset(options) {
      this.clear(options);
      this.set(this.sanitizeAttributes(this.defaults), options);
    },

    clear: function clear(options) {
      var attrs = {};
      _.each(this.sanitizeAttributes(this.attributes), function (value, key) {
        attrs[key] = void 0;
      });
      return this.set(attrs, _.extend({}, options, { unset: true }));
    },

    /**
     * @private
     */
    _setSynced: function _setSynced(newModel) {
      this._syncedData = newModel && _.isFunction(newModel.toJSON) ? newModel.toJSON() : {};
    },

    /**
     * @private
     */
    _getSynced: function _getSynced() {
      return this._syncedData;
    },

    isSynced: function isSynced() {
      return _.isEqual(this._getSynced(), this.toJSON());
    }
  }, /** @lends module:Okta.BaseModel.prototype */{
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
    ComputedProperty: function ComputedProperty() {
      var args = _.toArray(arguments);
      var fn = args.pop();
      fn.__attributes = args.pop();
      return fn;
    }
  });

  return BaseModel;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(42)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, Collection) {
  /**
   * Wrapper around the more generic {@link src/framework/Collection} that
   * contains Okta-specific logic.
   * @class module:Okta.Collection
   * @extends src/framework/Collection
   */
  return Collection.extend( /** @lends module:Okta.Collection.prototype */{

    /**
     * Is the end point using the legacy "secureJSON" format
     * @type {Function|Boolean}
     */
    secureJSON: false,

    constructor: function constructor() {
      if (_.result(this, 'secureJSON')) {
        this.sync = _.wrap(this.sync, function (sync, method, collection, options) {
          return sync.call(this, method, collection, _.extend({ dataType: 'secureJSON' }, options));
        });
      }
      Collection.apply(this, arguments);
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(1)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, BaseView) {

  return {
    redirect: function redirect(url) {
      window.location = url;
    },

    reloadPage: function reloadPage() {
      window.location.reload();
    },

    constantError: function constantError(errorMessage) {
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
    getUrlQueryString: function getUrlQueryString(queries) {
      _.isObject(queries) || (queries = {});
      var queriesString = _.without(_.map(queries, function (value, key) {
        if (value !== undefined && value !== null) {
          return key + '=' + encodeURIComponent(value);
        }
      }), undefined).join('&');
      return _.isEmpty(queriesString) ? '' : '?' + queriesString;
    },

    isABaseView: function isABaseView(obj) {
      return obj instanceof BaseView || obj.prototype instanceof BaseView || obj === BaseView;
    }
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("underscore");

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("handlebars");

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint @okta/okta/enforce-requirejs-names: 0, @okta/okta/no-specific-modules: 0, max-params: 0, max-statements: 0 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(17), __webpack_require__(0), __webpack_require__(2), __webpack_require__(4), __webpack_require__(39), __webpack_require__(20)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (Handlebars, _, $, StringUtil, markdownToHtml, moment) {

  var CACHE_BUST_URL_PREFIX = '/assets';

  function formatDate(format, dateInISOString) {
    return moment.utc(dateInISOString).utcOffset('-07:00').format(format);
  }

  function trim(str) {
    return str && str.replace(/^\s+|\s+$/g, '');
  }

  function prependCachebustPrefix(path) {
    if (path.indexOf(CACHE_BUST_URL_PREFIX) === 0) {
      return path;
    }
    return CACHE_BUST_URL_PREFIX + path;
  }

  Handlebars.registerHelper('i18n', function (options) {
    var params,
        key = trim(options.hash.code),
        bundle = trim(options.hash.bundle),
        args = trim(options.hash['arguments']);

    if (args) {
      params = _.map(trim(args).split(';'), function (param) {
        param = trim(param);
        var val,
            data = this;
        /*
         * the context(data) may be a deep object, ex {user: {name: 'John', gender: 'M'}}
         * arguments may be 'user.name'
         * return data['user']['name']
         */
        _.each(param.split('.'), function (p) {
          val = val ? val[p] : data[p];
        });
        return val;
      }, this);
    }

    return StringUtil.localize(key, bundle, params);
  });

  Handlebars.registerHelper('xsrfTokenInput', function () {
    return new Handlebars.SafeString('<input type="hidden" class="hide" name="_xsrfToken" ' + 'value="' + $('#_xsrfToken').text() + '">');
  });

  Handlebars.registerHelper('img', function (options) {
    /*global okta */
    var cdn = typeof okta != 'undefined' && okta.cdnUrlHostname || '';
    var hash = _.pick(options.hash, ['src', 'alt', 'width', 'height', 'class', 'title']);
    hash.src = '' + cdn + prependCachebustPrefix(hash.src);
    var attrs = _.map(hash, function (value, attr) {
      return attr + '="' + Handlebars.Utils.escapeExpression(value) + '"';
    });
    return new Handlebars.SafeString('<img ' + attrs.join(' ') + '/>');
  });

  Handlebars.registerHelper('shortDate', _.partial(formatDate, 'MMM Do'));
  Handlebars.registerHelper('mediumDate', _.partial(formatDate, 'MMMM DD, YYYY'));
  Handlebars.registerHelper('longDate', _.partial(formatDate, 'MMMM DD, YYYY, h:mma'));
  Handlebars.registerHelper('formatDate', formatDate);

  Handlebars.registerHelper('markdown', function (mdText) {
    return markdownToHtml(Handlebars, mdText);
  });

  return Handlebars;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;

// TODO: maybe replaced by
// https://github.com/Calvein/empty-module
// https://github.com/crimx/empty-module-loader
!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("moment");

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint max-statements: [2, 15], complexity: [2, 8], max-params: [2, 8] */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(2), __webpack_require__(14), __webpack_require__(13), __webpack_require__(7), __webpack_require__(12), __webpack_require__(4), __webpack_require__(22)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, $, BaseCollection, BaseModel, Logger, SchemaUtil, StringUtil, EnumTypeHelper) {

  var loc = StringUtil.localize;

  var STRING = SchemaUtil.STRING,
      NUMBER = SchemaUtil.NUMBER,
      INTEGER = SchemaUtil.INTEGER,
      OBJECT = SchemaUtil.OBJECT;

  var getArrayTypeName = function getArrayTypeName(type, elementType) {
    return type + 'of' + elementType;
  };

  var SubSchema = BaseModel.extend({
    defaults: {
      description: undefined,
      minLength: undefined,
      maxLength: undefined,
      format: undefined
    },
    parse: function parse(resp) {
      if (_.isString(resp.format)) {
        var matcher = /^\/(.+)\/$/.exec(resp.format);
        if (matcher) {
          resp.format = matcher[1];
        }
      }
      return resp;
    }
  });

  var SubSchemaCollection = BaseCollection.extend({
    model: SubSchema
  });

  var SubSchemaAllOfCollection = SubSchemaCollection.extend({
    _type: 'allOf'
  });

  var SubSchemaOneOfCollection = SubSchemaCollection.extend({
    _type: 'oneOf'
  });

  var SubSchemaNoneOfCollection = SubSchemaCollection.extend({
    _type: 'noneOf'
  });

  var constraintTypeErrorMessages = {
    string: loc('schema.validation.field.value.must.string', 'courage'),
    number: loc('schema.validation.field.value.must.number', 'courage'),
    integer: loc('schema.validation.field.value.must.integer', 'courage'),
    object: loc('schema.validation.field.value.must.object', 'courage')
  };

  var loginFormatNonePattern = '.+';

  var escapedLoginCharsRe = /[^a-zA-Z0-9-]/;

  var SchemaProperty = BaseModel.extend({

    constraintHandlers: {
      between: '_checkBetweenConstraints',
      greaterThan: '_checkGreaterThanConstraint',
      lessThan: '_checkLessThanConstraint',
      equals: '_checkEqualsConstraint'
    },

    idAttribute: 'name',

    local: {
      '__oneOf__': {
        type: 'array',
        minItems: 1
      }
    },

    defaults: {
      // OKTA-28445, set empty string by default as the key for each property when sycn with server
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
      settings: { permissions: { SELF: SchemaUtil.PERMISSION.READ_ONLY } },
      '__isSensitive__': BaseModel.ComputedProperty(['settings'], function (settings) {
        return !!(settings && settings.sensitive);
      }),
      '__userPermission__': SchemaUtil.PERMISSION.READ_ONLY,
      '__displayType__': undefined,
      '__displayTypeLabel__': BaseModel.ComputedProperty(['__displayType__'], function (displayType) {
        return SchemaUtil.DATATYPE[displayType] || displayType;
      }),
      '__supportsMinMax__': false,
      // use the private naming convention for these computed properties,
      // to deal with the complexity in cloning schema with properties (toJSON({verbose: true})),
      // to make sure these attributes are being excluded from api request
      '__isReadOnly__': BaseModel.ComputedProperty(['mutability'], function (mutability) {
        return mutability === SchemaUtil.MUTABILITY.READONLY;
      }),
      '__isWriteOnly__': BaseModel.ComputedProperty(['mutability'], function (mutability) {
        return mutability === SchemaUtil.MUTABILITY.WRITEONLY;
      }),
      '__displayScope__': undefined,
      '__isScopeSelf__': BaseModel.ComputedProperty(['scope'], function (scope) {
        return scope === SchemaUtil.SCOPE.SELF;
      }),
      '__isNoneScopeArrayType__': BaseModel.ComputedProperty(['__isScopeSelf__', '__displayType__'], function (isScopeSelf, displayType) {
        return !isScopeSelf && SchemaUtil.isArrayDataType(displayType);
      }),
      '__isImported__': BaseModel.ComputedProperty(['externalName'], function (externalName) {
        return !!externalName;
      }),
      '__isFromBaseSchema__': BaseModel.ComputedProperty(['__schemaMeta__'], function (schemaMeta) {
        return schemaMeta && schemaMeta.name === 'base';
      }),
      // Only UI can turn on __enumDefined__ and reprocess the enum/oneOf value; otherwise,
      // it should leave existing value untouch
      '__enumDefined__': false,
      '__supportEnum__': BaseModel.ComputedProperty(['__displayType__'], function (displayType) {
        return _.contains(SchemaUtil.SUPPORTENUM, displayType);
      }),
      '__isNumberTypeEnum__': BaseModel.ComputedProperty(['__displayType__'], function (displayType) {
        return _.contains([SchemaUtil.NUMBER, SchemaUtil.ARRAYDISPLAYTYPE.arrayofnumber], displayType);
      }),
      '__isIntegerTypeEnum__': BaseModel.ComputedProperty(['__displayType__'], function (displayType) {
        return _.contains([SchemaUtil.INTEGER, SchemaUtil.ARRAYDISPLAYTYPE.arrayofinteger], displayType);
      }),
      '__isObjectTypeEnum__': BaseModel.ComputedProperty(['__displayType__'], function (displayType) {
        return _.contains([SchemaUtil.OBJECT, SchemaUtil.ARRAYDISPLAYTYPE.arrayofobject], displayType);
      }),
      '__isStringTypeEnum__': BaseModel.ComputedProperty(['__displayType__'], function (displayType) {
        return _.contains([SchemaUtil.STRING, SchemaUtil.ARRAYDISPLAYTYPE.arrayofstring], displayType);
      }),
      '__enumConstraintType__': BaseModel.ComputedProperty(['__isStringTypeEnum__', '__isNumberTypeEnum__', '__isIntegerTypeEnum__', '__isObjectTypeEnum__'], function (isStringType, isNumberType, isIntegerType, isObjectType) {
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
      }),
      '__isEnumDefinedAndSupported__': BaseModel.ComputedProperty(['__enumDefined__', '__supportEnum__'], function (enumDefined, supportEnum) {
        return enumDefined && supportEnum;
      }),
      '__isLoginOfBaseSchema__': BaseModel.ComputedProperty(['__isFromBaseSchema__', 'name'], function (isFromBaseSchema, name) {
        return isFromBaseSchema && name === 'login';
      })
    },

    initialize: function initialize() {
      BaseModel.prototype.initialize.apply(this, arguments);
      this.listenTo(this, 'change:__displayType__', this._updateTypeFormatConstraints);
      this.listenTo(this, 'change:type change:format change:items', this._updateDisplayType);
      this.listenTo(this, 'change:__minVal__ change:__maxVal__', this._updateMinMax);
      this.listenTo(this, 'change:__equals__', this._convertEqualsToMinMax);
      this.listenTo(this, 'change:__constraint__', this._setConstraintText);
      this._setConstraintText();
      this._setLoginPattern();
    },

    parse: function parse(resp) {
      /* eslint complexity: [2, 9] */
      resp = _.clone(resp);

      if (resp.type === 'object' && resp.extendedType === 'image') {
        resp.type = 'image';
      }
      resp['__displayType__'] = SchemaUtil.getDisplayType(resp.type, resp.format, resp.items ? resp.items.format ? resp.items.format : resp.items.type : undefined);
      this._setRangeConstraints(resp);
      resp['__supportsMinMax__'] = SchemaUtil.SUPPORTSMINMAX.indexOf(resp['__displayType__']) != -1;
      resp['__displayScope__'] = SchemaUtil.DISPLAYSCOPE[resp.scope] || SchemaUtil.DISPLAYSCOPE.NA;
      if (resp.settings && resp.settings.permissions && resp.settings.permissions.SELF) {
        resp['__userPermission__'] = resp.settings.permissions.SELF;
      }
      this._setMasterOverride(resp);
      this._setSubSchemas(resp);
      return resp;
    },

    validate: function validate() {
      var enumValidationError = this._validateEnumOneOf();

      if (enumValidationError) {
        return enumValidationError;
      }

      if (!this.get('__supportsMinMax__') || !this.get('__constraint__')) {
        return undefined;
      }

      var constraitType = this.get('__constraint__'),
          constraitHandler = this[this.constraintHandlers[constraitType]];

      if (_.isFunction(constraitHandler)) {
        return constraitHandler.call(this);
      } else {
        Logger.warn('No constraint handler found for: ' + constraitType);
        return undefined;
      }
    },

    _checkBetweenConstraints: function _checkBetweenConstraints() {
      var minVal = this.get('__minVal__'),
          maxVal = this.get('__maxVal__');

      if (!minVal && !maxVal) {
        return;
      }
      if (!minVal) {
        return { '__minVal__': 'Min value is required' };
      }
      if (!maxVal) {
        return { '__maxVal__': 'Max value is required' };
      }
      var val = this._checkIntegerConstraints('__minVal__', 'Min value');
      if (val) {
        return val;
      }
      val = this._checkIntegerConstraints('__maxVal__', 'Max value');
      if (val) {
        return val;
      }
      if (+minVal >= +maxVal) {
        return { '__maxVal__': 'Max val must be greater than min val' };
      }
    },

    _checkGreaterThanConstraint: function _checkGreaterThanConstraint() {
      var minVal = this.get('__minVal__');
      if (!minVal) {
        return;
      }
      var val = this._checkIntegerConstraints('__minVal__', 'Min value');
      if (val) {
        return val;
      }
    },

    _checkLessThanConstraint: function _checkLessThanConstraint() {
      var maxVal = this.get('__maxVal__');
      if (!maxVal) {
        return;
      }
      var val = this._checkIntegerConstraints('__maxVal__', 'Max value');
      if (val) {
        return val;
      }
    },

    _checkEqualsConstraint: function _checkEqualsConstraint() {
      var equals = this.get('__equals__');
      if (!equals) {
        return;
      }
      var val = this._checkIntegerConstraints('__equals__', 'Constraint');
      if (val) {
        return val;
      }
    },

    _checkIntegerConstraints: function _checkIntegerConstraints(field, name) {
      var val = this.get(field);

      var error = {};
      if (isNaN(val)) {
        error[field] = name + ' must be a number';
        return error;
      }
      if (+val < 0) {
        error[field] = name + ' must be greater than 0';
        return error;
      }
    },

    _setMasterOverride: function _setMasterOverride(resp) {
      if (resp.settings && resp.settings.masterOverride && resp.settings.masterOverride) {
        var masterOverrideValue = resp.settings.masterOverride.value;
        if (_.isArray(masterOverrideValue) && !_.isEmpty(masterOverrideValue)) {
          resp['__masterOverrideType__'] = 'OVERRIDE';
          resp['__masterOverrideValue__'] = masterOverrideValue || [];
        } else {
          resp['__masterOverrideType__'] = resp.settings.masterOverride.type;
        }
      } else {
        resp['__masterOverrideType__'] = 'INHERIT';
      }
    },

    _setRangeConstraints: function _setRangeConstraints(resp) {
      /* eslint complexity: [2, 11] */
      if (resp['__displayType__'] == STRING) {
        resp['__minVal__'] = resp.minLength;
        resp['__maxVal__'] = resp.maxLength;
      } else if (resp['__displayType__'] == INTEGER || resp['__displayType__'] == NUMBER) {
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

    _setSubSchemas: function _setSubSchemas(resp) {
      if (resp.allOf) {
        resp['subSchemas'] = new SubSchemaAllOfCollection(resp.allOf, { parse: true });
      } else if (resp.oneOf) {
        resp['subSchemas'] = new SubSchemaOneOfCollection(resp.oneOf, { parse: true });
      } else if (resp.noneOf) {
        resp['subSchemas'] = new SubSchemaNoneOfCollection(resp.noneOf, { parse: true });
      }
    },

    _setLoginPattern: function _setLoginPattern() {
      if (!this.get('__isLoginOfBaseSchema__')) {
        return;
      }

      var pattern = this.get('pattern');
      if (pattern === loginFormatNonePattern) {
        this.set('__loginFormatRestriction__', SchemaUtil.LOGINPATTERNFORMAT.NONE);
      } else if (pattern) {
        this.set('__loginFormatRestriction__', SchemaUtil.LOGINPATTERNFORMAT.CUSTOM);
        this.set('__loginFormatRestrictionCustom__', this._extractLoginPattern(pattern));
      } else {
        this.set('__loginFormatRestriction__', SchemaUtil.LOGINPATTERNFORMAT.EMAIL);
      }
    },

    _updateDisplayType: function _updateDisplayType() {
      var type = this.get('type');
      if (type === STRING && this.get('format')) {
        this.set('__displayType__', SchemaUtil.FORMATDISPLAYTYPE[this.get('format')]);
      } else {
        var items = this.get('items');
        var arraytype = items && (items.format ? items.format : items.type);
        if (type && arraytype) {
          this.set('__displayType__', SchemaUtil.ARRAYDISPLAYTYPE[getArrayTypeName(type, arraytype)]);
        } else {
          this.set('__displayType__', type);
        }
      }
    },

    _validateEnumOneOf: function _validateEnumOneOf() {
      if (!this.get('__isEnumDefinedAndSupported__')) {
        return;
      }

      var enumOneOf = this.get('__oneOf__') || [];

      if (_.isEmpty(enumOneOf)) {
        return { '__oneOf__': loc('model.validation.field.blank', 'courage') };
      }

      if (!this._isValidateOneOfConstraint(enumOneOf)) {
        var constraintType = this.get('__enumConstraintType__'),
            errorTypeMsg = constraintTypeErrorMessages[constraintType];

        return { '__oneOf__': errorTypeMsg };
      }
    },

    _isValidateOneOfConstraint: function _isValidateOneOfConstraint(values) {
      var constraintType = this.get('__enumConstraintType__');

      return _.all(values, function (value) {
        return EnumTypeHelper.isConstraintValueMatchType(value.const, constraintType);
      });
    },

    toJSON: function toJSON() {
      var json = BaseModel.prototype.toJSON.apply(this, arguments);

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
      return json;
    },

    _attributeOverrideToJson: function _attributeOverrideToJson(json) {
      var masterOverrideType = this.get('__masterOverrideType__'),
          masterOverrideValue = this.get('__masterOverrideValue__');
      if (masterOverrideType === 'OKTA_MASTERED') {
        json.settings.masterOverride = { type: 'OKTA_MASTERED' };
      } else if (masterOverrideType === 'OVERRIDE') {
        json.settings.masterOverride = { type: 'ORDERED_LIST', value: [] };
        if (masterOverrideValue instanceof BaseCollection) {
          _.each(masterOverrideValue.toJSON(), function (overrideProfile) {
            json.settings.masterOverride.value.push(overrideProfile.id);
          });
        } else if (masterOverrideValue instanceof Array) {
          json.settings.masterOverride.value = masterOverrideValue;
        }
        if (_.isEmpty(json.settings.masterOverride.value)) {
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
    _normalizeUnionValue: function _normalizeUnionValue(json) {

      if (!this.get('__isNoneScopeArrayType__')) {
        json['union'] = undefined;
      }

      return json;
    },

    _enumAssignment: function _enumAssignment(json) {
      if (!this.get('__isEnumDefinedAndSupported__')) {
        return json;
      }

      // backfill empty title by constraint
      var enumOneOf = this._getEnumOneOfWithTitleCheck();

      if (this.get('type') === 'array') {
        delete json.items.enum;
        json.items.oneOf = enumOneOf;
      } else {
        delete json.enum;
        json.oneOf = enumOneOf;
      }

      return json;
    },

    _patternAssignment: function _patternAssignment(json) {
      if (!this.get('__isLoginOfBaseSchema__') || !this.get('__loginFormatRestriction__')) {
        return json;
      }

      switch (this.get('__loginFormatRestriction__')) {
        case SchemaUtil.LOGINPATTERNFORMAT.EMAIL:
          delete json.pattern;
          break;
        case SchemaUtil.LOGINPATTERNFORMAT.CUSTOM:
          json.pattern = this._buildLoginPattern(this.get('__loginFormatRestrictionCustom__'));
          break;
        case SchemaUtil.LOGINPATTERNFORMAT.NONE:
          json.pattern = loginFormatNonePattern;
          break;
      }

      return json;
    },

    /**
     * Character should be escaped except letters, digits and hyphen
     */
    _escapedRegexChar: function _escapedRegexChar(pattern, index) {
      var char = pattern.charAt(index);

      if (escapedLoginCharsRe.test(char)) {
        return '\\' + char;
      }

      return char;
    },

    _buildLoginPattern: function _buildLoginPattern(pattern) {
      var result = '';

      for (var i = 0; i < pattern.length; i++) {
        result = result + this._escapedRegexChar(pattern, i);
      }

      return '[' + result + ']+';
    },

    _extractLoginPattern: function _extractLoginPattern(pattern) {
      var re = /^\[(.*)\]\+/,
          matches = pattern.match(re);
      return matches ? matches[1].replace(/\\(.)/g, '$1') : pattern;
    },

    _getEnumOneOfWithTitleCheck: function _getEnumOneOfWithTitleCheck() {
      var enumOneOf = this.get('__oneOf__');

      return _.map(enumOneOf, function (value) {
        if ($.trim(value.title) !== '') {
          return value;
        }

        value.title = !_.isString(value.const) ? JSON.stringify(value.const) : value.const;

        return value;
      });
    },

    _updateTypeFormatConstraints: function _updateTypeFormatConstraints() {
      var displayType = this.get('__displayType__');
      // OKTA-31952 reset format according to its displayType
      this.unset('format', { silent: true });
      this.unset('items', { silent: true });
      this.set(SchemaUtil.DISPLAYTYPES[displayType]);
      if (displayType != NUMBER && displayType != INTEGER) {
        this.unset('minimum');
        this.unset('maximum');
      }
      if (displayType != STRING) {
        this.unset('minLength');
        this.unset('maxLength');
      }

      this.unset('__minVal__');
      this.unset('__maxVal__');
      this.unset('__equals__');
      this.set('__supportsMinMax__', SchemaUtil.SUPPORTSMINMAX.indexOf(this.get('__displayType__')) != -1);
    },

    _updateMinMax: function _updateMinMax() {
      var min,
          max,
          displayType = this.get('__displayType__');

      if (displayType === STRING) {
        min = 'minLength';
        max = 'maxLength';
      } else if (displayType == INTEGER || displayType == NUMBER) {
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

    _convertEqualsToMinMax: function _convertEqualsToMinMax() {
      var equals = this.get('__equals__');
      if (equals) {
        this.set('__minVal__', equals);
        this.set('__maxVal__', equals);
      }
    },

    /*
     Normally we would use a derived property here but derived properties do not work with the model Clone function
     so we use this workaround instead.
     */
    _setConstraintText: function _setConstraintText() {
      var constraint = this.get('__constraint__'),
          min = this.get('__minVal__'),
          max = this.get('__maxVal__'),
          equals = this.get('__equals__');

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

    cleanup: function cleanup() {
      if (this.get('__constraint__') === 'lessThan') {
        this.unset('__minVal__');
      } else if (this.get('__constraint__') === 'greaterThan') {
        this.unset('__maxVal__');
      }
      if (this.get('scope') !== SchemaUtil.SCOPE.SYSTEM) {
        if (this.get('__isScopeSelf__') === true) {
          this.set({ 'scope': SchemaUtil.SCOPE.SELF }, { silent: true });
        } else {
          this.unset('scope');
        }
      }
    },

    /**
     * Since there is not an dedicated attribute to flag enum type,
     * use enum values to determine whether the property is enum type or not.
     */
    isEnumType: function isEnumType() {
      return !!this.getEnumValues();
    },

    getEnumValues: function getEnumValues() {
      return this.get('oneOf') || this.get('enum') || this.get('items') && this.get('items')['oneOf'] || this.get('items') && this.get('items')['enum'];
    },

    detectHasEnumDefined: function detectHasEnumDefined() {
      var enumValues = this.getEnumValues();

      if (!enumValues) {
        return;
      }

      this.set('__oneOf__', EnumTypeHelper.convertToOneOf(enumValues));
      this.set('__enumDefined__', true);
    }

  });

  var SchemaProperties = BaseCollection.extend({
    model: SchemaProperty,
    clone: function clone() {
      return new this.constructor(this.toJSON({ verbose: true }), { parse: true });
    },
    areAllReadOnly: function areAllReadOnly() {
      return _.all(this.pluck('__isReadOnly__'));
    },
    createModelProperties: function createModelProperties() {
      return this.reduce(function (p, schemaProperty) {
        var type = schemaProperty.get('type');
        p[schemaProperty.id] = _.clone(SchemaUtil.DISPLAYTYPES[type]);
        if (SchemaUtil.SUPPORTSMINMAX.indexOf(type) != -1) {
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

  return {
    Model: SchemaProperty,
    Collection: SchemaProperties
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint max-statements: 0 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(2), __webpack_require__(12), __webpack_require__(4)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, $, SchemaUtil, StringUtil) {
  var NAME = 'name',
      ENUM_KEY_PREFIX = '_enum_';

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
    var enumOneOf = convertToOneOf(config.enumValues),
        inputOptions = {
      name: config.name,
      label: config.title,
      readOnly: config.readOnly,
      customExplain: config.explain,
      params: { enumOneOf: enumOneOf },
      options: getDropdownOptionsFromOneOf(enumOneOf)
    };

    // input type
    if (SchemaUtil.isArrayDataType(config.displayType)) {
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
    return _.isArray(values) ? getDropdownOptionsFromOneOf(convertToOneOf(values)) : {};
  }

  function getDropdownOptionsFromOneOf(values) {
    if (!isOneOfEnumObject(values)) {
      return {};
    }

    return _.reduce(values, function (options, value, index) {
      options[convertIndexToEnumIndex(index)] = value.title;
      return options;
    }, {});
  }

  function convertToOneOf(values) {
    // assume this is a legacy enum array and convert to oneOf object
    if (!_.all(values, $.isPlainObject)) {
      return convertEnumToOneOf(values);

      // we assume object without const and title is an enum object which need special conversion
    } else if (!isOneOfEnumObject(values)) {
      return convertEnumObjectToOneOf(values);
    }

    return values;
  }

  function isOneOfEnumObject(values) {
    return _.isArray(values) && _.all(values, function (value) {
      return _.has(value, 'const') && _.has(value, 'title');
    });
  }

  function convertEnumToOneOf(values) {
    return _.map(values, function (value) {
      return {
        const: value,
        title: valueToTitle(value)
      };
    });
  }

  function valueToTitle(value) {
    if (_.isObject(value)) {
      return JSON.stringify(value);
    }

    if (_.isNumber(value)) {
      return value + '';
    }

    return value;
  }

  function convertEnumObjectToOneOf(values) {
    // If all object found the key NAME, use the NAME's value as display name
    var findKey = _.partial(_.has, _, NAME);
    if (_.all(values, findKey)) {
      return _.chain(values).filter(function (value) {
        return $.isPlainObject(value) && _.has(value, NAME);
      }).map(function (value) {
        return { const: value, title: value[NAME] };
      }).value();
    }

    // Assume a legacy object array does not need special handling and just convert to const/title enum
    return convertEnumToOneOf(values);
  }

  function convertIndexToEnumIndex(index) {
    return '' + ENUM_KEY_PREFIX + index;
  }

  function enumObjectToValue(obj) {
    // Cannot rely on comparator in findIndex when compare objects so need special handling
    var index = _.findIndex(this.options.params.enumOneOf, function (oneOfObj) {
      return _.isObject(obj) ? _.isEqual(oneOfObj.const, obj) : oneOfObj.const === obj;
    });

    return index > -1 ? convertIndexToEnumIndex(index) : obj;
  }

  function valueToEnumObject(val) {
    if (!_.isString(val) || val.indexOf(ENUM_KEY_PREFIX) !== 0) {
      return val;
    }

    var index = val.replace(ENUM_KEY_PREFIX, '');

    // @see `getEnumInputOptions` how enumValues has been set.
    var enumValue = this.options.params && _.isArray(this.options.params.enumOneOf) ? this.options.params.enumOneOf[index] : null;

    return _.has(enumValue, 'const') ? enumValue.const : enumValue;
  }

  function valuesToEnumObjects(values) {
    return _.map(values, valueToEnumObject.bind(this));
  }

  function enumObjectsToValues(values) {
    return _.map(values, enumObjectToValue.bind(this));
  }

  function isStringConstraint(value) {
    return _.isString(value) && $.trim(value) !== '';
  }

  function isNumberConstraint(value) {
    return _.isNumber(value) || _.isNumber(StringUtil.parseFloat($.trim(value)));
  }

  function isIntegerConstraint(value) {
    var integer = _.isNumber(value) ? value : StringUtil.parseInt($.trim(value));

    return typeof integer === 'number' && isFinite(integer) && Math.floor(integer) === integer;
  }

  function isObjectConstraint(value) {
    if (_.isObject(value) && !_.isArray(value)) {
      return true;
    }

    var object = StringUtil.parseObject($.trim(value));
    return _.isObject(object) && !_.isArray(object);
  }

  function isConstraintValueMatchType(value, type) {
    switch (type) {
      case SchemaUtil.STRING:
        return isStringConstraint(value);
      case SchemaUtil.NUMBER:
        return isNumberConstraint(value);
      case SchemaUtil.INTEGER:
        return isIntegerConstraint(value);
      case SchemaUtil.OBJECT:
        return isObjectConstraint(value);
    }
  }

  return {
    getEnumInputOptions: getEnumInputOptions,
    getDropdownOptions: getDropdownOptions,
    convertToOneOf: convertToOneOf,
    isConstraintValueMatchType: isConstraintValueMatchType
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(44)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, BaseButtonLink) {

  /**
   * A factory method wrapper for {@link BaseButtonLink} creation
   * @class module:Okta.internal.util.ButtonFactory
   */

  function normalizeEvents(options) {
    var events = _.extend(options.click ? { click: options.click } : {}, options.events || {}),
        target = {};
    _.each(events, function (fn, eventName) {
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

  return (/** @lends module:Okta.internal.util.ButtonFactory */{
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
      create: function create(options) {
        options = _.clone(options);
        options.attrs = options.attributes;
        delete options.attributes;

        return BaseButtonLink.extend(_.extend(options, {
          events: normalizeEvents(options)
        }));
      }
    }
  );
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(5)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
  /* global module, exports */
  else if (typeof require === 'function' && (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
      module.exports = factory(require('okta/underscore'), require('backbone'));
    } else {
      root.Archer || (root.Archer = {});
      root.Archer.View = factory(root._, root.Backbone);
    }
})(undefined, function (_, Backbone) {

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

  function noop() {}

  function doRender(view) {
    view[RENDERED] = true;

    var html = view.renderTemplate(view.template);
    if (html) {
      view.$el.html(html);
    } else if (view.length) {
      view.$el.empty();
    }

    view.each(function (view) {
      view[ADD_TO_CONTAINER]();
    });
  }

  function subscribeEvents(view) {
    var isEventPropertyRe = /^(?!(?:delegate|undelegate|_))([a-zA-Z0-9]+)(?:Events)$/;
    _.each(_.allKeys(view), function (key) {
      var matchKeys = key.match(isEventPropertyRe);
      if (!matchKeys) {
        return;
      }
      var bindings = _.result(view, key),
          entity = view.options[matchKeys[1]] || view[matchKeys[1]];
      if (!entity || !_.isObject(bindings) || !_.isFunction(entity.trigger)) {
        return;
      }
      _.each(bindings, function (callback, event) {
        var callbacks = _.isFunction(callback) ? [callback] : _.reduce(callback.split(/\s+/), function (arr, name) {
          if (_.isFunction(view[name])) {
            arr.push(view[name]);
          }
          return arr;
        }, []);
        _.each(callbacks, function (cb) {
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
  var View = Backbone.View.extend( /** @lends src/framework/View.prototype */{

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

    constructor: function constructor(options) {
      /* eslint max-statements: [2, 17] */
      this.options = options || {};
      _.extend(this, _.pick(this.options, 'state', 'settings'));

      // init per-instance children collection
      this[CHILDREN] = [];
      this[RENDERED] = false;
      this[PARENT] = null;
      this[CHILD_DEFINITIONS] = this.children;

      // we want to make sure initialize is triggered *after* we append the views from the `this.views` array
      var initialize = this.initialize;
      this.initialize = noop;

      Backbone.View.apply(this, arguments);

      _.each(_.result(this, CHILD_DEFINITIONS), function (childDefinition) {
        this.add.apply(this, _.isArray(childDefinition) ? childDefinition : [childDefinition]);
      }, this);
      delete this[CHILD_DEFINITIONS];

      if (this.autoRender && this.model) {
        var event = _.isArray(this.autoRender) ? _.map(this.autoRender, function (field) {
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
    unregister: function unregister(view) {

      this.stopListening(view);
      var viewIndex = getIndex(this, view);
      // viewIndex is undefined when the view is not found (may have been removed)
      // check if it is undefined to prevent unexpected thing to happen
      // array.splice(undefined, x) removes the first x element(s) from the array
      // this protects us against issues when calling `remove` on a child view multiple times
      if (_.isNumber(viewIndex)) {
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
    add: function add(view, selector, bubble, prepend, extraOptions) {
      /* eslint max-statements: [2, 28], complexity: [2, 9] */

      var options = {},
          args = _.toArray(arguments);

      if (_.isObject(selector)) {
        options = selector;
        selector = options.selector;
        bubble = options.bubble;
        prepend = options.prepend;
        extraOptions = options.options;
      } else if (_.isObject(bubble)) {
        options = bubble;
        bubble = options.bubble;
        prepend = options.prepend;
        extraOptions = options.options;
      }

      if (_.isString(view)) {
        view = function (template) {
          return View.extend({
            constructor: function constructor() {
              try {
                var $el = Backbone.$(template);

                if ($el.length != 1) {
                  throw 'invalid Element';
                }

                var unescapingRexExp = /&(\w+|#x\d+);/g;
                var elementUnescapedOuterHTMLLength = $el.prop('outerHTML').replace(unescapingRexExp, ' ').length;
                var templateUnescapedLength = template.replace(unescapingRexExp, ' ').length;

                if (elementUnescapedOuterHTMLLength !== templateUnescapedLength) {
                  throw 'invalid Element';
                }

                this.template = $el.html();
                this.el = $el.empty()[0];
              } catch (e) {
                // not a valid html tag.
                this.template = template;
              }
              View.apply(this, arguments);
            }
          });
        }(view);
      }

      if (view.prototype && view.prototype instanceof View) {
        /* eslint new-cap: 0 */
        var viewOptions = _.omit(_.extend({}, this.options, extraOptions), 'el');
        args[0] = new view(viewOptions);
        return this.add.apply(this, args);
      }

      // prevent dups
      if (_.isNumber(getIndex(this, view))) {
        throw new Error('Duplicate child');
      }

      view[PARENT] = this;

      // make the view responsible for adding itself to the parent:
      // * register the selector in the closure
      // * register a reference the parent in the closure
      view[ADD_TO_CONTAINER] = function (selector) {
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
      }.call(view, selector);

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
    removeChildren: function removeChildren() {
      this.each(function (view) {
        view.remove();
      });
      return this;
    },

    /**
     *  Removes a view from the DOM, and calls stopListening to remove any bound events that the view has listenTo'd.
     *  Also removes all childern of the view if any, and removes itself from its parent view(s)
     */
    remove: function remove() {
      this.removeChildren();
      if (this[PARENT]) {
        this[PARENT].unregister(this);
      }
      return Backbone.View.prototype.remove.apply(this, arguments);
    },

    /**
     * Compile the template to function you can apply tokens on on render time.
     * Uses the underscore tempalting engine by default
     * @protected
     * @param  {String} template
     * @return {Function} a compiled template
     */
    compileTemplate: function compileTemplate(template) {
      /* eslint  @okta/okta/no-specific-methods: 0*/
      return _.template(template);
    },

    /**
     * Render a template with `this.model` and `this.options` as parameters
     * preferring the model over the options.
     *
     * @param  {(String|Function)} template The template to build
     * @return {String} An HTML string
     * @protected
     */
    renderTemplate: function renderTemplate(template) {
      if (_.isString(template)) {
        template = this.compileTemplate(template);
      }
      if (_.isFunction(template)) {
        return template(this.getTemplateData());
      }
    },

    /**
     * The data hash passed to the compiled template
     * @return {Object}
     * @protected
     */
    getTemplateData: function getTemplateData() {
      var modelData = this.model && this.model.toJSON({ verbose: true }) || {};
      var options = _.omit(this.options, ['state', 'settings', 'model', 'collection']);
      return _.defaults({}, modelData, options);
    },

    /**
     * Renders the template to `$el` and append all children in order
     * {@link #template View.template}
     */
    render: function render() {
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
    rendered: function rendered() {
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
    getChildren: function getChildren() {
      return this.toArray();
    },

    /**
     * Get a child by index
     * @param {number} index
     * @returns {src/framework/View} The child view
     */
    at: function at(index) {
      return this.getChildren()[index];
    },

    /**
     * Invokes a method on all children down the tree
     *
     * @param {String} method The method to invoke
     */
    invoke: function invoke(methodName) {
      var args = _.toArray(arguments);
      this.each(function (child) {
        // if child has children, bubble down the tree
        if (child.size()) {
          child.invoke.apply(child, args);
        }
        // run the function on the child
        if (_.isFunction(child[methodName])) {
          child[methodName].apply(child, args.slice(1));
        }
      });
      return this;
    }
  });

  // Code borrowed from Backbone.js source
  // Underscore methods that we want to implement on the Container.
  var methods = ['each', 'map', 'reduce', 'reduceRight', 'find', 'filter', 'reject', 'every', 'some', 'contains', 'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf', 'isEmpty', 'chain', 'where', 'findWhere'];

  _.each(methods, function (method) {
    View.prototype[method] = function () {
      var args = _.toArray(arguments);
      args.unshift(_.toArray(this[CHILDREN]));
      return _[method].apply(_, args);
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

  return View;
});

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_) {

  function changeEventString(doWhen) {
    return 'change:' + _.keys(doWhen).join(' change:');
  }

  function calcDoWhen(value, key) {
    var modelValue = this.model.get(key);
    if (_.isFunction(value)) {
      return value.call(this, modelValue);
    } else {
      return value == modelValue;
    }
  }

  function _doWhen(view, doWhen, fn) {
    var toggle = _.bind(fn, view, view, doWhen);

    view.render = _.wrap(view.render, function (render) {
      var val = render.call(view);
      toggle({ animate: false });
      return val;
    });

    view.listenTo(view.model, changeEventString(doWhen), function () {
      toggle({ animate: true });
    });
  }

  return {
    applyDoWhen: function applyDoWhen(view, doWhen, fn) {
      if (!(view.model && _.isObject(doWhen) && _.size(doWhen) && _.isFunction(fn))) {
        return;
      }
      _doWhen(view, doWhen, function (view, doWhen, options) {
        var result = _.every(_.map(doWhen, calcDoWhen, view));
        fn.call(view, result, options);
      });
    }
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint max-len: [2, 150], max-params: [2, 7] */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(0), __webpack_require__(5), __webpack_require__(27), __webpack_require__(7), __webpack_require__(45), __webpack_require__(46)], __WEBPACK_AMD_DEFINE_RESULT__ = (function ($, _, Backbone, SettingsModel, Logger, Notification, ConfirmationDialog) {

  function getRoute(router, route) {
    var root = _.result(router, 'root') || '';
    if (root && _.isString(route)) {
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
  return Backbone.Router.extend( /** @lends module:Okta.Router.prototype */{

    /**
     * The root URL for the router. When setting {@link http://backbonejs.org/#Router-routes|routes},
     * it will be prepended to each route.
     * @type {String|Function}
     */
    root: '',

    listen: Notification.prototype.listen,

    constructor: function constructor(options) {
      options || (options = {});
      this.el = options.el;
      this.settings = new SettingsModel(_.omit(options, 'el'));
      if (options.root) {
        this.root = options.root;
      }

      Backbone.Router.apply(this, arguments);

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
    _confirm: function _confirm(options) {
      options || (options = {});
      var Dialog = ConfirmationDialog.extend(_.pick(options, 'title', 'subtitle', 'save', 'ok', 'cancel', 'cancelFn', 'noCancelButton', 'content', 'danger'));
      // The model is here because itsa part of the BaseForm paradigm.
      // It will be ignored in the context of a confirmation dialog.
      var dialog = new Dialog({ model: this.settings });
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
    _notify: function _notify(options) {
      var notification = new Notification(options);
      $('#content').prepend(notification.render().el);
      return notification; // test hook
    },

    /**
     * Renders a Controller
     * This will initialize new instance of a controller and call render on it
     *
     * @param  {Okta.Controller} Controller The controller Class we which to render
     * @param  {Object} [options] Extra options to the controller constructor
     */
    render: function render(Controller, options) {
      this.unload();
      options = _.extend(_.pick(this, 'settings', 'el'), options || {});
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
    start: function start() {
      var args = arguments;
      $(function () {
        if (Backbone.History.started) {
          Logger.error('History has already been started');
          return;
        }
        Backbone.history.start.apply(Backbone.history, args);
      });
    },

    /**
     * Removes active controller and frees up event listeners
     */
    unload: function unload() {
      if (this.controller) {
        this.stopListening(this.controller);
        this.stopListening(this.controller.state);
        this.controller.remove();
      }
    },

    route: function route(_route, name, callback) {
      return Backbone.Router.prototype.route.call(this, getRoute(this, _route), name, callback);
    },

    navigate: function navigate(fragment, options) {
      return Backbone.Router.prototype.navigate.call(this, getRoute(this, fragment), options);
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(11)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, Model) {

  /**
   * @class SettingsModel
   * @extends {Okta.Model}
   * @private
   */

  return Model.extend({
    local: function local() {
      var settings = window.okta && window.okta.settings || {};
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

    constructor: function constructor() {
      this.features = window._features || [];
      Model.apply(this, arguments);
    },

    /**
     * Checks if the user have a feature flag enabled (Based of the org level feature flag)
     * @param  {String}  feature Feature name
     * @return {Boolean}
     */
    hasFeature: function hasFeature(feature) {
      if (this.features.length === 0 && window.okta && window.okta.logHasFeatureError) {
        window.okta.logHasFeatureError(feature);
      }
      return _.contains(this.features, feature);
    },

    /**
     * Checks if any of the given feature flags are enabled (Based of the org level feature flags)
     * @param  {Array}  featureArray Features names
     * @return {Boolean} true if any of the give features are enabled. False otherwise
     */
    hasAnyFeature: function hasAnyFeature(featureArray) {
      return _.some(featureArray, this.hasFeature, this);
    },

    /**
     * Checks if the user have a specific permission (based on data passed from JSP)
     * @param  {String}  permission Permission name
     * @return {Boolean}
     */
    hasPermission: function hasPermission(permission) {
      return _.contains(this.get('permissions'), permission);
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint max-params: [2, 14], max-statements: [2, 11] */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(2), __webpack_require__(3), __webpack_require__(4), __webpack_require__(1), __webpack_require__(49), __webpack_require__(50), __webpack_require__(55), __webpack_require__(51), __webpack_require__(52), __webpack_require__(53), __webpack_require__(9), __webpack_require__(54), __webpack_require__(31)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, $, TemplateUtil, StringUtil, BaseView, InputFactory, InputLabel, InputContainer, InputWrapper, ErrorBanner, ErrorParser, FormUtil, ReadModeBar, Toolbar) {

  var template = '\
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

  // polyfill for `pointer-events: none;` in IE < 11
  // Logic borrowed from https://github.com/kmewhort/pointer_events_polyfill (BSD)
  var pointerEventsSupported = $('<div>').css({ 'pointer-events': 'auto' })[0].style.pointerEvents === 'auto';
  function pointerEventsPolyfill(e) {
    if (!pointerEventsSupported && this.$el.hasClass('o-form-saving')) {
      var $el = $(e.currentTarget);

      $el.css('display', 'none');
      var underneathElem = document.elementFromPoint(e.clientX, e.clientY);
      $el.css('display', 'block');

      e.target = underneathElem;
      $(underneathElem).trigger(e);

      return false;
    }
  }

  var events = {
    submit: function submit(e) {
      e.preventDefault();
      this.__save();
    }
  };

  _.each(['click', 'dblclick', 'mousedown', 'mouseup'], function (event) {
    events[event + ' .o-form-input'] = pointerEventsPolyfill;
  });

  var attributes = function attributes(model) {
    model || (model = {});
    var collection = model && model.collection || {};
    return {
      method: 'POST',
      action: _.result(model, 'urlRoot') || _.result(collection, 'url') || window.location.pathname,
      'data-se': 'o-form'
    };
  };

  var convertSavingState = function convertSavingState(rawSavingStateEvent, defaultEvent) {
    rawSavingStateEvent || (rawSavingStateEvent = '');
    var savingStateEvent = [];
    if (_.isString(rawSavingStateEvent)) {
      savingStateEvent = rawSavingStateEvent.split(' ');
    }
    savingStateEvent = _.union(savingStateEvent, defaultEvent);
    return savingStateEvent.join(' ');
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

  return BaseView.extend( /** @lends module:Okta.Form.prototype */{

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

    constructor: function constructor(options) {
      /* eslint max-statements: 0, complexity: 0 */
      options || (options = {});
      this.options = options;

      this.id = _.uniqueId('form');
      this.tagName = 'form';

      _.defaults(this.events, events);
      _.defaults(this.attributes, attributes(options.model));

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

      BaseView.call(this, options);

      _.each(_.result(this, 'inputs') || [], function (input) {
        // to ingore extra argumests from `each` iteratee function
        // http://underscorejs.org/#each
        this.__addLayoutItem(input);
      }, this);

      this.add(this.__toolbar, '');

      this.listenTo(this.model, 'change:__edit__', this.__applyMode);

      this.listenTo(this.model, 'invalid error', _.throttle(function (model, resp, showBanner) {
        this.__showErrors(model, resp, showBanner !== false);
      }, 100, { trailing: false }));

      this.listenTo(this.model, 'form:resize', function () {
        this.trigger('resize');
      });

      this.listenTo(this.model, 'form:cancel', _.throttle(this.__cancel, 100, { trailing: false }));
      this.listenTo(this.model, 'form:previous', _.throttle(this.__previous, 100, { trailing: false }));

      this.__save = _.throttle(this.__save, 200, { trailing: false });
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

      var hasSavingState = this.getAttribute('hasSavingState');

      if (this.getAttribute('autoSave')) {
        this.listenTo(this, 'save', function (model) {
          var xhr = model.save();
          if (xhr && xhr.done) {
            xhr.done(_.bind(function () {
              this.trigger('saved', model);
            }, this));
          }
        });
        if (_.isUndefined(hasSavingState)) {
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
        var customSavingState = this.getAttribute('customSavingState', {});
        this.listenTo(this.model, convertSavingState(customSavingState.start || '', ['request']), this.__setSavingState);
        this.listenTo(this.model, convertSavingState(customSavingState.stop || '', ['error', 'sync']), this.__clearSavingState);
      }
    },

    /**
     * Create the bottom button bar
     * @param  {Object} options options h
     * @return {Okta.View} The toolbar
     * @private
     */
    __createToolbar: function __createToolbar(options) {

      var danger = this.getAttribute('danger');
      var saveBtnClassName = danger === true ? 'button-error' : 'button-primary';

      var toolbar = new Toolbar(_.extend({
        save: this.save || StringUtil.localize('oform.save', 'courage'),
        saveId: this.saveId,
        saveClassName: saveBtnClassName,
        cancel: this.cancel || StringUtil.localize('oform.cancel', 'courage'),
        noCancelButton: this.noCancelButton || false,
        hasPrevStep: this.step && this.step > 1
      }, options || this.options));

      _.each(this.__buttons, function (args) {
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
    getAttribute: function getAttribute(name, defaultValue) {
      var value = _.resultCtx(this.options, name, this);
      if (_.isUndefined(value)) {
        value = _.result(this, name);
      }
      return !_.isUndefined(value) ? value : defaultValue;
    },

    /**
     * Does this form have a "read" mode
     * @return {Boolean}
     */
    hasReadMode: function hasReadMode() {
      return !!this.getAttribute('read');
    },

    /**
     * Is this form in "read only" mode
     * @return {Boolean}
     */
    isReadOnly: function isReadOnly() {
      return !!this.getAttribute('readOnly');
    },

    /**
     * Does this form have a button bar
     * @return {Boolean}
     */
    hasButtonBar: function hasButtonBar() {
      return !(this.getAttribute('noButtonBar') || this.isReadOnly());
    },

    render: function render() {

      this.__readModeBar && this.__readModeBar.remove();
      if (this.hasReadMode() && !this.isReadOnly()) {
        var readModeBar = ReadModeBar.extend({
          formTitle: this.getAttribute('title', '')
        });
        this.__readModeBar = this.add(readModeBar, '.o-form-title-bar').last();
      }

      var html = TemplateUtil.tpl(template)({
        layout: this.getAttribute('layout', ''),
        title: this.getAttribute('title', '', true),
        subtitle: this.getAttribute('subtitle', '', true),
        hasReadMode: this.hasReadMode()
      });

      this.$el.html(html);
      delete this.template;

      BaseView.prototype.render.apply(this, arguments);

      this.__applyMode();

      return this;
    },

    /**
     * Changes form UI to indicate saving.  Disables all inputs and buttons.  Use this function if you have set
     * hasSavingState to false on the the form
     * @private
     */
    __setSavingState: function __setSavingState() {
      this.model.trigger('form:set-saving-state');
      this.$el.addClass('o-form-saving');
    },

    /**
     * Changes form UI back to normal from the saving state.  Use this function if you are have set hasSavingState
     * to false on the form
     * @private
     */
    __clearSavingState: function __clearSavingState() {
      this.model.trigger('form:clear-saving-state');
      this.$el.removeClass('o-form-saving');
    },

    /**
     * Toggles the visibility of the bottom button bar
     * @private
     */
    __toggleToolbar: function __toggleToolbar() {
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
    __cancel: function __cancel() {
      /* eslint max-statements: [2, 12] */
      var edit = this.model.get('__edit__');
      this.model.clear({ silent: true });
      var data;
      if (this.model.sanitizeAttributes) {
        data = this.model.sanitizeAttributes(this.__originalModel);
      } else {
        data = _.clone(this.__originalModel);
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
    isValid: function isValid() {
      var res;
      var self = this;

      function validateArray(arr) {
        return _.reduce(arr, function (memo, fieldName) {
          return _.extend(memo, self.model.validateField(fieldName));
        }, {});
      }

      if (_.isUndefined(this.validate)) {
        return this.model.isValid();
      } else if (_.isFunction(this.validate)) {
        res = this.validate();
      } else if (_.isArray(this.validate)) {
        res = validateArray(this.validate);
      } else if (this.validate === 'local') {
        res = validateArray(this.getInputs().map(function (input) {
          return input.options.name;
        }));
      }

      if (!_.isEmpty(res)) {
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
    __save: function __save() {
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
    __previous: function __previous() {
      this.trigger('previous', this.model);
    },

    /**
     * Renders the form in the correct mode based on the model.
     * @private
     */
    __applyMode: function __applyMode() {
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
    _editMode: function _editMode() {
      return this.model.get('__edit__') || !this.hasReadMode();
    },

    /**
     * Function can be overridden to alter error summary
     * @param {Object} responseJSON
     * @method
     * @default _.identity
     */
    parseErrorMessage: _.identity,

    /**
     * Show an error message based on an XHR error
     * @param  {Okta.BaseModel} model the model
     * @param  {jqXHR} xhr The jQuery XmlHttpRequest Object
     * @private
     */
    __showErrors: function __showErrors(model, resp, showBanner) {
      this.trigger('error', model);

      /* eslint max-statements: 0 */
      if (this.getAttribute('showErrors')) {

        var errorSummary;
        var responseJSON = ErrorParser.getResponseJSON(resp);

        // trigger events for field validation errors
        var validationErrors = ErrorParser.parseFieldErrors(resp);
        if (_.size(validationErrors)) {
          _.each(validationErrors, function (errors, field) {
            this.model.trigger('form:field-error', this.__errorFields[field] || field, _.map(errors, function (error) {
              return (/^model\.validation/.test(error) ? StringUtil.localize(error, 'courage') : error
              );
            }));
          }, this);
        } else if (responseJSON && Array.isArray(responseJSON.errorCauses) && responseJSON.errorCauses.length > 0) {
          //set errorSummary from first errorCause which is not field specific error
          errorSummary = responseJSON.errorCauses[0].errorSummary;
        } else {
          //set errorSummary from top level errorSummary
          responseJSON = this.parseErrorMessage(responseJSON);
          errorSummary = responseJSON && responseJSON.errorSummary;
        }

        // show the error message
        if (showBanner) {
          this.$('.o-form-error-container').addClass('o-form-has-errors');
          this.add(ErrorBanner, '.o-form-error-container', { options: { errorSummary: errorSummary } });
        }

        // slide to and focus on the error message
        if (this.getAttribute('scrollOnError')) {
          var $el = $('#' + this.id + ' .o-form-error-container');
          $el.length && $('html, body').animate({ scrollTop: $el.offset().top }, 400);
        }

        this.model.trigger('form:resize');
      }
    },

    /**
     * Clears the error banner
     * @private
     */
    clearErrors: function clearErrors() {
      this.$('.o-form-error-container').removeClass('o-form-has-errors');
      this.model.trigger('form:clear-errors');
      this.model.trigger('form:resize');
    },

    /**
     * Toggles between edit and read mode
     */
    toggle: function toggle() {
      this.model.set('__edit__', !this.hasReadMode() || !this.model.get('__edit__'));
      return this;
    },

    __addLayoutItem: function __addLayoutItem(input) {
      if (InputFactory.supports(input)) {
        this.addInput(input);
      } else {
        this.__addNonInputLayoutItem(input);
      }
    },

    __addNonInputLayoutItem: function __addNonInputLayoutItem(item) {
      var itemOptions = _.omit(item, 'type');
      switch (item.type) {
        case 'sectionTitle':
          this.addSectionTitle(item.title, _.omit(itemOptions, 'title'));
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
    addButton: function addButton(params, options) {
      this.__toolbar && this.__toolbar.addButton(params, options);
      this.__buttons.push([params, options]);
    },

    /**
     * Adds a divider
     */
    addDivider: function addDivider(options) {
      this.add('<div class="okta-form-divider form-divider"></div>');
      FormUtil.applyShowWhen(this.last(), options && options.showWhen);
      FormUtil.applyToggleWhen(this.last(), options && options.toggleWhen);
      return this;
    },

    /**
     * Adds section header
     * @param {String} title
     */
    addSectionTitle: function addSectionTitle(title, options) {
      this.add(TemplateUtil.tpl('<h2 class="o-form-head">{{title}}</h2>')({ title: title }));
      FormUtil.applyShowWhen(this.last(), options && options.showWhen);
      FormUtil.applyToggleWhen(this.last(), options && options.toggleWhen);
      return this;
    },

    /**
     * Add a form input
     * @param {Object} options Options to describe the input
     * @param {String} options.type The input type.
     * The options are: `text`, `textarea`, `select`, `checkbox`, `radio`,
     * `password`, `number`, `textselect`, `date`, `grouppicker`, `su-orgspicker`
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
    addInput: function addInput(_options) {

      _options = _.clone(_options);

      FormUtil.validateInput(_options, this.model);

      var inputsOptions = FormUtil.generateInputOptions(_options, this, this.__createInput).reverse();

      // We need a local variable here to keep track
      // as addInput can be called either directy or through the inputs array.
      if (_.isEmpty(this.getInputs().toArray())) {
        _.extend(inputsOptions[0], { validateOnlyIfDirty: true });
      }
      var inputs = _.map(inputsOptions, this.__createInput, this);

      _.each(inputsOptions, function (input) {
        if (input.errorField) {
          this.__errorFields[input.errorField] = input.name;
        }
      }, this);

      var options = {
        inputId: _.last(inputs).options.inputId,
        input: inputs,
        multi: inputsOptions.length > 1 ? inputsOptions.length : undefined
      };
      _.extend(options, _.omit(this.options, 'input'), _.omit(_options, 'input'));

      var inputWrapper = this.__createWrapper(options);
      if (options.label !== false) {
        inputWrapper.add(this.__createLabel(options));
      }
      inputWrapper.add(this._createContainer(options));
      inputWrapper.type = options.type || options.input.type || 'custom';

      var args = [inputWrapper].concat(_.drop(arguments, 1));
      return this.add.apply(this, args);
    },

    /**
     * @private
     */
    __createInput: function __createInput(options) {
      options = _.pick(options, FormUtil.INPUT_OPTIONS);
      return InputFactory.create(options);
    },

    /**
     * @private
     */
    __createWrapper: function __createWrapper(options) {
      options = _.pick(options, FormUtil.WRAPPER_OPTIONS);
      return new InputWrapper(options);
    },

    /**
     * @private
     */
    __createLabel: function __createLabel(options) {
      options = _.pick(options, FormUtil.LABEL_OPTIONS);
      return new InputLabel(options);
    },

    /**
     * @private
     */
    _createContainer: function _createContainer(options) {
      options = _.pick(options, FormUtil.CONTAINER_OPTIONS);
      return new InputContainer(options);
    },

    /**
     * Stores the current attributes of the model to a private property
     * @param  {Okta.BaseModel} model The model
     * @private
     */
    __saveModelState: function __saveModelState(model) {
      this.__originalModel = model.clone().attributes;
    },

    /**
     * @override
     * @ignore
     */
    add: function add() {
      var args = _.toArray(arguments);
      typeof args[1] === 'undefined' && (args[1] = '> div.o-form-content > .o-form-fieldset-container');
      return BaseView.prototype.add.apply(this, args);
    },

    /**
     * Set the focus on the first input in the form
     */
    focus: function focus() {
      var first = this.getInputs().first();
      if (first && first.focus) {
        first.focus();
      }
      return this;
    },

    /**
     * Disable all inputs in the form
     * @deprecated not currently in use
     */
    disable: function disable() {
      this.invoke('disable');
      return this;
    },

    /**
     * Enable all inputs in the form
     * @deprecated not currently in use
     */
    enable: function enable() {
      this.invoke('enable');
    },

    /**
     * Set the max-height for o-form-content class container within the form if a height is provided,
     * otherwise, get its computed inner height
     * @param {Number} the height in pixel to set for class o-form-content
     * @return {Number}
     */
    contentHeight: function contentHeight(height) {
      var content = this.$('.o-form-content');
      if (_.isNumber(height)) {
        content.css('max-height', height);
      } else {
        return content.height();
      }
    },

    /**
     * Get only the input children
     * @return {InputWrapper[]} An underscore wrapped array of {@link InputWrapper} instances
     */
    getInputs: function getInputs() {
      return _(this.filter(function (view) {
        return view instanceof InputWrapper;
      }));
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_) {
  var registry = {};

  function isBaseInput(input) {
    if (_.isFunction(input)) {
      return _.isFunction(input.prototype.editMode) && _.isFunction(input.prototype.readMode);
    } else {
      return _.isObject(input) && _.isFunction(input.editMode) && _.isFunction(input.readMode);
    }
  }

  /**
   * @class module:Okta.internal.views.forms.helpers.InputRegistry
   */
  return (/** @lends module:Okta.internal.views.forms.helpers.InputRegistry */{
      isBaseInput: isBaseInput,

      /**
       * Register a form input
       * @param {String} type string identifier for the input
       * @param {BaseInput} input the input to register
       */
      register: function register(type, input) {
        registry[type] = input;
      },

      /**
       * Get a form input by type
       * @param {Object} options input definition
       * @param {String} options.type string identifier for the input
       * @return {BaseInput} a matching input
       */
      get: function get(options) {
        var input = registry[options.type];
        return input && (isBaseInput(input) ? input : input(options));
      },

      /**
       * Unregister an input type
       * @param {String} type
       */
      unregister: function unregister(type) {
        delete registry[type];
      }
    }
  );
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
 * qTip2 - Pretty powerful tooltips - v3.0.3-5-g
 * http://qtip2.com
 *
 * Copyright (c) 2017 
 * Released under the MIT licenses
 * http://jquery.org/license
 *
 * Date: Wed May 24 2017 01:22 UTC+0000
 * Plugins: tips modal viewport svg imagemap ie6
 * Styles: core basic css3
 */
/*global window: false, jQuery: false, console: false, define: false */

/* Cache window, document, undefined */
(function (window, document, undefined) {

	// Uses AMD or browser globals to create a jQuery plugin.
	(function (factory) {
		"use strict";

		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(6)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (jQuery && !jQuery.fn.qtip) {
			factory(jQuery);
		}
	})(function ($) {
		"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

		; // Munge the primitives - Paul Irish tip
		var TRUE = true,
		    FALSE = false,
		    NULL = null,


		// Common variables
		X = 'x',
		    Y = 'y',
		    WIDTH = 'width',
		    HEIGHT = 'height',


		// Positioning sides
		TOP = 'top',
		    LEFT = 'left',
		    BOTTOM = 'bottom',
		    RIGHT = 'right',
		    CENTER = 'center',


		// Position adjustment types
		FLIP = 'flip',
		    FLIPINVERT = 'flipinvert',
		    SHIFT = 'shift',


		// Shortcut vars
		QTIP,
		    PROTOTYPE,
		    CORNER,
		    CHECKS,
		    PLUGINS = {},
		    NAMESPACE = 'qtip',
		    ATTR_HAS = 'data-hasqtip',
		    ATTR_ID = 'data-qtip-id',
		    WIDGET = ['ui-widget', 'ui-tooltip'],
		    SELECTOR = '.' + NAMESPACE,
		    INACTIVE_EVENTS = 'click dblclick mousedown mouseup mousemove mouseleave mouseenter'.split(' '),
		    CLASS_FIXED = NAMESPACE + '-fixed',
		    CLASS_DEFAULT = NAMESPACE + '-default',
		    CLASS_FOCUS = NAMESPACE + '-focus',
		    CLASS_HOVER = NAMESPACE + '-hover',
		    CLASS_DISABLED = NAMESPACE + '-disabled',
		    replaceSuffix = '_replacedByqTip',
		    oldtitle = 'oldtitle',
		    trackingBound,


		// Browser detection
		BROWSER = {
			/*
    * IE version detection
    *
    * Adapted from: http://ajaxian.com/archives/attack-of-the-ie-conditional-comment
    * Credit to James Padolsey for the original implemntation!
    */
			ie: function () {
				/* eslint-disable no-empty */
				var v, i;
				for (v = 4, i = document.createElement('div'); (i.innerHTML = '<!--[if gt IE ' + v + ']><i></i><![endif]-->') && i.getElementsByTagName('i')[0]; v += 1) {}
				return v > 4 ? v : NaN;
				/* eslint-enable no-empty */
			}(),

			/*
    * iOS version detection
    */
			iOS: parseFloat(('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0, ''])[1]).replace('undefined', '3_2').replace('_', '.').replace('_', '')) || FALSE
		};
		;function QTip(target, options, id, attr) {
			// Elements and ID
			this.id = id;
			this.target = target;
			this.tooltip = NULL;
			this.elements = { target: target };

			// Internal constructs
			this._id = NAMESPACE + '-' + id;
			this.timers = { img: {} };
			this.options = options;
			this.plugins = {};

			// Cache object
			this.cache = {
				event: {},
				target: $(),
				disabled: FALSE,
				attr: attr,
				onTooltip: FALSE,
				lastClass: ''
			};

			// Set the initial flags
			this.rendered = this.destroyed = this.disabled = this.waiting = this.hiddenDuringWait = this.positioning = this.triggering = FALSE;
		}
		PROTOTYPE = QTip.prototype;

		PROTOTYPE._when = function (deferreds) {
			return $.when.apply($, deferreds);
		};

		PROTOTYPE.render = function (show) {
			if (this.rendered || this.destroyed) {
				return this;
			} // If tooltip has already been rendered, exit

			var self = this,
			    options = this.options,
			    cache = this.cache,
			    elements = this.elements,
			    text = options.content.text,
			    title = options.content.title,
			    button = options.content.button,
			    posOptions = options.position,
			    deferreds = [];

			// Add ARIA attributes to target
			$.attr(this.target[0], 'aria-describedby', this._id);

			// Create public position object that tracks current position corners
			cache.posClass = this._createPosClass((this.position = { my: posOptions.my, at: posOptions.at }).my);

			// Create tooltip element
			this.tooltip = elements.tooltip = $('<div/>', {
				'id': this._id,
				'class': [NAMESPACE, CLASS_DEFAULT, options.style.classes, cache.posClass].join(' '),
				'width': options.style.width || '',
				'height': options.style.height || '',
				'tracking': posOptions.target === 'mouse' && posOptions.adjust.mouse,

				/* ARIA specific attributes */
				'role': 'alert',
				'aria-live': 'polite',
				'aria-atomic': FALSE,
				'aria-describedby': this._id + '-content',
				'aria-hidden': TRUE
			}).toggleClass(CLASS_DISABLED, this.disabled).attr(ATTR_ID, this.id).data(NAMESPACE, this).appendTo(posOptions.container).append(
			// Create content element
			elements.content = $('<div />', {
				'class': NAMESPACE + '-content',
				'id': this._id + '-content',
				'aria-atomic': TRUE
			}));

			// Set rendered flag and prevent redundant reposition calls for now
			this.rendered = -1;
			this.positioning = TRUE;

			// Create title...
			if (title) {
				this._createTitle();

				// Update title only if its not a callback (called in toggle if so)
				if (!$.isFunction(title)) {
					deferreds.push(this._updateTitle(title, FALSE));
				}
			}

			// Create button
			if (button) {
				this._createButton();
			}

			// Set proper rendered flag and update content if not a callback function (called in toggle)
			if (!$.isFunction(text)) {
				deferreds.push(this._updateContent(text, FALSE));
			}
			this.rendered = TRUE;

			// Setup widget classes
			this._setWidget();

			// Initialize 'render' plugins
			$.each(PLUGINS, function (name) {
				var instance;
				if (this.initialize === 'render' && (instance = this(self))) {
					self.plugins[name] = instance;
				}
			});

			// Unassign initial events and assign proper events
			this._unassignEvents();
			this._assignEvents();

			// When deferreds have completed
			this._when(deferreds).then(function () {
				// tooltiprender event
				self._trigger('render');

				// Reset flags
				self.positioning = FALSE;

				// Show tooltip if not hidden during wait period
				if (!self.hiddenDuringWait && (options.show.ready || show)) {
					self.toggle(TRUE, cache.event, FALSE);
				}
				self.hiddenDuringWait = FALSE;
			});

			// Expose API
			QTIP.api[this.id] = this;

			return this;
		};

		PROTOTYPE.destroy = function (immediate) {
			// Set flag the signify destroy is taking place to plugins
			// and ensure it only gets destroyed once!
			if (this.destroyed) {
				return this.target;
			}

			function process() {
				if (this.destroyed) {
					return;
				}
				this.destroyed = TRUE;

				var target = this.target,
				    title = target.attr(oldtitle),
				    timer;

				// Destroy tooltip if rendered
				if (this.rendered) {
					this.tooltip.stop(1, 0).find('*').remove().end().remove();
				}

				// Destroy all plugins
				$.each(this.plugins, function () {
					this.destroy && this.destroy();
				});

				// Clear timers
				for (timer in this.timers) {
					if (this.timers.hasOwnProperty(timer)) {
						clearTimeout(this.timers[timer]);
					}
				}

				// Remove api object and ARIA attributes
				target.removeData(NAMESPACE).removeAttr(ATTR_ID).removeAttr(ATTR_HAS).removeAttr('aria-describedby');

				// Reset old title attribute if removed
				if (this.options.suppress && title) {
					target.attr('title', title).removeAttr(oldtitle);
				}

				// Remove qTip events associated with this API
				this._unassignEvents();

				// Remove ID from used id objects, and delete object references
				// for better garbage collection and leak protection
				this.options = this.elements = this.cache = this.timers = this.plugins = this.mouse = NULL;

				// Delete epoxsed API object
				delete QTIP.api[this.id];
			}

			// If an immediate destroy is needed
			if ((immediate !== TRUE || this.triggering === 'hide') && this.rendered) {
				this.tooltip.one('tooltiphidden', $.proxy(process, this));
				!this.triggering && this.hide();
			}

			// If we're not in the process of hiding... process
			else {
					process.call(this);
				}

			return this.target;
		};
		;function invalidOpt(a) {
			return a === NULL || $.type(a) !== 'object';
		}

		function invalidContent(c) {
			return !($.isFunction(c) || c && c.attr || c.length || $.type(c) === 'object' && (c.jquery || c.then));
		}

		// Option object sanitizer
		function sanitizeOptions(opts) {
			var content, text, ajax, once;

			if (invalidOpt(opts)) {
				return FALSE;
			}

			if (invalidOpt(opts.metadata)) {
				opts.metadata = { type: opts.metadata };
			}

			if ('content' in opts) {
				content = opts.content;

				if (invalidOpt(content) || content.jquery || content.done) {
					text = invalidContent(content) ? FALSE : content;
					content = opts.content = {
						text: text
					};
				} else {
					text = content.text;
				}

				// DEPRECATED - Old content.ajax plugin functionality
				// Converts it into the proper Deferred syntax
				if ('ajax' in content) {
					ajax = content.ajax;
					once = ajax && ajax.once !== FALSE;
					delete content.ajax;

					content.text = function (event, api) {
						var loading = text || $(this).attr(api.options.content.attr) || 'Loading...',
						    deferred = $.ajax($.extend({}, ajax, { context: api })).then(ajax.success, NULL, ajax.error).then(function (newContent) {
							if (newContent && once) {
								api.set('content.text', newContent);
							}
							return newContent;
						}, function (xhr, status, error) {
							if (api.destroyed || xhr.status === 0) {
								return;
							}
							api.set('content.text', status + ': ' + error);
						});

						return !once ? (api.set('content.text', loading), deferred) : loading;
					};
				}

				if ('title' in content) {
					if ($.isPlainObject(content.title)) {
						content.button = content.title.button;
						content.title = content.title.text;
					}

					if (invalidContent(content.title || FALSE)) {
						content.title = FALSE;
					}
				}
			}

			if ('position' in opts && invalidOpt(opts.position)) {
				opts.position = { my: opts.position, at: opts.position };
			}

			if ('show' in opts && invalidOpt(opts.show)) {
				opts.show = opts.show.jquery ? { target: opts.show } : opts.show === TRUE ? { ready: TRUE } : { event: opts.show };
			}

			if ('hide' in opts && invalidOpt(opts.hide)) {
				opts.hide = opts.hide.jquery ? { target: opts.hide } : { event: opts.hide };
			}

			if ('style' in opts && invalidOpt(opts.style)) {
				opts.style = { classes: opts.style };
			}

			// Sanitize plugin options
			$.each(PLUGINS, function () {
				this.sanitize && this.sanitize(opts);
			});

			return opts;
		}

		// Setup builtin .set() option checks
		CHECKS = PROTOTYPE.checks = {
			builtin: {
				// Core checks
				'^id$': function id$(obj, o, v, prev) {
					var id = v === TRUE ? QTIP.nextid : v,
					    newId = NAMESPACE + '-' + id;

					if (id !== FALSE && id.length > 0 && !$('#' + newId).length) {
						this._id = newId;

						if (this.rendered) {
							this.tooltip[0].id = this._id;
							this.elements.content[0].id = this._id + '-content';
							this.elements.title[0].id = this._id + '-title';
						}
					} else {
						obj[o] = prev;
					}
				},
				'^prerender': function prerender(obj, o, v) {
					v && !this.rendered && this.render(this.options.show.ready);
				},

				// Content checks
				'^content.text$': function contentText$(obj, o, v) {
					this._updateContent(v);
				},
				'^content.attr$': function contentAttr$(obj, o, v, prev) {
					if (this.options.content.text === this.target.attr(prev)) {
						this._updateContent(this.target.attr(v));
					}
				},
				'^content.title$': function contentTitle$(obj, o, v) {
					// Remove title if content is null
					if (!v) {
						return this._removeTitle();
					}

					// If title isn't already created, create it now and update
					v && !this.elements.title && this._createTitle();
					this._updateTitle(v);
				},
				'^content.button$': function contentButton$(obj, o, v) {
					this._updateButton(v);
				},
				'^content.title.(text|button)$': function contentTitleTextButton$(obj, o, v) {
					this.set('content.' + o, v); // Backwards title.text/button compat
				},

				// Position checks
				'^position.(my|at)$': function positionMyAt$(obj, o, v) {
					if ('string' === typeof v) {
						this.position[o] = obj[o] = new CORNER(v, o === 'at');
					}
				},
				'^position.container$': function positionContainer$(obj, o, v) {
					this.rendered && this.tooltip.appendTo(v);
				},

				// Show checks
				'^show.ready$': function showReady$(obj, o, v) {
					v && (!this.rendered && this.render(TRUE) || this.toggle(TRUE));
				},

				// Style checks
				'^style.classes$': function styleClasses$(obj, o, v, p) {
					this.rendered && this.tooltip.removeClass(p).addClass(v);
				},
				'^style.(width|height)': function styleWidthHeight(obj, o, v) {
					this.rendered && this.tooltip.css(o, v);
				},
				'^style.widget|content.title': function styleWidgetContentTitle() {
					this.rendered && this._setWidget();
				},
				'^style.def': function styleDef(obj, o, v) {
					this.rendered && this.tooltip.toggleClass(CLASS_DEFAULT, !!v);
				},

				// Events check
				'^events.(render|show|move|hide|focus|blur)$': function eventsRenderShowMoveHideFocusBlur$(obj, o, v) {
					this.rendered && this.tooltip[($.isFunction(v) ? '' : 'un') + 'bind']('tooltip' + o, v);
				},

				// Properties which require event reassignment
				'^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)': function showHidePositionEventTargetFixedInactiveLeaveDistanceViewportAdjust() {
					if (!this.rendered) {
						return;
					}

					// Set tracking flag
					var posOptions = this.options.position;
					this.tooltip.attr('tracking', posOptions.target === 'mouse' && posOptions.adjust.mouse);

					// Reassign events
					this._unassignEvents();
					this._assignEvents();
				}
			}
		};

		// Dot notation converter
		function convertNotation(options, notation) {
			var i = 0,
			    obj,
			    option = options,


			// Split notation into array
			levels = notation.split('.');

			// Loop through
			while (option = option[levels[i++]]) {
				if (i < levels.length) {
					obj = option;
				}
			}

			return [obj || options, levels.pop()];
		}

		PROTOTYPE.get = function (notation) {
			if (this.destroyed) {
				return this;
			}

			var o = convertNotation(this.options, notation.toLowerCase()),
			    result = o[0][o[1]];

			return result.precedance ? result.string() : result;
		};

		function setCallback(notation, args) {
			var category, rule, match;

			for (category in this.checks) {
				if (!this.checks.hasOwnProperty(category)) {
					continue;
				}

				for (rule in this.checks[category]) {
					if (!this.checks[category].hasOwnProperty(rule)) {
						continue;
					}

					if (match = new RegExp(rule, 'i').exec(notation)) {
						args.push(match);

						if (category === 'builtin' || this.plugins[category]) {
							this.checks[category][rule].apply(this.plugins[category] || this, args);
						}
					}
				}
			}
		}

		var rmove = /^position\.(my|at|adjust|target|container|viewport)|style|content|show\.ready/i,
		    rrender = /^prerender|show\.ready/i;

		PROTOTYPE.set = function (option, value) {
			if (this.destroyed) {
				return this;
			}

			var rendered = this.rendered,
			    reposition = FALSE,
			    options = this.options,
			    name;

			// Convert singular option/value pair into object form
			if ('string' === typeof option) {
				name = option;option = {};option[name] = value;
			} else {
				option = $.extend({}, option);
			}

			// Set all of the defined options to their new values
			$.each(option, function (notation, val) {
				if (rendered && rrender.test(notation)) {
					delete option[notation];return;
				}

				// Set new obj value
				var obj = convertNotation(options, notation.toLowerCase()),
				    previous;
				previous = obj[0][obj[1]];
				obj[0][obj[1]] = val && val.nodeType ? $(val) : val;

				// Also check if we need to reposition
				reposition = rmove.test(notation) || reposition;

				// Set the new params for the callback
				option[notation] = [obj[0], obj[1], val, previous];
			});

			// Re-sanitize options
			sanitizeOptions(options);

			/*
    * Execute any valid callbacks for the set options
    * Also set positioning flag so we don't get loads of redundant repositioning calls.
    */
			this.positioning = TRUE;
			$.each(option, $.proxy(setCallback, this));
			this.positioning = FALSE;

			// Update position if needed
			if (this.rendered && this.tooltip[0].offsetWidth > 0 && reposition) {
				this.reposition(options.position.target === 'mouse' ? NULL : this.cache.event);
			}

			return this;
		};
		;PROTOTYPE._update = function (content, element) {
			var self = this,
			    cache = this.cache;

			// Make sure tooltip is rendered and content is defined. If not return
			if (!this.rendered || !content) {
				return FALSE;
			}

			// Use function to parse content
			if ($.isFunction(content)) {
				content = content.call(this.elements.target, cache.event, this) || '';
			}

			// Handle deferred content
			if ($.isFunction(content.then)) {
				cache.waiting = TRUE;
				return content.then(function (c) {
					cache.waiting = FALSE;
					return self._update(c, element);
				}, NULL, function (e) {
					return self._update(e, element);
				});
			}

			// If content is null... return false
			if (content === FALSE || !content && content !== '') {
				return FALSE;
			}

			// Append new content if its a DOM array and show it if hidden
			if (content.jquery && content.length > 0) {
				element.empty().append(content.css({ display: 'block', visibility: 'visible' }));
			}

			// Content is a regular string, insert the new content
			else {
					element.html(content);
				}

			// Wait for content to be loaded, and reposition
			return this._waitForContent(element).then(function (images) {
				if (self.rendered && self.tooltip[0].offsetWidth > 0) {
					self.reposition(cache.event, !images.length);
				}
			});
		};

		PROTOTYPE._waitForContent = function (element) {
			var cache = this.cache;

			// Set flag
			cache.waiting = TRUE;

			// If imagesLoaded is included, ensure images have loaded and return promise
			return ($.fn.imagesLoaded ? element.imagesLoaded() : new $.Deferred().resolve([])).done(function () {
				cache.waiting = FALSE;
			}).promise();
		};

		PROTOTYPE._updateContent = function (content, reposition) {
			this._update(content, this.elements.content, reposition);
		};

		PROTOTYPE._updateTitle = function (content, reposition) {
			if (this._update(content, this.elements.title, reposition) === FALSE) {
				this._removeTitle(FALSE);
			}
		};

		PROTOTYPE._createTitle = function () {
			var elements = this.elements,
			    id = this._id + '-title';

			// Destroy previous title element, if present
			if (elements.titlebar) {
				this._removeTitle();
			}

			// Create title bar and title elements
			elements.titlebar = $('<div />', {
				'class': NAMESPACE + '-titlebar ' + (this.options.style.widget ? createWidgetClass('header') : '')
			}).append(elements.title = $('<div />', {
				'id': id,
				'class': NAMESPACE + '-title',
				'aria-atomic': TRUE
			})).insertBefore(elements.content)

			// Button-specific events
			.delegate('.qtip-close', 'mousedown keydown mouseup keyup mouseout', function (event) {
				$(this).toggleClass('ui-state-active ui-state-focus', event.type.substr(-4) === 'down');
			}).delegate('.qtip-close', 'mouseover mouseout', function (event) {
				$(this).toggleClass('ui-state-hover', event.type === 'mouseover');
			});

			// Create button if enabled
			if (this.options.content.button) {
				this._createButton();
			}
		};

		PROTOTYPE._removeTitle = function (reposition) {
			var elements = this.elements;

			if (elements.title) {
				elements.titlebar.remove();
				elements.titlebar = elements.title = elements.button = NULL;

				// Reposition if enabled
				if (reposition !== FALSE) {
					this.reposition();
				}
			}
		};
		;PROTOTYPE._createPosClass = function (my) {
			return NAMESPACE + '-pos-' + (my || this.options.position.my).abbrev();
		};

		PROTOTYPE.reposition = function (event, effect) {
			if (!this.rendered || this.positioning || this.destroyed) {
				return this;
			}

			// Set positioning flag
			this.positioning = TRUE;

			var cache = this.cache,
			    tooltip = this.tooltip,
			    posOptions = this.options.position,
			    target = posOptions.target,
			    my = posOptions.my,
			    at = posOptions.at,
			    viewport = posOptions.viewport,
			    container = posOptions.container,
			    adjust = posOptions.adjust,
			    method = adjust.method.split(' '),
			    tooltipWidth = tooltip.outerWidth(FALSE),
			    tooltipHeight = tooltip.outerHeight(FALSE),
			    targetWidth = 0,
			    targetHeight = 0,
			    type = tooltip.css('position'),
			    position = { left: 0, top: 0 },
			    visible = tooltip[0].offsetWidth > 0,
			    isScroll = event && event.type === 'scroll',
			    win = $(window),
			    doc = container[0].ownerDocument,
			    mouse = this.mouse,
			    pluginCalculations,
			    offset,
			    adjusted,
			    newClass;

			// Check if absolute position was passed
			if ($.isArray(target) && target.length === 2) {
				// Force left top and set position
				at = { x: LEFT, y: TOP };
				position = { left: target[0], top: target[1] };
			}

			// Check if mouse was the target
			else if (target === 'mouse') {
					// Force left top to allow flipping
					at = { x: LEFT, y: TOP };

					// Use the mouse origin that caused the show event, if distance hiding is enabled
					if ((!adjust.mouse || this.options.hide.distance) && cache.origin && cache.origin.pageX) {
						event = cache.origin;
					}

					// Use cached event for resize/scroll events
					else if (!event || event && (event.type === 'resize' || event.type === 'scroll')) {
							event = cache.event;
						}

						// Otherwise, use the cached mouse coordinates if available
						else if (mouse && mouse.pageX) {
								event = mouse;
							}

					// Calculate body and container offset and take them into account below
					if (type !== 'static') {
						position = container.offset();
					}
					if (doc.body.offsetWidth !== (window.innerWidth || doc.documentElement.clientWidth)) {
						offset = $(document.body).offset();
					}

					// Use event coordinates for position
					position = {
						left: event.pageX - position.left + (offset && offset.left || 0),
						top: event.pageY - position.top + (offset && offset.top || 0)
					};

					// Scroll events are a pain, some browsers
					if (adjust.mouse && isScroll && mouse) {
						position.left -= (mouse.scrollX || 0) - win.scrollLeft();
						position.top -= (mouse.scrollY || 0) - win.scrollTop();
					}
				}

				// Target wasn't mouse or absolute...
				else {
						// Check if event targetting is being used
						if (target === 'event') {
							if (event && event.target && event.type !== 'scroll' && event.type !== 'resize') {
								cache.target = $(event.target);
							} else if (!event.target) {
								cache.target = this.elements.target;
							}
						} else if (target !== 'event') {
							cache.target = $(target.jquery ? target : this.elements.target);
						}
						target = cache.target;

						// Parse the target into a jQuery object and make sure there's an element present
						target = $(target).eq(0);
						if (target.length === 0) {
							return this;
						}

						// Check if window or document is the target
						else if (target[0] === document || target[0] === window) {
								targetWidth = BROWSER.iOS ? window.innerWidth : target.width();
								targetHeight = BROWSER.iOS ? window.innerHeight : target.height();

								if (target[0] === window) {
									position = {
										top: (viewport || target).scrollTop(),
										left: (viewport || target).scrollLeft()
									};
								}
							}

							// Check if the target is an <AREA> element
							else if (PLUGINS.imagemap && target.is('area')) {
									pluginCalculations = PLUGINS.imagemap(this, target, at, PLUGINS.viewport ? method : FALSE);
								}

								// Check if the target is an SVG element
								else if (PLUGINS.svg && target && target[0].ownerSVGElement) {
										pluginCalculations = PLUGINS.svg(this, target, at, PLUGINS.viewport ? method : FALSE);
									}

									// Otherwise use regular jQuery methods
									else {
											targetWidth = target.outerWidth(FALSE);
											targetHeight = target.outerHeight(FALSE);
											position = target.offset();
										}

						// Parse returned plugin values into proper variables
						if (pluginCalculations) {
							targetWidth = pluginCalculations.width;
							targetHeight = pluginCalculations.height;
							offset = pluginCalculations.offset;
							position = pluginCalculations.position;
						}

						// Adjust position to take into account offset parents
						position = this.reposition.offset(target, position, container);

						// Adjust for position.fixed tooltips (and also iOS scroll bug in v3.2-4.0 & v4.3-4.3.2)
						if (BROWSER.iOS > 3.1 && BROWSER.iOS < 4.1 || BROWSER.iOS >= 4.3 && BROWSER.iOS < 4.33 || !BROWSER.iOS && type === 'fixed') {
							position.left -= win.scrollLeft();
							position.top -= win.scrollTop();
						}

						// Adjust position relative to target
						if (!pluginCalculations || pluginCalculations && pluginCalculations.adjustable !== FALSE) {
							position.left += at.x === RIGHT ? targetWidth : at.x === CENTER ? targetWidth / 2 : 0;
							position.top += at.y === BOTTOM ? targetHeight : at.y === CENTER ? targetHeight / 2 : 0;
						}
					}

			// Adjust position relative to tooltip
			position.left += adjust.x + (my.x === RIGHT ? -tooltipWidth : my.x === CENTER ? -tooltipWidth / 2 : 0);
			position.top += adjust.y + (my.y === BOTTOM ? -tooltipHeight : my.y === CENTER ? -tooltipHeight / 2 : 0);

			// Use viewport adjustment plugin if enabled
			if (PLUGINS.viewport) {
				adjusted = position.adjusted = PLUGINS.viewport(this, position, posOptions, targetWidth, targetHeight, tooltipWidth, tooltipHeight);

				// Apply offsets supplied by positioning plugin (if used)
				if (offset && adjusted.left) {
					position.left += offset.left;
				}
				if (offset && adjusted.top) {
					position.top += offset.top;
				}

				// Apply any new 'my' position
				if (adjusted.my) {
					this.position.my = adjusted.my;
				}
			}

			// Viewport adjustment is disabled, set values to zero
			else {
					position.adjusted = { left: 0, top: 0 };
				}

			// Set tooltip position class if it's changed
			if (cache.posClass !== (newClass = this._createPosClass(this.position.my))) {
				cache.posClass = newClass;
				tooltip.removeClass(cache.posClass).addClass(newClass);
			}

			// tooltipmove event
			if (!this._trigger('move', [position, viewport.elem || viewport], event)) {
				return this;
			}
			delete position.adjusted;

			// If effect is disabled, target it mouse, no animation is defined or positioning gives NaN out, set CSS directly
			if (effect === FALSE || !visible || isNaN(position.left) || isNaN(position.top) || target === 'mouse' || !$.isFunction(posOptions.effect)) {
				tooltip.css(position);
			}

			// Use custom function if provided
			else if ($.isFunction(posOptions.effect)) {
					posOptions.effect.call(tooltip, this, $.extend({}, position));
					tooltip.queue(function (next) {
						// Reset attributes to avoid cross-browser rendering bugs
						$(this).css({ opacity: '', height: '' });
						if (BROWSER.ie) {
							this.style.removeAttribute('filter');
						}

						next();
					});
				}

			// Set positioning flag
			this.positioning = FALSE;

			return this;
		};

		// Custom (more correct for qTip!) offset calculator
		PROTOTYPE.reposition.offset = function (elem, pos, container) {
			if (!container[0]) {
				return pos;
			}

			var ownerDocument = $(elem[0].ownerDocument),
			    quirks = !!BROWSER.ie && document.compatMode !== 'CSS1Compat',
			    parent = container[0],
			    scrolled,
			    position,
			    parentOffset,
			    overflow;

			function scroll(e, i) {
				pos.left += i * e.scrollLeft();
				pos.top += i * e.scrollTop();
			}

			// Compensate for non-static containers offset
			do {
				if ((position = $.css(parent, 'position')) !== 'static') {
					if (position === 'fixed') {
						parentOffset = parent.getBoundingClientRect();
						scroll(ownerDocument, -1);
					} else {
						parentOffset = $(parent).position();
						parentOffset.left += parseFloat($.css(parent, 'borderLeftWidth')) || 0;
						parentOffset.top += parseFloat($.css(parent, 'borderTopWidth')) || 0;
					}

					pos.left -= parentOffset.left + (parseFloat($.css(parent, 'marginLeft')) || 0);
					pos.top -= parentOffset.top + (parseFloat($.css(parent, 'marginTop')) || 0);

					// If this is the first parent element with an overflow of "scroll" or "auto", store it
					if (!scrolled && (overflow = $.css(parent, 'overflow')) !== 'hidden' && overflow !== 'visible' && $.prop(parent, 'tagName') !== 'BODY') {
						scrolled = $(parent);
					}
				}
			} while (parent = parent.offsetParent);

			// Compensate for containers scroll if it also has an offsetParent (or in IE quirks mode)
			if (scrolled && (scrolled[0] !== ownerDocument[0] || quirks)) {
				scroll(scrolled, 1);
			}

			return pos;
		};

		// Corner class
		var C = (CORNER = PROTOTYPE.reposition.Corner = function (corner, forceY) {
			corner = ('' + corner).replace(/([A-Z])/, ' $1').replace(/middle/gi, CENTER).toLowerCase();
			this.x = (corner.match(/left|right/i) || corner.match(/center/) || ['inherit'])[0].toLowerCase();
			this.y = (corner.match(/top|bottom|center/i) || ['inherit'])[0].toLowerCase();
			this.forceY = !!forceY;

			var f = corner.charAt(0);
			this.precedance = f === 't' || f === 'b' ? Y : X;
		}).prototype;

		C.invert = function (z, center) {
			this[z] = this[z] === LEFT ? RIGHT : this[z] === RIGHT ? LEFT : center || this[z];
		};

		C.string = function (join) {
			var x = this.x,
			    y = this.y;

			var result = x !== y ? x === 'center' || y !== 'center' && (this.precedance === Y || this.forceY) ? [y, x] : [x, y] : [x];

			return join !== false ? result.join(' ') : result;
		};

		C.abbrev = function () {
			var result = this.string(false);
			return result[0].charAt(0) + (result[1] && result[1].charAt(0) || '');
		};

		C.clone = function () {
			return new CORNER(this.string(), this.forceY);
		};

		;
		PROTOTYPE.toggle = function (state, event) {
			var cache = this.cache,
			    options = this.options,
			    tooltip = this.tooltip;

			// Try to prevent flickering when tooltip overlaps show element
			if (event) {
				if (/over|enter/.test(event.type) && cache.event && /out|leave/.test(cache.event.type) && options.show.target.add(event.target).length === options.show.target.length && tooltip.has(event.relatedTarget).length) {
					return this;
				}

				// Cache event
				cache.event = $.event.fix(event);
			}

			// If we're currently waiting and we've just hidden... stop it
			this.waiting && !state && (this.hiddenDuringWait = TRUE);

			// Render the tooltip if showing and it isn't already
			if (!this.rendered) {
				return state ? this.render(1) : this;
			} else if (this.destroyed || this.disabled) {
				return this;
			}

			var type = state ? 'show' : 'hide',
			    opts = this.options[type],
			    posOptions = this.options.position,
			    contentOptions = this.options.content,
			    width = this.tooltip.css('width'),
			    visible = this.tooltip.is(':visible'),
			    animate = state || opts.target.length === 1,
			    sameTarget = !event || opts.target.length < 2 || cache.target[0] === event.target,
			    identicalState,
			    allow,
			    after;

			// Detect state if valid one isn't provided
			if ((typeof state === 'undefined' ? 'undefined' : _typeof(state)).search('boolean|number')) {
				state = !visible;
			}

			// Check if the tooltip is in an identical state to the new would-be state
			identicalState = !tooltip.is(':animated') && visible === state && sameTarget;

			// Fire tooltip(show/hide) event and check if destroyed
			allow = !identicalState ? !!this._trigger(type, [90]) : NULL;

			// Check to make sure the tooltip wasn't destroyed in the callback
			if (this.destroyed) {
				return this;
			}

			// If the user didn't stop the method prematurely and we're showing the tooltip, focus it
			if (allow !== FALSE && state) {
				this.focus(event);
			}

			// If the state hasn't changed or the user stopped it, return early
			if (!allow || identicalState) {
				return this;
			}

			// Set ARIA hidden attribute
			$.attr(tooltip[0], 'aria-hidden', !!!state);

			// Execute state specific properties
			if (state) {
				// Store show origin coordinates
				this.mouse && (cache.origin = $.event.fix(this.mouse));

				// Update tooltip content & title if it's a dynamic function
				if ($.isFunction(contentOptions.text)) {
					this._updateContent(contentOptions.text, FALSE);
				}
				if ($.isFunction(contentOptions.title)) {
					this._updateTitle(contentOptions.title, FALSE);
				}

				// Cache mousemove events for positioning purposes (if not already tracking)
				if (!trackingBound && posOptions.target === 'mouse' && posOptions.adjust.mouse) {
					$(document).bind('mousemove.' + NAMESPACE, this._storeMouse);
					trackingBound = TRUE;
				}

				// Update the tooltip position (set width first to prevent viewport/max-width issues)
				if (!width) {
					tooltip.css('width', tooltip.outerWidth(FALSE));
				}
				this.reposition(event, arguments[2]);
				if (!width) {
					tooltip.css('width', '');
				}

				// Hide other tooltips if tooltip is solo
				if (!!opts.solo) {
					(typeof opts.solo === 'string' ? $(opts.solo) : $(SELECTOR, opts.solo)).not(tooltip).not(opts.target).qtip('hide', new $.Event('tooltipsolo'));
				}
			} else {
				// Clear show timer if we're hiding
				clearTimeout(this.timers.show);

				// Remove cached origin on hide
				delete cache.origin;

				// Remove mouse tracking event if not needed (all tracking qTips are hidden)
				if (trackingBound && !$(SELECTOR + '[tracking="true"]:visible', opts.solo).not(tooltip).length) {
					$(document).unbind('mousemove.' + NAMESPACE);
					trackingBound = FALSE;
				}

				// Blur the tooltip
				this.blur(event);
			}

			// Define post-animation, state specific properties
			after = $.proxy(function () {
				if (state) {
					// Prevent antialias from disappearing in IE by removing filter
					if (BROWSER.ie) {
						tooltip[0].style.removeAttribute('filter');
					}

					// Remove overflow setting to prevent tip bugs
					tooltip.css('overflow', '');

					// Autofocus elements if enabled
					if ('string' === typeof opts.autofocus) {
						$(this.options.show.autofocus, tooltip).focus();
					}

					// If set, hide tooltip when inactive for delay period
					this.options.show.target.trigger('qtip-' + this.id + '-inactive');
				} else {
					// Reset CSS states
					tooltip.css({
						display: '',
						visibility: '',
						opacity: '',
						left: '',
						top: ''
					});
				}

				// tooltipvisible/tooltiphidden events
				this._trigger(state ? 'visible' : 'hidden');
			}, this);

			// If no effect type is supplied, use a simple toggle
			if (opts.effect === FALSE || animate === FALSE) {
				tooltip[type]();
				after();
			}

			// Use custom function if provided
			else if ($.isFunction(opts.effect)) {
					tooltip.stop(1, 1);
					opts.effect.call(tooltip, this);
					tooltip.queue('fx', function (n) {
						after();n();
					});
				}

				// Use basic fade function by default
				else {
						tooltip.fadeTo(90, state ? 1 : 0, after);
					}

			// If inactive hide method is set, active it
			if (state) {
				opts.target.trigger('qtip-' + this.id + '-inactive');
			}

			return this;
		};

		PROTOTYPE.show = function (event) {
			return this.toggle(TRUE, event);
		};

		PROTOTYPE.hide = function (event) {
			return this.toggle(FALSE, event);
		};
		;PROTOTYPE.focus = function (event) {
			if (!this.rendered || this.destroyed) {
				return this;
			}

			var qtips = $(SELECTOR),
			    tooltip = this.tooltip,
			    curIndex = parseInt(tooltip[0].style.zIndex, 10),
			    newIndex = QTIP.zindex + qtips.length;

			// Only update the z-index if it has changed and tooltip is not already focused
			if (!tooltip.hasClass(CLASS_FOCUS)) {
				// tooltipfocus event
				if (this._trigger('focus', [newIndex], event)) {
					// Only update z-index's if they've changed
					if (curIndex !== newIndex) {
						// Reduce our z-index's and keep them properly ordered
						qtips.each(function () {
							if (this.style.zIndex > curIndex) {
								this.style.zIndex = this.style.zIndex - 1;
							}
						});

						// Fire blur event for focused tooltip
						qtips.filter('.' + CLASS_FOCUS).qtip('blur', event);
					}

					// Set the new z-index
					tooltip.addClass(CLASS_FOCUS)[0].style.zIndex = newIndex;
				}
			}

			return this;
		};

		PROTOTYPE.blur = function (event) {
			if (!this.rendered || this.destroyed) {
				return this;
			}

			// Set focused status to FALSE
			this.tooltip.removeClass(CLASS_FOCUS);

			// tooltipblur event
			this._trigger('blur', [this.tooltip.css('zIndex')], event);

			return this;
		};
		;PROTOTYPE.disable = function (state) {
			if (this.destroyed) {
				return this;
			}

			// If 'toggle' is passed, toggle the current state
			if (state === 'toggle') {
				state = !(this.rendered ? this.tooltip.hasClass(CLASS_DISABLED) : this.disabled);
			}

			// Disable if no state passed
			else if ('boolean' !== typeof state) {
					state = TRUE;
				}

			if (this.rendered) {
				this.tooltip.toggleClass(CLASS_DISABLED, state).attr('aria-disabled', state);
			}

			this.disabled = !!state;

			return this;
		};

		PROTOTYPE.enable = function () {
			return this.disable(FALSE);
		};
		;PROTOTYPE._createButton = function () {
			var self = this,
			    elements = this.elements,
			    tooltip = elements.tooltip,
			    button = this.options.content.button,
			    isString = typeof button === 'string',
			    close = isString ? button : 'Close tooltip';

			if (elements.button) {
				elements.button.remove();
			}

			// Use custom button if one was supplied by user, else use default
			if (button.jquery) {
				elements.button = button;
			} else {
				elements.button = $('<a />', {
					'class': 'qtip-close ' + (this.options.style.widget ? '' : NAMESPACE + '-icon'),
					'title': close,
					'aria-label': close
				}).prepend($('<span />', {
					'class': 'ui-icon ui-icon-close',
					'html': '&times;'
				}));
			}

			// Create button and setup attributes
			elements.button.appendTo(elements.titlebar || tooltip).attr('role', 'button').click(function (event) {
				if (!tooltip.hasClass(CLASS_DISABLED)) {
					self.hide(event);
				}
				return FALSE;
			});
		};

		PROTOTYPE._updateButton = function (button) {
			// Make sure tooltip is rendered and if not, return
			if (!this.rendered) {
				return FALSE;
			}

			var elem = this.elements.button;
			if (button) {
				this._createButton();
			} else {
				elem.remove();
			}
		};
		; // Widget class creator
		function createWidgetClass(cls) {
			return WIDGET.concat('').join(cls ? '-' + cls + ' ' : ' ');
		}

		// Widget class setter method
		PROTOTYPE._setWidget = function () {
			var on = this.options.style.widget,
			    elements = this.elements,
			    tooltip = elements.tooltip,
			    disabled = tooltip.hasClass(CLASS_DISABLED);

			tooltip.removeClass(CLASS_DISABLED);
			CLASS_DISABLED = on ? 'ui-state-disabled' : 'qtip-disabled';
			tooltip.toggleClass(CLASS_DISABLED, disabled);

			tooltip.toggleClass('ui-helper-reset ' + createWidgetClass(), on).toggleClass(CLASS_DEFAULT, this.options.style.def && !on);

			if (elements.content) {
				elements.content.toggleClass(createWidgetClass('content'), on);
			}
			if (elements.titlebar) {
				elements.titlebar.toggleClass(createWidgetClass('header'), on);
			}
			if (elements.button) {
				elements.button.toggleClass(NAMESPACE + '-icon', !on);
			}
		};
		;function delay(callback, duration) {
			// If tooltip has displayed, start hide timer
			if (duration > 0) {
				return setTimeout($.proxy(callback, this), duration);
			} else {
				callback.call(this);
			}
		}

		function showMethod(event) {
			if (this.tooltip.hasClass(CLASS_DISABLED)) {
				return;
			}

			// Clear hide timers
			clearTimeout(this.timers.show);
			clearTimeout(this.timers.hide);

			// Start show timer
			this.timers.show = delay.call(this, function () {
				this.toggle(TRUE, event);
			}, this.options.show.delay);
		}

		function hideMethod(event) {
			if (this.tooltip.hasClass(CLASS_DISABLED) || this.destroyed) {
				return;
			}

			// Check if new target was actually the tooltip element
			var relatedTarget = $(event.relatedTarget),
			    ontoTooltip = relatedTarget.closest(SELECTOR)[0] === this.tooltip[0],
			    ontoTarget = relatedTarget[0] === this.options.show.target[0];

			// Clear timers and stop animation queue
			clearTimeout(this.timers.show);
			clearTimeout(this.timers.hide);

			// Prevent hiding if tooltip is fixed and event target is the tooltip.
			// Or if mouse positioning is enabled and cursor momentarily overlaps
			if (this !== relatedTarget[0] && this.options.position.target === 'mouse' && ontoTooltip || this.options.hide.fixed && /mouse(out|leave|move)/.test(event.type) && (ontoTooltip || ontoTarget)) {
				/* eslint-disable no-empty */
				try {
					event.preventDefault();
					event.stopImmediatePropagation();
				} catch (e) {}
				/* eslint-enable no-empty */

				return;
			}

			// If tooltip has displayed, start hide timer
			this.timers.hide = delay.call(this, function () {
				this.toggle(FALSE, event);
			}, this.options.hide.delay, this);
		}

		function inactiveMethod(event) {
			if (this.tooltip.hasClass(CLASS_DISABLED) || !this.options.hide.inactive) {
				return;
			}

			// Clear timer
			clearTimeout(this.timers.inactive);

			this.timers.inactive = delay.call(this, function () {
				this.hide(event);
			}, this.options.hide.inactive);
		}

		function repositionMethod(event) {
			if (this.rendered && this.tooltip[0].offsetWidth > 0) {
				this.reposition(event);
			}
		}

		// Store mouse coordinates
		PROTOTYPE._storeMouse = function (event) {
			(this.mouse = $.event.fix(event)).type = 'mousemove';
			return this;
		};

		// Bind events
		PROTOTYPE._bind = function (targets, events, method, suffix, context) {
			if (!targets || !method || !events.length) {
				return;
			}
			var ns = '.' + this._id + (suffix ? '-' + suffix : '');
			$(targets).bind((events.split ? events : events.join(ns + ' ')) + ns, $.proxy(method, context || this));
			return this;
		};
		PROTOTYPE._unbind = function (targets, suffix) {
			targets && $(targets).unbind('.' + this._id + (suffix ? '-' + suffix : ''));
			return this;
		};

		// Global delegation helper
		function delegate(selector, events, method) {
			$(document.body).delegate(selector, (events.split ? events : events.join('.' + NAMESPACE + ' ')) + '.' + NAMESPACE, function () {
				var api = QTIP.api[$.attr(this, ATTR_ID)];
				api && !api.disabled && method.apply(api, arguments);
			});
		}
		// Event trigger
		PROTOTYPE._trigger = function (type, args, event) {
			var callback = new $.Event('tooltip' + type);
			callback.originalEvent = event && $.extend({}, event) || this.cache.event || NULL;

			this.triggering = type;
			this.tooltip.trigger(callback, [this].concat(args || []));
			this.triggering = FALSE;

			return !callback.isDefaultPrevented();
		};

		PROTOTYPE._bindEvents = function (showEvents, hideEvents, showTargets, hideTargets, showCallback, hideCallback) {
			// Get tasrgets that lye within both
			var similarTargets = showTargets.filter(hideTargets).add(hideTargets.filter(showTargets)),
			    toggleEvents = [];

			// If hide and show targets are the same...
			if (similarTargets.length) {

				// Filter identical show/hide events
				$.each(hideEvents, function (i, type) {
					var showIndex = $.inArray(type, showEvents);

					// Both events are identical, remove from both hide and show events
					// and append to toggleEvents
					showIndex > -1 && toggleEvents.push(showEvents.splice(showIndex, 1)[0]);
				});

				// Toggle events are special case of identical show/hide events, which happen in sequence
				if (toggleEvents.length) {
					// Bind toggle events to the similar targets
					this._bind(similarTargets, toggleEvents, function (event) {
						var state = this.rendered ? this.tooltip[0].offsetWidth > 0 : false;
						(state ? hideCallback : showCallback).call(this, event);
					});

					// Remove the similar targets from the regular show/hide bindings
					showTargets = showTargets.not(similarTargets);
					hideTargets = hideTargets.not(similarTargets);
				}
			}

			// Apply show/hide/toggle events
			this._bind(showTargets, showEvents, showCallback);
			this._bind(hideTargets, hideEvents, hideCallback);
		};

		PROTOTYPE._assignInitialEvents = function (event) {
			var options = this.options,
			    showTarget = options.show.target,
			    hideTarget = options.hide.target,
			    showEvents = options.show.event ? $.trim('' + options.show.event).split(' ') : [],
			    hideEvents = options.hide.event ? $.trim('' + options.hide.event).split(' ') : [];

			// Catch remove/removeqtip events on target element to destroy redundant tooltips
			this._bind(this.elements.target, ['remove', 'removeqtip'], function () {
				this.destroy(true);
			}, 'destroy');

			/*
    * Make sure hoverIntent functions properly by using mouseleave as a hide event if
    * mouseenter/mouseout is used for show.event, even if it isn't in the users options.
    */
			if (/mouse(over|enter)/i.test(options.show.event) && !/mouse(out|leave)/i.test(options.hide.event)) {
				hideEvents.push('mouseleave');
			}

			/*
    * Also make sure initial mouse targetting works correctly by caching mousemove coords
    * on show targets before the tooltip has rendered. Also set onTarget when triggered to
    * keep mouse tracking working.
    */
			this._bind(showTarget, 'mousemove', function (moveEvent) {
				this._storeMouse(moveEvent);
				this.cache.onTarget = TRUE;
			});

			// Define hoverIntent function
			function hoverIntent(hoverEvent) {
				// Only continue if tooltip isn't disabled
				if (this.disabled || this.destroyed) {
					return FALSE;
				}

				// Cache the event data
				this.cache.event = hoverEvent && $.event.fix(hoverEvent);
				this.cache.target = hoverEvent && $(hoverEvent.target);

				// Start the event sequence
				clearTimeout(this.timers.show);
				this.timers.show = delay.call(this, function () {
					this.render((typeof hoverEvent === 'undefined' ? 'undefined' : _typeof(hoverEvent)) === 'object' || options.show.ready);
				}, options.prerender ? 0 : options.show.delay);
			}

			// Filter and bind events
			this._bindEvents(showEvents, hideEvents, showTarget, hideTarget, hoverIntent, function () {
				if (!this.timers) {
					return FALSE;
				}
				clearTimeout(this.timers.show);
			});

			// Prerendering is enabled, create tooltip now
			if (options.show.ready || options.prerender) {
				hoverIntent.call(this, event);
			}
		};

		// Event assignment method
		PROTOTYPE._assignEvents = function () {
			var self = this,
			    options = this.options,
			    posOptions = options.position,
			    tooltip = this.tooltip,
			    showTarget = options.show.target,
			    hideTarget = options.hide.target,
			    containerTarget = posOptions.container,
			    viewportTarget = posOptions.viewport,
			    documentTarget = $(document),
			    windowTarget = $(window),
			    showEvents = options.show.event ? $.trim('' + options.show.event).split(' ') : [],
			    hideEvents = options.hide.event ? $.trim('' + options.hide.event).split(' ') : [];

			// Assign passed event callbacks
			$.each(options.events, function (name, callback) {
				self._bind(tooltip, name === 'toggle' ? ['tooltipshow', 'tooltiphide'] : ['tooltip' + name], callback, null, tooltip);
			});

			// Hide tooltips when leaving current window/frame (but not select/option elements)
			if (/mouse(out|leave)/i.test(options.hide.event) && options.hide.leave === 'window') {
				this._bind(documentTarget, ['mouseout', 'blur'], function (event) {
					if (!/select|option/.test(event.target.nodeName) && !event.relatedTarget) {
						this.hide(event);
					}
				});
			}

			// Enable hide.fixed by adding appropriate class
			if (options.hide.fixed) {
				hideTarget = hideTarget.add(tooltip.addClass(CLASS_FIXED));
			}

			/*
    * Make sure hoverIntent functions properly by using mouseleave to clear show timer if
    * mouseenter/mouseout is used for show.event, even if it isn't in the users options.
    */
			else if (/mouse(over|enter)/i.test(options.show.event)) {
					this._bind(hideTarget, 'mouseleave', function () {
						clearTimeout(this.timers.show);
					});
				}

			// Hide tooltip on document mousedown if unfocus events are enabled
			if (('' + options.hide.event).indexOf('unfocus') > -1) {
				this._bind(containerTarget.closest('html'), ['mousedown', 'touchstart'], function (event) {
					var elem = $(event.target),
					    enabled = this.rendered && !this.tooltip.hasClass(CLASS_DISABLED) && this.tooltip[0].offsetWidth > 0,
					    isAncestor = elem.parents(SELECTOR).filter(this.tooltip[0]).length > 0;

					if (elem[0] !== this.target[0] && elem[0] !== this.tooltip[0] && !isAncestor && !this.target.has(elem[0]).length && enabled) {
						this.hide(event);
					}
				});
			}

			// Check if the tooltip hides when inactive
			if ('number' === typeof options.hide.inactive) {
				// Bind inactive method to show target(s) as a custom event
				this._bind(showTarget, 'qtip-' + this.id + '-inactive', inactiveMethod, 'inactive');

				// Define events which reset the 'inactive' event handler
				this._bind(hideTarget.add(tooltip), QTIP.inactiveEvents, inactiveMethod);
			}

			// Filter and bind events
			this._bindEvents(showEvents, hideEvents, showTarget, hideTarget, showMethod, hideMethod);

			// Mouse movement bindings
			this._bind(showTarget.add(tooltip), 'mousemove', function (event) {
				// Check if the tooltip hides when mouse is moved a certain distance
				if ('number' === typeof options.hide.distance) {
					var origin = this.cache.origin || {},
					    limit = this.options.hide.distance,
					    abs = Math.abs;

					// Check if the movement has gone beyond the limit, and hide it if so
					if (abs(event.pageX - origin.pageX) >= limit || abs(event.pageY - origin.pageY) >= limit) {
						this.hide(event);
					}
				}

				// Cache mousemove coords on show targets
				this._storeMouse(event);
			});

			// Mouse positioning events
			if (posOptions.target === 'mouse') {
				// If mouse adjustment is on...
				if (posOptions.adjust.mouse) {
					// Apply a mouseleave event so we don't get problems with overlapping
					if (options.hide.event) {
						// Track if we're on the target or not
						this._bind(showTarget, ['mouseenter', 'mouseleave'], function (event) {
							if (!this.cache) {
								return FALSE;
							}
							this.cache.onTarget = event.type === 'mouseenter';
						});
					}

					// Update tooltip position on mousemove
					this._bind(documentTarget, 'mousemove', function (event) {
						// Update the tooltip position only if the tooltip is visible and adjustment is enabled
						if (this.rendered && this.cache.onTarget && !this.tooltip.hasClass(CLASS_DISABLED) && this.tooltip[0].offsetWidth > 0) {
							this.reposition(event);
						}
					});
				}
			}

			// Adjust positions of the tooltip on window resize if enabled
			if (posOptions.adjust.resize || viewportTarget.length) {
				this._bind($.event.special.resize ? viewportTarget : windowTarget, 'resize', repositionMethod);
			}

			// Adjust tooltip position on scroll of the window or viewport element if present
			if (posOptions.adjust.scroll) {
				this._bind(windowTarget.add(posOptions.container), 'scroll', repositionMethod);
			}
		};

		// Un-assignment method
		PROTOTYPE._unassignEvents = function () {
			var options = this.options,
			    showTargets = options.show.target,
			    hideTargets = options.hide.target,
			    targets = $.grep([this.elements.target[0], this.rendered && this.tooltip[0], options.position.container[0], options.position.viewport[0], options.position.container.closest('html')[0], // unfocus
			window, document], function (i) {
				return (typeof i === 'undefined' ? 'undefined' : _typeof(i)) === 'object';
			});

			// Add show and hide targets if they're valid
			if (showTargets && showTargets.toArray) {
				targets = targets.concat(showTargets.toArray());
			}
			if (hideTargets && hideTargets.toArray) {
				targets = targets.concat(hideTargets.toArray());
			}

			// Unbind the events
			this._unbind(targets)._unbind(targets, 'destroy')._unbind(targets, 'inactive');
		};

		// Apply common event handlers using delegate (avoids excessive .bind calls!)
		$(function () {
			delegate(SELECTOR, ['mouseenter', 'mouseleave'], function (event) {
				var state = event.type === 'mouseenter',
				    tooltip = $(event.currentTarget),
				    target = $(event.relatedTarget || event.target),
				    options = this.options;

				// On mouseenter...
				if (state) {
					// Focus the tooltip on mouseenter (z-index stacking)
					this.focus(event);

					// Clear hide timer on tooltip hover to prevent it from closing
					tooltip.hasClass(CLASS_FIXED) && !tooltip.hasClass(CLASS_DISABLED) && clearTimeout(this.timers.hide);
				}

				// On mouseleave...
				else {
						// When mouse tracking is enabled, hide when we leave the tooltip and not onto the show target (if a hide event is set)
						if (options.position.target === 'mouse' && options.position.adjust.mouse && options.hide.event && options.show.target && !target.closest(options.show.target[0]).length) {
							this.hide(event);
						}
					}

				// Add hover class
				tooltip.toggleClass(CLASS_HOVER, state);
			});

			// Define events which reset the 'inactive' event handler
			delegate('[' + ATTR_ID + ']', INACTIVE_EVENTS, inactiveMethod);
		});
		; // Initialization method
		function init(elem, id, opts) {
			var obj,
			    posOptions,
			    attr,
			    config,
			    title,


			// Setup element references
			docBody = $(document.body),


			// Use document body instead of document element if needed
			newTarget = elem[0] === document ? docBody : elem,


			// Grab metadata from element if plugin is present
			metadata = elem.metadata ? elem.metadata(opts.metadata) : NULL,


			// If metadata type if HTML5, grab 'name' from the object instead, or use the regular data object otherwise
			metadata5 = opts.metadata.type === 'html5' && metadata ? metadata[opts.metadata.name] : NULL,


			// Grab data from metadata.name (or data-qtipopts as fallback) using .data() method,
			html5 = elem.data(opts.metadata.name || 'qtipopts');

			// If we don't get an object returned attempt to parse it manualyl without parseJSON
			/* eslint-disable no-empty */
			try {
				html5 = typeof html5 === 'string' ? $.parseJSON(html5) : html5;
			} catch (e) {}
			/* eslint-enable no-empty */

			// Merge in and sanitize metadata
			config = $.extend(TRUE, {}, QTIP.defaults, opts, (typeof html5 === 'undefined' ? 'undefined' : _typeof(html5)) === 'object' ? sanitizeOptions(html5) : NULL, sanitizeOptions(metadata5 || metadata));

			// Re-grab our positioning options now we've merged our metadata and set id to passed value
			posOptions = config.position;
			config.id = id;

			// Setup missing content if none is detected
			if ('boolean' === typeof config.content.text) {
				attr = elem.attr(config.content.attr);

				// Grab from supplied attribute if available
				if (config.content.attr !== FALSE && attr) {
					config.content.text = attr;
				}

				// No valid content was found, abort render
				else {
						return FALSE;
					}
			}

			// Setup target options
			if (!posOptions.container.length) {
				posOptions.container = docBody;
			}
			if (posOptions.target === FALSE) {
				posOptions.target = newTarget;
			}
			if (config.show.target === FALSE) {
				config.show.target = newTarget;
			}
			if (config.show.solo === TRUE) {
				config.show.solo = posOptions.container.closest('body');
			}
			if (config.hide.target === FALSE) {
				config.hide.target = newTarget;
			}
			if (config.position.viewport === TRUE) {
				config.position.viewport = posOptions.container;
			}

			// Ensure we only use a single container
			posOptions.container = posOptions.container.eq(0);

			// Convert position corner values into x and y strings
			posOptions.at = new CORNER(posOptions.at, TRUE);
			posOptions.my = new CORNER(posOptions.my);

			// Destroy previous tooltip if overwrite is enabled, or skip element if not
			if (elem.data(NAMESPACE)) {
				if (config.overwrite) {
					elem.qtip('destroy', true);
				} else if (config.overwrite === FALSE) {
					return FALSE;
				}
			}

			// Add has-qtip attribute
			elem.attr(ATTR_HAS, id);

			// Remove title attribute and store it if present
			if (config.suppress && (title = elem.attr('title'))) {
				// Final attr call fixes event delegation and IE default tooltip showing problem
				elem.removeAttr('title').attr(oldtitle, title).attr('title', '');
			}

			// Initialize the tooltip and add API reference
			obj = new QTip(elem, config, id, !!attr);
			elem.data(NAMESPACE, obj);

			return obj;
		}

		// jQuery $.fn extension method
		QTIP = $.fn.qtip = function (options, notation, newValue) {
			var command = ('' + options).toLowerCase(),
			    // Parse command
			returned = NULL,
			    args = $.makeArray(arguments).slice(1),
			    event = args[args.length - 1],
			    opts = this[0] ? $.data(this[0], NAMESPACE) : NULL;

			// Check for API request
			if (!arguments.length && opts || command === 'api') {
				return opts;
			}

			// Execute API command if present
			else if ('string' === typeof options) {
					this.each(function () {
						var api = $.data(this, NAMESPACE);
						if (!api) {
							return TRUE;
						}

						// Cache the event if possible
						if (event && event.timeStamp) {
							api.cache.event = event;
						}

						// Check for specific API commands
						if (notation && (command === 'option' || command === 'options')) {
							if (newValue !== undefined || $.isPlainObject(notation)) {
								api.set(notation, newValue);
							} else {
								returned = api.get(notation);
								return FALSE;
							}
						}

						// Execute API command
						else if (api[command]) {
								api[command].apply(api, args);
							}
					});

					return returned !== NULL ? returned : this;
				}

				// No API commands. validate provided options and setup qTips
				else if ('object' === (typeof options === 'undefined' ? 'undefined' : _typeof(options)) || !arguments.length) {
						// Sanitize options first
						opts = sanitizeOptions($.extend(TRUE, {}, options));

						return this.each(function (i) {
							var api, id;

							// Find next available ID, or use custom ID if provided
							id = $.isArray(opts.id) ? opts.id[i] : opts.id;
							id = !id || id === FALSE || id.length < 1 || QTIP.api[id] ? QTIP.nextid++ : id;

							// Initialize the qTip and re-grab newly sanitized options
							api = init($(this), id, opts);
							if (api === FALSE) {
								return TRUE;
							} else {
								QTIP.api[id] = api;
							}

							// Initialize plugins
							$.each(PLUGINS, function () {
								if (this.initialize === 'initialize') {
									this(api);
								}
							});

							// Assign initial pre-render events
							api._assignInitialEvents(event);
						});
					}
		};

		// Expose class
		$.qtip = QTip;

		// Populated in render method
		QTIP.api = {};
		;$.each({
			/* Allow other plugins to successfully retrieve the title of an element with a qTip applied */
			attr: function attr(_attr, val) {
				if (this.length) {
					var self = this[0],
					    title = 'title',
					    api = $.data(self, 'qtip');

					if (_attr === title && api && api.options && 'object' === (typeof api === 'undefined' ? 'undefined' : _typeof(api)) && 'object' === _typeof(api.options) && api.options.suppress) {
						if (arguments.length < 2) {
							return $.attr(self, oldtitle);
						}

						// If qTip is rendered and title was originally used as content, update it
						if (api && api.options.content.attr === title && api.cache.attr) {
							api.set('content.text', val);
						}

						// Use the regular attr method to set, then cache the result
						return this.attr(oldtitle, val);
					}
				}

				return $.fn['attr' + replaceSuffix].apply(this, arguments);
			},

			/* Allow clone to correctly retrieve cached title attributes */
			clone: function clone(keepData) {
				// Clone our element using the real clone method
				var elems = $.fn['clone' + replaceSuffix].apply(this, arguments);

				// Grab all elements with an oldtitle set, and change it to regular title attribute, if keepData is false
				if (!keepData) {
					elems.filter('[' + oldtitle + ']').attr('title', function () {
						return $.attr(this, oldtitle);
					}).removeAttr(oldtitle);
				}

				return elems;
			}
		}, function (name, func) {
			if (!func || $.fn[name + replaceSuffix]) {
				return TRUE;
			}

			var old = $.fn[name + replaceSuffix] = $.fn[name];
			$.fn[name] = function () {
				return func.apply(this, arguments) || old.apply(this, arguments);
			};
		});

		/* Fire off 'removeqtip' handler in $.cleanData if jQuery UI not present (it already does similar).
   * This snippet is taken directly from jQuery UI source code found here:
   *     http://code.jquery.com/ui/jquery-ui-git.js
   */
		if (!$.ui) {
			$['cleanData' + replaceSuffix] = $.cleanData;
			$.cleanData = function (elems) {
				for (var i = 0, elem; (elem = $(elems[i])).length; i++) {
					if (elem.attr(ATTR_HAS)) {
						/* eslint-disable no-empty */
						try {
							elem.triggerHandler('removeqtip');
						} catch (e) {}
						/* eslint-enable no-empty */
					}
				}
				$['cleanData' + replaceSuffix].apply(this, arguments);
			};
		}
		; // qTip version
		QTIP.version = '3.0.3-5-g';

		// Base ID for all qTips
		QTIP.nextid = 0;

		// Inactive events array
		QTIP.inactiveEvents = INACTIVE_EVENTS;

		// Base z-index for all qTips
		QTIP.zindex = 15000;

		// Define configuration defaults
		QTIP.defaults = {
			prerender: FALSE,
			id: FALSE,
			overwrite: TRUE,
			suppress: TRUE,
			content: {
				text: TRUE,
				attr: 'title',
				title: FALSE,
				button: FALSE
			},
			position: {
				my: 'top left',
				at: 'bottom right',
				target: FALSE,
				container: FALSE,
				viewport: FALSE,
				adjust: {
					x: 0, y: 0,
					mouse: TRUE,
					scroll: TRUE,
					resize: TRUE,
					method: 'flipinvert flipinvert'
				},
				effect: function effect(api, pos) {
					$(this).animate(pos, {
						duration: 200,
						queue: FALSE
					});
				}
			},
			show: {
				target: FALSE,
				event: 'mouseenter',
				effect: TRUE,
				delay: 90,
				solo: FALSE,
				ready: FALSE,
				autofocus: FALSE
			},
			hide: {
				target: FALSE,
				event: 'mouseleave',
				effect: TRUE,
				delay: 0,
				fixed: FALSE,
				inactive: FALSE,
				leave: 'window',
				distance: FALSE
			},
			style: {
				classes: '',
				widget: FALSE,
				width: FALSE,
				height: FALSE,
				def: TRUE
			},
			events: {
				render: NULL,
				move: NULL,
				show: NULL,
				hide: NULL,
				toggle: NULL,
				visible: NULL,
				hidden: NULL,
				focus: NULL,
				blur: NULL
			}
		};
		;var TIP,
		    createVML,
		    SCALE,
		    PIXEL_RATIO,
		    BACKING_STORE_RATIO,


		// Common CSS strings
		MARGIN = 'margin',
		    BORDER = 'border',
		    COLOR = 'color',
		    BG_COLOR = 'background-color',
		    TRANSPARENT = 'transparent',
		    IMPORTANT = ' !important',


		// Check if the browser supports <canvas/> elements
		HASCANVAS = !!document.createElement('canvas').getContext,


		// Invalid colour values used in parseColours()
		INVALID = /rgba?\(0, 0, 0(, 0)?\)|transparent|#123456/i;

		// Camel-case method, taken from jQuery source
		// http://code.jquery.com/jquery-1.8.0.js
		function camel(s) {
			return s.charAt(0).toUpperCase() + s.slice(1);
		}

		/*
   * Modified from Modernizr's testPropsAll()
   * http://modernizr.com/downloads/modernizr-latest.js
   */
		var cssProps = {},
		    cssPrefixes = ['Webkit', 'O', 'Moz', 'ms'];
		function vendorCss(elem, prop) {
			var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
			    props = (prop + ' ' + cssPrefixes.join(ucProp + ' ') + ucProp).split(' '),
			    cur,
			    val,
			    i = 0;

			// If the property has already been mapped...
			if (cssProps[prop]) {
				return elem.css(cssProps[prop]);
			}

			while (cur = props[i++]) {
				if ((val = elem.css(cur)) !== undefined) {
					cssProps[prop] = cur;
					return val;
				}
			}
		}

		// Parse a given elements CSS property into an int
		function intCss(elem, prop) {
			return Math.ceil(parseFloat(vendorCss(elem, prop)));
		}

		// VML creation (for IE only)
		if (!HASCANVAS) {
			createVML = function createVML(tag, props, style) {
				return '<qtipvml:' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="qtip-vml" ' + (props || '') + ' style="behavior: url(#default#VML); ' + (style || '') + '" />';
			};
		}

		// Canvas only definitions
		else {
				PIXEL_RATIO = window.devicePixelRatio || 1;
				BACKING_STORE_RATIO = function () {
					var context = document.createElement('canvas').getContext('2d');
					return context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || 1;
				}();
				SCALE = PIXEL_RATIO / BACKING_STORE_RATIO;
			}

		function Tip(qtip, options) {
			this._ns = 'tip';
			this.options = options;
			this.offset = options.offset;
			this.size = [options.width, options.height];

			// Initialize
			this.qtip = qtip;
			this.init(qtip);
		}

		$.extend(Tip.prototype, {
			init: function init(qtip) {
				var context, tip;

				// Create tip element and prepend to the tooltip
				tip = this.element = qtip.elements.tip = $('<div />', { 'class': NAMESPACE + '-tip' }).prependTo(qtip.tooltip);

				// Create tip drawing element(s)
				if (HASCANVAS) {
					// save() as soon as we create the canvas element so FF2 doesn't bork on our first restore()!
					context = $('<canvas />').appendTo(this.element)[0].getContext('2d');

					// Setup constant parameters
					context.lineJoin = 'miter';
					context.miterLimit = 100000;
					context.save();
				} else {
					context = createVML('shape', 'coordorigin="0,0"', 'position:absolute;');
					this.element.html(context + context);

					// Prevent mousing down on the tip since it causes problems with .live() handling in IE due to VML
					qtip._bind($('*', tip).add(tip), ['click', 'mousedown'], function (event) {
						event.stopPropagation();
					}, this._ns);
				}

				// Bind update events
				qtip._bind(qtip.tooltip, 'tooltipmove', this.reposition, this._ns, this);

				// Create it
				this.create();
			},

			_swapDimensions: function _swapDimensions() {
				this.size[0] = this.options.height;
				this.size[1] = this.options.width;
			},
			_resetDimensions: function _resetDimensions() {
				this.size[0] = this.options.width;
				this.size[1] = this.options.height;
			},

			_useTitle: function _useTitle(corner) {
				var titlebar = this.qtip.elements.titlebar;
				return titlebar && (corner.y === TOP || corner.y === CENTER && this.element.position().top + this.size[1] / 2 + this.options.offset < titlebar.outerHeight(TRUE));
			},

			_parseCorner: function _parseCorner(corner) {
				var my = this.qtip.options.position.my;

				// Detect corner and mimic properties
				if (corner === FALSE || my === FALSE) {
					corner = FALSE;
				} else if (corner === TRUE) {
					corner = new CORNER(my.string());
				} else if (!corner.string) {
					corner = new CORNER(corner);
					corner.fixed = TRUE;
				}

				return corner;
			},

			_parseWidth: function _parseWidth(corner, side, use) {
				var elements = this.qtip.elements,
				    prop = BORDER + camel(side) + 'Width';

				return (use ? intCss(use, prop) : intCss(elements.content, prop) || intCss(this._useTitle(corner) && elements.titlebar || elements.content, prop) || intCss(elements.tooltip, prop)) || 0;
			},

			_parseRadius: function _parseRadius(corner) {
				var elements = this.qtip.elements,
				    prop = BORDER + camel(corner.y) + camel(corner.x) + 'Radius';

				return BROWSER.ie < 9 ? 0 : intCss(this._useTitle(corner) && elements.titlebar || elements.content, prop) || intCss(elements.tooltip, prop) || 0;
			},

			_invalidColour: function _invalidColour(elem, prop, compare) {
				var val = elem.css(prop);
				return !val || compare && val === elem.css(compare) || INVALID.test(val) ? FALSE : val;
			},

			_parseColours: function _parseColours(corner) {
				var elements = this.qtip.elements,
				    tip = this.element.css('cssText', ''),
				    borderSide = BORDER + camel(corner[corner.precedance]) + camel(COLOR),
				    colorElem = this._useTitle(corner) && elements.titlebar || elements.content,
				    css = this._invalidColour,
				    color = [];

				// Attempt to detect the background colour from various elements, left-to-right precedance
				color[0] = css(tip, BG_COLOR) || css(colorElem, BG_COLOR) || css(elements.content, BG_COLOR) || css(elements.tooltip, BG_COLOR) || tip.css(BG_COLOR);

				// Attempt to detect the correct border side colour from various elements, left-to-right precedance
				color[1] = css(tip, borderSide, COLOR) || css(colorElem, borderSide, COLOR) || css(elements.content, borderSide, COLOR) || css(elements.tooltip, borderSide, COLOR) || elements.tooltip.css(borderSide);

				// Reset background and border colours
				$('*', tip).add(tip).css('cssText', BG_COLOR + ':' + TRANSPARENT + IMPORTANT + ';' + BORDER + ':0' + IMPORTANT + ';');

				return color;
			},

			_calculateSize: function _calculateSize(corner) {
				var y = corner.precedance === Y,
				    width = this.options.width,
				    height = this.options.height,
				    isCenter = corner.abbrev() === 'c',
				    base = (y ? width : height) * (isCenter ? 0.5 : 1),
				    pow = Math.pow,
				    round = Math.round,
				    bigHyp,
				    ratio,
				    result,
				    smallHyp = Math.sqrt(pow(base, 2) + pow(height, 2)),
				    hyp = [this.border / base * smallHyp, this.border / height * smallHyp];

				hyp[2] = Math.sqrt(pow(hyp[0], 2) - pow(this.border, 2));
				hyp[3] = Math.sqrt(pow(hyp[1], 2) - pow(this.border, 2));

				bigHyp = smallHyp + hyp[2] + hyp[3] + (isCenter ? 0 : hyp[0]);
				ratio = bigHyp / smallHyp;

				result = [round(ratio * width), round(ratio * height)];
				return y ? result : result.reverse();
			},

			// Tip coordinates calculator
			_calculateTip: function _calculateTip(corner, size, scale) {
				scale = scale || 1;
				size = size || this.size;

				var width = size[0] * scale,
				    height = size[1] * scale,
				    width2 = Math.ceil(width / 2),
				    height2 = Math.ceil(height / 2),


				// Define tip coordinates in terms of height and width values
				tips = {
					br: [0, 0, width, height, width, 0],
					bl: [0, 0, width, 0, 0, height],
					tr: [0, height, width, 0, width, height],
					tl: [0, 0, 0, height, width, height],
					tc: [0, height, width2, 0, width, height],
					bc: [0, 0, width, 0, width2, height],
					rc: [0, 0, width, height2, 0, height],
					lc: [width, 0, width, height, 0, height2]
				};

				// Set common side shapes
				tips.lt = tips.br;tips.rt = tips.bl;
				tips.lb = tips.tr;tips.rb = tips.tl;

				return tips[corner.abbrev()];
			},

			// Tip coordinates drawer (canvas)
			_drawCoords: function _drawCoords(context, coords) {
				context.beginPath();
				context.moveTo(coords[0], coords[1]);
				context.lineTo(coords[2], coords[3]);
				context.lineTo(coords[4], coords[5]);
				context.closePath();
			},

			create: function create() {
				// Determine tip corner
				var c = this.corner = (HASCANVAS || BROWSER.ie) && this._parseCorner(this.options.corner);

				// If we have a tip corner...
				this.enabled = !!this.corner && this.corner.abbrev() !== 'c';
				if (this.enabled) {
					// Cache it
					this.qtip.cache.corner = c.clone();

					// Create it
					this.update();
				}

				// Toggle tip element
				this.element.toggle(this.enabled);

				return this.corner;
			},

			update: function update(corner, position) {
				if (!this.enabled) {
					return this;
				}

				var elements = this.qtip.elements,
				    tip = this.element,
				    inner = tip.children(),
				    options = this.options,
				    curSize = this.size,
				    mimic = options.mimic,
				    round = Math.round,
				    color,
				    precedance,
				    context,
				    coords,
				    bigCoords,
				    translate,
				    newSize,
				    border;

				// Re-determine tip if not already set
				if (!corner) {
					corner = this.qtip.cache.corner || this.corner;
				}

				// Use corner property if we detect an invalid mimic value
				if (mimic === FALSE) {
					mimic = corner;
				}

				// Otherwise inherit mimic properties from the corner object as necessary
				else {
						mimic = new CORNER(mimic);
						mimic.precedance = corner.precedance;

						if (mimic.x === 'inherit') {
							mimic.x = corner.x;
						} else if (mimic.y === 'inherit') {
							mimic.y = corner.y;
						} else if (mimic.x === mimic.y) {
							mimic[corner.precedance] = corner[corner.precedance];
						}
					}
				precedance = mimic.precedance;

				// Ensure the tip width.height are relative to the tip position
				if (corner.precedance === X) {
					this._swapDimensions();
				} else {
					this._resetDimensions();
				}

				// Update our colours
				color = this.color = this._parseColours(corner);

				// Detect border width, taking into account colours
				if (color[1] !== TRANSPARENT) {
					// Grab border width
					border = this.border = this._parseWidth(corner, corner[corner.precedance]);

					// If border width isn't zero, use border color as fill if it's not invalid (1.0 style tips)
					if (options.border && border < 1 && !INVALID.test(color[1])) {
						color[0] = color[1];
					}

					// Set border width (use detected border width if options.border is true)
					this.border = border = options.border !== TRUE ? options.border : border;
				}

				// Border colour was invalid, set border to zero
				else {
						this.border = border = 0;
					}

				// Determine tip size
				newSize = this.size = this._calculateSize(corner);
				tip.css({
					width: newSize[0],
					height: newSize[1],
					lineHeight: newSize[1] + 'px'
				});

				// Calculate tip translation
				if (corner.precedance === Y) {
					translate = [round(mimic.x === LEFT ? border : mimic.x === RIGHT ? newSize[0] - curSize[0] - border : (newSize[0] - curSize[0]) / 2), round(mimic.y === TOP ? newSize[1] - curSize[1] : 0)];
				} else {
					translate = [round(mimic.x === LEFT ? newSize[0] - curSize[0] : 0), round(mimic.y === TOP ? border : mimic.y === BOTTOM ? newSize[1] - curSize[1] - border : (newSize[1] - curSize[1]) / 2)];
				}

				// Canvas drawing implementation
				if (HASCANVAS) {
					// Grab canvas context and clear/save it
					context = inner[0].getContext('2d');
					context.restore();context.save();
					context.clearRect(0, 0, 6000, 6000);

					// Calculate coordinates
					coords = this._calculateTip(mimic, curSize, SCALE);
					bigCoords = this._calculateTip(mimic, this.size, SCALE);

					// Set the canvas size using calculated size
					inner.attr(WIDTH, newSize[0] * SCALE).attr(HEIGHT, newSize[1] * SCALE);
					inner.css(WIDTH, newSize[0]).css(HEIGHT, newSize[1]);

					// Draw the outer-stroke tip
					this._drawCoords(context, bigCoords);
					context.fillStyle = color[1];
					context.fill();

					// Draw the actual tip
					context.translate(translate[0] * SCALE, translate[1] * SCALE);
					this._drawCoords(context, coords);
					context.fillStyle = color[0];
					context.fill();
				}

				// VML (IE Proprietary implementation)
				else {
						// Calculate coordinates
						coords = this._calculateTip(mimic);

						// Setup coordinates string
						coords = 'm' + coords[0] + ',' + coords[1] + ' l' + coords[2] + ',' + coords[3] + ' ' + coords[4] + ',' + coords[5] + ' xe';

						// Setup VML-specific offset for pixel-perfection
						translate[2] = border && /^(r|b)/i.test(corner.string()) ? BROWSER.ie === 8 ? 2 : 1 : 0;

						// Set initial CSS
						inner.css({
							coordsize: newSize[0] + border + ' ' + newSize[1] + border,
							antialias: '' + (mimic.string().indexOf(CENTER) > -1),
							left: translate[0] - translate[2] * Number(precedance === X),
							top: translate[1] - translate[2] * Number(precedance === Y),
							width: newSize[0] + border,
							height: newSize[1] + border
						}).each(function (i) {
							var $this = $(this);

							// Set shape specific attributes
							$this[$this.prop ? 'prop' : 'attr']({
								coordsize: newSize[0] + border + ' ' + newSize[1] + border,
								path: coords,
								fillcolor: color[0],
								filled: !!i,
								stroked: !i
							}).toggle(!!(border || i));

							// Check if border is enabled and add stroke element
							!i && $this.html(createVML('stroke', 'weight="' + border * 2 + 'px" color="' + color[1] + '" miterlimit="1000" joinstyle="miter"'));
						});
					}

				// Opera bug #357 - Incorrect tip position
				// https://github.com/Craga89/qTip2/issues/367
				window.opera && setTimeout(function () {
					elements.tip.css({
						display: 'inline-block',
						visibility: 'visible'
					});
				}, 1);

				// Position if needed
				if (position !== FALSE) {
					this.calculate(corner, newSize);
				}
			},

			calculate: function calculate(corner, size) {
				if (!this.enabled) {
					return FALSE;
				}

				var self = this,
				    elements = this.qtip.elements,
				    tip = this.element,
				    userOffset = this.options.offset,
				    position = {},
				    precedance,
				    corners;

				// Inherit corner if not provided
				corner = corner || this.corner;
				precedance = corner.precedance;

				// Determine which tip dimension to use for adjustment
				size = size || this._calculateSize(corner);

				// Setup corners and offset array
				corners = [corner.x, corner.y];
				if (precedance === X) {
					corners.reverse();
				}

				// Calculate tip position
				$.each(corners, function (i, side) {
					var b, bc, br;

					if (side === CENTER) {
						b = precedance === Y ? LEFT : TOP;
						position[b] = '50%';
						position[MARGIN + '-' + b] = -Math.round(size[precedance === Y ? 0 : 1] / 2) + userOffset;
					} else {
						b = self._parseWidth(corner, side, elements.tooltip);
						bc = self._parseWidth(corner, side, elements.content);
						br = self._parseRadius(corner);

						position[side] = Math.max(-self.border, i ? bc : userOffset + (br > b ? br : -b));
					}
				});

				// Adjust for tip size
				position[corner[precedance]] -= size[precedance === X ? 0 : 1];

				// Set and return new position
				tip.css({ margin: '', top: '', bottom: '', left: '', right: '' }).css(position);
				return position;
			},

			reposition: function reposition(event, api, pos) {
				if (!this.enabled) {
					return;
				}

				var cache = api.cache,
				    newCorner = this.corner.clone(),
				    adjust = pos.adjusted,
				    method = api.options.position.adjust.method.split(' '),
				    horizontal = method[0],
				    vertical = method[1] || method[0],
				    shift = { left: FALSE, top: FALSE, x: 0, y: 0 },
				    offset,
				    css = {},
				    props;

				function shiftflip(direction, precedance, popposite, side, opposite) {
					// Horizontal - Shift or flip method
					if (direction === SHIFT && newCorner.precedance === precedance && adjust[side] && newCorner[popposite] !== CENTER) {
						newCorner.precedance = newCorner.precedance === X ? Y : X;
					} else if (direction !== SHIFT && adjust[side]) {
						newCorner[precedance] = newCorner[precedance] === CENTER ? adjust[side] > 0 ? side : opposite : newCorner[precedance] === side ? opposite : side;
					}
				}

				function shiftonly(xy, side, opposite) {
					if (newCorner[xy] === CENTER) {
						css[MARGIN + '-' + side] = shift[xy] = offset[MARGIN + '-' + side] - adjust[side];
					} else {
						props = offset[opposite] !== undefined ? [adjust[side], -offset[side]] : [-adjust[side], offset[side]];

						if ((shift[xy] = Math.max(props[0], props[1])) > props[0]) {
							pos[side] -= adjust[side];
							shift[side] = FALSE;
						}

						css[offset[opposite] !== undefined ? opposite : side] = shift[xy];
					}
				}

				// If our tip position isn't fixed e.g. doesn't adjust with viewport...
				if (this.corner.fixed !== TRUE) {
					// Perform shift/flip adjustments
					shiftflip(horizontal, X, Y, LEFT, RIGHT);
					shiftflip(vertical, Y, X, TOP, BOTTOM);

					// Update and redraw the tip if needed (check cached details of last drawn tip)
					if (newCorner.string() !== cache.corner.string() || cache.cornerTop !== adjust.top || cache.cornerLeft !== adjust.left) {
						this.update(newCorner, FALSE);
					}
				}

				// Setup tip offset properties
				offset = this.calculate(newCorner);

				// Readjust offset object to make it left/top
				if (offset.right !== undefined) {
					offset.left = -offset.right;
				}
				if (offset.bottom !== undefined) {
					offset.top = -offset.bottom;
				}
				offset.user = this.offset;

				// Perform shift adjustments
				shift.left = horizontal === SHIFT && !!adjust.left;
				if (shift.left) {
					shiftonly(X, LEFT, RIGHT);
				}
				shift.top = vertical === SHIFT && !!adjust.top;
				if (shift.top) {
					shiftonly(Y, TOP, BOTTOM);
				}

				/*
    * If the tip is adjusted in both dimensions, or in a
    * direction that would cause it to be anywhere but the
    * outer border, hide it!
    */
				this.element.css(css).toggle(!(shift.x && shift.y || newCorner.x === CENTER && shift.y || newCorner.y === CENTER && shift.x));

				// Adjust position to accomodate tip dimensions
				pos.left -= offset.left.charAt ? offset.user : horizontal !== SHIFT || shift.top || !shift.left && !shift.top ? offset.left + this.border : 0;
				pos.top -= offset.top.charAt ? offset.user : vertical !== SHIFT || shift.left || !shift.left && !shift.top ? offset.top + this.border : 0;

				// Cache details
				cache.cornerLeft = adjust.left;cache.cornerTop = adjust.top;
				cache.corner = newCorner.clone();
			},

			destroy: function destroy() {
				// Unbind events
				this.qtip._unbind(this.qtip.tooltip, this._ns);

				// Remove the tip element(s)
				if (this.qtip.elements.tip) {
					this.qtip.elements.tip.find('*').remove().end().remove();
				}
			}
		});

		TIP = PLUGINS.tip = function (api) {
			return new Tip(api, api.options.style.tip);
		};

		// Initialize tip on render
		TIP.initialize = 'render';

		// Setup plugin sanitization options
		TIP.sanitize = function (options) {
			if (options.style && 'tip' in options.style) {
				var opts = options.style.tip;
				if ((typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') {
					opts = options.style.tip = { corner: opts };
				}
				if (!/string|boolean/i.test(_typeof(opts.corner))) {
					opts.corner = TRUE;
				}
			}
		};

		// Add new option checks for the plugin
		CHECKS.tip = {
			'^position.my|style.tip.(corner|mimic|border)$': function positionMyStyleTipCornerMimicBorder$() {
				// Make sure a tip can be drawn
				this.create();

				// Reposition the tooltip
				this.qtip.reposition();
			},
			'^style.tip.(height|width)$': function styleTipHeightWidth$(obj) {
				// Re-set dimensions and redraw the tip
				this.size = [obj.width, obj.height];
				this.update();

				// Reposition the tooltip
				this.qtip.reposition();
			},
			'^content.title|style.(classes|widget)$': function contentTitleStyleClassesWidget$() {
				this.update();
			}
		};

		// Extend original qTip defaults
		$.extend(TRUE, QTIP.defaults, {
			style: {
				tip: {
					corner: TRUE,
					mimic: FALSE,
					width: 6,
					height: 6,
					border: TRUE,
					offset: 0
				}
			}
		});
		;var MODAL,
		    OVERLAY,
		    MODALCLASS = 'qtip-modal',
		    MODALSELECTOR = '.' + MODALCLASS;

		OVERLAY = function OVERLAY() {
			var self = this,
			    focusableElems = {},
			    current,
			    prevState,
			    elem;

			// Modified code from jQuery UI 1.10.0 source
			// http://code.jquery.com/ui/1.10.0/jquery-ui.js
			function focusable(element) {
				// Use the defined focusable checker when possible
				if ($.expr[':'].focusable) {
					return $.expr[':'].focusable;
				}

				var isTabIndexNotNaN = !isNaN($.attr(element, 'tabindex')),
				    nodeName = element.nodeName && element.nodeName.toLowerCase(),
				    map,
				    mapName,
				    img;

				if ('area' === nodeName) {
					map = element.parentNode;
					mapName = map.name;
					if (!element.href || !mapName || map.nodeName.toLowerCase() !== 'map') {
						return false;
					}
					img = $('img[usemap=#' + mapName + ']')[0];
					return !!img && img.is(':visible');
				}

				return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled : 'a' === nodeName ? element.href || isTabIndexNotNaN : isTabIndexNotNaN
				);
			}

			// Focus inputs using cached focusable elements (see update())
			function focusInputs(blurElems) {
				// Blurring body element in IE causes window.open windows to unfocus!
				if (focusableElems.length < 1 && blurElems.length) {
					blurElems.not('body').blur();
				}

				// Focus the inputs
				else {
						focusableElems.first().focus();
					}
			}

			// Steal focus from elements outside tooltip
			function stealFocus(event) {
				if (!elem.is(':visible')) {
					return;
				}

				var target = $(event.target),
				    tooltip = current.tooltip,
				    container = target.closest(SELECTOR),
				    targetOnTop;

				// Determine if input container target is above this
				targetOnTop = container.length < 1 ? FALSE : parseInt(container[0].style.zIndex, 10) > parseInt(tooltip[0].style.zIndex, 10);

				// If we're showing a modal, but focus has landed on an input below
				// this modal, divert focus to the first visible input in this modal
				// or if we can't find one... the tooltip itself
				if (!targetOnTop && target.closest(SELECTOR)[0] !== tooltip[0]) {
					focusInputs(target);
				}
			}

			$.extend(self, {
				init: function init() {
					// Create document overlay
					elem = self.elem = $('<div />', {
						id: 'qtip-overlay',
						html: '<div></div>',
						mousedown: function mousedown() {
							return FALSE;
						}
					}).hide();

					// Make sure we can't focus anything outside the tooltip
					$(document.body).bind('focusin' + MODALSELECTOR, stealFocus);

					// Apply keyboard "Escape key" close handler
					$(document).bind('keydown' + MODALSELECTOR, function (event) {
						if (current && current.options.show.modal.escape && event.keyCode === 27) {
							current.hide(event);
						}
					});

					// Apply click handler for blur option
					elem.bind('click' + MODALSELECTOR, function (event) {
						if (current && current.options.show.modal.blur) {
							current.hide(event);
						}
					});

					return self;
				},

				update: function update(api) {
					// Update current API reference
					current = api;

					// Update focusable elements if enabled
					if (api.options.show.modal.stealfocus !== FALSE) {
						focusableElems = api.tooltip.find('*').filter(function () {
							return focusable(this);
						});
					} else {
						focusableElems = [];
					}
				},

				toggle: function toggle(api, state, duration) {
					var tooltip = api.tooltip,
					    options = api.options.show.modal,
					    effect = options.effect,
					    type = state ? 'show' : 'hide',
					    visible = elem.is(':visible'),
					    visibleModals = $(MODALSELECTOR).filter(':visible:not(:animated)').not(tooltip);

					// Set active tooltip API reference
					self.update(api);

					// If the modal can steal the focus...
					// Blur the current item and focus anything in the modal we an
					if (state && options.stealfocus !== FALSE) {
						focusInputs($(':focus'));
					}

					// Toggle backdrop cursor style on show
					elem.toggleClass('blurs', options.blur);

					// Append to body on show
					if (state) {
						elem.appendTo(document.body);
					}

					// Prevent modal from conflicting with show.solo, and don't hide backdrop is other modals are visible
					if (elem.is(':animated') && visible === state && prevState !== FALSE || !state && visibleModals.length) {
						return self;
					}

					// Stop all animations
					elem.stop(TRUE, FALSE);

					// Use custom function if provided
					if ($.isFunction(effect)) {
						effect.call(elem, state);
					}

					// If no effect type is supplied, use a simple toggle
					else if (effect === FALSE) {
							elem[type]();
						}

						// Use basic fade function
						else {
								elem.fadeTo(parseInt(duration, 10) || 90, state ? 1 : 0, function () {
									if (!state) {
										elem.hide();
									}
								});
							}

					// Reset position and detach from body on hide
					if (!state) {
						elem.queue(function (next) {
							elem.css({ left: '', top: '' });
							if (!$(MODALSELECTOR).length) {
								elem.detach();
							}
							next();
						});
					}

					// Cache the state
					prevState = state;

					// If the tooltip is destroyed, set reference to null
					if (current.destroyed) {
						current = NULL;
					}

					return self;
				}
			});

			self.init();
		};
		OVERLAY = new OVERLAY();

		function Modal(api, options) {
			this.options = options;
			this._ns = '-modal';

			this.qtip = api;
			this.init(api);
		}

		$.extend(Modal.prototype, {
			init: function init(qtip) {
				var tooltip = qtip.tooltip;

				// If modal is disabled... return
				if (!this.options.on) {
					return this;
				}

				// Set overlay reference
				qtip.elements.overlay = OVERLAY.elem;

				// Add unique attribute so we can grab modal tooltips easily via a SELECTOR, and set z-index
				tooltip.addClass(MODALCLASS).css('z-index', QTIP.modal_zindex + $(MODALSELECTOR).length);

				// Apply our show/hide/focus modal events
				qtip._bind(tooltip, ['tooltipshow', 'tooltiphide'], function (event, api, duration) {
					var oEvent = event.originalEvent;

					// Make sure mouseout doesn't trigger a hide when showing the modal and mousing onto backdrop
					if (event.target === tooltip[0]) {
						if (oEvent && event.type === 'tooltiphide' && /mouse(leave|enter)/.test(oEvent.type) && $(oEvent.relatedTarget).closest(OVERLAY.elem[0]).length) {
							/* eslint-disable no-empty */
							try {
								event.preventDefault();
							} catch (e) {}
							/* eslint-enable no-empty */
						} else if (!oEvent || oEvent && oEvent.type !== 'tooltipsolo') {
							this.toggle(event, event.type === 'tooltipshow', duration);
						}
					}
				}, this._ns, this);

				// Adjust modal z-index on tooltip focus
				qtip._bind(tooltip, 'tooltipfocus', function (event, api) {
					// If focus was cancelled before it reached us, don't do anything
					if (event.isDefaultPrevented() || event.target !== tooltip[0]) {
						return;
					}

					var qtips = $(MODALSELECTOR),


					// Keep the modal's lower than other, regular qtips
					newIndex = QTIP.modal_zindex + qtips.length,
					    curIndex = parseInt(tooltip[0].style.zIndex, 10);

					// Set overlay z-index
					OVERLAY.elem[0].style.zIndex = newIndex - 1;

					// Reduce modal z-index's and keep them properly ordered
					qtips.each(function () {
						if (this.style.zIndex > curIndex) {
							this.style.zIndex -= 1;
						}
					});

					// Fire blur event for focused tooltip
					qtips.filter('.' + CLASS_FOCUS).qtip('blur', event.originalEvent);

					// Set the new z-index
					tooltip.addClass(CLASS_FOCUS)[0].style.zIndex = newIndex;

					// Set current
					OVERLAY.update(api);

					// Prevent default handling
					/* eslint-disable no-empty */
					try {
						event.preventDefault();
					} catch (e) {}
					/* eslint-enable no-empty */
				}, this._ns, this);

				// Focus any other visible modals when this one hides
				qtip._bind(tooltip, 'tooltiphide', function (event) {
					if (event.target === tooltip[0]) {
						$(MODALSELECTOR).filter(':visible').not(tooltip).last().qtip('focus', event);
					}
				}, this._ns, this);
			},

			toggle: function toggle(event, state, duration) {
				// Make sure default event hasn't been prevented
				if (event && event.isDefaultPrevented()) {
					return this;
				}

				// Toggle it
				OVERLAY.toggle(this.qtip, !!state, duration);
			},

			destroy: function destroy() {
				// Remove modal class
				this.qtip.tooltip.removeClass(MODALCLASS);

				// Remove bound events
				this.qtip._unbind(this.qtip.tooltip, this._ns);

				// Delete element reference
				OVERLAY.toggle(this.qtip, FALSE);
				delete this.qtip.elements.overlay;
			}
		});

		MODAL = PLUGINS.modal = function (api) {
			return new Modal(api, api.options.show.modal);
		};

		// Setup sanitiztion rules
		MODAL.sanitize = function (opts) {
			if (opts.show) {
				if (_typeof(opts.show.modal) !== 'object') {
					opts.show.modal = { on: !!opts.show.modal };
				} else if (typeof opts.show.modal.on === 'undefined') {
					opts.show.modal.on = TRUE;
				}
			}
		};

		// Base z-index for all modal tooltips (use qTip core z-index as a base)
		/* eslint-disable camelcase */
		QTIP.modal_zindex = QTIP.zindex - 200;
		/* eslint-enable camelcase */

		// Plugin needs to be initialized on render
		MODAL.initialize = 'render';

		// Setup option set checks
		CHECKS.modal = {
			'^show.modal.(on|blur)$': function showModalOnBlur$() {
				// Initialise
				this.destroy();
				this.init();

				// Show the modal if not visible already and tooltip is visible
				this.qtip.elems.overlay.toggle(this.qtip.tooltip[0].offsetWidth > 0);
			}
		};

		// Extend original api defaults
		$.extend(TRUE, QTIP.defaults, {
			show: {
				modal: {
					on: FALSE,
					effect: TRUE,
					blur: TRUE,
					stealfocus: TRUE,
					escape: TRUE
				}
			}
		});
		;PLUGINS.viewport = function (api, position, posOptions, targetWidth, targetHeight, elemWidth, elemHeight) {
			var target = posOptions.target,
			    tooltip = api.elements.tooltip,
			    my = posOptions.my,
			    at = posOptions.at,
			    adjust = posOptions.adjust,
			    method = adjust.method.split(' '),
			    methodX = method[0],
			    methodY = method[1] || method[0],
			    viewport = posOptions.viewport,
			    container = posOptions.container,
			    adjusted = { left: 0, top: 0 },
			    fixed,
			    newMy,
			    containerOffset,
			    containerStatic,
			    viewportWidth,
			    viewportHeight,
			    viewportScroll,
			    viewportOffset;

			// If viewport is not a jQuery element, or it's the window/document, or no adjustment method is used... return
			if (!viewport.jquery || target[0] === window || target[0] === document.body || adjust.method === 'none') {
				return adjusted;
			}

			// Cach container details
			containerOffset = container.offset() || adjusted;
			containerStatic = container.css('position') === 'static';

			// Cache our viewport details
			fixed = tooltip.css('position') === 'fixed';
			viewportWidth = viewport[0] === window ? viewport.width() : viewport.outerWidth(FALSE);
			viewportHeight = viewport[0] === window ? viewport.height() : viewport.outerHeight(FALSE);
			viewportScroll = { left: fixed ? 0 : viewport.scrollLeft(), top: fixed ? 0 : viewport.scrollTop() };
			viewportOffset = viewport.offset() || adjusted;

			// Generic calculation method
			function calculate(side, otherSide, type, adjustment, side1, side2, lengthName, targetLength, elemLength) {
				var initialPos = position[side1],
				    mySide = my[side],
				    atSide = at[side],
				    isShift = type === SHIFT,
				    myLength = mySide === side1 ? elemLength : mySide === side2 ? -elemLength : -elemLength / 2,
				    atLength = atSide === side1 ? targetLength : atSide === side2 ? -targetLength : -targetLength / 2,
				    sideOffset = viewportScroll[side1] + viewportOffset[side1] - (containerStatic ? 0 : containerOffset[side1]),
				    overflow1 = sideOffset - initialPos,
				    overflow2 = initialPos + elemLength - (lengthName === WIDTH ? viewportWidth : viewportHeight) - sideOffset,
				    offset = myLength - (my.precedance === side || mySide === my[otherSide] ? atLength : 0) - (atSide === CENTER ? targetLength / 2 : 0);

				// shift
				if (isShift) {
					offset = (mySide === side1 ? 1 : -1) * myLength;

					// Adjust position but keep it within viewport dimensions
					position[side1] += overflow1 > 0 ? overflow1 : overflow2 > 0 ? -overflow2 : 0;
					position[side1] = Math.max(-containerOffset[side1] + viewportOffset[side1], initialPos - offset, Math.min(Math.max(-containerOffset[side1] + viewportOffset[side1] + (lengthName === WIDTH ? viewportWidth : viewportHeight), initialPos + offset), position[side1],

					// Make sure we don't adjust complete off the element when using 'center'
					mySide === 'center' ? initialPos - myLength : 1E9));
				}

				// flip/flipinvert
				else {
						// Update adjustment amount depending on if using flipinvert or flip
						adjustment *= type === FLIPINVERT ? 2 : 0;

						// Check for overflow on the left/top
						if (overflow1 > 0 && (mySide !== side1 || overflow2 > 0)) {
							position[side1] -= offset + adjustment;
							newMy.invert(side, side1);
						}

						// Check for overflow on the bottom/right
						else if (overflow2 > 0 && (mySide !== side2 || overflow1 > 0)) {
								position[side1] -= (mySide === CENTER ? -offset : offset) + adjustment;
								newMy.invert(side, side2);
							}

						// Make sure we haven't made things worse with the adjustment and reset if so
						if (position[side1] < viewportScroll[side1] && -position[side1] > overflow2) {
							position[side1] = initialPos;newMy = my.clone();
						}
					}

				return position[side1] - initialPos;
			}

			// Set newMy if using flip or flipinvert methods
			if (methodX !== 'shift' || methodY !== 'shift') {
				newMy = my.clone();
			}

			// Adjust position based onviewport and adjustment options
			adjusted = {
				left: methodX !== 'none' ? calculate(X, Y, methodX, adjust.x, LEFT, RIGHT, WIDTH, targetWidth, elemWidth) : 0,
				top: methodY !== 'none' ? calculate(Y, X, methodY, adjust.y, TOP, BOTTOM, HEIGHT, targetHeight, elemHeight) : 0,
				my: newMy
			};

			return adjusted;
		};
		;PLUGINS.polys = {
			// POLY area coordinate calculator
			//	Special thanks to Ed Cradock for helping out with this.
			//	Uses a binary search algorithm to find suitable coordinates.
			polygon: function polygon(baseCoords, corner) {
				var result = {
					width: 0, height: 0,
					position: {
						top: 1e10, right: 0,
						bottom: 0, left: 1e10
					},
					adjustable: FALSE
				},
				    i = 0,
				    next,
				    coords = [],
				    compareX = 1,
				    compareY = 1,
				    realX = 0,
				    realY = 0,
				    newWidth,
				    newHeight;

				// First pass, sanitize coords and determine outer edges
				i = baseCoords.length;
				while (i--) {
					next = [parseInt(baseCoords[--i], 10), parseInt(baseCoords[i + 1], 10)];

					if (next[0] > result.position.right) {
						result.position.right = next[0];
					}
					if (next[0] < result.position.left) {
						result.position.left = next[0];
					}
					if (next[1] > result.position.bottom) {
						result.position.bottom = next[1];
					}
					if (next[1] < result.position.top) {
						result.position.top = next[1];
					}

					coords.push(next);
				}

				// Calculate height and width from outer edges
				newWidth = result.width = Math.abs(result.position.right - result.position.left);
				newHeight = result.height = Math.abs(result.position.bottom - result.position.top);

				// If it's the center corner...
				if (corner.abbrev() === 'c') {
					result.position = {
						left: result.position.left + result.width / 2,
						top: result.position.top + result.height / 2
					};
				} else {
					// Second pass, use a binary search algorithm to locate most suitable coordinate
					while (newWidth > 0 && newHeight > 0 && compareX > 0 && compareY > 0) {
						newWidth = Math.floor(newWidth / 2);
						newHeight = Math.floor(newHeight / 2);

						if (corner.x === LEFT) {
							compareX = newWidth;
						} else if (corner.x === RIGHT) {
							compareX = result.width - newWidth;
						} else {
							compareX += Math.floor(newWidth / 2);
						}

						if (corner.y === TOP) {
							compareY = newHeight;
						} else if (corner.y === BOTTOM) {
							compareY = result.height - newHeight;
						} else {
							compareY += Math.floor(newHeight / 2);
						}

						i = coords.length;
						while (i--) {
							if (coords.length < 2) {
								break;
							}

							realX = coords[i][0] - result.position.left;
							realY = coords[i][1] - result.position.top;

							if (corner.x === LEFT && realX >= compareX || corner.x === RIGHT && realX <= compareX || corner.x === CENTER && (realX < compareX || realX > result.width - compareX) || corner.y === TOP && realY >= compareY || corner.y === BOTTOM && realY <= compareY || corner.y === CENTER && (realY < compareY || realY > result.height - compareY)) {
								coords.splice(i, 1);
							}
						}
					}
					result.position = { left: coords[0][0], top: coords[0][1] };
				}

				return result;
			},

			rect: function rect(ax, ay, bx, by) {
				return {
					width: Math.abs(bx - ax),
					height: Math.abs(by - ay),
					position: {
						left: Math.min(ax, bx),
						top: Math.min(ay, by)
					}
				};
			},

			_angles: {
				tc: 3 / 2, tr: 7 / 4, tl: 5 / 4,
				bc: 1 / 2, br: 1 / 4, bl: 3 / 4,
				rc: 2, lc: 1, c: 0
			},
			ellipse: function ellipse(cx, cy, rx, ry, corner) {
				var c = PLUGINS.polys._angles[corner.abbrev()],
				    rxc = c === 0 ? 0 : rx * Math.cos(c * Math.PI),
				    rys = ry * Math.sin(c * Math.PI);

				return {
					width: rx * 2 - Math.abs(rxc),
					height: ry * 2 - Math.abs(rys),
					position: {
						left: cx + rxc,
						top: cy + rys
					},
					adjustable: FALSE
				};
			},
			circle: function circle(cx, cy, r, corner) {
				return PLUGINS.polys.ellipse(cx, cy, r, r, corner);
			}
		};
		;PLUGINS.svg = function (api, svg, corner) {
			var elem = svg[0],
			    root = $(elem.ownerSVGElement),
			    ownerDocument = elem.ownerDocument,
			    strokeWidth2 = (parseInt(svg.css('stroke-width'), 10) || 0) / 2,
			    frameOffset,
			    mtx,
			    transformed,
			    len,
			    next,
			    i,
			    points,
			    result,
			    position;

			// Ascend the parentNode chain until we find an element with getBBox()
			while (!elem.getBBox) {
				elem = elem.parentNode;
			}
			if (!elem.getBBox || !elem.parentNode) {
				return FALSE;
			}

			// Determine which shape calculation to use
			switch (elem.nodeName) {
				case 'ellipse':
				case 'circle':
					result = PLUGINS.polys.ellipse(elem.cx.baseVal.value, elem.cy.baseVal.value, (elem.rx || elem.r).baseVal.value + strokeWidth2, (elem.ry || elem.r).baseVal.value + strokeWidth2, corner);
					break;

				case 'line':
				case 'polygon':
				case 'polyline':
					// Determine points object (line has none, so mimic using array)
					points = elem.points || [{ x: elem.x1.baseVal.value, y: elem.y1.baseVal.value }, { x: elem.x2.baseVal.value, y: elem.y2.baseVal.value }];

					for (result = [], i = -1, len = points.numberOfItems || points.length; ++i < len;) {
						next = points.getItem ? points.getItem(i) : points[i];
						result.push.apply(result, [next.x, next.y]);
					}

					result = PLUGINS.polys.polygon(result, corner);
					break;

				// Unknown shape or rectangle? Use bounding box
				default:
					result = elem.getBBox();
					result = {
						width: result.width,
						height: result.height,
						position: {
							left: result.x,
							top: result.y
						}
					};
					break;
			}

			// Shortcut assignments
			position = result.position;
			root = root[0];

			// Convert position into a pixel value
			if (root.createSVGPoint) {
				mtx = elem.getScreenCTM();
				points = root.createSVGPoint();

				points.x = position.left;
				points.y = position.top;
				transformed = points.matrixTransform(mtx);
				position.left = transformed.x;
				position.top = transformed.y;
			}

			// Check the element is not in a child document, and if so, adjust for frame elements offset
			if (ownerDocument !== document && api.position.target !== 'mouse') {
				frameOffset = $((ownerDocument.defaultView || ownerDocument.parentWindow).frameElement).offset();
				if (frameOffset) {
					position.left += frameOffset.left;
					position.top += frameOffset.top;
				}
			}

			// Adjust by scroll offset of owner document
			ownerDocument = $(ownerDocument);
			position.left += ownerDocument.scrollLeft();
			position.top += ownerDocument.scrollTop();

			return result;
		};
		;PLUGINS.imagemap = function (api, area, corner) {
			if (!area.jquery) {
				area = $(area);
			}

			var shape = (area.attr('shape') || 'rect').toLowerCase().replace('poly', 'polygon'),
			    image = $('img[usemap="#' + area.parent('map').attr('name') + '"]'),
			    coordsString = $.trim(area.attr('coords')),
			    coordsArray = coordsString.replace(/,$/, '').split(','),
			    imageOffset,
			    coords,
			    i,
			    result,
			    len;

			// If we can't find the image using the map...
			if (!image.length) {
				return FALSE;
			}

			// Pass coordinates string if polygon
			if (shape === 'polygon') {
				result = PLUGINS.polys.polygon(coordsArray, corner);
			}

			// Otherwise parse the coordinates and pass them as arguments
			else if (PLUGINS.polys[shape]) {
					for (i = -1, len = coordsArray.length, coords = []; ++i < len;) {
						coords.push(parseInt(coordsArray[i], 10));
					}

					result = PLUGINS.polys[shape].apply(this, coords.concat(corner));
				}

				// If no shapre calculation method was found, return false
				else {
						return FALSE;
					}

			// Make sure we account for padding and borders on the image
			imageOffset = image.offset();
			imageOffset.left += Math.ceil((image.outerWidth(FALSE) - image.width()) / 2);
			imageOffset.top += Math.ceil((image.outerHeight(FALSE) - image.height()) / 2);

			// Add image position to offset coordinates
			result.position.left += imageOffset.left;
			result.position.top += imageOffset.top;

			return result;
		};
		;var IE6,


		/*
   * BGIFrame adaption (http://plugins.jquery.com/project/bgiframe)
   * Special thanks to Brandon Aaron
   */
		BGIFRAME = '<iframe class="qtip-bgiframe" frameborder="0" tabindex="-1" src="javascript:\'\';" ' + ' style="display:block; position:absolute; z-index:-1; filter:alpha(opacity=0); ' + '-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";"></iframe>';

		function Ie6(api) {
			this._ns = 'ie6';

			this.qtip = api;
			this.init(api);
		}

		$.extend(Ie6.prototype, {
			_scroll: function _scroll() {
				var overlay = this.qtip.elements.overlay;
				overlay && (overlay[0].style.top = $(window).scrollTop() + 'px');
			},

			init: function init(qtip) {
				var tooltip = qtip.tooltip;

				// Create the BGIFrame element if needed
				if ($('select, object').length < 1) {
					this.bgiframe = qtip.elements.bgiframe = $(BGIFRAME).appendTo(tooltip);

					// Update BGIFrame on tooltip move
					qtip._bind(tooltip, 'tooltipmove', this.adjustBGIFrame, this._ns, this);
				}

				// redraw() container for width/height calculations
				this.redrawContainer = $('<div/>', { id: NAMESPACE + '-rcontainer' }).appendTo(document.body);

				// Fixup modal plugin if present too
				if (qtip.elements.overlay && qtip.elements.overlay.addClass('qtipmodal-ie6fix')) {
					qtip._bind(window, ['scroll', 'resize'], this._scroll, this._ns, this);
					qtip._bind(tooltip, ['tooltipshow'], this._scroll, this._ns, this);
				}

				// Set dimensions
				this.redraw();
			},

			adjustBGIFrame: function adjustBGIFrame() {
				var tooltip = this.qtip.tooltip,
				    dimensions = {
					height: tooltip.outerHeight(FALSE),
					width: tooltip.outerWidth(FALSE)
				},
				    plugin = this.qtip.plugins.tip,
				    tip = this.qtip.elements.tip,
				    tipAdjust,
				    offset;

				// Adjust border offset
				offset = parseInt(tooltip.css('borderLeftWidth'), 10) || 0;
				offset = { left: -offset, top: -offset };

				// Adjust for tips plugin
				if (plugin && tip) {
					tipAdjust = plugin.corner.precedance === 'x' ? [WIDTH, LEFT] : [HEIGHT, TOP];
					offset[tipAdjust[1]] -= tip[tipAdjust[0]]();
				}

				// Update bgiframe
				this.bgiframe.css(offset).css(dimensions);
			},

			// Max/min width simulator function
			redraw: function redraw() {
				if (this.qtip.rendered < 1 || this.drawing) {
					return this;
				}

				var tooltip = this.qtip.tooltip,
				    style = this.qtip.options.style,
				    container = this.qtip.options.position.container,
				    perc,
				    width,
				    max,
				    min;

				// Set drawing flag
				this.qtip.drawing = 1;

				// If tooltip has a set height/width, just set it... like a boss!
				if (style.height) {
					tooltip.css(HEIGHT, style.height);
				}
				if (style.width) {
					tooltip.css(WIDTH, style.width);
				}

				// Simulate max/min width if not set width present...
				else {
						// Reset width and add fluid class
						tooltip.css(WIDTH, '').appendTo(this.redrawContainer);

						// Grab our tooltip width (add 1 if odd so we don't get wrapping problems.. huzzah!)
						width = tooltip.width();
						if (width % 2 < 1) {
							width += 1;
						}

						// Grab our max/min properties
						max = tooltip.css('maxWidth') || '';
						min = tooltip.css('minWidth') || '';

						// Parse into proper pixel values
						perc = (max + min).indexOf('%') > -1 ? container.width() / 100 : 0;
						max = (max.indexOf('%') > -1 ? perc : 1 * parseInt(max, 10)) || width;
						min = (min.indexOf('%') > -1 ? perc : 1 * parseInt(min, 10)) || 0;

						// Determine new dimension size based on max/min/current values
						width = max + min ? Math.min(Math.max(width, min), max) : width;

						// Set the newly calculated width and remvoe fluid class
						tooltip.css(WIDTH, Math.round(width)).appendTo(container);
					}

				// Set drawing flag
				this.drawing = 0;

				return this;
			},

			destroy: function destroy() {
				// Remove iframe
				this.bgiframe && this.bgiframe.remove();

				// Remove bound events
				this.qtip._unbind([window, this.qtip.tooltip], this._ns);
			}
		});

		IE6 = PLUGINS.ie6 = function (api) {
			// Proceed only if the browser is IE6
			return BROWSER.ie === 6 ? new Ie6(api) : FALSE;
		};

		IE6.initialize = 'render';

		CHECKS.ie6 = {
			'^content|style$': function contentStyle$() {
				this.redraw();
			}
		};
		;
	});
})(window, document);

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(1), __webpack_require__(9)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, BaseView, FormUtil) {

  return BaseView.extend({

    className: 'o-form-button-bar',

    initialize: function initialize(options) {
      this.addButton({
        type: 'save',
        text: _.resultCtx(options, 'save', this),
        id: _.resultCtx(options, 'saveId', this),
        className: _.resultCtx(options, 'saveClassName', this)
      });

      if (!options.noCancelButton) {
        this.addButton({ type: 'cancel', text: _.resultCtx(options, 'cancel', this) });
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
    addButton: function addButton(params, options) {
      return this.add(FormUtil.createButton(params), options);
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(0), __webpack_require__(8), __webpack_require__(3), __webpack_require__(10), __webpack_require__(69)], __WEBPACK_AMD_DEFINE_RESULT__ = (function ($, _, Keys, TemplateUtil, BaseInput) {

  var template = TemplateUtil.tpl('<select id="{{inputId}}" name="{{name}}"></select>');
  var option = TemplateUtil.tpl('<option value="{{key}}">{{value}}</option>');

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
  var CHOSEN_WINDOW_MARGIN = 20;
  var CHOSEN_MAX_HEIGHT = 240;
  var CHOSEN_Z_INDEX = 50000;

  function defer(fn) {
    if (this.params.autoWidth) {
      return fn.call(this);
    } else {
      return _.defer(_.bind(fn, this));
    }
  }

  function findSelectWidth(self) {
    self.$select.hide();
    var select = $(self.$select[0]).hide();
    $('body').append(select);
    var width = self.params.width = select.width() * 1.2 + 'px';
    self.$el.append(select.show());
    return width;
  }

  function recalculateChosen($chosen, $results, $clone) {
    var offset = $clone.offset();
    $chosen.css({
      left: offset.left,
      top: offset.top
    });
    // Update the max-height to fit within the constraints of the window. This
    // is especially important for modals because page scrolling is disabled.
    var $win = $(window),
        rHeight = $results.outerHeight(),
        rBottom = rHeight + $results.offset().top - $win.scrollTop(),
        wHeight = $win.height() - CHOSEN_WINDOW_MARGIN,
        maxHeight = Math.min(rHeight + wHeight - rBottom, CHOSEN_MAX_HEIGHT);
    $results.css('max-height', maxHeight);
  }

  function fixChosenModal($select) {
    var $chosen = $select.next('.chzn-container'),
        $clone = $chosen.clone(),
        $results = $chosen.find('.chzn-results');

    // Use a hidden clone to maintain layout and calculate offset. This is
    // necessary for more complex layouts (like adding a group rule) where
    // the chosen element is floated.
    $clone.css('visibility', 'hidden');
    $clone.removeAttr('id');
    $clone.find('li').removeAttr('id');

    // Save the original styles - we'll revert to them when the select closes
    var baseStyles = {
      'left': $chosen.css('left'),
      'top': $chosen.css('top'),
      'position': $chosen.css('position'),
      'float': $chosen.css('float'),
      'z-index': $chosen.css('z-index')
    };
    $results.hide();

    // Handler for any resize events that happen when the results list is open
    var resizeHandler = _.debounce(function () {
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
        'position': 'absolute',
        'float': 'none',
        'z-index': CHOSEN_Z_INDEX,
        'top': -999999
      });
      $('body').append($chosen);
      $results.show();
      recalculateChosen($chosen, $results, $clone);
      // Capture scroll events:
      // - for forms that use fixed positioning (like editing attributes in
      //   Profile Editor) - window scroll
      // - for forms that are too long for the modal - o-form-content scroll
      $select.parents().scroll(resizeHandler);
      $(window).on('resize scroll', resizeHandler);
    });

    // When the dropdown closes or the element is removed, revert to the
    // original styles and reattach it to its original placement in the dom.
    $select.on('liszt:hiding_dropdown.fixChosen remove.fixChosen', function () {
      $select.parents().off('scroll', resizeHandler);
      $(window).off('resize scroll', resizeHandler);
      $chosen.css(baseStyles);
      $results.hide();
      $results.css('max-height', CHOSEN_MAX_HEIGHT);
      $clone.remove();
      $select.after($chosen);
    });
  }

  return BaseInput.extend({

    className: 'o-form-select',

    /**
    * @Override
    */
    events: {
      'change select': 'update',
      'keyup .chzn-search > :text': function keyupChznSearchText(e) {
        if (Keys.isEsc(e)) {
          this.$('.chzn-search > :text').val('');
          e.stopPropagation();
        }
      }
    },

    constructor: function constructor() {
      this.template = template;
      this.option = option;
      BaseInput.apply(this, arguments);
      this.params = this.options.params || {};
    },

    /**
    * @Override
    */
    editMode: function editMode() {
      /* eslint max-statements: [2, 13] */

      this.$el.html(template(this.options));
      this.$select = this.$('select');

      var options = this.getOptions();
      _.each(options, function (value, key) {
        this.$select.append(option({ key: key, value: value }));
      }, this);

      // Fix a regression in jQuery 1.x on Firefox
      // jQuery.val(value) prepends an empty option to the dropdown
      // if value doesnt exist in the dropdown.
      // http://bugs.jquery.com/ticket/13514
      var value = this.getModelValue();
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

    __applyChosen: function __applyChosen(update) {
      var width = this.options.wide ? '100%' : this.params.width || '62%';
      if (this.params.autoWidth) {
        width = findSelectWidth(this);
      }

      defer.call(this, function () {
        var searchThreshold = this.getParam('searchThreshold', 10);
        if (!_.result(this.options, 'autoRender') && update !== false) {
          this.update();
        }
        this.$select.chosen({
          'width': width,
          'disable_search_threshold': searchThreshold,
          'placeholder_text': this.options['placeholder']
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
    val: function val() {
      return this.$select && this.$select.val();
    },

    /**
    * @Override
    */
    focus: function focus() {
      if (this.$select) {
        return this.$select.focus();
      }
    },

    /**
     * @Override
     */
    toStringValue: function toStringValue() {
      var selectedOption = this.getModelValue(),
          displayString = selectedOption,
          options = this.getOptions();
      if (!_.isEmpty(options)) {
        displayString = options[selectedOption];
      }
      if (_.isUndefined(displayString)) {
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
    getOptions: function getOptions() {
      var options = this.options.options;

      if (_.isFunction(options)) {
        options = options.call(this);
      }

      return _.isObject(options) ? options : {};
    },

    remove: function remove() {
      if (this.$select) {
        this.$select.trigger('remove');
      }
      return BaseInput.prototype.remove.apply(this, arguments);
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


!(module.exports = {
  DEBOUNCE_DELAY: 200,
  LOADING_FADE: 400,
  UNLOADING_FADE: 400,
  ROW_EXPANDER_TRANSITION: 150,
  HIDE_ADD_MAPPING_FORM: 300
});

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(3), __webpack_require__(10), __webpack_require__(8), __webpack_require__(72), __webpack_require__(30)], __WEBPACK_AMD_DEFINE_RESULT__ = (function ($, TemplateUtil, BaseInput, Keys) {

  var className = 'okta-form-input-field input-fix';

  function hasTitleAndText(options) {
    var title = options.title,
        text = options.text;

    return title && text && title !== text;
  }

  // options may be a string or an object.
  function createQtipContent(options) {
    if (hasTitleAndText(options)) {
      return options;
    }
    return { text: options.text || options };
  }

  return BaseInput.extend({
    template: TemplateUtil.tpl('\
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
      '),
    /**
    * @Override
    */
    events: {
      'input input': 'update',
      'change input': 'update',
      'keydown input': 'update',
      'keyup input': function keyupInput(e) {
        if (Keys.isEnter(e)) {
          this.model.trigger('form:save');
        } else if (Keys.isEsc(e)) {
          this.model.trigger('form:cancel');
        }
      }
    },

    constructor: function constructor() {
      BaseInput.apply(this, arguments);
      this.$el.addClass('o-form-control');
    },

    /**
    * @Override
    */
    editMode: function editMode() {
      this.$el.addClass(className);
      BaseInput.prototype.editMode.apply(this, arguments);
      this.$('input').placeholder();
    },

    /**
    * @Override
    */
    readMode: function readMode() {
      BaseInput.prototype.readMode.apply(this, arguments);
      if (this.options.type == 'password') {
        this.$el.text('********');
      }
      this.$el.removeClass(className);
    },

    /**
    * @Override
    */
    val: function val() {
      //IE will only read clear text pw if type="password" is explicitly in selector
      var inputValue = this.$('input[type="' + this.options.type + '"]').val();

      if (this.options.type !== 'password') {
        inputValue = $.trim(inputValue);
      }
      return inputValue;
    },

    /**
    * @Override
    */
    focus: function focus() {
      return this.$('input').focus();
    },

    postRender: function postRender() {
      var params = this.options.params,
          content;

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
            viewport: $('body')
          }
        });
      }
    }
  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 35 */
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
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(6)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (jQuery) {
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
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(37);


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint max-params: 0 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(5), __webpack_require__(2), __webpack_require__(0), __webpack_require__(18), __webpack_require__(11), __webpack_require__(13), __webpack_require__(14), __webpack_require__(21), __webpack_require__(43), __webpack_require__(4), __webpack_require__(3), __webpack_require__(23), __webpack_require__(26), __webpack_require__(56), __webpack_require__(15), __webpack_require__(58), __webpack_require__(7), __webpack_require__(60), __webpack_require__(8), __webpack_require__(61), __webpack_require__(1), __webpack_require__(63), __webpack_require__(65), __webpack_require__(28), __webpack_require__(29), __webpack_require__(9), __webpack_require__(66), __webpack_require__(31), __webpack_require__(34), __webpack_require__(73), __webpack_require__(74), __webpack_require__(75), __webpack_require__(32)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (Backbone, $, _, Handlebars, Model, BaseModel, BaseCollection, SchemaProperty, BaseSchema, StringUtil, TemplateUtil, ButtonFactory, BaseRouter, BaseController, Util, Cookie, Logger, Class, Keys, TimeUtil, BaseView, ListView, BaseDropDown, BaseForm, InputRegistry, FormUtil, SchemaFormFactory, Toolbar, TextBox, PasswordBox, CheckBox, Radio, Select) {

  var Okta = {

    Backbone: Backbone,

    $: $,

    _: _,

    Handlebars: Handlebars,

    loc: StringUtil.localize,

    createButton: ButtonFactory.create,

    registerInput: InputRegistry.register,

    tpl: TemplateUtil.tpl,

    Model: Model,

    BaseModel: BaseModel,

    Collection: BaseCollection,

    View: BaseView,

    ListView: ListView,

    Router: BaseRouter,

    Controller: BaseController,

    Form: BaseForm,

    internal: {

      util: {
        Util: Util,
        Cookie: Cookie,
        Logger: Logger,
        Class: Class,
        Keys: Keys,
        TimeUtil: TimeUtil
      },

      views: {
        components: {
          BaseDropDown: BaseDropDown
        },

        forms: {
          helpers: {
            FormUtil: FormUtil,
            SchemaFormFactory: SchemaFormFactory
          },

          components: {
            Toolbar: Toolbar
          },

          inputs: {
            TextBox: TextBox,
            PasswordBox: PasswordBox,
            CheckBox: CheckBox,
            Radio: Radio,
            Select: Select
          }
        }
      },

      models: {
        BaseSchema: BaseSchema,
        SchemaProperty: SchemaProperty
      }

    }
  };

  Okta.registerInput('text', TextBox);
  Okta.registerInput('password', PasswordBox);
  Okta.registerInput('checkbox', CheckBox);
  Okta.registerInput('radio', Radio);
  Okta.registerInput('select', Select);

  return Okta;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 38 */
/***/ (function(module, exports) {

module.exports = require("shared/util/Bundles");

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

// Simple "markdown parser" - just handles markdown formatted links. If we
// find that we need more extensive markdown support, we should include
// a fully formulated markdown library like:
// https://github.com/evilstreak/markdown-js
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_) {

  var RE_LINK = /\[[^\]]*\]\([^)]*\)/gi;
  var RE_LINK_HREF = /\]\(([^)]*)\)/i;
  var RE_LINK_TEXT = /\[([^\]]*)\]/i;
  var RE_LINK_JS = /javascript:/gi;

  // Converts links
  // FROM:
  // [some link text](http://the/link/url)
  // TO:
  // <a href="http://the/link/url">some link text</a>
  return function mdToHtml(Handlebars, markdownText) {
    /* eslint  @okta/okta/no-specific-methods: 0*/
    var linkTemplate = Handlebars.compile('<a href="{{href}}">{{text}}</a>');
    var res;
    if (!_.isString(markdownText)) {
      res = '';
    } else {
      res = Handlebars.Utils.escapeExpression(markdownText).replace(RE_LINK_JS, '').replace(RE_LINK, function (mdLink) {
        return linkTemplate({
          href: mdLink.match(RE_LINK_HREF)[1],
          text: mdLink.match(RE_LINK_TEXT)[1]
        });
      });
    }
    return new Handlebars.SafeString(res);
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(5), __webpack_require__(7)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
  /* global module, exports */
  else if (typeof require === 'function' && (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
      module.exports = factory(require('okta/underscore'), require('backbone'), require('shared/util/Logger'));
    } else {
      root.Archer || (root.Archer = {});
      root.Archer.Model = factory(root._, root.Backbone, root.Logger);
    }
})(undefined, function (_, Backbone, Logger) {
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
    var filter = _.contains(objectTypeFields, key);
    target || (target = {});
    if (!filter && _.isObject(value) && !_.isArray(value) && !_.isFunction(value)) {
      _.each(value, function (val, i) {
        flatten(val, objectTypeFields, key ? key + '.' + i : i, target);
      });
    }
    // Case where target is an empty object. Guard against returning {undefined: undefined}.
    else if (key !== undefined) {
        target[key] = value;
      }
    return target;
  }

  function unflatten(data) {
    _.each(data, function (value, key, data) {
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
    if (_.isString(field)) {
      target = {
        type: field
      };
    } else if (_.isArray(field)) {
      target = {
        type: field[0],
        required: field[1],
        value: field[2]
      };
    } else {
      target = _.clone(field);
    }
    _.defaults(target, { required: false, name: name });
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
    email: function email(value) {
      // Taken from  http://emailregex.com/ on 2017-03-06.
      var pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return _validateRegex(value, pattern, Model.ERROR_INVALID_FORMAT_EMAIL);
    },
    uri: function uri(value) {
      // source: https://mathiasbynens.be/demo/url-regex
      var pattern = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
      return _validateRegex(value, pattern, Model.ERROR_INVALID_FORMAT_URI);
    },
    ipv4: function ipv4(value) {
      // source: https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      var pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return _validateRegex(value, pattern, Model.ERROR_INVALID_FORMAT_IPV4);
    },
    hostname: function hostname(value) {
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
    var createMessageWith = _.partial(createMessage, field),
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

  function _validateField(field, value) {
    /* eslint complexity: [2, 23], max-statements: [2, 19] */
    var createMessageWith = _.partial(createMessage, field),
        isDefined = !_.isUndefined(value) && !_.isNull(value),
        checkType,
        errorMessage;

    // check required fields
    if (field.required && (!isDefined || _.isNull(value) || value === '')) {
      return createMessageWith(Model.ERROR_BLANK);
    }
    // check type
    checkType = _['is' + capitalize(field.type)];
    if (isDefined && field.type != 'any' && (!_.isFunction(checkType) || !checkType(value))) {
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
    if (isDefined && field.values && !_.contains(field.values, value)) {
      return createMessageWith(Model.ERROR_NOT_ALLOWED);
    }
    // check validate method
    if (_.isFunction(field.validate)) {
      var result = field.validate(value);
      if (_.isString(result) && result) {
        return createMessageWith(result);
      } else if (result === false) {
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
    } else if (field.maxItems && arr.length > field.maxItems) {
      return 'model.validation.field.array.maxItems';
    } else if (field.uniqueItems && arr.length > _.uniq(arr).length) {
      return Model.ERROR_IARRAY_UNIQUE;
    } else if (field.items) {
      /* eslint max-depth: [2, 3] */
      var arrayField = normalizeSchemaDef(field.items, 'placeholder');
      for (var i = 0; i < arr.length; i++) {
        var value = arr[i];
        var error = _validateField(arrayField, value);
        if (error) {
          return error['placeholder'];
        }
      }
    }
  }

  Model = Backbone.Model.extend( /** @lends src/framework/Model.prototype */{

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

    constructor: function constructor(options) {
      this.options = options || {};

      var schema = this['__schema__'] = {},
          objectTypeFields = [];

      schema.computedProperties = {};

      schema.props = _.clone(_.result(this, 'props') || {});
      schema.derived = _.clone(_.result(this, 'derived') || {});
      schema.local = _.clone(_.result(this, 'local') || {});

      var defaults = {};
      _.each(_.extend({}, schema.props, schema.local), function (options, name) {
        var schemaDef = normalizeSchemaDef(options, name);
        if (!_.isUndefined(schemaDef.value)) {
          defaults[name] = schemaDef.value;
        }
        if (schemaDef.type === 'object') {
          objectTypeFields.push(name);
        }
      }, this);
      if (_.size(defaults)) {
        var localDefaults = _.result(this, 'defaults');
        this.defaults = function () {
          return _.defaults({}, defaults, localDefaults);
        };
      }

      // override `validate`
      this.validate = _.wrap(this.validate, function (validate) {
        var args = _.rest(arguments),
            res = _.extend(this._validateSchema.apply(this, args), validate.apply(this, args));
        return _.size(res) && res || undefined;
      });

      // override `parse`
      this.parse = _.wrap(this.parse, function (parse) {
        var target = parse.apply(this, _.rest(arguments));
        if (this.flat) {
          target = flatten(target, objectTypeFields);
        }
        return target;
      });

      Backbone.Model.apply(this, arguments);

      _.each(schema.derived, function (options, name) {
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

    validate: function validate() {},

    /**
     * Check if the schema settings allow this field to exist in the model
     * @param  {String} key
     * @return {Boolean}
     */
    allows: function allows(key) {
      var schema = this['__schema__'],
          all = _.extend({}, schema.props, schema.local);
      if (!_.has(all, key)) {
        Logger.warn('Field not defined in schema', key);
      }
      return true;
    },

    /**
     * Returns the schema for the specific property
     *
     * @param propName - The name of the property
     * @returns {*} | null
     */
    getPropertySchema: function getPropertySchema(propName) {
      var schema = this['__schema__'];
      return _.reduce([schema.props, schema.local], function (result, options) {
        return result || normalizeSchemaDef(options[propName], propName);
      }, null);
    },

    set: function set(key, val) {
      var attrs;
      if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
        attrs = key;
      } else {
        (attrs = {})[key] = val;
      }

      // Don't override a computed properties
      _.each(attrs, function (value, key) {
        if (_.has(this['__schema__'].derived, key)) {
          throw 'overriding derived properties is not supported: ' + key;
        }
      }, this);

      // Schema validation
      var errorFields = [];
      _.each(attrs, function (value, key) {
        this.allows(key) || errorFields.push(key);
      }, this);
      if (errorFields.length) {
        throw 'field not allowed: ' + errorFields.join(', ');
      }

      return Backbone.Model.prototype.set.apply(this, arguments);
    },

    get: function get(attr) {
      var schema = this['__schema__'];
      if (_.has(schema.derived, attr)) {
        if (schema.derived[attr].cache !== false) {
          return schema.computedProperties[attr];
        } else {
          return this.__getDerivedValue(attr);
        }
      }
      return Backbone.Model.prototype.get.apply(this, arguments);
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
    toJSON: function toJSON(options) {
      options || (options = {});
      var res = _.clone(Backbone.Model.prototype.toJSON.apply(this, arguments)),
          schema = this['__schema__'];

      // cleanup local properties
      if (!options.verbose) {
        res = _.omit(res, _.keys(schema.local));
      } else {
        // add derived properties
        _.each(schema.derived, function (options, name) {
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
    reset: function reset(options) {
      this.clear(options);
      this.set(_.result(this, 'defaults'), options);
    },

    /**
     * Is the data on the model has local modifications since the last sync event?
     * @return {Boolean} is the model in sync with the server
     */
    isSynced: function isSynced() {
      return _.isEqual(this.__syncedData, this.toJSON());
    },

    /**
     * validate a specific field in the model.
     * @param  {String} key
     * @return {Object} returns `{fieldName: errorMessage}` if invalid, otherwise undefined.
     * @readonly
     */
    validateField: function validateField(key) {
      var schema = key && this.getPropertySchema(key);
      return schema && _validateField(schema, this.get(key));
    },

    /**
     * Runs local schema validation. Invoked internally by {@link src/framework/Model#validate|validate}.
     * @return {Object}
     * @protected
     */
    _validateSchema: function _validateSchema() {
      var schema = this['__schema__'];
      return _.reduce(_.extend({}, schema.props, schema.local), function (memo, options, name) {
        return _.extend(memo, this.validateField(name) || {});
      }, {}, this);
    },

    __getDerivedValue: function __getDerivedValue(name) {
      var options = this['__schema__'].derived[name];
      if (_.isString(options)) {
        var key = options;
        options = {
          deps: [key],
          fn: function fn() {
            return this.get(key);
          }
        };
      }
      var deps = options.deps || [];
      return options.fn.apply(this, _.map(deps, this.get, this));
    }

  }, {
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
  });

  return Model;
});

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var g;

// This works in non-strict mode
g = function () {
	return this;
}();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(5)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
  /* global module, exports */
  else if (typeof require == 'function' && (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) == 'object') {
      module.exports = factory(require('okta/underscore'), require('backbone'));
    } else {
      root.Archer || (root.Archer = {});
      root.Archer.Collection = factory(root._, root.Backbone);
    }
})(undefined, function (_, Backbone) {
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
    } catch (e) {
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
  return Backbone.Collection.extend( /** @lends src/framework/Collection.prototype */{

    /**
     * Default fetch parameters
     * @type {Object}
     */
    params: {},

    constructor: function constructor(models, options) {
      var state = this[STATE] = new Backbone.Model();
      state.set(DEFAULT_PARAMS, _.defaults(options && options.params || {}, this.params || {}));
      Backbone.Collection.apply(this, arguments);
    },

    /**
     * See [Backbone Collection.sync](http://backbonejs.org/#Collection-sync).
     */
    sync: function sync(method, collection, options) {
      var self = this,
          success = options.success;
      options.success = function (resp, status, xhr) {
        // its important to set the pagination data *before* we call the success callback
        // because we want the pagination data to be ready when the collection triggers the `sync` event
        setLinkHeadersPagination(self, xhr);
        success.apply(null, arguments);
      };
      return Backbone.Collection.prototype.sync.call(this, method, collection, options);
    },

    /**
     * See [Backbone Collection.fetch](http://backbonejs.org/#Collection-fetch).
     */
    fetch: function fetch(options) {
      options || (options = {});
      var state = this[STATE],
          xhr = state.get(XHR);

      options.data = _.extend({}, state.get(DEFAULT_PARAMS), options.data || {});
      options.fromFetch = true;

      state.set(FETCH_DATA, options.data);
      if (xhr && xhr.abort && options.abort !== false) {
        xhr.abort();
      }
      xhr = Backbone.Collection.prototype.fetch.call(this, options);
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
    setPagination: function setPagination(params, options) {
      /* eslint complexity: [2, 8] */
      if (_.isString(params) && params) {
        params = parseQuery(params);
      }
      if (!_.isObject(params) || _.isArray(params) || !_.size(params)) {
        params = null;
      } else if (options && options.fromFetch) {
        params = _.extend({}, this.getFetchData(), params);
      }
      this[STATE].set(PAGINATION_DATA, params);
    },

    /**
     * Returns the `data` parameters applied in th most recent `fetch` call
     * It will include parameters set by {@link #params} and optios.params passed to the constructor
     * @return {Object}
     * @protected
     */
    getFetchData: function getFetchData() {
      return this[STATE].get(FETCH_DATA) || {};
    },

    /**
     * Data object for constructing a request to fetch the next page
     * @return {Object}
     * @protected
     */
    getPaginationData: function getPaginationData() {
      return this[STATE].get(PAGINATION_DATA) || {};
    },

    /**
     * Does this collection have more data on the server (e.g is there a next "page")
     * @return {Boolean}
     */
    hasMore: function hasMore() {
      return _.size(this.getPaginationData()) > 0;
    },

    /**
     * Get the next page from the server
     * @return {Object} xhr returned by {@link #fetch}
     */
    fetchMore: function fetchMore() {
      if (!this.hasMore()) {
        throw new Error('Invalid Request');
      }
      return this.fetch({ data: this.getPaginationData(), add: true, remove: false, update: true });
    },

    /**
     * See [Backbone Collection.reset](http://backbonejs.org/#Collection-reset).
     */
    reset: function reset(models, options) {
      options || (options = {});
      // only reset the pagination when reset is being called explicitly.
      // this is to avoid link headers pagination being overriden and reset when
      // fetching the collection using `collection.fetch({reset: true})`
      if (!options.fromFetch) {
        this.setPagination(null);
      }
      return Backbone.Collection.prototype.reset.apply(this, arguments);
    },

    // we want "where" to be able to search through derived properties as well
    where: function where(attrs, first) {
      if (_.isEmpty(attrs)) {
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
    create: function create(model, options) {
      options || (options = {});
      if (!_.result(model, 'urlRoot')) {
        options.url = _.result(this, 'url');
      }
      return Backbone.Collection.prototype.create.call(this, model, options);
    }

  });
});

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(13), __webpack_require__(14), __webpack_require__(21)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, BaseModel, BaseCollection, SchemaProperty) {

  var parseProperties = function parseProperties(resp) {
    var schemaMeta = _.pick(resp, 'id', 'name', 'displayName');
    var properties = _.map(resp.schema.properties, function (property, name) {
      return _({ name: name }).chain().extend(property).omit('__metadata').value();
    });
    _.each(properties, function (property) {
      property['__schemaMeta__'] = schemaMeta;
    });
    return properties;
  };

  var Schema = BaseModel.extend({

    defaults: {
      id: undefined,
      displayName: undefined,
      name: undefined
    },

    constructor: function constructor() {
      this.properties = new SchemaProperty.Collection();
      BaseModel.apply(this, arguments);
    },

    getProperties: function getProperties() {
      return this.properties;
    },

    clone: function clone() {
      var model = BaseModel.prototype.clone.apply(this, arguments);
      model.getProperties().set(this.getProperties().toJSON({ verbose: true }));
      return model;
    },

    parse: function parse(resp) {
      var properties = parseProperties(resp);
      this.properties.set(properties, { parse: true });
      return _.omit(resp, 'schema');
    },

    trimProperty: function trimProperty(property) {
      return _.omit(property, 'name');
    },

    toJSON: function toJSON() {
      var json = BaseModel.prototype.toJSON.apply(this, arguments);
      json.schema = { properties: {} };
      this.getProperties().each(function (model) {
        var property = model.toJSON();
        json.schema.properties[property.name] = this.trimProperty(property);
      }, this);
      return json;
    },

    save: function save() {
      this.getProperties().each(function (model) {
        model.cleanup();
      });
      return BaseModel.prototype.save.apply(this, arguments);
    }
  });

  var Schemas = BaseCollection.extend({
    model: Schema
  });

  return {
    parseProperties: parseProperties,
    Model: Schema,
    Collection: Schemas
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(1), __webpack_require__(25)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, BaseView, ViewUtil) {

  var disabledEvents = {
    click: function click(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /**
   * A configurable button.
   * @class module:Okta.internal.views.components.BaseButtonLink
   * @extends module:Okta.View
   * @example
   * var View = BaseButtonLink.extend({
   *   title: 'Click Me',
   *   icon: 'help-text'
   * })
   */
  return BaseView.extend( /** @lends module:Okta.internal.views.components.BaseButtonLink.prototype */{
    attributes: function attributes() {
      var defaultAttrs = {
        'data-se': 'button'
      };
      var additionalAttr = this.__getAttribute('attrs');
      return _.extend(defaultAttrs, additionalAttr);
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

    constructor: function constructor(options) {
      this.options = options || {};
      var data = this.getTemplateData();

      this.disabled = false;

      BaseView.apply(this, arguments);

      this.$el.addClass('link-button');
      if (data.icon) {
        this.$el.addClass('link-button-icon');
        if (!data.title) {
          this.$el.addClass('icon-only');
        }
      }
    },

    getTemplateData: function getTemplateData() {
      return {
        href: this.__getAttribute('href'),
        title: this.__getAttribute('title'),
        icon: this.__getAttribute('icon')
      };
    },

    initialize: function initialize() {
      ViewUtil.applyDoWhen(this, _.resultCtx(this, 'enableWhen', this), this.toggle);
      ViewUtil.applyDoWhen(this, _.resultCtx(this, 'showWhen', this), this.toggleVisible);
    },

    render: function render() {

      BaseView.prototype.render.apply(this, arguments);

      if (!_.result(this, 'enabled')) {
        this.toggle(false);
      }

      if (!_.result(this, 'visible')) {
        this.toggleVisible(false);
      }

      var data = this.getTemplateData();
      this.$el.attr('href', data.href || '#');

      return this;
    },

    __getAttribute: function __getAttribute(name, defaultValue) {
      var value = _.resultCtx(this.options, name, this);
      if (_.isUndefined(value)) {
        value = _.result(this, name);
      }
      return !_.isUndefined(value) ? value : defaultValue;
    },

    enable: function enable() {
      this.toggle(true);
    },

    disable: function disable() {
      this.toggle(false);
    },

    show: function show() {
      this.toggleVisible(true);
    },

    hide: function hide() {
      this.toggleVisible(false);
    },

    toggle: function toggle(enable) {
      //this is to toggle the enability
      var bool = !!enable && _.result(this, 'enabled');
      this.disabled = !bool;
      this.$el.toggleClass('link-button-disabled btn-disabled disabled', this.disabled);

      // delegateEvents asynchronously in case the button is not yet added to the DOM
      // in these cases the alternate events won't work
      _.defer(_.bind(function () {
        this.delegateEvents(this.disabled ? disabledEvents : null);
      }, this));
    },

    toggleVisible: function toggleVisible(visible) {
      var hidden = !visible || !_.result(this, 'visible');
      this.$el.toggleClass('hide', hidden);
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(0), __webpack_require__(1)], __WEBPACK_AMD_DEFINE_RESULT__ = (function ($, _, BaseView) {

  var defaults = {
    level: 'success',
    message: 'Great Success!',
    hide: true,
    fade: 400,
    delay: 3000,
    width: 0,
    dismissable: false
  };

  return BaseView.extend({

    className: 'infobox infobox-confirm infobox-confirm-fixed',

    events: {
      'click .infobox-dismiss-link': function clickInfoboxDismissLink(e) {
        e.preventDefault();
        this.fadeOut();
      }
    },

    template: '\
      {{#if dismissable}}\
      <a class="infobox-dismiss-link" title="Dismiss" href="#">\
        <span class="dismiss-icon"></span>\
      </a>\
      {{/if}}\
      <span class="icon {{level}}-16"></span>\
      {{#if title}}<h3>{{title}}</h3>{{/if}}\
      <p>{{message}}</p>\
    ',

    initialize: function initialize() {
      this.options = _.defaults({}, this.options, defaults);
      this.$el.addClass('infobox-' + this.options.level);
      if (this.options.width) {
        this.$el.width(this.options.width).css({
          'margin-left': '0px',
          'left': Math.round(($(window).width() - this.options.width) / 2)
        });
      }
    },

    getTemplateData: function getTemplateData() {
      return _.extend(_.pick(this.options, 'level', 'message', 'title'), {
        dismissable: this.options.hide === false || this.options.dismissable === true
      });
    },

    postRender: function postRender() {
      if (this.options.hide) {
        _.delay(_.bind(this.fadeOut, this), this.options.delay);
      }
    },

    fadeOut: function fadeOut() {
      this.$el.fadeOut(this.options.fade, _.bind(this.remove, this));
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(47)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (BaseFormDialog) {

  return BaseFormDialog.extend({

    'save': 'OK',

    params: {
      minWidth: 500,
      maxWidth: 700,
      close: true
    },

    constructor: function constructor() {
      BaseFormDialog.apply(this, arguments);

      if (this.content) {
        this.add(this.content);
      }

      this.listenTo(this, 'save', function () {
        var callback = this.ok || this.options.ok;
        callback && callback();
        this.remove();
      });

      this.listenTo(this, 'cancel', function () {
        var callback = this.cancelFn || this.options.cancelFn;
        callback && callback();
      });
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(0), __webpack_require__(1), __webpack_require__(48), __webpack_require__(28)], __WEBPACK_AMD_DEFINE_RESULT__ = (function ($, _, BaseView, BaseModalDialog, BaseForm) {

  var FORM_FIELDS = ['save', 'noCancelButton', 'inputs', 'subtitle', 'autoSave', 'focus', 'cancel', 'danger', 'hasSavingState', 'customSavingState', 'parseErrorMessage'];
  var FORM_DEFAULTS = {
    layout: 'o-form-wrap',
    scrollOnError: false
  };

  // jquery.simplemodoal options
  var SIMPLE_MODAL_PARAMS = {
    minWidth: 600,
    maxWidth: 950,
    focus: false,
    close: false,
    autoResize: false, // (use the resizeModal method, so that the scrolling goes to content, not the whole modal)
    autoPosition: true
  };

  /**
   * Okta.FormDialog is a facade layer for a form that lives in a modal dialog.
   *
   * The API is proxying the {@link module:Okta.Form|Form} API for the most part.
   * It also triggers all the form events
   * It takes care of repositioning, resizing, closing the dialog on cancel, and so on.
   *
   * @class module:Okta.FormDialog
   * @extends module:Okta.View
   * @borrows module:Okta.Form#event:save as save
   * @borrows module:Okta.Form#event:saved as saved
   * @borrows module:Okta.Form#event:resize as resize
   * @borrows module:Okta.Form#event:cancel as cancel
   * @borrows module:Okta.Form#title as #title
   * @borrows module:Okta.Form#subtitle as #subtitle
   * @borrows module:Okta.Form#save as #save
   * @borrows module:Okta.Form#inputs as #inputs
   * @borrows module:Okta.Form#noCancelButton as #noCancelButton
   * @borrows module:Okta.Form#autoSave as #autoSave
   * @borrows module:Okta.ModalDialog#params as #params
   * @borrows module:Okta.Form#addInput as #addInput
   * @borrows module:Okta.Form#addButton as #addButton
   * @borrows module:Okta.Form#addDivider as #addDivider
   * @borrows module:Okta.Form#addSectionTitle as #addSectionTitle
   * @borrows module:Okta.Form#clearErrors as #clearErrors
   * @example
   * var AddUserDialog = Okta.FormDialog({
   *   autoSave: true,
   *   title: 'Add a User',
   *   inputs: [
   *     {
   *       type: 'text',
   *       name: 'fname',
   *       label: 'First Name'
   *     },
   *     {
   *       type: 'text',
   *       name: 'lname',
   *       label: 'Last Name'
   *     }
   *   ]
   * });
   *
   * // renders the modal dialog on the page
   * var dialog = new AddUserDialog({model: new MyModel()}).render();
   * this.listenTo(dialog, 'saved', function (model) {
   *   // the model is now saved
   * });
   */
  return BaseView.extend( /** @lends module:Okta.FormDialog.prototype */{

    constructor: function constructor(options) {
      /* eslint max-statements: [2, 13] */

      var Form = BaseForm.extend(_.extend({}, FORM_DEFAULTS, _.pick(this, FORM_FIELDS)));
      this.form = new Form(_.omit(options, 'title', 'subtitle'));

      this.listenTo(this.form, 'resize', _.debounce(_.bind(this.resizeModal, this), 100));

      // trigger all form events
      var removeFn = _.bind(this.remove, this);
      this.listenTo(this.form, 'all', function () {
        this.trigger.apply(this, arguments);
        if (arguments[0] === 'cancel') {
          removeFn();
        }
      });

      $(window).resize(_.debounce(_.bind(this.resizeModal, this), 100));

      var Dialog = BaseModalDialog.extend({
        title: this.title,
        className: this.className,
        params: _.extend({}, SIMPLE_MODAL_PARAMS, this.params)
      });

      this.dialog = new Dialog(options);
      this.dialog.add(this.form);
      this.el = this.dialog.el;

      BaseView.apply(this, arguments);

      if (this.form.getAttribute('autoSave')) {
        this.listenTo(this, 'saved', this.remove);
      }
    },

    /**
     * The form instance generated by the constructor.
     * Should **not** be referenced locally, exposed externally for test purposes.
     * @type {Okta.Form}
     * @private
     * @readonly
     */
    form: undefined,

    /**
     * The dialog instance generated by the constructor.
     * Should **not** be referenced locally, exposed externally for test purposes.
     * @type {Okta.ModalDialog}
     * @private
     * @readonly
     */
    dialog: undefined,

    addInput: function addInput() {
      return this.form.addInput.apply(this.form, arguments);
    },

    addButton: function addButton() {
      return this.form.addButton.apply(this.form, arguments);
    },

    addDivider: function addDivider() {
      return this.form.addDivider.apply(this.form, arguments);
    },

    addSectionTitle: function addSectionTitle() {
      return this.form.addSectionTitle.apply(this.form, arguments);
    },

    add: function add() {
      return this.form.add.apply(this.form, arguments);
    },

    render: function render() {
      this.preRender();
      this.dialog.render.apply(this.dialog, arguments);
      _.defer(_.bind(this.resizeModal, this));
      this.postRender();
      return this;
    },

    remove: function remove() {
      this.dialog.remove.apply(this.dialog, arguments);
      return BaseView.prototype.remove.apply(this, arguments);
    },

    /**
     * Resize modal to fit window height
     * the whole modal will be within the viewport, only the form content is scrollable
     * there's no good solution to totally fix the width issue yet for tiny window,
     * leave it for jquery simplemodal autoResize to do its best
     */
    resizeModal: function resizeModal() {
      var modal = $('.simplemodal-wrap'),
          form = this.form,
          modalHeight = modal.height(),
          modalMinHeight = _.isNumber(this.dialog.params.minHeight) ? this.dialog.params.minHeight : 0,
          windowHeight = $(window).height();
      if (modalMinHeight <= modalHeight) {
        if (modalHeight >= windowHeight) {
          form.contentHeight(windowHeight - this.dialog.$('h2').outerHeight() - form.$('.o-form-button-bar').outerHeight() - (modal.outerHeight(true) - form.$el.outerHeight(true)));
        } else {
          form.contentHeight(form.contentHeight() + (windowHeight - modal.outerHeight()));
        }
        this.dialog.resize.apply(this.dialog, arguments);
      }
    },

    clearErrors: function clearErrors() {
      return this.form.clearErrors.apply(this.form, arguments);
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(0), __webpack_require__(3), __webpack_require__(1), __webpack_require__(19)], __WEBPACK_AMD_DEFINE_RESULT__ = (function ($, _, TemplateUtil, BaseView) {

  var tpl = TemplateUtil.tpl;

  /**
  * A view that renders as a modal dialog.
  * The template of the view will render inside a dialog.
  *
  * It uses [SimpleModal](http://www.ericmmartin.com/projects/simplemodal) as the base modal widget.
  *
  * In the context of a {@link module:Okta.View|View}, do not `add` this view to the container - simply call render
  * A modal dialog is a special view in terms of - it has an overlay and takes over the screen, so conceptually
  * it is not a part of any other view.
  *
  * @class module:Okta.ModalDialog
  * @extends module:Okta.View
  */
  return BaseView.extend( /** @lends module:Okta.ModalDialog.prototype */{

    /**
     * Parameters to pass to the simplemodal plugin.
     * See [Available Options](http://www.ericmmartin.com/projects/simplemodal/#options).
     * @type {Object}
     * @property {Object} [params]
     */
    params: {},

    constructor: function constructor() {
      BaseView.apply(this, arguments);
      this.$el.addClass('simplemodal-wrap');

      // garbage collection - remove the view when modal is closed
      this.params = _.extend({
        onClose: _.bind(_.throttle(this.remove, 64), this)
      }, this.params || {});
    },

    render: function render() {
      /* eslint max-statements: [2, 16] */

      this.delegateEvents(); // modal may be rendered multiple times
      BaseView.prototype.render.apply(this, arguments);

      var options = _.extend({}, _.pick(this, 'title', 'subtitle'), _.pick(this.options, 'title', 'subtitle'));

      if (options.subtitle) {
        var subtitle = _.resultCtx(options, 'subtitle', this);
        this.$el.prepend(tpl('<p class="modal-subtitle text-light \
          padding-20 margin-btm-0">{{subtitle}}</p>')({ subtitle: subtitle }));
      }

      if (options.title) {
        var title = _.resultCtx(options, 'title', this);
        this.$el.prepend(tpl('<h2 class="block modal-title">{{title}}</h2>')({ title: title }));
      }

      // running deferred fixes a rendering issue with simplemodal
      _.defer(_.bind(function () {
        this.$el.modal(this.params);
        this.resize();
      }, this));

      // make sure scrolling on the body is disabled;
      $('body').css('overflow', 'hidden');

      return this;
    },

    remove: function remove() {
      $.modal.close();
      // re-enable document scroll; blank property value removes property altogether
      $('body').css('overflow', '');
      _.defer(function () {
        $.modal.close();
      });
      return BaseView.prototype.remove.apply(this, arguments);
    },

    /**
     * Adjusts the modal content size based on the current content
     */
    resize: function resize() {
      $.modal.update(this.$el.outerHeight());
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint max-params: 0, complexity: 0, max-statements: 0 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(29)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, InputRegistry) {

  function createInput(Input, options) {
    if (InputRegistry.isBaseInput(Input)) {
      return Input.prototype ? new Input(_.omit(options, 'input')) : Input;
    } else {
      return Input;
    }
  }

  function create(options) {
    options = _.clone(options);
    if (options.input) {
      return createInput(options.input, options);
    }
    var Input = InputRegistry.get(options);
    if (!Input) {
      throw new Error('unknown input: ' + options.type);
    }
    return createInput(Input, options);
  }

  function supports(options) {
    return !!options.input || !!InputRegistry.get(options);
  }

  return {
    create: create,
    supports: supports
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(3), __webpack_require__(1), __webpack_require__(30)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, TemplateUtil, BaseView) {

  /**
   * @class InputLabel
   * @extends {Okta.View}
   * @private
   * The input's label.
   */
  return BaseView.extend({

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
    constructor: function constructor(options) {
      /* eslint max-statements: [2, 16] complexity: [2, 7]*/
      _.defaults(options, { inputId: options.id });
      delete options.id;

      BaseView.apply(this, arguments);

      var template;
      if (this._isLabelView(options.label)) {
        template = '<label for="{{inputId}}"></label>';
      } else if (_.contains(['radio', 'checkbox'], options.type) || !options.label) {
        template = '{{label}}';
      } else {
        //space added in the end of the label to avoid selecting label text with double click in read mode
        template = '<label for="{{inputId}}">{{label}}&nbsp;</label>';
      }
      if (options.sublabel) {
        template += '<span class="o-form-explain">{{sublabel}}</span>';
      }
      if (options.tooltip) {
        if (_.isString(options.tooltip)) {
          options.tooltip = {
            text: options.tooltip
          };
        }
        template += '<span class="o-form-tooltip icon-16 icon-only form-help-16" title="{{tooltip.text}}"></span>';
      }
      this.template = TemplateUtil.tpl(template);
    },

    getTemplateData: function getTemplateData() {
      var options = { label: '' };
      _.each(['inputId', 'label', 'sublabel', 'tooltip'], function (option) {
        options[option] = _.resultCtx(this.options, option, this);
      }, this);

      return options;
    },

    _isLabelView: function _isLabelView(label) {
      return !_.isUndefined(label) && label instanceof BaseView;
    },

    postRender: function postRender() {
      var options = this.getTemplateData();
      if (this._isLabelView(options.label)) {
        this.removeChildren();
        this.add(options.label, 'label');
      }

      if (options.tooltip) {
        this.$('.o-form-tooltip').qtip(_.extend({
          style: { classes: 'qtip-custom qtip-shadow' },
          position: {
            my: 'bottom left',
            at: 'top center'
          },
          hide: { fixed: true },
          show: { delay: 0 }
        }, options.tooltip.options));
      }
    }
  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(1), __webpack_require__(9)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, BaseView, FormUtil) {

  function runCallback(callback, field) {
    callback.apply(this, _.map(field.split(/\s+/), function (field) {
      return this.model.get(field);
    }, this));
  }

  function runIf(fn, ctx) {
    if (_.isFunction(fn)) {
      fn.call(ctx);
    }
  }

  /**
   * @class InputWrapper
   * @extends Okta.View
   * @private
   * The outer wrapper that warps the label and the input container
   */
  return BaseView.extend({

    className: function className() {
      var className = 'o-form-fieldset';

      if (this.options['label-top']) {
        className += ' o-form-label-top';
      }

      if (this.options.readOnly) {
        className += ' o-form-read-mode';
      }

      return className;
    },

    attributes: function attributes() {
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
    constructor: function constructor(options) {
      if (options.className) {
        this.inputWrapperClassName = this.className;
        this.optionsClassName = options.className;
        options.className = function () {
          return _.result(this, 'inputWrapperClassName', '') + ' ' + _.result(this, 'optionsClassName');
        };
      }
      BaseView.apply(this, arguments);
      _.each(options.events || {}, function (callback, event) {
        this.listenTo(this.model, event, callback);
      }, this);

      _.each(options.bindings || {}, function (callback, field) {
        this.listenTo(this.model, FormUtil.changeEventString(field.split(/\s+/)), _.bind(runCallback, this, callback, field));
      }, this);

      FormUtil.applyShowWhen(this, options.showWhen);
      FormUtil.applyToggleWhen(this, options.toggleWhen);

      runIf(options.initialize, this);
    },

    postRender: function postRender() {
      _.each(this.options.bindings || {}, runCallback, this);
      runIf(this.options.render, this);
    },

    /**
     * @return {InputLabel}
     */
    getLabel: function getLabel() {
      return this.size() > 1 ? this.at(0) : null;
    },
    /**
     * @deprecated ambiguous naming, use {@link #getInputContainer}
     */
    getInput: function getInput() {
      return this.getInputContainer();
    },

    /**
     * @return {InputContainer}
     */
    getInputContainer: function getInputContainer() {
      return this.at(this.size() > 1 ? 1 : 0);
    },

    /**
     * @return {BaseInput[]}
     */
    getInputs: function getInputs() {
      return this.getInputContainer().toArray();
    },

    focus: function focus() {
      return this.getInput().focus();
    }
  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (BaseView) {

  var template = '\
    <div class="okta-form-infobox-error infobox infobox-error" role="alert">\
      <span class="icon error-16"></span>\
      {{#if errorSummary}}\
        <p>{{errorSummary}}</p>\
      {{else}}\
        <p>{{i18n code="oform.errorbanner.title" bundle="courage"}}</p>\
      {{/if}}\
    </div>\
  ';

  return BaseView.extend({
    template: template,
    modelEvents: {
      'form:clear-errors': 'remove'
    }
  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(4)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, StringUtil) {

  var FIELD_REGEX = /^([\S]+): (.+)$/;

  return {

    /**
     * Helper function that returns the json output of an xhr objext
     * @param  {jqXhr} xhr
     * @return {Object}
     */
    getResponseJSON: function getResponseJSON(xhr) {
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
    parseErrorSummary: function parseErrorSummary(errorSummary) {
      // error format is: `fieldName: The field cannot be left blank`
      var matches = errorSummary.match(FIELD_REGEX);
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
    parseErrorCauseObject: function parseErrorCauseObject(errorCause) {
      if (errorCause.property && errorCause.errorSummary) {
        var localizedMsg = StringUtil.localize(errorCause.reason),
            apiMsg = errorCause.errorSummary,
            field = errorCause.property,
            errorMessage = localizedMsg.indexOf('L10N_ERROR[') === -1 ? localizedMsg : apiMsg;
        return [field, errorMessage];
      }
    },

    parseErrors: function parseErrors(resp) {
      var responseJSON = this.getResponseJSON(resp);
      return _.map(responseJSON && responseJSON.errorCauses || [], function (errorCause) {
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
    parseFieldErrors: function parseFieldErrors(resp) {
      var responseJSON = this.getResponseJSON(resp),
          errors = {};

      // xhr error object
      if (responseJSON) {
        /* eslint complexity: [2, 7] */
        _.each(responseJSON.errorCauses || [], function (cause) {
          var res = [];
          if (cause.property && cause.errorSummary) {
            res = this.parseErrorCauseObject(cause);
          } else {
            res = this.parseErrorSummary(cause && cause.errorSummary || '');
          }
          if (res) {
            var fieldName = res[0],
                message = res[1];
            errors[fieldName] || (errors[fieldName] = []);
            errors[fieldName].push(message);
          }
        }, this);
      }
      // validation key/value object
      else if (_.isObject(resp) && _.size(resp)) {
          _.each(resp, function (msg, field) {
            errors[field] = [msg];
          });
        }
      return _.size(errors) ? errors : undefined;
    }
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(9)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (BaseView, FormUtil) {

  return BaseView.extend({

    el: '<span class="o-form-toggle" data-type="header-btn"></span>',

    formTitle: '',

    modelEvents: {
      'change:__edit__': 'toggle'
    },

    initialize: function initialize() {
      this.addButton();
    },

    addButton: function addButton() {
      if (this.model.get('__edit__')) {
        this.add(FormUtil.createReadFormButton({ type: 'cancel' }));
      } else {
        this.add(FormUtil.createReadFormButton({
          type: 'edit',
          formTitle: this.formTitle
        }));
      }
    },

    toggle: function toggle() {
      this.removeChildren();
      this.addButton();
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(3), __webpack_require__(7), __webpack_require__(1), __webpack_require__(15)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, TemplateUtil, Logger, BaseView, Util) {
  /**
   * @class InputContainer
   * @private
   *
   * TODO: OKTA-80796
   * Attention: Please change with caution since this is used in other places
   */

  var isABaseView = Util.isABaseView;

  return BaseView.extend({

    attributes: function attributes() {
      return {
        'data-se': 'o-form-input-container'
      };
    },

    className: function className() {
      var className = 'o-form-input';
      if (this.options.wide) {
        className += ' o-form-wide';
      }
      if (_.contains([1, 2, 3, 4], this.options.multi)) {
        className += ' o-form-multi-input-' + this.options.multi;
        if (_.isArray(this.options.input)) {
          var inputGroup = _.find(this.options.input, function (input) {
            return _.contains(['text+select', 'select+text'], input.options.type);
          });
          inputGroup && (className += ' o-form-multi-input-group-' + this.options.multi);
        }
      }
      return className;
    },

    _getNames: function _getNames() {
      /*eslint complexity: 0 */
      var names = _.isArray(this.options.name) ? this.options.name : [this.options.name];
      if (this.options.type == 'group') {
        names.push.apply(names, _.pluck(this.options.input[0].options.params.inputs, 'name'));
      } else if (_.isArray(this.options.name)) {
        if (this.options.input && this.options.input.options && this.options.input.options.name) {
          names.push(this.options.input.options.name);
        }
      } else if (this.options.input) {
        if (_.isArray(this.options.input)) {
          _.each(this.options.input, function (inputItem) {
            names.push(inputItem.options.name);
          });
        } else {
          names.push(this.options.input.options.name);
        }
      }
      return _.uniq(_.compact(names));
    },

    constructor: function constructor() {
      /* eslint max-statements: [2, 18] */
      BaseView.apply(this, arguments);

      // we want to append the input *before* the explain text
      if (this.options.input) {
        if (_.isArray(this.options.input)) {
          _.each(this.options.input, function (inputItem) {
            this.add(inputItem, { prepend: true });
          }, this);
        } else {
          this.add(this.options.input, { prepend: true });
        }
      }

      this.__setExplain(this.options);

      var names = this._getNames();

      this.listenTo(this.model, 'form:field-error', function (name, errors) {
        if (_.contains(names, name)) {
          this.__setError(errors);
        }
      });

      this.listenTo(this.model, 'form:clear-errors change:' + names.join(' change:'), this.__clearError);
      this.listenTo(this.model, 'form:clear-error:' + names.join(' form:clear-error:'), this.__clearError);

      if (_.resultCtx(this.options, 'autoRender', this)) {
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
    __setExplain: function __setExplain(options) {
      var explain;

      // Deprecated - if you need custom html, use explain instead
      if (options.customExplain) {
        Logger.warn('Deprecated - use explain instead of customExplain');
        this.add(this.options.customExplain);
        return;
      }

      explain = options.explain;
      if (_.isFunction(explain) && !isABaseView(explain)) {
        explain = _.resultCtx(this.options, 'explain', this);
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
    __setError: function __setError(errors) {

      this.__errorState = true;
      this.$el.addClass('o-form-has-errors');

      var tmpl = ['<p class="okta-form-input-error o-form-input-error o-form-explain" role="alert">', '<span class="icon icon-16 error-16-small"></span>', '{{text}}', '</p>'].join('');

      var html = TemplateUtil.tpl(tmpl)({ text: errors.join(', ') });
      var $elExplain = this.$('.o-form-explain').not('.o-form-input-error').first();

      if ($elExplain.length) {
        $elExplain.before(html);
      } else {
        this.$el.append(html);
      }
    },

    /**
     * Un-highlight the input and remove explaination text
     * @private
     */
    __clearError: function __clearError() {
      if (this.__errorState) {
        this.$('.o-form-input-error').remove();
        this.$el.removeClass('o-form-has-errors');
        this.__errorState = false;
        _.defer(_.bind(function () {
          this.model.trigger('form:resize');
        }, this));
      }
    },

    focus: function focus() {
      this.each(function (view) {
        if (view.focus) {
          return view.focus();
        }
      });

      return this;
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint max-params: [2, 6], max-len: [2, 150] */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(0), __webpack_require__(1), __webpack_require__(57), __webpack_require__(27), __webpack_require__(26)], __WEBPACK_AMD_DEFINE_RESULT__ = (function ($, _, BaseView, StateMachine, SettingsModel, BaseRouter) {

  function clean(obj) {
    var res = {};
    _.each(obj, function (value, key) {
      if (!_.isNull(value)) {
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
  return BaseView.extend( /** @lends module:Okta.Controller.prototype */{

    constructor: function constructor(options) {
      /* eslint max-statements: [2, 13], complexity: [2, 7]*/
      options || (options = {});

      var stateData = _.defaults(clean(options.state), this.state || {});
      this.state = new StateMachine(stateData);
      delete options.state;

      if (options.settings) {
        this.settings = options.settings;
      } else {
        // allow the controller to live without a router
        this.settings = options.settings = new SettingsModel(_.omit(options || {}, 'el'));
        this.listen('notification', BaseRouter.prototype._notify);
        this.listen('confirmation', BaseRouter.prototype._confirm);
      }

      BaseView.call(this, options);

      this.listenTo(this.state, '__invoke__', function () {
        var args = _.toArray(arguments),
            method = args.shift();
        if (_.isFunction(this[method])) {
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
    render: function render() {
      var args = arguments,
          self = this;
      $(function () {
        BaseView.prototype.render.apply(self, args);
      });
      return this;
    },

    /**
     * Creates the view constructor options
     * @param {Object} [options] Extra options
     * @return {Object} The view constructor options
     */
    toJSON: function toJSON(options) {
      return _.extend(_.pick(this, 'state', 'settings', 'collection', 'model'), options || {});
    },

    /**
     * Removes the child views, empty the DOM element and stop listening to events
     */
    remove: function remove() {
      this.removeChildren();
      this.stopListening();
      this.$el.empty();
      return this;
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(11)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, Model) {

  /**
   * @class StateMachine
   * @extends Okta.Model
   * @private
   *
   * A state object that holds the applciation state
   */

  return Model.extend({
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
    invoke: function invoke() {
      var args = _.toArray(arguments);
      args.unshift('__invoke__');
      this.trigger.apply(this, args);
    }
  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(59)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, Cookie) {

  var SECURED_COOKIE = /^https/.test(window.location.href);

  return {
    setCookie: function setCookie(name, value, options) {
      Cookie.set(name, value, _.defaults(options || {}, {
        secure: SECURED_COOKIE,
        path: '/'
      }));
    },

    getCookie: function getCookie() {
      return Cookie.get.apply(Cookie, arguments);
    },

    removeCookie: function removeCookie() {
      return Cookie.remove.apply(Cookie, arguments);
    }
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 59 */
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
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(5)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, Backbone) {

  function Class(options) {
    this.options = _.clone(options || {});
    this.cid = _.uniqueId('class');
    this.initialize.apply(this, arguments);
  }

  _.extend(Class.prototype, Backbone.Events, {
    initialize: function initialize() {}
  });

  Class.extend = Backbone.Model.extend;

  return Class;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(62)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (moment) {

  var MOMENT_UNIT = {
    'MILLISECOND': 'milliseconds',
    'SECOND': 'seconds',
    'MINUTE': 'minutes',
    'HOUR': 'hours',
    'DAY': 'days'
  };

  return {
    MINUTES_HOURS_DAYS: {
      'MINUTE': 'Minutes',
      'HOUR': 'Hours',
      'DAY': 'Days'
    },

    MILLISECONDS_SECONDS_MINUTES: {
      'MILLISECOND': 'Milliseconds',
      'SECOND': 'Seconds',
      'MINUTE': 'Minutes'
    },

    // TODO: OKTA-32410 proper fix for displaying PDT
    convertToPDT: function convertToPDT(milliseconds, formatter, defaultText) {
      // 'Apr 17, 2014 8:37:50 AM' or 'Never'
      formatter || (formatter = 'MMM DD, YYYY h:mm:ss A');
      defaultText || (defaultText = '');
      return milliseconds ? moment(milliseconds).utc().utcOffset('-07:00').format(formatter) : defaultText;
    },

    /**
     * @method getTimeInHighestRelevantUnit
     * Will return a number in the units of the highest relevant time unit.
     * Only checks milliseconds, seconds, minutes, hours, and days.
     * E.g.
     *   15 minutes -> 15 minutes
     *   60 minutes ->  1 hours
     *   90 minutes -> 90 minutes
     *   24 hours   ->  1 days
     *
     * @param {Number} val  The amount of time
     * @param {String} unit The units that val is in
     * @return {Object} An object containing the amount of time and the units it's in
     */
    getTimeInHighestRelevantUnit: function getTimeInHighestRelevantUnit(val, unit) {
      var duration = moment.duration(val, MOMENT_UNIT[unit] || unit);
      var highestUnit;
      if (duration.milliseconds() !== 0) {
        highestUnit = 'milliseconds';
      } else if (duration.seconds() !== 0) {
        highestUnit = 'seconds';
      } else if (duration.minutes() !== 0) {
        highestUnit = 'minutes';
      } else if (duration.hours() !== 0) {
        highestUnit = 'hours';
      } else {
        highestUnit = 'days';
      }
      return {
        time: duration.as(highestUnit),
        unit: this.convertMomentUnits(highestUnit)
      };
    },

    /**
     * @method convertMomentUnits
     * Does the conversion between moment's units and our units internally
     *
     * @param {String} momentUnit The units that val is in
     * @return {String} The key in the MINUTES_HOURS_DAYS hash
     */
    convertMomentUnits: function convertMomentUnits(momentUnit) {
      switch (momentUnit) {
        case 'milliseconds':
          return 'MILLISECOND';
        case 'seconds':
          return 'SECOND';
        case 'minutes':
          return 'MINUTE';
        case 'hours':
          return 'HOUR';
        case 'days':
          return 'DAY';
        default:
          throw new Error('Time unit not recognized: ' + momentUnit);
      }
    },

    /**
     * @method convertTimeUnit
     * Converts a given value from one unit to another
     *
     * @param {Number} val The amount of time in fromUnits
     * @param {String} fromUnit The units that val is in on input
     * @param {String} toUnit The units to convert to
     * @return {Number} The amount of time in toUnits
     */
    convertTimeUnit: function convertTimeUnit(val, fromUnit, toUnit) {
      val = parseInt(val, 10);
      fromUnit = MOMENT_UNIT[fromUnit] || fromUnit;
      toUnit = MOMENT_UNIT[toUnit] || toUnit;
      return moment.duration(val, fromUnit).as(toUnit);
    },

    /**
     * @method convertTimeFormat
     * Converts a given time string from one format to another in local time
     *
     * @param {String} timeString The time string to be parsed
     * @param {String} fromFormatter The timeString's parser format
     * @param {String} toFormatter The format that the timeString to convert to
     * @return {String} The time string in the converted format in local time
     */
    convertTimeFormat: function convertTimeFormat(timeString, fromFormatter, toFormatter) {
      toFormatter || (toFormatter = 'MMMM Do, YYYY');
      return moment(timeString, fromFormatter).format(toFormatter);
    }
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* global okta */
/* eslint @okta/okta/no-specific-modules: 0 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (moment) {
  if (typeof okta != 'undefined' && (okta.locale || 'en')) {
    moment.locale(okta.locale || 'en');
  }
  return moment;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(64)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (BaseView, ListView) {
  /**
  * See {@link src/framework/ListView} for more detail and examples from the base class.
  * @class module:Okta.ListView
  * @extends src/framework/ListView
  * @mixes module:Okta.View
  */
  return BaseView.decorate(ListView);
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(24)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
  /* global module, exports */
  else if (typeof require == 'function' && (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) == 'object') {
      module.exports = factory(require('okta/underscore'), require('./View'));
    } else {
      root.Archer || (root.Archer = {});
      root.Archer.ListView = factory(root._, root.Archer.View);
    }
})(undefined, function (_, View) {
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
  return View.extend( /** @lends src/framework/ListView.prototype */{

    constructor: function constructor() {
      View.apply(this, arguments);
      if (!this.collection) {
        throw new Error('Missing collection');
      }
      this.listenTo(this.collection, 'reset sort', this.reset);
      this.listenTo(this.collection, 'add', this.addItem);
      this.collection.each(this.addItem, this);
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
    reset: function reset() {
      this.removeChildren();
      this.collection.each(this.addItem, this);
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
    addItem: function addItem(model) {
      var view = this.add(this.item, this.itemSelector, { options: { model: model } }).last();
      view.listenTo(model, 'destroy remove', view.remove);
      return this;
    }

  });
});

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(2), __webpack_require__(3), __webpack_require__(1)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, $, TemplateUtil, BaseView) {

  var optionsTemplate = TemplateUtil.tpl('\
    <a class="icon-16 {{className}}" data-se="{{seleniumId}}">\
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
   ');

  var DropDownOption = BaseView.extend({
    tagName: 'li',

    events: {
      click: function click(e) {
        e.preventDefault();
        this.action && this.action.call(this);
      }
    },

    constructor: function constructor() {
      BaseView.apply(this, arguments);
      this.$el.addClass('okta-dropdown-option option');
    },

    render: function render() {
      this.$el.html(optionsTemplate({
        icon: _.result(this, 'icon'),
        className: _.result(this, 'className') || '',
        title: _.result(this, 'title'),
        subtitle: _.result(this, 'subtitle'),
        seleniumId: _.result(this, 'seleniumId')
      }));
      return this;
    }
  });

  return BaseView.extend({

    events: {
      'click a.option-selected': function clickAOptionSelected(e) {
        e.preventDefault();
        if (_.result(this, 'disabled')) {
          e.stopPropagation();
        }
      },
      'click .dropdown-disabled': function clickDropdownDisabled(e) {
        e.preventDefault();
        e.stopPropagation();
      }
    },

    items: [],

    constructor: function constructor() {

      // In this very specific case we want to NOT append className to $el
      // but to the <a> tag in the template
      // so we want to disable backbone default functionality.
      var className = this.className;
      this.className = null;

      BaseView.apply(this, arguments);

      this.className = className;

      this.$el.addClass('dropdown more-actions float-l');

      _.each(_.result(this, 'items'), function (option) {
        this.addOption(option, this.options);
      }, this);
    },

    template: '\
      <a href="#" class="link-button {{className}} link-button-icon option-selected center">\
        {{#if icon}}\
        <span class="icon {{icon}}"></span>\
        {{/if}}\
        <span class="option-selected-text">{{title}}</span>\
        <span class="icon-dm"></span>\
      </a>\
      <div class="options clearfix" style="display: none;">\
      <ul class="okta-dropdown-list options-wrap clearfix"></ul>\
      </div>\
    ',

    getTemplateData: function getTemplateData() {
      var className = [_.result(this, 'className') || '', _.result(this, 'disabled') ? 'dropdown-disabled' : ''];
      return {
        icon: _.result(this, 'icon'),
        className: $.trim(className.join(' ')),
        title: _.result(this, 'title')
      };
    },

    addOption: function addOption(proto, options) {
      this.add(DropDownOption.extend(proto), 'ul.options-wrap', { options: options || {} });
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint max-statements: 0, max-params: 0 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(4), __webpack_require__(67), __webpack_require__(70), __webpack_require__(22)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, StringUtil, BooleanSelect, TextBoxSet, EnumTypeHelper) {
  // Maps each __displayType__ to a basic set of inputOptions.
  function defaultOptions(property) {
    /* eslint complexity: [2, 22] */
    var type = property.get('__displayType__'),
        values = property.get('__possibleValues__'),
        name = property.get('name'),
        title = property.get('title');
    var inputOptions = {
      type: 'text',
      name: name,
      label: title || name
    };

    // @see customOptions for enum complex "object" type,
    // a.k.a "object" or "arrayofobject" type has enum values defined.
    // Other cases (e.g., nested object type) are not support yet.

    switch (type) {
      case 'arrayofstring':
        inputOptions.input = TextBoxSet;
        inputOptions.params = { itemType: 'string' };
        break;
      case 'arrayofnumber':
        inputOptions.input = TextBoxSet;
        inputOptions.params = { itemType: 'number' };
        break;
      case 'arrayofinteger':
        inputOptions.input = TextBoxSet;
        inputOptions.params = { itemType: 'integer' };
        break;
      case 'arrayofobject':
        inputOptions.input = TextBoxSet;
        inputOptions.params = { itemType: property.get('items').type };
        break;
      case 'arrayofref-id':
        inputOptions.input = TextBoxSet;
        inputOptions.params = { itemType: property.get('items').format };
        break;
      case 'boolean':
        inputOptions.input = BooleanSelect;
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
          return _.isEmpty(value) ? '' : StringUtil.localize('user.profile.image.image_set', 'courage'); //TODO
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
      case 'language-code':
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
    var inputOptions = {},
        name = property.get('name'),
        type = property.get('__displayType__'),
        values = property.get('__possibleValues__'),
        prefix = property.get('__fieldNamePrefix__');

    if (prefix) {
      inputOptions.name = prefix + name;
      inputOptions.errorField = name;
    }

    if (property.isEnumType()) {
      var configs = {
        displayType: type,
        title: property.get('title'),
        enumValues: property.getEnumValues()
      };
      inputOptions = _.extend({}, EnumTypeHelper.getEnumInputOptions(configs), inputOptions);
    } else if (isArray(type) && values) {
      inputOptions.type = 'checkboxset';
      inputOptions.input = null;
      inputOptions.options = getChoices(values);
    }

    return inputOptions;
  }

  function convertStringToNumber(string) {
    var number = StringUtil.parseFloat(string);
    return string === '' ? null : number;
  }

  function isArray(type) {
    return type && type.indexOf('array') >= 0;
  }

  // converts possibleValues to choices
  // [a, b, c] => {a: a, b: b, c: c}
  function getChoices(values) {
    return _.object(values, values);
  }

  // A schema property may have an objectName either
  // at the root level or nested in the items object
  function getObjectName(schemaProp) {
    var items = schemaProp.get('items');
    if (items) {
      return items.objectName;
    } else {
      return schemaProp.get('objectName');
    }
  }

  function augmentSchemaProp(schemaProp, possibleValues, profile) {
    var name = schemaProp.get('name'),
        prefix = profile['__nestedProperty__'],
        defaultValues = possibleValues[name],
        userValues = profile.get(name),
        //TODO: Not implemented
    fixedValues,
        values;

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
      defaultValues = _.union(defaultValues, userValues);
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
    var objectName = getObjectName(schemaProp),
        results = values[objectName];

    // a schema property that references an empty list of values
    // Im looking at you, google apps.
    if (objectName && _(results).isEmpty()) {
      return false;
    }
    return true;
  }

  return {

    /**
     * Creates the options hash for BaseForm.addInput from a prepared schema
     * property.
     *
     * @param {Okta.Model} [preparedSchemaProp] A schema property backbone model
     * that has been standardized by the prepareSchema method.
     * @return {Object} An object containing all of the options needed by
     * BaseForm's addInput()
     */
    createInputOptions: function createInputOptions(preparedSchemaProp) {
      var custom = customOptions(preparedSchemaProp),
          standard = defaultOptions(preparedSchemaProp);

      // underscore did not support nested extend
      // https://github.com/jashkenas/underscore/issues/162
      if (custom.params && standard.params) {
        custom.params = _.defaults(custom.params, standard.params);
      }
      return _.defaults(custom, standard);
    },

    hasValidSchemaProps: function hasValidSchemaProps(schemaProps, possibleValues) {
      if (_.isEmpty(schemaProps)) {
        return false;
      } else {
        var validSchema = cleanSchema(schemaProps, possibleValues);
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
    prepareSchema: function prepareSchema(schemaProps, possibleValues, profile) {
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
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(32)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (Select) {

  var options = {
    'undefined': 'undefined',
    'true': 'true',
    'false': 'false'
  };

  var from = function from(val) {
    if (val) {
      return 'true';
    }
    if (val === false) {
      return 'false';
    }
    return 'undefined';
  };

  var to = function to(val) {
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

  return Select.extend({

    initialize: function initialize() {
      this.options.options = options;
      this.options.from = from;
      this.options.to = to;
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(1), __webpack_require__(33)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, BaseView, Time) {

  function getOption(callout, option) {
    return _.resultCtx(callout.options, option, callout) || _.result(callout, option);
  }

  function getTopClass(callout) {
    var klass = 'infobox clearfix infobox-' + getOption(callout, 'type');
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

  var events = {
    'click .infobox-dismiss-link': function clickInfoboxDismissLink(e) {
      e.preventDefault();
      this.$el.fadeOut(Time.UNLOADING_FADE, _.bind(function () {
        this.trigger('dismissed');
        this.remove();
      }, this));
    }
  };

  var template = '\
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

  /**
   * @class src/views/components/Callout
   * @extends module:Okta.View
   */

  var Callout = BaseView.extend( /** @lends src/views/components/Callout.prototype */{

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

    constructor: function constructor() {
      this.events = _.defaults(this.events || {}, events);

      BaseView.apply(this, arguments);

      this.$el.addClass(getTopClass(this));

      this.template = template;

      var content = getOption(this, 'content');
      if (content) {
        this.add(content);
      }
    },

    getTemplateData: function getTemplateData() {
      var icon = getOption(this, 'type');
      var size = getOption(this, 'size');
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
        icon: icon,
        title: getOption(this, 'title'),
        subtitle: getOption(this, 'subtitle'),
        bullets: getOption(this, 'bullets'),
        dismissible: getOption(this, 'dismissible')
      };
    }
  });

  /**
   * @class module:Okta.internal.views.components.Callout
   */
  return (/** @lends module:Okta.internal.views.components.Callout */{
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
      create: function create(options) {
        return new Callout(options);
      }
    }
  );
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// Chosen, a Select Box Enhancer for jQuery and Prototype
// by Patrick Filler for Harvest, http://getharvest.com
//
// Version 0.11.1
// Full source at https://github.com/harvesthq/chosen
// Copyright (c) 2011 Harvest http://getharvest.com

// MIT License, https://github.com/harvesthq/chosen/blob/master/LICENSE.md
// This file is generated by `grunt build`, do not edit it by hand.

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(6)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (jQuery) {
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
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(10), __webpack_require__(12), __webpack_require__(71)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, BaseInput, SchemaUtil, DeletableBox) {

  return BaseInput.extend({
    className: 'array-input',

    template: '<a href="#" class="array-inputs-button link-button">Add Another</a>',

    params: {
      itemType: 'string'
    },

    events: {
      'click .array-inputs-button': function clickArrayInputsButton(e) {
        e.preventDefault();
        if (this.isEditMode()) {
          this.addNewElement();
        }
      }
    },

    initialize: function initialize(options) {
      options || (options = {});
      this.params = _.defaults(options.params || {}, this.params);
      this.uniqueIdPrefix = 'array';
    },

    // api returns null for an array that does not have value
    // convert it to an empty array
    from: function from(val) {
      if (!_.isArray(val)) {
        return [];
      }
      return val;
    },

    // @Override
    editMode: function editMode() {
      this._setArrayObject();
      this.$el.html(this.template);
      _.each(this.arrayObject, _.bind(this._addDeletableBox, this));

      return this;
    },

    // @Override
    readMode: function readMode() {
      this.editMode();
      this.$('.array-inputs-button').addClass('link-button-disabled');
    },

    // @Override
    // converts arrayObject to a plain array
    // for string type array, returns all values
    // for number/integer type array, returns values in number type
    val: function val() {
      var values = _.values(this.arrayObject);
      if (_.contains([SchemaUtil.DATATYPE.number, SchemaUtil.DATATYPE.integer], this.params.itemType)) {
        values = _.filter(values, _.isNumber);
      }
      return values;
    },

    focus: function focus() {},

    addNewElement: function addNewElement() {
      var value = '',
          key = _.uniqueId(this.uniqueIdPrefix);
      this.arrayObject[key] = value;
      this._addDeletableBox(value, key);
      // update is called to make sure an empty string value is added for string type array
      this.update();
    },

    _addDeletableBox: function _addDeletableBox(value, key) {
      var deletableBox = new DeletableBox(_.extend(_.pick(this.options, 'read', 'readOnly', 'model'), { key: key, value: value, itemType: this.params.itemType }));
      this.listenTo(deletableBox, 'updateArray', function (updatedValue) {
        if (_.isNull(updatedValue)) {
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

    _setArrayObject: function _setArrayObject() {
      var array = this.model.get(this.options.name);
      this.arrayObject = {};
      if (_.isArray(array) && !_.isEmpty(array)) {
        var keys = [],
            self = this;
        _(array.length).times(function () {
          keys.push(_.uniqueId(self.uniqueIdPrefix));
        });
        this.arrayObject = _.object(keys, array);
      }
    }
  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint max-params: [2, 6] */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(1), __webpack_require__(12), __webpack_require__(4), __webpack_require__(3), __webpack_require__(33)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, BaseView, SchemaUtil, StringUtil, TemplateUtil, Time) {

  var isVowel = function isVowel(string) {
    return (/^[aeiou]/.test(string)
    );
  };

  var getArticle = function getArticle(string) {
    return isVowel(string) ? 'an' : 'a';
  };

  var template = TemplateUtil.tpl('\
    <div class="o-form-input-group-controls">\
      <span class="input-fix o-form-control">\
        <input type="text" class="o-form-text" name="{{key}}" id="{{key}}" value="{{value}}" \
        placeholder="{{placeholder}}"/>\
      </span>\
      <a href="#" class="link-button link-button-icon icon-only clear-input-16">\
        <span class="icon "></span>\
      </a>\
    </div>\
    <p class="o-form-input-error o-form-explain">\
      <span class="icon icon-16 error-16-small"></span> {{errorExplain}}\
    </p>\
  '),
      errorClass = 'o-form-has-errors',
      updateArrayEvent = 'updateArray';

  return BaseView.extend({

    tagName: 'div',

    className: 'o-form-input-group',

    events: {
      'click a': function clickA(e) {
        e.preventDefault();
        this.remove();
      },
      'keyup input': function keyupInput() {
        this.update();
      }
    },

    isEditMode: function isEditMode() {
      return !this.options.readOnly && (this.options.read !== true || this.model.get('__edit__') === true);
    },

    initialize: function initialize() {
      this.template = template(_.extend(this.options, {
        placeholder: this.getPlaceholderText(),
        errorExplain: this.getErrorExplainText()
      }));
      this.update = _.debounce(this.update, this.options.debounceDelay || Time.DEBOUNCE_DELAY);
    },

    render: function render() {
      if (this.isEditMode()) {
        this.$el.html(this.template);
      } else {
        this.$el.text(this.options.value);
        this.$('a').hide();
      }
      return this;
    },

    remove: function remove() {
      this.trigger(updateArrayEvent, null);
      this.$el.slideUp(_.bind(function () {
        BaseView.prototype.remove.call(this, arguments);
      }, this));
    },

    update: function update() {
      var updatedValue = this.$('input').val(),
          parseFunc = _.object([SchemaUtil.DATATYPE.number, SchemaUtil.DATATYPE.integer], [StringUtil.parseFloat, this.parseInt]);
      if (_.has(parseFunc, this.options.itemType)) {
        updatedValue = parseFunc[this.options.itemType](updatedValue);
        !_.isNumber(updatedValue) ? this.markInvalid() : this.clearInvalid();
      }
      this.trigger(updateArrayEvent, updatedValue);
    },

    markInvalid: function markInvalid() {
      this.$el.addClass(errorClass);
    },

    clearInvalid: function clearInvalid() {
      this.$el.removeClass(errorClass);
    },

    getPlaceholderText: function getPlaceholderText() {
      var text = ['Enter'];
      text.push(getArticle(this.options.itemType));
      text.push(this.options.itemType.toLowerCase());
      return text.join(' ');
    },

    getErrorExplainText: function getErrorExplainText() {
      var text = ['Value must be'];
      text.push(getArticle(this.options.itemType));
      text.push(this.options.itemType.toLowerCase());
      return text.join(' ');
    },

    parseInt: function (_parseInt) {
      function parseInt(_x) {
        return _parseInt.apply(this, arguments);
      }

      parseInt.toString = function () {
        return _parseInt.toString();
      };

      return parseInt;
    }(function (string) {
      // native javascript parseInt is aggressive
      // there're cases we don't want a string to be parsed even though it is convertable
      // so that we don't convert a string silently before warning a user the potential error
      // this is to make sure the string is in an integer format before we parse it
      if (/^-?\d+$/.test(string)) {
        var num = parseInt(string, 10);
        return !_.isNaN(num) ? num : string;
      }
      return string;
    })
  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! http://mths.be/placeholder v2.0.7 by @mathias */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(6)], __WEBPACK_AMD_DEFINE_RESULT__ = (function($){

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
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

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

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(3), __webpack_require__(34)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, TemplateUtil, TextBox) {

  var toggleTemplate = TemplateUtil.tpl('\
      <span class="password-toggle">\
        <span class="eyeicon visibility-16 button-show"></span>\
        <span class="eyeicon visibility-off-16 button-hide"></span>\
      </span>\
  ');

  var toggleTimeout = 30000;

  return TextBox.extend({
    initialize: function initialize() {
      if (this.__showPasswordToggle()) {
        this.events['click .password-toggle .button-show'] = '__showPassword';
        this.events['click .password-toggle .button-hide'] = '__hidePassword';
      }
      this.delegateEvents();
    },

    postRender: function postRender() {
      if (this.isEditMode() && this.__showPasswordToggle()) {
        this.$el.append(toggleTemplate);
        this.$el.find('input[type="password"]').addClass('password-with-toggle');
      }
      TextBox.prototype.postRender.apply(this, arguments);
    },

    __showPasswordToggle: function __showPasswordToggle() {
      return this.options.params && this.options.params.showPasswordToggle;
    },

    __showPassword: function __showPassword() {
      var _this = this;

      TextBox.prototype.changeType.apply(this, ['text']);
      this.$('.password-toggle .button-show').hide();
      this.$('.password-toggle .button-hide').show();
      this.passwordToggleTimer = _.delay(function () {
        _this.__hidePassword();
      }, toggleTimeout);
    },

    __hidePassword: function __hidePassword() {
      TextBox.prototype.changeType.apply(this, ['password']);
      this.$('.password-toggle .button-show').show();
      this.$('.password-toggle .button-hide').hide();
      // clear timeout
      if (this.passwordToggleTimer) {
        clearTimeout(this.passwordToggleTimer);
      }
    }
  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(8), __webpack_require__(3), __webpack_require__(10), __webpack_require__(35)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, Keys, TemplateUtil, BaseInput) {

  var template = TemplateUtil.tpl('\
    <input type="checkbox" name="{{name}}" id="{{inputId}}"/>\
    <label for="{{inputId}}" data-se-for-name="{{name}}">{{placeholder}}</label>\
  ');

  return BaseInput.extend({
    template: template,
    /**
    * @Override
    */
    events: {
      'change :checkbox': 'update',
      'keyup': function keyup(e) {
        if (Keys.isSpaceBar(e)) {
          this.$(':checkbox').click();
        } else if (Keys.isEnter(e)) {
          this.model.trigger('form:save');
        }
      }
    },

    /**
    * @Override
    */
    editMode: function editMode() {
      var placeholder = _.resultCtx(this.options, 'placeholder', this);
      if (placeholder === '') {
        placeholder = _.resultCtx(this.options, 'label', this);
      } else if (placeholder === false) {
        placeholder = '';
      }

      this.$el.html(this.template(_.extend(_.omit(this.options, 'placeholder'), { placeholder: placeholder })));
      var $input = this.$(':checkbox');
      $input.prop('checked', this.getModelValue() || false);

      this.$('input').customInput();
      this.model.trigger('form:resize');

      return this;
    },

    /**
     * @Override
    */
    readMode: function readMode() {
      this.editMode();
      this.$(':checkbox').prop('disabled', true);
      return this;
    },

    /**
    * @Override
    */
    val: function val() {
      return this.$(':checkbox').prop('checked');
    },

    /**
    * @Override
    */
    focus: function focus() {
      return this.$(':checkbox').focus();
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/* eslint max-statements: [2, 12], max-params: [2, 6] */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0), __webpack_require__(2), __webpack_require__(8), __webpack_require__(15), __webpack_require__(10), __webpack_require__(1), __webpack_require__(35)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (_, $, Keys, Util, BaseInput, BaseView) {

  var isABaseView = Util.isABaseView;

  var RadioOption = BaseView.extend({
    template: '\
      <input type="radio" name="{{name}}" data-se-name="{{realName}}" value="{{value}}" id="{{optionId}}">\
      <label for="{{optionId}}" data-se-for-name="{{realName}}" class="radio-label">\
        {{label}}\
      </label>\
    ',
    initialize: function initialize(options) {
      var explain;

      explain = options.explain;
      if (_.isFunction(explain) && !isABaseView(explain)) {
        explain = _.resultCtx(this.options, 'explain', this);
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

  return BaseInput.extend({

    /**
    * @Override
    */
    events: {
      'change :radio': 'update',
      'keyup': function keyup(e) {
        if (Keys.isSpaceBar(e)) {
          $(e.target).click();
        } else if (Keys.isEnter(e)) {
          this.model.trigger('form:save');
        }
      }
    },

    /**
    * @Override
    */
    editMode: function editMode() {
      var templates = [];
      this.$el.empty();

      _.each(this.options.options, function (value, key) {
        var options = {
          optionId: _.uniqueId('option'),
          name: this.options.inputId,
          realName: this.options.name,
          value: key
        };

        if (!_.isObject(value)) {
          value = { label: value };
        }
        _.extend(options, value);

        templates.push(new RadioOption(options).render().el);
      }, this);
      this.$el.append(templates);
      var value = this.getModelValue();
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
    readMode: function readMode() {
      this.editMode();
      this.$(':radio').prop('disabled', true);
      return this;
    },

    /**
    * @Override
    */
    val: function val() {
      return this.$(':radio:checked').val();
    },

    /**
    * @Override
    */
    focus: function focus() {
      return this.$('label:eq(0)').focus();
    }

  });
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ })
/******/ ]);
//# sourceMappingURL=courage-for-signin-widget.js.map