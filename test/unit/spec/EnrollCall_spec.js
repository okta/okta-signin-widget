/* eslint max-params: 0 */
import { _, $ } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import Form from 'helpers/dom/EnrollCallForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resFactorEnrollActivateCall from 'helpers/xhr/FACTOR_ENROLL_ACTIVATE_call';
import resEnrollSuccess from 'helpers/xhr/MFA_ENROLL_ACTIVATE_call_success';
import resEnrollError from 'helpers/xhr/MFA_ENROLL_ACTIVATE_error';
import resActivateError from 'helpers/xhr/MFA_ENROLL_ACTIVATE_errorActivate';
import resEnrollInvalidPhoneError from 'helpers/xhr/MFA_ENROLL_ACTIVATE_invalid_phone';
import resAllFactors from 'helpers/xhr/MFA_ENROLL_allFactors';
import resExistingPhone from 'helpers/xhr/MFA_ENROLL_callFactor_existingPhone';
import Q from 'q';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const itp = Expect.itp;

Expect.describe('EnrollCall', function() {
  function setup(resp, startRouter, routerOptions = {}) {
    const setNextResponse = Util.mockAjax();
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: { issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR }
    });
    const afterRenderHandler = jasmine.createSpy('afterRenderHandler');
    const router = new Router({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      defaultCountryCode: routerOptions.defaultCountryCode,
      'features.router': startRouter,
    });

    router.on('afterError', afterRenderHandler);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router, startRouter);

    const test = {
      router: router,
      beacon: new Beacon($sandbox),
      form: new Form($sandbox),
      ac: authClient,
      setNextResponse: setNextResponse,
      afterRenderHandler: afterRenderHandler,
    };

    const enrollCall = test => {
      setNextResponse(resp || resAllFactors);
      router.refreshAuthState('dummy-token');
      return Expect.waitForEnrollChoices(test)
        .then(function(test) {
          test.router.enrollCall();
          return Expect.waitForEnrollCall(test);
        })
        .then(test => {
          spyOn(test.router.controller, 'trapAuthResponse').and.callThrough();
          return test;
        });
    };

    if (startRouter) {
      return Expect.waitForPrimaryAuth(test).then(enrollCall);
    } else {
      return enrollCall(test);
    }
  }

  function waitForEnrollActivateSuccess(test) {
    test.router.controller.trapAuthResponse.calls.reset();
    return Expect.waitForSpyCall(test.router.controller.trapAuthResponse, test);
  }

  function enterPhone(test, countryCode, phoneNumber, phoneExtension) {
    test.form.selectCountry(countryCode);
    test.form.setPhoneNumber(phoneNumber);
    test.form.setPhoneExtension(phoneExtension);
  }

  function sendCode(test, res, countryCode, phoneNumber, phoneExtension) {
    test.setNextResponse(res);
    enterPhone(test, countryCode, phoneNumber, phoneExtension);
    test.form.sendCodeButton().click();
    return test;
  }

  function sendCodeOnEnter(test, res, countryCode, phoneNumber, phoneExtension) {
    test.setNextResponse(res);
    enterPhone(test, countryCode, phoneNumber, phoneExtension);
    const keydown = $.Event('keydown');

    keydown.which = 13;
    test.form.phoneNumberField().trigger(keydown);
    const keyup = $.Event('keyup');

    keyup.which = 13;
    test.form.phoneNumberField().trigger(keyup);
    return test;
  }

  function setupAndSendCode(res, countryCode, phoneNumber, phoneExtension) {
    return setup().then(function(test) {
      return sendCode(test, res, countryCode, phoneNumber, phoneExtension);
    });
  }

  function setupAndSendValidCode(phoneExtension) {
    return setup().then(function(test) {
      sendCode(test, resEnrollSuccess, 'US', '6501231234', phoneExtension);
      return waitForEnrollActivateSuccess(test);
    });
  }

  function setupAndSendInvalidCode(phoneExtension) {
    return setup().then(function(test) {
      sendCode(test, resEnrollError, 'US', '650', phoneExtension);
      return Expect.waitForFormError(test.form, test);
    });
  }

  function expectRedialButton(test) {
    const button = test.form.sendCodeButton();

    expect(button.trimmedText()).toEqual('Redial');
    expect(button.hasClass('button-primary')).toBe(false);
  }

  function expectCallingButton(test) {
    const button = test.form.sendCodeButton();

    expect(button.trimmedText()).toEqual('Calling');
    expect(button.attr('class')).not.toMatch('button-primary');
    expect(button.attr('class')).toMatch('link-button-disabled');
  }

  function expectCallButton(test) {
    const button = test.form.sendCodeButton();

    expect(button.trimmedText()).toEqual('Call');
    expect(button.hasClass('button-primary')).toBe(true);
  }

  function expectAlphabeticalCountryList(test) {
    const countries = test.form.countriesList();

    expect(countries[0]).toEqual({ val: 'AF', text: 'Afghanistan' });
    expect(countries[1]).toEqual({ val: 'AL', text: 'Albania' });
    expect(countries[239]).toEqual({ val: 'ZW', text: 'Zimbabwe' });
  }

  function expectCountriesWithNoCallingCodes(test) {
    const countries = test.form.countriesList();

    expect(_.findWhere(countries, { val: 'HM' })).toBe(undefined);
    expect(_.findWhere(countries, { val: 'BV' })).toBe(undefined);
    expect(_.findWhere(countries, { val: 'TF' })).toBe(undefined);
  }

  function expectCountryCallingCodeUpdates(test) {
    expect(test.form.phonePrefixText()).toBe('+1');
    test.form.selectCountry('AQ');
    expect(test.form.phonePrefixText()).toBe('+672');
  }

  function testEnrollPhoneNumber(setupFn, enrollSuccess) {
    it('has a list of countries in alphabetical order', function() {
      return setupFn().then(function(test) {
        expectAlphabeticalCountryList(test);
      });
    });
    itp('does not include countries with no calling codes', function() {
      return setupFn().then(function(test) {
        expectCountriesWithNoCallingCodes(test);
      });
    });
    itp('has autocomplete set to false', function() {
      return setupFn().then(function(test) {
        expect(test.form.getCodeFieldAutocomplete()).toBe('off');
      });
    });
    itp('defaults to United States for the country', function() {
      return setupFn().then(function(test) {
        expect(test.form.selectedCountry()).toBe('United States');
      });
    });
    itp('selects country based on defaultCountryCode from settings', function() {
      return setupFn(undefined, undefined, { defaultCountryCode: 'GB' })
        .then(function(test) {
          expect(test.form.selectedCountry()).toBe('United Kingdom');
        });
    });
    itp('uses "US" as countryCode if settings.defaultCountryCode is not valid', function() {
      return setupFn(undefined, undefined, { defaultCountryCode: 'FAKECODE' })
        .then(function(test) {
          expect(test.form.selectedCountry()).toBe('United States');
        });
    });
    itp('updates the phone number country calling code when country is changed', function() {
      return setupFn().then(function(test) {
        expectCountryCallingCodeUpdates(test);
      });
    });
    itp('has a phone number text field', function() {
      return setupFn().then(function(test) {
        Expect.isTextField(test.form.phoneNumberField());
      });
    });
    itp('has a phone extension text field', function() {
      return setupFn().then(function(test) {
        Expect.isTextField(test.form.phoneExtensionField());
      });
    });
    itp('has a button with primary class and text "Call"', function() {
      return setup().then(function(test) {
        expectCallButton(test);
      });
    });
    itp('does not show divider', function() {
      return setupFn().then(function(test) {
        Expect.isNotVisible(test.form.divider());
      });
    });
    itp('does not show enter code input', function() {
      return setupFn().then(function(test) {
        Expect.isNotVisible(test.form.codeField());
      });
    });
    itp('does not show verify button', function() {
      return setupFn().then(function(test) {
        Expect.isNotVisible(test.form.submitButton());
      });
    });
    itp('validation error if phone number field is blank', function() {
      return setupAndSendCode(enrollSuccess, 'US', '').then(function(test) {
        expect(test.form.hasErrors()).toBe(true);
      });
    });
    itp('clears previous errors in form when redial', function() {
      return setupAndSendInvalidCode()
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Invalid Phone Number.');
          sendCodeOnEnter(test, enrollSuccess, 'US', '4151111111');
          return waitForEnrollActivateSuccess(test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(false);
        });
    });
    itp('enrolls with correct info when call button is clicked', function() {
      return setupAndSendCode(enrollSuccess, 'AQ', '12345678900').then(function() {
        expect(Util.numAjaxRequests()).toBe(2);
        Expect.isJsonPost(Util.getAjaxRequest(1), {
          url: 'https://foo.com/api/v1/authn/factors',
          data: {
            factorType: 'call',
            provider: 'OKTA',
            profile: {
              phoneNumber: '+67212345678900',
              phoneExtension: '',
            },
            stateToken: 'testStateToken',
          },
        });
      });
    });
    itp('shows error and does not go to next step if error response', function() {
      return setupAndSendInvalidCode().then(function(test) {
        expectCallButton(test);
        Expect.isNotVisible(test.form.divider());
        Expect.isNotVisible(test.form.codeField());
        Expect.isNotVisible(test.form.submitButton());
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorMessage()).toBe('Invalid Phone Number.');
        expect(test.afterRenderHandler).toHaveBeenCalledTimes(1);
        expect(test.afterRenderHandler.calls.allArgs()[0]).toEqual([
          {
            controller: 'enroll-call',
          },
          {
            name: 'AuthApiError',
            message: 'Api validation failed: factorEnrollRequest',
            statusCode: 400,
            xhr: {
              status: 400,
              responseType: 'json',
              responseText: '{"errorCode":"E0000001","errorSummary":"Api validation failed: factorEnrollRequest","errorLink":"E0000001","errorId":"oaepmWRr7i5TZa2AQv8sNmu6w","errorCauses":[{"errorSummary":"Invalid Phone Number."}]}',
              responseJSON: {
                errorCode: 'E0000001',
                errorSummary: 'Invalid Phone Number.',
                errorLink: 'E0000001',
                errorId: 'oaepmWRr7i5TZa2AQv8sNmu6w',
                errorCauses: [
                  {
                    errorSummary: 'Invalid Phone Number.',
                  },
                ],
              },
            },
          },
        ]);
      });
    });
  }

  function testVerifyPhoneNumber(setupFn, setupAndSendCodeFn, enrollSuccess, expectedStateToken) {
    itp('replaces button text from "call" to "calling", disables it and with no primary class', function() {
      return setupAndSendCodeFn().then(function(test) {
        expectCallingButton(test);
      });
    });

    itp('uses send code button with validatePhone:false if user has retried with invalid phone number', function() {
      return setupFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          sendCode(test, resEnrollInvalidPhoneError, 'PF', '12345678');
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'call',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+68912345678',
                phoneExtension: '',
              },
              stateToken: expectedStateToken,
            },
          });

          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toEqual(
            'The number you entered seems invalid. If the number is correct, please try again.'
          );

          Util.resetAjaxRequests();
          sendCode(test, resEnrollInvalidPhoneError, 'PF', '12345678');
          return Expect.waitForAjaxRequest();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'call',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+68912345678',
                phoneExtension: '',
                validatePhone: false,
              },
              stateToken: expectedStateToken,
            },
          });
        });
    });
    itp('does not set validatePhone:false if the error is not a validation error (E0000098).', function() {
      return setupFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          sendCode(test, resEnrollError, 'PF', '12345678');
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'call',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+68912345678',
                phoneExtension: '',
              },
              stateToken: expectedStateToken,
            },
          });

          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toEqual('Invalid Phone Number.');

          Util.resetAjaxRequests();
          sendCode(test, resEnrollError, 'PF', '12345678');
          return Expect.waitForAjaxRequest();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'call',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+68912345678',
                phoneExtension: '',
              },
              stateToken: expectedStateToken,
            },
          });
        });
    });
    itp('uses resend and not enrollFactor when redial is clicked', function() {
      Util.speedUpDelay();
      return setupAndSendCodeFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(enrollSuccess);
          test.form.sendCodeButton().click();
          return Expect.waitForAjaxRequest();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors/mbli45IDbggtwb4j40g3/lifecycle/resend',
            data: {
              stateToken: expectedStateToken,
            },
          });
        });
    });
    itp(
      'submitting a number, then changing it, and then changing it back ' + 'will still use the resend endpoint',
      function() {
        // The call button is normally disabled for several seconds
        // to prevent too many calls to the API, but for testing
        // we mock out the delay function to wait 0 seconds.
        Util.speedUpDelay();
        return setupAndSendCodeFn()
          .then(function(test) {
            // change the number from 'US' to 'AQ'
            enterPhone(test, 'AQ', '6501231234');
            expectCallButton(test);
            return test;
          })
          .then(function(test) {
            // change the number back to 'US'
            enterPhone(test, 'US', '6501231234');
            expectRedialButton(test);
            return test;
          })
          .then(function(test) {
            // resubmit the 'US' number
            Util.resetAjaxRequests();
            test.setNextResponse(enrollSuccess);
            test.form.sendCodeButton().click();
            expectCallingButton(test);
            return Expect.waitForAjaxRequest();
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            Expect.isJsonPost(Util.getAjaxRequest(0), {
              url: 'https://foo.com/api/v1/authn/factors/mbli45IDbggtwb4j40g3/lifecycle/resend',
              data: {
                stateToken: expectedStateToken,
              },
            });
          });
      }
    );
    itp('shows divider', function() {
      return setupAndSendCodeFn().then(function(test) {
        Expect.isVisible(test.form.divider());
      });
    });
    itp('shows enter code input', function() {
      return setupAndSendCodeFn().then(function(test) {
        Expect.isVisible(test.form.codeField());
        expect(test.form.codeField().attr('type')).toBe('tel');
      });
    });
    itp('shows verify button when enrolled', function() {
      return setupAndSendCodeFn().then(function(test) {
        Expect.isVisible(test.form.submitButton());
      });
    });
    itp('does not send request and shows error if code is not entered', function() {
      return setupAndSendCodeFn().then(function(test) {
        Util.resetAjaxRequests();
        test.form.submit();
        expect(Util.numAjaxRequests()).toBe(0);
        expect(test.form.hasErrors()).toBe(true);
      });
    });
    itp('calls activate with the right params if passes validation', function() {
      return setupAndSendCodeFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.form.setCode(123456);
          test.setNextResponse(enrollSuccess);
          test.form.submit();
          return Expect.waitForAjaxRequest();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors/mbli45IDbggtwb4j40g3/lifecycle/activate',
            data: {
              passCode: '123456',
              stateToken: expectedStateToken,
            },
          });
        });
    });
    itp('shows error if error response on verification', function() {
      return setupAndSendCodeFn()
        .then(function(test) {
          Q.stopUnhandledRejectionTracking();
          test.setNextResponse(resActivateError);
          test.form.setCode(123);
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Your token doesn\'t match our records. Please try again.');
          expect(test.afterRenderHandler).toHaveBeenCalledTimes(1);
          expect(test.afterRenderHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'enroll-call',
            },
            {
              name: 'AuthApiError',
              message: 'Invalid Passcode/Answer',
              statusCode: 403,
              xhr: {
                status: 403,
                responseType: 'json',
                responseText: '{"errorCode":"E0000068","errorSummary":"Invalid Passcode/Answer","errorLink":"E0000068","errorId":"oaeW52tAk_9T0Obvns7jwww6g","errorCauses":[{"errorSummary":"Your token doesn\'t match our records. Please try again."}]}',
                responseJSON: {
                  errorCode: 'E0000068',
                  errorSummary: 'Your token doesn\'t match our records. Please try again.',
                  errorLink: 'E0000068',
                  errorId: 'oaeW52tAk_9T0Obvns7jwww6g',
                  errorCauses: [
                    {
                      errorSummary: 'Your token doesn\'t match our records. Please try again.',
                    },
                  ],
                },
              },
            },
          ]);
        });
    });
  }

  describe('Header & Footer', function() {
    itp('displays the correct factorBeacon', function() {
      return setup().then(function(test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-okta-call')).toBe(true);
      });
    });
    itp('links back to factors directly if phone has not been enrolled', function() {
      return setup().then(function(test) {
        test.form.backLink().click();
        expect(test.router.navigate.calls.mostRecent().args).toEqual(['signin/enroll', { trigger: true }]);
      });
    });
    itp('returns to factor list when browser\'s back button is clicked', function() {
      return setup(null, true)
        .then(function(test) {
          Util.triggerBrowserBackButton();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function(test) {
          Expect.isEnrollChoices(test.router.controller);
          Util.stopRouter();
        });
    });
    itp('visits previous link if phone is enrolled, but not activated', function() {
      return setupAndSendValidCode()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resAllFactors);
          test.form.backLink().click();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/previous',
            type: 'POST',
            data: {
              stateToken: 'testStateToken',
            },
          });
        });
    });
  });

  describe('Enroll phone number', function() {
    testEnrollPhoneNumber(setup, resEnrollSuccess);
  });

  describe('Verify phone number', function() {
    testVerifyPhoneNumber(setup, setupAndSendValidCode, resEnrollSuccess, 'testStateToken');
    itp('appends updatePhone=true to the request if user has an existing phone', function() {
      return setup(resExistingPhone)
        .then(function(test) {
          Util.resetAjaxRequests();
          return sendCode(test, resEnrollSuccess, 'US', '6501231234');
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors?updatePhone=true',
            data: {
              factorType: 'call',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+16501231234',
                phoneExtension: '',
              },
              stateToken: 'testStateToken',
            },
          });
        });
    });

    itp('shows warning message to click "Redial" after 30s', function() {
      Util.speedUpDelay();
      return setup()
        .then(function(test) {
          test.setNextResponse(resFactorEnrollActivateCall);
          enterPhone(test, 'AQ', '6501231234');
          test.form.sendCodeButton().click();
          return waitForEnrollActivateSuccess(test);
        })
        .then(function(test) {
          expectRedialButton(test);
          expect(test.form.hasWarningMessage()).toBe(true);
          expect(test.form.warningMessage()).toContain('Haven\'t received a voice call? To try again, click Redial.');
          return test;
        })
        .then(function(test) {
          // redial will clear the warning
          Util.resetAjaxRequests();
          test.setNextResponse(resFactorEnrollActivateCall);
          test.form.sendCodeButton().click();
          expectCallingButton(test);
          expect(test.form.hasWarningMessage()).toBe(false);
          return waitForEnrollActivateSuccess(test);
        })
        .then(function(test) {
          // Re-send after 30s wil show the warning again
          expectRedialButton(test);
          expect(test.form.warningMessage()).toContain('Haven\'t received a voice call? To try again, click Redial.');
        });
    });

    itp(
      'if phone number is changed after enroll, resets the status to MFA_Enroll ' +
        'and then enrolls with updatePhone=true',
      function() {
        return setupAndSendValidCode()
          .then(function(test) {
            expectCallingButton(test);
            Expect.isVisible(test.form.codeField());
            enterPhone(test, 'US', '4151112222');
            expectCallButton(test);
            Util.resetAjaxRequests();
            test.setNextResponse([resAllFactors, resEnrollSuccess]);
            test.form.sendCodeButton().click();
            return waitForEnrollActivateSuccess(test);
          })
          .then(function(test) {
            expect(Util.numAjaxRequests()).toBe(2);
            Expect.isJsonPost(Util.getAjaxRequest(0), {
              url: 'https://foo.com/api/v1/authn/previous',
              data: { stateToken: 'testStateToken' },
            });
            Expect.isJsonPost(Util.getAjaxRequest(1), {
              url: 'https://foo.com/api/v1/authn/factors?updatePhone=true',
              data: {
                factorType: 'call',
                provider: 'OKTA',
                profile: {
                  phoneNumber: '+14151112222',
                  phoneExtension: '',
                },
                stateToken: 'testStateToken',
              },
            });
            return test;
          })
          .then(function(test) {
            // form wasn't rerendered
            expect(test.form.phoneNumberField().val()).toEqual('4151112222');
            expectCallingButton(test);
            Expect.isVisible(test.form.codeField());
            Expect.isVisible(test.form.submitButton());
          });
      }
    );
  });
});
