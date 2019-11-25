/* eslint max-params: [2, 25] */
import { _, $ } from 'okta';
import OktaAuth from '@okta/okta-auth-js/jquery';
import Beacon from 'helpers/dom/Beacon';
import FormView from 'helpers/dom/Form';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resFactorRequiredEmail from 'helpers/xhr/v2/FACTOR_REQUIRED_EMAIL';
import $sandbox from 'sandbox';
import Router from 'v2/WidgetRouter';

const itp = Expect.itp;

function setup (settings, resp) {
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
  setNextResponse(resp);
  return Util.mockIntrospectResponse(router, resp).then(function () {
    return {
      router: router,
      beacon: beacon,
      form: form,
      ac: authClient,
      setNextResponse: setNextResponse
    };
  });
}

Expect.describe('Introspect API', function () {
  itp('makes introspect API call to refresh auth state on render', function () {
    return setup({ stateToken: 'dummy-token' }, resFactorRequiredEmail)
      .then(function () {
        return Expect.waitForSpyCall($.ajax);
      })
      .then(function () {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/idp/idx/introspect',
          data: {
            stateToken: 'dummy-token',
          }
        });
      });
  });
});
