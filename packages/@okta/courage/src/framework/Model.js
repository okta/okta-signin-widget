(function (root, factory) {
  if (typeof define == 'function' && define.amd) {
    define(['okta/underscore', 'backbone', 'shared/util/Logger'], factory);
  }
  /* global module, exports */
  else if (typeof require === 'function' && typeof exports === 'object') {
    module.exports = factory(require('okta/underscore'), require('backbone'), require('shared/util/Logger'));
  }
  else {
    root.Archer || (root.Archer = {});
    root.Archer.Model = factory(root._, root.Backbone, root.Logger);
  }
}(this, function (_, Backbone, Logger) {
  var Model;

  /**
  * @class Archer.Model
  * @extend Backbone.Model
  *
  * Archer.Model is a standard [Backbone.Model](http://backbonejs.org/#Model) with a few additions:
  *
  * - {@link #derived Derived properties}
  * - {@link #props Built in schema validation}
  * - {@link #local Private properties (with schema validation)}
  * - {@link #flat Flattening of nested objects}
  *
  * Both derived and private properties are filtered out when sending the data to the server.
  *
  * Example:
  *
  * ```javascript
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
  * ```
  * See: [Backbone.Model](http://backbonejs.org/#Model-constructor)
  */

  function flatten(value, objectTypeFields, key, target) {
    var filter = _.contains(objectTypeFields, key);
    target || (target = {});
    if (!filter && _.isObject(value) && !_.isArray(value) && !_.isFunction(value)) {
      _.each(value, function (val, i) {
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
    }
    else if (_.isArray(field)) {
      target = {
        type: field[0],
        required: field[1],
        value: field[2]
      };
    }
    else {
      target = _.clone(field);
    }
    _.defaults(target, {required: false, name: name});
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
      var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
      var pattern = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
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

  function validateField(field, value) {
    /* eslint complexity: [2, 13], max-statements: [2, 19]*/
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
    else if (field.uniqueItems && arr.length > _.uniq(arr).length) {
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

  Model = Backbone.Model.extend({

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
     * ```javascript
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
     * ```
     *
     * @type {Mixed}
     */
    props: {},

    /**
     * Derived properties (also known as computed properties) are properties of the model that depend on the
     * other (props, local or even derived properties to determine their value. Best demonstrated with an example:
     *
     * ```javascript
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
     * ```
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
     */
    derived: {},

    /**
     * local properties are defined and work in exactly the same way as {@link #props}, but generally only exist for
     * the lifetime of the page.
     * They would not typically be persisted to the server, and are not returned by calls to {@link #toJSON}.
     *
     * ```javascript
     * var Person = Model.extend({
     *   props: {
     *     name: 'string',
     *   },
     *   local: {
     *     isLoggedIn: 'boolean'
     *   }
     * );
     * ```
     * @type {Object}
     */
    local: {},

    /**
    * Flatten the payload into dot notation string keys:
    *
    * ```javascript
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
    * ```
     * @type {Boolean}
     */
    flat: true,

    /**
     * @deprecated
     * @alias Backbone.Model#defaults
     */
    defaults: {},

    /**
    * @constructor
    * @param {Object} [attributes] - Initial model attributes (data)
    * @param {Object} [options] - Options hash
    */
    constructor: function (options) {
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

    validate: function () {},

    /**
     * Check if the schema settings allow this field to exist in the model
     * @param  {String} key
     * @return {Boolean}
     */
    allows: function (key) {
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
    getPropertySchema: function (propName) {
      var schema = this['__schema__'];
      return _.reduce([schema.props, schema.local], function (result, options) {
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

    get: function (attr) {
      var schema = this['__schema__'];
      if (_.has(schema.derived, attr)) {
        if (schema.derived[attr].cache !== false) {
          return schema.computedProperties[attr];
        }
        else {
          return this.__getDerivedValue(attr);
        }
      }
      return Backbone.Model.prototype.get.apply(this, arguments);
    },

    /**
     * Return a shallow copy of the model's attributes for JSON stringification.
     * This can be used for persistence, serialization, or for augmentation before being sent to the server.
     * The name of this method is a bit confusing, as it doesn't actually return a JSON string —
     *  but I'm afraid that it's the way that the JavaScript API for JSON.stringify works.
     *
     * ```javascript
     * var artist = new Model({
     *   firstName: 'Wassily',
     *   lastName: 'Kandinsky'
     * });
     *
     * artist.set({birthday: 'December 16, 1866'});
     * JSON.stringify(artist); //=> {'firstName':'Wassily','lastName':'Kandinsky','birthday':'December 16, 1866'}
     * ```
     * See [Backbone.Model.toJSON](http://backbonejs.org/#Model-toJSON)
     * @param  {Object} options
     * @return {Object}
     */
    toJSON: function (options) {
      options || (options = {});
      var res = _.clone(Backbone.Model.prototype.toJSON.apply(this, arguments)),
          schema = this['__schema__'];

      // cleanup local properties
      if (!options.verbose) {
        res = _.omit(res, _.keys(schema.local));
      }
      else { // add derived properties
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
    reset: function (options) {
      this.clear(options);
      this.set(_.result(this, 'defaults'), options);
    },

    /**
     * Is the data on the model has local modifications since the last sync event?
     * @return {Boolean} is the model in sync with the server
     */
    isSynced: function () {
      return _.isEqual(this.__syncedData, this.toJSON());
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
     * Runs local schema validation. Invoked internally by {@link #validate}.
     * @return {Object}
     * @protected
     */
    _validateSchema: function () {
      var schema = this['__schema__'];
      return _.reduce(_.extend({}, schema.props, schema.local), function (memo, options, name) {
        return _.extend(memo, this.validateField(name) || {});
      }, {}, this);
    },

    __getDerivedValue: function (name) {
      var options = this['__schema__'].derived[name];
      if (_.isString(options)) {
        var key = options;
        options = {
          deps: [key],
          fn: function () {
            return this.get(key);
          }
        };
      }
      var deps = options.deps || [];
      return options.fn.apply(this, _.map(deps, this.get, this));
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

  return Model;

}));
