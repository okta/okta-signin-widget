declare const StringUtil: {
    /** @static */
    sprintf: () => any;
    /**
     * Converts a URI encoded query string into a hash map
     * @param  {String} query The query string
     * @return {Object} The map
     * @static
     * @example
     * StringUtil.parseQuery('foo=bar&baz=qux') // {foo: 'bar', baz: 'qux'}
     */
    parseQuery: (query: any) => {};
    /** @static */
    encodeJSObject: (jsObj: any) => string;
    /** @static */
    decodeJSObject: (jsObj: any) => any;
    /** @static */
    unescapeHtml: (string: any) => string;
    /**
     * Get the original i18n template directly without string format with parameters
     * @param {String} key The key
     * @param {String} bundle="messages"] The name of the i18n bundle. Defaults to the first bundle in the list.
     */
    getTemplate: (key: any, bundleName: any) => any;
    /**
     * Translate a key to the localized value
     * @static
     * @param  {String} key The key
     * @param  {String} [bundle="messages"] The name of the i18n bundle. Defaults to the first bundle in the list.
     * @param  {Array} [params] A list of parameters to apply as tokens to the i18n value
     * @return {String} The localized value
     */
    localize: (key: any, bundleName?: any, params?: any) => any;
    /**
     * Convert a string to a float if valid, otherwise return the string.
     * Valid numbers may contain a negative sign and a decimal point.
     * @static
     * @param {String} string The string to convert to a number
     * @return {String|Number} Returns a number if the string can be casted, otherwise returns the original string
     */
    parseFloat: (string: any) => any;
    /**
     * Convert a string to an integer if valid, otherwise return the string
     * @static
     * @param {String} string The string to convert to an integer
     * @return {String|integer} Returns an integer if the string can be casted, otherwise, returns the original string
     */
    parseInt: (string: any) => any;
    /**
     * Convert a string to an object if valid, otherwise return the string
     * @static
     * @param {String} string The string to convert to an object
     * @return {String|object} Returns an object if the string can be casted, otherwise, returns the original string
     */
    parseObject: (string: any) => any;
    /**
     * Returns a random string from [a-z][A-Z][0-9] of a given length
     * @static
     * @param {Number} length The length of the random string.
     * @return {String} Returns a random string from [a-z][A-Z][0-9] of a given length
     */
    randomString: (length: any) => string;
    /**
     * Returns if a str ends with another string
     * @static
     * @param {String} str The string to search
     * @param {String} ends The string it should end with
     *
     * @return {Boolean} Returns if the str ends with ends
     */
    endsWith: (str: any, ends: any) => boolean;
    /** @static */
    isEmail: (str: any) => boolean;
};
/**
 * Handy utility functions to handle strings.
 *
 * @class module:Okta.internal.util.StringUtil
 * @hideconstructor
 */
export default StringUtil;
