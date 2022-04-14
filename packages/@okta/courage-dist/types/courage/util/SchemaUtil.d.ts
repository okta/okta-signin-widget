declare const SchemaUtils: {
    STRING: string;
    NUMBER: string;
    INTEGER: string;
    BOOLEAN: string;
    OBJECT: string;
    FORMATDISPLAYTYPE: {
        'date-time': string;
        uri: string;
        email: string;
        'country-code': string;
        'language-code': string;
        country_code: string;
        language_code: string;
        locale: string;
        timezone: string;
        'ref-id': string;
    };
    ARRAYDISPLAYTYPE: {
        arrayofobject: string;
        arrayofstring: string;
        arrayofnumber: string;
        arrayofinteger: string;
        'arrayofref-id': string;
    };
    DISPLAYTYPES: {
        date: {
            type: string;
            format: string;
        };
        uri: {
            type: string;
            format: string;
        };
        email: {
            type: string;
            format: string;
        };
        'country-code': {
            type: string;
            format: string;
        };
        'language-code': {
            type: string;
            format: string;
        };
        country_code: {
            type: string;
        };
        language_code: {
            type: string;
        };
        locale: {
            type: string;
            format: string;
        };
        timezone: {
            type: string;
            format: string;
        };
        string: {
            type: string;
        };
        number: {
            type: string;
        };
        boolean: {
            type: string;
        };
        integer: {
            type: string;
        };
        reference: {
            type: string;
            format: string;
        };
        arrayofobject: {
            type: string;
            items: {
                type: string;
            };
        };
        arrayofstring: {
            type: string;
            items: {
                type: string;
            };
        };
        arrayofnumber: {
            type: string;
            items: {
                type: string;
            };
        };
        arrayofinteger: {
            type: string;
            items: {
                type: string;
            };
        };
        'arrayofref-id': {
            type: string;
            items: {
                type: string;
                format: string;
            };
        };
        image: {
            type: string;
        };
        password: {
            type: string;
        };
    };
    SUPPORTSMINMAX: string[];
    SUPPORTENUM: string[];
    DATATYPE: {
        string: string;
        number: string;
        boolean: string;
        integer: string;
        date: string;
        object: string;
        arrayofobject: string;
        arrayofstring: string;
        arrayofnumber: string;
        arrayofinteger: string;
        'arrayofref-id': string;
        'country-code': string;
        'language-code': string;
        country_code: string;
        language_code: string;
        reference: string;
        timezone: string;
        image: string;
    };
    MUTABILITY: {
        READONLY: string;
        WRITEONLY: string;
        READWRITE: string;
        IMMUTABLE: string;
    };
    SCOPE: {
        NONE: string;
        SELF: string;
        SYSTEM: string;
    };
    DISPLAYSCOPE: {
        SELF: string;
        SYSTEM: string;
        NA: string;
    };
    UNION: {
        DISABLE: string;
        ENABLE: string;
    };
    UNION_OPTIONS: {
        DISABLE: any;
        ENABLE: any;
    };
    PERMISSION: {
        HIDE: string;
        READ_ONLY: string;
        WRITE_ONLY: string;
        READ_WRITE: string;
    };
    ENDUSER_ATTRIBUTE_PERMISSION_OPTIONS: {
        HIDE: any;
        READ_ONLY: any;
        READ_WRITE: any;
    };
    ATTRIBUTE_LEVEL_MASTERING_OPTIONS: {
        INHERIT: any;
        OKTA_MASTERED: any;
        OVERRIDE: any;
    };
    USERNAMETYPE: {
        NONE: string;
        OKTA_TO_APP: string;
        OKTA_TO_AD: string;
        APP_TO_OKTA: string;
        IDP_TO_OKTA: string;
    };
    LOGINPATTERNFORMAT: {
        EMAIL: string;
        CUSTOM: string;
        NONE: string;
    };
    UNIQUENESS: {
        NOT_UNIQUE: string;
        PENDING_UNIQUENESS: string;
        UNIQUE_VALIDATED: string;
    };
    getDisplayType: (type: any, format: any, itemType: any, defaultValue?: any) => any;
    getSourceUsernameType: (mappingDirection: any, targetName: any, appName: any) => any;
    isArrayDataType: (type: any) => boolean;
    isObjectDataType: (type: any) => boolean;
};
export default SchemaUtils;
