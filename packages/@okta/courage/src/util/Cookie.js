define(['okta/underscore', 'vendor/lib/js.cookie'], function (_, Cookie) {

  var SECURED_COOKIE = /^https/.test(window.location.href);

  return {
    setCookie: function (name, value, options) {
      Cookie.set(name, value, _.defaults(options || {}, {
        secure: SECURED_COOKIE,
        path: '/'
      }));
    },

    getCookie: function () {
      return Cookie.get.apply(Cookie, arguments);
    },

    removeCookie: function () {
      return Cookie.remove.apply(Cookie, arguments);
    }
  };

});
