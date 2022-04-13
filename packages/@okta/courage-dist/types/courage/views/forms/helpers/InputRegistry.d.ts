import { BaseInputClass } from '../BaseInput';
declare function isBaseInput(input: any): input is BaseInputClass;
declare const _default: {
    isBaseInput: typeof isBaseInput;
    /**
     * Register a form input
     * @param {String} type string identifier for the input
     * @param {BaseInput} input the input to register
     * @return {void}
     */
    register: (type: any, input: BaseInputClass) => void;
    /**
     * Get a form input by type
     * @param {Object} options input definition
     * @param {String} options.type string identifier for the input
     * @return {BaseInput} a matching input
     */
    get: (options: any) => BaseInputClass;
    /**
     * Unregister an input type
     * @param {String} type
     */
    unregister: (type: any) => void;
};
/**
 * @class module:Okta.internal.views.forms.helpers.InputRegistry
 */
export default /** @lends module:Okta.internal.views.forms.helpers.InputRegistry */ _default;
