export type Message = {
    message: string;
    i18n?: any | undefined;
    key: string;
    params: string[];
};
declare function uiSchemaLabelTransformer(transformedResp: any): any;
/**
 * @typedef {Object} Message
 * @property {string} message
 * @property {Object=} i18n
 * @property {string} i18n.key
 * @property {string[]} i18n.params
 */
/**
 * - If `message.i18n.key` exists and has a value in 'login.properties'
 *   through the given key or via I18N_OVERRIDE_MAPPINGS, return the value.
 *
 * - returns `message.message` otherwise
 *
 * @param {Message} message
 */
export function getMessage(message: Message): any;
/**
 * - iff `message.i18n.key` exists return the key.
 *
 * @param {Message} message
 */
export function getMessageKey(message: Message): any;
export function getI18NParams(remediation: any, authenticatorKey: any): any[];
export function doesI18NKeyExist(i18nKey: any): boolean;
/**
 * Has this i18n key been overridden for customization?
 * @param {String} i18nKey
 * @param {Object} settings
 * @returns Boolean
 */
export function isCustomizedI18nKey(i18nKey: string, settings: any): boolean;
/**
 * @param {Object} error
 */
export function getMessageFromBrowserError(error: any): any;
export { uiSchemaLabelTransformer as default };
//# sourceMappingURL=i18nTransformer.d.ts.map