define([
  'okta/underscore',
  'shared/models/Model'
], function (_, Model) {

  /**
   * @class Okta.BaseModel
   * @extends {Okta.Model}
   * @deprecated Use `{@link Okta.Model}` instead
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
   * model.get('name'); //=> "Joe Doe"
   * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
   *
   * model.set('__private__', 'private property');
   * model.get('__private__'); //=> "private property"
   * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
   * ```
   */

  var hasProps = function (model) {
    var local = _.omit(model.local, _.keys(model._builtInLocalProps));
    return _.size(model.props) + _.size(local) > 0;
  };

  var BaseModel = Model.extend({
    /**
     * @inheritdoc Okta.Model#flat
     * @type {Boolean}
     */
    flat: false,

    constructor: function () {
      Model.apply(this, arguments);
      this.on('sync', this._setSynced);
    },

    allows: function () {
      if (hasProps(this)) {
        return Model.prototype.allows.apply(this, arguments);
      }
      else {
        return true;
      }
    },

    // bw compatibility support for old computed properties
    set: function (key, val) {
      var attrs;
      if (typeof key === 'object') {
        attrs = key;
      } else {
        (attrs = {})[key] = val;
      }

      // computed properties
      _(attrs).each(function (fn, attr) {
        if (!fn || !_.isArray(fn.__attributes)) { return; }
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
    get: function () {
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
    toJSON: function (options) {
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

    sanitizeAttributes: function (attributes) {
      var attrs = {};
      _.each(attributes, function (value, key) {
        if (!_.isFunction(value)) {
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
      var attrs = {};
      _.each(this.sanitizeAttributes(this.attributes), function (value, key) {
        attrs[key] = void 0;
      });
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    /**
     * @private
     */
    _setSynced: function (newModel) {
      this._syncedData = newModel && _.isFunction(newModel.toJSON) ? newModel.toJSON() : {};
    },

    /**
     * @private
     */
    _getSynced: function () {
      return this._syncedData;
    },

    isSynced: function () {
      return _.isEqual(this._getSynced(), this.toJSON());
    }
  }, {
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
      var args = _.toArray(arguments);
      var fn = args.pop();
      fn.__attributes = args.pop();
      return fn;
    }
  });

  return BaseModel;

});
