/* eslint max-params: [2, 15] */
define([
  'okta',
  '@okta/okta-auth-js',
  'helpers/mocks/Util',
  'helpers/dom/EnrollTokenFactorForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'sandbox',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_allFactors_OnPrem',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_OnPrem_error',
  'helpers/xhr/RSA_ERROR_change_pin',
  'helpers/xhr/SUCCESS',
  'LoginRouter'
],
function (Okta, OktaAuth, Util, Form, Beacon, Expect, $sandbox,
  resAllFactors, resAllFactorsOnPrem, resEnrollError, resRSAChangePin, resSuccess, Router) {

  var { _ } = Okta;
  var itp = Expect.itp;
  var tick = Expect.tick;

  Expect.describe('EnrollOnPrem', function () {

    function setup (response, includeOnPrem, startRouter) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({issuer: baseUrl});
      var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        'features.router': startRouter
      });
      router.on('afterError', afterErrorHandler);
      Util.registerRouter(router);
      Util.mockRouterNavigate(router, startRouter);
      return tick()
        .then(function () {
          var res = response ? response : resAllFactors;
          setNextResponse(res);
          router.refreshAuthState('dummy-token');
          return Expect.waitForEnrollChoices();
        })
        .then(function () {
          const test = {
            router: router,
            beacon: new Beacon($sandbox),
            form: new Form($sandbox),
            ac: authClient,
            setNextResponse: setNextResponse,
            afterErrorHandler: afterErrorHandler
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

    var setupOnPrem = _.partial(setup, resAllFactorsOnPrem, true);

    var getResponseNoProfile = function (response, factorType, provider) {
      var responseCopy = Util.deepCopy(response);
      var factors = responseCopy['response']['_embedded']['factors'];
      var factor = _.findWhere(factors, {factorType: factorType, provider: provider});
      delete factor['profile'];
      return responseCopy;
    };

    var setupRsaNoProfile = function () {
      var res = getResponseNoProfile(resAllFactors, 'token', 'RSA');
      return setup(res, false);
    };

    var setupOnPremNoProfile = function () {
      var res = getResponseNoProfile(resAllFactorsOnPrem, 'token', 'DEL_OATH');
      return setup(res, true);
    };

    var setupXssVendorName = function () {
      var responseCopy = Util.deepCopy(resAllFactorsOnPrem);
      var factors = responseCopy['response']['_embedded']['factors'];
      var factor = _.findWhere(factors, {factorType: 'token', provider: 'DEL_OATH'});
      factor['vendorName'] = '><script>alert(123)</script>';
      return setup(responseCopy, true);
    };

    Expect.describe('RSA', function () {

      Expect.describe('Header & Footer', function () {
        itp('displays the correct factorBeacon', function () {
          return setup().then(function (test) {
            expect(test.beacon.isFactorBeacon()).toBe(true);
            expect(test.beacon.hasClass('mfa-rsa')).toBe(true);
          });
        });
        itp('has a "back" link in the footer', function () {
          return setup().then(function (test) {
            Expect.isVisible(test.form.backLink());
          });
        });
        itp('does not allow autocomplete', function () {
          return setup().then(function (test) {
            expect(test.form.getCodeFieldAutocomplete()).toBe('off');
          });
        });
        itp('returns to factor list when browser\'s back button is clicked', function () {
          return setup(false, false, true).then(function (test) {
            Util.triggerBrowserBackButton();
            return Expect.waitForEnrollChoices(test);
          })
            .then(function (test) {
              Expect.isEnrollChoices(test.router.controller);
              Util.stopRouter();
            });
        });
      });

      Expect.describe('Enroll factor', function () {
        itp('has a credentialId text field', function () {
          return setup().then(function (test) {
            Expect.isTextField(test.form.credentialIdField());
          });
        });
        itp('autopopulates credentialId text field', function () {
          return setup().then(function (test) {
            expect(test.form.getCredentialId()).toEqual('test123');
          });
        });
        itp('does not autopopulate credentialId when profile does not exist', function () {
          return setupRsaNoProfile().then(function (test) {
            expect(test.form.getCredentialId()).toEqual('');
          });
        });
        itp('has passCode text field', function () {
          return setup().then(function (test) {
            Expect.isPasswordField(test.form.codeField());
          });
        });
        itp('has a verify button', function () {
          return setup().then(function (test) {
            Expect.isVisible(test.form.submitButton());
          });
        });
        itp('does not send request and shows error if code is not entered', function () {
          return setup().then(function (test) {
            Util.resetAjaxRequests();
            test.form.setCredentialId('Username');
            test.form.submit();
            expect(test.form.hasErrors()).toBe(true);
            expect(Util.numAjaxRequests()).toBe(0);
          });
        });
        itp('shows error in case of an error response', function () {
          return setup()
            .then(function (test) {
              test.setNextResponse(resEnrollError);
              test.form.setCredentialId('Username');
              test.form.setCode(123);
              test.form.submit();
              return Expect.waitForFormError(test.form, test);
            })
            .then(function (test) {
              expect(test.form.hasErrors()).toBe(true);
              // Note: This will change when we get field specific error messages
              expect(test.form.errorMessage()).toBe('Api validation failed: factorEnrollRequest');
              expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
              expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
                {
                  controller: 'enroll-rsa'
                },
                {
                  name: 'AuthApiError',
                  message: 'Api validation failed: factorEnrollRequest',
                  statusCode: 400,
                  xhr: {
                    status: 400,
                    responseType: 'json',
                    responseText: '{"errorCode":"E0000001","errorSummary":"Api validation failed: factorEnrollRequest","errorLink":"E0000001","errorId":"oaepmWRr7i5TZa2AQv8sNmu6w","errorCauses":[]}',
                    responseJSON: {
                      errorCode: 'E0000001',
                      errorSummary: 'Api validation failed: factorEnrollRequest',
                      errorLink: 'E0000001',
                      errorId: 'oaepmWRr7i5TZa2AQv8sNmu6w',
                      errorCauses: []
                    }
                  }
                }
              ]);
            });
        });
        itp('clears passcode field if error is for PIN change', function () {
          return setup()
            .then(function (test) {
              test.setNextResponse(resRSAChangePin);
              test.form.setCredentialId('Username');
              test.form.setCode(123);
              test.form.submit();
              return Expect.waitForFormError(test.form, test);
            })
            .then(function (test) {
              expect(test.form.hasErrors()).toBe(true);
              expect(test.form.errorMessage()).toBe('Enter a new PIN having from 4 to 8 digits:');
              expect(test.form.codeField().val()).toEqual('');
            });
        });
        itp('calls activate with the right params', function () {
          return setup().then(function (test) {
            Util.resetAjaxRequests();
            test.form.setCredentialId('Username');
            test.form.setCode(123456);
            test.setNextResponse(resSuccess);
            test.form.submit();
            return tick();
          })
            .then(function () {
              expect(Util.numAjaxRequests()).toBe(1);
              Expect.isJsonPost(Util.getAjaxRequest(0), {
                url: 'https://foo.com/api/v1/authn/factors',
                data: {
                  factorType: 'token',
                  provider: 'RSA',
                  passCode: '123456',
                  profile: {credentialId: 'Username'},
                  stateToken: 'testStateToken'
                }
              });
            });
        });
      });
    });

    Expect.describe('On Prem (custom)', function () {

      Expect.describe('Header & Footer', function () {
        itp('displays the correct factorBeacon', function () {
          return setupOnPrem().then(function (test) {
            expect(test.beacon.isFactorBeacon()).toBe(true);
            expect(test.beacon.hasClass('mfa-onprem')).toBe(true);
          });
        });
        itp('has a "back" link in the footer', function () {
          return setupOnPrem().then(function (test) {
            Expect.isVisible(test.form.backLink());
          });
        });
        itp('does not allow autocomplete', function () {
          return setupOnPrem().then(function (test) {
            expect(test.form.getCodeFieldAutocomplete()).toBe('off');
          });
        });
        itp('returns to factor list when browser\'s back button is clicked', function () {
          return setupOnPrem(true).then(function (test) {
            Util.triggerBrowserBackButton();
            return Expect.waitForEnrollChoices(test);
          })
            .then(function (test) {
              Expect.isEnrollChoices(test.router.controller);
              Util.stopRouter();
            });
        });
      });

      Expect.describe('Enroll factor', function () {
        itp('has a credentialId text field', function () {
          return setupOnPrem().then(function (test) {
            Expect.isTextField(test.form.credentialIdField());
          });
        });
        itp('autopopulates credentialId text field', function () {
          return setupOnPrem().then(function (test) {
            expect(test.form.getCredentialId()).toEqual('test123');
          });
        });
        itp('does not autopopulate credentialId when profile does not exist', function () {
          return setupOnPremNoProfile().then(function (test) {
            expect(test.form.getCredentialId()).toEqual('');
          });
        });
        itp('has passCode text field', function () {
          return setupOnPrem().then(function (test) {
            Expect.isPasswordField(test.form.codeField());
          });
        });
        itp('has a verify button', function () {
          return setupOnPrem().then(function (test) {
            Expect.isVisible(test.form.submitButton());
          });
        });
        itp('does not send request and shows error if code is not entered', function () {
          return setupOnPrem().then(function (test) {
            Util.resetAjaxRequests();
            test.form.setCredentialId('Username');
            test.form.submit();
            expect(test.form.hasErrors()).toBe(true);
            expect(Util.numAjaxRequests()).toBe(0);
          });
        });
        itp('shows error in case of an error response', function () {
          return setupOnPrem()
            .then(function (test) {
              test.setNextResponse(resEnrollError);
              test.form.setCredentialId('Username');
              test.form.setCode(123);
              test.form.submit();
              return Expect.waitForFormError(test.form, test);
            })
            .then(function (test) {
              expect(test.form.hasErrors()).toBe(true);
              // Note: This will change when we get field specific error messages
              expect(test.form.errorMessage()).toBe('Api validation failed: factorEnrollRequest');
              expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
              expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
                {
                  controller: 'enroll-onprem'
                },
                {
                  name: 'AuthApiError',
                  message: 'Api validation failed: factorEnrollRequest',
                  statusCode: 400,
                  xhr: {
                    status: 400,
                    responseType: 'json',
                    responseText: '{"errorCode":"E0000001","errorSummary":"Api validation failed: factorEnrollRequest","errorLink":"E0000001","errorId":"oaepmWRr7i5TZa2AQv8sNmu6w","errorCauses":[]}',
                    responseJSON: {
                      errorCode: 'E0000001',
                      errorSummary: 'Api validation failed: factorEnrollRequest',
                      errorLink: 'E0000001',
                      errorId: 'oaepmWRr7i5TZa2AQv8sNmu6w',
                      errorCauses: []
                    }
                  }
                }
              ]);
            });
        });
        itp('clears passcode field if error is for PIN change', function () {
          return setupOnPrem()
            .then(function (test) {
              test.setNextResponse(resRSAChangePin);
              test.form.setCredentialId('Username');
              test.form.setCode(123);
              test.form.submit();
              return Expect.waitForFormError(test.form, test);
            })
            .then(function (test) {
              expect(test.form.hasErrors()).toBe(true);
              expect(test.form.errorMessage()).toBe('Enter a new PIN having from 4 to 8 digits:');
              expect(test.form.codeField().val()).toEqual('');
            });
        });
        itp('calls activate with the right params', function () {
          return setupOnPrem().then(function (test) {
            Util.resetAjaxRequests();
            test.form.setCredentialId('Username');
            test.form.setCode(123456);
            test.setNextResponse(resSuccess);
            test.form.submit();
            return tick();
          })
            .then(function () {
              expect(Util.numAjaxRequests()).toBe(1);
              Expect.isJsonPost(Util.getAjaxRequest(0), {
                url: 'https://foo.com/api/v1/authn/factors',
                data: {
                  factorType: 'token',
                  provider: 'DEL_OATH',
                  passCode: '123456',
                  profile: {credentialId: 'Username'},
                  stateToken: 'testStateToken'
                }
              });
            });
        });
        itp('does not have explains by default', function () {
          return setupXssVendorName().then(function (test) {
            expect(test.form.credIdExplain().length).toBe(0);
            expect(test.form.codeExplain().length).toBe(0);
          });
        });
      });
    });

  });
});
