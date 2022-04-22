import _Handlebars2 from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
export { default } from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import mdToHtml from '../markdownToHtml.js';

/* eslint @okta/okta-ui/no-specific-modules: 0 */
_Handlebars2.registerHelper('markdown', function markdown(mdText) {
  return mdToHtml(_Handlebars2, mdText);
});
