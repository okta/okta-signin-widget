/* eslint max-params: [2, 15] */
import { _ } from 'okta';
import getAuthClient from 'helpers/getAuthClient';
import Router from 'v1/LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import Form from 'helpers/dom/EnrollTokenFactorForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resEnrollError from 'helpers/xhr/MFA_ENROLL_ACTIVATE_OnPrem_error';
import resAllFactors from 'helpers/xhr/MFA_ENROLL_allFactors';
import resAllFactorsOnPrem from 'helpers/xhr/MFA_ENROLL_allFactors_OnPrem';
import resRSAChangePin from 'helpers/xhr/RSA_ERROR_change_pin';
import resSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
const itp = Expect.itp;
const tick = Expect.tick;

Expect.describe('EnrollOnPrem', function() {
  function setup(response, includeOnPrem, startRouter) {
    const setNextResponse = Util.mockAjax();
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: { issuer: baseUrl }
    });
    const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    const router = new Router({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      'features.router': startRouter,
    });

    router.on('afterError', afterErrorHandler);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router, startRouter);
    return tick()
      .then(function() {
        const res = response ? response : resAllFactors;

        setNextResponse(res);
        router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollChoices();
      })
      .then(function() {
        const test = {
          router: router,
          beacon: new Beacon($sandbox),
          form: new Form($sandbox),
          ac: authClient,
          setNextResponse: setNextResponse,
          afterErrorHandler: afterErrorHandler,
        };
        if (includeOnPrem) {
          router.enrollOnPrem();
          return Expect.waitForEnrollOnPrem(test);
        } else {
          router.enrollRsa();
          return Expect.waitForEnrollRsa(test);
        }
      });
  }

  const setupOnPrem = _.partial(setup, resAllFactorsOnPrem, true);

  const getResponseNoProfile = function(response, factorType, provider) {
    const responseCopy = Util.deepCopy(response);
    const factors = responseCopy['response']['_embedded']['factors'];

    const factor = _.findWhere(factors, { factorType: factorType, provider: provider });

    delete factor['profile'];
    return responseCopy;
  };

  const setupRsaNoProfile = function() {
    const res = getResponseNoProfile(resAllFactors, 'token', 'RSA');

    return setup(res, false);
  };

  const setupOnPremNoProfile = function() {
    const res = getResponseNoProfile(resAllFactorsOnPrem, 'token', 'DEL_OATH');

    return setup(res, true);
  };

  const setupXssVendorName = function() {
    const responseCopy = Util.deepCopy(resAllFactorsOnPrem);
    const factors = responseCopy['response']['_embedded']['factors'];

    const factor = _.findWhere(factors, { factorType: 'token', provider: 'DEL_OATH' });

    factor['vendorName'] = '><script>alert(123)</script>';
    return setup(responseCopy, true);
  };

  Expect.describe('RSA', function() {
    Expect.describe('Header & Footer', function() {
      itp('displays the correct factorBeacon', function() {
        return setup().then(function(test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-rsa')).toBe(true);
        });
      });
      itp('has a "back" link in the footer', function() {
        return setup().then(function(test) {
          Expect.isVisible(test.form.backLink());
        });
      });
      itp('does not allow autocomplete', function() {
        return setup().then(function(test) {
          expect(test.form.getCodeFieldAutocomplete()).toBe('off');
        });
      });
      itp('returns to factor list when browser\'s back button is clicked', function() {
        return setup(false, false, true)
          .then(function(test) {
            Util.triggerBrowserBackButton();
            return Expect.waitForEnrollChoices(test);
          })
          .then(function(test) {
            Expect.isEnrollChoices(test.router.controller);
            Util.stopRouter();
          });
      });
    });

    Expect.describe('Enroll factor', function() {
      itp('has a credentialId text field', function() {
        return setup().then(function(test) {
          Expect.isTextField(test.form.credentialIdField());
        });
      });
      itp('autopopulates credentialId text field', function() {
        return setup().then(function(test) {
          expect(test.form.getCredentialId()).toEqual('test123');
        });
      });
      itp('does not autopopulate credentialId when profile does not exist', function() {
        return setupRsaNoProfile().then(function(test) {
          expect(test.form.getCredentialId()).toEqual('');
        });
      });
      itp('has passCode text field', function() {
        return setup().then(function(test) {
          Expect.isPasswordField(test.form.codeField());
        });
      });
      itp('has a verify button', function() {
        return setup().then(function(test) {
          Expect.isVisible(test.form.submitButton());
        });
      });
      itp('does not send request and shows error if code is not entered', function() {
        return setup().then(function(test) {
          Util.resetAjaxRequests();
          test.form.setCredentialId('Username');
          test.form.submit();
          expect(test.form.hasErrors()).toBe(true);
          expect(Util.numAjaxRequests()).toBe(0);
        });
      });
      itp('shows error in case of an error response', function() {
        return setup()
          .then(function(test) {
            test.setNextResponse(resEnrollError);
            test.form.setCredentialId('Username');
            test.form.setCode(123);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expect(test.form.hasErrors()).toBe(true);
            // Note: This will change when we get field specific error messages
            expect(test.form.errorMessage()).toBe('Api validation failed: factorEnrollRequest');
            expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
            expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
              {
                controller: 'enroll-rsa',
              },
              {
                name: 'AuthApiError',
                message: 'Api validation failed: factorEnrollRequest',
                statusCode: 400,
                xhr: {
                  status: 400,
                  headers: { 'content-type': 'application/json' },
                  responseType: 'json',
                  responseText: '{"errorCode":"E0000001","errorSummary":"Api validation failed: factorEnrollRequest","errorLink":"E0000001","errorId":"oaepmWRr7i5TZa2AQv8sNmu6w","errorCauses":[]}',
                  responseJSON: {
                    errorCode: 'E0000001',
                    errorSummary: 'Api validation failed: factorEnrollRequest',
                    errorLink: 'E0000001',
                    errorId: 'oaepmWRr7i5TZa2AQv8sNmu6w',
                    errorCauses: [],
                  },
                },
              },
            ]);
          });
      });
      itp('clears passcode field if error is for PIN change', function() {
        return setup()
          .then(function(test) {
            test.setNextResponse(resRSAChangePin);
            test.form.setCredentialId('Username');
            test.form.setCode(123);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Enter a new PIN having from 4 to 8 digits:');
            expect(test.form.codeField().val()).toEqual('');
          });
      });
      itp('calls activate with the right params', function() {
        return setup()
          .then(function(test) {
            Util.resetAjaxRequests();
            test.form.setCredentialId('Username');
            test.form.setCode(123456);
            test.setNextResponse(resSuccess);
            test.form.submit();
            return tick();
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            Expect.isJsonPost(Util.getAjaxRequest(0), {
              url: 'https://foo.com/api/v1/authn/factors',
              data: {
                factorType: 'token',
                provider: 'RSA',
                passCode: '123456',
                profile: { credentialId: 'Username' },
                stateToken: 'testStateToken',
              },
            });
          });
      });
    });
  });

  Expect.describe('On Prem (custom)', function() {
    Expect.describe('Header & Footer', function() {
      itp('displays the correct factorBeacon', function() {
        return setupOnPrem().then(function(test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-onprem')).toBe(true);
        });
      });
      itp('has a "back" link in the footer', function() {
        return setupOnPrem().then(function(test) {
          Expect.isVisible(test.form.backLink());
        });
      });
      itp('does not allow autocomplete', function() {
        return setupOnPrem().then(function(test) {
          expect(test.form.getCodeFieldAutocomplete()).toBe('off');
        });
      });
      itp('returns to factor list when browser\'s back button is clicked', function() {
        return setupOnPrem(true)
          .then(function(test) {
            Util.triggerBrowserBackButton();
            return Expect.waitForEnrollChoices(test);
          })
          .then(function(test) {
            Expect.isEnrollChoices(test.router.controller);
            Util.stopRouter();
          });
      });
    });

    Expect.describe('Enroll factor', function() {
      itp('has a credentialId text field', function() {
        return setupOnPrem().then(function(test) {
          Expect.isTextField(test.form.credentialIdField());
        });
      });
      itp('autopopulates credentialId text field', function() {
        return setupOnPrem().then(function(test) {
          expect(test.form.getCredentialId()).toEqual('test123');
        });
      });
      itp('does not autopopulate credentialId when profile does not exist', function() {
        return setupOnPremNoProfile().then(function(test) {
          expect(test.form.getCredentialId()).toEqual('');
        });
      });
      itp('has passCode text field', function() {
        return setupOnPrem().then(function(test) {
          Expect.isPasswordField(test.form.codeField());
        });
      });
      itp('has a verify button', function() {
        return setupOnPrem().then(function(test) {
          Expect.isVisible(test.form.submitButton());
        });
      });
      itp('does not send request and shows error if code is not entered', function() {
        return setupOnPrem().then(function(test) {
          Util.resetAjaxRequests();
          test.form.setCredentialId('Username');
          test.form.submit();
          expect(test.form.hasErrors()).toBe(true);
          expect(Util.numAjaxRequests()).toBe(0);
        });
      });
      itp('shows error in case of an error response', function() {
        return setupOnPrem()
          .then(function(test) {
            test.setNextResponse(resEnrollError);
            test.form.setCredentialId('Username');
            test.form.setCode(123);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expect(test.form.hasErrors()).toBe(true);
            // Note: This will change when we get field specific error messages
            expect(test.form.errorMessage()).toBe('Api validation failed: factorEnrollRequest');
            expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
            expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
              {
                controller: 'enroll-onprem',
              },
              {
                name: 'AuthApiError',
                message: 'Api validation failed: factorEnrollRequest',
                statusCode: 400,
                xhr: {
                  status: 400,
                  headers: { 'content-type': 'application/json' },
                  responseType: 'json',
                  responseText: '{"errorCode":"E0000001","errorSummary":"Api validation failed: factorEnrollRequest","errorLink":"E0000001","errorId":"oaepmWRr7i5TZa2AQv8sNmu6w","errorCauses":[]}',
                  responseJSON: {
                    errorCode: 'E0000001',
                    errorSummary: 'Api validation failed: factorEnrollRequest',
                    errorLink: 'E0000001',
                    errorId: 'oaepmWRr7i5TZa2AQv8sNmu6w',
                    errorCauses: [],
                  },
                },
              },
            ]);
          });
      });
      itp('clears passcode field if error is for PIN change', function() {
        return setupOnPrem()
          .then(function(test) {
            test.setNextResponse(resRSAChangePin);
            test.form.setCredentialId('Username');
            test.form.setCode(123);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Enter a new PIN having from 4 to 8 digits:');
            expect(test.form.codeField().val()).toEqual('');
          });
      });
      itp('calls activate with the right params', function() {
        return setupOnPrem()
          .then(function(test) {
            Util.resetAjaxRequests();
            test.form.setCredentialId('Username');
            test.form.setCode(123456);
            test.setNextResponse(resSuccess);
            test.form.submit();
            return tick();
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            Expect.isJsonPost(Util.getAjaxRequest(0), {
              url: 'https://foo.com/api/v1/authn/factors',
              data: {
                factorType: 'token',
                provider: 'DEL_OATH',
                passCode: '123456',
                profile: { credentialId: 'Username' },
                stateToken: 'testStateToken',
              },
            });
          });
      });
      itp('does not have explains by default', function() {
        return setupXssVendorName().then(function(test) {
          expect(test.form.credIdExplain().length).toBe(0);
          expect(test.form.codeExplain().length).toBe(0);
        });
      });
    });
  });
});
