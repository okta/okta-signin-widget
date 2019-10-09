define([
  'q',
  'okta',
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
function (Q, Okta, OktaAuth, Util, Beacon, FormView, Expect,
  Router, resEnroll, resSecurityImage, $sandbox) {

  var { _, $ } = Okta;
  var itp = Expect.itp;

  function setup (settings) {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({ url: baseUrl });
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
      return setup({}, true)
        .then(function (test) {
          spyOn(test.ac.tx, 'exists').and.returnValue(false);
          test.router.refreshAuthState();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function (test) {
          Expect.isPrimaryAuth(test.router.controller);
        });
    });
    itp('refreshes auth state and picks token from cookie', function () {
      return setup()
        .then(function (test) {
          Util.mockSDKCookie(test.ac, null, 'a-token-in-cookie');
          test.setNextResponse(resEnroll);
          test.router.refreshAuthState();
          return Expect.waitForEnrollChoices();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              stateToken: 'a-token-in-cookie'
            }
          });
        });
    });
    itp('calls status with token if initialized with token passed directly to controller via options', function () {
      return setup()
        .then(function (test) {
          test.setNextResponse(resEnroll);
          test.router.refreshAuthState('dummy-token');
          return Expect.waitForEnrollChoices();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              stateToken: 'dummy-token',
            }
          });
        });
    });

    itp('calls status with token if initialized with token passed via settings', function () {
      return setup({ stateToken: 'dummy-token' })
        .then(function (test) {
          test.setNextResponse(resEnroll);
          return Util.mockIntrospectResponse(test.router).then(function () {
            return test;
          });
        })
        .then(function (test) {
          test.router.refreshAuthState('dummy-token');
          return Expect.waitForEnrollChoices();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/idp/idx/introspect',
            data: {
              stateToken: 'dummy-token'
            }
          });
        });
    });

  });

});
