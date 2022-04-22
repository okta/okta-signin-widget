import oktaUnderscore from '../util/underscore-wrapper.js';
import Model from './Model.js';

const hasProps = function (model) {
  const local = oktaUnderscore.omit(model.local, oktaUnderscore.keys(model._builtInLocalProps));

  return oktaUnderscore.size(model.props) + oktaUnderscore.size(local) > 0;
};

const props =
/** @lends module:Okta.BaseModel.prototype */
{
  /**
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
    } // computed properties


    oktaUnderscore(attrs).each(function (fn, attr) {
      if (!fn || !oktaUnderscore.isArray(fn.__attributes)) {
        return;
      }

      this.on('change:' + fn.__attributes.join(' change:'), function () {
        const val = this.get(attr);

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
    const value = Model.prototype.get.apply(this, arguments);

    if (oktaUnderscore.isFunction(value)) {
      return value.apply(this, oktaUnderscore.map(value.__attributes || [], this.get, this));
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
    const res = Model.prototype.toJSON.apply(this, arguments); // cleanup computed properties

    oktaUnderscore(res).each(function (value, key) {
      if (typeof value === 'function') {
        if (options.verbose) {
          res[key] = this.get(key);
        } else {
          delete res[key];
        }
      }
    }, this); // cleanup private properties


    if (!options.verbose) {
      oktaUnderscore(res).each(function (value, key) {
        if (/^__\w+__$/.test(key)) {
          delete res[key];
        }
      });
    }

    return res;
  },
  sanitizeAttributes: function (attributes) {
    const attrs = {};

    oktaUnderscore.each(attributes, function (value, key) {
      if (!oktaUnderscore.isFunction(value)) {
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

    oktaUnderscore.each(this.sanitizeAttributes(this.attributes), function (value, key) {
      attrs[key] = void 0;
    });

    return this.set(attrs, oktaUnderscore.extend({}, options, {
      unset: true
    }));
  },

  /**
   * @private
   */
  _setSynced: function (newModel) {
    this._syncedData = newModel && oktaUnderscore.isFunction(newModel.toJSON) ? newModel.toJSON() : {};
  },

  /**
   * @private
   */
  _getSynced: function () {
    return this._syncedData;
  },
  isSynced: function () {
    return oktaUnderscore.isEqual(this._getSynced(), this.toJSON());
  }
};
const statics =
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
   * @param {Array} attributes (optional) - an array of the attribute names this method depends on
   * @param {Function} callback the function that computes the value of the property
   *
   * @deprecated Use {@link #derived} instead
   */
  ComputedProperty: function (attributes, fn) {
    // First parameter is optional
    if (!fn && typeof attributes === 'function') {
      fn = attributes;
    } else {
      fn.__attributes = attributes;
    }

    return fn;
  }
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

var BaseModel = Model.extend(props, statics);

export { BaseModel as default };
