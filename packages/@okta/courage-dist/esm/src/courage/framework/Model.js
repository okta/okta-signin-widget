import oktaUnderscore from '../util/underscore-wrapper.js';
import Backbone from '../vendor/lib/backbone.js';
import Logger from '../util/Logger.js';

function isModelPropertySchema(obj) {
  return obj && obj.type || obj.deps;
}

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
let Model;
const statics = {
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
};

function flatten(value, objectTypeFields, key, target) {
  var filter = oktaUnderscore.contains(objectTypeFields, key);

  target || (target = {});

  if (!filter && oktaUnderscore.isObject(value) && !oktaUnderscore.isArray(value) && !oktaUnderscore.isFunction(value)) {
    oktaUnderscore.each(value, function (val, i) {
      flatten(val, objectTypeFields, key ? key + '.' + i : i, target);
    });
  } // Case where target is an empty object. Guard against returning {undefined: undefined}.
  else if (key !== undefined) {
    target[key] = value;
  }

  return target;
}

function unflatten(data) {
  oktaUnderscore.each(data, function (value, key, data) {
    if (key.indexOf('.') === -1) {
      return;
    }

    var part;
    var ref = data;
    var parts = key.split('.');

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

  if (oktaUnderscore.isString(field)) {
    target = {
      type: field
    };
  } else if (oktaUnderscore.isArray(field)) {
    target = {
      type: field[0],
      required: field[1],
      value: field[2]
    };
  } else {
    target = oktaUnderscore.clone(field);
  }

  oktaUnderscore.defaults(target, {
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
  var createMessageWith = oktaUnderscore.partial(createMessage, field);

  var invalidFormat = validateStringFormat(field, value);

  if (invalidFormat) {
    return createMessageWith(invalidFormat);
  }

  if (value && field.minLength && value.length < field.minLength) {
    return createMessageWith(Model.ERROR_STRING_STRING_MIN_LENGTH);
  }

  if (value && field.maxLength && value.length > field.maxLength) {
    return createMessageWith(Model.ERROR_STRING_STRING_MAX_LENGTH);
  }
}

function validateField(field, value) {
  /* eslint complexity: [2, 25], max-statements: [2, 30] */
  var createMessageWith = oktaUnderscore.partial(createMessage, field);

  var isDefined = !oktaUnderscore.isUndefined(value) && !oktaUnderscore.isNull(value);
  var checkType;
  var errorMessage; // If using an array validator, perform the validation

  if (Array.isArray(field.validate)) {
    const output = [];
    let foundError = false;
    let result;
    field.validate.forEach(item => {
      if (!value) {
        result = false;
      } else {
        switch (item.type.toLowerCase()) {
          case 'regex':
            result = new RegExp(item.value.pattern, item.value.flags || '').test(value);
            break;

          default:
            result = false;
        }
      } // Append the result.


      foundError = foundError || !result;
      output.push({
        // eslint-disable-next-line no-prototype-builtins
        message: item.hasOwnProperty('message') ? item.message : '',
        passed: result
      });
    });

    if (foundError) {
      return createMessageWith(output);
    }

    return;
  } // check required fields


  if (field.required && (!isDefined || oktaUnderscore.isNull(value) || value === '')) {
    return createMessageWith(Model.ERROR_BLANK);
  } // check type


  checkType = oktaUnderscore['is' + capitalize(field.type)];

  if (isDefined && field.type !== 'any' && (!oktaUnderscore.isFunction(checkType) || !checkType(value))) {
    return createMessageWith(Model.ERROR_WRONG_TYPE);
  } // validate string format


  if (value && field.type === 'string') {
    var error = validateString(field, value);

    if (error) {
      return error;
    }
  } // check pre set values (enum)


  if (isDefined && field.values && !oktaUnderscore.contains(field.values, value)) {
    return createMessageWith(Model.ERROR_NOT_ALLOWED);
  } // check validate method


  if (oktaUnderscore.isFunction(field.validate)) {
    var result = field.validate(value);

    if (oktaUnderscore.isString(result) && result) {
      return createMessageWith(result);
    } else if (result === false) {
      return createMessageWith(Model.ERROR_INVALID);
    }
  } // check array items
  // eslint-disable-next-line @typescript-eslint/no-use-before-define


  if (isDefined && field.type === 'array' && (errorMessage = validateArrayField(field, value))) {
    return createMessageWith(errorMessage);
  }
}

function validateArrayField(field, arr) {
  if (field.minItems && arr.length < field.minItems) {
    return 'model.validation.field.array.minItems';
  } else if (field.maxItems && arr.length > field.maxItems) {
    return 'model.validation.field.array.maxItems';
  } else if (field.uniqueItems && arr.length > oktaUnderscore.uniq(arr).length) {
    return Model.ERROR_IARRAY_UNIQUE;
  } else if (field.items) {
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

const props =
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
  // FIXME: preinitialize takes parameter `attributes` and `options`, which inherit from constructor.
  preinitialize: function (options, ...rest) {
    this.options = options || {};
    var schema = this['__schema__'] = {};
    var objectTypeFields = [];
    schema.computedProperties = {};
    schema.props = oktaUnderscore.clone(oktaUnderscore.result(this, 'props') || {});
    schema.derived = oktaUnderscore.clone(oktaUnderscore.result(this, 'derived') || {});
    schema.local = oktaUnderscore.clone(oktaUnderscore.result(this, 'local') || {});
    var defaults = {};

    oktaUnderscore.each(oktaUnderscore.extend({}, schema.props, schema.local), function (options, name) {
      var schemaDef = normalizeSchemaDef(options, name);

      if (!oktaUnderscore.isUndefined(schemaDef.value)) {
        defaults[name] = schemaDef.value;
      }

      if (schemaDef.type === 'object') {
        objectTypeFields.push(name);
      }
    }, this);

    if (oktaUnderscore.size(defaults)) {
      var localDefaults = oktaUnderscore.result(this, 'defaults');

      this.defaults = function () {
        return oktaUnderscore.defaults({}, defaults, localDefaults);
      };
    } // override `validate`


    this.validate = oktaUnderscore.wrap(this.validate, function (validate) {
      var args = oktaUnderscore.rest(arguments);

      var res = oktaUnderscore.extend(this._validateSchema.apply(this, args), validate.apply(this, args));

      return oktaUnderscore.size(res) && res || undefined;
    }); // override `parse`

    this.parse = oktaUnderscore.wrap(this.parse, function (parse) {
      var target = parse.apply(this, oktaUnderscore.rest(arguments));

      if (oktaUnderscore.result(this, 'flat')) {
        target = flatten(target, objectTypeFields);
      }

      return target;
    });
    Backbone.Model.prototype.preinitialize.call(this, options, ...rest);
  },
  // FIXME:
  // constructor takes parameter `attributes` and `options`.
  constructor: function () {
    Backbone.Model.apply(this, arguments);
    var schema = this['__schema__'];

    oktaUnderscore.each(schema.derived, function (options, name) {
      schema.computedProperties[name] = this.__getDerivedValue(name); // set initial value;

      var deps = isModelPropertySchema(options) ? options.deps || [] : [];

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
    var schema = this['__schema__'];

    var all = oktaUnderscore.extend({}, schema.props, schema.local);

    if (!oktaUnderscore.has(all, key)) {
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
    return oktaUnderscore.reduce([schema.props, schema.local], function (result, options) {
      return result || normalizeSchemaDef(options[propName], propName);
    }, null);
  },
  set: function (key, val) {
    var attrs;

    if (typeof key === 'object') {
      attrs = key;
    } else {
      (attrs = {})[key] = val;
    } // Don't override a computed properties


    oktaUnderscore.each(attrs, function (value, key) {
      if (oktaUnderscore.has(this['__schema__'].derived, key)) {
        throw new Error(`overriding derived properties is not supported: ${key}`);
      }
    }, this); // Schema validation


    var errorFields = [];

    oktaUnderscore.each(attrs, function (value, key) {
      this.allows(key) || errorFields.push(key);
    }, this);

    if (errorFields.length) {
      throw new Error(`field not allowed: ${errorFields.join(', ')}`);
    }

    return Backbone.Model.prototype.set.apply(this, arguments);
  },
  get: function (attr) {
    var schema = this['__schema__'];

    if (oktaUnderscore.has(schema.derived, attr)) {
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
  toJSON: function (options) {
    options || (options = {});

    var res = oktaUnderscore.clone(Backbone.Model.prototype.toJSON.apply(this, arguments));

    var schema = this['__schema__']; // cleanup local properties

    if (!options.verbose) {
      res = oktaUnderscore.omit(res, oktaUnderscore.keys(schema.local));
    } else {
      // add derived properties
      oktaUnderscore.each(schema.derived, function (options, name) {
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
    this.set(oktaUnderscore.result(this, 'defaults'), options);
  },

  /**
     * Is the data on the model has local modifications since the last sync event?
     * @return {Boolean} is the model in sync with the server
     */
  isSynced: function () {
    return oktaUnderscore.isEqual(this.__syncedData, this.toJSON());
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
    return oktaUnderscore.reduce(oktaUnderscore.extend({}, schema.props, schema.local), function (memo, options, name) {
      return oktaUnderscore.extend(memo, this.validateField(name) || {});
    }, {}, this);
  },
  __getDerivedValue: function (name) {
    var options = this['__schema__'].derived[name];

    if (oktaUnderscore.isString(options)) {
      var key = options;
      options = {
        deps: [key],
        fn: function () {
          return this.get(key);
        }
      };
    }

    var deps = options.deps || [];
    return options.fn.apply(this, oktaUnderscore.map(deps, this.get, this));
  }
};
Model = Backbone.Model.extend(props, statics);
/**
 * It's used for distinguishing the ambiguity from _.isFunction()
 * which returns True for both a JavaScript Class constructor function
 * and normal function. With this flag, we can tell a function is actually
 * a Model Class.
 * This flag is added in order to support the type of a parameter can be
 * either a Class or pure function that returns a Class.
 */

Model.isCourageModel = true;
var FrameworkModel = Model;

export { FrameworkModel as default, isModelPropertySchema };
