import oktaJQueryStatic from '../util/jquery-wrapper.js';
import oktaUnderscore from '../util/underscore-wrapper.js';
import BaseCollection from './BaseCollection.js';
import BaseModel from './BaseModel.js';
import Logger from '../util/Logger.js';
import SchemaUtils from '../util/SchemaUtil.js';
import StringUtil from '../util/StringUtil.js';
import EnumTypeHelper from '../views/forms/helpers/EnumTypeHelper.js';

/* eslint-disable @okta/okta/no-exclusive-language */
const loc = StringUtil.localize;
const STRING = SchemaUtils.STRING;
const NUMBER = SchemaUtils.NUMBER;
const INTEGER = SchemaUtils.INTEGER;
const OBJECT = SchemaUtils.OBJECT;

const getArrayTypeName = function (type, elementType) {
  return type + 'of' + elementType;
};

const SchemaPropertySubSchema = BaseModel.extend({
  defaults: {
    description: undefined,
    minLength: undefined,
    maxLength: undefined,
    format: undefined
  },
  parse: function (resp) {
    if (oktaUnderscore.isString(resp.format)) {
      const matcher = /^\/(.+)\/$/.exec(resp.format);

      if (matcher) {
        resp.format = matcher[1];
      }
    }

    return resp;
  }
});
const SchemaPropertySubSchemaCollection = BaseCollection.extend({
  model: SchemaPropertySubSchema
});
const SchemaPropertySubSchemaAllOfCollection = SchemaPropertySubSchemaCollection.extend({
  _type: 'allOf'
});
const SchemaPropertySubSchemaOneOfCollection = SchemaPropertySubSchemaCollection.extend({
  _type: 'oneOf'
});
const SchemaPropertySubSchemaNoneOfCollection = SchemaPropertySubSchemaCollection.extend({
  _type: 'noneOf'
});
const constraintTypeErrorMessages = {
  string: loc('schema.validation.field.value.must.string', 'courage'),
  number: loc('schema.validation.field.value.must.number', 'courage'),
  integer: loc('schema.validation.field.value.must.integer', 'courage'),
  object: loc('schema.validation.field.value.must.object', 'courage')
};
const loginFormatNonePattern = '.+';
const escapedLoginCharsRe = /[^a-zA-Z0-9-]/;
const constraintHandlers = {
  between: '_checkBetweenConstraints',
  greaterThan: '_checkGreaterThanConstraint',
  lessThan: '_checkLessThanConstraint',
  equals: '_checkEqualsConstraint'
};
const SchemaPropertySchemaProperty = BaseModel.extend({
  idAttribute: 'name',
  local: {
    __oneOf__: {
      type: 'array',
      minItems: 1
    }
  },
  defaults: {
    // OKTA-28445, set empty string by default as the key for each property when syncing with server
    // so that server can respond with error when a name is not provided
    name: '',
    title: undefined,
    type: undefined,
    description: undefined,
    required: false,
    format: undefined,
    // choose disable option be default.
    union: undefined,
    subSchemas: undefined,
    settings: {
      permissions: {
        SELF: SchemaUtils.PERMISSION.READ_ONLY
      }
    },
    unique: undefined,
    __metadata__: undefined,
    __isSensitive__: BaseModel.ComputedProperty(['settings'], function (settings) {
      return !!(settings && settings.sensitive && settings.sensitive !== 'NOT_SENSITIVE');
    }),
    __isPendingSensitive__: BaseModel.ComputedProperty(['settings'], function (settings) {
      return !!(settings && settings.sensitive && settings.sensitive === 'PENDING_SENSITIVE');
    }),
    __unique__: false,
    __isUniqueValidated__: BaseModel.ComputedProperty(['unique'], function (unique) {
      return unique === SchemaUtils.UNIQUENESS.UNIQUE_VALIDATED;
    }),
    __isPendingUniqueness__: BaseModel.ComputedProperty(['unique'], function (unique) {
      return unique === SchemaUtils.UNIQUENESS.PENDING_UNIQUENESS;
    }),
    __isUniqueness__: BaseModel.ComputedProperty(['__isUniqueValidated__', '__isPendingUniqueness__'], function (isValidated, isPending) {
      return isValidated || isPending;
    }),
    __canBeSensitive__: BaseModel.ComputedProperty(['__metadata__'], function (metadata) {
      return !!(metadata && metadata.sensitivizable);
    }),
    __userPermission__: SchemaUtils.PERMISSION.READ_ONLY,
    __displayType__: undefined,
    __displayTypeLabel__: BaseModel.ComputedProperty(['__displayType__'], function (displayType) {
      return SchemaUtils.DATATYPE[displayType] || displayType;
    }),
    __supportsMinMax__: false,
    // use the private naming convention for these computed properties,
    // to deal with the complexity in cloning schema with properties (toJSON({verbose: true})),
    // to make sure these attributes are being excluded from api request
    __isReadOnly__: BaseModel.ComputedProperty(['mutability'], function (mutability) {
      return mutability === SchemaUtils.MUTABILITY.READONLY;
    }),
    __isWriteOnly__: BaseModel.ComputedProperty(['mutability'], function (mutability) {
      return mutability === SchemaUtils.MUTABILITY.WRITEONLY;
    }),
    __displayScope__: undefined,
    __isScopeSelf__: BaseModel.ComputedProperty(['scope'], function (scope) {
      return scope === SchemaUtils.SCOPE.SELF;
    }),
    __isNoneScopeArrayType__: BaseModel.ComputedProperty(['__isScopeSelf__', '__displayType__'], function (isScopeSelf, displayType) {
      return !isScopeSelf && SchemaUtils.isArrayDataType(displayType);
    }),
    __isImported__: BaseModel.ComputedProperty(['externalName'], function (externalName) {
      return !!externalName;
    }),
    __isFromBaseSchema__: BaseModel.ComputedProperty(['__schemaMeta__'], function (schemaMeta) {
      return schemaMeta && schemaMeta.name === 'base';
    }),
    // Only UI can turn on __enumDefined__ and reprocess the enum/oneOf value; otherwise,
    // it should leave existing value untouch
    __enumDefined__: false,
    __supportEnum__: BaseModel.ComputedProperty(['__displayType__'], function (displayType) {
      return oktaUnderscore.contains(SchemaUtils.SUPPORTENUM, displayType);
    }),
    __isNumberTypeEnum__: BaseModel.ComputedProperty(['__displayType__'], function (displayType) {
      return oktaUnderscore.contains([SchemaUtils.NUMBER, SchemaUtils.ARRAYDISPLAYTYPE.arrayofnumber], displayType);
    }),
    __isIntegerTypeEnum__: BaseModel.ComputedProperty(['__displayType__'], function (displayType) {
      return oktaUnderscore.contains([SchemaUtils.INTEGER, SchemaUtils.ARRAYDISPLAYTYPE.arrayofinteger], displayType);
    }),
    __isObjectTypeEnum__: BaseModel.ComputedProperty(['__displayType__'], function (displayType) {
      return oktaUnderscore.contains([SchemaUtils.OBJECT, SchemaUtils.ARRAYDISPLAYTYPE.arrayofobject], displayType);
    }),
    __isStringTypeEnum__: BaseModel.ComputedProperty(['__displayType__'], function (displayType) {
      return oktaUnderscore.contains([SchemaUtils.STRING, SchemaUtils.ARRAYDISPLAYTYPE.arrayofstring], displayType);
    }),
    __enumConstraintType__: BaseModel.ComputedProperty(['__isStringTypeEnum__', '__isNumberTypeEnum__', '__isIntegerTypeEnum__', '__isObjectTypeEnum__'], function (isStringType, isNumberType, isIntegerType, isObjectType) {
      if (isStringType) {
        return STRING;
      }

      if (isNumberType) {
        return NUMBER;
      }

      if (isIntegerType) {
        return INTEGER;
      }

      if (isObjectType) {
        return OBJECT;
      }
    }),
    __isEnumDefinedAndSupported__: BaseModel.ComputedProperty(['__enumDefined__', '__supportEnum__'], function (enumDefined, supportEnum) {
      return enumDefined && supportEnum;
    }),
    __isLoginOfBaseSchema__: BaseModel.ComputedProperty(['__isFromBaseSchema__', 'name'], function (isFromBaseSchema, name) {
      return isFromBaseSchema && name === 'login';
    }),
    __isLoginFormatRestrictionToEmail__: BaseModel.ComputedProperty(['__loginFormatRestriction__'], function (loginFormatRestriction) {
      return loginFormatRestriction === SchemaUtils.LOGINPATTERNFORMAT.EMAIL;
    })
  },
  initialize: function () {
    BaseModel.prototype.initialize.apply(this, arguments);
    this.listenTo(this, 'change:__displayType__', this._updateTypeFormatConstraints);
    this.listenTo(this, 'change:type change:format change:items', this._updateDisplayType);
    this.listenTo(this, 'change:__minVal__ change:__maxVal__', this._updateMinMax);
    this.listenTo(this, 'change:__equals__', this._convertEqualsToMinMax);
    this.listenTo(this, 'change:__constraint__', this._setConstraintText);

    this._setConstraintText();

    this._setLoginPattern();
  },
  parse: function (resp) {
    /* eslint complexity: [2, 9] */
    resp = oktaUnderscore.clone(resp);

    if (resp.type === 'object' && resp.extendedType === 'image') {
      resp.type = 'image';
    }

    resp['__displayType__'] = SchemaUtils.getDisplayType(resp.type, resp.format, resp.items ? resp.items.format ? resp.items.format : resp.items.type : undefined);

    this._setRangeConstraints(resp);

    resp['__supportsMinMax__'] = SchemaUtils.SUPPORTSMINMAX.indexOf(resp['__displayType__']) !== -1;
    resp['__displayScope__'] = SchemaUtils.DISPLAYSCOPE[resp.scope] || SchemaUtils.DISPLAYSCOPE.NA;

    if (resp.settings && resp.settings.permissions && resp.settings.permissions.SELF) {
      resp['__userPermission__'] = resp.settings.permissions.SELF;
    }

    this._setMasterOverride(resp);

    this._setSubSchemas(resp);

    this._setUniqueness(resp);

    return resp;
  },
  validate: function () {
    const enumValidationError = this._validateEnumOneOf();

    if (enumValidationError) {
      return enumValidationError;
    }

    if (!this.get('__supportsMinMax__') || !this.get('__constraint__')) {
      return undefined;
    }

    const constraitType = this.get('__constraint__');
    const constraitHandler = this[constraintHandlers[constraitType]];

    if (oktaUnderscore.isFunction(constraitHandler)) {
      return constraitHandler.call(this);
    } else {
      Logger.warn('No constraint handler found for: ' + constraitType);
      return undefined;
    }
  },
  _checkBetweenConstraints: function () {
    const minVal = this.get('__minVal__');
    const maxVal = this.get('__maxVal__');

    if (!minVal && !maxVal) {
      return;
    }

    if (!minVal) {
      return {
        __minVal__: 'Min value is required'
      };
    }

    if (!maxVal) {
      return {
        __maxVal__: 'Max value is required'
      };
    }

    let val = this._checkIntegerConstraints('__minVal__', 'Min value');

    if (val) {
      return val;
    }

    val = this._checkIntegerConstraints('__maxVal__', 'Max value');

    if (val) {
      return val;
    }

    if (+minVal >= +maxVal) {
      return {
        __maxVal__: 'Max val must be greater than min val'
      };
    }
  },
  _checkGreaterThanConstraint: function () {
    const minVal = this.get('__minVal__');

    if (!minVal) {
      return;
    }

    const val = this._checkIntegerConstraints('__minVal__', 'Min value');

    if (val) {
      return val;
    }
  },
  _checkLessThanConstraint: function () {
    const maxVal = this.get('__maxVal__');

    if (!maxVal) {
      return;
    }

    const val = this._checkIntegerConstraints('__maxVal__', 'Max value');

    if (val) {
      return val;
    }
  },
  _checkEqualsConstraint: function () {
    const equals = this.get('__equals__');

    if (!equals) {
      return;
    }

    const val = this._checkIntegerConstraints('__equals__', 'Constraint');

    if (val) {
      return val;
    }
  },
  _checkIntegerConstraints: function (field, name) {
    const val = this.get(field);
    const error = {}; // eslint-disable-next-line no-restricted-globals

    if (isNaN(val)) {
      error[field] = name + ' must be a number';
      return error;
    }

    if (+val < 0) {
      error[field] = name + ' must be greater than 0';
      return error;
    }
  },
  _setMasterOverride: function (resp) {
    if (resp.settings && resp.settings.masterOverride && resp.settings.masterOverride) {
      const masterOverrideValue = resp.settings.masterOverride.value;

      if (oktaUnderscore.isArray(masterOverrideValue) && !oktaUnderscore.isEmpty(masterOverrideValue)) {
        resp['__masterOverrideType__'] = 'OVERRIDE';
        resp['__masterOverrideValue__'] = masterOverrideValue || [];
      } else {
        resp['__masterOverrideType__'] = resp.settings.masterOverride.type;
      }
    } else {
      resp['__masterOverrideType__'] = 'INHERIT';
    }
  },
  _setRangeConstraints: function (resp) {
    /* eslint complexity: [2, 11] */
    if (resp['__displayType__'] === STRING) {
      resp['__minVal__'] = resp.minLength;
      resp['__maxVal__'] = resp.maxLength;
    } else if (resp['__displayType__'] === INTEGER || resp['__displayType__'] === NUMBER) {
      resp['__minVal__'] = resp.minimum;
      resp['__maxVal__'] = resp.maximum;
    }

    if (resp['__minVal__'] && resp['__maxVal__']) {
      if (resp['__minVal__'] === resp['__maxVal__']) {
        resp['__constraint__'] = 'equals';
        resp['__equals__'] = resp['__minVal__'];
      } else {
        resp['__constraint__'] = 'between';
      }
    } else if (!resp['__minVal__'] && resp['__maxVal__']) {
      resp['__constraint__'] = 'lessThan';
    } else if (!resp['__maxVal__'] && resp['__minVal__']) {
      resp['__constraint__'] = 'greaterThan';
    }
  },
  _setSubSchemas: function (resp) {
    if (resp.allOf) {
      resp['subSchemas'] = new SchemaPropertySubSchemaAllOfCollection(resp.allOf, {
        parse: true
      });
    } else if (resp.oneOf) {
      resp['subSchemas'] = new SchemaPropertySubSchemaOneOfCollection(resp.oneOf, {
        parse: true
      });
    } else if (resp.noneOf) {
      resp['subSchemas'] = new SchemaPropertySubSchemaNoneOfCollection(resp.noneOf, {
        parse: true
      });
    }
  },
  _setUniqueness: function (resp) {
    const unique = resp && resp.unique;
    resp['__unique__'] = !!(unique && (unique === SchemaUtils.UNIQUENESS.UNIQUE_VALIDATED || unique === SchemaUtils.UNIQUENESS.PENDING_UNIQUENESS));
  },
  _setLoginPattern: function () {
    if (!this.get('__isLoginOfBaseSchema__')) {
      return;
    }

    const pattern = this.get('pattern');

    if (pattern === loginFormatNonePattern) {
      this.set('__loginFormatRestriction__', SchemaUtils.LOGINPATTERNFORMAT.NONE);
    } else if (pattern) {
      this.set('__loginFormatRestriction__', SchemaUtils.LOGINPATTERNFORMAT.CUSTOM);
      this.set('__loginFormatRestrictionCustom__', this._extractLoginPattern(pattern));
    } else {
      this.set('__loginFormatRestriction__', SchemaUtils.LOGINPATTERNFORMAT.EMAIL);
    }
  },
  _updateDisplayType: function () {
    const type = this.get('type');

    if (type === STRING && this.get('format')) {
      this.set('__displayType__', SchemaUtils.FORMATDISPLAYTYPE[this.get('format')]);
    } else {
      const items = this.get('items');
      const arraytype = items && (items.format ? items.format : items.type);

      if (type && arraytype) {
        this.set('__displayType__', SchemaUtils.ARRAYDISPLAYTYPE[getArrayTypeName(type, arraytype)]);
      } else {
        this.set('__displayType__', type);
      }
    }
  },
  _validateEnumOneOf: function () {
    if (!this.get('__isEnumDefinedAndSupported__')) {
      return;
    }

    const enumOneOf = this.get('__oneOf__') || [];

    if (oktaUnderscore.isEmpty(enumOneOf)) {
      return {
        __oneOf__: loc('model.validation.field.blank', 'courage')
      };
    }

    if (!this._isValidateOneOfConstraint(enumOneOf)) {
      const constraintType = this.get('__enumConstraintType__');
      const errorTypeMsg = constraintTypeErrorMessages[constraintType];
      return {
        __oneOf__: errorTypeMsg
      };
    }
  },
  _isValidateOneOfConstraint: function (values) {
    const constraintType = this.get('__enumConstraintType__');
    return oktaUnderscore.all(values, function (value) {
      return EnumTypeHelper.isConstraintValueMatchType(value.const, constraintType);
    });
  },
  toJSON: function () {
    let json = BaseModel.prototype.toJSON.apply(this, arguments);
    json.settings = {
      permissions: {}
    };
    json.settings.permissions['SELF'] = this.get('__userPermission__'); // omit "sensitive" filed will have default it value to false.

    if (this.get('__isSensitive__')) {
      json.settings.sensitive = this.get('__isSensitive__');
    }

    if (this.get('type') === 'image') {
      json.type = 'object';
      json.extendedType = 'image';
    }

    json = this._enumAssignment(json);
    json = this._attributeOverrideToJson(json);
    json = this._normalizeUnionValue(json);
    json = this._patternAssignment(json);
    json = this._uniquenessAssignment(json);
    return json;
  },
  _attributeOverrideToJson: function (json) {
    const masterOverrideType = this.get('__masterOverrideType__');
    const masterOverrideValue = this.get('__masterOverrideValue__');

    if (masterOverrideType === 'OKTA_MASTERED') {
      json.settings.masterOverride = {
        type: 'OKTA_MASTERED'
      };
    } else if (masterOverrideType === 'OVERRIDE') {
      json.settings.masterOverride = {
        type: 'ORDERED_LIST',
        value: []
      };

      if (masterOverrideValue instanceof BaseCollection) {
        oktaUnderscore.each(masterOverrideValue.toJSON(), function (overrideProfile) {
          json.settings.masterOverride.value.push(overrideProfile.id);
        });
      } else if (masterOverrideValue instanceof Array) {
        json.settings.masterOverride.value = masterOverrideValue;
      }

      if (oktaUnderscore.isEmpty(json.settings.masterOverride.value)) {
        delete json.settings.masterOverride;
      }
    }

    if (masterOverrideType === 'INHERIT') {
      delete json.settings.masterOverride;
    }

    return json;
  },

  /**
   * Only allow set "union" value when isScopeSelf is NONE and displayType is
   * array of (string/number/integer), otherwise reset to default.
   *
   * @see /universal-directory/shared/views/components/UnionGroupValuesRadio.js
   */
  _normalizeUnionValue: function (json) {
    if (!this.get('__isNoneScopeArrayType__')) {
      json['union'] = undefined;
    }

    return json;
  },
  _enumAssignment: function (json) {
    if (!this.get('__isEnumDefinedAndSupported__')) {
      return json;
    } // backfill empty title by constraint


    const enumOneOf = this._getEnumOneOfWithTitleCheck();

    if (this.get('type') === 'array') {
      delete json.items.enum;
      json.items.oneOf = enumOneOf;
    } else {
      delete json.enum;
      json.oneOf = enumOneOf;
    }

    return json;
  },
  _patternAssignment: function (json) {
    if (!this.get('__isLoginOfBaseSchema__') || !this.get('__loginFormatRestriction__')) {
      return json;
    }

    switch (this.get('__loginFormatRestriction__')) {
      case SchemaUtils.LOGINPATTERNFORMAT.EMAIL:
        delete json.pattern;
        break;

      case SchemaUtils.LOGINPATTERNFORMAT.CUSTOM:
        json.pattern = this._buildLoginPattern(this.get('__loginFormatRestrictionCustom__'));
        break;

      case SchemaUtils.LOGINPATTERNFORMAT.NONE:
        json.pattern = loginFormatNonePattern;
        break;
    }

    return json;
  },
  _uniquenessAssignment: function (json) {
    if (!this.get('__unique__')) {
      delete json.unique;
    } else if (!this.get('__isUniqueness__')) {
      json.unique = SchemaUtils.UNIQUENESS.UNIQUE_VALIDATED;
    }

    return json;
  },

  /**
   * Character should be escaped except letters, digits and hyphen
   */
  _escapedRegexChar: function (pattern, index) {
    const char = pattern.charAt(index);

    if (escapedLoginCharsRe.test(char)) {
      return '\\' + char;
    }

    return char;
  },
  _buildLoginPattern: function (pattern) {
    let result = '';

    for (var i = 0; i < pattern.length; i++) {
      result += this._escapedRegexChar(pattern, i);
    }

    return '[' + result + ']+';
  },
  _extractLoginPattern: function (pattern) {
    const re = /^\[(.*)\]\+/;
    const matches = pattern.match(re);
    return matches ? matches[1].replace(/\\(.)/g, '$1') : pattern;
  },
  _getEnumOneOfWithTitleCheck: function () {
    const enumOneOf = this.get('__oneOf__');
    return oktaUnderscore.map(enumOneOf, function (value) {
      if (oktaJQueryStatic.trim(value.title) !== '') {
        return value;
      }

      value.title = !oktaUnderscore.isString(value.const) ? JSON.stringify(value.const) : value.const;
      return value;
    });
  },
  _updateTypeFormatConstraints: function () {
    const displayType = this.get('__displayType__'); // OKTA-31952 reset format according to its displayType

    this.unset('format', {
      silent: true
    });
    this.unset('items', {
      silent: true
    });
    this.set(SchemaUtils.DISPLAYTYPES[displayType]);

    if (displayType !== NUMBER && displayType !== INTEGER) {
      this.unset('minimum');
      this.unset('maximum');
    }

    if (displayType !== STRING) {
      this.unset('minLength');
      this.unset('maxLength');
    }

    this.unset('__minVal__');
    this.unset('__maxVal__');
    this.unset('__equals__');
    this.set('__supportsMinMax__', SchemaUtils.SUPPORTSMINMAX.indexOf(this.get('__displayType__')) !== -1);
  },
  _updateMinMax: function () {
    let min;
    let max;
    const displayType = this.get('__displayType__');

    if (displayType === STRING) {
      min = 'minLength';
      max = 'maxLength';
    } else if (displayType === INTEGER || displayType === NUMBER) {
      min = 'minimum';
      max = 'maximum';
    }

    if (this.get('__minVal__')) {
      this.set(min, parseInt(this.get('__minVal__'), 10));
    } else {
      this.unset(min);
    }

    if (this.get('__maxVal__')) {
      this.set(max, parseInt(this.get('__maxVal__'), 10));
    } else {
      this.unset(max);
    }
  },
  _convertEqualsToMinMax: function () {
    const equals = this.get('__equals__');

    if (equals) {
      this.set('__minVal__', equals);
      this.set('__maxVal__', equals);
    }
  },

  /*
   Normally we would use a derived property here but derived properties do not work with the model Clone function
   so we use this workaround instead.
   */
  _setConstraintText: function () {
    const constraint = this.get('__constraint__');
    const min = this.get('__minVal__');
    const max = this.get('__maxVal__');
    const equals = this.get('__equals__');

    switch (constraint) {
      case 'between':
        this.set('__constraintText__', 'Between ' + min + ' and ' + max);
        break;

      case 'greaterThan':
        this.set('__constraintText__', 'Greater than ' + min);
        break;

      case 'lessThan':
        this.set('__constraintText__', 'Less than ' + max);
        break;

      case 'equals':
        this.set('__constraintText__', 'Equals ' + equals);
        break;

      default:
        this.set('__constraintText__', '');
        break;
    }
  },
  cleanup: function () {
    if (this.get('__constraint__') === 'lessThan') {
      this.unset('__minVal__');
    } else if (this.get('__constraint__') === 'greaterThan') {
      this.unset('__maxVal__');
    }

    if (this.get('scope') !== SchemaUtils.SCOPE.SYSTEM) {
      if (this.get('__isScopeSelf__') === true) {
        this.set({
          scope: SchemaUtils.SCOPE.SELF
        }, {
          silent: true
        });
      } else {
        this.unset('scope');
      }
    }

    if (!this.get('__unique__')) {
      this.unset('unique');
    }
  },

  /**
   * Since there is not an dedicated attribute to flag enum type,
   * use enum values to determine whether the property is enum type or not.
   */
  isEnumType: function () {
    return !!this.getEnumValues();
  },
  getEnumValues: function () {
    return this.get('oneOf') || this.get('enum') || this.get('items') && this.get('items')['oneOf'] || this.get('items') && this.get('items')['enum'];
  },
  detectHasEnumDefined: function () {
    const enumValues = this.getEnumValues();

    if (!enumValues) {
      return;
    }

    this.set('__oneOf__', EnumTypeHelper.convertToOneOf(enumValues));
    this.set('__enumDefined__', true);
  }
});
const SchemaPropertySchemaProperties = BaseCollection.extend({
  model: SchemaPropertySchemaProperty,
  clone: function () {
    return new this.constructor(this.toJSON({
      verbose: true
    }), {
      parse: true
    });
  },
  areAllReadOnly: function () {
    return oktaUnderscore.all(this.pluck('__isReadOnly__'));
  },
  createModelProperties: function () {
    return this.reduce(function (p, schemaProperty) {
      const type = schemaProperty.get('type');
      p[schemaProperty.id] = oktaUnderscore.clone(SchemaUtils.DISPLAYTYPES[type]);

      if (SchemaUtils.SUPPORTSMINMAX.indexOf(type) !== -1) {
        p[schemaProperty.id].minLength = schemaProperty.get('minLength');
        p[schemaProperty.id].maxLength = schemaProperty.get('maxLength');
      }

      if (type === 'string') {
        p[schemaProperty.id].format = schemaProperty.get('format');
      }

      return p;
    }, {});
  }
});
var SchemaProperty = {
  Model: SchemaPropertySchemaProperty,
  Collection: SchemaPropertySchemaProperties
};

export { SchemaProperty as default };
