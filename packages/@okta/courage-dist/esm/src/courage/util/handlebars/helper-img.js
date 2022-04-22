import _Handlebars2 from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
export { default } from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore from '../underscore-wrapper.js';

/* eslint @okta/okta-ui/no-specific-modules: 0 */
const CACHE_BUST_URL_PREFIX = '/assets';

function prependCachebustPrefix(path) {
  if (path.indexOf(CACHE_BUST_URL_PREFIX) === 0) {
    return path;
  }

  return CACHE_BUST_URL_PREFIX + path;
}

_Handlebars2.registerHelper('img', function img(options) {
  const cdn = typeof okta !== 'undefined' && okta.cdnUrlHostname || '';

  const hash = oktaUnderscore.pick(options.hash, ['src', 'alt', 'width', 'height', 'class', 'title']);

  hash.src = `${cdn}${prependCachebustPrefix(hash.src)}`;

  const attrs = oktaUnderscore.map(hash, (value, attr) => {
    const encodedValue = attr === 'src' ? encodeURI(value) : _Handlebars2.Utils.escapeExpression(value);
    return `${attr}="${encodedValue}"`;
  });

  return new _Handlebars2.SafeString(`<img ${attrs.join(' ')}/>`);
});
