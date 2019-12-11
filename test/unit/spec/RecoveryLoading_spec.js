/* eslint max-params: [2, 15] */
define([
  'q',
  'okta',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/Beacon',
  'helpers/dom/RecoveryQuestionForm',
  'helpers/dom/PrimaryAuthForm',
  'helpers/util/Expect',
  'LoginRouter',
  'helpers/xhr/RECOVERY',
  'helpers/xhr/RECOVERY_EXPIRED_error',
  'sandbox'
],
function (Q, Okta, OktaAuth, Util, Beacon, RecoveryFormView, PrimaryAuthFormView,
  Expect, Router, resRecovery, resError, $sandbox) {

  var { _, $ } = Okta;
  var itp = Expect.itp;

  function setup (settings, callRecoveryLoading, fail = false) {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl});
    var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient
    }, settings));
    router.on('afterError', afterErrorHandler);
    var beacon = new Beacon($sandbox);
    var form = new RecoveryFormView($sandbox);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);

    setNextResponse(fail ? resError : resRecovery);

    var testData = {
      router: router,
      beacon: beacon,
      form: form,
      ac: authClient,
      setNextResponse: setNextResponse,
      afterErrorHandler: afterErrorHandler
    };

    if (callRecoveryLoading) {
      router.navigate('signin/recovery/SOMETOKEN', { trigger: true });
    } else {
      router.navigate('', { trigger: true });
    }
    // shall not resolve / wait for anything that may cause promise.resolve,
    // which will end the test.
    // @see Expect.runTest
    return Q(testData);
  }

  Expect.describe('Recovery Loading', function () {

    itp('makes a request with correct token passed in url', function () {
      return setup({}, true)
        .then(test => {
          return Expect.waitForRecoveryQuestion(test);
        })
        .then(function (test) {
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
      return setup({recoveryToken: 'SETTINGSTOKEN'}, false)
        .then(test => {
          return Expect.waitForRecoveryQuestion(test);
        })
        .then(function (test) {
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
        })
        .then(function () {
          var form = new PrimaryAuthFormView($sandbox);
          expect(form.isPrimaryAuth()).toBe(true);
        });
    });

    // NOTES:
    // It doesn't actually do this. Will leave this here as a reminder that
    // this functionality has not been implemented yet.
    // ======
    // it('calls a callback function if no token passed in settings');
    // ======

    itp('triggers an afterError event when a request with a stale token passed in settings', function () {
      return setup({recoveryToken: 'foo'}, false, true)
        .then(test => {
          return Expect.waitForRecoveryLoading(test);
        })
        .then(test => {
          return Expect.waitForSpyCall(test.afterErrorHandler, test);
        })
        .then(function (test) {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/recovery/token',
            data: {
              recoveryToken: 'foo'
            }
          });
          expect(test.form.isRecoveryQuestion()).toBe(false);
          expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
          expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'recovery-loading'
            },
            {
              name: 'AuthApiError',
              message: 'You have accessed an account recovery link that has expired or been previously used.',
              statusCode: 403,
              xhr: {
                status: 403,
                responseType: 'json',
                responseText: '{"errorCode":"E0000105","errorSummary":"You have accessed an account recovery link that has expired or been previously used.","errorLink":"E0000105","errorId":"oaeJFD_L3CcQoC9Am9y7tpfrQ","errorCauses":[]}',
                responseJSON: {
                  errorCode: 'E0000105',
                  errorSummary: 'You have accessed an account recovery link that has expired or been previously used.',
                  errorLink: 'E0000105',
                  errorId: 'oaeJFD_L3CcQoC9Am9y7tpfrQ',
                  errorCauses: []
                }
              }
            }
          ]);
        });
    });
  });

});
