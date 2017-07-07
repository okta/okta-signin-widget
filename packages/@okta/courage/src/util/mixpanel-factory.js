define(['okta/jquery', 'mixpanel'], function ($, mixpanel) {
  return {
    create: function (key) {
      mixpanel.init(key, {}, key);
      // init sets up the global mixpanel object, have to now use that instead
      var mxp = window.mixpanel;
      mxp[key].register({
        'env': $('#analytics-env').text()
      });
      mxp[key].identify($('#analytics-uid').text());
      return mxp[key];
    }
  };
});
