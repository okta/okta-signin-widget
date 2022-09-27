import { _ } from 'okta';
import getAuthClient from 'helpers/getAuthClient';
import Router from 'v1/LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import FormView from 'helpers/dom/Form';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resEnroll from 'helpers/xhr/MFA_ENROLL_allFactors';
import Q from 'q';
import $sandbox from 'sandbox';
const itp = Expect.itp;

function setup(settings) {
  const setNextResponse = Util.mockAjax();
  const baseUrl = 'https://foo.com';
  const authClient = getAuthClient({
    authParams: { issuer: baseUrl }
  });
  const router = new Router(
    _.extend(
      {
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        features: {
          securityImage: true,
        },
      },
      settings
    )
  );
  const beacon = new Beacon($sandbox);
  const form = new FormView($sandbox);

  Util.registerRouter(router);
  Util.mockRouterNavigate(router);
  Util.mockJqueryCss();
  return Q({
    router: router,
    beacon: beacon,
    form: form,
    ac: authClient,
    setNextResponse: setNextResponse,
  });
}

Expect.describe('RefreshAuthState', function() {
  itp('redirects to PrimaryAuth if authClient does not need a refresh', function() {
    return setup({}, true)
      .then(function(test) {
        spyOn(test.ac.tx, 'exists').and.returnValue(false);
        test.router.refreshAuthState();
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function(test) {
        Expect.isPrimaryAuth(test.router.controller);
      });
  });
  itp('refreshes auth state and picks token from cookie', function() {
    return setup()
      .then(function(test) {
        Util.mockSDKCookie(test.ac, null, 'a-token-in-cookie');
        test.setNextResponse(resEnroll);
        test.router.refreshAuthState();
        return Expect.waitForEnrollChoices();
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn',
          data: {
            stateToken: 'a-token-in-cookie',
          },
        });
      });
  });
  itp('calls status with token if initialized with token passed directly to controller via options', function() {
    return setup()
      .then(function(test) {
        test.setNextResponse(resEnroll);
        test.router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollChoices();
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/introspect',
          data: {
            stateToken: 'dummy-token',
          },
        });
      });
  });
});
