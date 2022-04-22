import _Handlebars2 from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
export { default } from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';

/* eslint @okta/okta-ui/no-specific-modules: 0 */

_Handlebars2.registerHelper('base64ToHex', function base64ToHex(base64String) {
  const raw = atob(base64String);
  let result = '';

  if (raw.length > 0) {
    const firstHex = raw.charCodeAt(0).toString(16);
    result += firstHex.length === 2 ? firstHex : `0${firstHex}`;

    for (let i = 1; i < raw.length; i += 1) {
      let hex = raw.charCodeAt(i).toString(16);
      hex = hex.length === 2 ? hex : `0${hex}`;
      result += ` ${hex}`;
    }
  }

  return result.toUpperCase();
});
