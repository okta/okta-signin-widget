/* eslint max-statements: [2, 15], complexity: [2, 8] */
define([
  'okta/underscore',
  'shared/models/BaseCollection',
  'shared/models/BaseModel',
  'shared/util/Logger',
  'shared/util/SchemaUtil'
], function (_, BaseCollection, BaseModel, Logger, SchemaUtil) {

  var STRING = SchemaUtil.STRING,
      NUMBER = SchemaUtil.NUMBER,
      INTEGER = SchemaUtil.INTEGER;

  var getArrayTypeName = function (type, elementType) {
    return type + 'of' + elementType;
  };

  var SubSchema = BaseModel.extend({
    defaults: {
      description: undefined,
      minLength: undefined,
      maxLength: undefined,
      format: undefined
    },
    parse: function (resp) {
      if (_.isString(resp.format)) {
        var matcher = /^\/(.+)\/$/.exec(resp.format);
        if (matcher) {
          resp.format = matcher[1];
        }
      }
      return resp;
    }
  });

  var SubSchemaCollection = BaseCollection.extend({
    model: SubSchema
  });

  var SubSchemaAllOfCollection = SubSchemaCollection.extend({
    _type: 'allOf'
  });

  var SubSchemaOneOfCollection = SubSchemaCollection.extend({
    _type: 'oneOf'
  });

  var SubSchemaNoneOfCollection = SubSchemaCollection.extend({
    _type: 'noneOf'
  });

  var SchemaProperty = BaseModel.extend({

    constraintHandlers: {
      between: '_checkBetweenConstraints',
      greaterThan: '_checkGreaterThanConstraint',
      lessThan: '_checkLessThanConstraint',
      equals: '_checkEqualsConstraint'
    },

    idAttribute: 'name',

    defaults: {
      // OKTA-28445, set empty string by default as the key for each property when sycn with server
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
      settings: {permissions: {SELF: SchemaUtil.PERMISSION.READ_ONLY}},
      '__isSensitive__': BaseModel.ComputedProperty(['settings'], function (settings) {
        return !!(settings && settings.sensitive);
      }),
      '__userPermission__': SchemaUtil.PERMISSION.READ_ONLY,
      '__displayType__': undefined,
      '__displayTypeLabel__': BaseModel.ComputedProperty(['__displayType__'], function (displayType) {
        return SchemaUtil.DATATYPE[displayType] || displayType;
      }),
      '__supportsMinMax__': false,
      // use the private naming convention for these computed properties,
      // to deal with the complexity in cloning schema with properties (toJSON({verbose: true})),
      // to make sure these attributes are being excluded from api request
      '__isReadOnly__': BaseModel.ComputedProperty(['mutability'], function (mutability) {
        return mutability === SchemaUtil.MUTABILITY.READONLY;
      }),
      '__isWriteOnly__': BaseModel.ComputedProperty(['mutability'], function (mutability) {
        return mutability === SchemaUtil.MUTABILITY.WRITEONLY;
      }),
      '__displayScope__': undefined,
      '__isScopeSelf__': BaseModel.ComputedProperty(['scope'], function (scope) {
        return scope === SchemaUtil.SCOPE.SELF;
      }),
      '__isNoneScopeArrayType__': BaseModel.ComputedProperty(
        ['__isScopeSelf__', '__displayType__'],
        function (isScopeSelf, displayType) {
          return !isScopeSelf && SchemaUtil.isArrayDataType(displayType);
        }),
      '__isImported__': BaseModel.ComputedProperty(['externalName'], function (externalName) {
        return !!externalName;
      }),
      '__isFromBaseSchema__': BaseModel.ComputedProperty(['__schemaMeta__'], function (schemaMeta) {
        return schemaMeta && schemaMeta.name === 'base';
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
    },

    parse: function (resp) {
      resp = _.clone(resp);

      if (resp.type === 'object' && resp.extendedType === 'image') {
        resp.type = 'image';
      }
      resp['__displayType__'] = SchemaUtil.getDisplayType(
        resp.type, resp.format, resp.items ? resp.items.type : undefined
      );
      this._setRangeConstraints(resp);
      resp['__supportsMinMax__'] = SchemaUtil.SUPPORTSMINMAX.indexOf(resp['__displayType__']) != -1;
      resp['__displayScope__'] = SchemaUtil.DISPLAYSCOPE[resp.scope] || SchemaUtil.DISPLAYSCOPE.NA;
      if (resp.settings && resp.settings.permissions && resp.settings.permissions.SELF) {
        resp['__userPermission__'] = resp.settings.permissions.SELF;
      }
      this._setMasterOverride(resp);
      this._setSubSchemas(resp);
      return resp;
    },

    validate: function () {
      if (!this.get('__supportsMinMax__') || !this.get('__constraint__')) {
        return undefined;
      }

      var constraitType = this.get('__constraint__'),
          constraitHandler = this[this.constraintHandlers[constraitType]];

      if (_.isFunction(constraitHandler)) {
        return constraitHandler.call(this);
      } else {
        Logger.warn('No constraint handler found for: ' + constraitType);
        return undefined;
      }
    },

    _checkBetweenConstraints: function () {
      var minVal = this.get('__minVal__'),
          maxVal = this.get('__maxVal__');

      if (!minVal && !maxVal) {
        return;
      }
      if (!minVal) {
        return {'__minVal__': 'Min value is required'};
      }
      if (!maxVal) {
        return {'__maxVal__': 'Max value is required'};
      }
      var val = this._checkIntegerConstraints('__minVal__', 'Min value');
      if (val) {
        return val;
      }
      val = this._checkIntegerConstraints('__maxVal__', 'Max value');
      if (val) {
        return val;
      }
      if (+minVal >= +maxVal) {
        return {'__maxVal__': 'Max val must be greater than min val'};
      }
    },

    _checkGreaterThanConstraint: function () {
      var minVal = this.get('__minVal__');
      if (!minVal) {
        return;
      }
      var val = this._checkIntegerConstraints('__minVal__', 'Min value');
      if (val) {
        return val;
      }
    },

    _checkLessThanConstraint: function () {
      var maxVal = this.get('__maxVal__');
      if (!maxVal) {
        return;
      }
      var val = this._checkIntegerConstraints('__maxVal__', 'Max value');
      if (val) {
        return val;
      }
    },

    _checkEqualsConstraint: function () {
      var equals = this.get('__equals__');
      if (!equals) {
        return;
      }
      var val = this._checkIntegerConstraints('__equals__', 'Constraint');
      if (val) {
        return val;
      }
    },

    _checkIntegerConstraints: function (field, name) {
      var val = this.get(field);

      var error = {};
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
        var masterOverrideValue = resp.settings.masterOverride.value;
        if (_.isArray(masterOverrideValue) && !_.isEmpty(masterOverrideValue)) {
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
      if (resp['__displayType__'] == STRING) {
        resp['__minVal__'] = resp.minLength;
        resp['__maxVal__'] = resp.maxLength;
      } else if (resp['__displayType__'] == INTEGER || resp['__displayType__'] == NUMBER) {
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
        resp['subSchemas'] = new SubSchemaAllOfCollection(resp.allOf, { parse: true});
      } else if (resp.oneOf) {
        resp['subSchemas'] = new SubSchemaOneOfCollection(resp.oneOf, { parse: true});
      } else if (resp.noneOf) {
        resp['subSchemas'] = new SubSchemaNoneOfCollection(resp.noneOf, { parse: true});
      }
    },

    _updateDisplayType: function () {
      var type = this.get('type');
      if (type === STRING && this.get('format')) {
        this.set('__displayType__', SchemaUtil.FORMATDISPLAYTYPE[this.get('format')]);
      } else {
        var arraytype = this.get('items') ? this.get('items').type : undefined;
        if (type && arraytype) {
          this.set('__displayType__', SchemaUtil.ARRAYDISPLAYTYPE[getArrayTypeName(type, arraytype)]);
        } else {
          this.set('__displayType__', type);
        }
      }
    },

    toJSON: function () {
      var json = BaseModel.prototype.toJSON.apply(this, arguments);

      json.settings = {permissions: {}};
      json.settings.permissions['SELF'] = this.get('__userPermission__');

      // omit "sensitive" filed will have default it value to false.
      if (this.get('__isSensitive__')) {
        json.settings.sensitive = this.get('__isSensitive__');
      }
      if (this.get('type') === 'image') {
        json.type = 'object';
        json.extendedType = 'image';
      }
      json = this._attributeOverrideToJson(json);
      json = this._normalizeUnionValue(json);
      return json;
    },

    _attributeOverrideToJson: function (json) {
      var masterOverrideType = this.get('__masterOverrideType__'),
          masterOverrideValue = this.get('__masterOverrideValue__');
      if (masterOverrideType === 'OKTA_MASTERED') {
        json.settings.masterOverride = {type: 'OKTA_MASTERED'};
      } else if (masterOverrideType === 'OVERRIDE') {
        json.settings.masterOverride = {type: 'ORDERED_LIST', value: []};
        if (masterOverrideValue instanceof BaseCollection) {
          _.each(masterOverrideValue.toJSON(), function (overrideProfile) {
            json.settings.masterOverride.value.push(overrideProfile.id);
          });
        } else if (masterOverrideValue instanceof Array) {
          json.settings.masterOverride.value = masterOverrideValue;
        }
        if (_.isEmpty(json.settings.masterOverride.value)) {
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

    _updateTypeFormatConstraints: function () {
      var displayType = this.get('__displayType__');
      // OKTA-31952 reset format according to its displayType
      this.unset('format', {silent: true});
      this.unset('items', {silent: true});
      this.set(SchemaUtil.DISPLAYTYPES[displayType]);
      if (displayType != NUMBER && displayType != INTEGER) {
        this.unset('minimum');
        this.unset('maximum');
      }
      if (displayType != STRING) {
        this.unset('minLength');
        this.unset('maxLength');
      }

      this.unset('__minVal__');
      this.unset('__maxVal__');
      this.unset('__equals__');
      this.set('__supportsMinMax__', SchemaUtil.SUPPORTSMINMAX.indexOf(this.get('__displayType__')) != -1);
    },

    _updateMinMax: function () {
      var min,
          max,
          displayType = this.get('__displayType__');

      if (displayType === STRING) {
        min = 'minLength';
        max = 'maxLength';
      } else if (displayType == INTEGER || displayType == NUMBER) {
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
      var equals = this.get('__equals__');
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
      var constraint = this.get('__constraint__'),
          min = this.get('__minVal__'),
          max = this.get('__maxVal__'),
          equals = this.get('__equals__');

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
      if (this.get('scope') !== SchemaUtil.SCOPE.SYSTEM) {
        if (this.get('__isScopeSelf__') === true) {
          this.set({'scope': SchemaUtil.SCOPE.SELF}, {silent: true});
        } else {
          this.unset('scope');
        }
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
      return this.get('oneOf') ||
             this.get('enum') ||
             (this.get('items') && this.get('items')['oneOf']) ||
             (this.get('items') && this.get('items')['enum']);
    }

  });

  var SchemaProperties = BaseCollection.extend({
    model: SchemaProperty,
    clone: function () {
      return new this.constructor(this.toJSON({verbose: true}), {parse: true});
    },
    areAllReadOnly: function () {
      return _.all(this.pluck('__isReadOnly__'));
    },
    createModelProperties: function () {
      return this.reduce(function (p, schemaProperty) {
        var type = schemaProperty.get('type');
        p[schemaProperty.id] = _.clone(SchemaUtil.DISPLAYTYPES[type]);
        if (SchemaUtil.SUPPORTSMINMAX.indexOf(type) != -1) {
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

  return {
    Model: SchemaProperty,
    Collection: SchemaProperties
  };

});
