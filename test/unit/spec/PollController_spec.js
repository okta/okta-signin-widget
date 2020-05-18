define([
  'okta',
  '@okta/okta-auth-js',
  'helpers/mocks/Util',
  'helpers/dom/PollingForm',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/POLLING',
  'helpers/xhr/CANCEL',
  'helpers/xhr/SUCCESS'
],
function (Okta, OktaAuth, Util, PollingForm, Expect, Router, $sandbox, resPolling, resCancel, resSuccess) {

  var { _ } = Okta;

  function setup (settings, res) {
    settings || (settings = {});
    var successSpy = jasmine.createSpy('successSpy');
    var setNextResponse = Util.mockAjax();
    var baseUrl = window.location.origin;
    var authClient = new OktaAuth({issuer: baseUrl});
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy
    }, settings));
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    Util.mockJqueryCss();
    setNextResponse(res || [resPolling, resPolling, resPolling]);
    router.refreshAuthState('polling-token');
    settings = {
      router: router,
      successSpy: successSpy,
      form: new PollingForm($sandbox),
      ac: authClient,
      setNextResponse: setNextResponse
    };
    return Expect.waitForPoll(settings);
  }

  Expect.describe('Polling', function () {
    describe('Form Content', function () {
      it('shows the correct content on load', function (done) {
        return setup().then(function (test) {
          const title = 'There are too many users trying to sign in right now. We will automatically retry in 1 seconds.';
          expect(test.form.pageTitle().text().trim()).toBe(title);
          done();
        }).catch(done.fail);
      });
      it('has the cancel button', function (done) {
        return setup().then(function (test) {
          expect(test.form.cancelButton()).toExist();
          expect(test.form.cancelButton().attr('value')).toBe('Cancel');
          expect(test.form.cancelButton().attr('class')).toBe('button button-primary');
          done();
        }).catch(done.fail);
      });
      it('cancel button clicked cancels the current stateToken and calls the cancel function', function () {
        return setup({}, [resPolling, resPolling, resPolling, resCancel]).then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resCancel);
          test.form.cancelButton().click();
          return Expect.waitForAjaxRequest(test);
        })
          .then(function () {
            expect(Util.numAjaxRequests()).toBe(1);
            Expect.isJsonPost(Util.getAjaxRequest(0), {
              url: 'https://example.okta.com/api/v1/authn/cancel',
              data: {
                stateToken: '00caLtr2zn6rEXWaHyNNmTfczuToPNY2R8y3f0yAK_'
              }
            });
          });
      });
    });
  });

  Expect.describe('Polling API', function () {
    describe('called on load', function () {
      it('makes the request correctly', function (done) {
        setup({}, [resPolling, resPolling, resSuccess]).then(() => {
          // TODO: refactor to use Util.callAllTimeouts() to remove long timeout value: https://oktainc.atlassian.net/browse/OKTA-291740
          setTimeout(function () {
            expect(Util.numAjaxRequests()).toBe(3);
            // first call is for refresh-auth
            // poll
            Expect.isJsonPost(Util.getAjaxRequest(1), {
              url: 'https://example.okta.com/api/v1/authn/poll',
              data: {
                stateToken: '00caLtr2zn6rEXWaHyNNmTfczuToPNY2R8y3f0yAK_'
              }
            });
            // 2nd poll
            Expect.isJsonPost(Util.getAjaxRequest(2), {
              url: 'https://example.okta.com/api/v1/authn/poll',
              data: {
                stateToken: '00caLtr2zn6rEXWaHyNNmTfczuToPNY2R8y3f0yAK_'
              }
            });
            done();
          }, 5000);
        }).catch(done.fail);
      });
    });
  });
});