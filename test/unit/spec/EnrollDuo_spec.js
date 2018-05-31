/* eslint max-params: [2, 13], camelcase: 0 */
define([
  'okta/underscore',
  'okta/jquery',
  'duo',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'helpers/dom/EnrollDuoForm',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_duo',
  'helpers/xhr/SUCCESS'
],
function (_, $, Duo, OktaAuth, Util, Beacon, Expect, Form, Router, $sandbox,
          resAllFactors, resActivateDuo, resSuccess) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  Expect.describe('EnrollDuo', function () {

    function setup(startRouter) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl});
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        'features.router': startRouter
      });
      Util.registerRouter(router);
      Util.mockRouterNavigate(router, startRouter);
      Util.mockDuo();
      return tick()
      .then(function() {
        setNextResponse(resAllFactors);
        router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollChoices();
      })
      .then(function () {
        setNextResponse(resActivateDuo);
        router.enrollDuo();
        return Expect.waitForEnrollDuo({
          router: router,
          beacon: new Beacon($sandbox),
          form: new Form($sandbox),
          ac: authClient,
          setNextResponse: setNextResponse
        });
      });
    }

    itp('displays the correct factorBeacon', function () {
      return setup().then(function (test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-duo')).toBe(true);
      });
    });
    itp('iframe has title', function () {
      return setup().then(function (test) {
        expect(test.form.iframe().attr('title')).toBe(test.form.titleText());
      });
    });
    itp('visits previous link when back link is clicked', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.setNextResponse(resAllFactors);
        test.form.backLink().click();
        return Expect.waitForEnrollChoices();
      })
      .then(function () {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/api/v1/authn/previous',
          data: {
            stateToken: 'testStateToken'
          }
        });
      });
    });
    itp('returns to factor list when browser\'s back button is clicked', function () {
      return setup(true).then(function (test) {
        test.setNextResponse(resAllFactors);
        Util.triggerBrowserBackButton();
        return Expect.waitForEnrollChoices(test);
      })
      .then(function (test) {
        Expect.isEnrollChoices(test.router.controller);
        Util.stopRouter();
      });
    });
    itp('makes the right init request', function () {
      return setup().then(function () {
        expect($.ajax.calls.count()).toBe(2);
        Expect.isJsonPost($.ajax.calls.argsFor(1), {
          url: 'https://foo.com/api/v1/authn/factors',
          data: {
            factorType: 'web',
            provider: 'DUO',
            stateToken: 'testStateToken'
          }
        });
      });
    });
    itp('initializes duo correctly', function () {
      return setup().then(function (test) {
        var initOptions = Duo.init.calls.mostRecent().args[0];
        expect(initOptions.host).toBe('api123443.duosecurity.com');
        expect(initOptions.sig_request).toBe('sign_request(ikey, skey, akey, username)');
        expect(initOptions.iframe).toBe(test.form.iframe().get(0));
        expect(_.isFunction(initOptions.post_action)).toBe(true);
      });
    });
    itp('notifies okta when duo is done, and completes enrollment', function () {
      return setup()
      .then(function (test) {
        $.ajax.calls.reset();
        test.setNextResponse(resSuccess);
        // Duo callback (returns an empty response)
        test.setNextResponse({
          status: 200,
          responseType: 'json',
          response: {}
        });
        var postAction = Duo.init.calls.mostRecent().args[0].post_action;
        postAction('someSignedResponse');
        return tick();
      })
      .then(function () {
        expect($.ajax.calls.count()).toBe(2);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/api/v1/authn/factors/ost947vv5GOSPjt9C0g4/lifecycle/activate/response',
          data: {
            id: 'ost947vv5GOSPjt9C0g4',
            stateToken: 'testStateToken',
            sig_response: 'someSignedResponse'
          }
        });
        Expect.isJsonPost($.ajax.calls.argsFor(1), {
          url: 'https://foo.com/api/v1/authn/factors/ost947vv5GOSPjt9C0g4/lifecycle/activate/poll',
          data: {
            stateToken: 'testStateToken'
          }
        });
      });
    });

  });

});
