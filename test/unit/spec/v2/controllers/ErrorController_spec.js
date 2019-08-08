/* eslint max-params: [2, 25] */
import { _ } from 'okta';
import OktaAuth from '@okta/okta-auth-js/jquery';
import Beacon from 'helpers/dom/Beacon';
import FormView from 'helpers/dom/Form';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resFactorRequiredEmail from 'helpers/xhr/v2/FACTOR_REQUIRED_EMAIL';
import Q from 'q';
import $sandbox from 'sandbox';
import Router from 'v2/WidgetRouter';
const itp = Expect.itp;
const tick = Expect.tick;


function setup (settings) {
  const setNextResponse = Util.mockAjax();
  const baseUrl = 'https://foo.com';
  const authClient = new OktaAuth({ url: baseUrl });
  const router = new Router(_.extend({
    el: $sandbox,
    baseUrl: baseUrl,
    authClient: authClient,
    useIdxPipeline: true
  }, settings));
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
    setNextResponse: setNextResponse
  });
}

Expect.describe('ErrorController', function () {
  itp('Show error message if widget is bootstrapped with no statetoken', function () {
    return setup().then(function (test) {
      test.setNextResponse(resFactorRequiredEmail);
      test.router.defaultAuth();
      return tick(test);
    }).then(function (test) {
      const error = test.router.controller.$el.find('.error-message').text();

      expect(error).toBe('Widget bootstrapped with no stateToken');
    });
  });
});