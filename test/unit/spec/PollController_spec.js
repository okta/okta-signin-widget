import { _ } from 'okta';
import createAuthClient from 'widget/createAuthClient';
import Router from 'LoginRouter';
import PollingForm from 'helpers/dom/PollingForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resCancel from 'helpers/xhr/CANCEL';
import resPolling from 'helpers/xhr/POLLING';
import resSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';

function setup(settings, res) {
  settings || (settings = {});
  const successSpy = jasmine.createSpy('successSpy');
  const setNextResponse = Util.mockAjax();
  const baseUrl = window.location.origin;
  const authClient = createAuthClient({ issuer: baseUrl });
  const router = new Router(
    _.extend(
      {
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy,
      },
      settings
    )
  );

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
    setNextResponse: setNextResponse,
  };
  return Expect.waitForPoll(settings);
}

Expect.describe('Polling', function() {
  describe('Form Content', function() {
    it('shows the correct content on load', function(done) {
      return setup()
        .then(function(test) {
          const title =
            'There are too many users trying to sign in right now. We will automatically retry in 1 seconds.';
          expect(test.form.pageTitle().text().trim()).toBe(title);
          done();
        })
        .catch(done.fail);
    });
    it('has the cancel button', function(done) {
      return setup()
        .then(function(test) {
          expect(test.form.cancelButton().length).toEqual(1);
          expect(test.form.cancelButton().attr('value')).toBe('Cancel');
          expect(test.form.cancelButton().attr('class')).toBe('button button-primary');
          done();
        })
        .catch(done.fail);
    });
    it('cancel button clicked cancels the current stateToken and calls the cancel function', function() {
      return setup({}, [resPolling, resPolling, resPolling, resCancel])
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resCancel);
          test.form.cancelButton().click();
          return Expect.waitForAjaxRequest(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://example.okta.com/api/v1/authn/cancel',
            data: {
              stateToken: '00caLtr2zn6rEXWaHyNNmTfczuToPNY2R8y3f0yAK_',
            },
          });
        });
    });
  });
});

Expect.describe('Polling API', function() {
  describe('called on load', function() {
    it('makes the request correctly', function(done) {
      setup({}, [resPolling, resPolling, resSuccess])
        .then(() => {
          // TODO: refactor to use Util.callAllTimeouts() to remove long timeout value: https://oktainc.atlassian.net/browse/OKTA-291740
          setTimeout(function() {
            expect(Util.numAjaxRequests()).toBe(3);
            // first call is for refresh-auth
            // poll
            Expect.isJsonPost(Util.getAjaxRequest(1), {
              url: 'https://example.okta.com/api/v1/authn/poll',
              data: {
                stateToken: '00caLtr2zn6rEXWaHyNNmTfczuToPNY2R8y3f0yAK_',
              },
            });
            // 2nd poll
            Expect.isJsonPost(Util.getAjaxRequest(2), {
              url: 'https://example.okta.com/api/v1/authn/poll',
              data: {
                stateToken: '00caLtr2zn6rEXWaHyNNmTfczuToPNY2R8y3f0yAK_',
              },
            });
            done();
          }, 5000);
        })
        .catch(done.fail);
    });
  });
});
