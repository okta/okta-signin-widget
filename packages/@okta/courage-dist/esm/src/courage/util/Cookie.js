import oktaUnderscore from './underscore-wrapper.js';
import Cookie$1 from '../vendor/lib/js.cookie.js';

const SECURED_COOKIE = /^https/.test(window.location.href);
var Cookie = {
  setCookie: function (name, value, options) {
    Cookie$1.set(name, value, oktaUnderscore.defaults(options || {}, {
      secure: SECURED_COOKIE,
      path: '/'
    }));
  },
  getCookie: function () {
    return Cookie$1.get.apply(Cookie$1, arguments);
  },
  removeCookie: function () {
    return Cookie$1.remove.apply(Cookie$1, arguments);
  }
};

export { Cookie as default };
