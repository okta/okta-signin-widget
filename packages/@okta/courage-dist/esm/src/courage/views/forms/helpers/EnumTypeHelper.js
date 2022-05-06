import oktaJQueryStatic from '../../../util/jquery-wrapper.js';
import oktaUnderscore from '../../../util/underscore-wrapper.js';
import SchemaUtils from '../../../util/SchemaUtil.js';
import StringUtil from '../../../util/StringUtil.js';

/* eslint max-statements: 0 */
const NAME = 'name';
const ENUM_KEY_PREFIX = '_enum_';
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
  const enumOneOf = convertToOneOf(config.enumValues);
  const inputOptions = {
    name: config.name,
    label: config.title,
    readOnly: config.readOnly,
    customExplain: config.explain,
    params: {
      enumOneOf: enumOneOf
    },
    options: getDropdownOptionsFromOneOf(enumOneOf)
  }; // input type

  if (SchemaUtils.isArrayDataType(config.displayType)) {
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
  return oktaUnderscore.isArray(values) ? getDropdownOptionsFromOneOf(convertToOneOf(values)) : {};
}

function getDropdownOptionsFromOneOf(values) {
  if (!isOneOfEnumObject(values)) {
    return {};
  }

  return oktaUnderscore.reduce(values, function (options, value, index) {
    options[convertIndexToEnumIndex(index)] = value.title;
    return options;
  }, {});
}

function convertToOneOf(values) {
  // assume this is a legacy enum array and convert to oneOf object
  if (!oktaUnderscore.all(values, oktaJQueryStatic.isPlainObject)) {
    return convertEnumToOneOf(values); // we assume object without const and title is an enum object which need special conversion
  } else if (!isOneOfEnumObject(values)) {
    return convertEnumObjectToOneOf(values);
  }

  return values;
}

function isOneOfEnumObject(values) {
  return oktaUnderscore.isArray(values) && oktaUnderscore.all(values, function (value) {
    return oktaUnderscore.has(value, 'const') && oktaUnderscore.has(value, 'title');
  });
}

function convertEnumToOneOf(values) {
  return oktaUnderscore.map(values, function (value) {
    return {
      const: value,
      title: valueToTitle(value)
    };
  });
}

function valueToTitle(value) {
  if (oktaUnderscore.isObject(value)) {
    return JSON.stringify(value);
  }

  if (oktaUnderscore.isNumber(value)) {
    return value + '';
  }

  return value;
}

function convertEnumObjectToOneOf(values) {
  const findKey = oktaUnderscore.partial(oktaUnderscore.has, oktaUnderscore, NAME); // If all object found the key NAME, use the NAME's value as display name


  if (oktaUnderscore.all(values, findKey)) {
    return oktaUnderscore.chain(values).filter(function (value) {
      return oktaJQueryStatic.isPlainObject(value) && oktaUnderscore.has(value, NAME);
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
  return `${ENUM_KEY_PREFIX}${index}`;
}

function enumObjectToValue(obj) {
  const index = oktaUnderscore.findIndex(this.options.params.enumOneOf, function (oneOfObj) {
    return oktaUnderscore.isObject(obj) ? oktaUnderscore.isEqual(oneOfObj.const, obj) : oneOfObj.const === obj;
  }); // Cannot rely on comparator in findIndex when compare objects so need special handling


  return index > -1 ? convertIndexToEnumIndex(index) : obj;
}

function valueToEnumObject(val) {
  if (!oktaUnderscore.isString(val) || val.indexOf(ENUM_KEY_PREFIX) !== 0) {
    return val;
  }

  const index = val.replace(ENUM_KEY_PREFIX, '');
  const enumValue = this.options.params && oktaUnderscore.isArray(this.options.params.enumOneOf) ? this.options.params.enumOneOf[index] : null; // @see `getEnumInputOptions` how enumValues has been set.

  return oktaUnderscore.has(enumValue, 'const') ? enumValue.const : enumValue;
}

function valuesToEnumObjects(values) {
  return oktaUnderscore.map(values, valueToEnumObject.bind(this));
}

function enumObjectsToValues(values) {
  return oktaUnderscore.map(values, enumObjectToValue.bind(this));
}

function isStringConstraint(value) {
  return oktaUnderscore.isString(value) && oktaJQueryStatic.trim(value) !== '';
}

function isNumberConstraint(value) {
  return oktaUnderscore.isNumber(value) || oktaUnderscore.isNumber(StringUtil.parseFloat(oktaJQueryStatic.trim(value)));
}

function isIntegerConstraint(value) {
  const integer = oktaUnderscore.isNumber(value) ? value : StringUtil.parseInt(oktaJQueryStatic.trim(value));
  return typeof integer === 'number' && isFinite(integer) && Math.floor(integer) === integer;
}

function isObjectConstraint(value) {
  if (oktaUnderscore.isObject(value) && !oktaUnderscore.isArray(value)) {
    return true;
  }

  const object = StringUtil.parseObject(oktaJQueryStatic.trim(value));
  return oktaUnderscore.isObject(object) && !oktaUnderscore.isArray(object);
}

function isConstraintValueMatchType(value, type) {
  switch (type) {
    case SchemaUtils.STRING:
      return isStringConstraint(value);

    case SchemaUtils.NUMBER:
      return isNumberConstraint(value);

    case SchemaUtils.INTEGER:
      return isIntegerConstraint(value);

    case SchemaUtils.OBJECT:
      return isObjectConstraint(value);
  }
}

var EnumTypeHelper = {
  getEnumInputOptions: getEnumInputOptions,
  getDropdownOptions: getDropdownOptions,
  convertToOneOf: convertToOneOf,
  isConstraintValueMatchType: isConstraintValueMatchType
};

export { EnumTypeHelper as default };
