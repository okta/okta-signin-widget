import oktaUnderscore from './underscore-wrapper.js';
import StringUtil from './StringUtil.js';

const loc = StringUtil.localize;
const SchemaUtils = {
  STRING: 'string',
  NUMBER: 'number',
  INTEGER: 'integer',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  FORMATDISPLAYTYPE: {
    'date-time': 'date',
    uri: 'uri',
    email: 'email',
    // TODO: settle on using EITHER underscores OR hyphens --- not both (OKTA-202818)
    'country-code': 'country-code',
    'language-code': 'language-code',
    'country_code': 'country_code',
    'language_code': 'language_code',
    locale: 'locale',
    timezone: 'timezone',
    'ref-id': 'reference'
  },
  ARRAYDISPLAYTYPE: {
    arrayofobject: 'arrayofobject',
    arrayofstring: 'arrayofstring',
    arrayofnumber: 'arrayofnumber',
    arrayofinteger: 'arrayofinteger',
    'arrayofref-id': 'arrayofref-id'
  },
  DISPLAYTYPES: {
    date: {
      type: 'string',
      format: 'date-time'
    },
    uri: {
      type: 'string',
      format: 'uri'
    },
    email: {
      type: 'string',
      format: 'email'
    },
    // TODO: Resolve inconsistencies in hyphens vs. underscores for these properties (OKTA-202818)
    // use country-code if attribute should be restricted to country code type
    'country-code': {
      type: 'string',
      format: 'country-code'
    },
    'language-code': {
      type: 'string',
      format: 'language-code'
    },
    'country_code': {
      type: 'string'
    },
    'language_code': {
      type: 'string'
    },
    locale: {
      type: 'string',
      format: 'locale'
    },
    timezone: {
      type: 'string',
      format: 'timezone'
    },
    string: {
      type: 'string'
    },
    number: {
      type: 'number'
    },
    boolean: {
      type: 'boolean'
    },
    integer: {
      type: 'integer'
    },
    reference: {
      type: 'string',
      format: 'ref-id'
    },
    arrayofobject: {
      type: 'array',
      items: {
        type: 'object'
      }
    },
    arrayofstring: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    arrayofnumber: {
      type: 'array',
      items: {
        type: 'number'
      }
    },
    arrayofinteger: {
      type: 'array',
      items: {
        type: 'integer'
      }
    },
    'arrayofref-id': {
      type: 'array',
      items: {
        type: 'string',
        format: 'ref-id'
      }
    },
    image: {
      type: 'image'
    },
    password: {
      type: 'string'
    }
  },
  SUPPORTSMINMAX: ['string', 'number', 'integer', 'password'],
  SUPPORTENUM: ['string', 'number', 'integer', 'object', 'arrayofstring', 'arrayofnumber', 'arrayofinteger', 'arrayofobject'],
  DATATYPE: {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    integer: 'integer',
    date: 'datetime',
    object: 'object',
    arrayofobject: 'object array',
    arrayofstring: 'string array',
    arrayofnumber: 'number array',
    arrayofinteger: 'integer array',
    'arrayofref-id': 'reference array',
    // TODO: settle on using EITHER underscores OR hyphens --- not both (OKTA-202818)
    'country-code': 'country code',
    'language-code': 'language code',
    'country_code': 'country code',
    'language_code': 'language code',
    reference: 'reference',
    timezone: 'timezone',
    image: 'image'
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
    DISABLE: loc('universal-directory.profiles.attribute.form.union.enable.display', 'courage'),
    ENABLE: loc('universal-directory.profiles.attribute.form.union.disable.display', 'courage')
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
    INHERIT: loc('universal-directory.profiles.attribute.source.inherit', 'courage'),
    // eslint-disable-next-line @okta/okta/no-exclusive-language
    OKTA_MASTERED: loc('universal-directory.profiles.attribute.source.oktamastered', 'courage'),
    OVERRIDE: loc('universal-directory.profiles.attribute.source.override', 'courage')
  },
  USERNAMETYPE: {
    NONE: 'non-username',
    OKTA_TO_APP: 'okta-to-app-username',
    OKTA_TO_AD: 'okta-to-ad-username',
    APP_TO_OKTA: 'app-to-okta-username',
    IDP_TO_OKTA: 'idp-to-okta-username'
  },
  LOGINPATTERNFORMAT: {
    EMAIL: 'EMAIL',
    CUSTOM: 'CUSTOM',
    NONE: 'NONE'
  },
  UNIQUENESS: {
    NOT_UNIQUE: 'NOT_UNIQUE',
    PENDING_UNIQUENESS: 'PENDING_UNIQUENESS',
    UNIQUE_VALIDATED: 'UNIQUE_VALIDATED'
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
    let displayType; // type is undefined for
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
      displayType = typeof defaultValue === 'undefined' ? '' : defaultValue;
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
    let sourceUsernameType = this.USERNAMETYPE.NONE;
    /* eslint complexity: [2, 7] */

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
    return oktaUnderscore.contains(oktaUnderscore.values(this.ARRAYDISPLAYTYPE), type);
  },
  isObjectDataType: function (type) {
    return this.DATATYPE.object === type;
  }
};

export { SchemaUtils as default };
