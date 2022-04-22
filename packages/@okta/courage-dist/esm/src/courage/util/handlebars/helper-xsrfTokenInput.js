import _Handlebars2 from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
export { default } from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaJQueryStatic from '../jquery-wrapper.js';

/* eslint @okta/okta-ui/no-specific-modules: 0 */
_Handlebars2.registerHelper('xsrfTokenInput', function xsrfTokenInput() {
  return new _Handlebars2.SafeString(`<input type="hidden" class="hide" name="_xsrfToken" value="${oktaJQueryStatic('#_xsrfToken').text()}">`);
});
