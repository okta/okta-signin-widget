/* eslint max-params: 0 */
import { _, $ } from 'okta';
import createAuthClient from 'widget/createAuthClient';
import Router from 'LoginRouter';
import AuthContainer from 'helpers/dom/AuthContainer';
import Beacon from 'helpers/dom/Beacon';
import Form from 'helpers/dom/EnrollSmsForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resEnrollError from 'helpers/xhr/MFA_ENROLL_ACTIVATE_error';
import resEnrollActivateError from 'helpers/xhr/MFA_ENROLL_ACTIVATE_errorActivate';
import resEnrollInvalidPhoneError from 'helpers/xhr/MFA_ENROLL_ACTIVATE_invalid_phone';
import resEnrollSuccess from 'helpers/xhr/MFA_ENROLL_ACTIVATE_success';
import resAllFactors from 'helpers/xhr/MFA_ENROLL_allFactors';
import resExistingPhone from 'helpers/xhr/MFA_ENROLL_smsFactor_existingPhone';
import resSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const itp = Expect.itp;

Expect.describe('EnrollSms', function() {
  function setup(resp, startRouter, routerOptions = {}) {
    const setNextResponse = Util.mockAjax();
    const baseUrl = 'https://foo.com';
    const authClient = createAuthClient({ issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR });
    const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    const router = new Router({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      defaultCountryCode: routerOptions.defaultCountryCode,
      'features.router': startRouter,
    });

    router.on('afterError', afterErrorHandler);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router, startRouter);

    const test = {
      router: router,
      authContainer: new AuthContainer($sandbox),
      beacon: new Beacon($sandbox),
      form: new Form($sandbox),
      ac: authClient,
      setNextResponse: setNextResponse,
      afterErrorHandler: afterErrorHandler,
    };

    const enrollSms = test => {
      setNextResponse(resp || resAllFactors);
      router.refreshAuthState('dummy-token');
      return Expect.waitForEnrollChoices(test)
        .then(function(test) {
          router.enrollSms();
          return Expect.waitForEnrollSms(test);
        })
        .then(test => {
          spyOn(test.router.controller, 'trapAuthResponse').and.callThrough();
          return test;
        });
    };

    if (startRouter) {
      return Expect.waitForPrimaryAuth(test).then(enrollSms);
    } else {
      return enrollSms(test);
    }
  }

  function enterCode(test, countryCode, phoneNumber) {
    test.form.selectCountry(countryCode);
    test.form.setPhoneNumber(phoneNumber);
  }

  function sendCode(test, res, countryCode, phoneNumber) {
    test.setNextResponse(res);
    enterCode(test, countryCode, phoneNumber);
    test.form.sendCodeButton().click();
    return test;
  }

  function sendCodeOnEnter(test, res, countryCode, phoneNumber) {
    test.setNextResponse(res);
    enterCode(test, countryCode, phoneNumber);
    const keydown = $.Event('keydown');

    keydown.which = 13;
    test.form.phoneNumberField().trigger(keydown);
    const keyup = $.Event('keyup');

    keyup.which = 13;
    test.form.phoneNumberField().trigger(keyup);
    return test;
  }

  function waitForEnrollActivateSuccess(test) {
    test.router.controller.trapAuthResponse.calls.reset();
    return Expect.waitForSpyCall(test.router.controller.trapAuthResponse, test);
  }

  function setupAndSendCode(res, countryCode, phoneNumber) {
    return setup().then(function(test) {
      return sendCode(test, res, countryCode, phoneNumber);
    });
  }

  const setupAndSendValidCode = function() {
    return setup().then(function(test) {
      sendCode(test, resEnrollSuccess, 'US', '4151234567');
      return waitForEnrollActivateSuccess(test);
    });
  };

  const setupAndSendInvalidCode = function() {
    return setup().then(function(test) {
      sendCode(test, resEnrollError, 'US', '415');
      return Expect.waitForFormError(test.form, test);
    });
  };

  function expectResendButton(test) {
    const button = test.form.sendCodeButton();

    expect(button.trimmedText()).toEqual('Re-send code');
    expect(button.hasClass('button-primary')).toBe(false);
  }

  function expectSentButton(test) {
    const button = test.form.sendCodeButton();

    expect(button.trimmedText()).toEqual('Sent');
    expect(button.attr('class')).not.toMatch('button-primary');
    expect(button.attr('class')).toMatch('link-button-disabled');
  }

  function expectSendButton(test) {
    const button = test.form.sendCodeButton();

    expect(button.trimmedText()).toEqual('Send code');
    expect(button.hasClass('button-primary')).toBe(true);
  }

  function testHeaderAndFooter(allFactorsRes, sendValidCodeFn, expectedStateToken) {
    itp('displays the correct factorBeacon', function() {
      return setup(allFactorsRes).then(function(test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-okta-sms')).toBe(true);
      });
    });
    itp('links back to factors directly if phone has not been enrolled', function() {
      return setup(allFactorsRes).then(function(test) {
        test.form.backLink().click();
        expect(test.router.navigate.calls.mostRecent().args).toEqual(['signin/enroll', { trigger: true }]);
      });
    });
    itp('returns to factor list when browser\'s back button is clicked', function() {
      return setup(allFactorsRes, true)
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
      return sendValidCodeFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resAllFactors);
          test.form.backLink().click();
          return Expect.waitForEnrollChoices();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/previous',
            type: 'POST',
            data: {
              stateToken: expectedStateToken,
            },
          });
        });
    });
  }

  function testEnrollPhoneNumber(allFactorsRes, successRes, sendCodeFn, expectedStateToken) {
    itp('has a list of countries in alphabetical order', function() {
      return setup(allFactorsRes).then(function(test) {
        const countries = test.form.countriesList();

        expect(countries[0]).toEqual({ val: 'AF', text: 'Afghanistan' });
        expect(countries[1]).toEqual({ val: 'AL', text: 'Albania' });
        expect(countries[239]).toEqual({ val: 'ZW', text: 'Zimbabwe' });
      });
    });
    itp('does not include countries with no calling codes', function() {
      return setup(allFactorsRes).then(function(test) {
        const countries = test.form.countriesList();

        expect(_.findWhere(countries, { val: 'HM' })).toBe(undefined);
        expect(_.findWhere(countries, { val: 'BV' })).toBe(undefined);
        expect(_.findWhere(countries, { val: 'TF' })).toBe(undefined);
      });
    });
    itp('beacon could not be minimized if it is a factor beacon', function() {
      return setup(allFactorsRes).then(function(test) {
        expect(test.authContainer.canBeMinimized()).toBe(false);
      });
    });
    itp('has autocomplete set to false', function() {
      return setup().then(function(test) {
        expect(test.form.getCodeFieldAutocomplete()).toBe('off');
      });
    });
    itp('has search input display set correctly', function() {
      return setup().then(function(test) {
        const searchInput = $sandbox.find('.chzn-search > input');
        expect(searchInput.css('display')).toBe('none');
        const mousedown = $.Event('mousedown');
        test.form.countryDropdown().trigger(mousedown);
        expect(searchInput.css('display')).toBe('inline-block');
      });
    });
    itp('defaults to United States for the country', function() {
      return setup(allFactorsRes)
        .then(function(test) {
          return Expect.wait(function() {
            return test.form.hasCountriesList();
          }, test);
        })
        .then(function(test) {
          expect(test.form.selectedCountry()).toBe('United States');
        });
    });
    itp('selects country based on defaultCountryCode from settings', function() {
      return setup(allFactorsRes, undefined, { defaultCountryCode: 'GB' })
        .then(function(test) {
          return Expect.wait(function() {
            return test.form.hasCountriesList();
          }, test);
        })
        .then(function(test) {
          expect(test.form.selectedCountry()).toBe('United Kingdom');
        });
    });
    itp('uses "US" as countryCode if settings.defaultCountryCode is not valid', function() {
      return setup(allFactorsRes, undefined, { defaultCountryCode: 'FAKECODE' })
        .then(function(test) {
          return Expect.wait(function() {
            return test.form.hasCountriesList();
          }, test);
        })
        .then(function(test) {
          expect(test.form.selectedCountry()).toBe('United States');
        });
    });
    itp('updates the phone number country calling code when country is changed', function() {
      return setup(allFactorsRes).then(function(test) {
        expect(test.form.phonePrefixText()).toBe('+1');
        test.form.selectCountry('AQ');
        expect(test.form.phonePrefixText()).toBe('+672');
      });
    });
    itp('has a phone number text field', function() {
      return setup(allFactorsRes).then(function(test) {
        Expect.isTextField(test.form.phoneNumberField());
      });
    });
    itp('allows autocomplete for phone number text field', function() {
      return setup(allFactorsRes).then(function(test) {
        expect(test.form.getPhoneNumberAutocomplete()).toBe('tel');
      });
    });
    itp('has a button with primary class and text "Send Code"', function() {
      return setup(allFactorsRes).then(function(test) {
        expectSendButton(test);
      });
    });
    itp('does not show divider', function() {
      return setup(allFactorsRes).then(function(test) {
        Expect.isNotVisible(test.form.divider());
      });
    });
    itp('does not show enter code input', function() {
      return setup(allFactorsRes).then(function(test) {
        Expect.isNotVisible(test.form.codeField());
      });
    });
    itp('does not show verify button', function() {
      return setup(allFactorsRes).then(function(test) {
        Expect.isNotVisible(test.form.submitButton());
      });
    });

    itp('sends sms when return key is pressed in phoneNumber field', function() {
      return setup(allFactorsRes)
        .then(function(test) {
          Util.resetAjaxRequests();
          return sendCodeOnEnter(test, successRes, 'US', '4151111111');
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'sms',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+14151111111',
              },
              stateToken: expectedStateToken,
            },
          });
        });
    });

    itp('clears previous errors in form when resend code', function() {
      return setupAndSendInvalidCode()
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Invalid Phone Number.');
          sendCodeOnEnter(test, successRes, 'US', '4151111111');
          return waitForEnrollActivateSuccess(test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(false);
        });
    });

    itp('validation error if phone number field is blank', function() {
      return sendCodeFn(successRes, 'US', '').then(function(test) {
        expect(test.form.hasErrors()).toBe(true);
      });
    });

    itp('shows warning message to click "Re-send" after 30s', function() {
      Util.speedUpDelay();
      return sendCodeFn(successRes, 'US', '4151111111')
        .then(waitForEnrollActivateSuccess)
        .then(function(test) {
          expectResendButton(test);
          expect(test.form.hasWarningMessage()).toBe(true);
          expect(test.form.warningMessage()).toContain('Haven\'t received an SMS? To try again, click Re-send code.');
          return test;
        })
        .then(function(test) {
          // Re-send will clear the warning
          Util.resetAjaxRequests();
          test.setNextResponse(successRes);
          test.form.sendCodeButton().click();
          expectSentButton(test);
          expect(test.form.hasWarningMessage()).toBe(false);
          return test;
        })
        .then(waitForEnrollActivateSuccess)
        .then(function(test) {
          // Re-send after 30s wil show the warning again
          expectResendButton(test);
          expect(test.form.warningMessage()).toContain('Haven\'t received an SMS? To try again, click Re-send code.');
        });
    });

    itp('enrolls with correct info when sendCode is clicked', function() {
      return sendCodeFn(successRes, 'AQ', '12345678900').then(waitForEnrollActivateSuccess).then(function() {
        expect(Util.numAjaxRequests()).toBe(2);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/introspect',
          data: {
            stateToken: 'dummy-token',
          },
        });
        Expect.isJsonPost(Util.getAjaxRequest(1), {
          url: 'https://foo.com/api/v1/authn/factors',
          data: {
            factorType: 'sms',
            provider: 'OKTA',
            profile: {
              phoneNumber: '+67212345678900',
            },
            stateToken: expectedStateToken,
          },
        });
      });
    });

    itp('shows error and does not go to next step if error response', function() {
      return setupAndSendInvalidCode().then(function(test) {
        expectSendButton(test);
        Expect.isNotVisible(test.form.divider());
        Expect.isNotVisible(test.form.codeField());
        Expect.isNotVisible(test.form.submitButton());
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorMessage()).toBe('Invalid Phone Number.');
        expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
        expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
          {
            controller: 'enroll-sms',
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

  function testVerifyPhoneNumber(allFactorsRes, successRes, sendValidCodeFn, existingPhoneRes, expectedStateToken) {
    itp('replaces send code with sent button, disabled and with no primary class', function() {
      return sendValidCodeFn().then(function(test) {
        expectSentButton(test);
      });
    });
    itp('uses send code button with updatePhone=true, if user has an existing phone', function() {
      return setup(existingPhoneRes)
        .then(function(test) {
          Util.resetAjaxRequests();
          return sendCode(test, successRes, 'US', '4151234567');
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors?updatePhone=true',
            data: {
              factorType: 'sms',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+14151234567',
              },
              stateToken: expectedStateToken,
            },
          });
        });
    });
    itp('uses send code button with validatePhone:false if user has retried with invalid phone number', function() {
      return setup(allFactorsRes)
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
              factorType: 'sms',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+68912345678',
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
          return Expect.waitForAjaxRequest(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'sms',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+68912345678',
                validatePhone: false,
              },
              stateToken: expectedStateToken,
            },
          });
        });
    });
    itp('does not set validatePhone:false if the error is not a validation error (E0000098).', function() {
      return setup(allFactorsRes)
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
              factorType: 'sms',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+68912345678',
              },
              stateToken: expectedStateToken,
            },
          });

          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toEqual('Invalid Phone Number.');

          Util.resetAjaxRequests();
          sendCode(test, resEnrollError, 'PF', '12345678');
          return Expect.waitForAjaxRequest(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'sms',
              provider: 'OKTA',
              profile: {
                phoneNumber: '+68912345678',
              },
              stateToken: expectedStateToken,
            },
          });
        });
    });
    itp('uses resend and not enrollFactor when re-send is clicked', function() {
      Util.speedUpDelay();
      return sendValidCodeFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(successRes);
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
      'if phone number is changed after enroll, resets the status to MFA_Enroll ' +
        'and then enrolls with updatePhone=true',
      function() {
        return sendValidCodeFn()
          .then(function(test) {
            expectSentButton(test);
            Expect.isVisible(test.form.codeField());
            enterCode(test, 'US', '4151112222');
            expectSendButton(test);
            Util.resetAjaxRequests();
            test.setNextResponse([allFactorsRes, successRes]);
            test.form.sendCodeButton().click();
            return Expect.wait(() => {
              return Util.numAjaxRequests() === 2;
            }, test);
          })
          .then(function(test) {
            expect(Util.numAjaxRequests()).toBe(2);
            Expect.isJsonPost(Util.getAjaxRequest(0), {
              url: 'https://foo.com/api/v1/authn/previous',
              data: { stateToken: expectedStateToken },
            });
            Expect.isJsonPost(Util.getAjaxRequest(1), {
              url: 'https://foo.com/api/v1/authn/factors?updatePhone=true',
              data: {
                factorType: 'sms',
                provider: 'OKTA',
                profile: {
                  phoneNumber: '+14151112222',
                },
                stateToken: expectedStateToken,
              },
            });
            return test;
          })
          .then(function(test) {
            // form wasn't rerendered
            expect(test.form.phoneNumberField().val()).toEqual('4151112222');
            expectSentButton(test);
            Expect.isVisible(test.form.codeField());
            Expect.isVisible(test.form.submitButton());
          });
      }
    );
    itp(
      'submitting a number, then changing it, and then changing it back ' + 'will still use the resend endpoint',
      function() {
        // The send button is normally diabled for several seconds
        // to prevent too many calls to the API, but for testing
        // we mock out the delay function to wait 0 seconds.
        Util.speedUpDelay();
        return sendValidCodeFn()
          .then(function(test) {
            // change the number from 'US' to 'AQ'
            enterCode(test, 'AQ', '4151234567');
            expectSendButton(test);
            return test;
          })
          .then(function(test) {
            // change the number back to 'US'
            enterCode(test, 'US', '4151234567');
            expectResendButton(test);
            return test;
          })
          .then(function(test) {
            // resubmit the 'US' number
            Util.resetAjaxRequests();
            test.setNextResponse(successRes);
            test.form.sendCodeButton().click();
            expectSentButton(test);
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
      return sendValidCodeFn().then(function(test) {
        Expect.isVisible(test.form.divider());
      });
    });
    itp('shows enter code input', function() {
      return sendValidCodeFn().then(function(test) {
        Expect.isVisible(test.form.codeField());
      });
    });
    itp('shows verify button when enrolled', function() {
      return sendValidCodeFn().then(function(test) {
        Expect.isVisible(test.form.submitButton());
      });
    });
    itp('does not send request and shows error if code is not entered', function() {
      return sendValidCodeFn().then(function(test) {
        Util.resetAjaxRequests();
        test.form.submit();
        expect(Util.numAjaxRequests()).toBe(0);
        expect(test.form.hasErrors()).toBe(true);
      });
    });
    itp('calls activate with the right params if passes validation', function() {
      return sendValidCodeFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          expect(test.form.codeField().attr('type')).toBe('tel');
          test.form.setCode(123456);
          test.setNextResponse(successRes);
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
      return sendValidCodeFn()
        .then(function(test) {
          test.setNextResponse(resEnrollActivateError);
          test.form.setCode(123);
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Your token doesn\'t match our records. Please try again.');
          expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
          expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'enroll-sms',
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
    testHeaderAndFooter(resAllFactors, setupAndSendValidCode, 'testStateToken');
  });

  describe('Enroll phone number', function() {
    testEnrollPhoneNumber(resAllFactors, resEnrollSuccess, setupAndSendCode, 'testStateToken');
  });

  describe('Verify phone number', function() {
    testVerifyPhoneNumber(resAllFactors, resSuccess, setupAndSendValidCode, resExistingPhone, 'testStateToken');
  });
});
