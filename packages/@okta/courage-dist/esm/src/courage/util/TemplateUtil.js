import _Handlebars2 from '../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore from './underscore-wrapper.js';

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
    /* eslint @okta/okta-ui/no-specific-methods: 0 */
    return function (context) {
      return _Handlebars2.compile(tpl)(context);
    };
  })
};

export { TemplateUtil as default };
