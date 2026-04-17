declare const _default: {
    /**
     * Compiles a Handlebars template
     * @static
     * @method
     */
    tpl: (tpl: any) => (() => any) | ((context: any) => string);
    /**
     * Checks whether the given template is a string and logs appropriately if so.
     * String templates should be avoided in favor of precompiled templates. OKTA-997448
     * @static
     * @method
     */
    logIfStringTemplate: (template: any) => void;
};
/**
 * @class module:Okta.internal.util.TemplateUtil
 * @hideconstructor
 */
export default /** @lends module:Okta.internal.util.TemplateUtil */ _default;
