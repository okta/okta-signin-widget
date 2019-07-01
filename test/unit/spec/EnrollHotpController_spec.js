/* eslint max-params: [2, 16] */
define([
  'okta',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/EnrollHotpForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'sandbox',
  'LoginRouter',
  'helpers/xhr/MFA_ENROLL_allFactors'
],
function (Okta,
  OktaAuth,
  Util,
  Form,
  Beacon,
  Expect,
  $sandbox,
  Router,
  resEnrollAllFactors) {

  const { _, $ } = Okta;
  const itp = Expect.itp;
  const tick = Expect.tick;

  Expect.describe('EnrollHotp', function () {

    function setup (settings) {
      settings || (settings = {});
      const setNextResponse = Util.mockAjax();
      const baseUrl = 'https://foo.com';
      const authClient = new OktaAuth({url: baseUrl});
      const successSpy = jasmine.createSpy('success');
      const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
      const router = new Router(_.extend({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy
      }, settings));
      router.on('afterError', afterErrorHandler);
      Util.registerRouter(router);
      Util.mockRouterNavigate(router);
      return tick()
        .then(function () {
          setNextResponse(resEnrollAllFactors);
          router.refreshAuthState('dummy-token');
          return Expect.waitForEnrollChoices();
        })
        .then(function () {
          router.enrollHotpFactor('custom', 'token:hotp');
          return Expect.waitForEnrollHotp({
            router: router,
            beacon: new Beacon($sandbox),
            form: new Form($sandbox),
            ac: authClient,
            setNextResponse: setNextResponse,
            successSpy: successSpy,
            afterErrorHandler: afterErrorHandler
          });
        });
    }

    function setupWithCustomBackLink () {
      return setup({
        'features.showCustomizableBackLinkInMFA': true,
        customizableBackLinkInMFA: {
          label: 'Custom Back Link',
          fn: function (e) {
            $(e.target).addClass('test-back-link-class');
          },
        }
      });
    }

    Expect.describe('Header & Footer', function () {
      itp('displays the correct factorBeacon', function () {
        return setup().then(function (test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-hotp')).toBe(true);
        });
      });
      itp('has a "back" link in the footer', function () {
        return setup().then(function (test) {
          Expect.isVisible(test.form.backLink());
          expect(test.form.backLink().text().trim()).toBe('Back to factor list');
        });
      });
      itp('shows custom back link if features.showCustomizableBackLinkInMFA is true', function () {
        return setupWithCustomBackLink().then(function (test) {
          expect(test.form.backLink().length).toBe(1);
          expect(test.form.backLink().text().trim()).toBe('Custom Back Link');
          expect(test.form.backLink().hasClass('test-back-link-class')).toBe(false);
          test.form.backLink().click();
          expect(test.form.backLink().hasClass('test-back-link-class')).toBe(true);
        });
      });
    });

    Expect.describe('Enroll factor', function () {
      itp('is restricted', function () {
        return setup().then(function (test) {
          expect(test.form.errorHtml()).toHaveLength(1);
          expect(test.form.errorHtml().html())
            .toEqual('Contact your administrator to continue enrollment.');
        });
      });

      itp('has right profile name', function () {
        return setup().then(function (test) {
          expect(test.form.title()).toHaveLength(1);
          expect(test.form.title().html())
            .toEqual('Setup Entrust');
        });
      });
    });
  });
});
