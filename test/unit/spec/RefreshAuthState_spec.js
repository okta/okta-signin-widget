/* eslint max-params: [2, 25] */
define([
  'vendor/lib/q',
  'okta/underscore',
  'okta/jquery',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/Beacon',
  'helpers/dom/Form',
  'helpers/util/Expect',
  'LoginRouter',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/security_image',
  'sandbox'
],
function (Q, _, $, OktaAuth, Util, Beacon, FormView, Expect,
          Router, resEnroll, resSecurityImage, $sandbox) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  function setup(settings) {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl});
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      features: {
        securityImage: true
      }
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

  Expect.describe('RefreshAuthState', function () {

    itp('redirects to PrimaryAuth if authClient does not need a refresh', function () {
      return setup()
      .then(function (test) {
        spyOn(test.ac.tx, 'exists').and.returnValue(false);
        test.router.refreshAuthState();
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function (test) {
        Expect.isPrimaryAuth(test.router.controller);
      });
    });
    itp('refreshes auth state on render if it does need a refresh', function () {
      return setup()
      .then(function (test) {
        Util.mockSDKCookie(test.ac);
        test.setNextResponse(resEnroll);
        test.router.refreshAuthState();
        return tick(test);
      })
      .then(function () {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/api/v1/authn',
          data: {
            stateToken: 'testStateToken'
          }
        });
      });
    });
    itp('calls status with token if initialized with token', function () {
      return setup({ stateToken: 'someStateToken' })
      .then(function (test) {
        test.setNextResponse(resEnroll);
        test.router.refreshAuthState();
        return tick(test);
      })
      .then(function () {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/api/v1/authn',
          data: {
            stateToken: 'someStateToken'
          }
        });
      });
    });

  });

});
