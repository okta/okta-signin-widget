define([
  'okta/underscore',
  'okta/jquery',
  'shared/util/SchemaUtil',
  '../inputs/SimpleCheckBoxSet'
], function (_, $, SchemaUtil, SimpleCheckBoxSet) {
  var NAME = 'name';

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
    var inputOptions = {
      name: config.name,
      label: config.title,
      readOnly: config.readOnly,
      customExplain: config.explain,
      options: getDropdownOptions(config.enumValues),
      params: {enumValues: config.enumValues}
    };

    // set input value convertor when enum is complex object type.
    if (config.displayType === SchemaUtil.DATATYPE.object) {
      inputOptions.to = valueToEnumObject;
      inputOptions.from = enumObjectToValue;
    } else if (config.displayType === SchemaUtil.ARRAYDISPLAYTYPE.arrayofobject) {
      inputOptions.to = function (xs) { return _.map(xs, valueToEnumObject, this); };
      inputOptions.from = function (ys) { return _.map(ys, enumObjectToValue, this); };
    }

    // input type
    if (SchemaUtil.isArrayDataType(config.displayType)) {
      inputOptions.input = SimpleCheckBoxSet;
    } else {
      inputOptions.type = 'select';
    }

    return inputOptions;

  }

  function getDropdownOptions(values) {

    if (!_.isArray(values)) {
      return {};
    }

    if (_.all(values, $.isPlainObject)) {
      return _.reduce(values, convertEnumObjectForOptions, {});
    } else {
      return _.object(values, values);
    }
  }

  function convertEnumObjectForOptions(memo, enumObj) {

    // Assume enum object always has "name" field (and uniq value) for displaying.
    // @see https://oktawiki.atlassian.net/wiki/display/eng/Schema+Property
    if ($.isPlainObject(enumObj) && enumObj.hasOwnProperty(NAME)) {
      var key = enumObjectToValue(enumObj),
          displayName = enumObj.name;
      memo[key] = displayName;
    }

    return memo;
  }

  function enumObjectToValue(obj) {
    return obj && obj[NAME];
  }

  function valueToEnumObject(val) {
    // @see `getEnumInputOptions` how enumValues has been set.
    if (this.options.params && _.isArray(this.options.params.enumValues)) {
      return _.find(this.options.params.enumValues, function (obj) {
        return obj[NAME] === val;
      });
    } else {
      // How could an enum type without enum values have been defined?
      // assume it's data problem and code mistake that override `options.params.enumValues`
      throw new Error('Can not find enum object from Enum Values list for key: ' + val);
    }
  }

  return {getEnumInputOptions: getEnumInputOptions,
    getDropdownOptions: getDropdownOptions
  };
});
