/* eslint max-params:[2, 15] */
define([
  'okta',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/EnrollCustomFactorForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'sandbox',
  'LoginRouter',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_CustomSaml',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_CustomOidc',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_ClaimsProvider',
  'helpers/xhr/NO_PERMISSION_error',
  'helpers/xhr/SUCCESS'
],
function (Okta,
  OktaAuth,
  LoginUtil,
  Util,
  Form,
  Beacon,
  Expect,
  $sandbox,
  Router,
  responseMfaEnrollAll,
  responseMfaEnrollActivateCustomSaml,
  responseMfaEnrollActivateCustomOidc,
  responseMfaEnrollActivateClaimsProvider,
  resNoPermissionError,
  responseSuccess) {

  var SharedUtil = Okta.internal.util.Util;
  var itp = Expect.itp;
  var tick = Expect.tick;

  Expect.describe('EnrollCustomFactor', function () {

    function setup (factorType) {
      var setNextResponse = Util.mockAjax([responseMfaEnrollAll]);
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
      var successSpy = jasmine.createSpy('success');
      var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy
      });
      router.on('afterError', afterErrorHandler);
      Util.registerRouter(router);
      Util.mockRouterNavigate(router);
      return tick()
        .then(function () {
          setNextResponse(responseMfaEnrollAll);
          return Util.mockIntrospectResponse(router, responseMfaEnrollAll);
        })
        .then(function () {
          router.refreshAuthState('dummy-token');
          return Expect.waitForEnrollChoices();
        })
        .then(function () {
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
            afterErrorHandler: afterErrorHandler
          });
        });
    }

    Expect.describe('Enroll factor', function () {

      Expect.describe('GENERIC_SAML', function () {

        itp('displays the correct factorBeacon', function () {
          return setup('custom_saml').then(function (test) {
            expect(test.beacon.isFactorBeacon()).toBe(true);
            expect(test.beacon.hasClass('mfa-custom-factor')).toBe(true);
          });
        });

        itp('has a "back" link in the footer', function () {
          return setup('custom_saml').then(function (test) {
            Expect.isVisible(test.form.backLink());
          });
        });

        itp('displays correct title', function () {
          return setup('custom_saml').then(function (test) {
            test.setNextResponse(responseSuccess);
            expect(test.form.titleText()).toBe('Third Party Factor');
            expect(test.form.buttonBar().hasClass('hide')).toBe(false);
          });
        });

        itp('displays correct subtitle', function () {
          return setup('custom_saml').then(function (test) {
            test.setNextResponse(responseSuccess);
            expect(test.form.subtitleText())
              .toBe('Clicking below will redirect to MFA enrollment with Third Party Factor');
            expect(test.form.buttonBar().hasClass('hide')).toBe(false);
          });
        });

        itp('redirects to third party when Enroll button is clicked', function () {
          spyOn(SharedUtil, 'redirect');
          return setup('custom_saml').then(function (test) {
            test.setNextResponse([responseMfaEnrollActivateCustomSaml, responseSuccess]);
            test.form.submit();
            return Expect.waitForSpyCall(SharedUtil.redirect);
          })
            .then(function () {
              expect(SharedUtil.redirect).toHaveBeenCalledWith(
                'http://rain.okta1.com:1802/policy/mfa-saml-idp-redirect?okta_key=mfa.redirect.id'
              );
            });
        });

        itp('displays error when error response received', function () {
          return setup('custom_saml').then(function (test) {
            test.setNextResponse(resNoPermissionError);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
            .then(function (test) {
              expect(test.form.hasErrors()).toBe(true);
              expect(test.form.errorMessage())
                .toBe('You do not have permission to perform the requested action');
              expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
              expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
                {
                  controller: 'enroll-custom-factor'
                },
                {
                  name: 'AuthApiError',
                  message: 'You do not have permission to perform the requested action',
                  statusCode: 403,
                  xhr: {
                    status: 403,
                    responseType: 'json',
                    responseText: '{"errorCode":"E0000006","errorSummary":"You do not have permission to perform the requested action","errorLink":"E0000006","errorId":"oae3CaVvE33SqKyymZRyUWE7Q","errorCauses":[]}',
                    responseJSON: {
                      errorCode: 'E0000006',
                      errorSummary: 'You do not have permission to perform the requested action',
                      errorLink: 'E0000006',
                      errorId: 'oae3CaVvE33SqKyymZRyUWE7Q',
                      errorCauses: []
                    }
                  }
                }
              ]);
            });
        });
      });

      Expect.describe('GENERIC_OIDC', function () {

        itp('displays the correct factorBeacon', function () {
          return setup('custom_oidc').then(function (test) {
            expect(test.beacon.isFactorBeacon()).toBe(true);
            expect(test.beacon.hasClass('mfa-custom-factor')).toBe(true);
          });
        });

        itp('has a "back" link in the footer', function () {
          return setup('custom_oidc').then(function (test) {
            Expect.isVisible(test.form.backLink());
          });
        });

        itp('displays correct title', function () {
          return setup('custom_oidc').then(function (test) {
            test.setNextResponse(responseSuccess);
            expect(test.form.titleText()).toBe('OIDC Factor');
            expect(test.form.buttonBar().hasClass('hide')).toBe(false);
          });
        });

        itp('displays correct subtitle', function () {
          return setup('custom_oidc').then(function (test) {
            test.setNextResponse(responseSuccess);
            expect(test.form.subtitleText())
              .toBe('Clicking below will redirect to MFA enrollment with OIDC Factor');
            expect(test.form.buttonBar().hasClass('hide')).toBe(false);
          });
        });

        itp('redirects to third party when Enroll button is clicked', function () {
          spyOn(SharedUtil, 'redirect');
          return setup('custom_oidc').then(function (test) {
            test.setNextResponse([responseMfaEnrollActivateCustomOidc, responseSuccess]);
            test.form.submit();
            return Expect.waitForSpyCall(SharedUtil.redirect);
          })
            .then(function () {
              expect(SharedUtil.redirect).toHaveBeenCalledWith(
                'http://rain.okta1.com:1802/policy/mfa-oidc-idp-redirect?okta_key=mfa.redirect.id'
              );
            });
        });

        itp('displays error when error response received', function () {
          return setup('custom_oidc').then(function (test) {
            test.setNextResponse(resNoPermissionError);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
            .then(function (test) {
              expect(test.form.hasErrors()).toBe(true);
              expect(test.form.errorMessage())
                .toBe('You do not have permission to perform the requested action');
            });
        });
      });

      Expect.describe('CUSTOM_CLAIMS', function () {

        itp('displays the correct factorBeacon', function () {
          return setup('claims_provider').then(function (test) {
            expect(test.beacon.isFactorBeacon()).toBe(true);
            expect(test.beacon.hasClass('mfa-custom-factor')).toBe(true);
          });
        });

        itp('has a "back" link in the footer', function () {
          return setup('claims_provider').then(function (test) {
            Expect.isVisible(test.form.backLink());
          });
        });

        itp('displays correct title', function () {
          return setup('claims_provider').then(function (test) {
            test.setNextResponse(responseSuccess);
            expect(test.form.titleText()).toBe('IDP factor');
            expect(test.form.buttonBar().hasClass('hide')).toBe(false);
          });
        });

        itp('displays correct subtitle', function () {
          return setup('claims_provider').then(function (test) {
            test.setNextResponse(responseSuccess);
            expect(test.form.subtitleText())
              .toBe('Clicking below will redirect to MFA enrollment with IDP factor');
            expect(test.form.buttonBar().hasClass('hide')).toBe(false);
          });
        });

        itp('redirects to third party when Enroll button is clicked', function () {
          spyOn(SharedUtil, 'redirect');
          return setup('claims_provider').then(function (test) {
            test.setNextResponse([responseMfaEnrollActivateClaimsProvider, responseSuccess]);
            test.form.submit();
            return Expect.waitForSpyCall(SharedUtil.redirect);
          })
            .then(function () {
              expect(SharedUtil.redirect).toHaveBeenCalledWith(
                'http://rain.okta1.com:1802/sso/idps/idpId?stateToken=testStateToken'
              );
            });
        });

        itp('displays error when error response received', function () {
          return setup('claims_provider').then(function (test) {
            test.setNextResponse(resNoPermissionError);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
            .then(function (test) {
              expect(test.form.hasErrors()).toBe(true);
              expect(test.form.errorMessage())
                .toBe('You do not have permission to perform the requested action');
            });
        });
      });
    });
  });

});
