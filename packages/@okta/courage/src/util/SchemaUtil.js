define([
  'okta/underscore',
  './StringUtil'
],
function (_, StringUtil) {

  var loc = StringUtil.localize;

  var SchemaUtils = {
    STRING: 'string',
    NUMBER: 'number',
    INTEGER: 'integer',
    BOOLEAN: 'boolean',
    OBJECT: 'object',
    FORMATDISPLAYTYPE: {
      'date-time': 'date',
      'uri': 'uri',
      'email': 'email',
      'country-code': 'country-code',
      'language-code': 'language-code',
      'locale': 'locale',
      'timezone': 'timezone',
      'ref-id': 'reference'
    },
    ARRAYDISPLAYTYPE: {
      'arrayofobject': 'arrayofobject',
      'arrayofstring': 'arrayofstring',
      'arrayofnumber': 'arrayofnumber',
      'arrayofinteger': 'arrayofinteger'
    },
    DISPLAYTYPES: {
      'date': {'type': 'string', 'format': 'date-time'},
      'uri': {'type': 'string', 'format': 'uri'},
      'email': {'type': 'string', 'format': 'email'},
      'country-code': {'type': 'string', 'format': 'country-code'},
      'language-code': {'type': 'string', 'format': 'language-code'},
      'locale': {'type': 'string', 'format': 'locale'},
      'timezone': {'type': 'string', 'format': 'timezone'},
      'string': {'type': 'string'},
      'number': {'type': 'number'},
      'boolean': {'type': 'boolean'},
      'integer': {'type': 'integer'},
      'reference': {'type': 'string', 'format': 'ref-id'},
      'arrayofobject': {'type': 'array', 'items': {'type': 'object'}},
      'arrayofstring': {'type': 'array', 'items': {'type': 'string'}},
      'arrayofnumber': {'type': 'array', 'items': {'type': 'number'}},
      'arrayofinteger': {'type': 'array', 'items': {'type': 'integer'}},
      'image': {'type': 'image'},
      'password': {'type': 'string'}
    },
    SUPPORTSMINMAX: [
      'string',
      'number',
      'integer',
      'password'
    ],
    DATATYPE: {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'integer': 'integer',
      'date': 'datetime',
      'object': 'object',
      'arrayofobject': 'object array',
      'arrayofstring': 'string array',
      'arrayofnumber': 'number array',
      'arrayofinteger': 'integer array',
      'country-code': 'country code',
      'language-code': 'language code',
      'reference': 'reference',
      'timezone': 'timezone',
      'image': 'image'
    },
    MUTABILITY: {
      READONLY: 'READ_ONLY',
      WRITEONLY: 'WRITE_ONLY',
      READWRITE: 'READ_WRITE',
      IMMUTABLE: 'IMMUTABLE'
    },
    SCOPE: {
      NONE: 'NONE',
      SELF: 'SELF',
      SYSTEM: 'SYSTEM'
    },
    DISPLAYSCOPE: {
      SELF: 'User personal',
      SYSTEM: 'System',
      NA: 'None'
    },
    UNION: {
      DISABLE: 'DISABLE',
      ENABLE: 'ENABLE'
    },
    UNION_OPTIONS: {
      'DISABLE': loc('universal-directory.profiles.attribute.form.union.enable.display', 'courage'),
      'ENABLE': loc('universal-directory.profiles.attribute.form.union.disable.display', 'courage')
    },
    PERMISSION: {
      HIDE: 'HIDE',
      READ_ONLY: 'READ_ONLY',
      WRITE_ONLY: 'WRITE_ONLY',
      READ_WRITE: 'READ_WRITE'
    },
    ENDUSER_ATTRIBUTE_PERMISSION_OPTIONS: {
      HIDE: loc('universal-directory.profiles.attribute.enduser.permission.hide', 'courage'),
      READ_ONLY: loc('universal-directory.profiles.attribute.enduser.permission.readonly', 'courage'),
      READ_WRITE: loc('universal-directory.profiles.attribute.enduser.permission.readwrite', 'courage')
    },
    ATTRIBUTE_LEVEL_MASTERING_OPTIONS: {
      INHERIT: loc('universal-directory.profiles.attribute.master.inherit', 'courage'),
      OKTA_MASTERED: loc('universal-directory.profiles.attribute.master.oktamastered', 'courage'),
      OVERRIDE: loc('universal-directory.profiles.attribute.master.override', 'courage')
    },
    USERNAMETYPE: {
      NONE: 'non-username',
      OKTA_TO_APP: 'okta-to-app-username',
      OKTA_TO_AD: 'okta-to-ad-username',
      APP_TO_OKTA: 'app-to-okta-username',
      IDP_TO_OKTA: 'idp-to-okta-username'
    },

    /*
     * Get a display string for a schema attribute type.
     * @param {String} type Type of an attribute
     * @param {String} format Format of an attribute
     * @param {String} itemType Item type of an attribute if an array
     * @param {String} defaultValue The default value if an attribute type is undefined
     * @return {String} the display value
     */
    getDisplayType: function (type, format, itemType, defaultValue) {
      var displayType;
      // type is undefined for
      // - an un-mapped source attribute from mapping
      // - an source attribute which is mapped to username target attribute
      if (type) {
        // format is only defined for complicated types (ex. reference, date time, array)
        // not for simple types (ex. string, integer, boolean)
        if (format) {
          displayType = this.FORMATDISPLAYTYPE[format];
        } else {
          // itemType is only defined for array type
          // to specify an array element type (ex. string, integer, number)
          displayType = itemType ? this.ARRAYDISPLAYTYPE[type + 'of' + itemType] : type;
        }
      }
      if (!displayType) {
        displayType = typeof defaultValue == 'undefined' ? '' : defaultValue;
      }
      return displayType;
    },

    /*
     * Get attribute mapping source attribute username type
     * @param {String} mappingDirection
     * @param {String} targetName The mapping target attribute name
     * @param {String} appName The app name that's mapped to/from Okta
     * @return {String} the source attribute username type value
     */
    getSourceUsernameType: function (mappingDirection, targetName, appName) {
      var sourceUsernameType = this.USERNAMETYPE.NONE;
      if (mappingDirection === 'oktaToApp') {
        if (targetName === 'userName') {
          sourceUsernameType = this.USERNAMETYPE.OKTA_TO_APP;
        } else if (targetName === 'cn') {
          sourceUsernameType = this.USERNAMETYPE.OKTA_TO_AD;
        }
      } else if (mappingDirection === 'appToOkta' && targetName === 'login') {
        if (appName === 'saml_idp') {
          sourceUsernameType = this.USERNAMETYPE.IDP_TO_OKTA;
        } else {
          sourceUsernameType = this.USERNAMETYPE.APP_TO_OKTA;
        }
      }
      return sourceUsernameType;
    },

    isArrayDataType: function (type) {
      return _.contains(_.values(this.ARRAYDISPLAYTYPE), type);
    },

    isObjectDataType: function (type) {
      return this.DATATYPE.object === type;
    }
  };

  return SchemaUtils;
});
