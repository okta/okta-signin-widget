/* eslint max-params: [2, 13], camelcase: 0 */
import { _ } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'v1/LoginRouter';
import Duo from 'duo';
import Beacon from 'helpers/dom/Beacon';
import Form from 'helpers/dom/EnrollDuoForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resActivateDuo from 'helpers/xhr/MFA_ENROLL_ACTIVATE_duo';
import resAllFactors from 'helpers/xhr/MFA_ENROLL_allFactors';
import resSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
const itp = Expect.itp;
const tick = Expect.tick;

Expect.describe('EnrollDuo', function() {
  function setup(startRouter) {
    const setNextResponse = Util.mockAjax();
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: { issuer: baseUrl }
    });
    const router = new Router({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      'features.router': startRouter,
    });

    Util.registerRouter(router);
    Util.mockRouterNavigate(router, startRouter);
    Util.mockDuo();

    const test = {
      router: router,
      beacon: new Beacon($sandbox),
      form: new Form($sandbox),
      ac: authClient,
      setNextResponse: setNextResponse,
    };

    const enrollDuo = test => {
      setNextResponse(resAllFactors);
      router.refreshAuthState('dummy-token');
      return Expect.waitForEnrollChoices(test).then(function(test) {
        setNextResponse(resActivateDuo);
        router.enrollDuo();
        return Expect.waitForEnrollDuo(test);
      });
    };

    if (startRouter) {
      return Expect.waitForPrimaryAuth(test).then(enrollDuo);
    } else {
      return enrollDuo(test);
    }
  }

  itp('displays the correct factorBeacon', function() {
    return setup().then(function(test) {
      expect(test.beacon.isFactorBeacon()).toBe(true);
      expect(test.beacon.hasClass('mfa-duo')).toBe(true);
    });
  });
  itp('iframe has title', function() {
    return setup().then(function(test) {
      expect(test.form.iframe().attr('title')).toBe(test.form.titleText());
    });
  });
  itp('visits previous link when back link is clicked', function() {
    return setup()
      .then(function(test) {
        Util.resetAjaxRequests();
        test.setNextResponse(resAllFactors);
        test.form.backLink().click();
        return Expect.waitForEnrollChoices();
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/previous',
          data: {
            stateToken: 'testStateToken',
          },
        });
      });
  });
  itp('returns to factor list when browser\'s back button is clicked', function() {
    return setup(true)
      .then(function(test) {
        test.setNextResponse(resAllFactors);
        Util.triggerBrowserBackButton();
        return Expect.waitForEnrollChoices(test);
      })
      .then(function(test) {
        Expect.isEnrollChoices(test.router.controller);
        Util.stopRouter();
      });
  });
  itp('makes the right init request', function() {
    return setup().then(function() {
      expect(Util.numAjaxRequests()).toBe(2);
      Expect.isJsonPost(Util.getAjaxRequest(1), {
        url: 'https://foo.com/api/v1/authn/factors',
        data: {
          factorType: 'web',
          provider: 'DUO',
          stateToken: 'testStateToken',
        },
      });
    });
  });
  itp('initializes duo correctly', function() {
    return setup().then(function(test) {
      const initOptions = Duo.init.calls.mostRecent().args[0];

      expect(initOptions.host).toBe('api123443.duosecurity.com');
      expect(initOptions.sig_request).toBe('sign_request(ikey, skey, akey, username)');
      expect(initOptions.iframe).toBe(test.form.iframe().get(0));
      expect(_.isFunction(initOptions.post_action)).toBe(true);
    });
  });
  itp('notifies okta when duo is done, and completes enrollment', function() {
    return setup()
      .then(function(test) {
        Util.resetAjaxRequests();
        test.setNextResponse(resSuccess);
        // Duo callback (returns an empty response)
        test.setNextResponse({
          status: 200,
          responseType: 'json',
          response: {},
        });
        const postAction = Duo.init.calls.mostRecent().args[0].post_action;

        postAction('someSignedResponse');
        return tick();
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(2);
        Expect.isFormPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/factors/ost947vv5GOSPjt9C0g4/lifecycle/activate/response',
          data: {
            id: ['ost947vv5GOSPjt9C0g4'],
            stateToken: ['testStateToken'],
            sig_response: ['someSignedResponse'],
          },
        });
        Expect.isJsonPost(Util.getAjaxRequest(1), {
          url: 'https://foo.com/api/v1/authn/factors/ost947vv5GOSPjt9C0g4/lifecycle/activate/poll',
          data: {
            stateToken: 'testStateToken',
          },
        });
      });
  });
});
