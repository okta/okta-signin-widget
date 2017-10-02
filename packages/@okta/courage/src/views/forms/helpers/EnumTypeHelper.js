/* eslint max-statements: 0 */
define([
  'okta/underscore',
  'okta/jquery',
  'shared/util/SchemaUtil'
], function (_, $, SchemaUtil) {
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
          params: {enumOneOf: enumOneOf},
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

  function isOneOfEnumHaveContent(values) {
    if (!isOneOfEnumObject(values)) {
      return false;
    }

    return _.all(values, function (value) {
      return $.trim(value.const) !== '' && $.trim(value.title) !== '';
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
      return _.chain(values)
        .filter(function (value) { return $.isPlainObject(value) && _.has(value, NAME); })
        .map(function (value) { return {const: value, title: value[NAME]}; })
        .value();
    }

    // Assume a legacy object array does not need special handling and just convert to const/title enum
    return convertEnumToOneOf(values);
  }

  function convertIndexToEnumIndex(index) {
    return `${ENUM_KEY_PREFIX}${index}`;
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
    var enumValue = this.options.params && _.isArray(this.options.params.enumOneOf) ?
      this.options.params.enumOneOf[index] : null;

    return _.has(enumValue, 'const') ? enumValue.const : enumValue;
  }

  function valuesToEnumObjects(values) {
    return _.map(values, valueToEnumObject.bind(this));
  }

  function enumObjectsToValues(values) {
    return _.map(values, enumObjectToValue.bind(this));
  }

  return {getEnumInputOptions: getEnumInputOptions,
    getDropdownOptions: getDropdownOptions,
    isOneOfEnumHaveContent: isOneOfEnumHaveContent,
    convertToOneOf: convertToOneOf
  };
});
