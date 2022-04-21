export default convert;
/**
 * Authn V2 response
 */
export type AuthnResponse = any;
export type AuthnResult = {
    user?: any | undefined;
    authenticator?: any | undefined;
};
/**
 * @param {Models.Settings} user configuration
 * @param {idx} idx object
 * @returns {} transformed object with flattened firstlevel objects, idx and remediations array
 * Example: {
 *  idx: {
 *    proceed: ƒ(),
 *    neededToProceed: [],
 *    actions: {cancel: ƒ()},
 *    context: {},
 *  },
 *  remediations: [],
 *  authenticators: {},
 *  authenticator: {},
 *  messages: {},
 *  deviceEnrollment: {},
 * }
 */
declare function convert(settings: any, idx?: any, lastResult?: any): any;
//# sourceMappingURL=responseTransformer.d.ts.map