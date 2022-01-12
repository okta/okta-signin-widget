/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@okta/courage/src/framework/Collection.js":
/*!****************************************************************!*\
  !*** ./node_modules/@okta/courage/src/framework/Collection.js ***!
  \****************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _backbone = _interopRequireDefault(__webpack_require__(/*! backbone */ "./node_modules/backbone/backbone.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
} // ################################################
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
} // ################################################
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


var Collection = _backbone.default.Collection.extend(
/** @lends src/framework/Collection.prototype */
{
  /**
   * Default fetch parameters
   * @type {Object|Function}
   */
  params: {},
  constructor: function constructor(models, options) {
    var state = new _backbone.default.Model();

    var defaultParams = _underscoreWrapper.default.defaults(options && options.params || {}, _underscoreWrapper.default.result(this, 'params') || {});

    state.set(DEFAULT_PARAMS, defaultParams);
    this[STATE] = state; // Adds support for child class to convert to ES6 Class.
    // After conversion, `this.model` has to be a pure function to return Model Class.
    // The changes below is trying to distinguish the ambiguity between a Class and normal function,
    // as both are JavaScript function essentially.
    // There are three ways to define class for `this.model`
    // 1. Object properties: `model: BaseModel.extend({..})`
    // 2. Function constructor:
    // See example from
    // - appversions/src/models/CustomType.js
    // - appversions/src/models/EnumType.js
    // - appversions/src/models/SignOnMode.js
    // - authn-factors/src/models/Feature.js
    // - shared/src/models/SamlAttribute.js
    // 3. Function that returns a class.
    //    model: function() { return BaseModel.extend({..}); }
    //
    // option 1 and 2 exists in code base today
    // option 3 is introduced to support child class to convert to ES6 class.
    // TODO: think of remove following check
    // The reason for `this.model !== Backbone.Model` is because `this.model` is default to `Backbone.Model`
    // set at Backbone.Collection.

    if (_underscoreWrapper.default.isFunction(this.model) && this.model.length === 0 && this.model.isCourageModel !== true) {
      this.model = _underscoreWrapper.default.result(this, 'model');
    }

    _backbone.default.Collection.apply(this, arguments);
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

    return _backbone.default.Collection.prototype.sync.call(this, method, collection, options);
  },

  /**
   * See [Backbone Collection.fetch](http://backbonejs.org/#Collection-fetch).
   */
  fetch: function fetch(options) {
    options || (options = {});
    var state = this[STATE],
        xhr = state.get(XHR);
    options.data = _underscoreWrapper.default.extend({}, state.get(DEFAULT_PARAMS), options.data || {});
    options.fromFetch = true;
    state.set(FETCH_DATA, options.data);

    if (xhr && xhr.abort && options.abort !== false) {
      xhr.abort();
    }

    xhr = _backbone.default.Collection.prototype.fetch.call(this, options);
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
    if (_underscoreWrapper.default.isString(params) && params) {
      params = parseQuery(params);
    }

    if (!_underscoreWrapper.default.isObject(params) || _underscoreWrapper.default.isArray(params) || !_underscoreWrapper.default.size(params)) {
      params = null;
    } else if (options && options.fromFetch) {
      params = _underscoreWrapper.default.extend({}, this.getFetchData(), params);
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
    return _underscoreWrapper.default.size(this.getPaginationData()) > 0;
  },

  /**
   * Get the next page from the server
   * @return {Object} xhr returned by {@link #fetch}
   */
  fetchMore: function fetchMore() {
    if (!this.hasMore()) {
      throw new Error('Invalid Request');
    }

    return this.fetch({
      data: this.getPaginationData(),
      add: true,
      remove: false,
      update: true
    });
  },

  /**
   * See [Backbone Collection.reset](http://backbonejs.org/#Collection-reset).
   */
  reset: function reset(models, options) {
    options || (options = {}); // only reset the pagination when reset is being called explicitly.
    // this is to avoid link headers pagination being overriden and reset when
    // fetching the collection using `collection.fetch({reset: true})`

    if (!options.fromFetch) {
      this.setPagination(null);
    }

    return _backbone.default.Collection.prototype.reset.apply(this, arguments);
  },
  // we want "where" to be able to search through derived properties as well
  where: function where(attrs, first) {
    if (_underscoreWrapper.default.isEmpty(attrs)) {
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

    if (!_underscoreWrapper.default.result(model, 'urlRoot')) {
      options.url = _underscoreWrapper.default.result(this, 'url');
    }

    return _backbone.default.Collection.prototype.create.call(this, model, options);
  }
});
/**
 * It's used for distinguishing the ambiguity from _.isFunction()
 * which returns True for both a JavaScript Class constructor function
 * and normal function. With this flag, we can tell a function is actually
 * a Collection Class.
 * This flag is added in order to support the type of a parameter can be
 * either a Class or pure function that returns a Class.
 */


Collection.isCourageCollection = true;
var _default = Collection;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/framework/ListView.js":
/*!**************************************************************!*\
  !*** ./node_modules/@okta/courage/src/framework/ListView.js ***!
  \**************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _View = _interopRequireDefault(__webpack_require__(/*! ./View */ "./node_modules/@okta/courage/src/framework/View.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
var _default = _View.default.extend(
/** @lends src/framework/ListView.prototype */
{
  constructor: function constructor() {
    _View.default.apply(this, arguments);

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
  reset: function reset() {
    var _this = this;

    this.removeChildren();
    this.collection.each(function (model, index) {
      _this.addItem(model, index);
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
  addItem: function addItem(model) {
    var view = this.add(this.item, this.itemSelector, {
      options: {
        model: model
      }
    }).last();

    if (this.state && this.state.get('trackItemAdded')) {
      this.state.trigger('itemAdded', view);
    }

    view.listenTo(model, 'destroy remove', view.remove);
    return this;
  },
  addShowMore: _underscoreWrapper.default.noop
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/framework/Model.js":
/*!***********************************************************!*\
  !*** ./node_modules/@okta/courage/src/framework/Model.js ***!
  \***********************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _backbone = _interopRequireDefault(__webpack_require__(/*! backbone */ "./node_modules/backbone/backbone.js"));

var _Logger = _interopRequireDefault(__webpack_require__(/*! ../util/Logger */ "./node_modules/@okta/courage/src/util/Logger.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
  var filter = _underscoreWrapper.default.contains(objectTypeFields, key);

  target || (target = {});

  if (!filter && _underscoreWrapper.default.isObject(value) && !_underscoreWrapper.default.isArray(value) && !_underscoreWrapper.default.isFunction(value)) {
    _underscoreWrapper.default.each(value, function (val, i) {
      flatten(val, objectTypeFields, key ? key + '.' + i : i, target);
    });
  } // Case where target is an empty object. Guard against returning {undefined: undefined}.
  else if (key !== undefined) {
    target[key] = value;
  }

  return target;
}

function unflatten(data) {
  _underscoreWrapper.default.each(data, function (value, key, data) {
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

  if (_underscoreWrapper.default.isString(field)) {
    target = {
      type: field
    };
  } else if (_underscoreWrapper.default.isArray(field)) {
    target = {
      type: field[0],
      required: field[1],
      value: field[2]
    };
  } else {
    target = _underscoreWrapper.default.clone(field);
  }

  _underscoreWrapper.default.defaults(target, {
    required: false,
    name: name
  });

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
  var createMessageWith = _underscoreWrapper.default.partial(createMessage, field),
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
  /* eslint complexity: [2, 25], max-statements: [2, 27] */
  var createMessageWith = _underscoreWrapper.default.partial(createMessage, field),
      isDefined = !_underscoreWrapper.default.isUndefined(value) && !_underscoreWrapper.default.isNull(value),
      checkType,
      errorMessage; // If using an array validator, perform the validation


  if (Array.isArray(field.validate)) {
    var output = [];
    var foundError = false;

    var _result;

    field.validate.forEach(function (item) {
      if (!value) {
        _result = false;
      } else {
        switch (item.type.toLowerCase()) {
          case 'regex':
            _result = new RegExp(item.value.pattern, item.value.flags || '').test(value);
            break;

          default:
            _result = false;
        }
      } // Append the result.


      foundError = foundError || !_result;
      output.push({
        // eslint-disable-next-line no-prototype-builtins
        message: item.hasOwnProperty('message') ? item.message : '',
        passed: _result
      });
    });

    if (foundError) {
      return createMessageWith(output);
    }

    return;
  } // check required fields


  if (field.required && (!isDefined || _underscoreWrapper.default.isNull(value) || value === '')) {
    return createMessageWith(Model.ERROR_BLANK);
  } // check type


  checkType = _underscoreWrapper.default['is' + capitalize(field.type)];

  if (isDefined && field.type != 'any' && (!_underscoreWrapper.default.isFunction(checkType) || !checkType(value))) {
    return createMessageWith(Model.ERROR_WRONG_TYPE);
  } // validate string format


  if (value && field.type == 'string') {
    var error = validateString(field, value);

    if (error) {
      return error;
    }
  } // check pre set values (enum)


  if (isDefined && field.values && !_underscoreWrapper.default.contains(field.values, value)) {
    return createMessageWith(Model.ERROR_NOT_ALLOWED);
  } // check validate method


  if (_underscoreWrapper.default.isFunction(field.validate)) {
    var result = field.validate(value);

    if (_underscoreWrapper.default.isString(result) && result) {
      return createMessageWith(result);
    } else if (result === false) {
      return createMessageWith(Model.ERROR_INVALID);
    }
  } // check array items


  if (isDefined && field.type == 'array' && (errorMessage = validateArrayField(field, value))) {
    return createMessageWith(errorMessage);
  }
}

function validateArrayField(field, arr) {
  if (field.minItems && arr.length < field.minItems) {
    return 'model.validation.field.array.minItems';
  } else if (field.maxItems && arr.length > field.maxItems) {
    return 'model.validation.field.array.maxItems';
  } else if (field.uniqueItems && arr.length > _underscoreWrapper.default.uniq(arr).length) {
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

Model = _backbone.default.Model.extend(
/** @lends src/framework/Model.prototype */
{
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
     * @type {Mixed|Function}
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
     * @type {Object|Function}
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
     * @type {Object|Function}
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
     * @type {Boolean|Function}
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
    schema.props = _underscoreWrapper.default.clone(_underscoreWrapper.default.result(this, 'props') || {});
    schema.derived = _underscoreWrapper.default.clone(_underscoreWrapper.default.result(this, 'derived') || {});
    schema.local = _underscoreWrapper.default.clone(_underscoreWrapper.default.result(this, 'local') || {});
    var defaults = {};

    _underscoreWrapper.default.each(_underscoreWrapper.default.extend({}, schema.props, schema.local), function (options, name) {
      var schemaDef = normalizeSchemaDef(options, name);

      if (!_underscoreWrapper.default.isUndefined(schemaDef.value)) {
        defaults[name] = schemaDef.value;
      }

      if (schemaDef.type === 'object') {
        objectTypeFields.push(name);
      }
    }, this);

    if (_underscoreWrapper.default.size(defaults)) {
      var localDefaults = _underscoreWrapper.default.result(this, 'defaults');

      this.defaults = function () {
        return _underscoreWrapper.default.defaults({}, defaults, localDefaults);
      };
    } // override `validate`


    this.validate = _underscoreWrapper.default.wrap(this.validate, function (validate) {
      var args = _underscoreWrapper.default.rest(arguments),
          res = _underscoreWrapper.default.extend(this._validateSchema.apply(this, args), validate.apply(this, args));

      return _underscoreWrapper.default.size(res) && res || undefined;
    }); // override `parse`

    this.parse = _underscoreWrapper.default.wrap(this.parse, function (parse) {
      var target = parse.apply(this, _underscoreWrapper.default.rest(arguments));

      if (_underscoreWrapper.default.result(this, 'flat')) {
        target = flatten(target, objectTypeFields);
      }

      return target;
    });

    _backbone.default.Model.apply(this, arguments);

    _underscoreWrapper.default.each(schema.derived, function (options, name) {
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
        all = _underscoreWrapper.default.extend({}, schema.props, schema.local);

    if (!_underscoreWrapper.default.has(all, key)) {
      _Logger.default.warn('Field not defined in schema', key);
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
    return _underscoreWrapper.default.reduce([schema.props, schema.local], function (result, options) {
      return result || normalizeSchemaDef(options[propName], propName);
    }, null);
  },
  set: function set(key, val) {
    var attrs;

    if (_typeof(key) === 'object') {
      attrs = key;
    } else {
      (attrs = {})[key] = val;
    } // Don't override a computed properties


    _underscoreWrapper.default.each(attrs, function (value, key) {
      if (_underscoreWrapper.default.has(this['__schema__'].derived, key)) {
        throw 'overriding derived properties is not supported: ' + key;
      }
    }, this); // Schema validation


    var errorFields = [];

    _underscoreWrapper.default.each(attrs, function (value, key) {
      this.allows(key) || errorFields.push(key);
    }, this);

    if (errorFields.length) {
      throw 'field not allowed: ' + errorFields.join(', ');
    }

    return _backbone.default.Model.prototype.set.apply(this, arguments);
  },
  get: function get(attr) {
    var schema = this['__schema__'];

    if (_underscoreWrapper.default.has(schema.derived, attr)) {
      if (schema.derived[attr].cache !== false) {
        return schema.computedProperties[attr];
      } else {
        return this.__getDerivedValue(attr);
      }
    }

    return _backbone.default.Model.prototype.get.apply(this, arguments);
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

    var res = _underscoreWrapper.default.clone(_backbone.default.Model.prototype.toJSON.apply(this, arguments)),
        schema = this['__schema__']; // cleanup local properties


    if (!options.verbose) {
      res = _underscoreWrapper.default.omit(res, _underscoreWrapper.default.keys(schema.local));
    } else {
      // add derived properties
      _underscoreWrapper.default.each(schema.derived, function (options, name) {
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
    this.set(_underscoreWrapper.default.result(this, 'defaults'), options);
  },

  /**
     * Is the data on the model has local modifications since the last sync event?
     * @return {Boolean} is the model in sync with the server
     */
  isSynced: function isSynced() {
    return _underscoreWrapper.default.isEqual(this.__syncedData, this.toJSON());
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
    return _underscoreWrapper.default.reduce(_underscoreWrapper.default.extend({}, schema.props, schema.local), function (memo, options, name) {
      return _underscoreWrapper.default.extend(memo, this.validateField(name) || {});
    }, {}, this);
  },
  __getDerivedValue: function __getDerivedValue(name) {
    var options = this['__schema__'].derived[name];

    if (_underscoreWrapper.default.isString(options)) {
      var key = options;
      options = {
        deps: [key],
        fn: function fn() {
          return this.get(key);
        }
      };
    }

    var deps = options.deps || [];
    return options.fn.apply(this, _underscoreWrapper.default.map(deps, this.get, this));
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
/**
 * It's used for distinguishing the ambiguity from _.isFunction()
 * which returns True for both a JavaScript Class constructor function
 * and normal function. With this flag, we can tell a function is actually
 * a Model Class.
 * This flag is added in order to support the type of a parameter can be
 * either a Class or pure function that returns a Class.
 */

Model.isCourageModel = true;
var _default = Model;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/framework/View.js":
/*!**********************************************************!*\
  !*** ./node_modules/@okta/courage/src/framework/View.js ***!
  \**********************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _backbone = _interopRequireDefault(__webpack_require__(/*! backbone */ "./node_modules/backbone/backbone.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

  _underscoreWrapper.default.each(_underscoreWrapper.default.allKeys(view), function (key) {
    var matchKeys = key.match(isEventPropertyRe);

    if (!matchKeys) {
      return;
    }

    var bindings = _underscoreWrapper.default.result(view, key),
        entity = view.options[matchKeys[1]] || view[matchKeys[1]];

    if (!entity || !_underscoreWrapper.default.isObject(bindings) || !_underscoreWrapper.default.isFunction(entity.trigger)) {
      return;
    }

    _underscoreWrapper.default.each(bindings, function (callback, event) {
      var callbacks = _underscoreWrapper.default.isFunction(callback) ? [callback] : _underscoreWrapper.default.reduce(callback.split(/\s+/), function (arr, name) {
        if (_underscoreWrapper.default.isFunction(view[name])) {
          arr.push(view[name]);
        }

        return arr;
      }, []);

      _underscoreWrapper.default.each(callbacks, function (cb) {
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


var View = _backbone.default.View.extend(
/** @lends src/framework/View.prototype */
{
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

    _underscoreWrapper.default.extend(this, _underscoreWrapper.default.pick(this.options, 'state', 'settings')); // init per-instance children collection


    this[CHILDREN] = [];
    this[RENDERED] = false;
    this[PARENT] = null;
    this[CHILD_DEFINITIONS] = this.children; // we want to make sure initialize is triggered *after* we append the views from the `this.views` array

    var initialize = this.initialize;
    this.initialize = noop;

    _backbone.default.View.apply(this, arguments);

    _underscoreWrapper.default.each(_underscoreWrapper.default.result(this, CHILD_DEFINITIONS), function (childDefinition) {
      this.add.apply(this, _underscoreWrapper.default.isArray(childDefinition) ? childDefinition : [childDefinition]);
    }, this);

    delete this[CHILD_DEFINITIONS];

    var autoRender = _underscoreWrapper.default.result(this, 'autoRender');

    if (autoRender && this.model) {
      var event = _underscoreWrapper.default.isArray(autoRender) ? _underscoreWrapper.default.map(autoRender, function (field) {
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
    var viewIndex = getIndex(this, view); // viewIndex is undefined when the view is not found (may have been removed)
    // check if it is undefined to prevent unexpected thing to happen
    // array.splice(undefined, x) removes the first x element(s) from the array
    // this protects us against issues when calling `remove` on a child view multiple times

    if (_underscoreWrapper.default.isNumber(viewIndex)) {
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
    /* eslint max-statements: [2, 29], complexity: [2, 12] */
    var options = {},
        args = _underscoreWrapper.default.toArray(arguments); // This will throw if a compiled template function is passed accidentally


    if (_underscoreWrapper.default.isFunction(view) && (!view.prototype || !view.prototype.render)) {
      throw new Error('Type passed to add() is not a View');
    }

    if (_underscoreWrapper.default.isObject(selector)) {
      options = selector;
      selector = options.selector;
      bubble = options.bubble;
      prepend = options.prepend;
      extraOptions = options.options;
    } else if (_underscoreWrapper.default.isObject(bubble)) {
      options = bubble;
      bubble = options.bubble;
      prepend = options.prepend;
      extraOptions = options.options;
    } // TODO: This will be deprecated at some point. Views should use precompiled templates


    if (_underscoreWrapper.default.isString(view)) {
      view = function (template) {
        return View.extend({
          constructor: function constructor() {
            try {
              var $el = _backbone.default.$(template);

              if ($el.length != 1) {
                throw 'invalid Element';
              }

              var unescapingRexExp = /&(\w+|#x\d+);/g;
              var elementUnescapedOuterHTMLLength = $el.prop('outerHTML').replace(unescapingRexExp, ' ').length;
              var templateUnescapedLength = template.replace(unescapingRexExp, ' ').length;

              if (elementUnescapedOuterHTMLLength !== templateUnescapedLength) {
                throw 'invalid Element';
              }

              this.template = $el.html(); // Template string will be compiled by handlebars

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
      var viewOptions = _underscoreWrapper.default.omit(_underscoreWrapper.default.extend({}, this.options, extraOptions), 'el');

      args[0] = new view(viewOptions);
      return this.add.apply(this, args);
    } // prevent dups


    if (_underscoreWrapper.default.isNumber(getIndex(this, view))) {
      throw new Error('Duplicate child');
    }

    view[PARENT] = this; // make the view responsible for adding itself to the parent:
    // * register the selector in the closure
    // * register a reference the parent in the closure

    view[ADD_TO_CONTAINER] = function (selector) {
      return function () {
        if (selector && view[PARENT].$(selector).length != 1) {
          throw new Error('Invalid selector: ' + selector);
        }

        var $el = selector ? this[PARENT].$(selector) : this[PARENT].$el;
        this.render(); // we need to delegate events in case
        // the view was added and removed before

        this.delegateEvents(); // this[PARENT].at(index).$el.before(this.el);

        prepend ? $el.prepend(this.el) : $el.append(this.el);
      };
    }.call(view, selector); // if flag to bubble events is set
    // proxy all child view events


    if (bubble) {
      this.listenTo(view, 'all', function () {
        this.trigger.apply(this, arguments);
      });
    } // add to the dom if `render` has been called


    if (this.rendered()) {
      view[ADD_TO_CONTAINER]();
    } // add view to child views collection


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

    return _backbone.default.View.prototype.remove.apply(this, arguments);
  },

  /**
     * Compile the template to function you can apply tokens on on render time.
     * Uses the underscore tempalting engine by default
     * @protected
     * @param  {String} template
     * @return {Function} a compiled template
     */
  // TODO: This will be deprecated at some point. Views should use precompiled templates
  compileTemplate: function compileTemplate(template) {
    /* eslint  @okta/okta-ui/no-specific-methods: 0*/
    return _underscoreWrapper.default.template(template);
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
    if (_underscoreWrapper.default.isString(template)) {
      // TODO: This will be deprecated at some point. Views should use precompiled templates
      template = this.compileTemplate(template);
    }

    if (_underscoreWrapper.default.isFunction(template)) {
      return template(this.getTemplateData());
    }
  },

  /**
     * The data hash passed to the compiled template
     * @return {Object}
     * @protected
     */
  getTemplateData: function getTemplateData() {
    var modelData = this.model && this.model.toJSON({
      verbose: true
    }) || {};

    var options = _underscoreWrapper.default.omit(this.options, ['state', 'settings', 'model', 'collection']);

    return _underscoreWrapper.default.defaults({}, modelData, options);
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
    var args = _underscoreWrapper.default.toArray(arguments);

    this.each(function (child) {
      // if child has children, bubble down the tree
      if (child.size()) {
        child.invoke.apply(child, args);
      } // run the function on the child


      if (_underscoreWrapper.default.isFunction(child[methodName])) {
        child[methodName].apply(child, args.slice(1));
      }
    });
    return this;
  }
}); // Code borrowed from Backbone.js source
// Underscore methods that we want to implement on the Container.


var methods = ['each', 'map', 'reduce', 'reduceRight', 'find', 'filter', 'reject', 'every', 'some', 'contains', 'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf', 'isEmpty', 'chain', 'where', 'findWhere'];

_underscoreWrapper.default.each(methods, function (method) {
  View.prototype[method] = function () {
    var args = _underscoreWrapper.default.toArray(arguments);

    args.unshift(_underscoreWrapper.default.toArray(this[CHILDREN]));
    return _underscoreWrapper.default[method].apply(_underscoreWrapper.default, args);
  };
}, void 0);
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

/**
 * It's used for distinguishing the ambiguity from _.isFunction()
 * which returns True for both a JavaScript Class constructor function
 * and normal function. With this flag, we can tell a function is actually
 * a View Class.
 * This flag is added in order to support the type of a parameter can be
 * either a Class or pure function that returns a Class.
 */


View.isCourageView = true;
var _default = View;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/models/BaseCollection.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@okta/courage/src/models/BaseCollection.js ***!
  \*****************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Collection = _interopRequireDefault(__webpack_require__(/*! ../framework/Collection */ "./node_modules/@okta/courage/src/framework/Collection.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wrapper around the more generic {@link src/framework/Collection} that
 * contains Okta-specific logic.
 * @class module:Okta.Collection
 * @extends src/framework/Collection
 */
var _default = _Collection.default.extend(
/** @lends module:Okta.Collection.prototype */
{
  /**
   * Is the end point using the legacy "secureJSON" format
   * @type {Function|Boolean}
   */
  secureJSON: false,
  constructor: function constructor() {
    _Collection.default.apply(this, arguments);

    if (_underscoreWrapper.default.result(this, 'secureJSON')) {
      this.sync = _underscoreWrapper.default.wrap(this.sync, function (sync, method, collection, options) {
        return sync.call(this, method, collection, _underscoreWrapper.default.extend({
          dataType: 'secureJSON'
        }, options));
      });
    }
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/models/BaseModel.js":
/*!************************************************************!*\
  !*** ./node_modules/@okta/courage/src/models/BaseModel.js ***!
  \************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Model = _interopRequireDefault(__webpack_require__(/*! ./Model */ "./node_modules/@okta/courage/src/models/Model.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var hasProps = function hasProps(model) {
  var local = _underscoreWrapper.default.omit(model.local, _underscoreWrapper.default.keys(model._builtInLocalProps));

  return _underscoreWrapper.default.size(model.props) + _underscoreWrapper.default.size(local) > 0;
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


var BaseModelBaseModel = _Model.default.extend(
/** @lends module:Okta.BaseModel.prototype */
{
  /**
   * @type {Boolean}
   */
  flat: false,
  constructor: function constructor() {
    _Model.default.apply(this, arguments);

    this.on('sync', this._setSynced);
  },
  allows: function allows() {
    if (hasProps(this)) {
      return _Model.default.prototype.allows.apply(this, arguments);
    } else {
      return true;
    }
  },
  // bw compatibility support for old computed properties
  set: function set(key, val) {
    var attrs;

    if (_typeof(key) === 'object') {
      attrs = key;
    } else {
      (attrs = {})[key] = val;
    } // computed properties


    (0, _underscoreWrapper.default)(attrs).each(function (fn, attr) {
      if (!fn || !_underscoreWrapper.default.isArray(fn.__attributes)) {
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
    return _Model.default.prototype.set.apply(this, arguments);
  },

  /**
   * Get the current value of an attribute from the model. For example: `note.get("title")`
   *
   * See [Model.get](http://backbonejs.org/#Model-get)
   * @param {String} attribute
   * @return {Mixed} The value of the model attribute
   */
  get: function get() {
    var value = _Model.default.prototype.get.apply(this, arguments);

    if (_underscoreWrapper.default.isFunction(value)) {
      return value.apply(this, _underscoreWrapper.default.map(value.__attributes || [], this.get, this));
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

    var res = _Model.default.prototype.toJSON.apply(this, arguments); // cleanup computed properties


    (0, _underscoreWrapper.default)(res).each(function (value, key) {
      if (typeof value === 'function') {
        if (options.verbose) {
          res[key] = this.get(key);
        } else {
          delete res[key];
        }
      }
    }, this); // cleanup private properties

    if (!options.verbose) {
      (0, _underscoreWrapper.default)(res).each(function (value, key) {
        if (/^__\w+__$/.test(key)) {
          delete res[key];
        }
      });
    }

    return res;
  },
  sanitizeAttributes: function sanitizeAttributes(attributes) {
    var attrs = {};

    _underscoreWrapper.default.each(attributes, function (value, key) {
      if (!_underscoreWrapper.default.isFunction(value)) {
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

    _underscoreWrapper.default.each(this.sanitizeAttributes(this.attributes), function (value, key) {
      attrs[key] = void 0;
    });

    return this.set(attrs, _underscoreWrapper.default.extend({}, options, {
      unset: true
    }));
  },

  /**
   * @private
   */
  _setSynced: function _setSynced(newModel) {
    this._syncedData = newModel && _underscoreWrapper.default.isFunction(newModel.toJSON) ? newModel.toJSON() : {};
  },

  /**
   * @private
   */
  _getSynced: function _getSynced() {
    return this._syncedData;
  },
  isSynced: function isSynced() {
    return _underscoreWrapper.default.isEqual(this._getSynced(), this.toJSON());
  }
},
/** @lends module:Okta.BaseModel.prototype */
{
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
    var args = _underscoreWrapper.default.toArray(arguments);

    var fn = args.pop();
    fn.__attributes = args.pop();
    return fn;
  }
});

var _default = BaseModelBaseModel;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/models/BaseSchema.js":
/*!*************************************************************!*\
  !*** ./node_modules/@okta/courage/src/models/BaseSchema.js ***!
  \*************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _BaseCollection = _interopRequireDefault(__webpack_require__(/*! ./BaseCollection */ "./node_modules/@okta/courage/src/models/BaseCollection.js"));

var _BaseModel = _interopRequireDefault(__webpack_require__(/*! ./BaseModel */ "./node_modules/@okta/courage/src/models/BaseModel.js"));

var _SchemaProperty = _interopRequireDefault(__webpack_require__(/*! ./SchemaProperty */ "./node_modules/@okta/courage/src/models/SchemaProperty.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseProperties = function parseProperties(resp) {
  var schemaMeta = _underscoreWrapper.default.pick(resp, 'id', 'name', 'displayName');

  var properties = _underscoreWrapper.default.map(resp.schema.properties, function (property, name) {
    return _underscoreWrapper.default.extend({
      name: name
    }, property);
  });

  _underscoreWrapper.default.each(properties, function (property) {
    property['__schemaMeta__'] = schemaMeta;

    if (property.__metadata) {
      property['__metadata__'] = property.__metadata;
      delete property.__metadata;
    }
  });

  return properties;
};

var BaseSchemaSchema = _BaseModel.default.extend({
  defaults: {
    id: undefined,
    displayName: undefined,
    name: undefined
  },
  constructor: function constructor() {
    this.properties = new _SchemaProperty.default.Collection();

    _BaseModel.default.apply(this, arguments);
  },
  getProperties: function getProperties() {
    return this.properties;
  },
  clone: function clone() {
    var model = _BaseModel.default.prototype.clone.apply(this, arguments);

    model.getProperties().set(this.getProperties().toJSON({
      verbose: true
    }));
    return model;
  },
  parse: function parse(resp) {
    var properties = parseProperties(resp);
    this.properties.set(properties, {
      parse: true
    });
    return _underscoreWrapper.default.omit(resp, 'schema');
  },
  trimProperty: function trimProperty(property) {
    return _underscoreWrapper.default.omit(property, 'name');
  },
  toJSON: function toJSON() {
    var json = _BaseModel.default.prototype.toJSON.apply(this, arguments);

    json.schema = {
      properties: {}
    };
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
    return _BaseModel.default.prototype.save.apply(this, arguments);
  }
});

var BaseSchemaSchemas = _BaseCollection.default.extend({
  model: BaseSchemaSchema
});

var _default = {
  parseProperties: parseProperties,
  Model: BaseSchemaSchema,
  Collection: BaseSchemaSchemas
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/models/Model.js":
/*!********************************************************!*\
  !*** ./node_modules/@okta/courage/src/models/Model.js ***!
  \********************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Model = _interopRequireDefault(__webpack_require__(/*! ../framework/Model */ "./node_modules/@okta/courage/src/framework/Model.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wrapper around the more generic {@link src/framework/Model} that
 * contains Okta-specific logic.
 * @class module:Okta.Model
 * @extends src/framework/Model
 */
var _default = _Model.default.extend(
/** @lends module:Okta.Model.prototype */
{
  /**
   * Is the end point using the legacy "secureJSON" format
   * @type {Function|Boolean}
   */
  secureJSON: false,
  _builtInLocalProps: {
    __edit__: 'boolean',
    __pending__: 'boolean'
  },
  constructor: function constructor() {
    this.local = _underscoreWrapper.default.defaults({}, _underscoreWrapper.default.result(this, 'local'), this._builtInLocalProps);

    _Model.default.apply(this, arguments);

    if (_underscoreWrapper.default.result(this, 'secureJSON')) {
      this.sync = _underscoreWrapper.default.wrap(this.sync, function (sync, method, model, options) {
        return sync.call(this, method, model, _underscoreWrapper.default.extend({
          dataType: 'secureJSON'
        }, options));
      });
    }
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/models/SchemaProperty.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@okta/courage/src/models/SchemaProperty.js ***!
  \*****************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! ../util/jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _BaseCollection = _interopRequireDefault(__webpack_require__(/*! ./BaseCollection */ "./node_modules/@okta/courage/src/models/BaseCollection.js"));

var _BaseModel = _interopRequireDefault(__webpack_require__(/*! ./BaseModel */ "./node_modules/@okta/courage/src/models/BaseModel.js"));

var _Logger = _interopRequireDefault(__webpack_require__(/*! ../util/Logger */ "./node_modules/@okta/courage/src/util/Logger.js"));

var _SchemaUtil = _interopRequireDefault(__webpack_require__(/*! ../util/SchemaUtil */ "./node_modules/@okta/courage/src/util/SchemaUtil.js"));

var _StringUtil = _interopRequireDefault(__webpack_require__(/*! ../util/StringUtil */ "./node_modules/@okta/courage/src/util/StringUtil.js"));

var _EnumTypeHelper = _interopRequireDefault(__webpack_require__(/*! ../views/forms/helpers/EnumTypeHelper */ "./node_modules/@okta/courage/src/views/forms/helpers/EnumTypeHelper.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-statements: [2, 16], complexity: [2, 8], max-params: [2, 8] */
var loc = _StringUtil.default.localize;
var STRING = _SchemaUtil.default.STRING;
var NUMBER = _SchemaUtil.default.NUMBER;
var INTEGER = _SchemaUtil.default.INTEGER;
var OBJECT = _SchemaUtil.default.OBJECT;

var getArrayTypeName = function getArrayTypeName(type, elementType) {
  return type + 'of' + elementType;
};

var SchemaPropertySubSchema = _BaseModel.default.extend({
  defaults: {
    description: undefined,
    minLength: undefined,
    maxLength: undefined,
    format: undefined
  },
  parse: function parse(resp) {
    if (_underscoreWrapper.default.isString(resp.format)) {
      var matcher = /^\/(.+)\/$/.exec(resp.format);

      if (matcher) {
        resp.format = matcher[1];
      }
    }

    return resp;
  }
});

var SchemaPropertySubSchemaCollection = _BaseCollection.default.extend({
  model: SchemaPropertySubSchema
});

var SchemaPropertySubSchemaAllOfCollection = SchemaPropertySubSchemaCollection.extend({
  _type: 'allOf'
});
var SchemaPropertySubSchemaOneOfCollection = SchemaPropertySubSchemaCollection.extend({
  _type: 'oneOf'
});
var SchemaPropertySubSchemaNoneOfCollection = SchemaPropertySubSchemaCollection.extend({
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
var constraintHandlers = {
  between: '_checkBetweenConstraints',
  greaterThan: '_checkGreaterThanConstraint',
  lessThan: '_checkLessThanConstraint',
  equals: '_checkEqualsConstraint'
};

var SchemaPropertySchemaProperty = _BaseModel.default.extend({
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
    settings: {
      permissions: {
        SELF: _SchemaUtil.default.PERMISSION.READ_ONLY
      }
    },
    unique: undefined,
    __metadata__: undefined,
    __isSensitive__: _BaseModel.default.ComputedProperty(['settings'], function (settings) {
      return !!(settings && settings.sensitive);
    }),
    __unique__: false,
    __isUniqueValidated__: _BaseModel.default.ComputedProperty(['unique'], function (unique) {
      return unique === _SchemaUtil.default.UNIQUENESS.UNIQUE_VALIDATED;
    }),
    __isPendingUniqueness__: _BaseModel.default.ComputedProperty(['unique'], function (unique) {
      return unique === _SchemaUtil.default.UNIQUENESS.PENDING_UNIQUENESS;
    }),
    __isUniqueness__: _BaseModel.default.ComputedProperty(['__isUniqueValidated__', '__isPendingUniqueness__'], function (isValidated, isPending) {
      return isValidated || isPending;
    }),
    __canBeSensitive__: _BaseModel.default.ComputedProperty(['__metadata__'], function (metadata) {
      return !!(metadata && metadata.sensitivizable);
    }),
    __userPermission__: _SchemaUtil.default.PERMISSION.READ_ONLY,
    __displayType__: undefined,
    __displayTypeLabel__: _BaseModel.default.ComputedProperty(['__displayType__'], function (displayType) {
      return _SchemaUtil.default.DATATYPE[displayType] || displayType;
    }),
    __supportsMinMax__: false,
    // use the private naming convention for these computed properties,
    // to deal with the complexity in cloning schema with properties (toJSON({verbose: true})),
    // to make sure these attributes are being excluded from api request
    __isReadOnly__: _BaseModel.default.ComputedProperty(['mutability'], function (mutability) {
      return mutability === _SchemaUtil.default.MUTABILITY.READONLY;
    }),
    __isWriteOnly__: _BaseModel.default.ComputedProperty(['mutability'], function (mutability) {
      return mutability === _SchemaUtil.default.MUTABILITY.WRITEONLY;
    }),
    __displayScope__: undefined,
    __isScopeSelf__: _BaseModel.default.ComputedProperty(['scope'], function (scope) {
      return scope === _SchemaUtil.default.SCOPE.SELF;
    }),
    __isNoneScopeArrayType__: _BaseModel.default.ComputedProperty(['__isScopeSelf__', '__displayType__'], function (isScopeSelf, displayType) {
      return !isScopeSelf && _SchemaUtil.default.isArrayDataType(displayType);
    }),
    __isImported__: _BaseModel.default.ComputedProperty(['externalName'], function (externalName) {
      return !!externalName;
    }),
    __isFromBaseSchema__: _BaseModel.default.ComputedProperty(['__schemaMeta__'], function (schemaMeta) {
      return schemaMeta && schemaMeta.name === 'base';
    }),
    // Only UI can turn on __enumDefined__ and reprocess the enum/oneOf value; otherwise,
    // it should leave existing value untouch
    __enumDefined__: false,
    __supportEnum__: _BaseModel.default.ComputedProperty(['__displayType__'], function (displayType) {
      return _underscoreWrapper.default.contains(_SchemaUtil.default.SUPPORTENUM, displayType);
    }),
    __isNumberTypeEnum__: _BaseModel.default.ComputedProperty(['__displayType__'], function (displayType) {
      return _underscoreWrapper.default.contains([_SchemaUtil.default.NUMBER, _SchemaUtil.default.ARRAYDISPLAYTYPE.arrayofnumber], displayType);
    }),
    __isIntegerTypeEnum__: _BaseModel.default.ComputedProperty(['__displayType__'], function (displayType) {
      return _underscoreWrapper.default.contains([_SchemaUtil.default.INTEGER, _SchemaUtil.default.ARRAYDISPLAYTYPE.arrayofinteger], displayType);
    }),
    __isObjectTypeEnum__: _BaseModel.default.ComputedProperty(['__displayType__'], function (displayType) {
      return _underscoreWrapper.default.contains([_SchemaUtil.default.OBJECT, _SchemaUtil.default.ARRAYDISPLAYTYPE.arrayofobject], displayType);
    }),
    __isStringTypeEnum__: _BaseModel.default.ComputedProperty(['__displayType__'], function (displayType) {
      return _underscoreWrapper.default.contains([_SchemaUtil.default.STRING, _SchemaUtil.default.ARRAYDISPLAYTYPE.arrayofstring], displayType);
    }),
    __enumConstraintType__: _BaseModel.default.ComputedProperty(['__isStringTypeEnum__', '__isNumberTypeEnum__', '__isIntegerTypeEnum__', '__isObjectTypeEnum__'], function (isStringType, isNumberType, isIntegerType, isObjectType) {
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
    __isEnumDefinedAndSupported__: _BaseModel.default.ComputedProperty(['__enumDefined__', '__supportEnum__'], function (enumDefined, supportEnum) {
      return enumDefined && supportEnum;
    }),
    __isLoginOfBaseSchema__: _BaseModel.default.ComputedProperty(['__isFromBaseSchema__', 'name'], function (isFromBaseSchema, name) {
      return isFromBaseSchema && name === 'login';
    }),
    __isLoginFormatRestrictionToEmail__: _BaseModel.default.ComputedProperty(['__loginFormatRestriction__'], function (loginFormatRestriction) {
      return loginFormatRestriction === _SchemaUtil.default.LOGINPATTERNFORMAT.EMAIL;
    })
  },
  initialize: function initialize() {
    _BaseModel.default.prototype.initialize.apply(this, arguments);

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
    resp = _underscoreWrapper.default.clone(resp);

    if (resp.type === 'object' && resp.extendedType === 'image') {
      resp.type = 'image';
    }

    resp['__displayType__'] = _SchemaUtil.default.getDisplayType(resp.type, resp.format, resp.items ? resp.items.format ? resp.items.format : resp.items.type : undefined);

    this._setRangeConstraints(resp);

    resp['__supportsMinMax__'] = _SchemaUtil.default.SUPPORTSMINMAX.indexOf(resp['__displayType__']) !== -1;
    resp['__displayScope__'] = _SchemaUtil.default.DISPLAYSCOPE[resp.scope] || _SchemaUtil.default.DISPLAYSCOPE.NA;

    if (resp.settings && resp.settings.permissions && resp.settings.permissions.SELF) {
      resp['__userPermission__'] = resp.settings.permissions.SELF;
    }

    this._setMasterOverride(resp);

    this._setSubSchemas(resp);

    this._setUniqueness(resp);

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

    var constraitType = this.get('__constraint__');
    var constraitHandler = this[constraintHandlers[constraitType]];

    if (_underscoreWrapper.default.isFunction(constraitHandler)) {
      return constraitHandler.call(this);
    } else {
      _Logger.default.warn('No constraint handler found for: ' + constraitType);

      return undefined;
    }
  },
  _checkBetweenConstraints: function _checkBetweenConstraints() {
    var minVal = this.get('__minVal__');
    var maxVal = this.get('__maxVal__');

    if (!minVal && !maxVal) {
      return;
    }

    if (!minVal) {
      return {
        __minVal__: 'Min value is required'
      };
    }

    if (!maxVal) {
      return {
        __maxVal__: 'Max value is required'
      };
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
      return {
        __maxVal__: 'Max val must be greater than min val'
      };
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

      if (_underscoreWrapper.default.isArray(masterOverrideValue) && !_underscoreWrapper.default.isEmpty(masterOverrideValue)) {
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
  _setSubSchemas: function _setSubSchemas(resp) {
    if (resp.allOf) {
      resp['subSchemas'] = new SchemaPropertySubSchemaAllOfCollection(resp.allOf, {
        parse: true
      });
    } else if (resp.oneOf) {
      resp['subSchemas'] = new SchemaPropertySubSchemaOneOfCollection(resp.oneOf, {
        parse: true
      });
    } else if (resp.noneOf) {
      resp['subSchemas'] = new SchemaPropertySubSchemaNoneOfCollection(resp.noneOf, {
        parse: true
      });
    }
  },
  _setUniqueness: function _setUniqueness(resp) {
    var unique = resp && resp.unique;
    resp['__unique__'] = !!(unique && (unique === _SchemaUtil.default.UNIQUENESS.UNIQUE_VALIDATED || unique === _SchemaUtil.default.UNIQUENESS.PENDING_UNIQUENESS));
  },
  _setLoginPattern: function _setLoginPattern() {
    if (!this.get('__isLoginOfBaseSchema__')) {
      return;
    }

    var pattern = this.get('pattern');

    if (pattern === loginFormatNonePattern) {
      this.set('__loginFormatRestriction__', _SchemaUtil.default.LOGINPATTERNFORMAT.NONE);
    } else if (pattern) {
      this.set('__loginFormatRestriction__', _SchemaUtil.default.LOGINPATTERNFORMAT.CUSTOM);
      this.set('__loginFormatRestrictionCustom__', this._extractLoginPattern(pattern));
    } else {
      this.set('__loginFormatRestriction__', _SchemaUtil.default.LOGINPATTERNFORMAT.EMAIL);
    }
  },
  _updateDisplayType: function _updateDisplayType() {
    var type = this.get('type');

    if (type === STRING && this.get('format')) {
      this.set('__displayType__', _SchemaUtil.default.FORMATDISPLAYTYPE[this.get('format')]);
    } else {
      var items = this.get('items');
      var arraytype = items && (items.format ? items.format : items.type);

      if (type && arraytype) {
        this.set('__displayType__', _SchemaUtil.default.ARRAYDISPLAYTYPE[getArrayTypeName(type, arraytype)]);
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

    if (_underscoreWrapper.default.isEmpty(enumOneOf)) {
      return {
        __oneOf__: loc('model.validation.field.blank', 'courage')
      };
    }

    if (!this._isValidateOneOfConstraint(enumOneOf)) {
      var constraintType = this.get('__enumConstraintType__');
      var errorTypeMsg = constraintTypeErrorMessages[constraintType];
      return {
        __oneOf__: errorTypeMsg
      };
    }
  },
  _isValidateOneOfConstraint: function _isValidateOneOfConstraint(values) {
    var constraintType = this.get('__enumConstraintType__');
    return _underscoreWrapper.default.all(values, function (value) {
      return _EnumTypeHelper.default.isConstraintValueMatchType(value.const, constraintType);
    });
  },
  toJSON: function toJSON() {
    var json = _BaseModel.default.prototype.toJSON.apply(this, arguments);

    json.settings = {
      permissions: {}
    };
    json.settings.permissions['SELF'] = this.get('__userPermission__'); // omit "sensitive" filed will have default it value to false.

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
  _attributeOverrideToJson: function _attributeOverrideToJson(json) {
    var masterOverrideType = this.get('__masterOverrideType__');
    var masterOverrideValue = this.get('__masterOverrideValue__');

    if (masterOverrideType === 'OKTA_MASTERED') {
      json.settings.masterOverride = {
        type: 'OKTA_MASTERED'
      };
    } else if (masterOverrideType === 'OVERRIDE') {
      json.settings.masterOverride = {
        type: 'ORDERED_LIST',
        value: []
      };

      if (masterOverrideValue instanceof _BaseCollection.default) {
        _underscoreWrapper.default.each(masterOverrideValue.toJSON(), function (overrideProfile) {
          json.settings.masterOverride.value.push(overrideProfile.id);
        });
      } else if (masterOverrideValue instanceof Array) {
        json.settings.masterOverride.value = masterOverrideValue;
      }

      if (_underscoreWrapper.default.isEmpty(json.settings.masterOverride.value)) {
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
    } // backfill empty title by constraint


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
      case _SchemaUtil.default.LOGINPATTERNFORMAT.EMAIL:
        delete json.pattern;
        break;

      case _SchemaUtil.default.LOGINPATTERNFORMAT.CUSTOM:
        json.pattern = this._buildLoginPattern(this.get('__loginFormatRestrictionCustom__'));
        break;

      case _SchemaUtil.default.LOGINPATTERNFORMAT.NONE:
        json.pattern = loginFormatNonePattern;
        break;
    }

    return json;
  },
  _uniquenessAssignment: function _uniquenessAssignment(json) {
    if (!this.get('__unique__')) {
      delete json.unique;
    } else if (!this.get('__isUniqueness__')) {
      json.unique = _SchemaUtil.default.UNIQUENESS.UNIQUE_VALIDATED;
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
    var re = /^\[(.*)\]\+/;
    var matches = pattern.match(re);
    return matches ? matches[1].replace(/\\(.)/g, '$1') : pattern;
  },
  _getEnumOneOfWithTitleCheck: function _getEnumOneOfWithTitleCheck() {
    var enumOneOf = this.get('__oneOf__');
    return _underscoreWrapper.default.map(enumOneOf, function (value) {
      if (_jqueryWrapper.default.trim(value.title) !== '') {
        return value;
      }

      value.title = !_underscoreWrapper.default.isString(value.const) ? JSON.stringify(value.const) : value.const;
      return value;
    });
  },
  _updateTypeFormatConstraints: function _updateTypeFormatConstraints() {
    var displayType = this.get('__displayType__'); // OKTA-31952 reset format according to its displayType

    this.unset('format', {
      silent: true
    });
    this.unset('items', {
      silent: true
    });
    this.set(_SchemaUtil.default.DISPLAYTYPES[displayType]);

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
    this.set('__supportsMinMax__', _SchemaUtil.default.SUPPORTSMINMAX.indexOf(this.get('__displayType__')) !== -1);
  },
  _updateMinMax: function _updateMinMax() {
    var min;
    var max;
    var displayType = this.get('__displayType__');

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
    var constraint = this.get('__constraint__');
    var min = this.get('__minVal__');
    var max = this.get('__maxVal__');
    var equals = this.get('__equals__');

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

    if (this.get('scope') !== _SchemaUtil.default.SCOPE.SYSTEM) {
      if (this.get('__isScopeSelf__') === true) {
        this.set({
          scope: _SchemaUtil.default.SCOPE.SELF
        }, {
          silent: true
        });
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

    this.set('__oneOf__', _EnumTypeHelper.default.convertToOneOf(enumValues));
    this.set('__enumDefined__', true);
  }
});

var SchemaPropertySchemaProperties = _BaseCollection.default.extend({
  model: SchemaPropertySchemaProperty,
  clone: function clone() {
    return new this.constructor(this.toJSON({
      verbose: true
    }), {
      parse: true
    });
  },
  areAllReadOnly: function areAllReadOnly() {
    return _underscoreWrapper.default.all(this.pluck('__isReadOnly__'));
  },
  createModelProperties: function createModelProperties() {
    return this.reduce(function (p, schemaProperty) {
      var type = schemaProperty.get('type');
      p[schemaProperty.id] = _underscoreWrapper.default.clone(_SchemaUtil.default.DISPLAYTYPES[type]);

      if (_SchemaUtil.default.SUPPORTSMINMAX.indexOf(type) !== -1) {
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

var _default = {
  Model: SchemaPropertySchemaProperty,
  Collection: SchemaPropertySchemaProperties
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/BaseController.js":
/*!***************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/BaseController.js ***!
  \***************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! ./jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _BaseRouter = _interopRequireDefault(__webpack_require__(/*! ./BaseRouter */ "./node_modules/@okta/courage/src/util/BaseRouter.js"));

var _SettingsModel = _interopRequireDefault(__webpack_require__(/*! ./SettingsModel */ "./node_modules/@okta/courage/src/util/SettingsModel.js"));

var _StateMachine = _interopRequireDefault(__webpack_require__(/*! ./StateMachine */ "./node_modules/@okta/courage/src/util/StateMachine.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../views/BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-len: [2, 150] */
function clean(obj) {
  var res = {};

  _underscoreWrapper.default.each(obj, function (value, key) {
    if (!_underscoreWrapper.default.isNull(value)) {
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


var _default = _BaseView.default.extend(
/** @lends module:Okta.Controller.prototype */
{
  constructor: function constructor() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    /* eslint max-statements: [2, 21], complexity: [2, 12] */
    // If 'state' is passed down as options, use it, else create a 'new StateMachine()'
    this.state = _underscoreWrapper.default.result(this, 'state');
    var hasStateBeenInitialized = this.state instanceof _StateMachine.default || options.state instanceof _StateMachine.default;

    if (!hasStateBeenInitialized) {
      var stateData = _underscoreWrapper.default.defaults(clean(options.state), this.state || {}); // TODO:
      // `framework/View.js set `this.state = options.state.`.
      // Therefore we could consider to do
      // 1. `options.state = new StateMachine()`
      // 2. remove `delete options.state`


      this.state = new _StateMachine.default(stateData);
      delete options.state;
    }

    if (!options.settings) {
      // allow the controller to live without a router
      options.settings = new _SettingsModel.default(_underscoreWrapper.default.omit(options || {}, 'el'));
      this.listen('notification', _BaseRouter.default.prototype._notify);
      this.listen('confirmation', _BaseRouter.default.prototype._confirm);
    }

    _BaseView.default.call(this, options);

    this.listenTo(this.state, '__invoke__', function () {
      var args = _underscoreWrapper.default.toArray(arguments);

      var method = args.shift();

      if (_underscoreWrapper.default.isFunction(this[method])) {
        this[method].apply(this, args);
      }
    });
    var MainView; // if `this.View` is already a Backbone View

    if (this.View && this.View.isCourageView) {
      MainView = this.View;
    } // if `this.View` is a pure function that returns a Backbone View
    else if (_underscoreWrapper.default.result(this, 'View') && _underscoreWrapper.default.result(this, 'View').isCourageView) {
      MainView = _underscoreWrapper.default.result(this, 'View');
    }

    if (MainView) {
      this.add(new MainView(this.toJSON()));
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
    var args = arguments;
    var self = this;
    (0, _jqueryWrapper.default)(function () {
      _BaseView.default.prototype.render.apply(self, args);
    });
    return this;
  },

  /**
   * Creates the view constructor options
   * @param {Object} [options] Extra options
   * @return {Object} The view constructor options
   */
  toJSON: function toJSON(options) {
    return _underscoreWrapper.default.extend(_underscoreWrapper.default.pick(this, 'state', 'settings', 'collection', 'model'), options || {});
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

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/BaseRouter.js":
/*!***********************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/BaseRouter.js ***!
  \***********************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _backbone = _interopRequireDefault(__webpack_require__(/*! backbone */ "./node_modules/backbone/backbone.js"));

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! ./jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Logger = _interopRequireDefault(__webpack_require__(/*! ./Logger */ "./node_modules/@okta/courage/src/util/Logger.js"));

var _SettingsModel = _interopRequireDefault(__webpack_require__(/*! ./SettingsModel */ "./node_modules/@okta/courage/src/util/SettingsModel.js"));

var _ConfirmationDialog = _interopRequireDefault(__webpack_require__(/*! ConfirmationDialog */ "./src/empty.js"));

var _Notification = _interopRequireDefault(__webpack_require__(/*! ../views/components/Notification */ "./node_modules/@okta/courage/src/views/components/Notification.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-len: [2, 150], max-params: [2, 7] */
function getRoute(router, route) {
  var root = _underscoreWrapper.default.result(router, 'root') || '';

  if (root && _underscoreWrapper.default.isString(route)) {
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


var _default = _backbone.default.Router.extend(
/** @lends module:Okta.Router.prototype */
{
  /**
   * The root URL for the router. When setting {@link http://backbonejs.org/#Router-routes|routes},
   * it will be prepended to each route.
   * @type {String|Function}
   */
  root: '',
  listen: _Notification.default.prototype.listen,
  constructor: function constructor() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.el = options.el;
    /**
     * Make sure `this.settings` has been set before invoke super - `Backbone.Router.apply`,
     * which will invoke `this.initialize`, which could use `this.settings`.
     *
     * In theory we can set `this.settings` in `this.initialize` and assume `child.initialize`
     * will invoke `super.initialize` first. But in reality, `child.initialize` doesn't call
     * `super.initialize` at all.
     */

    this.settings = new _SettingsModel.default(_underscoreWrapper.default.omit(options, 'el'));

    if (options.root) {
      this.root = options.root;
    }

    _backbone.default.Router.apply(this, arguments);

    this.listen('notification', this._notify);
    this.listen('confirmation', this._confirm);
  },

  /**
   * Fires up a confirmation dialog
   *
   * @param  {Object} options Options Hash
   * @param  {String} options.title The title
   * @param  {Array<string>} buttonOrder The order of the buttons
   * @param  {String} options.subtitle The explain text
   * @param  {String} options.save The text for the save button
   * @param  {Function} options.ok The callback function to run when hitting "OK"
   * @param  {String} options.cancel The text for the cancel button
   * @param  {Function} options.cancelFn The callback function to run when hitting "Cancel"
   * @param  {Boolean} options.noCancelButton Don't render the cancel button (useful for alert dialogs)
   * @param  {Boolean} options.noSubmitButton Don't render the primary button (useful for alert dialogs)
   * @private
   *
   * @return {Okta.View} the dialog view
   */
  _confirm: function _confirm(options) {
    options || (options = {});

    var Dialog = _ConfirmationDialog.default.extend(_underscoreWrapper.default.pick(options, 'title', 'subtitle', 'save', 'ok', 'cancel', 'cancelFn', 'noCancelButton', 'noSubmitButton', 'content', 'danger', 'type', 'closeOnOverlayClick', 'buttonOrder'));

    var dialog = new Dialog({
      model: this.settings
    }); // The model is here because itsa part of the BaseForm paradigm.
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
  _notify: function _notify(options) {
    var notification = new _Notification.default(options);
    (0, _jqueryWrapper.default)('#content').prepend(notification.render().el);
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
    options = _underscoreWrapper.default.extend(_underscoreWrapper.default.pick(this, 'settings', 'el'), options || {});
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
    (0, _jqueryWrapper.default)(function () {
      if (_backbone.default.History.started) {
        _Logger.default.error('History has already been started');

        return;
      }

      _backbone.default.history.start.apply(_backbone.default.history, args);
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
    return _backbone.default.Router.prototype.route.call(this, getRoute(this, _route), name, callback);
  },
  navigate: function navigate(fragment, options) {
    return _backbone.default.Router.prototype.navigate.call(this, getRoute(this, fragment), options);
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/ButtonFactory.js":
/*!**************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/ButtonFactory.js ***!
  \**************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _BaseButtonLink = _interopRequireDefault(__webpack_require__(/*! ../views/components/BaseButtonLink */ "./node_modules/@okta/courage/src/views/components/BaseButtonLink.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint '@okta/okta-ui/no-deprecated-methods': [0, [{ name: 'BaseButtonLink.extend', use: 'Okta.createButton'}, ]] */

/**
 * A factory method wrapper for {@link BaseButtonLink} creation
 * @class module:Okta.internal.util.ButtonFactory
 */
function normalizeEvents(options) {
  var events = _underscoreWrapper.default.extend(options.click ? {
    click: options.click
  } : {}, options.events || {});

  var target = {};

  _underscoreWrapper.default.each(events, function (fn, eventName) {
    target[eventName] = function (e) {
      if (!options.href) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!(this.disabled && eventName === 'click')) {
        fn.apply(this, arguments);
      }
    };
  });

  return target;
}

var _default =
/** @lends module:Okta.internal.util.ButtonFactory */
{
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
    options = _underscoreWrapper.default.clone(options);
    options.attrs = options.attributes;
    delete options.attributes;
    return _BaseButtonLink.default.extend(_underscoreWrapper.default.extend(options, {
      events: normalizeEvents(options)
    }));
  }
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/Class.js":
/*!******************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/Class.js ***!
  \******************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _backbone = _interopRequireDefault(__webpack_require__(/*! backbone */ "./node_modules/backbone/backbone.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Class(options) {
  this.options = _underscoreWrapper.default.clone(options || {});
  this.cid = _underscoreWrapper.default.uniqueId('class');
  this.initialize.apply(this, arguments);
}

_underscoreWrapper.default.extend(Class.prototype, _backbone.default.Events, {
  initialize: function initialize() {}
});

Class.extend = _backbone.default.Model.extend;
var _default = Class;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/Clipboard.js":
/*!**********************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/Clipboard.js ***!
  \**********************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _clipboard = _interopRequireDefault(__webpack_require__(/*! clipboard */ "./node_modules/clipboard/lib/clipboard.js"));

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! ./jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _View = _interopRequireDefault(__webpack_require__(/*! ../framework/View */ "./node_modules/@okta/courage/src/framework/View.js"));

var _Class = _interopRequireDefault(__webpack_require__(/*! ./Class */ "./node_modules/@okta/courage/src/util/Class.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Clipboard = _clipboard.default;
var OPTIONS = ['success', 'error', 'target', 'text'];

var ClipboardClipboardWrapper = _Class.default.extend({
  initialize: function initialize(el, options) {
    /* eslint complexity:0, max-statements: [2, 24] */
    options = _underscoreWrapper.default.pick(options || {}, OPTIONS);
    var trigger;
    var target;
    var text;

    if (_underscoreWrapper.default.isString(el)) {
      trigger = el;
    }

    if (_underscoreWrapper.default.isElement(el)) {
      trigger = el;
    }

    if (el instanceof _jqueryWrapper.default) {
      trigger = el.selector;
    }

    if (el instanceof _View.default) {
      trigger = el.el;
    }

    if (_underscoreWrapper.default.isFunction(options.target)) {
      target = options.target;
    }

    if (_underscoreWrapper.default.isElement(options.target)) {
      target = _underscoreWrapper.default.constant(options.target);
    }

    if (_underscoreWrapper.default.isString(options.text)) {
      text = _underscoreWrapper.default.constant(options.text);
    } else if (_underscoreWrapper.default.isFunction(options.text)) {
      text = options.text;
    }

    this.__instance = new Clipboard(trigger, {
      target: target,
      text: text
    });
    this.done = _underscoreWrapper.default.partial(this.__setCallback, 'success');
    this.error = _underscoreWrapper.default.partial(this.__setCallback, 'error');
    this.done(options.success);
    this.error(options.error);
  },
  __setCallback: function __setCallback(event, callback) {
    if (!_underscoreWrapper.default.isFunction(callback)) {
      return;
    }

    this.__instance.on(event, callback);

    return this.__instance;
  }
});
/**
 * @class Clipboard
 * @abstract
 *
 * Abstract class that initializes a Clipboard
 *   https://clipboardjs.com/
 *
 * ### Example:
 *
 *  ```javascript
 *  //attach a selector
 *  Clipboard.attach('.copy-button');
 *
 *  //attach a node, and set a constant string
 *  Clipboard.attach(buttonView.el, {
 *    text: 'this is the content'
 *  });
 *
 *  //attach a view, set text dynamically, and set callback
 *  Clipboard.attach(buttonView, {
 *    text: function (triggerNode) {
 *      return $(triggerNode).attr('foo') + model.get('userName');
 *    }
 *  }).done(function (targetNode) {
 *    var msg = ['"', targetNode.text, '" is copied'].join('');
 *    view.notify('success', msg);
 *  });
 *
 *  //attach a jquery object, set the target node, and set callback
 *  Clipboard.attach($('.customizeTarget'), {
 *    target: function (triggerNode) {
 *      return triggerNode;
 *    },
 *    success: function (targetNode) {
 *      view.notify('success', 'copied!');
 *    }
 *  });
 *
 * ```
 */


var _default = {
  /**
   * @param {String|Node|View|jQuery} [el] el could be a selector (recommended),
   *           a dom node, a view or a jquery object
   * @param {Object} [options] Options hash
   * @param  {Node|Function} [options.target] a static dom node
   *           or a function that takes trigger node and returns a target node
   * @param {String|Function} [options.text] a static string or a function that returns a string dynamically
   * @param {Function} [options.success] success callback
   * @param {Function} [options.error] error callback
   * @return {Object} The clipboard object
   */
  attach: function attach(el, options) {
    return new ClipboardClipboardWrapper(el, options);
  }
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/Cookie.js":
/*!*******************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/Cookie.js ***!
  \*******************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _js = _interopRequireDefault(__webpack_require__(/*! vendor/lib/js.cookie */ "./node_modules/@okta/courage/src/vendor/lib/js.cookie.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SECURED_COOKIE = /^https/.test(window.location.href);
var _default = {
  setCookie: function setCookie(name, value, options) {
    _js.default.set(name, value, _underscoreWrapper.default.defaults(options || {}, {
      secure: SECURED_COOKIE,
      path: '/'
    }));
  },
  getCookie: function getCookie() {
    return _js.default.get.apply(_js.default, arguments);
  },
  removeCookie: function removeCookie() {
    return _js.default.remove.apply(_js.default, arguments);
  }
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/Keys.js":
/*!*****************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/Keys.js ***!
  \*****************************************************/
/***/ (function(module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;
var _default = {
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
    return (e.which || e.keyCode) === this[key];
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
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/Logger.js":
/*!*******************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/Logger.js ***!
  \*******************************************************/
/***/ (function(module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

function _log(level, args) {
  if (window.console && window.okta && window.okta.debug) {
    window.console[level].apply(window.console, args);
  }
}
/**
 * Utility library of logging functions.
 * @class module:Okta.Logger
 */


var _default =
/** @lends module:Okta.Logger */
{
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
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/SchemaUtil.js":
/*!***********************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/SchemaUtil.js ***!
  \***********************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _StringUtil = _interopRequireDefault(__webpack_require__(/*! ./StringUtil */ "./node_modules/@okta/courage/src/util/StringUtil.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loc = _StringUtil.default.localize;
var SchemaUtils = {
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
    date: {
      type: 'string',
      format: 'date-time'
    },
    uri: {
      type: 'string',
      format: 'uri'
    },
    email: {
      type: 'string',
      format: 'email'
    },
    // TODO: Resolve inconsistencies in hyphens vs. underscores for these properties (OKTA-202818)
    'country-code': {
      type: 'string',
      format: 'country-code'
    },
    'language-code': {
      type: 'string',
      format: 'language-code'
    },
    'country_code': {
      type: 'string'
    },
    'language_code': {
      type: 'string'
    },
    locale: {
      type: 'string',
      format: 'locale'
    },
    timezone: {
      type: 'string',
      format: 'timezone'
    },
    string: {
      type: 'string'
    },
    number: {
      type: 'number'
    },
    boolean: {
      type: 'boolean'
    },
    integer: {
      type: 'integer'
    },
    reference: {
      type: 'string',
      format: 'ref-id'
    },
    arrayofobject: {
      type: 'array',
      items: {
        type: 'object'
      }
    },
    arrayofstring: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    arrayofnumber: {
      type: 'array',
      items: {
        type: 'number'
      }
    },
    arrayofinteger: {
      type: 'array',
      items: {
        type: 'integer'
      }
    },
    'arrayofref-id': {
      type: 'array',
      items: {
        type: 'string',
        format: 'ref-id'
      }
    },
    image: {
      type: 'image'
    },
    password: {
      type: 'string'
    }
  },
  SUPPORTSMINMAX: ['string', 'number', 'integer', 'password'],
  SUPPORTENUM: ['string', 'number', 'integer', 'object', 'arrayofstring', 'arrayofnumber', 'arrayofinteger', 'arrayofobject'],
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
    INHERIT: loc('universal-directory.profiles.attribute.source.inherit', 'courage'),
    OKTA_MASTERED: loc('universal-directory.profiles.attribute.source.oktamastered', 'courage'),
    OVERRIDE: loc('universal-directory.profiles.attribute.source.override', 'courage')
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
  getDisplayType: function getDisplayType(type, format, itemType, defaultValue) {
    var displayType; // type is undefined for
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
  getSourceUsernameType: function getSourceUsernameType(mappingDirection, targetName, appName) {
    var sourceUsernameType = this.USERNAMETYPE.NONE;
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
  isArrayDataType: function isArrayDataType(type) {
    return _underscoreWrapper.default.contains(_underscoreWrapper.default.values(this.ARRAYDISPLAYTYPE), type);
  },
  isObjectDataType: function isObjectDataType(type) {
    return this.DATATYPE.object === type;
  }
};
var _default = SchemaUtils;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/SettingsModel.js":
/*!**************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/SettingsModel.js ***!
  \**************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Model = _interopRequireDefault(__webpack_require__(/*! ../models/Model */ "./node_modules/@okta/courage/src/models/Model.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class SettingsModel
 * @extends {Okta.Model}
 * @private
 */
var _default = _Model.default.extend({
  local: function local() {
    var settings = window.okta && window.okta.settings || {};
    var theme = window.okta && window.okta.theme || '';
    return {
      orgId: ['string', false, settings.orgId],
      orgName: ['string', false, settings.orgName],
      serverStatus: ['string', false, settings.serverStatus],
      persona: ['string', false, settings.persona],
      isDeveloperConsole: ['boolean', false, settings.isDeveloperConsole],
      isPreview: ['boolean', false, settings.isPreview],
      permissions: ['array', true, settings.permissions || []],
      theme: ['string', false, theme]
    };
  },
  constructor: function constructor() {
    _Model.default.apply(this, arguments);

    this.features = window._features || [];
  },

  /**
   * Checks if the user have a feature flag enabled (Based of the org level feature flag)
   * @param  {String}  feature Feature name
   * @return {Boolean}
   */
  hasFeature: function hasFeature(feature) {
    return _underscoreWrapper.default.contains(this.features, feature);
  },

  /**
   * Checks if any of the given feature flags are enabled (Based of the org level feature flags)
   * @param  {Array}  featureArray Features names
   * @return {Boolean} true if any of the give features are enabled. False otherwise
   */
  hasAnyFeature: function hasAnyFeature(featureArray) {
    return _underscoreWrapper.default.some(featureArray, this.hasFeature, this);
  },

  /**
   * Checks if the user have a specific permission (based on data passed from JSP)
   * @param  {String}  permission Permission name
   * @return {Boolean}
   */
  hasPermission: function hasPermission(permission) {
    return _underscoreWrapper.default.contains(this.get('permissions'), permission);
  },

  /**
   * Checks if the org has ds theme set
   * @return {Boolean}
   */
  isDsTheme: function isDsTheme() {
    return this.get('theme') === 'dstheme';
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/StateMachine.js":
/*!*************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/StateMachine.js ***!
  \*************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Model = _interopRequireDefault(__webpack_require__(/*! ../models/Model */ "./node_modules/@okta/courage/src/models/Model.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class StateMachine
 * @extends Okta.Model
 * @private
 *
 * A state object that holds the applciation state
 */
var _default = _Model.default.extend({
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
    var args = _underscoreWrapper.default.toArray(arguments);

    args.unshift('__invoke__');
    this.trigger.apply(this, args);
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/StringUtil.js":
/*!***********************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/StringUtil.js ***!
  \***********************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! ./jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _oktaI18nBundles = _interopRequireDefault(__webpack_require__(/*! okta-i18n-bundles */ "okta-i18n-bundles"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var entityMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': '\'',
  '&#039;': '\'',
  '&#x2F;': '/'
};
var emailValidator = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(?!-)((\[?[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\]?)|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
/**
* Converts the locale code identifier from "${languageCode}-${countryCode}" to "${languageCode}_${countryCode}"
* Follows the ISO-639-1 language code and 2-letter ISO-3166-1-alpha-2 country code structure.
* @param {String} locale code identifier
* @return {String} converted locale code identifier
*/

var parseLocale = function parseLocale(locale) {
  if (/-/.test(locale)) {
    var parts = locale.split('-');
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
    return _oktaI18nBundles.default[_underscoreWrapper.default.keys(_oktaI18nBundles.default)[0]];
  }

  var locale = parseLocale(window && window.okta && window.okta.locale) || 'en';
  return _oktaI18nBundles.default["".concat(bundleName, "_").concat(locale)] || _oktaI18nBundles.default[bundleName];
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
    var event = new CustomEvent('okta-i18n-error', {
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

var StringUtil =
/** @lends module:Okta.internal.util.StringUtil */
{
  /** @static */
  sprintf: function sprintf() {
    var args = Array.prototype.slice.apply(arguments);
    var value = args.shift();
    var oldValue = value;
    /* eslint max-statements: [2, 15] */

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
   * Get the original i18n template directly without string format with parameters
   * @param {String} key The key
   * @param {String} bundle="messages"] The name of the i18n bundle. Defaults to the first bundle in the list.
   */
  getTemplate: function getTemplate(key, bundleName) {
    var bundle = getBundle(bundleName);

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
  localize: function localize(key, bundleName, params) {
    var bundle = getBundle(bundleName);
    /* eslint complexity: [2, 6] */

    if (!bundle) {
      emitL10nError(key, bundleName, 'bundle');
      return 'L10N_ERROR[' + bundleName + ']';
    }

    var value = bundle[key];

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
    return typeof string === 'string' && number === parseFloat(string) ? number : string;
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
    return _underscoreWrapper.default.isString(string) && int === parseInt(string, 10) ? int : string;
  }),

  /**
   * Convert a string to an object if valid, otherwise return the string
   * @static
   * @param {String} string The string to convert to an object
   * @return {String|object} Returns an object if the string can be casted, otherwise, returns the original string
   */
  parseObject: function parseObject(string) {
    if (!_underscoreWrapper.default.isString(string)) {
      return string;
    }

    try {
      var object = JSON.parse(string);
      return _jqueryWrapper.default.isPlainObject(object) ? object : string;
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
      length = _underscoreWrapper.default.random(characters.length);
    } else if (length === 0) {
      return '';
    }

    var stringArray = [];

    while (length--) {
      stringArray.push(characters[_underscoreWrapper.default.random(characters.length - 1)]);
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
    var target = _jqueryWrapper.default.trim(str);

    return !_underscoreWrapper.default.isEmpty(target) && emailValidator.test(target);
  }
};
/**
 * Handy utility functions to handle strings.
 *
 * @class module:Okta.internal.util.StringUtil
 * @hideconstructor
 */

var _default = StringUtil;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/TemplateUtil.js":
/*!*************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/TemplateUtil.js ***!
  \*************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _handlebars = _interopRequireDefault(__webpack_require__(/*! handlebars */ "handlebars"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint @okta/okta-ui/no-specific-methods: 0 */

/**
 * @class module:Okta.internal.util.TemplateUtil
 * @hideconstructor
 */
var _default =
/** @lends module:Okta.internal.util.TemplateUtil */
{
  /**
   * Compiles a Handlebars template
   * @static
   * @method
   */
  // TODO: This will be deprecated at some point. Views should use pre-compiled templates
  tpl: _underscoreWrapper.default.memoize(function (tpl) {
    /* eslint @okta/okta-ui/no-specific-methods: 0 */
    return function (context) {
      return _handlebars.default.compile(tpl)(context);
    };
  })
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/Time.js":
/*!*****************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/Time.js ***!
  \*****************************************************/
/***/ (function(module, exports) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;
var _default = {
  DEBOUNCE_DELAY: 200,
  LOADING_FADE: 400,
  UNLOADING_FADE: 400,
  ROW_EXPANDER_TRANSITION: 150,
  HIDE_ADD_MAPPING_FORM: 300
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/Util.js":
/*!*****************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/Util.js ***!
  \*****************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../views/BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
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
    _underscoreWrapper.default.isObject(queries) || (queries = {});

    var queriesString = _underscoreWrapper.default.without(_underscoreWrapper.default.map(queries, function (value, key) {
      if (value !== undefined && value !== null) {
        return key + '=' + encodeURIComponent(value);
      }
    }), undefined).join('&');

    return _underscoreWrapper.default.isEmpty(queriesString) ? '' : '?' + queriesString;
  },
  isABaseView: function isABaseView(obj) {
    return obj instanceof _BaseView.default || obj.prototype instanceof _BaseView.default || obj === _BaseView.default;
  }
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/ViewUtil.js":
/*!*********************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/ViewUtil.js ***!
  \*********************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function changeEventString(doWhen) {
  return 'change:' + _underscoreWrapper.default.keys(doWhen).join(' change:');
}

function calcDoWhen(value, key) {
  var modelValue = this.model.get(key);

  if (_underscoreWrapper.default.isFunction(value)) {
    return value.call(this, modelValue);
  } else {
    return value === modelValue;
  }
}

function _doWhen(view, doWhen, fn) {
  var toggle = _underscoreWrapper.default.bind(fn, view, view, doWhen);

  view.render = _underscoreWrapper.default.wrap(view.render, function (render) {
    var val = render.call(view);
    toggle({
      animate: false
    });
    return val;
  });
  view.listenTo(view.model, changeEventString(doWhen), function () {
    toggle({
      animate: true
    });
  });
}

var _default = {
  applyDoWhen: function applyDoWhen(view, doWhen, fn) {
    if (!(view.model && _underscoreWrapper.default.isObject(doWhen) && _underscoreWrapper.default.size(doWhen) && _underscoreWrapper.default.isFunction(fn))) {
      return;
    }

    _doWhen(view, doWhen, function (view, doWhen, options) {
      var result = _underscoreWrapper.default.every(_underscoreWrapper.default.map(doWhen, calcDoWhen, view));

      fn.call(view, result, options);
    });
  }
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/handlebars-wrapper.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/handlebars-wrapper.js ***!
  \*******************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _handlebars = _interopRequireDefault(__webpack_require__(/*! handlebars */ "handlebars"));

__webpack_require__(/*! ./handlebars/handle-url */ "./node_modules/@okta/courage/src/util/handlebars/handle-url.js");

__webpack_require__(/*! ./handlebars/helper-base64 */ "./node_modules/@okta/courage/src/util/handlebars/helper-base64.js");

__webpack_require__(/*! ./handlebars/helper-date */ "./node_modules/@okta/courage/src/util/handlebars/helper-date.js");

__webpack_require__(/*! ./handlebars/helper-i18n */ "./node_modules/@okta/courage/src/util/handlebars/helper-i18n.js");

__webpack_require__(/*! ./handlebars/helper-img */ "./node_modules/@okta/courage/src/util/handlebars/helper-img.js");

__webpack_require__(/*! ./handlebars/helper-markdown */ "./node_modules/@okta/courage/src/util/handlebars/helper-markdown.js");

__webpack_require__(/*! ./handlebars/helper-xsrfTokenInput */ "./node_modules/@okta/courage/src/util/handlebars/helper-xsrfTokenInput.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Handlebars "wrapper" is used by frontend code. It contains all helpers.
// This runs in a browser / webpacked environment
// TODO: Once all templates are precompiled, this file should use handlebars/runtime

/* eslint @okta/okta-ui/no-specific-modules: 0 */
// from vendor/lib
var _default = _handlebars.default;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/handlebars/handle-url.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/handlebars/handle-url.js ***!
  \**********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _handlebars = _interopRequireDefault(__webpack_require__(/*! handlebars */ "handlebars"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var clonedEscapeExpression = _handlebars.default.Utils.escapeExpression;

_handlebars.default.Utils.escapeExpression = function (string) {
  return clonedEscapeExpression(string).replace(/&#x3D;/g, '=');
};

var _default = _handlebars.default;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/handlebars/helper-base64.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/handlebars/helper-base64.js ***!
  \*************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* eslint @okta/okta-ui/no-specific-modules: 0 */

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _handlebars = _interopRequireDefault(__webpack_require__(/*! handlebars */ "handlebars"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Display a base 64 encoded data (e.g. certificate signature) in a nicely formatted hex format.
_handlebars.default.registerHelper('base64ToHex', function (base64String) {
  var raw = atob(base64String);
  var result = '';

  if (raw.length > 0) {
    var firstHex = raw.charCodeAt(0).toString(16);
    result += firstHex.length === 2 ? firstHex : '0' + firstHex;

    for (var i = 1; i < raw.length; i++) {
      var hex = raw.charCodeAt(i).toString(16);
      result += ' ' + (hex.length === 2 ? hex : '0' + hex);
    }
  }

  return result.toUpperCase();
});

var _default = _handlebars.default;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/handlebars/helper-date.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/handlebars/helper-date.js ***!
  \***********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _handlebars = _interopRequireDefault(__webpack_require__(/*! handlebars */ "handlebars"));

var _moment = _interopRequireDefault(__webpack_require__(/*! moment */ "./src/empty.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint @okta/okta-ui/no-specific-modules: 0, max-params: 0, max-statements: 0 */
function formatDate(format, dateInISOString) {
  return _moment.default.utc(dateInISOString).utcOffset('-07:00').format(format);
}

_handlebars.default.registerHelper('shortDate', _underscoreWrapper.default.partial(formatDate, 'MMM Do'));

_handlebars.default.registerHelper('mediumDate', _underscoreWrapper.default.partial(formatDate, 'MMMM DD, YYYY'));

_handlebars.default.registerHelper('longDate', _underscoreWrapper.default.partial(formatDate, 'MMMM DD, YYYY, h:mma'));

_handlebars.default.registerHelper('formatDate', formatDate);

var _default = _handlebars.default;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/handlebars/helper-i18n.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/handlebars/helper-i18n.js ***!
  \***********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _handlebars = _interopRequireDefault(__webpack_require__(/*! handlebars */ "handlebars"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Logger = _interopRequireDefault(__webpack_require__(/*! ../Logger */ "./node_modules/@okta/courage/src/util/Logger.js"));

var _StringUtil = _interopRequireDefault(__webpack_require__(/*! ../StringUtil */ "./node_modules/@okta/courage/src/util/StringUtil.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var hbsEscape = _handlebars.default.Utils.escapeExpression;

function trim(str) {
  return str && str.replace(/^\s+|\s+$/g, '');
}

function replaceTagsWithPlaceholders(source, tag, tagValue) {
  var escapedBeginningTag = hbsEscape("<".concat(tag, ">"));
  var escapedEndTag = hbsEscape("</".concat(tag, ">"));

  var _tagValue$split = tagValue.split(tag),
      _tagValue$split2 = _slicedToArray(_tagValue$split, 2),
      beginningTag = _tagValue$split2[0],
      endTag = _tagValue$split2[1];

  if (!source.includes(escapedBeginningTag) && !source.includes(escapedEndTag)) {
    throw Error("Parsed tag \"".concat(tag, "\" is not present in \"").concat(source, "\""));
  } else if (!tagValue.includes(tag)) {
    throw Error("Parsed tag \"".concat(tag, "\" is not present in \"").concat(tagValue, "\""));
  } else if (!beginningTag || !endTag) {
    throw Error("Template value \"".concat(tagValue, "\" must contain beginning and closing tags"));
  }

  return source.replace(escapedBeginningTag, beginningTag).replace(escapedEndTag, endTag);
}
/* eslint max-statements: [2, 18] */


_handlebars.default.registerHelper('i18n', function (options) {
  var params;
  var key = trim(options.hash.code);
  var bundle = trim(options.hash.bundle);
  var args = trim(options.hash['arguments']);
  var tags = Object.keys(options.hash).filter(function (prop) {
    return prop.match(/^\$\d+/);
  }).map(function (prop) {
    return {
      tag: prop,
      value: options.hash[prop]
    };
  });

  if (args) {
    params = _underscoreWrapper.default.map(trim(args).split(';'), function (param) {
      param = trim(param);
      var val;
      var data = this;
      /*
       * the context(data) may be a deep object, ex {user: {name: 'John', gender: 'M'}}
       * arguments may be 'user.name'
       * return data['user']['name']
       */

      _underscoreWrapper.default.each(param.split('.'), function (p) {
        val = val ? val[p] : data[p];
      });

      return val;
    }, this);
  }

  var localizedValue = _StringUtil.default.localize(key, bundle, params);

  if (tags.length < 1) {
    // No HTML tags provided - return the localized and escaped string
    return localizedValue;
  }

  var escapedString = hbsEscape(localizedValue);

  try {
    tags.forEach(function (tag) {
      escapedString = replaceTagsWithPlaceholders(escapedString, tag.tag, tag.value);
    });
    return new _handlebars.default.SafeString(escapedString);
  } catch (err) {
    _Logger.default.error(err.toString());

    return localizedValue;
  }
});

var _default = _handlebars.default;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/handlebars/helper-img.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/handlebars/helper-img.js ***!
  \**********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _handlebars = _interopRequireDefault(__webpack_require__(/*! handlebars */ "handlebars"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint @okta/okta-ui/no-specific-modules: 0 */
var CACHE_BUST_URL_PREFIX = '/assets';

function prependCachebustPrefix(path) {
  if (path.indexOf(CACHE_BUST_URL_PREFIX) === 0) {
    return path;
  }

  return CACHE_BUST_URL_PREFIX + path;
}

_handlebars.default.registerHelper('img', function (options) {
  var cdn = typeof okta !== 'undefined' && okta.cdnUrlHostname || '';
  /*global okta */

  var hash = _underscoreWrapper.default.pick(options.hash, ['src', 'alt', 'width', 'height', 'class', 'title']);

  hash.src = '' + cdn + prependCachebustPrefix(hash.src);

  var attrs = _underscoreWrapper.default.map(hash, function (value, attr) {
    return attr + '="' + (attr === 'src' ? encodeURI(value) : _handlebars.default.Utils.escapeExpression(value)) + '"';
  });

  return new _handlebars.default.SafeString('<img ' + attrs.join(' ') + '/>');
});

var _default = _handlebars.default;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/handlebars/helper-markdown.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/handlebars/helper-markdown.js ***!
  \***************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _handlebars = _interopRequireDefault(__webpack_require__(/*! handlebars */ "handlebars"));

var _markdownToHtml = _interopRequireDefault(__webpack_require__(/*! ../markdownToHtml */ "./node_modules/@okta/courage/src/util/markdownToHtml.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint @okta/okta-ui/no-specific-modules: 0 */
_handlebars.default.registerHelper('markdown', function (mdText) {
  return (0, _markdownToHtml.default)(_handlebars.default, mdText);
});

var _default = _handlebars.default;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/handlebars/helper-xsrfTokenInput.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/handlebars/helper-xsrfTokenInput.js ***!
  \*********************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _handlebars = _interopRequireDefault(__webpack_require__(/*! handlebars */ "handlebars"));

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! ../jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint @okta/okta-ui/no-specific-modules: 0 */
_handlebars.default.registerHelper('xsrfTokenInput', function () {
  return new _handlebars.default.SafeString('<input type="hidden" class="hide" name="_xsrfToken" ' + 'value="' + (0, _jqueryWrapper.default)('#_xsrfToken').text() + '">');
});

var _default = _handlebars.default;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/jquery-wrapper.js":
/*!***************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/jquery-wrapper.js ***!
  \***************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _jquery = _interopRequireDefault(__webpack_require__(/*! jquery */ "jquery"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable @okta/okta-ui/enforce-requirejs-names, @okta/okta-ui/no-specific-modules */
_jquery.default.ajaxSetup({
  beforeSend: function beforeSend(xhr) {
    xhr.setRequestHeader('X-Okta-XsrfToken', (0, _jquery.default)('#_xsrfToken').text());
  },
  converters: {
    'text secureJSON': function textSecureJSON(str) {
      if (str.substring(0, 11) === 'while(1){};') {
        str = str.substring(11);
      }

      return JSON.parse(str);
    }
  }
}); // Selenium Hook
// Widget such as autocomplete and autosuggest needs to be triggered from the running version of jQuery.
// We have 2 versions of jQuery running in parallel and they don't share the same events bus


window.jQueryCourage = _jquery.default;
var _default = _jquery.default;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/markdownToHtml.js":
/*!***************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/markdownToHtml.js ***!
  \***************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = mdToHtml;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ./underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Simple "markdown parser" - just handles markdown formatted links. If we
// find that we need more extensive markdown support, we should include
// a fully formulated markdown library like:
// https://github.com/evilstreak/markdown-js
var RE_LINK = /\[[^\]]*\]\([^)]*\)/gi;
var RE_LINK_HREF = /\]\(([^)]*)\)/i;
var RE_LINK_TEXT = /\[([^\]]*)\]/i;
var RE_LINK_JS = /javascript:/gi; // Converts links
// FROM:
// [some link text](http://the/link/url)
// TO:
// <a href="http://the/link/url">some link text</a>

function mdToHtml(Handlebars, markdownText) {
  // TODO: use precompiled templates OKTA-309852
  // eslint-disable-next-line @okta/okta-ui/no-bare-templates
  var linkTemplate = Handlebars.compile('<a href="{{href}}">{{text}}</a>');
  /* eslint  @okta/okta-ui/no-specific-methods: 0*/

  var res;

  if (!_underscoreWrapper.default.isString(markdownText)) {
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
}

module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/util/underscore-wrapper.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@okta/courage/src/util/underscore-wrapper.js ***!
  \*******************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _handlebars = _interopRequireDefault(__webpack_require__(/*! handlebars */ "handlebars"));

var _underscore = _interopRequireDefault(__webpack_require__(/*! underscore */ "underscore"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint @okta/okta-ui/no-specific-methods: 0, @okta/okta-ui/no-specific-modules: 0 */
_underscore.default.mixin({
  resultCtx: function resultCtx(object, property, context, defaultValue) {
    var value = _underscore.default.isObject(object) ? object[property] : void 0;

    if (_underscore.default.isFunction(value)) {
      value = value.call(context || object);
    }

    if (value) {
      return value;
    } else {
      return !_underscore.default.isUndefined(defaultValue) ? defaultValue : value;
    }
  },
  isInteger: function isInteger(x) {
    return _underscore.default.isNumber(x) && x % 1 === 0;
  },
  // TODO: This will be deprecated at some point. Views should use precompiled templates
  // eslint-disable-next-line @okta/okta-ui/no-bare-templates
  template: function template(source, data) {
    var template = _handlebars.default.compile(source);

    return data ? template(data) : function (data) {
      return template(data);
    };
  }
});

var _default = _underscore.default;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/vendor/lib/js.cookie.js":
/*!****************************************************************!*\
  !*** ./node_modules/@okta/courage/src/vendor/lib/js.cookie.js ***!
  \****************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*!
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
  } else { var api, _OldCookies; }
})(function () {
  function extend() {
    var i = 0;
    var result = {};

    for (; i < arguments.length; i++) {
      var attributes = arguments[i];

      for (var key in attributes) {
        result[key] = attributes[key];
      }
    }

    return result;
  }

  function init(converter) {
    function api(key, value, attributes) {
      var result; // Write

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
          value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
        } else {
          value = converter.write(value, key);
        }

        key = encodeURIComponent(String(key));
        key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
        key = key.replace(/[\(\)]/g, escape);
        return document.cookie = [key, '=', value, attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
        attributes.path && '; path=' + attributes.path, attributes.domain && '; domain=' + attributes.domain, attributes.secure ? '; secure' : ''].join('');
      } // Read


      if (!key) {
        result = {};
      } // To prevent the for loop in the first place assign an empty array
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
          cookie = converter.read ? converter.read(cookie, name) : converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);

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
});

/***/ }),

/***/ "./node_modules/@okta/courage/src/vendor/plugins/chosen.jquery.js":
/*!************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/vendor/plugins/chosen.jquery.js ***!
  \************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

// Chosen, a Select Box Enhancer for jQuery and Prototype
// by Patrick Filler for Harvest, http://getharvest.com
//
// Version 0.11.1
// Full source at https://github.com/harvesthq/chosen
// Copyright (c) 2011 Harvest http://getharvest.com
// MIT License, https://github.com/harvesthq/chosen/blob/master/LICENSE.md
// This file is generated by `grunt build`, do not edit it by hand.
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! jquery */ "jquery")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (jQuery) {
  (function () {
    var SelectParser;

    SelectParser = function () {
      function SelectParser() {
        this.options_index = 0;
        this.parsed = [];
      }

      SelectParser.prototype.add_node = function (child) {
        if (child.nodeName.toUpperCase() === "OPTGROUP") {
          return this.add_group(child);
        } else {
          return this.add_option(child);
        }
      };

      SelectParser.prototype.add_group = function (group) {
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

      SelectParser.prototype.add_option = function (option, group_position, group_disabled) {
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
    }();

    SelectParser.select_to_array = function (select) {
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
  (function () {
    var AbstractChosen, root;
    root = this;

    AbstractChosen = function () {
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

      AbstractChosen.prototype.set_default_values = function () {
        var _this = this;

        this.click_test_action = function (evt) {
          return _this.test_active_click(evt);
        };

        this.activate_action = function (evt) {
          return _this.activate_field(evt);
        };

        this.active_field = false;
        this.mouse_on_container = false;
        this.results_showing = false;
        this.result_highlighted = null;
        this.result_single_selected = null;
        this.allow_single_deselect = this.options.allow_single_deselect != null && this.form_field.options[0] != null && this.form_field.options[0].text === "" ? this.options.allow_single_deselect : false;
        this.disable_search_threshold = this.options.disable_search_threshold || 0;
        this.disable_search = this.options.disable_search || false;
        this.enable_split_word_search = this.options.enable_split_word_search != null ? this.options.enable_split_word_search : true;
        this.search_contains = this.options.search_contains || false;
        this.single_backstroke_delete = this.options.single_backstroke_delete || false;
        this.max_selected_options = this.options.max_selected_options || Infinity;
        return this.inherit_select_classes = this.options.inherit_select_classes || false;
      };

      AbstractChosen.prototype.set_default_text = function () {
        if (this.form_field.getAttribute("data-placeholder")) {
          this.default_text = this.form_field.getAttribute("data-placeholder");
        } else if (this.is_multiple) {
          this.default_text = this.options.placeholder_text_multiple || this.options.placeholder_text || AbstractChosen.default_multiple_text;
        } else {
          this.default_text = this.options.placeholder_text_single || this.options.placeholder_text || AbstractChosen.default_single_text;
        }

        return this.results_none_found = this.form_field.getAttribute("data-no_results_text") || this.options.no_results_text || AbstractChosen.default_no_result_text;
      };

      AbstractChosen.prototype.mouse_enter = function () {
        return this.mouse_on_container = true;
      };

      AbstractChosen.prototype.mouse_leave = function () {
        return this.mouse_on_container = false;
      };

      AbstractChosen.prototype.input_focus = function (evt) {
        var _this = this;

        if (this.is_multiple) {
          if (!this.active_field) {
            return setTimeout(function () {
              return _this.container_mousedown();
            }, 50);
          }
        } else {
          if (!this.active_field) {
            return this.activate_field();
          }
        }
      };

      AbstractChosen.prototype.input_blur = function (evt) {
        var _this = this;

        if (!this.mouse_on_container) {
          this.active_field = false;
          return setTimeout(function () {
            return _this.blur_test();
          }, 100);
        }
      };

      AbstractChosen.prototype.result_add_option = function (option) {
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

      AbstractChosen.prototype.results_update_field = function () {
        this.set_default_text();

        if (!this.is_multiple) {
          this.results_reset_cleanup();
        }

        this.result_clear_highlight();
        this.result_single_selected = null;
        return this.results_build();
      };

      AbstractChosen.prototype.results_toggle = function () {
        if (this.results_showing) {
          return this.results_hide();
        } else {
          return this.results_show();
        }
      };

      AbstractChosen.prototype.results_search = function (evt) {
        if (this.results_showing) {
          return this.winnow_results();
        } else {
          return this.results_show();
        }
      };

      AbstractChosen.prototype.choices_count = function () {
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

      AbstractChosen.prototype.choices_click = function (evt) {
        evt.preventDefault();

        if (!(this.results_showing || this.is_disabled)) {
          return this.results_show();
        }
      };

      AbstractChosen.prototype.keyup_checker = function (evt) {
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

      AbstractChosen.prototype.generate_field_id = function () {
        var new_id;
        new_id = this.generate_random_id();
        this.form_field.id = new_id;
        return new_id;
      };

      AbstractChosen.prototype.generate_random_char = function () {
        var chars, newchar, rand;
        chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        rand = Math.floor(Math.random() * chars.length);
        return newchar = chars.substring(rand, rand + 1);
      };

      AbstractChosen.prototype.container_width = function () {
        if (this.options.width != null) {
          return this.options.width;
        } else {
          return "" + this.form_field.offsetWidth + "px";
        }
      };

      AbstractChosen.browser_is_supported = function () {
        var _ref;

        if (window.navigator.appName === "Microsoft Internet Explorer") {
          return null !== (_ref = document.documentMode) && _ref >= 8;
        }

        return true;
      };

      AbstractChosen.default_multiple_text = "Select Some Options";
      AbstractChosen.default_single_text = "Select an Option";
      AbstractChosen.default_no_result_text = "No results match";
      return AbstractChosen;
    }();

    root.AbstractChosen = AbstractChosen;
  }).call(this);
  (function () {
    var $,
        Chosen,
        root,
        _ref,
        __hasProp = {}.hasOwnProperty,
        __extends = function __extends(child, parent) {
      for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
      }

      function ctor() {
        this.constructor = child;
      }

      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;
      return child;
    };

    root = this; // OKTA-93521 - plugin assumes root is global scope

    var AbstractChosen = root.AbstractChosen;
    $ = jQuery;
    $.fn.extend({
      chosen: function chosen(options) {
        if (!AbstractChosen.browser_is_supported()) {
          return this;
        }

        return this.each(function (input_field) {
          var $this;
          $this = $(this);

          if (!$this.hasClass("chzn-done")) {
            return $this.data('chosen', new Chosen(this, options));
          }
        });
      }
    });

    Chosen = function (_super) {
      __extends(Chosen, _super);

      function Chosen() {
        _ref = Chosen.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Chosen.prototype.setup = function () {
        this.form_field_jq = $(this.form_field);
        this.current_selectedIndex = this.form_field.selectedIndex;
        return this.is_rtl = this.form_field_jq.hasClass("chzn-rtl");
      };

      Chosen.prototype.finish_setup = function () {
        return this.form_field_jq.addClass("chzn-done");
      };

      Chosen.prototype.set_up_html = function () {
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
          'style': "width: " + this.container_width() + ";",
          'title': this.form_field.title
        };
        this.container = $("<div></div>", container_props);

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

      Chosen.prototype.register_observers = function () {
        var _this = this;

        this.container.mousedown(function (evt) {
          _this.container_mousedown(evt);
        });
        this.container.mouseup(function (evt) {
          _this.container_mouseup(evt);
        });
        this.container.mouseenter(function (evt) {
          _this.mouse_enter(evt);
        });
        this.container.mouseleave(function (evt) {
          _this.mouse_leave(evt);
        });
        this.search_results.mouseup(function (evt) {
          _this.search_results_mouseup(evt);
        });
        this.search_results.mouseover(function (evt) {
          _this.search_results_mouseover(evt);
        });
        this.search_results.mouseout(function (evt) {
          _this.search_results_mouseout(evt);
        });
        this.search_results.bind('mousewheel DOMMouseScroll', function (evt) {
          _this.search_results_mousewheel(evt);
        });
        this.form_field_jq.bind("liszt:updated", function (evt) {
          _this.results_update_field(evt);
        });
        this.form_field_jq.bind("liszt:activate", function (evt) {
          _this.activate_field(evt);
        });
        this.form_field_jq.bind("liszt:open", function (evt) {
          _this.container_mousedown(evt);
        });
        this.search_field.blur(function (evt) {
          _this.input_blur(evt);
        });
        this.search_field.keyup(function (evt) {
          _this.keyup_checker(evt);
        });
        this.search_field.keydown(function (evt) {
          _this.keydown_checker(evt);
        });
        this.search_field.focus(function (evt) {
          _this.input_focus(evt);
        });

        if (this.is_multiple) {
          return this.search_choices.click(function (evt) {
            _this.choices_click(evt);
          });
        } else {
          return this.container.click(function (evt) {
            evt.preventDefault();
          });
        }
      };

      Chosen.prototype.search_field_disabled = function () {
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

      Chosen.prototype.container_mousedown = function (evt) {
        if (!this.is_disabled) {
          if (evt && evt.type === "mousedown" && !this.results_showing) {
            evt.preventDefault();
          }

          if (!(evt != null && $(evt.target).hasClass("search-choice-close"))) {
            if (!this.active_field) {
              if (this.is_multiple) {
                this.search_field.val("");
              }

              $(document).click(this.click_test_action);
              this.results_show();
            } else if (!this.is_multiple && evt && ($(evt.target)[0] === this.selected_item[0] || $(evt.target).parents("a.chzn-single").length)) {
              evt.preventDefault();
              this.results_toggle();
            }

            return this.activate_field();
          }
        }
      };

      Chosen.prototype.container_mouseup = function (evt) {
        if (evt.target.nodeName === "ABBR" && !this.is_disabled) {
          return this.results_reset(evt);
        }
      };

      Chosen.prototype.search_results_mousewheel = function (evt) {
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

      Chosen.prototype.blur_test = function (evt) {
        if (!this.active_field && this.container.hasClass("chzn-container-active")) {
          return this.close_field();
        }
      };

      Chosen.prototype.close_field = function () {
        $(document).unbind("click", this.click_test_action);
        this.active_field = false;
        this.results_hide();
        this.container.removeClass("chzn-container-active");
        this.clear_backstroke();
        this.show_search_field_default();
        return this.search_field_scale();
      };

      Chosen.prototype.activate_field = function () {
        this.container.addClass("chzn-container-active");
        this.active_field = true;
        this.search_field.val(this.search_field.val());
        return this.search_field.focus();
      };

      Chosen.prototype.test_active_click = function (evt) {
        if ($(evt.target).parents('#' + this.container_id).length) {
          return this.active_field = true;
        } else {
          return this.close_field();
        }
      };

      Chosen.prototype.results_build = function () {
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

      Chosen.prototype.result_add_group = function (group) {
        group.dom_id = this.container_id + "_g_" + group.array_index;
        return '<li id="' + group.dom_id + '" class="group-result">' + $("<div></div>").text(group.label).html() + '</li>';
      };

      Chosen.prototype.result_do_highlight = function (el) {
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
            return this.search_results.scrollTop(high_bottom - maxHeight > 0 ? high_bottom - maxHeight : 0);
          } else if (high_top < visible_top) {
            return this.search_results.scrollTop(high_top);
          }
        }
      };

      Chosen.prototype.result_clear_highlight = function () {
        if (this.result_highlight) {
          this.result_highlight.removeClass("highlighted");
        }

        return this.result_highlight = null;
      };

      Chosen.prototype.results_show = function () {
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

      Chosen.prototype.results_hide = function () {
        if (this.results_showing) {
          this.result_clear_highlight();
          this.container.removeClass("chzn-with-drop");
          this.form_field_jq.trigger("liszt:hiding_dropdown", {
            chosen: this
          });
        }

        return this.results_showing = false;
      };

      Chosen.prototype.set_tab_index = function (el) {
        var ti;

        if (this.form_field_jq.attr("tabindex")) {
          ti = this.form_field_jq.attr("tabindex");
          this.form_field_jq.attr("tabindex", -1);
          return this.search_field.attr("tabindex", ti);
        }
      };

      Chosen.prototype.set_label_behavior = function () {
        var _this = this;

        this.form_field_label = this.form_field_jq.parents("label");

        if (!this.form_field_label.length && this.form_field.id.length) {
          this.form_field_label = $("label[for='" + this.form_field.id + "']");
        }

        if (this.form_field_label.length > 0) {
          return this.form_field_label.click(function (evt) {
            if (_this.is_multiple) {
              return _this.container_mousedown(evt);
            } else {
              return _this.activate_field();
            }
          });
        }
      };

      Chosen.prototype.show_search_field_default = function () {
        if (this.is_multiple && this.choices_count() < 1 && !this.active_field) {
          this.search_field.val(this.default_text);
          return this.search_field.addClass("default");
        } else {
          this.search_field.val("");
          return this.search_field.removeClass("default");
        }
      };

      Chosen.prototype.search_results_mouseup = function (evt) {
        var target;
        target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();

        if (target.length) {
          this.result_highlight = target;
          this.result_select(evt);
          return this.search_field.focus();
        }
      };

      Chosen.prototype.search_results_mouseover = function (evt) {
        var target;
        target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();

        if (target) {
          return this.result_do_highlight(target);
        }
      };

      Chosen.prototype.search_results_mouseout = function (evt) {
        if ($(evt.target).hasClass("active-result" || 0)) {
          return this.result_clear_highlight();
        }
      };

      Chosen.prototype.choice_build = function (item) {
        var choice,
            close_link,
            _this = this;

        choice = $('<li></li>', {
          "class": "search-choice"
        }).html("<span>" + item.html + "</span>");

        if (item.disabled) {
          choice.addClass('search-choice-disabled');
        } else {
          close_link = $('<a></a>', {
            href: '#',
            "class": 'search-choice-close',
            rel: item.array_index
          });
          close_link.click(function (evt) {
            return _this.choice_destroy_link_click(evt);
          });
          choice.append(close_link);
        }

        return this.search_container.before(choice);
      };

      Chosen.prototype.choice_destroy_link_click = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();

        if (!this.is_disabled) {
          return this.choice_destroy($(evt.target));
        }
      };

      Chosen.prototype.choice_destroy = function (link) {
        if (this.result_deselect(link.attr("rel"))) {
          this.show_search_field_default();

          if (this.is_multiple && this.choices_count() > 0 && this.search_field.val().length < 1) {
            this.results_hide();
          }

          link.parents('li').first().remove();
          return this.search_field_scale();
        }
      };

      Chosen.prototype.results_reset = function () {
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

      Chosen.prototype.results_reset_cleanup = function () {
        this.current_selectedIndex = this.form_field.selectedIndex;
        return this.selected_item.find("abbr").remove();
      };

      Chosen.prototype.result_select = function (evt) {
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

      Chosen.prototype.result_activate = function (el, option) {
        if (option.disabled) {
          return el.addClass("disabled-result");
        } else if (this.is_multiple && option.selected) {
          return el.addClass("result-selected");
        } else {
          return el.addClass("active-result");
        }
      };

      Chosen.prototype.result_deactivate = function (el) {
        return el.removeClass("active-result result-selected disabled-result");
      };

      Chosen.prototype.result_deselect = function (pos) {
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

      Chosen.prototype.single_deselect_control_build = function () {
        if (!this.allow_single_deselect) {
          return;
        }

        if (!this.selected_item.find("abbr").length) {
          this.selected_item.find("span").first().after("<abbr class=\"search-choice-close\"></abbr>");
        }

        return this.selected_item.addClass("chzn-single-with-deselect");
      };

      Chosen.prototype.winnow_results = function () {
        var found, option, part, parts, regex, regexAnchor, result, result_id, results, searchText, startpos, text, zregex, _i, _j, _len, _len1, _ref1;

        this.no_results_clear();
        results = 0;
        searchText = this.search_field.val() === this.default_text ? "" : $('<div></div>').text($.trim(this.search_field.val())).html();
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

      Chosen.prototype.winnow_results_set_highlight = function () {
        var do_high, selected_results;

        if (!this.result_highlight) {
          selected_results = !this.is_multiple ? this.search_results.find(".result-selected.active-result") : [];
          do_high = selected_results.length ? selected_results.first() : this.search_results.find(".active-result").first();

          if (do_high != null) {
            return this.result_do_highlight(do_high);
          }
        }
      };

      Chosen.prototype.no_results = function (terms) {
        var no_results_html;
        no_results_html = $('<li class="no-results">' + this.results_none_found + ' "<span></span>"</li>');
        no_results_html.find("span").first().html(terms);
        return this.search_results.append(no_results_html);
      };

      Chosen.prototype.no_results_clear = function () {
        return this.search_results.find(".no-results").remove();
      };

      Chosen.prototype.keydown_arrow = function () {
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

      Chosen.prototype.keyup_arrow = function () {
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

      Chosen.prototype.keydown_backstroke = function () {
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

      Chosen.prototype.clear_backstroke = function () {
        if (this.pending_backstroke) {
          this.pending_backstroke.removeClass("search-choice-focus");
        }

        return this.pending_backstroke = null;
      };

      Chosen.prototype.keydown_checker = function (evt) {
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

      Chosen.prototype.search_field_scale = function () {
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

          div = $('<div></div>', {
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

      Chosen.prototype.generate_random_id = function () {
        var string;
        string = "sel" + this.generate_random_char() + this.generate_random_char() + this.generate_random_char();

        while ($("#" + string).length > 0) {
          string += this.generate_random_char();
        }

        return string;
      };

      return Chosen;
    }(AbstractChosen);

    root.Chosen = Chosen;
  }).call(this);
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./node_modules/@okta/courage/src/vendor/plugins/jquery.custominput.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/vendor/plugins/jquery.custominput.js ***!
  \*****************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/**
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
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! jquery */ "jquery")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (jQuery) {
  var $ = jQuery;

  jQuery.fn.customInput = function () {
    return $(this).each(function () {
      if ($(this).is('[type=checkbox],[type=radio]')) {
        var input = $(this); // get the associated label using the input's id

        var label = input.siblings('label[for="' + input.attr('id') + '"]:first');

        if (!label.length) {
          label = input.closest('label[for="' + input.attr('id') + '"]:first');
        } // wrap the input + label in a div


        input.add(label).wrapAll('<div class="custom-' + input.attr('type') + '"></div>'); // necessary for browsers that don't support the :hover pseudo class on labels

        label.hover(function () {
          $(this).addClass('hover');
        }, function () {
          $(this).removeClass('hover');
        }); //bind custom event, trigger it, bind click,focus,blur events

        input.bind('updateState', function () {
          input.is(':checked') ? label.addClass('checked') : label.removeClass('checked checkedHover checkedFocus');
        }).trigger('updateState').click(function () {
          $('input[name="' + $(this).attr('name') + '"]').trigger('updateState');
        }).focus(function () {
          label.addClass('focus');

          if (input.is(':checked')) {
            $(this).addClass('checkedFocus');
          }
        }).blur(function () {
          label.removeClass('focus checkedFocus');
        });
      }
    });
  };
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./node_modules/@okta/courage/src/vendor/plugins/jquery.placeholder.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/vendor/plugins/jquery.placeholder.js ***!
  \*****************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

/*! http://mths.be/placeholder v2.0.7 by @mathias */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! jquery */ "jquery")], __WEBPACK_AMD_DEFINE_RESULT__ = (function ($) {
  var isInputSupported = ('placeholder' in document.createElement('input')),
      isTextareaSupported = ('placeholder' in document.createElement('textarea')),
      prototype = $.fn,
      valHooks = $.valHooks,
      hooks,
      placeholder;

  if (isInputSupported && isTextareaSupported) {
    placeholder = prototype.placeholder = function () {
      return this;
    };

    placeholder.input = placeholder.textarea = true;
  } else {
    placeholder = prototype.placeholder = function () {
      var $this = this;
      $this.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]').not('.placeholder').bind({
        'focus.placeholder': clearPlaceholder,
        'blur.placeholder': setPlaceholder
      }).data('placeholder-enabled', true).trigger('blur.placeholder');
      return $this;
    };

    placeholder.input = isInputSupported;
    placeholder.textarea = isTextareaSupported;
    hooks = {
      'get': function get(element) {
        var $element = $(element);
        return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
      },
      'set': function set(element, value) {
        var $element = $(element);

        if (!$element.data('placeholder-enabled')) {
          return element.value = value;
        }

        if (value == '') {
          element.value = value; // Issue #56: Setting the placeholder causes problems if the element continues to have focus.

          if (element != document.activeElement) {
            // We can't use `triggerHandler` here because of dummy text/password inputs :(
            setPlaceholder.call(element);
          }
        } else if ($element.hasClass('placeholder')) {
          clearPlaceholder.call(element, true, value) || (element.value = value);
        } else {
          element.value = value;
        } // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363


        return $element;
      }
    };
    isInputSupported || (valHooks.input = hooks);
    isTextareaSupported || (valHooks.textarea = hooks);
    $(function () {
      // Look for forms
      $(document).delegate('form', 'submit.placeholder', function () {
        // Clear the placeholder values so they don't get submitted
        var $inputs = $('.placeholder', this).each(clearPlaceholder);
        setTimeout(function () {
          $inputs.each(setPlaceholder);
        }, 10);
      });
    }); // Clear placeholder values upon page reload

    $(window).bind('beforeunload.placeholder', function () {
      $('.placeholder').each(function () {
        this.value = '';
      });
    });
  }

  function args(elem) {
    // Return an object of element attributes
    var newAttrs = {},
        rinlinejQuery = /^jQuery\d+$/;
    $.each(elem.attributes, function (i, attr) {
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
        $input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id')); // If `clearPlaceholder` was called from `$.valHooks.input.set`

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
            $replacement = $input.clone().attr({
              'type': 'text'
            });
          } catch (e) {
            $replacement = $('<input>').attr($.extend(args(this), {
              'type': 'text'
            }));
          }

          $replacement.removeAttr('name').data({
            'placeholder-password': true,
            'placeholder-id': id
          }).bind('focus.placeholder', clearPlaceholder);
          $input.data({
            'placeholder-textinput': $replacement,
            'placeholder-id': id
          }).before($replacement);
        }

        $input = $input.removeAttr('id').hide().prev().attr('id', id).show(); // Note: `$input[0] != input` now!
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

/***/ "./node_modules/@okta/courage/src/views/Backbone.ListView.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/Backbone.ListView.js ***!
  \*******************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _ListView = _interopRequireDefault(__webpack_require__(/*! ../framework/ListView */ "./node_modules/@okta/courage/src/framework/ListView.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ./BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * See {@link src/framework/ListView} for more detail and examples from the base class.
 * @class module:Okta.ListView
 * @extends src/framework/ListView
 * @mixes module:Okta.View
 */
var _default = _BaseView.default.decorate(_ListView.default);

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/BaseView.js":
/*!**********************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/BaseView.js ***!
  \**********************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _backbone = _interopRequireDefault(__webpack_require__(/*! backbone */ "./node_modules/backbone/backbone.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _View = _interopRequireDefault(__webpack_require__(/*! ../framework/View */ "./node_modules/@okta/courage/src/framework/View.js"));

var _TemplateUtil = _interopRequireDefault(__webpack_require__(/*! ../util/TemplateUtil */ "./node_modules/@okta/courage/src/util/TemplateUtil.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var eventBus = _underscoreWrapper.default.clone(_backbone.default.Events); // add `broadcast` and `listen` functionality to all views
// We use one event emitter per all views
// This means we need to be very careful with event names


var proto = {
  constructor: function constructor() {
    _View.default.apply(this, arguments);

    this.module && this.$el.attr('data-view', this.module.id);
  },

  /**
   * @deprecated Use {@link #removeChildren}
   */
  empty: function empty() {
    return this.removeChildren();
  },
  compileTemplate: _TemplateUtil.default.tpl,

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
    this.broadcast('notification', _underscoreWrapper.default.defaults({
      message: message,
      level: level
    }, options));
    return this;
  },

  /**
   * Shows a confirmation dialog
   *
   * Uses https://www.ericmmartin.com/projects/simplemodal/.
   * If you want to configure the simplemodal options use ConfirmationDialog instead.
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
    var options;
    /* eslint max-statements: [2, 12] */

    if (_typeof(title) === 'object') {
      options = title;
    } else {
      if (arguments.length === 2 && _underscoreWrapper.default.isFunction(message)) {
        options = {
          title: 'Okta',
          // eslint-disable-line @okta/okta/no-unlocalized-text
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

    if (_underscoreWrapper.default.isFunction(options.ok)) {
      options.ok = _underscoreWrapper.default.bind(options.ok, this);
    }

    if (_underscoreWrapper.default.isFunction(options.cancelFn)) {
      options.cancelFn = _underscoreWrapper.default.bind(options.cancelFn, this);
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
    if (_underscoreWrapper.default.isString(params)) {
      params = {
        subtitle: params
      };
    }

    this.confirm(_underscoreWrapper.default.extend({}, params, {
      noCancelButton: true
    }));
    return this;
  }
};
/**
 * See {@link src/framework/View} for more detail and examples from the base class.
 * @class module:Okta.View
 * @extends src/framework/View
 */

/** @lends module:Okta.View.prototype */

var _default = _View.default.extend(proto,
/** @lends View.prototype */
{
  /** @method */
  decorate: function decorate(TargetView) {
    var BaseViewView = TargetView.extend({});

    _underscoreWrapper.default.defaults(BaseViewView.prototype, proto);

    return BaseViewView;
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/components/BaseButtonLink.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/components/BaseButtonLink.js ***!
  \***************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _ViewUtil = _interopRequireDefault(__webpack_require__(/*! ../../util/ViewUtil */ "./node_modules/@okta/courage/src/util/ViewUtil.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var disabledEvents = {
  click: function click(e) {
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

var _default = _BaseView.default.extend(
/** @lends module:Okta.internal.views.components.BaseButtonLink.prototype */
{
  attributes: function attributes() {
    var defaultAttrs = {
      'data-se': 'button'
    };

    var additionalAttr = this.__getAttribute('attrs');

    return _underscoreWrapper.default.extend(defaultAttrs, additionalAttr);
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
  template: _runtime.default.template({
    "1": function _(container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<span class=\"icon " + container.escapeExpression((helper = (helper = lookupProperty(helpers, "icon") || (depth0 != null ? lookupProperty(depth0, "icon") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "icon",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 30
          },
          "end": {
            "line": 1,
            "column": 38
          }
        }
      }) : helper)) + "\"></span>";
    },
    "3": function _(container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return container.escapeExpression((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "title",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 67
          },
          "end": {
            "line": 1,
            "column": 76
          }
        }
      }) : helper));
    },
    "compiler": [8, ">= 4.3.0"],
    "main": function main(container, depth0, helpers, partials, data) {
      var stack1,
          alias1 = depth0 != null ? depth0 : container.nullContext || {},
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "icon") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(1, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 54
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "title") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(3, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 54
          },
          "end": {
            "line": 1,
            "column": 83
          }
        }
      })) != null ? stack1 : "");
    },
    "useData": true
  }),

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

    _BaseView.default.apply(this, arguments);

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
    _ViewUtil.default.applyDoWhen(this, _underscoreWrapper.default.resultCtx(this, 'enableWhen', this), this.toggle);

    _ViewUtil.default.applyDoWhen(this, _underscoreWrapper.default.resultCtx(this, 'showWhen', this), this.toggleVisible);
  },
  render: function render() {
    _BaseView.default.prototype.render.apply(this, arguments);

    if (!_underscoreWrapper.default.result(this, 'enabled')) {
      this.toggle(false);
    }

    if (!_underscoreWrapper.default.result(this, 'visible')) {
      this.toggleVisible(false);
    }

    var data = this.getTemplateData();
    this.$el.attr('href', data.href || '#');
    return this;
  },
  __getAttribute: function __getAttribute(name, defaultValue) {
    var value = _underscoreWrapper.default.resultCtx(this.options, name, this);

    if (_underscoreWrapper.default.isUndefined(value)) {
      value = _underscoreWrapper.default.result(this, name);
    }

    return !_underscoreWrapper.default.isUndefined(value) ? value : defaultValue;
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
    var bool = !!enable && _underscoreWrapper.default.result(this, 'enabled'); //this is to toggle the enability


    this.disabled = !bool;
    this.$el.toggleClass('link-button-disabled btn-disabled disabled', this.disabled);
    this.delegateEvents(this.disabled ? disabledEvents : null);
  },
  toggleVisible: function toggleVisible(visible) {
    var hidden = !visible || !_underscoreWrapper.default.result(this, 'visible');
    this.$el.toggleClass('hide', hidden);
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/components/BaseDropDown.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/components/BaseDropDown.js ***!
  \*************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! ../../util/jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var optionsTemplate = _runtime.default.template({
  "1": function _(container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<span class=\"icon " + container.escapeExpression((helper = (helper = lookupProperty(helpers, "icon") || (depth0 != null ? lookupProperty(depth0, "icon") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "icon",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 96
        },
        "end": {
          "line": 1,
          "column": 104
        }
      }
    }) : helper)) + "\"></span>";
  },
  "3": function _(container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return container.escapeExpression((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "title",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 133
        },
        "end": {
          "line": 1,
          "column": 142
        }
      }
    }) : helper));
  },
  "5": function _(container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<p class=\"option-subtitle\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "subtitle") || (depth0 != null ? lookupProperty(depth0, "subtitle") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "subtitle",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 192
        },
        "end": {
          "line": 1,
          "column": 204
        }
      }
    }) : helper)) + "</p>";
  },
  "compiler": [8, ">= 4.3.0"],
  "main": function main(container, depth0, helpers, partials, data) {
    var stack1,
        helper,
        alias1 = depth0 != null ? depth0 : container.nullContext || {},
        alias2 = container.hooks.helperMissing,
        alias3 = "function",
        alias4 = container.escapeExpression,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<a href=\"\" class=\"icon-16 " + alias4((helper = (helper = lookupProperty(helpers, "className") || (depth0 != null ? lookupProperty(depth0, "className") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
      "name": "className",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 26
        },
        "end": {
          "line": 1,
          "column": 39
        }
      }
    }) : helper)) + "\" data-se=\"" + alias4((helper = (helper = lookupProperty(helpers, "seleniumId") || (depth0 != null ? lookupProperty(depth0, "seleniumId") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
      "name": "seleniumId",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 50
        },
        "end": {
          "line": 1,
          "column": 64
        }
      }
    }) : helper)) + "\">" + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "icon") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(1, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 66
        },
        "end": {
          "line": 1,
          "column": 120
        }
      }
    })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "title") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(3, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 120
        },
        "end": {
          "line": 1,
          "column": 149
        }
      }
    })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "subtitle") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(5, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 149
        },
        "end": {
          "line": 1,
          "column": 215
        }
      }
    })) != null ? stack1 : "") + "</a>";
  },
  "useData": true
});

var BaseDropDownDropDownOption = _BaseView.default.extend({
  tagName: 'li',
  events: {
    click: function click(e) {
      e.preventDefault();
      this.action && this.action.call(this);
    }
  },
  constructor: function constructor() {
    _BaseView.default.apply(this, arguments);

    this.$el.addClass('okta-dropdown-option option');
  },
  render: function render() {
    this.$el.html(optionsTemplate({
      icon: _underscoreWrapper.default.result(this, 'icon'),
      className: _underscoreWrapper.default.result(this, 'className') || '',
      title: _underscoreWrapper.default.result(this, 'title'),
      subtitle: _underscoreWrapper.default.result(this, 'subtitle'),
      seleniumId: _underscoreWrapper.default.result(this, 'seleniumId')
    }));

    if (_underscoreWrapper.default.result(this, 'disabled')) {
      this.disable();
    }

    return this;
  },
  disable: function disable() {
    this.$el.addClass('option-disabled');
    this.$el.find('a').attr('tabindex', '-1');
  }
});

var _default = _BaseView.default.extend({
  events: {
    'click a.option-selected': function clickAOptionSelected(e) {
      e.preventDefault();

      if (_underscoreWrapper.default.result(this, 'disabled')) {
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
    var className = this.className; // In this very specific case we want to NOT append className to $el
    // but to the <a> tag in the template
    // so we want to disable backbone default functionality.

    this.className = null;

    _BaseView.default.apply(this, arguments);

    this.className = className;
    this.$el.addClass('dropdown more-actions float-l');

    _underscoreWrapper.default.each(_underscoreWrapper.default.result(this, 'items'), function (option) {
      this.addOption(option, this.options);
    }, this);
  },
  template: _runtime.default.template({
    "1": function _(container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<span class=\"icon " + container.escapeExpression((helper = (helper = lookupProperty(helpers, "icon") || (depth0 != null ? lookupProperty(depth0, "icon") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "icon",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 176
          },
          "end": {
            "line": 1,
            "column": 184
          }
        }
      }) : helper)) + "\"></span>";
    },
    "3": function _(container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<span class=\"off-screen\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "screenReaderText") || (depth0 != null ? lookupProperty(depth0, "screenReaderText") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "screenReaderText",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 249
          },
          "end": {
            "line": 1,
            "column": 269
          }
        }
      }) : helper)) + "</span>";
    },
    "compiler": [8, ">= 4.3.0"],
    "main": function main(container, depth0, helpers, partials, data) {
      var stack1,
          helper,
          alias1 = depth0 != null ? depth0 : container.nullContext || {},
          alias2 = container.hooks.helperMissing,
          alias3 = "function",
          alias4 = container.escapeExpression,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<a href=\"#\" class=\"link-button " + alias4((helper = (helper = lookupProperty(helpers, "className") || (depth0 != null ? lookupProperty(depth0, "className") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "className",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 31
          },
          "end": {
            "line": 1,
            "column": 44
          }
        }
      }) : helper)) + " link-button-icon option-selected center\" aria-expanded=\"false\" aria-controls=\"okta-dropdown-options\">" + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "icon") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(1, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 146
          },
          "end": {
            "line": 1,
            "column": 200
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "screenReaderText") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(3, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 200
          },
          "end": {
            "line": 1,
            "column": 283
          }
        }
      })) != null ? stack1 : "") + "<span class=\"option-selected-text\">" + alias4((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "title",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 318
          },
          "end": {
            "line": 1,
            "column": 327
          }
        }
      }) : helper)) + "</span><span class=\"icon-dm\"></span></a><div id=\"okta-dropdown-options\" class=\"options clearfix\" style=\"display: none;\"><ul class=\"okta-dropdown-list options-wrap clearfix\"></ul></div>";
    },
    "useData": true
  }),
  getTemplateData: function getTemplateData() {
    var className = [_underscoreWrapper.default.result(this, 'className') || '', _underscoreWrapper.default.result(this, 'disabled') ? 'dropdown-disabled' : ''];
    return {
      icon: _underscoreWrapper.default.result(this, 'icon'),
      className: _jqueryWrapper.default.trim(className.join(' ')),
      title: _underscoreWrapper.default.result(this, 'title'),
      screenReaderText: _underscoreWrapper.default.result(this, 'screenReaderText')
    };
  },
  addOption: function addOption(proto, options) {
    this.add(BaseDropDownDropDownOption.extend(proto), 'ul.options-wrap', {
      options: options || {}
    });
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/components/Callout.js":
/*!********************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/components/Callout.js ***!
  \********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Time = _interopRequireDefault(__webpack_require__(/*! ../../util/Time */ "./node_modules/@okta/courage/src/util/Time.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getOption(callout, option) {
  return _underscoreWrapper.default.resultCtx(callout.options, option, callout) || _underscoreWrapper.default.result(callout, option);
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
    var _this = this;

    e.preventDefault();
    this.$el.fadeOut(_Time.default.UNLOADING_FADE, function () {
      _this.trigger('dismissed');

      _this.remove();
    });
  }
};

var template = _runtime.default.template({
  "1": function _(container, depth0, helpers, partials, data) {
    var lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<a data-se=\"dismiss-link\" class=\"infobox-dismiss-link\" title=\"" + container.escapeExpression((lookupProperty(helpers, "i18n") || depth0 && lookupProperty(depth0, "i18n") || container.hooks.helperMissing).call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "i18n",
      "hash": {
        "bundle": "courage",
        "code": "component.dismiss"
      },
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 81
        },
        "end": {
          "line": 1,
          "column": 131
        }
      }
    })) + "\" href=\"#\"><span data-se=\"icon\" class=\"dismiss-icon\"></span></a>";
  },
  "3": function _(container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<h3 data-se=\"header\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "title",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 286
        },
        "end": {
          "line": 1,
          "column": 295
        }
      }
    }) : helper)) + "</h3>";
  },
  "5": function _(container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<p data-se=\"sub-header\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "subtitle") || (depth0 != null ? lookupProperty(depth0, "subtitle") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "subtitle",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 347
        },
        "end": {
          "line": 1,
          "column": 359
        }
      }
    }) : helper)) + "</p>";
  },
  "7": function _(container, depth0, helpers, partials, data) {
    var stack1,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<ul data-se=\"list\" class=\"bullets\">" + ((stack1 = lookupProperty(helpers, "each").call(depth0 != null ? depth0 : container.nullContext || {}, depth0 != null ? lookupProperty(depth0, "bullets") : depth0, {
      "name": "each",
      "hash": {},
      "fn": container.program(8, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 420
        },
        "end": {
          "line": 1,
          "column": 483
        }
      }
    })) != null ? stack1 : "") + "</ul>";
  },
  "8": function _(container, depth0, helpers, partials, data) {
    return "<li data-se=\"list-item\">" + container.escapeExpression(container.lambda(depth0, depth0)) + "</li>";
  },
  "compiler": [8, ">= 4.3.0"],
  "main": function main(container, depth0, helpers, partials, data) {
    var stack1,
        helper,
        alias1 = depth0 != null ? depth0 : container.nullContext || {},
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "dismissible") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(1, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 0
        },
        "end": {
          "line": 1,
          "column": 202
        }
      }
    })) != null ? stack1 : "") + "<span data-se=\"icon\" class=\"icon " + container.escapeExpression((helper = (helper = lookupProperty(helpers, "icon") || (depth0 != null ? lookupProperty(depth0, "icon") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(alias1, {
      "name": "icon",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 235
        },
        "end": {
          "line": 1,
          "column": 243
        }
      }
    }) : helper)) + "\"></span>" + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "title") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(3, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 252
        },
        "end": {
          "line": 1,
          "column": 307
        }
      }
    })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "subtitle") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(5, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 307
        },
        "end": {
          "line": 1,
          "column": 370
        }
      }
    })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "bullets") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(7, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 370
        },
        "end": {
          "line": 1,
          "column": 495
        }
      }
    })) != null ? stack1 : "");
  },
  "useData": true
});

var CalloutCallout = _BaseView.default.extend(
/** @lends src/views/components/Callout.prototype */
{
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
    this.events = _underscoreWrapper.default.defaults(this.events || {}, events);

    _BaseView.default.apply(this, arguments);

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
 * @class src/views/components/Callout
 * @extends module:Okta.View
 */

/**
 * @class module:Okta.internal.views.components.Callout
 */


var _default =
/** @lends module:Okta.internal.views.components.Callout */
{
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
    return new CalloutCallout(options);
  }
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/components/Notification.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/components/Notification.js ***!
  \*************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var defaults = {
  level: 'success',
  message: 'Great Success!',
  hide: true,
  fade: 400,
  delay: 3000,
  width: 0,
  dismissable: false
};

var _default = _BaseView.default.extend({
  className: 'infobox infobox-confirm infobox-confirm-fixed',
  events: {
    'click .infobox-dismiss-link': function clickInfoboxDismissLink(e) {
      e.preventDefault();
      this.fadeOut();
    }
  },
  template: _runtime.default.template({
    "1": function _(container, depth0, helpers, partials, data) {
      var lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<a class=\"infobox-dismiss-link\" title=\"" + container.escapeExpression((lookupProperty(helpers, "i18n") || depth0 && lookupProperty(depth0, "i18n") || container.hooks.helperMissing).call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "i18n",
        "hash": {
          "bundle": "courage",
          "code": "component.dismiss"
        },
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 58
          },
          "end": {
            "line": 1,
            "column": 108
          }
        }
      })) + "\" href=\"#\"><span class=\"dismiss-icon\"></span></a>";
    },
    "3": function _(container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<h3>" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "title",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 220
          },
          "end": {
            "line": 1,
            "column": 229
          }
        }
      }) : helper)) + "</h3>";
    },
    "compiler": [8, ">= 4.3.0"],
    "main": function main(container, depth0, helpers, partials, data) {
      var stack1,
          helper,
          alias1 = depth0 != null ? depth0 : container.nullContext || {},
          alias2 = container.hooks.helperMissing,
          alias3 = "function",
          alias4 = container.escapeExpression,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "dismissable") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(1, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 164
          }
        }
      })) != null ? stack1 : "") + "<span class=\"icon " + alias4((helper = (helper = lookupProperty(helpers, "level") || (depth0 != null ? lookupProperty(depth0, "level") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "level",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 182
          },
          "end": {
            "line": 1,
            "column": 191
          }
        }
      }) : helper)) + "-16\"></span>" + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "title") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(3, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 203
          },
          "end": {
            "line": 1,
            "column": 241
          }
        }
      })) != null ? stack1 : "") + "<p>" + alias4((helper = (helper = lookupProperty(helpers, "message") || (depth0 != null ? lookupProperty(depth0, "message") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "message",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 244
          },
          "end": {
            "line": 1,
            "column": 255
          }
        }
      }) : helper)) + "</p>";
    },
    "useData": true
  }),
  initialize: function initialize() {
    this.options = _underscoreWrapper.default.defaults({}, this.options, defaults);
    this.$el.addClass('infobox-' + this.options.level);

    if (this.options.width) {
      this.$el.width(this.options.width);
    }
  },
  getTemplateData: function getTemplateData() {
    return _underscoreWrapper.default.extend(_underscoreWrapper.default.pick(this.options, 'level', 'message', 'title'), {
      dismissable: this.options.hide === false || this.options.dismissable === true
    });
  },
  postRender: function postRender() {
    if (this.options.hide) {
      _underscoreWrapper.default.delay(_underscoreWrapper.default.bind(this.fadeOut, this), this.options.delay);
    }
  },
  fadeOut: function fadeOut() {
    this.$el.fadeOut(this.options.fade, _underscoreWrapper.default.bind(this.remove, this));
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/BaseForm.js":
/*!****************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/BaseForm.js ***!
  \****************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! ../../util/jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _StringUtil = _interopRequireDefault(__webpack_require__(/*! ../../util/StringUtil */ "./node_modules/@okta/courage/src/util/StringUtil.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

var _ReadModeBar = _interopRequireDefault(__webpack_require__(/*! ./components/ReadModeBar */ "./node_modules/@okta/courage/src/views/forms/components/ReadModeBar.js"));

var _Toolbar = _interopRequireDefault(__webpack_require__(/*! ./components/Toolbar */ "./node_modules/@okta/courage/src/views/forms/components/Toolbar.js"));

var _ErrorBanner = _interopRequireDefault(__webpack_require__(/*! ./helpers/ErrorBanner */ "./node_modules/@okta/courage/src/views/forms/helpers/ErrorBanner.js"));

var _ErrorParser = _interopRequireDefault(__webpack_require__(/*! ./helpers/ErrorParser */ "./node_modules/@okta/courage/src/views/forms/helpers/ErrorParser.js"));

var _FormUtil = _interopRequireDefault(__webpack_require__(/*! ./helpers/FormUtil */ "./node_modules/@okta/courage/src/views/forms/helpers/FormUtil.js"));

var _InputContainer = _interopRequireDefault(__webpack_require__(/*! ./helpers/InputContainer */ "./node_modules/@okta/courage/src/views/forms/helpers/InputContainer.js"));

var _InputFactory = _interopRequireDefault(__webpack_require__(/*! ./helpers/InputFactory */ "./node_modules/@okta/courage/src/views/forms/helpers/InputFactory.js"));

var _InputLabel = _interopRequireDefault(__webpack_require__(/*! ./helpers/InputLabel */ "./node_modules/@okta/courage/src/views/forms/helpers/InputLabel.js"));

var _InputWrapper = _interopRequireDefault(__webpack_require__(/*! ./helpers/InputWrapper */ "./node_modules/@okta/courage/src/views/forms/helpers/InputWrapper.js"));

var _SettingsModel = _interopRequireDefault(__webpack_require__(/*! ../../util/SettingsModel */ "./node_modules/@okta/courage/src/util/SettingsModel.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-statements: [2, 11] */
var template = _runtime.default.template({
  "1": function _(container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<h2 class=\"o-form-title-bar\" data-se=\"o-form-title-bar\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "title",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 75
        },
        "end": {
          "line": 1,
          "column": 84
        }
      }
    }) : helper)) + "</h2>";
  },
  "3": function _(container, depth0, helpers, partials, data) {
    var stack1,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return (stack1 = lookupProperty(helpers, "if").call(depth0 != null ? depth0 : container.nullContext || {}, depth0 != null ? lookupProperty(depth0, "title") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(4, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 192
        },
        "end": {
          "line": 1,
          "column": 288
        }
      }
    })) != null ? stack1 : "";
  },
  "4": function _(container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<h2 data-se=\"o-form-head\" class=\"okta-form-title o-form-head\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "title",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 267
        },
        "end": {
          "line": 1,
          "column": 276
        }
      }
    }) : helper)) + "</h2>";
  },
  "6": function _(container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<p class=\"okta-form-subtitle o-form-explain\" data-se=\"o-form-explain\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "subtitle") || (depth0 != null ? lookupProperty(depth0, "subtitle") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "subtitle",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 385
        },
        "end": {
          "line": 1,
          "column": 397
        }
      }
    }) : helper)) + "</p>";
  },
  "compiler": [8, ">= 4.3.0"],
  "main": function main(container, depth0, helpers, partials, data) {
    var stack1,
        helper,
        alias1 = depth0 != null ? depth0 : container.nullContext || {},
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "hasReadMode") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(1, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 0
        },
        "end": {
          "line": 1,
          "column": 96
        }
      }
    })) != null ? stack1 : "") + "<div data-se=\"o-form-content\" class=\"o-form-content " + container.escapeExpression((helper = (helper = lookupProperty(helpers, "layout") || (depth0 != null ? lookupProperty(depth0, "layout") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(alias1, {
      "name": "layout",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 148
        },
        "end": {
          "line": 1,
          "column": 158
        }
      }
    }) : helper)) + " clearfix\">" + ((stack1 = lookupProperty(helpers, "unless").call(alias1, depth0 != null ? lookupProperty(depth0, "hasReadMode") : depth0, {
      "name": "unless",
      "hash": {},
      "fn": container.program(3, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 169
        },
        "end": {
          "line": 1,
          "column": 299
        }
      }
    })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "subtitle") : depth0, {
      "name": "if",
      "hash": {},
      "fn": container.program(6, data, 0),
      "inverse": container.noop,
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 299
        },
        "end": {
          "line": 1,
          "column": 408
        }
      }
    })) != null ? stack1 : "") + "<div class=\"o-form-error-container\" data-se=\"o-form-error-container\"></div><div class=\"o-form-fieldset-container\" data-se=\"o-form-fieldset-container\"></div></div>";
  },
  "useData": true
});

var sectionTitleTemplate = _runtime.default.template({
  "compiler": [8, ">= 4.3.0"],
  "main": function main(container, depth0, helpers, partials, data) {
    var helper,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<h2 class=\"o-form-head\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "title") || (depth0 != null ? lookupProperty(depth0, "title") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
      "name": "title",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 24
        },
        "end": {
          "line": 1,
          "column": 33
        }
      }
    }) : helper)) + "</h2>";
  },
  "useData": true
});

var pointerEventsSupported = (0, _jqueryWrapper.default)('<div>').css({
  'pointer-events': 'auto'
})[0].style.pointerEvents === 'auto'; // polyfill for `pointer-events: none;` in IE < 11
// Logic borrowed from https://github.com/kmewhort/pointer_events_polyfill (BSD)

function pointerEventsPolyfill(e) {
  if (!pointerEventsSupported && this.$el.hasClass('o-form-saving')) {
    var $el = (0, _jqueryWrapper.default)(e.currentTarget);
    $el.css('display', 'none');
    var underneathElem = document.elementFromPoint(e.clientX, e.clientY);
    $el.css('display', 'block');
    e.target = underneathElem;
    (0, _jqueryWrapper.default)(underneathElem).trigger(e);
    return false;
  }
}

var events = {
  submit: function submit(e) {
    e.preventDefault();

    this.__save();
  }
};

_underscoreWrapper.default.each(['click', 'dblclick', 'mousedown', 'mouseup'], function (event) {
  events[event + ' .o-form-input'] = pointerEventsPolyfill;
});

var attributes = function attributes(model) {
  model || (model = {});
  var collection = model && model.collection || {};
  return {
    method: 'POST',
    action: _underscoreWrapper.default.result(model, 'urlRoot') || _underscoreWrapper.default.result(collection, 'url') || window.location.pathname,
    'data-se': 'o-form',
    slot: 'content'
  };
};

var convertSavingState = function convertSavingState(rawSavingStateEvent, defaultEvent) {
  rawSavingStateEvent || (rawSavingStateEvent = '');
  var savingStateEvent = [];

  if (_underscoreWrapper.default.isString(rawSavingStateEvent)) {
    savingStateEvent = rawSavingStateEvent.split(' ');
  }

  savingStateEvent = _underscoreWrapper.default.union(savingStateEvent, defaultEvent);
  return savingStateEvent.join(' ');
};

var getErrorSummary = function getErrorSummary() {
  var responseJSON = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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


var _default = _BaseView.default.extend(
/** @lends module:Okta.Form.prototype */
{
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

    if (options.settings) {
      this.settings = options.settings;
    } else {
      this.settings = options.settings = new _SettingsModel.default();
    }

    this.id = _underscoreWrapper.default.uniqueId('form');
    this.tagName = 'form';

    _underscoreWrapper.default.defaults(this.events, events);

    _underscoreWrapper.default.defaults(this.attributes, attributes(options.model));

    this.__buttons = [];
    this.__errorFields = {};

    this.__saveModelState(options.model);

    var step = _underscoreWrapper.default.result(this, 'step');

    if (step) {
      // checking exists of `this.save` hence don't have to change to
      // `_.result(this, 'save')` which will execute the function and
      // is not the intent.
      if (!this.save) {
        var totalStep = _underscoreWrapper.default.result(this, 'totalSteps');

        this.save = !totalStep || step === totalStep ? 'Finish' : 'Next';
      }

      this.className = _underscoreWrapper.default.result(this, 'className') + ' wizard';
    }

    this.className = _underscoreWrapper.default.result(this, 'className') + ' o-form';
    this.__toolbar = this.__createToolbar(options);

    _BaseView.default.call(this, options);

    _underscoreWrapper.default.each(_underscoreWrapper.default.result(this, 'inputs') || [], function (input) {
      // to ingore extra argumests from `each` iteratee function
      // http://underscorejs.org/#each
      this.__addLayoutItem(input);
    }, this);

    this.add(this.__toolbar, ''); // NOTES: this.model shall be initialized after calling
    // super (BaseView.call(this, options)) above.
    //

    this.listenTo(this.model, 'change:__edit__', this.__applyMode);
    this.listenTo(this.model, 'invalid error', _underscoreWrapper.default.throttle(function (model, resp, showBanner) {
      this.__showErrors(model, resp, showBanner !== false);
    }, 100, {
      trailing: false
    }));
    this.listenTo(this.model, 'form:resize', function () {
      this.trigger('resize');
    });
    this.listenTo(this.model, 'form:cancel', _underscoreWrapper.default.throttle(this.__cancel, 100, {
      trailing: false
    }));
    this.listenTo(this.model, 'form:previous', _underscoreWrapper.default.throttle(this.__previous, 100, {
      trailing: false
    }));
    this.__save = _underscoreWrapper.default.throttle(this.__save, 200, {
      trailing: false
    });
    this.listenTo(this.model, 'form:save', function () {
      this.$el.submit();
    });
    this.listenTo(this.model, 'sync', function () {
      if (this.model.get('__edit__')) {
        this.model.set('__edit__', false, {
          silent: true
        });
      }

      this.__saveModelState(this.model);

      this.render();
    });
    var hasSavingState = this.getAttribute('hasSavingState');

    if (this.getAttribute('autoSave')) {
      this.listenTo(this, 'save', function (model) {
        var _this = this;

        var xhr = model.save();

        if (xhr && xhr.done) {
          xhr.done(function () {
            _this.trigger('saved', model);
          });
        }
      });

      if (_underscoreWrapper.default.isUndefined(hasSavingState)) {
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

    var step = _underscoreWrapper.default.result(this, 'step');

    var toolbar = new _Toolbar.default(_underscoreWrapper.default.extend({
      save: this.save || _StringUtil.default.localize('oform.save', 'courage'),
      saveId: this.saveId,
      saveClassName: saveBtnClassName,
      cancel: this.cancel || _StringUtil.default.localize('oform.cancel', 'courage'),
      noCancelButton: this.noCancelButton || false,
      noSubmitButton: this.noSubmitButton || false,
      buttonOrder: this.buttonOrder,
      hasPrevStep: step && step > 1
    }, options || this.options));

    _underscoreWrapper.default.each(this.__buttons, function (args) {
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
   * Should we not render a save button
   * @type {Boolean}
   * @default false
   */
  noSubmitButton: false,

  /**
   * Set the order of the save, cancel and previous buttons (left to right).
   * @type {Array.<string>}
   * @default ['previous', 'save', 'cancel']
   */
  buttonOrder: ['previous', 'save', 'cancel'],

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
    var value = _underscoreWrapper.default.resultCtx(this.options, name, this);

    if (_underscoreWrapper.default.isUndefined(value)) {
      value = _underscoreWrapper.default.result(this, name);
    }

    return !_underscoreWrapper.default.isUndefined(value) ? value : defaultValue;
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
      var readModeBar = _ReadModeBar.default.extend({
        formTitle: this.getAttribute('title', '')
      });

      this.__readModeBar = this.add(readModeBar, '.o-form-title-bar').last();
    }

    var html = template({
      layout: this.getAttribute('layout', ''),
      title: this.getAttribute('title', '', true),
      subtitle: this.getAttribute('subtitle', '', true),
      hasReadMode: this.hasReadMode()
    });
    this.$el.html(html);
    delete this.template;

    _BaseView.default.prototype.render.apply(this, arguments);

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
    var edit = this.model.get('__edit__');
    /* eslint max-statements: [2, 12] */

    this.model.clear({
      silent: true
    });
    var data;

    if (this.model.sanitizeAttributes) {
      data = this.model.sanitizeAttributes(this.__originalModel);
    } else {
      data = _underscoreWrapper.default.clone(this.__originalModel);
    }

    this.model.set(data, {
      silent: true
    });
    this.trigger('cancel', this.model);
    this.model.trigger('cache:clear');

    if (edit) {
      this.model.set('__edit__', false, {
        silent: true
      });
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
      return _underscoreWrapper.default.reduce(arr, function (memo, fieldName) {
        return _underscoreWrapper.default.extend(memo, self.model.validateField(fieldName));
      }, {});
    }

    if (_underscoreWrapper.default.isUndefined(this.validate)) {
      return this.model.isValid();
    } else if (_underscoreWrapper.default.isFunction(this.validate)) {
      res = this.validate();
    } else if (_underscoreWrapper.default.isArray(this.validate)) {
      res = validateArray(this.validate);
    } else if (this.validate === 'local') {
      res = validateArray(this.getInputs().map(function (input) {
        return input.options.name;
      }));
    }

    if (!_underscoreWrapper.default.isEmpty(res)) {
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
  parseErrorMessage: _underscoreWrapper.default.identity,
  _handleErrorScroll: function _handleErrorScroll() {
    if (!this.getAttribute('scrollOnError')) {
      return;
    }

    var $el = (0, _jqueryWrapper.default)('#' + this.id + ' .o-form-error-container');

    if ($el.length) {
      var $scrollContext = $el.scrollParent();
      var scrollTop; // scrollParent was almost awesome...
      // but it returns document if there are no other scrollable parents
      // document does not have offset, so here we have to replace with html, body
      // Additionally when the scroll context is html, body, $el.offset().top is fixed
      // versus when it has a different scroll context it's dynamic and requires the
      // calculation below.

      if ($scrollContext[0] === document) {
        $scrollContext = (0, _jqueryWrapper.default)('html, body');
        scrollTop = $el.offset().top;
      } else {
        scrollTop = $scrollContext.scrollTop() + $el.offset().top - $scrollContext.offset().top;
      }

      $scrollContext.animate({
        scrollTop: scrollTop
      }, 400);
    }
  },

  /**
   * Show an error message based on an XHR error
   * @param  {Okta.BaseModel} model the model
   * @param  {jqXHR} xhr The jQuery XmlHttpRequest Object
   * @private
   */
  __showErrors: function __showErrors(model, resp, showBanner) {
    this.trigger('error', model);
    /* eslint max-statements: 0 */

    if (!this.getAttribute('showErrors')) {
      return;
    }

    var errorSummary;

    var responseJSON = _ErrorParser.default.getResponseJSON(resp);

    var validationErrors = _ErrorParser.default.parseFieldErrors(resp); // trigger events for field validation errors


    if (_underscoreWrapper.default.size(validationErrors)) {
      _underscoreWrapper.default.each(validationErrors, function (errors, field) {
        this.model.trigger('form:field-error', this.__errorFields[field] || field, _underscoreWrapper.default.map(errors, function (error) {
          return /^model\.validation/.test(error) ? _StringUtil.default.localize(error, 'courage') : error;
        }));
      }, this);
    } else {
      responseJSON = this.parseErrorMessage(responseJSON);
      errorSummary = getErrorSummary(responseJSON);
    } // show the error message


    if (showBanner) {
      this.$('.o-form-error-container').addClass('o-form-has-errors');
      this.add(_ErrorBanner.default, '.o-form-error-container', {
        options: {
          errorSummary: errorSummary
        }
      });
    } // slide to and focus on the error message


    this._handleErrorScroll();

    this.model.trigger('form:resize');
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
    if (_InputFactory.default.supports(input)) {
      this.addInput(input);
    } else {
      this.__addNonInputLayoutItem(input);
    }
  },
  __addNonInputLayoutItem: function __addNonInputLayoutItem(item) {
    var itemOptions = _underscoreWrapper.default.omit(item, 'type');

    switch (item.type) {
      case 'sectionTitle':
        this.addSectionTitle(item.title, _underscoreWrapper.default.omit(itemOptions, 'title'));
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

    _FormUtil.default.applyShowWhen(this.last(), options && options.showWhen);

    _FormUtil.default.applyToggleWhen(this.last(), options && options.toggleWhen);

    return this;
  },

  /**
   * Adds section header
   * @param {String} title
   */
  addSectionTitle: function addSectionTitle(title, options) {
    this.add(sectionTitleTemplate({
      title: title
    }));

    _FormUtil.default.applyShowWhen(this.last(), options && options.showWhen);

    _FormUtil.default.applyToggleWhen(this.last(), options && options.toggleWhen);

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
   * @param {Boolean} [options.group=false] Grouping set of inputs using fieldset and legend. Mainly for radio
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
    _options = _underscoreWrapper.default.clone(_options);

    _FormUtil.default.validateInput(_options, this.model);

    var inputsOptions = _FormUtil.default.generateInputOptions(_options, this, this.__createInput).reverse(); // We need a local variable here to keep track
    // as addInput can be called either directy or through the inputs array.


    if (_underscoreWrapper.default.isEmpty(this.getInputs().toArray())) {
      _underscoreWrapper.default.extend(inputsOptions[0], {
        validateOnlyIfDirty: true
      });
    }

    var inputs = _underscoreWrapper.default.map(inputsOptions, this.__createInput, this);

    _underscoreWrapper.default.each(inputsOptions, function (input) {
      if (input.errorField) {
        this.__errorFields[input.errorField] = input.name;
      }
    }, this);

    var options = {
      inputId: _underscoreWrapper.default.last(inputs).options.inputId,
      input: inputs,
      multi: inputsOptions.length > 1 ? inputsOptions.length : undefined
    };

    _underscoreWrapper.default.extend(options, _underscoreWrapper.default.omit(this.options, 'input'), _underscoreWrapper.default.omit(_options, 'input'));

    var inputWrapper = this.__createWrapper(options);

    if (options.label !== false) {
      inputWrapper.add(this.__createLabel(options));
    }

    inputWrapper.add(this._createContainer(options));
    inputWrapper.type = options.type || options.input.type || 'custom';
    var args = [inputWrapper].concat(_underscoreWrapper.default.rest(arguments));
    return this.add.apply(this, args);
  },

  /**
   * @private
   */
  __createInput: function __createInput(options) {
    options = _underscoreWrapper.default.pick(options, _FormUtil.default.INPUT_OPTIONS);
    return _InputFactory.default.create(options);
  },

  /**
   * @private
   */
  __createWrapper: function __createWrapper(options) {
    options = _underscoreWrapper.default.pick(options, _FormUtil.default.WRAPPER_OPTIONS);
    return new _InputWrapper.default(options);
  },

  /**
   * @private
   */
  __createLabel: function __createLabel(options) {
    options = _underscoreWrapper.default.pick(options, _FormUtil.default.LABEL_OPTIONS);
    return new _InputLabel.default(options);
  },

  /**
   * @private
   */
  _createContainer: function _createContainer(options) {
    options = _underscoreWrapper.default.pick(options, _FormUtil.default.CONTAINER_OPTIONS);
    return new _InputContainer.default(options);
  },

  /**
   * Stores the current attributes of the model to a private property
   * @param  {Okta.BaseModel} model The model
   * @private
   */
  __saveModelState: function __saveModelState(model) {
    this.__originalModel = _jqueryWrapper.default.extend(true, {}, model.attributes);
  },

  /**
   * @override
   * @ignore
   */
  add: function add() {
    var args = _underscoreWrapper.default.toArray(arguments);

    typeof args[1] === 'undefined' && (args[1] = '> div.o-form-content > .o-form-fieldset-container');
    return _BaseView.default.prototype.add.apply(this, args);
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

    if (_underscoreWrapper.default.isNumber(height)) {
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
    return (0, _underscoreWrapper.default)(this.filter(function (view) {
      return view instanceof _InputWrapper.default;
    }));
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/BaseInput.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/BaseInput.js ***!
  \*****************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! ../../util/jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _ButtonFactory = _interopRequireDefault(__webpack_require__(/*! ../../util/ButtonFactory */ "./node_modules/@okta/courage/src/util/ButtonFactory.js"));

var _StringUtil = _interopRequireDefault(__webpack_require__(/*! ../../util/StringUtil */ "./node_modules/@okta/courage/src/util/StringUtil.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

var _Callout = _interopRequireDefault(__webpack_require__(/*! ../components/Callout */ "./node_modules/@okta/courage/src/views/components/Callout.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class BaseInput
 * @private
 * An abstract object that defines an input for {@link Okta.Form}
 *
 * BaseInputs are typically not created directly, but being passed to {@link Okta.Form#addInput}
 * @extends Okta.View
 */
var _default = _BaseView.default.extend({
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
    options = _underscoreWrapper.default.defaults(options || {}, {
      inputId: options.id || _underscoreWrapper.default.uniqueId('input'),
      placeholder: this.defaultPlaceholder,
      inlineValidation: true,
      validateOnlyIfDirty: false
    });
    delete options.id; // decorate the `enable` and `disable` and toggle the `o-form-disabled` class.
    // so we wont need to worry about this when overriding the methods

    var self = this;

    _underscoreWrapper.default.each({
      enable: 'removeClass',
      disable: 'addClass'
    }, function (method, action) {
      self[action] = _underscoreWrapper.default.wrap(self[action], function (fn) {
        fn.apply(self, arguments);
        self.$el[method]('o-form-disabled');
      });
    });

    _BaseView.default.call(this, options);

    if (_underscoreWrapper.default.result(options, 'readOnly') !== true && _underscoreWrapper.default.result(options, 'read') === true) {
      this.listenTo(this.model, 'change:__edit__', this.render);
    }

    if (_underscoreWrapper.default.isFunction(this.focus)) {
      this.focus = _underscoreWrapper.default.debounce(_underscoreWrapper.default.bind(this.focus, this), 50);
    } // Enable inline validation if this is not the first field in the form.


    if (!_underscoreWrapper.default.result(options, 'validateOnlyIfDirty')) {
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
    if (_underscoreWrapper.default.result(this.options, 'inlineValidation')) {
      this.$el.on('focusout', ':input', _underscoreWrapper.default.bind(this.validate, this));
    }
  },
  toModelValue: function toModelValue() {
    var value = this.val();

    if (_underscoreWrapper.default.isFunction(this.to)) {
      value = this.to.call(this, value);
    }

    if (_underscoreWrapper.default.isFunction(this.options.to)) {
      value = this.options.to.call(this, value);
    }

    return value;
  },
  __getDependencyCalloutBtn: function __getDependencyCalloutBtn(btnConfig) {
    var self = this;

    var btnOptions = _underscoreWrapper.default.clone(btnConfig);

    var originalClick = btnOptions.click || function () {}; // add onfocus listener to re-evaluate depedency when callout button is clicked


    btnOptions.click = function () {
      (0, _jqueryWrapper.default)(window).one('focus.dependency', function () {
        self.__showInputDependencies();
      });
      originalClick.call(self);
    };

    var BaseInputCalloutBtn = _BaseView.default.extend({
      children: [_ButtonFactory.default.create(btnOptions)]
    });

    return new BaseInputCalloutBtn();
  },
  getCalloutParent: function getCalloutParent() {
    return this.$('input[value="' + this.getModelValue() + '"]').parent();
  },
  __getCalloutMsgContainer: function __getCalloutMsgContainer(calloutMsg) {
    return _BaseView.default.extend({
      template: _runtime.default.template({
        "compiler": [8, ">= 4.3.0"],
        "main": function main(container, depth0, helpers, partials, data) {
          var helper,
              lookupProperty = container.lookupProperty || function (parent, propertyName) {
            if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
              return parent[propertyName];
            }

            return undefined;
          };

          return "<span class=\"o-form-explain\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "msg") || (depth0 != null ? lookupProperty(depth0, "msg") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
            "name": "msg",
            "hash": {},
            "data": data,
            "loc": {
              "start": {
                "line": 1,
                "column": 29
              },
              "end": {
                "line": 1,
                "column": 36
              }
            }
          }) : helper)) + "</span>";
        },
        "useData": true
      }),
      getTemplateData: function getTemplateData() {
        return {
          msg: calloutMsg
        };
      }
    });
  },
  showCallout: function showCallout(calloutConfig, dependencyResolved) {
    var callout = _underscoreWrapper.default.clone(calloutConfig);

    callout.className = 'dependency-callout';

    if (callout.btn) {
      callout.content = this.__getDependencyCalloutBtn(callout.btn);
      delete callout.btn;
    }

    var dependencyCallout = _Callout.default.create(callout);

    if (!dependencyResolved) {
      dependencyCallout.add(this.__getCalloutMsgContainer(_StringUtil.default.localize('dependency.callout.msg', 'courage')));
    }

    var calloutParent = this.getCalloutParent();
    calloutParent.append(dependencyCallout.render().el);

    if (callout.type === 'success') {
      _underscoreWrapper.default.delay(function () {
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
        title: _StringUtil.default.localize('dependency.action.completed', 'courage'),
        size: 'large',
        type: 'success'
      };
    } else {
      defaultCallout = {
        title: _StringUtil.default.localize('dependency.action.required', 'courage', [calloutTitle]),
        size: 'large',
        type: 'warning'
      };
    }

    return defaultCallout;
  },
  __handleDependency: function __handleDependency(result, callout) {
    var self = this;
    var calloutConfig = _underscoreWrapper.default.isFunction(callout) ? callout(result) : _underscoreWrapper.default.extend({}, callout, self.__evaluateCalloutObject(result.resolved, callout.title)); // remove existing callouts if any

    self.removeCallout();
    self.showCallout(calloutConfig, result.resolved);
  },
  __showInputDependencies: function __showInputDependencies() {
    var self = this;
    var fieldDependency = self.options.deps[self.getModelValue()];

    if (fieldDependency && _underscoreWrapper.default.isFunction(fieldDependency.func)) {
      fieldDependency.func().done(function (data) {
        self.__handleDependency({
          resolved: true,
          data: data
        }, fieldDependency.callout);
      }).fail(function (data) {
        self.__handleDependency({
          resolved: false,
          data: data
        }, fieldDependency.callout);
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
    if (!this._isEdited && _underscoreWrapper.default.result(this.options, 'validateOnlyIfDirty')) {
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
    var ret = !_underscoreWrapper.default.result(this.options, 'readOnly') && (_underscoreWrapper.default.result(this.options, 'read') !== true || this.model.get('__edit__') === true);
    return ret;
  },

  /**
   * Renders the input
   * @readonly
   */
  render: function render() {
    this.preRender();
    var params = this.options.params;
    this.options.params = _underscoreWrapper.default.resultCtx(this.options, 'params', this);

    if (this.isEditMode()) {
      this.editMode();

      if (_underscoreWrapper.default.resultCtx(this.options, 'disabled', this)) {
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
    if (!this.model.get('__pending__') && this.isEditMode() && _underscoreWrapper.default.isFunction(this.model.validateField)) {
      var validationError = this.model.validateField(this.options.name);

      if (validationError) {
        _underscoreWrapper.default.delay(function () {
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
    var options = _underscoreWrapper.default.extend({}, this.options, {
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
    var readModeStr = _underscoreWrapper.default.resultCtx(this.options, 'readModeString', this);

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

    if (_underscoreWrapper.default.isFunction(this.from)) {
      value = this.from.call(this, value);
    }

    if (_underscoreWrapper.default.isFunction(this.options.from)) {
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

    if (Number.isInteger(value) || typeof value === 'boolean') {
      value = String(value);
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
    this.$(':input').prop('type', type); // Update the options so that it keeps the uptodate state

    this.options.type = type;
  },
  getNameString: function getNameString() {
    if (_underscoreWrapper.default.isArray(this.options.name)) {
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
    return _underscoreWrapper.default.clone(_underscoreWrapper.default.resultCtx(opts, 'params', this) || {});
  },

  /**
   * get a parameter from options.params, compute _.result when needed.
   * @param  {String} key
   * @param  {Object} defaultValue
   * @return {Object} the params
   */
  getParam: function getParam(key, defaultValue) {
    var result = _underscoreWrapper.default.resultCtx(this.getParams(), key, this);

    return !_underscoreWrapper.default.isUndefined(result) ? result : defaultValue;
  },

  /**
   * Get a parameter from options.params or if empty, object attribute.
   *
   * @param  {String} key
   * @return {Object} the param or attribute
   */
  getParamOrAttribute: function getParamOrAttribute(key) {
    return this.getParam(key) || _underscoreWrapper.default.result(this, key);
  },
  __markError: function __markError() {
    this.$el.addClass('o-form-has-errors');
  },
  __clearError: function __clearError() {
    this.$el.removeClass('o-form-has-errors');
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/components/ReadModeBar.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/components/ReadModeBar.js ***!
  \******************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

var _FormUtil = _interopRequireDefault(__webpack_require__(/*! ../helpers/FormUtil */ "./node_modules/@okta/courage/src/views/forms/helpers/FormUtil.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _BaseView.default.extend({
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
      this.add(_FormUtil.default.createReadFormButton({
        type: 'cancel'
      }));
    } else {
      this.add(_FormUtil.default.createReadFormButton({
        type: 'edit',
        formTitle: this.formTitle,
        className: 'ajax-form-edit-link'
      }));
    }
  },
  toggle: function toggle() {
    this.removeChildren();
    this.addButton();
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/components/Toolbar.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/components/Toolbar.js ***!
  \**************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

var _FormUtil = _interopRequireDefault(__webpack_require__(/*! ../helpers/FormUtil */ "./node_modules/@okta/courage/src/views/forms/helpers/FormUtil.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _BaseView.default.extend({
  className: 'o-form-button-bar',
  buttonOrder: ['previous', 'save', 'cancel'],
  initialize: function initialize(options) {
    var _this = this;

    var buttonConfigs = {
      previous: {
        type: 'previous'
      },
      save: {
        type: 'save',
        text: _underscoreWrapper.default.resultCtx(options, 'save', this),
        id: _underscoreWrapper.default.resultCtx(options, 'saveId', this),
        className: _underscoreWrapper.default.resultCtx(options, 'saveClassName', this)
      },
      cancel: {
        type: 'cancel',
        text: _underscoreWrapper.default.resultCtx(options, 'cancel', this)
      }
    };

    this.__getButtonOrder(options).forEach(function (buttonName) {
      _this.addButton(buttonConfigs[buttonName]);
    });
  },

  /**
   * Adds a buttomn to the toolbar
   * @param {Object} params button parameters
   * @param {Object} options {@link Okta.View#add} options
   */
  addButton: function addButton(params, options) {
    return this.add(_FormUtil.default.createButton(params), options);
  },
  __getButtonOrder: function __getButtonOrder(options) {
    var buttonOrder = _underscoreWrapper.default.resultCtx(options, 'buttonOrder', this, this.buttonOrder);

    var buttonsToSkip = [];

    if (options.noSubmitButton) {
      buttonsToSkip.push('save');
    }

    if (options.noCancelButton) {
      buttonsToSkip.push('cancel');
    }

    if (!options.hasPrevStep) {
      buttonsToSkip.push('previous');
    }

    return _underscoreWrapper.default.without.apply(_underscoreWrapper.default, [buttonOrder].concat(buttonsToSkip));
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/helpers/EnumTypeHelper.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/helpers/EnumTypeHelper.js ***!
  \******************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _SchemaUtil = _interopRequireDefault(__webpack_require__(/*! ../../../util/SchemaUtil */ "./node_modules/@okta/courage/src/util/SchemaUtil.js"));

var _StringUtil = _interopRequireDefault(__webpack_require__(/*! ../../../util/StringUtil */ "./node_modules/@okta/courage/src/util/StringUtil.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-statements: 0 */
var NAME = 'name';
var ENUM_KEY_PREFIX = '_enum_';
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
  var enumOneOf = convertToOneOf(config.enumValues);
  var inputOptions = {
    name: config.name,
    label: config.title,
    readOnly: config.readOnly,
    customExplain: config.explain,
    params: {
      enumOneOf: enumOneOf
    },
    options: getDropdownOptionsFromOneOf(enumOneOf)
  }; // input type

  if (_SchemaUtil.default.isArrayDataType(config.displayType)) {
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
  return _underscoreWrapper.default.isArray(values) ? getDropdownOptionsFromOneOf(convertToOneOf(values)) : {};
}

function getDropdownOptionsFromOneOf(values) {
  if (!isOneOfEnumObject(values)) {
    return {};
  }

  return _underscoreWrapper.default.reduce(values, function (options, value, index) {
    options[convertIndexToEnumIndex(index)] = value.title;
    return options;
  }, {});
}

function convertToOneOf(values) {
  // assume this is a legacy enum array and convert to oneOf object
  if (!_underscoreWrapper.default.all(values, _jqueryWrapper.default.isPlainObject)) {
    return convertEnumToOneOf(values); // we assume object without const and title is an enum object which need special conversion
  } else if (!isOneOfEnumObject(values)) {
    return convertEnumObjectToOneOf(values);
  }

  return values;
}

function isOneOfEnumObject(values) {
  return _underscoreWrapper.default.isArray(values) && _underscoreWrapper.default.all(values, function (value) {
    return _underscoreWrapper.default.has(value, 'const') && _underscoreWrapper.default.has(value, 'title');
  });
}

function convertEnumToOneOf(values) {
  return _underscoreWrapper.default.map(values, function (value) {
    return {
      const: value,
      title: valueToTitle(value)
    };
  });
}

function valueToTitle(value) {
  if (_underscoreWrapper.default.isObject(value)) {
    return JSON.stringify(value);
  }

  if (_underscoreWrapper.default.isNumber(value)) {
    return value + '';
  }

  return value;
}

function convertEnumObjectToOneOf(values) {
  var findKey = _underscoreWrapper.default.partial(_underscoreWrapper.default.has, _underscoreWrapper.default, NAME); // If all object found the key NAME, use the NAME's value as display name


  if (_underscoreWrapper.default.all(values, findKey)) {
    return _underscoreWrapper.default.chain(values).filter(function (value) {
      return _jqueryWrapper.default.isPlainObject(value) && _underscoreWrapper.default.has(value, NAME);
    }).map(function (value) {
      return {
        const: value,
        title: value[NAME]
      };
    }).value();
  } // Assume a legacy object array does not need special handling and just convert to const/title enum


  return convertEnumToOneOf(values);
}

function convertIndexToEnumIndex(index) {
  return "".concat(ENUM_KEY_PREFIX).concat(index);
}

function enumObjectToValue(obj) {
  var index = _underscoreWrapper.default.findIndex(this.options.params.enumOneOf, function (oneOfObj) {
    return _underscoreWrapper.default.isObject(obj) ? _underscoreWrapper.default.isEqual(oneOfObj.const, obj) : oneOfObj.const === obj;
  }); // Cannot rely on comparator in findIndex when compare objects so need special handling


  return index > -1 ? convertIndexToEnumIndex(index) : obj;
}

function valueToEnumObject(val) {
  if (!_underscoreWrapper.default.isString(val) || val.indexOf(ENUM_KEY_PREFIX) !== 0) {
    return val;
  }

  var index = val.replace(ENUM_KEY_PREFIX, '');
  var enumValue = this.options.params && _underscoreWrapper.default.isArray(this.options.params.enumOneOf) ? this.options.params.enumOneOf[index] : null; // @see `getEnumInputOptions` how enumValues has been set.

  return _underscoreWrapper.default.has(enumValue, 'const') ? enumValue.const : enumValue;
}

function valuesToEnumObjects(values) {
  return _underscoreWrapper.default.map(values, valueToEnumObject.bind(this));
}

function enumObjectsToValues(values) {
  return _underscoreWrapper.default.map(values, enumObjectToValue.bind(this));
}

function isStringConstraint(value) {
  return _underscoreWrapper.default.isString(value) && _jqueryWrapper.default.trim(value) !== '';
}

function isNumberConstraint(value) {
  return _underscoreWrapper.default.isNumber(value) || _underscoreWrapper.default.isNumber(_StringUtil.default.parseFloat(_jqueryWrapper.default.trim(value)));
}

function isIntegerConstraint(value) {
  var integer = _underscoreWrapper.default.isNumber(value) ? value : _StringUtil.default.parseInt(_jqueryWrapper.default.trim(value));
  return typeof integer === 'number' && isFinite(integer) && Math.floor(integer) === integer;
}

function isObjectConstraint(value) {
  if (_underscoreWrapper.default.isObject(value) && !_underscoreWrapper.default.isArray(value)) {
    return true;
  }

  var object = _StringUtil.default.parseObject(_jqueryWrapper.default.trim(value));

  return _underscoreWrapper.default.isObject(object) && !_underscoreWrapper.default.isArray(object);
}

function isConstraintValueMatchType(value, type) {
  switch (type) {
    case _SchemaUtil.default.STRING:
      return isStringConstraint(value);

    case _SchemaUtil.default.NUMBER:
      return isNumberConstraint(value);

    case _SchemaUtil.default.INTEGER:
      return isIntegerConstraint(value);

    case _SchemaUtil.default.OBJECT:
      return isObjectConstraint(value);
  }
}

var _default = {
  getEnumInputOptions: getEnumInputOptions,
  getDropdownOptions: getDropdownOptions,
  convertToOneOf: convertToOneOf,
  isConstraintValueMatchType: isConstraintValueMatchType
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/helpers/ErrorBanner.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/helpers/ErrorBanner.js ***!
  \***************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _BaseView.default.extend({
  template: _runtime.default.template({
    "1": function _(container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<p>" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "errorSummary") || (depth0 != null ? lookupProperty(depth0, "errorSummary") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "errorSummary",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 130
          },
          "end": {
            "line": 1,
            "column": 146
          }
        }
      }) : helper)) + "</p>";
    },
    "3": function _(container, depth0, helpers, partials, data) {
      var lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<p>" + container.escapeExpression((lookupProperty(helpers, "i18n") || depth0 && lookupProperty(depth0, "i18n") || container.hooks.helperMissing).call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "i18n",
        "hash": {
          "bundle": "courage",
          "code": "oform.errorbanner.title"
        },
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 161
          },
          "end": {
            "line": 1,
            "column": 217
          }
        }
      })) + "</p>";
    },
    "compiler": [8, ">= 4.3.0"],
    "main": function main(container, depth0, helpers, partials, data) {
      var stack1,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<div class=\"okta-form-infobox-error infobox infobox-error\" role=\"alert\"><span class=\"icon error-16\"></span>" + ((stack1 = lookupProperty(helpers, "if").call(depth0 != null ? depth0 : container.nullContext || {}, depth0 != null ? lookupProperty(depth0, "errorSummary") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(1, data, 0),
        "inverse": container.program(3, data, 0),
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 107
          },
          "end": {
            "line": 1,
            "column": 228
          }
        }
      })) != null ? stack1 : "") + "</div>";
    },
    "useData": true
  }),
  modelEvents: {
    'form:clear-errors': 'remove'
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/helpers/ErrorParser.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/helpers/ErrorParser.js ***!
  \***************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _StringUtil = _interopRequireDefault(__webpack_require__(/*! ../../../util/StringUtil */ "./node_modules/@okta/courage/src/util/StringUtil.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FIELD_REGEX = /^([\S]+): (.+)$/;
var _default = {
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
    var matches = errorSummary.match(FIELD_REGEX); // error format is: `fieldName: The field cannot be left blank`

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
      var localizedMsg = _StringUtil.default.localize(errorCause.reason);

      var apiMsg = errorCause.errorSummary;
      var field = errorCause.property;
      var errorMessage = localizedMsg.indexOf('L10N_ERROR[') === -1 ? localizedMsg : apiMsg;
      return [field, errorMessage];
    }
  },
  parseErrors: function parseErrors(resp) {
    var responseJSON = this.getResponseJSON(resp);
    return _underscoreWrapper.default.map(responseJSON && responseJSON.errorCauses || [], function (errorCause) {
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
    var responseJSON = this.getResponseJSON(resp);
    var errors = {}; // xhr error object

    if (responseJSON) {
      /* eslint complexity: [2, 9] */
      _underscoreWrapper.default.each(responseJSON.errorCauses || [], function (cause) {
        var res = [];

        if (cause.property && cause.errorSummary) {
          res = this.parseErrorCauseObject(cause);
        } else if (cause.location && cause.errorSummary) {
          // To handle new api error format for field level errors.
          // Ignoring the reason attribute as the translation happens in the API layer and not in the client any more.
          res = [cause.location, cause.errorSummary];
        } else {
          res = this.parseErrorSummary(cause && cause.errorSummary || '');
        }

        if (res) {
          var fieldName = res[0];
          var message = res[1];
          errors[fieldName] || (errors[fieldName] = []);
          errors[fieldName].push(message);
        }
      }, this);
    } // validation key/value object
    else if (_underscoreWrapper.default.isObject(resp) && _underscoreWrapper.default.size(resp)) {
      _underscoreWrapper.default.each(resp, function (msg, field) {
        errors[field] = [msg];
      });
    }

    return _underscoreWrapper.default.size(errors) ? errors : undefined;
  }
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/helpers/FormUtil.js":
/*!************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/helpers/FormUtil.js ***!
  \************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Keys = _interopRequireDefault(__webpack_require__(/*! ../../../util/Keys */ "./node_modules/@okta/courage/src/util/Keys.js"));

var _Logger = _interopRequireDefault(__webpack_require__(/*! ../../../util/Logger */ "./node_modules/@okta/courage/src/util/Logger.js"));

var _StringUtil = _interopRequireDefault(__webpack_require__(/*! ../../../util/StringUtil */ "./node_modules/@okta/courage/src/util/StringUtil.js"));

var _ViewUtil = _interopRequireDefault(__webpack_require__(/*! ../../../util/ViewUtil */ "./node_modules/@okta/courage/src/util/ViewUtil.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-params: [2, 6] */
var LABEL_OPTIONS = ['model', 'id', 'inputId', 'type', 'label', 'sublabel', 'tooltip', 'name', 'group'];
var CONTAINER_OPTIONS = ['wide', 'multi', 'input', 'label-top', 'explain', 'explain-top', 'customExplain', 'model', 'name', 'type', 'autoRender', 'multirowError'];
var WRAPPER_OPTIONS = ['model', 'name', 'label-top', 'readOnly', 'events', 'initialize', 'showWhen', 'bindings', 'render', 'className', 'data-se', 'toggleWhen', 'group'];
var INPUT_OPTIONS = ['model', 'name', 'inputId', 'type', // base options
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
'params', 'autoComplete' // autocomplete attribute
];
var // widgets params - for input specific widgets
OTHER_OPTIONS = ['errorField'];

var ALL_OPTIONS = _underscoreWrapper.default.uniq(_underscoreWrapper.default.union(LABEL_OPTIONS, CONTAINER_OPTIONS, WRAPPER_OPTIONS, INPUT_OPTIONS, OTHER_OPTIONS));

var SAVE_BUTTON_PHASES = ['•         ', '•  •      ', '•  •  •   ', '•  •  •  •', '   •  •  •', '      •  •', '         •', '          ', '          ', '          '];

function decorateDoWhen(doWhen) {
  if (doWhen && !doWhen['__edit__']) {
    return _underscoreWrapper.default.extend({
      __edit__: _underscoreWrapper.default.constant(true)
    }, doWhen);
  }
}

function _createButton(options) {
  options = _underscoreWrapper.default.pick(options || {}, 'action', 'id', 'className', 'text', 'type');
  var timeoutId;
  var intervalId;
  var phaseCount;
  return _BaseView.default.extend({
    tagName: 'input',
    className: 'button',
    events: {
      click: function click() {
        if (options.action && !this.disabled()) {
          options.action.call(this);
        }
      },
      keyup: function keyup(e) {
        if (_Keys.default.isEnter(e) && options.action && !this.disabled()) {
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
          timeoutId = setTimeout(_underscoreWrapper.default.bind(this.__changeSaveText, this), 1000);
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
    __changeSaveText: function __changeSaveText() {
      phaseCount = 0;
      intervalId = setInterval(_underscoreWrapper.default.bind(this.__showLoadingText, this), 200);
    },
    __showLoadingText: function __showLoadingText() {
      this.$el.val(SAVE_BUTTON_PHASES[phaseCount++ % SAVE_BUTTON_PHASES.length]);
    }
  });
}

function validateInput(options, model) {
  /* eslint max-statements: 0, complexity: 0 */
  options || (options = {});

  if (options.type === 'label') {
    if (!options.label) {
      _Logger.default.warn('A label input must have a "label" parameter', options);
    }

    return;
  }

  if (options.type === 'button') {
    if (!options.title && !options.icon) {
      _Logger.default.warn('A button input must have a "title" and/or an "icon" parameter', options);
    }

    if (!options.click && !options.href) {
      _Logger.default.warn('A button input must have a "click" and/or an "href" parameter', options);
    }

    return;
  }

  if (!options.name && !options.input) {
    _Logger.default.warn('Missing "name" or "input" parameters', options);
  }

  if (_underscoreWrapper.default.isArray(options.name) && _underscoreWrapper.default.isArray(options.input)) {
    throw new Error('Not allowed to have both "name" and "input" defined as array.');
  }

  if (options.type !== 'list' && options.name && model && model.allows) {
    var names = [];

    if (_underscoreWrapper.default.isArray(options.name)) {
      names = options.name;
    } else {
      names.push(options.name);
    }

    _underscoreWrapper.default.each(names, function (name) {
      if (!model.allows(name)) {
        throw new Error('field not allowed: ' + options.name);
      }
    });
  }

  if (_underscoreWrapper.default.isArray(options.input) && options.type !== 'list') {
    _underscoreWrapper.default.each(options.input, function (input) {
      validateInput(input, model);
    });
  }

  var keys = _underscoreWrapper.default.keys(options);

  var intersection = _underscoreWrapper.default.intersection(keys, ALL_OPTIONS);

  if (_underscoreWrapper.default.size(intersection) !== _underscoreWrapper.default.size(options)) {
    var fields = _underscoreWrapper.default.clone(ALL_OPTIONS);

    fields.unshift(keys);

    _Logger.default.warn('Invalid input parameters', _underscoreWrapper.default.without.apply(null, fields), options);
  }
}

function generateInputOptions(options, form, createFn) {
  options = _underscoreWrapper.default.clone(options);

  if (_underscoreWrapper.default.contains(['list', 'group'], options.type)) {
    options.params = _underscoreWrapper.default.defaults({
      create: createFn,
      inputs: _underscoreWrapper.default.map(_underscoreWrapper.default.isArray(options.input) ? options.input : [options.input], function (input) {
        return _underscoreWrapper.default.first(generateInputOptions(input, form, createFn));
      })
    }, options.params || {});
    delete options.input;
  }

  var inputs = _underscoreWrapper.default.isArray(options.input) ? _underscoreWrapper.default.clone(options.input) : [options];
  return _underscoreWrapper.default.map(inputs, function (input) {
    var target = _underscoreWrapper.default.defaults({
      model: form.model
    }, input, _underscoreWrapper.default.omit(options, 'input', 'inputs'), form.options, {
      id: _underscoreWrapper.default.uniqueId('input'),
      readOnly: form.isReadOnly(),
      read: form.hasReadMode()
    });

    if (form.isReadOnly()) {
      target.read = target.readOnly = true;
    }

    return target;
  });
}

var _default = {
  LABEL_OPTIONS: LABEL_OPTIONS,
  CONTAINER_OPTIONS: CONTAINER_OPTIONS,
  WRAPPER_OPTIONS: WRAPPER_OPTIONS,
  INPUT_OPTIONS: INPUT_OPTIONS,
  generateInputOptions: generateInputOptions,
  changeEventString: function changeEventString(fieldNames) {
    return 'change:' + fieldNames.join(' change:');
  },
  createReadFormButton: function createReadFormButton(options) {
    var action;
    var text;
    var ariaLabel;

    if (options.type === 'cancel') {
      text = ariaLabel = _StringUtil.default.localize('oform.cancel', 'courage');

      action = function action() {
        this.model.trigger('form:cancel');
      };
    } else {
      text = _StringUtil.default.localize('oform.edit', 'courage');
      ariaLabel = text + ' ' + options.formTitle;

      action = function action() {
        this.model.set('__edit__', true);
      };
    }

    return _BaseView.default.extend({
      tagName: 'a',
      className: options.className,
      attributes: {
        href: '#',
        'aria-label': ariaLabel
      },
      // TODO: refactor to enforce precompiled templates OKTA-309852
      // eslint-disable-next-line @okta/okta-ui/no-bare-templates
      template: function template() {
        return _underscoreWrapper.default.escape(text);
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
    options = _underscoreWrapper.default.clone(options);

    switch (options.type) {
      case 'save':
        _underscoreWrapper.default.defaults(options, {
          className: 'button-primary'
        });

        break;

      case 'cancel':
        _underscoreWrapper.default.defaults(options, {
          className: 'button-clear',
          text: _StringUtil.default.localize('oform.cancel', 'courage'),
          action: function action() {
            this.model.trigger('form:cancel');
          }
        });

        break;

      case 'previous':
        _underscoreWrapper.default.defaults(options, {
          text: _StringUtil.default.localize('oform.previous', 'courage'),
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

    _ViewUtil.default.applyDoWhen(view, decorateDoWhen(showWhen), function (bool, options) {
      if (!options.animate) {
        view.$el.toggle(bool);
      } else {
        view.$el['slide' + (bool ? 'Down' : 'Up')](200, toggleAndResize(bool));
      }
    });
  },
  applyToggleWhen: function applyToggleWhen(view, toggleWhen) {
    _ViewUtil.default.applyDoWhen(view, decorateDoWhen(toggleWhen), function (bool, options) {
      view.$el.toggle(bool);
      view.model.trigger('form:resize');

      if (options.animate) {
        view.render();
      }
    });
  }
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/helpers/InputContainer.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/helpers/InputContainer.js ***!
  \******************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Logger = _interopRequireDefault(__webpack_require__(/*! ../../../util/Logger */ "./node_modules/@okta/courage/src/util/Logger.js"));

var _Util = _interopRequireDefault(__webpack_require__(/*! ../../../util/Util */ "./node_modules/@okta/courage/src/util/Util.js"));

var _StringUtil = _interopRequireDefault(__webpack_require__(/*! ../../../util/StringUtil */ "./node_modules/@okta/courage/src/util/StringUtil.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var isABaseView = _Util.default.isABaseView;
/**
 * @class InputContainer
 * @private
 *
 * TODO: OKTA-80796
 * Attention: Please change with caution since this is used in other places
 */

var _default = _BaseView.default.extend({
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

    if (_underscoreWrapper.default.contains([1, 2, 3, 4], this.options.multi)) {
      className += ' o-form-multi-input-' + this.options.multi;

      if (_underscoreWrapper.default.isArray(this.options.input)) {
        var inputGroup = _underscoreWrapper.default.find(this.options.input, function (input) {
          return _underscoreWrapper.default.contains(['text+select', 'select+text'], input.options.type);
        });

        inputGroup && (className += ' o-form-multi-input-group-' + this.options.multi);
      }
    }

    return className;
  },
  _getNames: function _getNames() {
    var names = _underscoreWrapper.default.isArray(this.options.name) ? this.options.name : [this.options.name];
    /*eslint complexity: 0 */

    if (this.options.type === 'group') {
      names.push.apply(names, _underscoreWrapper.default.pluck(this.options.input[0].options.params.inputs, 'name'));
    } else if (_underscoreWrapper.default.isArray(this.options.name)) {
      if (this.options.input && this.options.input.options && this.options.input.options.name) {
        names.push(this.options.input.options.name);
      }
    } else if (this.options.input) {
      if (_underscoreWrapper.default.isArray(this.options.input)) {
        _underscoreWrapper.default.each(this.options.input, function (inputItem) {
          names.push(inputItem.options.name);
        });
      } else {
        names.push(this.options.input.options.name);
      }
    }

    return _underscoreWrapper.default.uniq(_underscoreWrapper.default.compact(names));
  },
  _getInputElement: function _getInputElement() {
    // NOTE: this.options.input is sometimes not an array under test
    var lastInput = Array.isArray(this.options.input) ? _underscoreWrapper.default.last(this.options.input) : this.options.input; // FIXME: replace with _.get

    var id = lastInput && lastInput.options && lastInput.options.inputId;
    var el = id ? this.$('#' + id) : null;
    return el && el.length ? el : null;
  },
  constructor: function constructor() {
    /* eslint max-statements: [2, 18] */
    _BaseView.default.apply(this, arguments);

    var explainTop = this.options['explain-top'] && this.options['label-top'];

    if (this.options.input) {
      if (_underscoreWrapper.default.isArray(this.options.input)) {
        _underscoreWrapper.default.each(this.options.input, function (inputItem) {
          this.add(inputItem, {
            prepend: !explainTop
          });
        }, this);
      } else {
        this.add(this.options.input, {
          prepend: !explainTop
        });
      }
    }

    this.__setExplain(this.options);

    var names = this._getNames();

    this.listenTo(this.model, 'form:field-error', function (name, errors) {
      if (_underscoreWrapper.default.contains(names, name)) {
        this.__setError(errors, explainTop);
      }
    });
    this.listenTo(this.model, 'form:clear-errors change:' + names.join(' change:'), this.__clearError);
    this.listenTo(this.model, 'form:clear-error:' + names.join(' form:clear-error:'), this.__clearError);

    if (_underscoreWrapper.default.resultCtx(this.options, 'autoRender', this)) {
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
    var explain; // Deprecated - if you need custom html, use explain instead

    if (options.customExplain) {
      _Logger.default.warn('Deprecated - use explain instead of customExplain');

      this.add(this.options.customExplain);
      return;
    }

    explain = options.explain;

    if (_underscoreWrapper.default.isFunction(explain) && !isABaseView(explain)) {
      explain = _underscoreWrapper.default.resultCtx(this.options, 'explain', this);
    }

    if (!explain) {
      return;
    }

    if (isABaseView(explain)) {
      this.template = _runtime.default.template({
        "compiler": [8, ">= 4.3.0"],
        "main": function main(container, depth0, helpers, partials, data) {
          return "<p class=\"o-form-explain\"></p>";
        },
        "useData": true
      });
      this.add(explain, ' > .o-form-explain');
    } else {
      this.template = _runtime.default.template({
        "compiler": [8, ">= 4.3.0"],
        "main": function main(container, depth0, helpers, partials, data) {
          var helper,
              lookupProperty = container.lookupProperty || function (parent, propertyName) {
            if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
              return parent[propertyName];
            }

            return undefined;
          };

          return "<p class=\"o-form-explain\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "explain") || (depth0 != null ? lookupProperty(depth0, "explain") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
            "name": "explain",
            "hash": {},
            "data": data,
            "loc": {
              "start": {
                "line": 1,
                "column": 26
              },
              "end": {
                "line": 1,
                "column": 37
              }
            }
          }) : helper)) + "</p>";
        },
        "useData": true
      });
    }
  },

  /**
   * Highlight the input as invalid (validation failed)
   * Adds an explaination message of the error
   * @private
   */
  __setError: function __setError(errors, explainTop) {
    this.__errorState = true;
    this.$el.addClass('o-form-has-errors');

    var errorId = _underscoreWrapper.default.uniqueId('input-container-error'); //test code to trigger courage and SIW build


    var testErrorsCopy = errors;

    var html = this.__getHTMLForError(testErrorsCopy, errorId);

    var $elExplain = this.$('.o-form-explain').not('.o-form-input-error').first();

    if ($elExplain.length && !explainTop) {
      $elExplain.before(html);
    } else {
      this.$el.append(html);
    }

    var target = this._getInputElement() || this.$el;
    target.attr('aria-describedby', errorId);
    target.attr('aria-invalid', true);
  },
  __getHTMLForError: function __getHTMLForError(errors, errorId) {
    var tmpl = _runtime.default.template({
      "compiler": [8, ">= 4.3.0"],
      "main": function main(container, depth0, helpers, partials, data) {
        var helper,
            alias1 = depth0 != null ? depth0 : container.nullContext || {},
            alias2 = container.hooks.helperMissing,
            alias3 = "function",
            alias4 = container.escapeExpression,
            lookupProperty = container.lookupProperty || function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName];
          }

          return undefined;
        };

        return "<p id=\"" + alias4((helper = (helper = lookupProperty(helpers, "errorId") || (depth0 != null ? lookupProperty(depth0, "errorId") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
          "name": "errorId",
          "hash": {},
          "data": data,
          "loc": {
            "start": {
              "line": 1,
              "column": 7
            },
            "end": {
              "line": 1,
              "column": 18
            }
          }
        }) : helper)) + "\" class=\"okta-form-input-error o-form-input-error o-form-explain\" role=\"alert\"><span class=\"icon icon-16 error-16-small\" role=\"img\" aria-label=\"" + alias4((helper = (helper = lookupProperty(helpers, "iconLabel") || (depth0 != null ? lookupProperty(depth0, "iconLabel") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
          "name": "iconLabel",
          "hash": {},
          "data": data,
          "loc": {
            "start": {
              "line": 1,
              "column": 162
            },
            "end": {
              "line": 1,
              "column": 175
            }
          }
        }) : helper)) + "\"></span>" + alias4((helper = (helper = lookupProperty(helpers, "text") || (depth0 != null ? lookupProperty(depth0, "text") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
          "name": "text",
          "hash": {},
          "data": data,
          "loc": {
            "start": {
              "line": 1,
              "column": 184
            },
            "end": {
              "line": 1,
              "column": 192
            }
          }
        }) : helper)) + "</p>";
      },
      "useData": true
    });

    var iconLabel = _StringUtil.default.localize('oform.error.icon.ariaLabel', 'courage'); // 'Error'


    if (this.options.multirowError) {
      var html = '';
      errors.forEach(function (error) {
        html = html + tmpl({
          errorId: errorId,
          iconLabel: iconLabel,
          text: error
        });
      });
      return html;
    }

    return tmpl({
      errorId: errorId,
      iconLabel: iconLabel,
      text: errors.join(', ')
    });
  },

  /**
   * Un-highlight the input and remove explaination text
   * @private
   */
  __clearError: function __clearError() {
    var _this = this;

    if (this.__errorState) {
      this.$('.o-form-input-error').remove();
      var target = this._getInputElement() || this.$el;
      target.attr('aria-describedby', null);
      target.attr('aria-invalid', null);
      this.$el.removeClass('o-form-has-errors');
      this.__errorState = false;

      _underscoreWrapper.default.defer(function () {
        _this.model.trigger('form:resize');
      });
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

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/helpers/InputFactory.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/helpers/InputFactory.js ***!
  \****************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _InputRegistry = _interopRequireDefault(__webpack_require__(/*! ./InputRegistry */ "./node_modules/@okta/courage/src/views/forms/helpers/InputRegistry.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint complexity: 0, max-statements: 0 */
function createInput(Input, options) {
  if (_InputRegistry.default.isBaseInput(Input)) {
    return Input.prototype ? new Input(_underscoreWrapper.default.omit(options, 'input')) : Input;
  } else {
    return Input;
  }
}

function create(options) {
  options = _underscoreWrapper.default.clone(options);

  if (options.input) {
    return createInput(options.input, options);
  }

  var Input = _InputRegistry.default.get(options);

  if (!Input) {
    throw new Error('unknown input: ' + options.type);
  }

  return createInput(Input, options);
}

function supports(options) {
  return !!options.input || !!_InputRegistry.default.get(options);
}

var _default = {
  create: create,
  supports: supports
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/helpers/InputLabel.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/helpers/InputLabel.js ***!
  \**************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

__webpack_require__(/*! qtip */ "qtip");

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * @class InputLabel
 * @extends {Okta.View}
 * @private
 * The input's label.
 */
var _default = _BaseView.default.extend({
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
    _underscoreWrapper.default.defaults(options, {
      inputId: options.id
    });

    delete options.id;

    _BaseView.default.apply(this, arguments);
  },
  // standardLabel: space added in the end of the label to avoid selecting label text with double click in read mode
  template: _runtime.default.template({
    "1": function _(container, depth0, helpers, partials, data) {
      return "<legend>";
    },
    "3": function _(container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<label for=\"" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "inputId") || (depth0 != null ? lookupProperty(depth0, "inputId") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "inputId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 61
          },
          "end": {
            "line": 1,
            "column": 72
          }
        }
      }) : helper)) + "\"></label>";
    },
    "5": function _(container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return container.escapeExpression((helper = (helper = lookupProperty(helpers, "label") || (depth0 != null ? lookupProperty(depth0, "label") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "label",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 116
          },
          "end": {
            "line": 1,
            "column": 125
          }
        }
      }) : helper));
    },
    "7": function _(container, depth0, helpers, partials, data) {
      var helper,
          alias1 = depth0 != null ? depth0 : container.nullContext || {},
          alias2 = container.hooks.helperMissing,
          alias3 = "function",
          alias4 = container.escapeExpression,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<label for=\"" + alias4((helper = (helper = lookupProperty(helpers, "inputId") || (depth0 != null ? lookupProperty(depth0, "inputId") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "inputId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 167
          },
          "end": {
            "line": 1,
            "column": 178
          }
        }
      }) : helper)) + "\">" + alias4((helper = (helper = lookupProperty(helpers, "label") || (depth0 != null ? lookupProperty(depth0, "label") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "label",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 180
          },
          "end": {
            "line": 1,
            "column": 189
          }
        }
      }) : helper)) + "&nbsp;</label>";
    },
    "9": function _(container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<span class=\"o-form-explain\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "sublabel") || (depth0 != null ? lookupProperty(depth0, "sublabel") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "sublabel",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 256
          },
          "end": {
            "line": 1,
            "column": 268
          }
        }
      }) : helper)) + "</span>";
    },
    "11": function _(container, depth0, helpers, partials, data) {
      var stack1,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<span class=\"o-form-tooltip icon-16 icon-only form-help-16\" title=\"" + container.escapeExpression(container.lambda((stack1 = depth0 != null ? lookupProperty(depth0, "tooltip") : depth0) != null ? lookupProperty(stack1, "text") : stack1, depth0)) + "\"></span>";
    },
    "13": function _(container, depth0, helpers, partials, data) {
      return "</legend>";
    },
    "compiler": [8, ">= 4.3.0"],
    "main": function main(container, depth0, helpers, partials, data) {
      var stack1,
          alias1 = depth0 != null ? depth0 : container.nullContext || {},
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "group") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(1, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 28
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "_isLabelView") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(3, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 28
          },
          "end": {
            "line": 1,
            "column": 89
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "_isRadioOrCheckbox") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(5, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 89
          },
          "end": {
            "line": 1,
            "column": 132
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "_standardLabel") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(7, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 132
          },
          "end": {
            "line": 1,
            "column": 210
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "sublabel") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(9, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 210
          },
          "end": {
            "line": 1,
            "column": 282
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "tooltip") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(11, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 282
          },
          "end": {
            "line": 1,
            "column": 397
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "group") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(13, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 397
          },
          "end": {
            "line": 1,
            "column": 426
          }
        }
      })) != null ? stack1 : "");
    },
    "useData": true
  }),
  getTemplateData: function getTemplateData() {
    var options = {
      label: ''
    };

    _underscoreWrapper.default.each(['inputId', 'label', 'sublabel', 'tooltip', 'group'], function (option) {
      options[option] = _underscoreWrapper.default.resultCtx(this.options, option, this);
    }, this);

    if (this._isLabelView(options.label)) {
      options._isLabelView = true;
    } else if (_underscoreWrapper.default.contains(['radio', 'checkbox'], this.options.type) || !options.label) {
      options._isRadioOrCheckbox = true;
    } else {
      options._standardLabel = true;
    }

    if (options.tooltip) {
      if (_underscoreWrapper.default.isString(options.tooltip)) {
        options.tooltip = {
          text: options.tooltip
        };
      }
    }

    return options;
  },
  _isLabelView: function _isLabelView(label) {
    return !_underscoreWrapper.default.isUndefined(label) && label instanceof _BaseView.default;
  },
  postRender: function postRender() {
    var options = this.getTemplateData();

    if (this._isLabelView(options.label)) {
      this.removeChildren();
      this.add(options.label, 'label');
    }

    if (options.tooltip) {
      this.$('.o-form-tooltip').qtip(_underscoreWrapper.default.extend({
        style: {
          classes: 'qtip-custom qtip-shadow'
        },
        position: {
          my: window.okta && window.okta.theme === 'dstheme' ? 'bottom center' : 'bottom left',
          at: 'top center'
        },
        hide: {
          fixed: true
        },
        show: {
          delay: 0
        }
      }, options.tooltip.options));
    }
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/helpers/InputRegistry.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/helpers/InputRegistry.js ***!
  \*****************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var registry = {};

function isBaseInput(input) {
  if (_underscoreWrapper.default.isFunction(input)) {
    return _underscoreWrapper.default.isFunction(input.prototype.editMode) && _underscoreWrapper.default.isFunction(input.prototype.readMode);
  } else {
    return _underscoreWrapper.default.isObject(input) && _underscoreWrapper.default.isFunction(input.editMode) && _underscoreWrapper.default.isFunction(input.readMode);
  }
}
/**
 * @class module:Okta.internal.views.forms.helpers.InputRegistry
 */


var _default =
/** @lends module:Okta.internal.views.forms.helpers.InputRegistry */
{
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
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/helpers/InputWrapper.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/helpers/InputWrapper.js ***!
  \****************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

var _FormUtil = _interopRequireDefault(__webpack_require__(/*! ./FormUtil */ "./node_modules/@okta/courage/src/views/forms/helpers/FormUtil.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function runCallback(callback, field) {
  callback.apply(this, _underscoreWrapper.default.map(field.split(/\s+/), function (field) {
    return this.model.get(field);
  }, this));
}

function runIf(fn, ctx) {
  if (_underscoreWrapper.default.isFunction(fn)) {
    fn.call(ctx);
  }
}
/**
 * @class InputWrapper
 * @extends Okta.View
 * @private
 * The outer wrapper that warps the label and the input container
 */


var _default = _BaseView.default.extend({
  tagName: function tagName() {
    if (this.options.group) {
      return 'fieldset';
    }

    return 'div';
  },
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
        return _underscoreWrapper.default.result(this, 'inputWrapperClassName', '') + ' ' + _underscoreWrapper.default.result(this, 'optionsClassName');
      };
    }

    _BaseView.default.apply(this, arguments);

    _underscoreWrapper.default.each(options.events || {}, function (callback, event) {
      this.listenTo(this.model, event, callback);
    }, this);

    _underscoreWrapper.default.each(options.bindings || {}, function (callback, field) {
      this.listenTo(this.model, _FormUtil.default.changeEventString(field.split(/\s+/)), _underscoreWrapper.default.bind(runCallback, this, callback, field));
    }, this);

    _FormUtil.default.applyShowWhen(this, options.showWhen);

    _FormUtil.default.applyToggleWhen(this, options.toggleWhen);

    runIf(options.initialize, this);
  },
  postRender: function postRender() {
    _underscoreWrapper.default.each(this.options.bindings || {}, runCallback, this);

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

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/helpers/SchemaFormFactory.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/helpers/SchemaFormFactory.js ***!
  \*********************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _StringUtil = _interopRequireDefault(__webpack_require__(/*! ../../../util/StringUtil */ "./node_modules/@okta/courage/src/util/StringUtil.js"));

var _BooleanSelect = _interopRequireDefault(__webpack_require__(/*! ../inputs/BooleanSelect */ "./node_modules/@okta/courage/src/views/forms/inputs/BooleanSelect.js"));

var _TextBoxSet = _interopRequireDefault(__webpack_require__(/*! ../inputs/TextBoxSet */ "./node_modules/@okta/courage/src/views/forms/inputs/TextBoxSet.js"));

var _EnumTypeHelper = _interopRequireDefault(__webpack_require__(/*! ./EnumTypeHelper */ "./node_modules/@okta/courage/src/views/forms/helpers/EnumTypeHelper.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint max-statements: 0, max-params: 0 */
// Maps each __displayType__ to a basic set of inputOptions.
function defaultOptions(property) {
  var type = property.get('__displayType__');
  var values = property.get('__possibleValues__');
  var name = property.get('name');
  var title = property.get('title');
  /* eslint complexity: [2, 24] */

  var inputOptions = {
    type: 'text',
    name: name,
    label: title || name
  }; // @see customOptions for enum complex "object" type,
  // a.k.a "object" or "arrayofobject" type has enum values defined.
  // Other cases (e.g., nested object type) are not support yet.

  switch (type) {
    case 'arrayofstring':
      inputOptions.input = _TextBoxSet.default;
      inputOptions.params = {
        itemType: 'string'
      };
      break;

    case 'arrayofnumber':
      inputOptions.input = _TextBoxSet.default;
      inputOptions.params = {
        itemType: 'number'
      };
      break;

    case 'arrayofinteger':
      inputOptions.input = _TextBoxSet.default;
      inputOptions.params = {
        itemType: 'integer'
      };
      break;

    case 'arrayofobject':
      inputOptions.input = _TextBoxSet.default;
      inputOptions.params = {
        itemType: property.get('items').type
      };
      break;

    case 'arrayofref-id':
      inputOptions.input = _TextBoxSet.default;
      inputOptions.params = {
        itemType: property.get('items').format
      };
      break;

    case 'boolean':
      inputOptions.input = _BooleanSelect.default;
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
        return _underscoreWrapper.default.isEmpty(value) ? '' : _StringUtil.default.localize('user.profile.image.image_set', 'courage'); //TODO
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
} // Sets nonbasic inputOptions, such as an array with possible values


function customOptions(property) {
  var inputOptions = {};
  var name = property.get('name');
  var type = property.get('__displayType__');
  var values = property.get('__possibleValues__');
  var prefix = property.get('__fieldNamePrefix__');

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
    inputOptions = _underscoreWrapper.default.extend({}, _EnumTypeHelper.default.getEnumInputOptions(configs), inputOptions);
  } else if (isArray(type) && values) {
    inputOptions.type = 'checkboxset';
    inputOptions.input = null;
    inputOptions.options = getChoices(values);
  }

  return inputOptions;
}

function convertStringToNumber(string) {
  var number = _StringUtil.default.parseFloat(string);

  return string === '' ? null : number;
}

function isArray(type) {
  return type && type.indexOf('array') >= 0;
} // converts possibleValues to choices
// [a, b, c] => {a: a, b: b, c: c}


function getChoices(values) {
  return _underscoreWrapper.default.object(values, values);
} // A schema property may have an objectName either
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
  var name = schemaProp.get('name');
  var prefix = profile['__nestedProperty__'];
  var defaultValues = possibleValues[name];
  var userValues = profile.get(name);
  var //TODO: Not implemented
  fixedValues;
  var values; // If API responds with a field name that differs from the form-field name
  // example: Model's 'profile.username' vs. server's 'username'

  if (prefix) {
    schemaProp.set('__fieldNamePrefix__', prefix);
  } // case 1: objectName - fixed list of values are set for the input


  fixedValues = possibleValues[getObjectName(schemaProp)]; // case 2: name only - default list of values are provided, user can add more
  // TODO: this case does not yet exist, so it is not tested

  if (defaultValues && userValues) {
    defaultValues = _underscoreWrapper.default.union(defaultValues, userValues);
  } // If both fixed and default values exist,
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
  var objectName = getObjectName(schemaProp);
  var results = values[objectName]; // a schema property that references an empty list of values
  // Im looking at you, google apps.

  if (objectName && (0, _underscoreWrapper.default)(results).isEmpty()) {
    return false;
  }

  return true;
}

var _default = {
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
    var custom = customOptions(preparedSchemaProp);
    var standard = defaultOptions(preparedSchemaProp); // underscore did not support nested extend
    // https://github.com/jashkenas/underscore/issues/162

    if (custom.params && standard.params) {
      custom.params = _underscoreWrapper.default.defaults(custom.params, standard.params);
    }

    return _underscoreWrapper.default.defaults(custom, standard);
  },
  hasValidSchemaProps: function hasValidSchemaProps(schemaProps, possibleValues) {
    if (_underscoreWrapper.default.isEmpty(schemaProps)) {
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
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/inputs/BooleanSelect.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/inputs/BooleanSelect.js ***!
  \****************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _Select = _interopRequireDefault(__webpack_require__(/*! ./Select */ "./node_modules/@okta/courage/src/views/forms/inputs/Select.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var options = {
  undefined: 'undefined',
  true: 'true',
  false: 'false'
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

var _default = _Select.default.extend({
  initialize: function initialize() {
    this.options.options = options;
    this.options.from = from;
    this.options.to = to;
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/inputs/CheckBox.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/inputs/CheckBox.js ***!
  \***********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Keys = _interopRequireDefault(__webpack_require__(/*! ../../../util/Keys */ "./node_modules/@okta/courage/src/util/Keys.js"));

__webpack_require__(/*! vendor/plugins/jquery.custominput */ "./node_modules/@okta/courage/src/vendor/plugins/jquery.custominput.js");

var _BaseInput = _interopRequireDefault(__webpack_require__(/*! ../BaseInput */ "./node_modules/@okta/courage/src/views/forms/BaseInput.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _default = _BaseInput.default.extend({
  template: _runtime.default.template({
    "compiler": [8, ">= 4.3.0"],
    "main": function main(container, depth0, helpers, partials, data) {
      var helper,
          alias1 = depth0 != null ? depth0 : container.nullContext || {},
          alias2 = container.hooks.helperMissing,
          alias3 = "function",
          alias4 = container.escapeExpression,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<input type=\"checkbox\" name=\"" + alias4((helper = (helper = lookupProperty(helpers, "name") || (depth0 != null ? lookupProperty(depth0, "name") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "name",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 29
          },
          "end": {
            "line": 1,
            "column": 37
          }
        }
      }) : helper)) + "\" id=\"" + alias4((helper = (helper = lookupProperty(helpers, "inputId") || (depth0 != null ? lookupProperty(depth0, "inputId") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "inputId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 43
          },
          "end": {
            "line": 1,
            "column": 54
          }
        }
      }) : helper)) + "\"/><label for=\"" + alias4((helper = (helper = lookupProperty(helpers, "inputId") || (depth0 != null ? lookupProperty(depth0, "inputId") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "inputId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 69
          },
          "end": {
            "line": 1,
            "column": 80
          }
        }
      }) : helper)) + "\" data-se-for-name=\"" + alias4((helper = (helper = lookupProperty(helpers, "name") || (depth0 != null ? lookupProperty(depth0, "name") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "name",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 100
          },
          "end": {
            "line": 1,
            "column": 108
          }
        }
      }) : helper)) + "\">" + alias4((helper = (helper = lookupProperty(helpers, "placeholder") || (depth0 != null ? lookupProperty(depth0, "placeholder") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "placeholder",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 110
          },
          "end": {
            "line": 1,
            "column": 125
          }
        }
      }) : helper)) + "</label>";
    },
    "useData": true
  }),

  /**
   * @Override
   */
  events: {
    'change :checkbox': 'update',
    keyup: function keyup(e) {
      e.preventDefault();

      if (_Keys.default.isSpaceBar(e)) {
        this.$(':checkbox').click();
      } else if (_Keys.default.isEnter(e)) {
        this.model.trigger('form:save');
      }
    }
  },

  /**
   * @Override
   */
  editMode: function editMode() {
    var placeholder = _underscoreWrapper.default.resultCtx(this.options, 'placeholder', this);

    if (placeholder === '') {
      placeholder = _underscoreWrapper.default.resultCtx(this.options, 'label', this);
    } else if (placeholder === false) {
      placeholder = '';
    }

    this.$el.html(this.template(_underscoreWrapper.default.extend(_underscoreWrapper.default.omit(this.options, 'placeholder'), {
      placeholder: placeholder
    })));
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

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/inputs/DeletableBox.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/inputs/DeletableBox.js ***!
  \***************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _SchemaUtil = _interopRequireDefault(__webpack_require__(/*! ../../../util/SchemaUtil */ "./node_modules/@okta/courage/src/util/SchemaUtil.js"));

var _StringUtil = _interopRequireDefault(__webpack_require__(/*! ../../../util/StringUtil */ "./node_modules/@okta/courage/src/util/StringUtil.js"));

var _Time = _interopRequireDefault(__webpack_require__(/*! ../../../util/Time */ "./node_modules/@okta/courage/src/util/Time.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var isVowel = function isVowel(string) {
  return /^[aeiou]/.test(string);
};

var getArticle = function getArticle(string) {
  return isVowel(string) ? 'an' : 'a';
};

var template = _runtime.default.template({
  "compiler": [8, ">= 4.3.0"],
  "main": function main(container, depth0, helpers, partials, data) {
    var helper,
        alias1 = depth0 != null ? depth0 : container.nullContext || {},
        alias2 = container.hooks.helperMissing,
        alias3 = "function",
        alias4 = container.escapeExpression,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<div class=\"o-form-input-group-controls\"><span class=\"input-fix o-form-control\"><input type=\"text\" class=\"o-form-text\" name=\"" + alias4((helper = (helper = lookupProperty(helpers, "key") || (depth0 != null ? lookupProperty(depth0, "key") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
      "name": "key",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 125
        },
        "end": {
          "line": 1,
          "column": 132
        }
      }
    }) : helper)) + "\" id=\"" + alias4((helper = (helper = lookupProperty(helpers, "key") || (depth0 != null ? lookupProperty(depth0, "key") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
      "name": "key",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 138
        },
        "end": {
          "line": 1,
          "column": 145
        }
      }
    }) : helper)) + "\" value=\"" + alias4((helper = (helper = lookupProperty(helpers, "value") || (depth0 != null ? lookupProperty(depth0, "value") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
      "name": "value",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 154
        },
        "end": {
          "line": 1,
          "column": 163
        }
      }
    }) : helper)) + "\" placeholder=\"" + alias4((helper = (helper = lookupProperty(helpers, "placeholder") || (depth0 != null ? lookupProperty(depth0, "placeholder") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
      "name": "placeholder",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 178
        },
        "end": {
          "line": 1,
          "column": 193
        }
      }
    }) : helper)) + "\"/></span><a href=\"#\" class=\"link-button link-button-icon icon-only\"><span class=\"icon clear-input-16 \"></span></a></div><p class=\"o-form-input-error o-form-explain\"><span class=\"icon icon-16 error-16-small\"></span>" + alias4((helper = (helper = lookupProperty(helpers, "errorExplain") || (depth0 != null ? lookupProperty(depth0, "errorExplain") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
      "name": "errorExplain",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 408
        },
        "end": {
          "line": 1,
          "column": 424
        }
      }
    }) : helper)) + "</p>";
  },
  "useData": true
});

var errorClass = 'o-form-has-errors';
var updateArrayEvent = 'updateArray';

var _default = _BaseView.default.extend({
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
    this.template = template(_underscoreWrapper.default.extend(this.options, {
      placeholder: this.getPlaceholderText(),
      errorExplain: this.getErrorExplainText()
    }));
    this.update = _underscoreWrapper.default.debounce(this.update, this.options.debounceDelay || _Time.default.DEBOUNCE_DELAY);
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
    var _arguments = arguments,
        _this = this;

    this.trigger(updateArrayEvent, null);
    this.$el.slideUp(function () {
      _BaseView.default.prototype.remove.call(_this, _arguments);
    });
  },
  update: function update() {
    var updatedValue = this.$('input').val();

    var parseFunc = _underscoreWrapper.default.object([_SchemaUtil.default.DATATYPE.number, _SchemaUtil.default.DATATYPE.integer], [_StringUtil.default.parseFloat, this.parseInt]);

    if (_underscoreWrapper.default.has(parseFunc, this.options.itemType)) {
      updatedValue = parseFunc[this.options.itemType](updatedValue);
      !_underscoreWrapper.default.isNumber(updatedValue) ? this.markInvalid() : this.clearInvalid();
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
      return !_underscoreWrapper.default.isNaN(num) ? num : string;
    }

    return string;
  })
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/inputs/InputGroup.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/inputs/InputGroup.js ***!
  \*************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _ButtonFactory = _interopRequireDefault(__webpack_require__(/*! ../../../util/ButtonFactory */ "./node_modules/@okta/courage/src/util/ButtonFactory.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

var _BaseInput = _interopRequireDefault(__webpack_require__(/*! ../BaseInput */ "./node_modules/@okta/courage/src/views/forms/BaseInput.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function countInputs(inputs) {
  return _underscoreWrapper.default.filter(inputs || [], function (input) {
    return !_underscoreWrapper.default.contains(['label', 'button', 'select'], input.type);
  }).length;
}

var InputGroupLabelInput = _BaseInput.default.extend({
  tagName: 'span',
  initialize: function initialize() {
    this.$el.text(this.getModelValue());
  },
  editMode: function editMode() {
    this.toggle(true);
  },
  readMode: function readMode() {
    this.toggle(false);
  },
  getModelValue: function getModelValue() {
    return this.options.label;
  },
  toggle: function toggle(isEditMode) {
    this.$el.toggleClass('o-form-label-inline', isEditMode);
    this.$el.toggleClass('o-form-control', !isEditMode);
  },
  focus: _underscoreWrapper.default.noop
});

function createButtonInput(options) {
  return _ButtonFactory.default.create(_underscoreWrapper.default.defaults({
    getReadModeString: _underscoreWrapper.default.constant(' '),
    focus: _underscoreWrapper.default.noop
  }, _underscoreWrapper.default.pick(options, 'click', 'title', 'href', 'icon')));
}

var InputGroupInputGroupView = _BaseView.default.extend({
  getParams: _BaseInput.default.prototype.getParams,
  getParam: _BaseInput.default.prototype.getParam,
  className: function className() {
    var className; // Allows views to group multiple inputs under one label without any of the other
    // styling/rendering changes that come with using a group input

    if (this.getParam('noBaseClasses')) {
      return '';
    }

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
  initialize: function initialize() {
    _underscoreWrapper.default.each(this.getParam('inputs'), function (input) {
      switch (input.type) {
        case 'label':
          this.add(InputGroupLabelInput, {
            options: input
          });
          break;

        case 'button':
          this.add(createButtonInput(input));
          break;

        default:
          input = _underscoreWrapper.default.defaults({
            model: this.model,
            params: _underscoreWrapper.default.extend({
              autoWidth: true
            }, input.params || {})
          }, input);
          this.add(this.getParams().create(input));
      }
    }, this);
  },
  focus: function focus() {
    this.first().focus();
  }
});

var _default = _BaseInput.default.extend({
  constructor: function constructor(options) {
    this.inputGroupView = new InputGroupInputGroupView(options);

    _BaseInput.default.apply(this, arguments);
  },
  editMode: function editMode() {
    this.inputGroupView.remove();
    this.inputGroupView = new InputGroupInputGroupView(this.options);
    this.$el.html(this.inputGroupView.render().el);
  },
  readMode: function readMode() {
    // Allows the user to use to the default "read mode" of the child inputs instead of
    // rendering a single read mode string for all the child inputs
    if (this.getParam('useChildInputsReadMode')) {
      this.editMode();
    } else {
      _BaseInput.default.prototype.readMode.apply(this, arguments);
    }
  },
  toStringValue: function toStringValue() {
    var strings = this.inputGroupView.map(function (input) {
      return input.getReadModeString();
    });
    return strings.length && _underscoreWrapper.default.every(strings) ? strings.join(' ') : ' ';
  },
  focus: function focus() {
    this.inputGroupView.focus();
  }
}, {
  // test hooks
  LabelInput: InputGroupLabelInput,
  InputGroupView: InputGroupInputGroupView
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/inputs/PasswordBox.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/inputs/PasswordBox.js ***!
  \**************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _TextBox = _interopRequireDefault(__webpack_require__(/*! ./TextBox */ "./node_modules/@okta/courage/src/views/forms/inputs/TextBox.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
var toggleTemplate = _runtime.default.template({
  "compiler": [8, ">= 4.3.0"],
  "main": function main(container, depth0, helpers, partials, data) {
    return "<span class=\"password-toggle\"><span class=\"eyeicon visibility-16 button-show\"></span><span class=\"eyeicon visibility-off-16 button-hide\"></span></span>";
  },
  "useData": true
});

var toggleTimeout = 30000;

var _default = _TextBox.default.extend({
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

    _TextBox.default.prototype.postRender.apply(this, arguments);
  },
  __showPasswordToggle: function __showPasswordToggle() {
    return this.options.params && this.options.params.showPasswordToggle;
  },
  __showPassword: function __showPassword() {
    var _this = this;

    _TextBox.default.prototype.changeType.apply(this, ['text']);

    this.$('.password-toggle .button-show').hide();
    this.$('.password-toggle .button-hide').show();
    this.passwordToggleTimer = _underscoreWrapper.default.delay(function () {
      _this.__hidePassword();
    }, toggleTimeout);
  },
  __hidePassword: function __hidePassword() {
    _TextBox.default.prototype.changeType.apply(this, ['password']);

    this.$('.password-toggle .button-show').show();
    this.$('.password-toggle .button-hide').hide(); // clear timeout

    if (this.passwordToggleTimer) {
      clearTimeout(this.passwordToggleTimer);
    }
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/inputs/Radio.js":
/*!********************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/inputs/Radio.js ***!
  \********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Keys = _interopRequireDefault(__webpack_require__(/*! ../../../util/Keys */ "./node_modules/@okta/courage/src/util/Keys.js"));

var _Util = _interopRequireDefault(__webpack_require__(/*! ../../../util/Util */ "./node_modules/@okta/courage/src/util/Util.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! ../../BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

__webpack_require__(/*! vendor/plugins/jquery.custominput */ "./node_modules/@okta/courage/src/vendor/plugins/jquery.custominput.js");

var _BaseInput = _interopRequireDefault(__webpack_require__(/*! ../BaseInput */ "./node_modules/@okta/courage/src/views/forms/BaseInput.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var isABaseView = _Util.default.isABaseView;

var RadioRadioOption = _BaseView.default.extend({
  template: _runtime.default.template({
    "compiler": [8, ">= 4.3.0"],
    "main": function main(container, depth0, helpers, partials, data) {
      var helper,
          alias1 = depth0 != null ? depth0 : container.nullContext || {},
          alias2 = container.hooks.helperMissing,
          alias3 = "function",
          alias4 = container.escapeExpression,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<input type=\"radio\" name=\"" + alias4((helper = (helper = lookupProperty(helpers, "name") || (depth0 != null ? lookupProperty(depth0, "name") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "name",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 26
          },
          "end": {
            "line": 1,
            "column": 34
          }
        }
      }) : helper)) + "\" data-se-name=\"" + alias4((helper = (helper = lookupProperty(helpers, "realName") || (depth0 != null ? lookupProperty(depth0, "realName") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "realName",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 50
          },
          "end": {
            "line": 1,
            "column": 62
          }
        }
      }) : helper)) + "\" value=\"" + alias4((helper = (helper = lookupProperty(helpers, "value") || (depth0 != null ? lookupProperty(depth0, "value") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "value",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 71
          },
          "end": {
            "line": 1,
            "column": 80
          }
        }
      }) : helper)) + "\" id=\"" + alias4((helper = (helper = lookupProperty(helpers, "optionId") || (depth0 != null ? lookupProperty(depth0, "optionId") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "optionId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 86
          },
          "end": {
            "line": 1,
            "column": 98
          }
        }
      }) : helper)) + "\"><label for=\"" + alias4((helper = (helper = lookupProperty(helpers, "optionId") || (depth0 != null ? lookupProperty(depth0, "optionId") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "optionId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 112
          },
          "end": {
            "line": 1,
            "column": 124
          }
        }
      }) : helper)) + "\" data-se-for-name=\"" + alias4((helper = (helper = lookupProperty(helpers, "realName") || (depth0 != null ? lookupProperty(depth0, "realName") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "realName",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 144
          },
          "end": {
            "line": 1,
            "column": 156
          }
        }
      }) : helper)) + "\" class=\"radio-label\">" + alias4((helper = (helper = lookupProperty(helpers, "label") || (depth0 != null ? lookupProperty(depth0, "label") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "label",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 178
          },
          "end": {
            "line": 1,
            "column": 187
          }
        }
      }) : helper)) + "</label>";
    },
    "useData": true
  }),
  initialize: function initialize(options) {
    var explain;
    explain = options.explain;

    if (_underscoreWrapper.default.isFunction(explain) && !isABaseView(explain)) {
      explain = _underscoreWrapper.default.resultCtx(this.options, 'explain', this);
    }

    if (!explain) {
      return;
    }

    if (isABaseView(explain)) {
      this.add('<p class="o-form-explain"></p>', '.radio-label');
      this.add(explain, '.o-form-explain');
    } else {
      this.add(_BaseView.default.extend({
        className: 'o-form-explain',
        tagName: 'p',
        template: _runtime.default.template({
          "compiler": [8, ">= 4.3.0"],
          "main": function main(container, depth0, helpers, partials, data) {
            var helper,
                lookupProperty = container.lookupProperty || function (parent, propertyName) {
              if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
                return parent[propertyName];
              }

              return undefined;
            };

            return container.escapeExpression((helper = (helper = lookupProperty(helpers, "explain") || (depth0 != null ? lookupProperty(depth0, "explain") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
              "name": "explain",
              "hash": {},
              "data": data,
              "loc": {
                "start": {
                  "line": 1,
                  "column": 0
                },
                "end": {
                  "line": 1,
                  "column": 11
                }
              }
            }) : helper));
          },
          "useData": true
        })
      }), '.radio-label');
    }
  }
});

var _default = _BaseInput.default.extend({
  /**
   * @Override
   */
  events: {
    'change :radio': 'update',
    keyup: function keyup(e) {
      if (_Keys.default.isSpaceBar(e)) {
        (0, _jqueryWrapper.default)(e.target).click();
      } else if (_Keys.default.isEnter(e)) {
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

    _underscoreWrapper.default.each(this.options.options, function (value, key) {
      var options = {
        optionId: _underscoreWrapper.default.uniqueId('option'),
        name: this.options.inputId,
        realName: this.options.name,
        value: key
      };

      if (!_underscoreWrapper.default.isObject(value)) {
        value = {
          label: value
        };
      }

      _underscoreWrapper.default.extend(options, value);

      templates.push(new RadioRadioOption(options).render().el);
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

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/inputs/Select.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/inputs/Select.js ***!
  \*********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Keys = _interopRequireDefault(__webpack_require__(/*! ../../../util/Keys */ "./node_modules/@okta/courage/src/util/Keys.js"));

__webpack_require__(/*! vendor/plugins/chosen.jquery */ "./node_modules/@okta/courage/src/vendor/plugins/chosen.jquery.js");

var _BaseInput = _interopRequireDefault(__webpack_require__(/*! ../BaseInput */ "./node_modules/@okta/courage/src/views/forms/BaseInput.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var template = _runtime.default.template({
  "compiler": [8, ">= 4.3.0"],
  "main": function main(container, depth0, helpers, partials, data) {
    var helper,
        alias1 = depth0 != null ? depth0 : container.nullContext || {},
        alias2 = container.hooks.helperMissing,
        alias3 = "function",
        alias4 = container.escapeExpression,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<select id=\"" + alias4((helper = (helper = lookupProperty(helpers, "inputId") || (depth0 != null ? lookupProperty(depth0, "inputId") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
      "name": "inputId",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 12
        },
        "end": {
          "line": 1,
          "column": 23
        }
      }
    }) : helper)) + "\" name=\"" + alias4((helper = (helper = lookupProperty(helpers, "name") || (depth0 != null ? lookupProperty(depth0, "name") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
      "name": "name",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 31
        },
        "end": {
          "line": 1,
          "column": 39
        }
      }
    }) : helper)) + "\"></select>";
  },
  "useData": true
});

var option = _runtime.default.template({
  "compiler": [8, ">= 4.3.0"],
  "main": function main(container, depth0, helpers, partials, data) {
    var helper,
        alias1 = depth0 != null ? depth0 : container.nullContext || {},
        alias2 = container.hooks.helperMissing,
        alias3 = "function",
        alias4 = container.escapeExpression,
        lookupProperty = container.lookupProperty || function (parent, propertyName) {
      if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
        return parent[propertyName];
      }

      return undefined;
    };

    return "<option value=\"" + alias4((helper = (helper = lookupProperty(helpers, "key") || (depth0 != null ? lookupProperty(depth0, "key") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
      "name": "key",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 15
        },
        "end": {
          "line": 1,
          "column": 22
        }
      }
    }) : helper)) + "\">" + alias4((helper = (helper = lookupProperty(helpers, "value") || (depth0 != null ? lookupProperty(depth0, "value") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
      "name": "value",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 24
        },
        "end": {
          "line": 1,
          "column": 33
        }
      }
    }) : helper)) + "</option>";
  },
  "useData": true
});

var CHOSEN_WINDOW_MARGIN = 20; // Chosen has known problems when it's at the bottom of a container that has
// overflow:hidden set. Because it attaches to the parent container, its
// dropdown will be cut off in the UI. Any modal with a chosen select element
// at the bottom will manifest this behavior.
//
// The fix (aside from replacing Chosen) is to change Chosen's behavior -
// use the existing styles, but attach it to 'body' and position it correctly
// so that it is not affected by a parent overflow.
//
// More details can be found in OKTA-46489, OKTA-83570

var CHOSEN_MAX_HEIGHT = 240;
var CHOSEN_Z_INDEX = 50000;

function defer(fn) {
  if (this.params.autoWidth) {
    return fn.call(this);
  } else {
    return _underscoreWrapper.default.defer(_underscoreWrapper.default.bind(fn, this));
  }
}

function findSelectWidth(self) {
  self.$select.hide();
  var select = (0, _jqueryWrapper.default)(self.$select[0]).hide();
  (0, _jqueryWrapper.default)('body').append(select);
  var width = self.params.width = select.width() * 1.2 + 'px';
  self.$el.append(select.show());
  return width;
}

function recalculateChosen($chosen, $results, $clone) {
  var offset = $clone.offset();
  $chosen.css({
    left: offset.left,
    top: offset.top
  }); // Update the max-height to fit within the constraints of the window. This
  // is especially important for modals because page scrolling is disabled.

  var $win = (0, _jqueryWrapper.default)(window);
  var rHeight = $results.outerHeight();
  var rBottom = rHeight + $results.offset().top - $win.scrollTop();
  var wHeight = $win.height() - CHOSEN_WINDOW_MARGIN;
  var maxHeight = Math.min(rHeight + wHeight - rBottom, CHOSEN_MAX_HEIGHT);
  $results.css('max-height', maxHeight);
}

function fixChosenModal($select, textPlaceholder) {
  var $chosen = $select.next('.chzn-container');
  var $clone = $chosen.clone();
  var $results = $chosen.find('.chzn-results'); // Use a hidden clone to maintain layout and calculate offset. This is
  // necessary for more complex layouts (like adding a group rule) where
  // the chosen element is floated.

  $clone.css('visibility', 'hidden');
  $clone.removeAttr('id');
  $clone.find('li').removeAttr('id'); // Save the original styles - we'll revert to them when the select closes

  var baseStyles = {
    left: $chosen.css('left'),
    top: $chosen.css('top'),
    position: $chosen.css('position'),
    float: $chosen.css('float'),
    'z-index': $chosen.css('z-index')
  };
  $results.hide(); // Handler for any resize events that happen when the results list is open

  var resizeHandler = _underscoreWrapper.default.debounce(function () {
    recalculateChosen($chosen, $results, $clone);
  }, 10); // When the dropdown opens, attach it to body, with the correct absolute
  // position coordinates


  $select.off('.fixChosen'); // Remove events we could have added before

  $select.on('liszt:showing_dropdown.fixChosen', function () {
    $chosen.width($chosen.width());
    $select.after($clone); // .chzn-container can trigger the vertical scrollbar if it causes scrollHeight > window height after append to
    // the body. Force top -999999 to avoid the scrollbar so $chosen can find the right offset for relocation.

    $chosen.css({
      position: 'absolute',
      float: 'none',
      'z-index': CHOSEN_Z_INDEX,
      top: -999999
    });
    (0, _jqueryWrapper.default)('body').append($chosen);
    (0, _jqueryWrapper.default)('.chzn-search > :text').prop('placeholder', textPlaceholder);
    $results.show();
    recalculateChosen($chosen, $results, $clone); // Capture scroll events:
    // - for forms that use fixed positioning (like editing attributes in
    //   Profile Editor) - window scroll
    // - for forms that are too long for the modal - o-form-content scroll

    $select.parents().scroll(resizeHandler);
    (0, _jqueryWrapper.default)(window).on('resize scroll', resizeHandler);
  }); // When the dropdown closes or the element is removed, revert to the
  // original styles and reattach it to its original placement in the dom.

  $select.on('liszt:hiding_dropdown.fixChosen remove.fixChosen', function () {
    $select.parents().off('scroll', resizeHandler);
    (0, _jqueryWrapper.default)(window).off('resize scroll', resizeHandler);
    $chosen.css(baseStyles);
    $results.hide();
    $results.css('max-height', CHOSEN_MAX_HEIGHT);
    $clone.remove();
    $select.after($chosen);
  });
}

var _default = _BaseInput.default.extend({
  className: 'o-form-select',

  /**
   * @Override
   */
  events: {
    'change select': 'update',
    'keyup .chzn-search > :text': function keyupChznSearchText(e) {
      if (_Keys.default.isEsc(e)) {
        this.$('.chzn-search > :text').val('');
        e.stopPropagation();
      }
    }
  },
  constructor: function constructor() {
    this.template = template;
    this.option = this.option || option;

    _BaseInput.default.apply(this, arguments);

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

    _underscoreWrapper.default.each(options, function (value, key) {
      this.$select.append(this.option({
        key: key,
        value: value
      }));
    }, this); // Fix a regression in jQuery 1.x on Firefox
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

      if (!_underscoreWrapper.default.result(this.options, 'autoRender') && update !== false) {
        this.update();
      }

      this.$select.chosen({
        width: width,
        disable_search_threshold: searchThreshold,
        //eslint-disable-line camelcase
        placeholder_text: this.options['placeholder'],
        //eslint-disable-line camelcase
        search_contains: true //eslint-disable-line camelcase

      });
      fixChosenModal(this.$select, this.searchPlaceholder);

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
    var selectedOption = this.getModelValue();
    var displayString = selectedOption;
    var options = this.getOptions();

    if (!_underscoreWrapper.default.isEmpty(options)) {
      displayString = options[selectedOption];
    }

    if (_underscoreWrapper.default.isUndefined(displayString)) {
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

    if (_underscoreWrapper.default.isFunction(options)) {
      options = options.call(this);
    }

    return _underscoreWrapper.default.isObject(options) ? options : {};
  },
  remove: function remove() {
    if (this.$select) {
      this.$select.trigger('remove');
    }

    return _BaseInput.default.prototype.remove.apply(this, arguments);
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/inputs/TextBox.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/inputs/TextBox.js ***!
  \**********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

__webpack_require__(/*! qtip */ "qtip");

var _Keys = _interopRequireDefault(__webpack_require__(/*! ../../../util/Keys */ "./node_modules/@okta/courage/src/util/Keys.js"));

__webpack_require__(/*! vendor/plugins/jquery.placeholder */ "./node_modules/@okta/courage/src/vendor/plugins/jquery.placeholder.js");

var _BaseInput = _interopRequireDefault(__webpack_require__(/*! ../BaseInput */ "./node_modules/@okta/courage/src/views/forms/BaseInput.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var className = 'okta-form-input-field input-fix';

function hasTitleAndText(options) {
  var title = options.title;
  var text = options.text;
  return title && text && title !== text;
} // options may be a string or an object.


function createQtipContent(options) {
  if (hasTitleAndText(options)) {
    return options;
  }

  return {
    text: options.text || options
  };
}

var _default = _BaseInput.default.extend({
  template: _runtime.default.template({
    "1": function _(container, depth0, helpers, partials, data) {
      return "<span class=\"input-tooltip icon form-help-16\"></span>";
    },
    "3": function _(container, depth0, helpers, partials, data) {
      var stack1,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<span class=\"icon input-icon " + container.escapeExpression(container.lambda((stack1 = depth0 != null ? lookupProperty(depth0, "params") : depth0) != null ? lookupProperty(stack1, "icon") : stack1, depth0)) + "\"></span>";
    },
    "5": function _(container, depth0, helpers, partials, data) {
      var helper,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return container.escapeExpression((helper = (helper = lookupProperty(helpers, "autoComplete") || (depth0 != null ? lookupProperty(depth0, "autoComplete") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "autoComplete",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 333
          },
          "end": {
            "line": 1,
            "column": 349
          }
        }
      }) : helper));
    },
    "7": function _(container, depth0, helpers, partials, data) {
      return "off";
    },
    "9": function _(container, depth0, helpers, partials, data) {
      return "<span class=\"input-icon-divider\"></span>";
    },
    "compiler": [8, ">= 4.3.0"],
    "main": function main(container, depth0, helpers, partials, data) {
      var stack1,
          helper,
          alias1 = depth0 != null ? depth0 : container.nullContext || {},
          alias2 = container.hooks.helperMissing,
          alias3 = "function",
          alias4 = container.escapeExpression,
          lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return ((stack1 = lookupProperty(helpers, "if").call(alias1, (stack1 = depth0 != null ? lookupProperty(depth0, "params") : depth0) != null ? lookupProperty(stack1, "innerTooltip") : stack1, {
        "name": "if",
        "hash": {},
        "fn": container.program(1, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 87
          }
        }
      })) != null ? stack1 : "") + ((stack1 = lookupProperty(helpers, "if").call(alias1, (stack1 = depth0 != null ? lookupProperty(depth0, "params") : depth0) != null ? lookupProperty(stack1, "icon") : stack1, {
        "name": "if",
        "hash": {},
        "fn": container.program(3, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 87
          },
          "end": {
            "line": 1,
            "column": 166
          }
        }
      })) != null ? stack1 : "") + "<input type=\"" + alias4((helper = (helper = lookupProperty(helpers, "type") || (depth0 != null ? lookupProperty(depth0, "type") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "type",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 179
          },
          "end": {
            "line": 1,
            "column": 187
          }
        }
      }) : helper)) + "\" placeholder=\"" + alias4((helper = (helper = lookupProperty(helpers, "placeholder") || (depth0 != null ? lookupProperty(depth0, "placeholder") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "placeholder",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 202
          },
          "end": {
            "line": 1,
            "column": 217
          }
        }
      }) : helper)) + "\" name=\"" + alias4((helper = (helper = lookupProperty(helpers, "name") || (depth0 != null ? lookupProperty(depth0, "name") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "name",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 225
          },
          "end": {
            "line": 1,
            "column": 233
          }
        }
      }) : helper)) + "\" id=\"" + alias4((helper = (helper = lookupProperty(helpers, "inputId") || (depth0 != null ? lookupProperty(depth0, "inputId") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "inputId",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 239
          },
          "end": {
            "line": 1,
            "column": 250
          }
        }
      }) : helper)) + "\" value=\"" + alias4((helper = (helper = lookupProperty(helpers, "value") || (depth0 != null ? lookupProperty(depth0, "value") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "value",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 259
          },
          "end": {
            "line": 1,
            "column": 268
          }
        }
      }) : helper)) + "\" aria-label=\"" + alias4((helper = (helper = lookupProperty(helpers, "placeholder") || (depth0 != null ? lookupProperty(depth0, "placeholder") : depth0)) != null ? helper : alias2, _typeof(helper) === alias3 ? helper.call(alias1, {
        "name": "placeholder",
        "hash": {},
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 282
          },
          "end": {
            "line": 1,
            "column": 297
          }
        }
      }) : helper)) + "\" autocomplete=\"" + ((stack1 = lookupProperty(helpers, "if").call(alias1, depth0 != null ? lookupProperty(depth0, "autoComplete") : depth0, {
        "name": "if",
        "hash": {},
        "fn": container.program(5, data, 0),
        "inverse": container.program(7, data, 0),
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 313
          },
          "end": {
            "line": 1,
            "column": 367
          }
        }
      })) != null ? stack1 : "") + "\" />" + ((stack1 = lookupProperty(helpers, "if").call(alias1, (stack1 = depth0 != null ? lookupProperty(depth0, "params") : depth0) != null ? lookupProperty(stack1, "iconDivider") : stack1, {
        "name": "if",
        "hash": {},
        "fn": container.program(9, data, 0),
        "inverse": container.noop,
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 371
          },
          "end": {
            "line": 1,
            "column": 444
          }
        }
      })) != null ? stack1 : "");
    },
    "useData": true
  }),

  /**
   * @Override
   */
  events: {
    'input input': 'update',
    'change input': 'update',
    'keydown input': 'update',
    'keyup input': function keyupInput(e) {
      if (_Keys.default.isEnter(e)) {
        this.model.trigger('form:save');
      } else if (_Keys.default.isEsc(e)) {
        this.model.trigger('form:cancel');
      }
    }
  },
  constructor: function constructor() {
    _BaseInput.default.apply(this, arguments);

    this.$el.addClass('o-form-control');
  },

  /**
   * @Override
   */
  editMode: function editMode() {
    this.$el.addClass(className);

    _BaseInput.default.prototype.editMode.apply(this, arguments);

    this.$('input').placeholder();
  },

  /**
   * @Override
   */
  readMode: function readMode() {
    _BaseInput.default.prototype.readMode.apply(this, arguments);

    if (this.options.type === 'password') {
      this.$el.text('********');
    }

    this.$el.removeClass(className);
  },

  /**
   * @Override
   */
  val: function val() {
    var inputValue = this.$('input[type="' + this.options.type + '"]').val(); //IE will only read clear text pw if type="password" is explicitly in selector

    if (this.options.type !== 'password') {
      inputValue = _jqueryWrapper.default.trim(inputValue);
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
    var params = this.options.params;

    if (params && params.innerTooltip) {
      var content = createQtipContent(params.innerTooltip);
      this.$('.input-tooltip').qtip({
        content: content,
        style: {
          classes: 'okta-tooltip qtip-custom qtip-shadow'
        },
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
          viewport: (0, _jqueryWrapper.default)('body')
        }
      });
    }
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./node_modules/@okta/courage/src/views/forms/inputs/TextBoxSet.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@okta/courage/src/views/forms/inputs/TextBoxSet.js ***!
  \*************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! handlebars/runtime */ "handlebars/runtime"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! ../../../util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _SchemaUtil = _interopRequireDefault(__webpack_require__(/*! ../../../util/SchemaUtil */ "./node_modules/@okta/courage/src/util/SchemaUtil.js"));

var _BaseInput = _interopRequireDefault(__webpack_require__(/*! ../BaseInput */ "./node_modules/@okta/courage/src/views/forms/BaseInput.js"));

var _DeletableBox = _interopRequireDefault(__webpack_require__(/*! ./DeletableBox */ "./node_modules/@okta/courage/src/views/forms/inputs/DeletableBox.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _BaseInput.default.extend({
  className: 'array-input',
  template: _runtime.default.template({
    "compiler": [8, ">= 4.3.0"],
    "main": function main(container, depth0, helpers, partials, data) {
      var lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<a href=\"#\" class=\"array-inputs-button link-button\">" + container.escapeExpression((lookupProperty(helpers, "i18n") || depth0 && lookupProperty(depth0, "i18n") || container.hooks.helperMissing).call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "i18n",
        "hash": {
          "bundle": "courage",
          "code": "oform.add.another"
        },
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 52
          },
          "end": {
            "line": 1,
            "column": 102
          }
        }
      })) + "</a>";
    },
    "useData": true
  }),
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
    this.params = _underscoreWrapper.default.defaults(options.params || {}, this.params);
    this.uniqueIdPrefix = 'array';
  },
  // api returns null for an array that does not have value
  // convert it to an empty array
  from: function from(val) {
    if (!_underscoreWrapper.default.isArray(val)) {
      return [];
    }

    return val;
  },
  // @Override
  editMode: function editMode() {
    this._setArrayObject();

    this.$el.html(this.template);

    _underscoreWrapper.default.each(this.arrayObject, _underscoreWrapper.default.bind(this._addDeletableBox, this));

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
    var values = _underscoreWrapper.default.values(this.arrayObject);

    if (_underscoreWrapper.default.contains([_SchemaUtil.default.DATATYPE.number, _SchemaUtil.default.DATATYPE.integer], this.params.itemType)) {
      values = _underscoreWrapper.default.filter(values, _underscoreWrapper.default.isNumber);
    }

    return values;
  },
  focus: function focus() {},
  addNewElement: function addNewElement() {
    var value = '';

    var key = _underscoreWrapper.default.uniqueId(this.uniqueIdPrefix);

    this.arrayObject[key] = value;

    this._addDeletableBox(value, key); // update is called to make sure an empty string value is added for string type array


    this.update();
  },
  _addDeletableBox: function _addDeletableBox(value, key) {
    var deletableBox = new _DeletableBox.default(_underscoreWrapper.default.extend(_underscoreWrapper.default.pick(this.options, 'read', 'readOnly', 'model'), {
      key: key,
      value: value,
      itemType: this.params.itemType
    }));
    this.listenTo(deletableBox, 'updateArray', function (updatedValue) {
      if (_underscoreWrapper.default.isNull(updatedValue)) {
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

    if (_underscoreWrapper.default.isArray(array) && !_underscoreWrapper.default.isEmpty(array)) {
      var keys = [];
      var self = this;
      (0, _underscoreWrapper.default)(array.length).times(function () {
        keys.push(_underscoreWrapper.default.uniqueId(self.uniqueIdPrefix));
      });
      this.arrayObject = _underscoreWrapper.default.object(keys, array);
    }
  }
});

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./src/CourageForSigninWidget.js":
/*!***************************************!*\
  !*** ./src/CourageForSigninWidget.js ***!
  \***************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.default = void 0;

var _BaseCollection = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/models/BaseCollection */ "./node_modules/@okta/courage/src/models/BaseCollection.js"));

var _BaseModel = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/models/BaseModel */ "./node_modules/@okta/courage/src/models/BaseModel.js"));

var _BaseSchema = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/models/BaseSchema */ "./node_modules/@okta/courage/src/models/BaseSchema.js"));

var _Model = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/models/Model */ "./node_modules/@okta/courage/src/models/Model.js"));

var _SchemaProperty = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/models/SchemaProperty */ "./node_modules/@okta/courage/src/models/SchemaProperty.js"));

var _BaseController = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/BaseController */ "./node_modules/@okta/courage/src/util/BaseController.js"));

var _BaseRouter = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/BaseRouter */ "./node_modules/@okta/courage/src/util/BaseRouter.js"));

var _ButtonFactory = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/ButtonFactory */ "./node_modules/@okta/courage/src/util/ButtonFactory.js"));

var _Class = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/Class */ "./node_modules/@okta/courage/src/util/Class.js"));

var _Cookie = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/Cookie */ "./node_modules/@okta/courage/src/util/Cookie.js"));

var _Clipboard = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/Clipboard */ "./node_modules/@okta/courage/src/util/Clipboard.js"));

var _Keys = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/Keys */ "./node_modules/@okta/courage/src/util/Keys.js"));

var _Logger = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/Logger */ "./node_modules/@okta/courage/src/util/Logger.js"));

var _StringUtil = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/StringUtil */ "./node_modules/@okta/courage/src/util/StringUtil.js"));

var _Util = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/Util */ "./node_modules/@okta/courage/src/util/Util.js"));

var _handlebarsWrapper = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/handlebars-wrapper */ "./node_modules/@okta/courage/src/util/handlebars-wrapper.js"));

var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

var _underscoreWrapper = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/underscore-wrapper */ "./node_modules/@okta/courage/src/util/underscore-wrapper.js"));

var _Backbone = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/Backbone.ListView */ "./node_modules/@okta/courage/src/views/Backbone.ListView.js"));

var _BaseView = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/BaseView */ "./node_modules/@okta/courage/src/views/BaseView.js"));

var _BaseDropDown = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/components/BaseDropDown */ "./node_modules/@okta/courage/src/views/components/BaseDropDown.js"));

var _Notification = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/components/Notification */ "./node_modules/@okta/courage/src/views/components/Notification.js"));

var _BaseForm = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/forms/BaseForm */ "./node_modules/@okta/courage/src/views/forms/BaseForm.js"));

var _Toolbar = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/forms/components/Toolbar */ "./node_modules/@okta/courage/src/views/forms/components/Toolbar.js"));

var _FormUtil = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/forms/helpers/FormUtil */ "./node_modules/@okta/courage/src/views/forms/helpers/FormUtil.js"));

var _InputRegistry = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/forms/helpers/InputRegistry */ "./node_modules/@okta/courage/src/views/forms/helpers/InputRegistry.js"));

var _SchemaFormFactory = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/forms/helpers/SchemaFormFactory */ "./node_modules/@okta/courage/src/views/forms/helpers/SchemaFormFactory.js"));

var _CheckBox = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/forms/inputs/CheckBox */ "./node_modules/@okta/courage/src/views/forms/inputs/CheckBox.js"));

var _PasswordBox = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/forms/inputs/PasswordBox */ "./node_modules/@okta/courage/src/views/forms/inputs/PasswordBox.js"));

var _Radio = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/forms/inputs/Radio */ "./node_modules/@okta/courage/src/views/forms/inputs/Radio.js"));

var _Select = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/forms/inputs/Select */ "./node_modules/@okta/courage/src/views/forms/inputs/Select.js"));

var _InputGroup = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/forms/inputs/InputGroup */ "./node_modules/@okta/courage/src/views/forms/inputs/InputGroup.js"));

var _TextBox = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/forms/inputs/TextBox */ "./node_modules/@okta/courage/src/views/forms/inputs/TextBox.js"));

var _Callout = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/views/components/Callout */ "./node_modules/@okta/courage/src/views/components/Callout.js"));

var _backbone = _interopRequireDefault(__webpack_require__(/*! backbone */ "./node_modules/backbone/backbone.js"));

var _View = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/framework/View */ "./node_modules/@okta/courage/src/framework/View.js"));

__webpack_require__(/*! ./util/scrollParent */ "./src/util/scrollParent.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The string will be returned unchanged. All templates should be precompiled.
_View.default.prototype.compileTemplate = function (str) {
  return function fakeTemplate() {
    return str;
  };
}; // Override events to not support `Enter` submitting the form twice - OKTA-321999 and OKTA-317629


var events = {
  'input input': 'update',
  'change input': 'update',
  'keydown input': 'update',
  'keyup input': function keyupInput(e) {
    if (_Keys.default.isEsc(e)) {
      this.model.trigger('form:cancel');
    }
  }
};

var TextBoxForSigninWidget = _TextBox.default.extend({
  events: events
});

var PasswordBoxForSigninWidget = _PasswordBox.default.extend({
  events: events
});

var Form = _BaseForm.default.extend({
  scrollOnError: function scrollOnError() {
    // scrollOnError is true by default. Override to false if `scrollOnError` has been set to false in widget settings.
    var settings = this.options.settings;

    if (settings.get('features.scrollOnError') === false) {
      return false;
    }

    return true;
  }
});

var Okta = {
  Backbone: _backbone.default,
  $: _jqueryWrapper.default,
  _: _underscoreWrapper.default,
  Handlebars: _handlebarsWrapper.default,
  loc: _StringUtil.default.localize,
  createButton: _ButtonFactory.default.create,
  createCallout: _Callout.default.create,
  registerInput: _InputRegistry.default.register,
  Model: _Model.default,
  // TODO: BaseModel has been deprecated and shall not be public
  // remove this once clean up usage in widget.
  BaseModel: _BaseModel.default,
  Collection: _BaseCollection.default,
  FrameworkView: _View.default,
  View: _BaseView.default,
  ListView: _Backbone.default,
  Router: _BaseRouter.default,
  Controller: _BaseController.default,
  Form: Form,
  internal: {
    util: {
      Util: _Util.default,
      Cookie: _Cookie.default,
      Clipboard: _Clipboard.default,
      Logger: _Logger.default,
      Class: _Class.default,
      Keys: _Keys.default
    },
    views: {
      components: {
        BaseDropDown: _BaseDropDown.default,
        Notification: _Notification.default
      },
      forms: {
        helpers: {
          FormUtil: _FormUtil.default,
          SchemaFormFactory: _SchemaFormFactory.default
        },
        components: {
          Toolbar: _Toolbar.default
        },
        inputs: {
          TextBox: TextBoxForSigninWidget,
          PasswordBox: PasswordBoxForSigninWidget,
          CheckBox: _CheckBox.default,
          Radio: _Radio.default,
          Select: _Select.default,
          InputGroup: _InputGroup.default
        }
      }
    },
    models: {
      BaseSchema: _BaseSchema.default,
      SchemaProperty: _SchemaProperty.default
    }
  }
};
Okta.registerInput('text', TextBoxForSigninWidget);
Okta.registerInput('password', PasswordBoxForSigninWidget);
Okta.registerInput('checkbox', _CheckBox.default);
Okta.registerInput('radio', _Radio.default);
Okta.registerInput('select', _Select.default);
Okta.registerInput('group', _InputGroup.default);
var _default = Okta;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./src/empty.js":
/*!**********************!*\
  !*** ./src/empty.js ***!
  \**********************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;

// TODO: maybe replaced by
// https://github.com/Calvein/empty-module
// https://github.com/crimx/empty-module-loader
!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),

/***/ "./src/util/scrollParent.js":
/*!**********************************!*\
  !*** ./src/util/scrollParent.js ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

"use strict";


var _jqueryWrapper = _interopRequireDefault(__webpack_require__(/*! @okta/courage/src/util/jquery-wrapper */ "./node_modules/@okta/courage/src/util/jquery-wrapper.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * jQuery UI Scroll Parent @VERSION
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Modifications Copyright 2021 Okta, Inc.
 */
// This is required because SIW doesn't want to include jqueryui even though it's an external dependency of courage
_jqueryWrapper.default.fn.scrollParent = function (includeHidden) {
  var position = this.css("position"),
      excludeStaticParent = position === "absolute",
      overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
      scrollParent = this.parents().filter(function () {
    var parent = (0, _jqueryWrapper.default)(this);

    if (excludeStaticParent && parent.css("position") === "static") {
      return false;
    }

    return overflowRegex.test(parent.css("overflow") + parent.css("overflow-y") + parent.css("overflow-x"));
  }).eq(0);
  return position === "fixed" || !scrollParent.length ? (0, _jqueryWrapper.default)(this[0].ownerDocument || document) : scrollParent;
};

/***/ }),

/***/ "./node_modules/backbone/backbone.js":
/*!*******************************************!*\
  !*** ./node_modules/backbone/backbone.js ***!
  \*******************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Backbone.js 1.4.0

//     (c) 2010-2019 Jeremy Ashkenas and DocumentCloud
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(factory) {

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self ||
            typeof __webpack_require__.g == 'object' && __webpack_require__.g.global === __webpack_require__.g && __webpack_require__.g;

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! underscore */ "underscore"), __webpack_require__(/*! jquery */ "jquery"), exports], __WEBPACK_AMD_DEFINE_RESULT__ = (function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else { var _, $; }

})(function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to a common array method we'll want to use later.
  var slice = Array.prototype.slice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.4.0';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
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

  // A private global variable to share between listeners and listenees.
  var _listening;

  // Iterates over the standard `event, callback` (as well as the fancy multiple
  // space-separated events `"change blur", callback` and jQuery-style event
  // maps `{event: callback}`).
  var eventsApi = function(iteratee, events, name, callback, opts) {
    var i = 0, names;
    if (name && typeof name === 'object') {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
      for (names = _.keys(name); i < names.length ; i++) {
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
  Events.on = function(name, callback, context) {
    this._events = eventsApi(onApi, this._events || {}, name, callback, {
      context: context,
      ctx: this,
      listening: _listening
    });

    if (_listening) {
      var listeners = this._listeners || (this._listeners = {});
      listeners[_listening.id] = _listening;
      // Allow the listening to use a counter, instead of tracking
      // callbacks for library interop
      _listening.interop = false;
    }

    return this;
  };

  // Inversion-of-control versions of `on`. Tell *this* object to listen to
  // an event in another object... keeping track of what it's listening to
  // for easier unbinding later.
  Events.listenTo = function(obj, name, callback) {
    if (!obj) return this;
    var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var listening = _listening = listeningTo[id];

    // This object is not listening to any other events on `obj` yet.
    // Setup the necessary references to track the listening callbacks.
    if (!listening) {
      this._listenId || (this._listenId = _.uniqueId('l'));
      listening = _listening = listeningTo[id] = new Listening(this, obj);
    }

    // Bind callbacks on obj.
    var error = tryCatchOn(obj, name, callback, this);
    _listening = void 0;

    if (error) throw error;
    // If the target obj is not Backbone.Events, track events manually.
    if (listening.interop) listening.on(name, callback);

    return this;
  };

  // The reducing API that adds a callback to the `events` object.
  var onApi = function(events, name, callback, options) {
    if (callback) {
      var handlers = events[name] || (events[name] = []);
      var context = options.context, ctx = options.ctx, listening = options.listening;
      if (listening) listening.count++;

      handlers.push({callback: callback, context: context, ctx: context || ctx, listening: listening});
    }
    return events;
  };

  // An try-catch guarded #on function, to prevent poisoning the global
  // `_listening` variable.
  var tryCatchOn = function(obj, name, callback, context) {
    try {
      obj.on(name, callback, context);
    } catch (e) {
      return e;
    }
  };

  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  Events.off = function(name, callback, context) {
    if (!this._events) return this;
    this._events = eventsApi(offApi, this._events, name, callback, {
      context: context,
      listeners: this._listeners
    });

    return this;
  };

  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  Events.stopListening = function(obj, name, callback) {
    var listeningTo = this._listeningTo;
    if (!listeningTo) return this;

    var ids = obj ? [obj._listenId] : _.keys(listeningTo);
    for (var i = 0; i < ids.length; i++) {
      var listening = listeningTo[ids[i]];

      // If listening doesn't exist, this object is not currently
      // listening to obj. Break out early.
      if (!listening) break;

      listening.obj.off(name, callback, this);
      if (listening.interop) listening.off(name, callback);
    }
    if (_.isEmpty(listeningTo)) this._listeningTo = void 0;

    return this;
  };

  // The reducing API that removes a callback from the `events` object.
  var offApi = function(events, name, callback, options) {
    if (!events) return;

    var context = options.context, listeners = options.listeners;
    var i = 0, names;

    // Delete all event listeners and "drop" events.
    if (!name && !context && !callback) {
      for (names = _.keys(listeners); i < names.length; i++) {
        listeners[names[i]].cleanup();
      }
      return;
    }

    names = name ? [name] : _.keys(events);
    for (; i < names.length; i++) {
      name = names[i];
      var handlers = events[name];

      // Bail out if there are no events stored.
      if (!handlers) break;

      // Find any remaining events.
      var remaining = [];
      for (var j = 0; j < handlers.length; j++) {
        var handler = handlers[j];
        if (
          callback && callback !== handler.callback &&
            callback !== handler.callback._callback ||
              context && context !== handler.context
        ) {
          remaining.push(handler);
        } else {
          var listening = handler.listening;
          if (listening) listening.off(name, callback);
        }
      }

      // Replace events if there are any remaining.  Otherwise, clean up.
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
  Events.once = function(name, callback, context) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, this.off.bind(this));
    if (typeof name === 'string' && context == null) callback = void 0;
    return this.on(events, callback, context);
  };

  // Inversion-of-control versions of `once`.
  Events.listenToOnce = function(obj, name, callback) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, this.stopListening.bind(this, obj));
    return this.listenTo(obj, events);
  };

  // Reduces the event callbacks into a map of `{event: onceWrapper}`.
  // `offer` unbinds the `onceWrapper` after it has been called.
  var onceMap = function(map, name, callback, offer) {
    if (callback) {
      var once = map[name] = _.once(function() {
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
  Events.trigger = function(name) {
    if (!this._events) return this;

    var length = Math.max(0, arguments.length - 1);
    var args = Array(length);
    for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

    eventsApi(triggerApi, this._events, name, void 0, args);
    return this;
  };

  // Handles triggering the appropriate event callbacks.
  var triggerApi = function(objEvents, name, callback, args) {
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
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  // A listening class that tracks and cleans up memory bindings
  // when all callbacks have been offed.
  var Listening = function(listener, obj) {
    this.id = listener._listenId;
    this.listener = listener;
    this.obj = obj;
    this.interop = true;
    this.count = 0;
    this._events = void 0;
  };

  Listening.prototype.on = Events.on;

  // Offs a callback (or several).
  // Uses an optimized counter if the listenee uses Backbone.Events.
  // Otherwise, falls back to manual tracking to support events
  // library interop.
  Listening.prototype.off = function(name, callback) {
    var cleanup;
    if (this.interop) {
      this._events = eventsApi(offApi, this._events, name, callback, {
        context: void 0,
        listeners: void 0
      });
      cleanup = !this._events;
    } else {
      this.count--;
      cleanup = this.count === 0;
    }
    if (cleanup) this.cleanup();
  };

  // Cleans up memory bindings between the listener and the listenee.
  Listening.prototype.cleanup = function() {
    delete this.listener._listeningTo[this.obj._listenId];
    if (!this.interop) delete this.obj._listeners[this.id];
  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
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
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.preinitialize.apply(this, arguments);
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

    // preinitialize is an empty function by default. You can override it with a function
    // or object.  preinitialize will run before any instantiation logic is run in the Model.
    preinitialize: function(){},

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Special-cased proxy to underscore's `_.matches` method.
    matches: function(attrs) {
      return !!_.iteratee(attrs, this)(this.attributes);
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      var unset      = options.unset;
      var silent     = options.silent;
      var changes    = [];
      var changing   = this._changing;
      this._changing = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }

      var current = this.attributes;
      var changed = this.changed;
      var prev    = this._previousAttributes;

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
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      var changed = {};
      var hasChanged;
      for (var attr in diff) {
        var val = diff[attr];
        if (_.isEqual(old[attr], val)) continue;
        changed[attr] = val;
        hasChanged = true;
      }
      return hasChanged ? changed : false;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server, merging the response with the model's
    // local attributes. Any changed attributes will trigger a "change" event.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var model = this;
      var success = options.success;
      options.success = function(resp) {
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
    save: function(key, val, options) {
      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true, parse: true}, options);
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
      options.success = function(resp) {
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
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      var wait = options.wait;

      var destroy = function() {
        model.stopListening();
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
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
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      var id = this.get(this.idAttribute);
      return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend({}, options, {validate: true}));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

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
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    this.preinitialize.apply(this, arguments);
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Splices `insert` into `array` at index `at`.
  var splice = function(array, insert, at) {
    at = Math.min(Math.max(at, 0), array.length);
    var tail = Array(array.length - at);
    var length = insert.length;
    var i;
    for (i = 0; i < tail.length; i++) tail[i] = array[i + at];
    for (i = 0; i < length; i++) array[i + at] = insert[i];
    for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,


    // preinitialize is an empty function by default. You can override it with a function
    // or object.  preinitialize will run before any instantiation logic is run in the Collection.
    preinitialize: function(){},

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model) { return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set. `models` may be Backbone
    // Models or raw JavaScript objects to be converted to Models, or any
    // combination of the two.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      options = _.extend({}, options);
      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();
      var removed = this._removeModels(models, options);
      if (!options.silent && removed.length) {
        options.changes = {added: [], merged: [], removed: removed};
        this.trigger('update', this, options);
      }
      return singular ? removed[0] : removed;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
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
        orderChanged = this.length !== set.length || _.some(this.models, function(m, index) {
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
      if (sort) this.sort({silent: true});

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
    reset: function(models, options) {
      options = options ? _.clone(options) : {};
      for (var i = 0; i < this.models.length; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      return this.remove(model, options);
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      return this.remove(model, options);
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id, cid, model object with id or cid
    // properties, or an attributes object that is transformed through modelId.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] ||
        this._byId[this.modelId(this._isModel(obj) ? obj.attributes : obj)] ||
        obj.cid && this._byId[obj.cid];
    },

    // Returns `true` if the model is in the collection.
    has: function(obj) {
      return this.get(obj) != null;
    },

    // Get the model at the given index.
    at: function(index) {
      if (index < 0) index += this.length;
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      return this[first ? 'find' : 'filter'](attrs);
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      var comparator = this.comparator;
      if (!comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      var length = comparator.length;
      if (_.isFunction(comparator)) comparator = comparator.bind(this);

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
    pluck: function(attr) {
      return this.map(attr + '');
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
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
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      var wait = options.wait;
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(m, resp, callbackOpts) {
        if (wait) collection.add(m, callbackOpts);
        if (success) success.call(callbackOpts.context, m, resp, callbackOpts);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models, {
        model: this.model,
        comparator: this.comparator
      });
    },

    // Define how to uniquely identify models in the collection.
    modelId: function(attrs) {
      return attrs[this.model.prototype.idAttribute || 'id'];
    },

    // Get an iterator of all models in this collection.
    values: function() {
      return new CollectionIterator(this, ITERATOR_VALUES);
    },

    // Get an iterator of all model IDs in this collection.
    keys: function() {
      return new CollectionIterator(this, ITERATOR_KEYS);
    },

    // Get an iterator of all [ID, model] tuples in this collection.
    entries: function() {
      return new CollectionIterator(this, ITERATOR_KEYSVALUES);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
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
    _removeModels: function(models, options) {
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
    _isModel: function(model) {
      return model instanceof Model;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      var id = this.modelId(model.attributes);
      if (id != null) this._byId[id] = model;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
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
    _onModelEvent: function(event, model, collection, options) {
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

  // Defining an @@iterator method implements JavaScript's Iterable protocol.
  // In modern ES2015 browsers, this value is found at Symbol.iterator.
  /* global Symbol */
  var $$iterator = typeof Symbol === 'function' && Symbol.iterator;
  if ($$iterator) {
    Collection.prototype[$$iterator] = Collection.prototype.values;
  }

  // CollectionIterator
  // ------------------

  // A CollectionIterator implements JavaScript's Iterator protocol, allowing the
  // use of `for of` loops in modern browsers and interoperation between
  // Backbone.Collection and other JavaScript functions and third-party libraries
  // which can operate on Iterables.
  var CollectionIterator = function(collection, kind) {
    this._collection = collection;
    this._kind = kind;
    this._index = 0;
  };

  // This "enum" defines the three possible kinds of values which can be emitted
  // by a CollectionIterator that correspond to the values(), keys() and entries()
  // methods on Collection, respectively.
  var ITERATOR_VALUES = 1;
  var ITERATOR_KEYS = 2;
  var ITERATOR_KEYSVALUES = 3;

  // All Iterators should themselves be Iterable.
  if ($$iterator) {
    CollectionIterator.prototype[$$iterator] = function() {
      return this;
    };
  }

  CollectionIterator.prototype.next = function() {
    if (this._collection) {

      // Only continue iterating if the iterated collection is long enough.
      if (this._index < this._collection.length) {
        var model = this._collection.at(this._index);
        this._index++;

        // Construct a value depending on what kind of values should be iterated.
        var value;
        if (this._kind === ITERATOR_VALUES) {
          value = model;
        } else {
          var id = this._collection.modelId(model.attributes);
          if (this._kind === ITERATOR_KEYS) {
            value = id;
          } else { // ITERATOR_KEYSVALUES
            value = [id, model];
          }
        }
        return {value: value, done: false};
      }

      // Once exhausted, remove the reference to the collection so future
      // calls to the next method always return done.
      this._collection = void 0;
    }

    return {value: void 0, done: true};
  };

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
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this.preinitialize.apply(this, arguments);
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
    $: function(selector) {
      return this.$el.find(selector);
    },

    // preinitialize is an empty function by default. You can override it with a function
    // or object.  preinitialize will run before any instantiation logic is run in the View
    preinitialize: function(){},

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this._removeElement();
      this.stopListening();
      return this;
    },

    // Remove this view's element from the document and all event listeners
    // attached to it. Exposed for subclasses using an alternative DOM
    // manipulation API.
    _removeElement: function() {
      this.$el.remove();
    },

    // Change the view's element (`this.el` property) and re-delegate the
    // view's events on the new element.
    setElement: function(element) {
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
    _setElement: function(el) {
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
    delegateEvents: function(events) {
      events || (events = _.result(this, 'events'));
      if (!events) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[method];
        if (!method) continue;
        var match = key.match(delegateEventSplitter);
        this.delegate(match[1], match[2], method.bind(this));
      }
      return this;
    },

    // Add a single event listener to the view's element (or a child element
    // using `selector`). This only works for delegate-able events: not `focus`,
    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
    delegate: function(eventName, selector, listener) {
      this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Clears all callbacks previously bound to the view by `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      if (this.$el) this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
    undelegate: function(eventName, selector, listener) {
      this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Produces a DOM element to be assigned to your view. Exposed for
    // subclasses using an alternative DOM manipulation API.
    _createElement: function(tagName) {
      return document.createElement(tagName);
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
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
    _setAttributes: function(attributes) {
      this.$el.attr(attributes);
    }

  });

  // Proxy Backbone class methods to Underscore functions, wrapping the model's
  // `attributes` object or collection's `models` array behind the scenes.
  //
  // collection.filter(function(model) { return model.get('age') > 10 });
  // collection.each(this.addView);
  //
  // `Function#apply` can be slow so we use the method's arg count, if we know it.
  var addMethod = function(base, length, method, attribute) {
    switch (length) {
      case 1: return function() {
        return base[method](this[attribute]);
      };
      case 2: return function(value) {
        return base[method](this[attribute], value);
      };
      case 3: return function(iteratee, context) {
        return base[method](this[attribute], cb(iteratee, this), context);
      };
      case 4: return function(iteratee, defaultVal, context) {
        return base[method](this[attribute], cb(iteratee, this), defaultVal, context);
      };
      default: return function() {
        var args = slice.call(arguments);
        args.unshift(this[attribute]);
        return base[method].apply(base, args);
      };
    }
  };

  var addUnderscoreMethods = function(Class, base, methods, attribute) {
    _.each(methods, function(length, method) {
      if (base[method]) Class.prototype[method] = addMethod(base, length, method, attribute);
    });
  };

  // Support `collection.sortBy('attr')` and `collection.findWhere({id: 1})`.
  var cb = function(iteratee, instance) {
    if (_.isFunction(iteratee)) return iteratee;
    if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
    if (_.isString(iteratee)) return function(model) { return model.get(iteratee); };
    return iteratee;
  };
  var modelMatcher = function(attrs) {
    var matcher = _.matches(attrs);
    return function(model) {
      return matcher(model.attributes);
    };
  };

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var collectionMethods = {forEach: 3, each: 3, map: 3, collect: 3, reduce: 0,
    foldl: 0, inject: 0, reduceRight: 0, foldr: 0, find: 3, detect: 3, filter: 3,
    select: 3, reject: 3, every: 3, all: 3, some: 3, any: 3, include: 3, includes: 3,
    contains: 3, invoke: 0, max: 3, min: 3, toArray: 1, size: 1, first: 3,
    head: 3, take: 3, initial: 3, rest: 3, tail: 3, drop: 3, last: 3,
    without: 0, difference: 0, indexOf: 3, shuffle: 1, lastIndexOf: 3,
    isEmpty: 1, chain: 1, sample: 3, partition: 3, groupBy: 3, countBy: 3,
    sortBy: 3, indexBy: 3, findIndex: 3, findLastIndex: 3};


  // Underscore methods that we want to implement on the Model, mapped to the
  // number of arguments they take.
  var modelMethods = {keys: 1, values: 1, pairs: 1, invert: 1, pick: 0,
    omit: 0, chain: 1, isEmpty: 1};

  // Mix in each Underscore method as a proxy to `Collection#models`.

  _.each([
    [Collection, collectionMethods, 'models'],
    [Model, modelMethods, 'attributes']
  ], function(config) {
    var Base = config[0],
        methods = config[1],
        attribute = config[2];

    Base.mixin = function(obj) {
      var mappings = _.reduce(_.functions(obj), function(memo, name) {
        memo[name] = 0;
        return memo;
      }, {});
      addUnderscoreMethods(Base, obj, mappings, attribute);
    };

    addUnderscoreMethods(Base, _, methods, attribute);
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
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

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
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
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
    options.error = function(xhr, textStatus, errorThrown) {
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
    create: 'POST',
    update: 'PUT',
    patch: 'PATCH',
    delete: 'DELETE',
    read: 'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    this.preinitialize.apply(this, arguments);
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // preinitialize is an empty function by default. You can override it with a function
    // or object.  preinitialize will run before any instantiation logic is run in the Router.
    preinitialize: function(){},

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
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
    execute: function(callback, args, name) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
        .replace(optionalParam, '(?:$1)?')
        .replace(namedParam, function(match, optional) {
          return optional ? match : '([^/?]+)';
        })
        .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
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
  var History = Backbone.History = function() {
    this.handlers = [];
    this.checkUrl = this.checkUrl.bind(this);

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
    atRoot: function() {
      var path = this.location.pathname.replace(/[^\/]$/, '$&/');
      return path === this.root && !this.getSearch();
    },

    // Does the pathname match the root?
    matchRoot: function() {
      var path = this.decodeFragment(this.location.pathname);
      var rootPath = path.slice(0, this.root.length - 1) + '/';
      return rootPath === this.root;
    },

    // Unicode characters in `location.pathname` are percent encoded so they're
    // decoded for comparison. `%25` should not be decoded since it may be part
    // of an encoded parameter.
    decodeFragment: function(fragment) {
      return decodeURI(fragment.replace(/%25/g, '%2525'));
    },

    // In IE6, the hash fragment and search params are incorrect if the
    // fragment contains `?`.
    getSearch: function() {
      var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
      return match ? match[0] : '';
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the pathname and search params, without the root.
    getPath: function() {
      var path = this.decodeFragment(
        this.location.pathname + this.getSearch()
      ).slice(this.root.length - 1);
      return path.charAt(0) === '/' ? path.slice(1) : path;
    },

    // Get the cross-browser normalized URL fragment from the path or hash.
    getFragment: function(fragment) {
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
    start: function(options) {
      if (History.started) throw new Error('Backbone.history has already been started');
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._hasHashChange   = 'onhashchange' in window && (document.documentMode === void 0 || document.documentMode > 7);
      this._useHashChange   = this._wantsHashChange && this._hasHashChange;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.history && this.history.pushState);
      this._usePushState    = this._wantsPushState && this._hasPushState;
      this.fragment         = this.getFragment();

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
          this.navigate(this.getHash(), {replace: true});
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
      var addEventListener = window.addEventListener || function(eventName, listener) {
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
    stop: function() {
      // Add a cross-platform `removeEventListener` shim for older browsers.
      var removeEventListener = window.removeEventListener || function(eventName, listener) {
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
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
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
    loadUrl: function(fragment) {
      // If the root doesn't match, no routes can match either.
      if (!this.matchRoot()) return false;
      fragment = this.fragment = this.getFragment(fragment);
      return _.some(this.handlers, function(handler) {
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
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      // Normalize the fragment.
      fragment = this.getFragment(fragment || '');

      // Don't include a trailing slash on the root.
      var rootPath = this.root;
      if (fragment === '' || fragment.charAt(0) === '?') {
        rootPath = rootPath.slice(0, -1) || '/';
      }
      var url = rootPath + fragment;

      // Strip the fragment of the query and hash for matching.
      fragment = fragment.replace(pathStripper, '');

      // Decode for matching.
      var decodedFragment = this.decodeFragment(fragment);

      if (this.fragment === decodedFragment) return;
      this.fragment = decodedFragment;

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
    _updateHash: function(location, fragment, replace) {
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
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
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
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error.call(options.context, model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;
});


/***/ }),

/***/ "./node_modules/clipboard/lib/clipboard-action.js":
/*!********************************************************!*\
  !*** ./node_modules/clipboard/lib/clipboard-action.js ***!
  \********************************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, __webpack_require__(/*! select */ "./node_modules/select/src/select.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else { var mod; }
})(this, function (module, _select) {
    'use strict';

    var _select2 = _interopRequireDefault(_select);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var ClipboardAction = function () {
        /**
         * @param {Object} options
         */
        function ClipboardAction(options) {
            _classCallCheck(this, ClipboardAction);

            this.resolveOptions(options);
            this.initSelection();
        }

        /**
         * Defines base properties passed from constructor.
         * @param {Object} options
         */


        _createClass(ClipboardAction, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = options.action;
                this.container = options.container;
                this.emitter = options.emitter;
                this.target = options.target;
                this.text = options.text;
                this.trigger = options.trigger;

                this.selectedText = '';
            }
        }, {
            key: 'initSelection',
            value: function initSelection() {
                if (this.text) {
                    this.selectFake();
                } else if (this.target) {
                    this.selectTarget();
                }
            }
        }, {
            key: 'selectFake',
            value: function selectFake() {
                var _this = this;

                var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

                this.removeFake();

                this.fakeHandlerCallback = function () {
                    return _this.removeFake();
                };
                this.fakeHandler = this.container.addEventListener('click', this.fakeHandlerCallback) || true;

                this.fakeElem = document.createElement('textarea');
                // Prevent zooming on iOS
                this.fakeElem.style.fontSize = '12pt';
                // Reset box model
                this.fakeElem.style.border = '0';
                this.fakeElem.style.padding = '0';
                this.fakeElem.style.margin = '0';
                // Move element out of screen horizontally
                this.fakeElem.style.position = 'absolute';
                this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                // Move element to the same position vertically
                var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                this.fakeElem.style.top = yPosition + 'px';

                this.fakeElem.setAttribute('readonly', '');
                this.fakeElem.value = this.text;

                this.container.appendChild(this.fakeElem);

                this.selectedText = (0, _select2.default)(this.fakeElem);
                this.copyText();
            }
        }, {
            key: 'removeFake',
            value: function removeFake() {
                if (this.fakeHandler) {
                    this.container.removeEventListener('click', this.fakeHandlerCallback);
                    this.fakeHandler = null;
                    this.fakeHandlerCallback = null;
                }

                if (this.fakeElem) {
                    this.container.removeChild(this.fakeElem);
                    this.fakeElem = null;
                }
            }
        }, {
            key: 'selectTarget',
            value: function selectTarget() {
                this.selectedText = (0, _select2.default)(this.target);
                this.copyText();
            }
        }, {
            key: 'copyText',
            value: function copyText() {
                var succeeded = void 0;

                try {
                    succeeded = document.execCommand(this.action);
                } catch (err) {
                    succeeded = false;
                }

                this.handleResult(succeeded);
            }
        }, {
            key: 'handleResult',
            value: function handleResult(succeeded) {
                this.emitter.emit(succeeded ? 'success' : 'error', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }
        }, {
            key: 'clearSelection',
            value: function clearSelection() {
                if (this.trigger) {
                    this.trigger.focus();
                }

                window.getSelection().removeAllRanges();
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.removeFake();
            }
        }, {
            key: 'action',
            set: function set() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

                this._action = action;

                if (this._action !== 'copy' && this._action !== 'cut') {
                    throw new Error('Invalid "action" value, use either "copy" or "cut"');
                }
            },
            get: function get() {
                return this._action;
            }
        }, {
            key: 'target',
            set: function set(target) {
                if (target !== undefined) {
                    if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType === 1) {
                        if (this.action === 'copy' && target.hasAttribute('disabled')) {
                            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                        }

                        if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                        }

                        this._target = target;
                    } else {
                        throw new Error('Invalid "target" value, use a valid Element');
                    }
                }
            },
            get: function get() {
                return this._target;
            }
        }]);

        return ClipboardAction;
    }();

    module.exports = ClipboardAction;
});

/***/ }),

/***/ "./node_modules/clipboard/lib/clipboard.js":
/*!*************************************************!*\
  !*** ./node_modules/clipboard/lib/clipboard.js ***!
  \*************************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, __webpack_require__(/*! ./clipboard-action */ "./node_modules/clipboard/lib/clipboard-action.js"), __webpack_require__(/*! tiny-emitter */ "./node_modules/tiny-emitter/index.js"), __webpack_require__(/*! good-listener */ "./node_modules/good-listener/src/listen.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else { var mod; }
})(this, function (module, _clipboardAction, _tinyEmitter, _goodListener) {
    'use strict';

    var _clipboardAction2 = _interopRequireDefault(_clipboardAction);

    var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

    var _goodListener2 = _interopRequireDefault(_goodListener);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var Clipboard = function (_Emitter) {
        _inherits(Clipboard, _Emitter);

        /**
         * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
         * @param {Object} options
         */
        function Clipboard(trigger, options) {
            _classCallCheck(this, Clipboard);

            var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        _createClass(Clipboard, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
                this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
                this.text = typeof options.text === 'function' ? options.text : this.defaultText;
                this.container = _typeof(options.container) === 'object' ? options.container : document.body;
            }
        }, {
            key: 'listenClick',
            value: function listenClick(trigger) {
                var _this2 = this;

                this.listener = (0, _goodListener2.default)(trigger, 'click', function (e) {
                    return _this2.onClick(e);
                });
            }
        }, {
            key: 'onClick',
            value: function onClick(e) {
                var trigger = e.delegateTarget || e.currentTarget;

                if (this.clipboardAction) {
                    this.clipboardAction = null;
                }

                this.clipboardAction = new _clipboardAction2.default({
                    action: this.action(trigger),
                    target: this.target(trigger),
                    text: this.text(trigger),
                    container: this.container,
                    trigger: trigger,
                    emitter: this
                });
            }
        }, {
            key: 'defaultAction',
            value: function defaultAction(trigger) {
                return getAttributeValue('action', trigger);
            }
        }, {
            key: 'defaultTarget',
            value: function defaultTarget(trigger) {
                var selector = getAttributeValue('target', trigger);

                if (selector) {
                    return document.querySelector(selector);
                }
            }
        }, {
            key: 'defaultText',
            value: function defaultText(trigger) {
                return getAttributeValue('text', trigger);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.listener.destroy();

                if (this.clipboardAction) {
                    this.clipboardAction.destroy();
                    this.clipboardAction = null;
                }
            }
        }], [{
            key: 'isSupported',
            value: function isSupported() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];

                var actions = typeof action === 'string' ? [action] : action;
                var support = !!document.queryCommandSupported;

                actions.forEach(function (action) {
                    support = support && !!document.queryCommandSupported(action);
                });

                return support;
            }
        }]);

        return Clipboard;
    }(_tinyEmitter2.default);

    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */
    function getAttributeValue(suffix, element) {
        var attribute = 'data-clipboard-' + suffix;

        if (!element.hasAttribute(attribute)) {
            return;
        }

        return element.getAttribute(attribute);
    }

    module.exports = Clipboard;
});

/***/ }),

/***/ "./node_modules/delegate/src/closest.js":
/*!**********************************************!*\
  !*** ./node_modules/delegate/src/closest.js ***!
  \**********************************************/
/***/ (function(module) {

var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (typeof element.matches === 'function' &&
            element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
    }
}

module.exports = closest;


/***/ }),

/***/ "./node_modules/delegate/src/delegate.js":
/*!***********************************************!*\
  !*** ./node_modules/delegate/src/delegate.js ***!
  \***********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var closest = __webpack_require__(/*! ./closest */ "./node_modules/delegate/src/closest.js");

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function _delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Delegates event to a selector.
 *
 * @param {Element|String|Array} [elements]
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(elements, selector, type, callback, useCapture) {
    // Handle the regular Element usage
    if (typeof elements.addEventListener === 'function') {
        return _delegate.apply(null, arguments);
    }

    // Handle Element-less usage, it defaults to global delegation
    if (typeof type === 'function') {
        // Use `document` as the first parameter, then apply arguments
        // This is a short way to .unshift `arguments` without running into deoptimizations
        return _delegate.bind(null, document).apply(null, arguments);
    }

    // Handle Selector-based usage
    if (typeof elements === 'string') {
        elements = document.querySelectorAll(elements);
    }

    // Handle Array-like based usage
    return Array.prototype.map.call(elements, function (element) {
        return _delegate(element, selector, type, callback, useCapture);
    });
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;


/***/ }),

/***/ "./node_modules/good-listener/src/is.js":
/*!**********************************************!*\
  !*** ./node_modules/good-listener/src/is.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports) {

/**
 * Check if argument is a HTML element.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.node = function(value) {
    return value !== undefined
        && value instanceof HTMLElement
        && value.nodeType === 1;
};

/**
 * Check if argument is a list of HTML elements.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.nodeList = function(value) {
    var type = Object.prototype.toString.call(value);

    return value !== undefined
        && (type === '[object NodeList]' || type === '[object HTMLCollection]')
        && ('length' in value)
        && (value.length === 0 || exports.node(value[0]));
};

/**
 * Check if argument is a string.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.string = function(value) {
    return typeof value === 'string'
        || value instanceof String;
};

/**
 * Check if argument is a function.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.fn = function(value) {
    var type = Object.prototype.toString.call(value);

    return type === '[object Function]';
};


/***/ }),

/***/ "./node_modules/good-listener/src/listen.js":
/*!**************************************************!*\
  !*** ./node_modules/good-listener/src/listen.js ***!
  \**************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var is = __webpack_require__(/*! ./is */ "./node_modules/good-listener/src/is.js");
var delegate = __webpack_require__(/*! delegate */ "./node_modules/delegate/src/delegate.js");

/**
 * Validates all params and calls the right
 * listener function based on its target type.
 *
 * @param {String|HTMLElement|HTMLCollection|NodeList} target
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listen(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('Missing required arguments');
    }

    if (!is.string(type)) {
        throw new TypeError('Second argument must be a String');
    }

    if (!is.fn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }

    if (is.node(target)) {
        return listenNode(target, type, callback);
    }
    else if (is.nodeList(target)) {
        return listenNodeList(target, type, callback);
    }
    else if (is.string(target)) {
        return listenSelector(target, type, callback);
    }
    else {
        throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
    }
}

/**
 * Adds an event listener to a HTML element
 * and returns a remove listener function.
 *
 * @param {HTMLElement} node
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNode(node, type, callback) {
    node.addEventListener(type, callback);

    return {
        destroy: function() {
            node.removeEventListener(type, callback);
        }
    }
}

/**
 * Add an event listener to a list of HTML elements
 * and returns a remove listener function.
 *
 * @param {NodeList|HTMLCollection} nodeList
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(type, callback);
    });

    return {
        destroy: function() {
            Array.prototype.forEach.call(nodeList, function(node) {
                node.removeEventListener(type, callback);
            });
        }
    }
}

/**
 * Add an event listener to a selector
 * and returns a remove listener function.
 *
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenSelector(selector, type, callback) {
    return delegate(document.body, selector, type, callback);
}

module.exports = listen;


/***/ }),

/***/ "./node_modules/select/src/select.js":
/*!*******************************************!*\
  !*** ./node_modules/select/src/select.js ***!
  \*******************************************/
/***/ (function(module) {

function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        var isReadOnly = element.hasAttribute('readonly');

        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }

        element.select();
        element.setSelectionRange(0, element.value.length);

        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

module.exports = select;


/***/ }),

/***/ "./node_modules/tiny-emitter/index.js":
/*!********************************************!*\
  !*** ./node_modules/tiny-emitter/index.js ***!
  \********************************************/
/***/ (function(module) {

function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;
module.exports.TinyEmitter = E;


/***/ }),

/***/ "handlebars":
/*!*****************************!*\
  !*** external "handlebars" ***!
  \*****************************/
/***/ (function(module) {

"use strict";
module.exports = require("handlebars");

/***/ }),

/***/ "handlebars/runtime":
/*!*************************************!*\
  !*** external "handlebars/runtime" ***!
  \*************************************/
/***/ (function(module) {

"use strict";
module.exports = require("handlebars/runtime");

/***/ }),

/***/ "jquery":
/*!*************************!*\
  !*** external "jquery" ***!
  \*************************/
/***/ (function(module) {

"use strict";
module.exports = require("jquery");

/***/ }),

/***/ "okta-i18n-bundles":
/*!************************************!*\
  !*** external "okta-i18n-bundles" ***!
  \************************************/
/***/ (function(module) {

"use strict";
module.exports = require("okta-i18n-bundles");

/***/ }),

/***/ "qtip":
/*!***********************!*\
  !*** external "qtip" ***!
  \***********************/
/***/ (function(module) {

"use strict";
module.exports = require("qtip");

/***/ }),

/***/ "underscore":
/*!*****************************!*\
  !*** external "underscore" ***!
  \*****************************/
/***/ (function(module) {

"use strict";
module.exports = require("underscore");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/CourageForSigninWidget.js");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=okta.js.map