import _Handlebars2 from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
export { default } from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';

const clonedEscapeExpression = _Handlebars2.Utils.escapeExpression;

_Handlebars2.Utils.escapeExpression = function (string) {
  return clonedEscapeExpression(string).replace(/&#x3D;/g, '=');
};
