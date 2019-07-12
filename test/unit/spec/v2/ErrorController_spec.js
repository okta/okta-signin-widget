/* eslint max-params: [2, 25] */
define([
  'q',
  'okta',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/Beacon',
  'helpers/dom/Form',
  'helpers/util/Expect',
  'v2/WidgetRouter',
  'helpers/xhr/v2/FACTOR_REQUIRED_EMAIL',
  'sandbox'
],
function (Q, Okta, OktaAuth, Util, Beacon, FormView, Expect,
  Router, resFactorRequiredEmail, $sandbox) {

  var { _} = Okta;
  var itp = Expect.itp;
  var tick = Expect.tick;

  function setup (settings) {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({ url: baseUrl });
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      useIdxPipeline: true,
    }, settings));
    var beacon = new Beacon($sandbox);
    var form = new FormView($sandbox);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    Util.mockJqueryCss();
    return Q({
      router: router,
      beacon: beacon,
      form: form,
      ac: authClient,
      setNextResponse: setNextResponse
    });
  }

  Expect.describe('ErrorController', function () {
    itp('Show error message if widget is bootstrapped with no statetoken', function () {
      return setup()
        .then(function (test) {
          test.setNextResponse(resFactorRequiredEmail);
          test.router.defaultAuth();
          return tick(test);
        })
        .then(function (test) {
          var error = test.router.controller.$el.find('.error-message').text();
          expect(error).toBe('Widget bootstrapped with no stateToken');
        });
    });
  });
});
