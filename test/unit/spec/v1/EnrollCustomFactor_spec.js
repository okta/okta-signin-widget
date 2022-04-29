/* eslint max-params:[2, 16] */
import { internal } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'v1/LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import Form from 'helpers/dom/EnrollCustomFactorForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import responseMfaEnrollActivateClaimsProvider from 'helpers/xhr/MFA_ENROLL_ACTIVATE_ClaimsProvider';
import responseMfaEnrollActivateCustomOidc from 'helpers/xhr/MFA_ENROLL_ACTIVATE_CustomOidc';
import responseMfaEnrollActivateCustomSaml from 'helpers/xhr/MFA_ENROLL_ACTIVATE_CustomSaml';
import responseMfaEnrollAll from 'helpers/xhr/MFA_ENROLL_allFactors';
import resNoPermissionError from 'helpers/xhr/NO_PERMISSION_error';
import responseSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const SharedUtil = internal.util.Util;
const itp = Expect.itp;

Expect.describe('EnrollCustomFactor', function() {
  function setup(factorType) {
    const setNextResponse = Util.mockAjax([responseMfaEnrollAll]);
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: { issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR }
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

    setNextResponse(responseMfaEnrollAll);
    router.refreshAuthState('dummy-token');
    return Expect.waitForEnrollChoices().then(function() {
      switch (factorType) {
      case 'custom_oidc':
        router.enrollOIDCFactor();
        break;
      case 'custom_saml':
        router.enrollSAMLFactor();
        break;
      case 'claims_provider':
        router.enrollClaimsFactor();
        break;
      }
      return Expect.waitForEnrollCustomFactor({
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

  Expect.describe('Enroll factor', function() {
    Expect.describe('GENERIC_SAML', function() {
      itp('displays the correct factorBeacon', function() {
        return setup('custom_saml').then(function(test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-custom-factor')).toBe(true);
        });
      });

      itp('has a "back" link in the footer', function() {
        return setup('custom_saml').then(function(test) {
          Expect.isVisible(test.form.backLink());
        });
      });

      itp('displays correct title', function() {
        return setup('custom_saml').then(function(test) {
          test.setNextResponse(responseSuccess);
          expect(test.form.titleText()).toBe('Third Party Factor');
          expect(test.form.buttonBar().hasClass('hide')).toBe(false);
        });
      });

      itp('displays correct subtitle', function() {
        return setup('custom_saml').then(function(test) {
          test.setNextResponse(responseSuccess);
          expect(test.form.subtitleText()).toBe(
            'Clicking below will redirect to MFA enrollment with Third Party Factor'
          );
          expect(test.form.buttonBar().hasClass('hide')).toBe(false);
        });
      });

      itp('redirects to third party when Enroll button is clicked', function() {
        spyOn(SharedUtil, 'redirect');
        return setup('custom_saml')
          .then(function(test) {
            test.setNextResponse([responseMfaEnrollActivateCustomSaml, responseSuccess]);
            test.form.submit();
            return Expect.waitForSpyCall(SharedUtil.redirect);
          })
          .then(function() {
            expect(SharedUtil.redirect).toHaveBeenCalledWith(
              'http://rain.okta1.com:1802/policy/mfa-saml-idp-redirect?okta_key=mfa.redirect.id'
            );
          });
      });

      itp('displays error when error response received', function() {
        return setup('custom_saml')
          .then(function(test) {
            test.setNextResponse(resNoPermissionError);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
            expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
            expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
              {
                controller: 'enroll-custom-factor',
              },
              {
                name: 'AuthApiError',
                message: 'You do not have permission to perform the requested action',
                statusCode: 403,
                xhr: {
                  status: 403,
                  headers: { 'content-type': 'application/json' },
                  responseType: 'json',
                  responseText: '{"errorCode":"E0000006","errorSummary":"You do not have permission to perform the requested action","errorLink":"E0000006","errorId":"oae3CaVvE33SqKyymZRyUWE7Q","errorCauses":[]}',
                  responseJSON: {
                    errorCode: 'E0000006',
                    errorSummary: 'You do not have permission to perform the requested action',
                    errorLink: 'E0000006',
                    errorId: 'oae3CaVvE33SqKyymZRyUWE7Q',
                    errorCauses: [],
                  },
                },
              },
            ]);
          });
      });
    });

    Expect.describe('GENERIC_OIDC', function() {
      itp('displays the correct factorBeacon', function() {
        return setup('custom_oidc').then(function(test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-custom-factor')).toBe(true);
        });
      });

      itp('has a "back" link in the footer', function() {
        return setup('custom_oidc').then(function(test) {
          Expect.isVisible(test.form.backLink());
        });
      });

      itp('displays correct title', function() {
        return setup('custom_oidc').then(function(test) {
          test.setNextResponse(responseSuccess);
          expect(test.form.titleText()).toBe('OIDC Factor');
          expect(test.form.buttonBar().hasClass('hide')).toBe(false);
        });
      });

      itp('displays correct subtitle', function() {
        return setup('custom_oidc').then(function(test) {
          test.setNextResponse(responseSuccess);
          expect(test.form.subtitleText()).toBe('Clicking below will redirect to MFA enrollment with OIDC Factor');
          expect(test.form.buttonBar().hasClass('hide')).toBe(false);
        });
      });

      itp('redirects to third party when Enroll button is clicked', function() {
        spyOn(SharedUtil, 'redirect');
        return setup('custom_oidc')
          .then(function(test) {
            test.setNextResponse([responseMfaEnrollActivateCustomOidc, responseSuccess]);
            test.form.submit();
            return Expect.waitForSpyCall(SharedUtil.redirect);
          })
          .then(function() {
            expect(SharedUtil.redirect).toHaveBeenCalledWith(
              'http://rain.okta1.com:1802/policy/mfa-oidc-idp-redirect?okta_key=mfa.redirect.id'
            );
          });
      });

      itp('displays error when error response received', function() {
        return setup('custom_oidc')
          .then(function(test) {
            test.setNextResponse(resNoPermissionError);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
          });
      });
    });

    Expect.describe('CUSTOM_CLAIMS', function() {
      itp('displays the correct factorBeacon', function() {
        return setup('claims_provider').then(function(test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-custom-factor')).toBe(true);
        });
      });

      itp('has a "back" link in the footer', function() {
        return setup('claims_provider').then(function(test) {
          Expect.isVisible(test.form.backLink());
        });
      });

      itp('displays correct title', function() {
        return setup('claims_provider').then(function(test) {
          test.setNextResponse(responseSuccess);
          expect(test.form.titleText()).toBe('IDP factor');
          expect(test.form.buttonBar().hasClass('hide')).toBe(false);
        });
      });

      itp('displays correct subtitle', function() {
        return setup('claims_provider').then(function(test) {
          test.setNextResponse(responseSuccess);
          expect(test.form.subtitleText()).toBe('Clicking below will redirect to MFA enrollment with IDP factor');
          expect(test.form.buttonBar().hasClass('hide')).toBe(false);
        });
      });

      itp('redirects to third party when Enroll button is clicked', function() {
        spyOn(SharedUtil, 'redirect');
        return setup('claims_provider')
          .then(function(test) {
            test.setNextResponse([responseMfaEnrollActivateClaimsProvider, responseSuccess]);
            test.form.submit();
            return Expect.waitForSpyCall(SharedUtil.redirect);
          })
          .then(function() {
            expect(SharedUtil.redirect).toHaveBeenCalledWith(
              'http://rain.okta1.com:1802/sso/idps/idpId?stateToken=testStateToken'
            );
          });
      });

      itp('displays error when error response received', function() {
        return setup('claims_provider')
          .then(function(test) {
            test.setNextResponse(resNoPermissionError);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
          });
      });
    });
  });
});
