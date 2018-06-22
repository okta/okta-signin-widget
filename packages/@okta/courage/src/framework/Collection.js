(function (root, factory) {
  if (typeof define == 'function' && define.amd) {
    define(['okta/underscore', 'backbone'], factory);
  }
  /* global module, exports */
  else if (typeof require == 'function' && typeof exports == 'object') {
    module.exports = factory(require('okta/underscore'), require('backbone'));
  }
  else {
    root.Archer || (root.Archer = {});
    root.Archer.Collection = factory(root._, root.Backbone);
  }
}(this, function (_, Backbone) {
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
    var linkexp = /<[^>]*>\s*(\s*;\s*[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*")))*(,|$)/g,
        paramexp = /[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*"))/g;

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
  return Backbone.Collection.extend(/** @lends src/framework/Collection.prototype */ {

    /**
     * Default fetch parameters
     * @type {Object}
     */
    params: {},

    constructor: function (models, options) {
      var state = this[STATE] = new Backbone.Model();
      state.set(DEFAULT_PARAMS, _.defaults(options && options.params || {}, this.params || {}));
      Backbone.Collection.apply(this, arguments);
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
      return Backbone.Collection.prototype.sync.call(this, method, collection, options);
    },

    /**
     * See [Backbone Collection.fetch](http://backbonejs.org/#Collection-fetch).
     */
    fetch: function (options) {
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
    setPagination: function (params, options) {
      if (_.isString(params) && params) {
        params = parseQuery(params);
      }
      if (!_.isObject(params) || _.isArray(params) || !_.size(params)) {
        params = null;
      }
      else if (options && options.fromFetch) {
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
      return _.size(this.getPaginationData()) > 0;
    },

    /**
     * Get the next page from the server
     * @return {Object} xhr returned by {@link #fetch}
     */
    fetchMore: function () {
      if (!this.hasMore()) {
        throw new Error('Invalid Request');
      }
      return this.fetch({data: this.getPaginationData(), add: true, remove: false, update: true});
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
      return Backbone.Collection.prototype.reset.apply(this, arguments);
    },

    // we want "where" to be able to search through derived properties as well
    where: function (attrs, first) {
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
    create: function (model, options) {
      options || (options = {});
      if (!_.result(model, 'urlRoot')) {
        options.url = _.result(this, 'url');
      }
      return Backbone.Collection.prototype.create.call(this, model, options);
    }

  });

}));
