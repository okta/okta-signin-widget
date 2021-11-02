/* eslint max-params: [2, 16] */
import getAuthClient from 'widget/getAuthClient';
import Router from 'LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import Form from 'helpers/dom/EnrollHotpForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resEnrollAllFactors from 'helpers/xhr/MFA_ENROLL_allFactors';
import $sandbox from 'sandbox';

const itp = Expect.itp;

Expect.describe('EnrollHotp', function() {
  function setup() {
    const setNextResponse = Util.mockAjax();
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: { issuer: baseUrl }
    });
    const successSpy = jasmine.createSpy('success');
    const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    const router = new Router({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy,
    });
    router.on('afterError', afterErrorHandler);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);

    setNextResponse(resEnrollAllFactors);
    router.refreshAuthState('dummy-token');
    return Expect.waitForEnrollChoices().then(function() {
      router.enrollHotpFactor('custom', 'token:hotp');
      return Expect.waitForEnrollHotp({
        router: router,
        beacon: new Beacon($sandbox),
        form: new Form($sandbox),
        ac: authClient,
        setNextResponse: setNextResponse,
        successSpy: successSpy,
        afterErrorHandler: afterErrorHandler,
      });
    });
  }

  Expect.describe('Header & Footer', function() {
    itp('displays the correct factorBeacon', function() {
      return setup().then(function(test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-hotp')).toBe(true);
      });
    });
    itp('has a "back" link in the footer', function() {
      return setup().then(function(test) {
        Expect.isVisible(test.form.backLink());
      });
    });
  });

  Expect.describe('Enroll factor', function() {
    itp('is restricted', function() {
      return setup().then(function(test) {
        expect(test.form.errorHtml().length).toEqual(1);
        expect(test.form.errorHtml().html()).toEqual('Contact your administrator to continue enrollment.');
      });
    });

    itp('has right profile name', function() {
      return setup().then(function(test) {
        expect(test.form.title().length).toEqual(1);
        expect(test.form.title().html()).toEqual('Setup Entrust');
      });
    });
  });
});
