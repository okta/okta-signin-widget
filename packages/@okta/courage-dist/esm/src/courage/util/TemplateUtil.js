import _Handlebars2 from '../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore, { isTemplateAHandlebarsTemplate, logIfStringTemplate } from './underscore-wrapper.js';

/* eslint @okta/okta-ui/no-specific-methods: 0 */
/**
 * @class module:Okta.internal.util.TemplateUtil
 * @hideconstructor
 */

var TemplateUtil = /** @lends module:Okta.internal.util.TemplateUtil */
{
  /**
   * Compiles a Handlebars template
   * @static
   * @method
   */
  // TODO: This will be deprecated at some point. Views should use pre-compiled templates
  tpl: oktaUnderscore.memoize(function (tpl) {
    // If the passed template has no Handlebars syntax,
    // we can simply return a simple function that returns the input template string
    if (!isTemplateAHandlebarsTemplate(tpl)) {
      return () => tpl;
    }

    logIfStringTemplate(tpl);
    /* eslint @okta/okta-ui/no-specific-methods: 0 */

    return function (context) {
      return _Handlebars2.compile(tpl)(context);
    };
  }),

  /**
   * Checks whether the given template is a string and logs appropriately if so.
   * String templates should be avoided in favor of precompiled templates. OKTA-997448
   * @static
   * @method
   */
  logIfStringTemplate: logIfStringTemplate
};

export { TemplateUtil as default };
