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

  var { _, $ } = Okta;
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

  Expect.describe('RefreshAuthStateController', function () {
    itp('makes API call to refresh auth state on render', function () {
      return setup({ stateToken: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'})
        .then(function (test) {
          test.setNextResponse(resFactorRequiredEmail);
          test.router.refreshAuthState();
          return tick(test);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            //TODO update to api/v2
            url: 'https://foo.com/api/v1/authn',
            data: {
              stateToken: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
            }
          });
        });
    });
  });
});
