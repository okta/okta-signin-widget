import { _ } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'v1/LoginRouter';
import GranularConsentRequiredForm from 'helpers/dom/GranularConsentRequiredForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resCancel from 'helpers/xhr/CANCEL';
import resGranularConsentRequired from 'helpers/xhr/GRANULAR_CONSENT_REQUIRED';
import resSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const itp = Expect.itp;


function setup(settings, res) {
  settings || (settings = {});
  const successSpy = jasmine.createSpy('successSpy');
  const setNextResponse = Util.mockAjax();
  const baseUrl = window.location.origin;
  const logoUrl = '/img/logos/default.png';
  const authClient = getAuthClient({
    authParams: {
      issuer: baseUrl,
      transformErrorXHR: LoginUtil.transformErrorXHR
    }
  });
  const router = new Router(
    _.extend(
      {
        el: $sandbox,
        baseUrl: baseUrl,
        logo: logoUrl,
        authClient: authClient,
        globalSuccessFn: successSpy,
      },
      settings
    )
  );

  Util.registerRouter(router);
  Util.mockRouterNavigate(router);
  Util.mockJqueryCss();
  setNextResponse(res || resGranularConsentRequired);
  router.refreshAuthState('dummy-token');
  settings = {
    router: router,
    successSpy: successSpy,
    form: new GranularConsentRequiredForm($sandbox),
    ac: authClient,
    setNextResponse: setNextResponse,
  };
  return Expect.waitForGranularConsent(settings);
}

Expect.describe('GranularConsent', function() {
  describe('ScopeCheckBox', function() {

    itp('has the correct number of scopes', function() {
      return setup().then(function(test) {
        expect(test.form.scopeCheckBoxLabels().length).toEqual(5);
      });
    });

    itp('shows displayName instead of name if the first is available', function() {
      return setup().then(function(test) {
        expect(test.form.scopeCheckBoxLabels()[0].textContent).toEqual(expect.stringContaining('View your mobile phone data plan.'));
        expect(test.form.scopeCheckBoxLabels()[0].textContent).toEqual(expect.not.stringContaining('custom1'));
      });
    });

    itp('shows name if displayName is not available', function() {
      return setup().then(function(test) {
        expect(test.form.scopeCheckBoxLabels()[3].textContent).toEqual(expect.stringContaining('openid'));
      });
    });

    itp('shows description if available', function() {
      return setup().then(function(test) {
        expect(test.form.scopeCheckBoxLabels()[2].textContent).toEqual(expect.stringContaining('This allows the app to view your email address.'));
      });
    });

    itp('shows only mandatory scopes as disabled', function() {
      return setup().then(function(test) {
        expect(test.form.disabledScopeCheckBoxLabels().length).toEqual(2);
        expect(test.form.disabledScopeCheckBoxLabels()[0].textContent).toEqual(expect.stringContaining('openid'));
        expect(test.form.disabledScopeCheckBoxLabels()[1].textContent).toEqual(expect.stringContaining('View your profile information.'));
      });
    });

    itp('initializes all checkboxes as checked', function() {
      return setup().then(function(test) {
        for (const box of test.form.scopeCheckBoxes()) {
          expect(box.checked).toBe(true);
        }
      });
    });
  });

  describe('ConsentForm', function() {

    itp('has the correct default client logo', function() {
      return setup().then(function(test) {
        expect(test.form.clientLogoLink().length).toEqual(0);
        expect(test.form.clientLogo().attr('src')).toBe(`${window.location.origin}/img/logos/default.png`);
      });
    });

    itp('has the correct app name in the title', function() {
      return setup().then(function(test) {
        expect(test.form.clientName().text().trim()).toBe('Janky App');
      });
    });

    itp('has the correct text in the title', function() {
      return setup().then(function(test) {
        expect(test.form.consentTitleText().text().trim()).toBe('requests access to your account');
      });
    });

    itp('has the correct consent description', function() {
      return setup().then(function(test) {
        expect(test.form.consentDescription().text().trim()).toBe('Allowing access will share');
      });
    });

    itp('has the correct term of services link', function() {
      return setup().then(function(test) {
        expect(test.form.termsOfService().attr('href')).toBe('https://example.okta.com/tos.html');
      });
    });

    itp('has the correct privacy policy link', function() {
      return setup().then(function(test) {
        expect(test.form.privacyPolicy().attr('href')).toBe('https://example.okta.com/policy.html');
      });
    });

    itp('has the consent button', function() {
      return setup().then(function(test) {
        expect(test.form.consentButton().length).toEqual(1);
        expect(test.form.consentButton().attr('value')).toBe('Allow Access');
        expect(test.form.consentButton().attr('class')).toBe('button');
      });
    });

    itp('sends correct payload on "Allow Access" click', function() {
      return setup()
        .then(function(test) {
          test.form.scopeCheckBox('custom1').click();
          test.form.scopeCheckBox('custom2').click();
          test.form.scopeCheckBox('email').click();

          Util.resetAjaxRequests();
          test.setNextResponse(resSuccess);
          test.form.consentButton().click();
          return Expect.waitForAjaxRequest();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.lastAjaxRequest(), {
            url: 'https://example.okta.com/api/v1/authn/consent',
            data: {
              consent: {
                expiresAt: '2017-07-20T00:06:25.000Z',
                optedScopes: {
                  'openid': true,
                  'custom1': false,
                  'custom2': false,
                  'email': false,
                  'profile': true
                },
              },
              stateToken: 'testStateToken',
            },
          });
        });
    });

    itp('has the cancel button', function() {
      return setup().then(function(test) {
        expect(test.form.cancelButton().length).toEqual(1);
        expect(test.form.cancelButton().attr('value')).toBe('Cancel');
        expect(test.form.cancelButton().attr('class')).toBe('button button-clear');
      });
    });

    itp('sends correct payload on "Cancel" click', function() {
      const cancel = jasmine.createSpy('cancel');

      return setup({ consent: { cancel } })
        .then(function(test) {
          spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
          Util.resetAjaxRequests();
          test.setNextResponse(resCancel);
          test.form.cancelButton().click();
          return Expect.waitForAjaxRequest(test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.lastAjaxRequest(), {
            url: 'https://example.okta.com/api/v1/authn/cancel',
            data: {
              stateToken: 'testStateToken',
            },
          });
          return Expect.wait(function() {
            return test.router.controller.options.appState.clearLastAuthResponse.calls.count() > 0;
          }, test);
        })
        .then(function(test) {
          expect(test.router.controller.options.appState.clearLastAuthResponse).toHaveBeenCalled();
          expect(cancel).toHaveBeenCalled();
        });
    });
  });
});