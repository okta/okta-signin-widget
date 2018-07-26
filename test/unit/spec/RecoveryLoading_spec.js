/* eslint max-params: [2, 15] */
define([
  'vendor/lib/q',
  'okta/underscore',
  'okta/jquery',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/Beacon',
  'helpers/dom/RecoveryQuestionForm',
  'helpers/dom/PrimaryAuthForm',
  'helpers/util/Expect',
  'LoginRouter',
  'helpers/xhr/RECOVERY',
  'helpers/xhr/security_image',
  'sandbox'
],
function (Q, _, $, OktaAuth, Util, Beacon, RecoveryFormView, PrimaryAuthFormView,
          Expect, Router, resRecovery, resSecurityImage, $sandbox) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  function setup(settings, callRecoveryLoading) {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl});
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient
    }, settings));
    var beacon = new Beacon($sandbox);
    var form = new RecoveryFormView($sandbox);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);

    setNextResponse(resRecovery);
    if (callRecoveryLoading) {
      router.navigate('signin/recovery/SOMETOKEN', { trigger: true });
    } else {
      router.navigate('', { trigger: true });
    }
    return tick().then(function () {
      return {
        router: router,
        beacon: beacon,
        form: form,
        ac: authClient,
        setNextResponse: setNextResponse
      };
    });
  }

  Expect.describe('Recovery Loading', function () {

    itp('makes a request with correct token passed in url', function () {
      return setup({}, true).then(function (test) {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/api/v1/authn/recovery/token',
          data: {
            recoveryToken: 'SOMETOKEN'
          }
        });
        expect(test.form.isRecoveryQuestion()).toBe(true);
      });
    });

    itp('makes a request with correct token passed in settings', function () {
      return setup({recoveryToken: 'SETTINGSTOKEN'}, false).then(function (test) {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/api/v1/authn/recovery/token',
          data: {
            recoveryToken: 'SETTINGSTOKEN'
          }
        });
        expect(test.form.isRecoveryQuestion()).toBe(true);
        // the token in settings is unset after the initial navigation
        // so the following navigations are not affected
        test.router.navigate('', { trigger: true });
        return Expect.waitForPrimaryAuth();
      }).then(function () {
        var form = new PrimaryAuthFormView($sandbox);
        expect(form.isPrimaryAuth()).toBe(true);
      });
    });

    // It doesn't actually do this. Will leave this here as a reminder that
    // this functionality has not been implemented yet.
    it('calls a callback function if no token passed in settings');
  });

});
