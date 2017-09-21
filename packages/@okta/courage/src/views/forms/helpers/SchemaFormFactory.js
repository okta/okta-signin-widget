/* eslint max-statements: 0, max-params: 0 */
define([
  'okta/underscore',
  'shared/util/StringUtil',
  '../inputs/BooleanSelect',
  '../inputs/TextBoxSet',
  './EnumTypeHelper',
], function (_, StringUtil, BooleanSelect, TextBoxSet, EnumTypeHelper) {
  // Maps each __displayType__ to a basic set of inputOptions.
  function defaultOptions(property) {
    /* eslint complexity: [2, 21] */
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
      inputOptions.params = {itemType: 'string'};
      break;
    case 'arrayofnumber':
      inputOptions.input = TextBoxSet;
      inputOptions.params = {itemType: 'number'};
      break;
    case 'arrayofinteger':
      inputOptions.input = TextBoxSet;
      inputOptions.params = {itemType: 'integer'};
      break;
    case 'arrayofobject':
      inputOptions.input = TextBoxSet;
      inputOptions.params = {itemType: property.get('items').type};
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
    return (string === '' ? null : number);
  }

  function isArray(type) {
    return (type && type.indexOf('array') >= 0);
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
        userValues = profile.get(name), //TODO: Not implemented
        fixedValues, values;

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
    createInputOptions: function (preparedSchemaProp) {
      var custom = customOptions(preparedSchemaProp),
          standard = defaultOptions(preparedSchemaProp);

      // underscore did not support nested extend
      // https://github.com/jashkenas/underscore/issues/162
      if (custom.params && standard.params) {
        custom.params = _.defaults(custom.params, standard.params);
      }
      return _.defaults(custom, standard);
    },

    hasValidSchemaProps: function (schemaProps, possibleValues) {
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
  };
});
