import oktaUnderscore from '../util/underscore-wrapper.js';
import Backbone from '../vendor/lib/backbone.js';

var STATE = '__STATE__';
var FETCH_DATA = 'FETCH_DATA';
var PAGINATION_DATA = 'PAGINATION_DATA';
var DEFAULT_PARAMS = 'DEFAULT_PARAMS';
var LINK_BY_HEADER = 'LINK_BY_HEADER';
var XHR = 'XHR'; // ################################################
// # Source: https://gist.github.com/deiu/9335803
// ################################################
// unquote string (utility)

function unquote(value) {
  if (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
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
  var linkexp = /<[^>]*>\s*(\s*;\s*[^()<>@,;:"/[\]?={} \t]+=(([^()<>@,;:"/[\]?={} \t]+)|("[^"]*")))*(,|$)/g;
  var paramexp = /[^()<>@,;:"/[\]?={} \t]+=(([^()<>@,;:"/[\]?={} \t]+)|("[^"]*"))/g;
  var matches = header.match(linkexp);
  var rels = {};

  for (var i = 0; i < matches.length; i++) {
    var split = matches[i].split('>');
    var href = split[0].substring(1);
    var link = {
      href: undefined,
      rel: undefined
    };
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
  var params = {};
  var rawQueryStr = url && url.split('?')[1];
  var queryString = rawQueryStr && decodeURIComponent(rawQueryStr.split('#')[0]).replace(/\+/g, ' ');
  var props = queryString ? queryString.split('&') : [];

  for (var i = 0; i < props.length; i++) {
    var parts = props[i].split('=');
    params[parts.shift()] = parts.join('=');
  }

  return params;
} // ################################################
// # /Source
// ################################################
//


const collectionProps =
/** @lends src/framework/Collection.prototype */
{
  /**
   * Default fetch parameters
   * @type {Object|Function}
   */
  params: {},
  preinitialize: function (models, options) {
    const state = new Backbone.Model();

    const defaultParams = oktaUnderscore.defaults(options && options.params || {}, oktaUnderscore.result(this, 'params') || {});

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

    if (oktaUnderscore.isFunction(this.model) && this.model.length === 0 && this.model.isCourageModel !== true) {
      this.model = oktaUnderscore.result(this, 'model');
    }

    Backbone.Collection.prototype.preinitialize.apply(this, arguments);
  },

  /**
   * See [Backbone Collection.sync](http://backbonejs.org/#Collection-sync).
   */
  sync: function (method, collection, options) {
    var self = this;
    var success = options.success;

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
  fetch: function (options) {
    options || (options = {});
    var state = this[STATE];
    var xhr = state.get(XHR);
    options.data = oktaUnderscore.extend({}, state.get(DEFAULT_PARAMS), options.data || {});
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
  setPagination: function (params, options) {
    /* eslint complexity: [2, 8] */
    if (oktaUnderscore.isString(params) && params) {
      params = parseQuery(params);
    }

    if (!oktaUnderscore.isObject(params) || oktaUnderscore.isArray(params) || !oktaUnderscore.size(params)) {
      params = null;
    } else if (options && options.fromFetch) {
      params = oktaUnderscore.extend({}, this.getFetchData(), params);
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
    return oktaUnderscore.size(this.getPaginationData()) > 0;
  },

  /**
   * Get the next page from the server
   * @return {Object} xhr returned by {@link #fetch}
   */
  fetchMore: function () {
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
  reset: function (models, options) {
    options || (options = {}); // only reset the pagination when reset is being called explicitly.
    // this is to avoid link headers pagination being overriden and reset when
    // fetching the collection using `collection.fetch({reset: true})`

    if (!options.fromFetch) {
      this.setPagination(null);
    }

    return Backbone.Collection.prototype.reset.apply(this, arguments);
  },
  // we want "where" to be able to search through derived properties as well
  where: function (attrs, first) {
    if (oktaUnderscore.isEmpty(attrs)) {
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

    if (!oktaUnderscore.result(model, 'urlRoot')) {
      options.url = oktaUnderscore.result(this, 'url');
    }

    return Backbone.Collection.prototype.create.call(this, model, options);
  },
  // Use Object.create instead of {} on _byId to avoid __proto__ functions to return
  // This can be removed once the issue has addressed in backbone framework
  // https://github.com/jashkenas/backbone/pull/4225
  _reset: function () {
    Backbone.Collection.prototype['_reset'].call(this);
    this._byId = Object.create(null);
  }
};
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

const Collection = Backbone.Collection.extend(collectionProps);
/**
 * It's used for distinguishing the ambiguity from _.isFunction()
 * which returns True for both a JavaScript Class constructor function
 * and normal function. With this flag, we can tell a function is actually
 * a Collection Class.
 * This flag is added in order to support the type of a parameter can be
 * either a Class or pure function that returns a Class.
 */

Collection.isCourageCollection = true;

export { Collection as default };
