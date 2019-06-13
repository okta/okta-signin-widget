/* eslint max-params: [2, 18] */
define([
  'q',
  'okta',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/EnrollCallForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'sandbox',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/FACTOR_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_callFactor_existingPhone',
  'helpers/xhr/FACTOR_ENROLL_callFactor_existingPhone',
  'helpers/xhr/FACTOR_ENROLL_call',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_call_success',
  'helpers/xhr/FACTOR_ENROLL_ACTIVATE_call',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_error',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_errorActivate',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_invalid_phone',
  'LoginRouter'
],
/* eslint max-params: [2, 20] */
function (Q, Okta, OktaAuth, LoginUtil, Util, Form, Beacon, Expect, $sandbox,
  resAllFactors, resAllFactorsIdx, resExistingPhone, resFactorEnrollExistingPhone, resFactorEnrollCall, resEnrollSuccess, resFactorEnrollActivateCall, resEnrollError, resActivateError,
  resEnrollInvalidPhoneError, Router) {

  var { _, $ } = Okta;
  var itp = Expect.itp;
  var tick = Expect.tick;

  Expect.describe('EnrollCall', function () {

    function setup (resp, startRouter) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
      var afterRenderHandler = jasmine.createSpy('afterRenderHandler');
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        'features.router': startRouter
      });
      router.on('afterError', afterRenderHandler);
      Util.registerRouter(router);
      Util.mockRouterNavigate(router, startRouter);
      return tick()
        .then(function () {
          setNextResponse(resp || resAllFactors);
          router.refreshAuthState('dummy-token');
          return Expect.waitForEnrollChoices();
        })
        .then(function () {
          router.enrollCall();
          return Expect.waitForEnrollCall({
            router: router,
            beacon: new Beacon($sandbox),
            form: new Form($sandbox),
            ac: authClient,
            setNextResponse: setNextResponse,
            afterRenderHandler: afterRenderHandler
          });
        });
    }

    function setupWithFactorEnroll () {
      return setup(resAllFactorsIdx);
    }

    function enterPhone (test, countryCode, phoneNumber, phoneExtension) {
      test.form.selectCountry(countryCode);
      test.form.setPhoneNumber(phoneNumber);
      test.form.setPhoneExtension(phoneExtension);
    }

    function sendCode (test, res, countryCode, phoneNumber, phoneExtension) {
      test.setNextResponse(res);
      enterPhone(test, countryCode, phoneNumber, phoneExtension);
      test.form.sendCodeButton().click();
      return tick(test);
    }

    function sendCodeOnEnter (test, res, countryCode, phoneNumber, phoneExtension) {
      test.setNextResponse(res);
      enterPhone(test, countryCode, phoneNumber, phoneExtension);
      var keydown = $.Event('keydown');
      keydown.which = 13;
      test.form.phoneNumberField().trigger(keydown);
      var keyup = $.Event('keyup');
      keyup.which = 13;
      test.form.phoneNumberField().trigger(keyup);
      return tick(test);
    }

    function setupAndSendCode (res, countryCode, phoneNumber, phoneExtension) {
      return setup().then(function (test) {
        return sendCode(test, res, countryCode, phoneNumber, phoneExtension);
      });
    }

    var setupAndSendValidCode = _.partial(setupAndSendCode, resEnrollSuccess, 'US', '6501231234');
    var setupAndSendValidCodeWithFactorEnroll = _.partial(setupAndSendCode, resFactorEnrollActivateCall, 'US', '6501231234');
    var setupAndSendInvalidCode = _.partial(setupAndSendCode, resEnrollError, 'US', '650');

    function expectRedialButton (test) {
      var button = test.form.sendCodeButton();
      expect(button.trimmedText()).toEqual('Redial');
      expect(button.hasClass('button-primary')).toBe(false);
    }

    function expectCallingButton (test) {
      var button = test.form.sendCodeButton();
      expect(button.trimmedText()).toEqual('Calling');
      expect(button.attr('class')).not.toMatch('button-primary');
      expect(button.attr('class')).toMatch('link-button-disabled');
    }

    function expectCallButton (test) {
      var button = test.form.sendCodeButton();
      expect(button.trimmedText()).toEqual('Call');
      expect(button.hasClass('button-primary')).toBe(true);
    }

    Expect.describe('Header & Footer', function () {
      itp('displays the correct factorBeacon', function () {
        return setup().then(function (test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-okta-call')).toBe(true);
        });
      });
      itp('links back to factors directly if phone has not been enrolled', function () {
        return setup().then(function (test) {
          test.form.backLink().click();
          expect(test.router.navigate.calls.mostRecent().args)
            .toEqual(['signin/enroll', { trigger: true }]);
        });
      });
      itp('returns to factor list when browser\'s back button is clicked', function () {
        return setup(null, true).then(function (test) {
          Util.triggerBrowserBackButton();
          return Expect.waitForEnrollChoices(test);
        })
          .then(function (test) {
            Expect.isEnrollChoices(test.router.controller);
            Util.stopRouter();
          });
      });
      itp('visits previous link if phone is enrolled, but not activated', function () {
        return setupAndSendValidCode().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resAllFactors);
          test.form.backLink().click();
          return Expect.waitForEnrollChoices(test);
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/previous',
              type: 'POST',
              data: {
                stateToken: 'testStateToken'
              }
            });
          });
      });
    });

    function expectAlphabeticalCountryList (test) {
      var countries = test.form.countriesList();
      expect(countries[0]).toEqual({ val: 'AF', text: 'Afghanistan' });
      expect(countries[1]).toEqual({ val: 'AL', text: 'Albania' });
      expect(countries[239]).toEqual({ val: 'ZW', text: 'Zimbabwe' });
    }

    function expectCountriesWithNoCallingCodes (test) {
      var countries = test.form.countriesList();
      expect(_.findWhere(countries, { val: 'HM' })).toBe(undefined);
      expect(_.findWhere(countries, { val: 'BV' })).toBe(undefined);
      expect(_.findWhere(countries, { val: 'TF' })).toBe(undefined);
    }

    function expectCountryCallingCodeUpdates (test) {
      expect(test.form.phonePrefixText()).toBe('+1');
      test.form.selectCountry('AQ');
      expect(test.form.phonePrefixText()).toBe('+672');
    }

    function testEnrollPhoneNumber (setupFn, enrollSuccess) {
      it('has a list of countries in alphabetical order', function () {
        return setupFn().then(function (test) {
          expectAlphabeticalCountryList(test);
        });
      });
      itp('does not include countries with no calling codes', function () {
        return setupFn().then(function (test) {
          expectCountriesWithNoCallingCodes(test);
        });
      });
      itp('has autocomplete set to false', function () {
        return setupFn().then(function (test) {
          expect(test.form.getCodeFieldAutocomplete()).toBe('off');
        });
      });
      itp('defaults to United States for the country', function () {
        return setupFn().then(function (test) {
          expect(test.form.selectedCountry()).toBe('United States');
        });
      });
      itp('updates the phone number country calling code when country is changed', function () {
        return setupFn().then(function (test) {
          expectCountryCallingCodeUpdates(test);
        });
      });
      itp('has a phone number text field', function () {
        return setupFn().then(function (test) {
          Expect.isTextField(test.form.phoneNumberField());
        });
      });
      itp('has a phone extension text field', function () {
        return setupFn().then(function (test) {
          Expect.isTextField(test.form.phoneExtensionField());
        });
      });
      itp('has a button with primary class and text "Call"', function () {
        return setup().then(function (test) {
          expectCallButton(test);
        });
      });
      itp('does not show divider', function () {
        return setupFn().then(function (test) {
          Expect.isNotVisible(test.form.divider());
        });
      });
      itp('does not show enter code input', function () {
        return setupFn().then(function (test) {
          Expect.isNotVisible(test.form.codeField());
        });
      });
      itp('does not show verify button', function () {
        return setupFn().then(function (test) {
          Expect.isNotVisible(test.form.submitButton());
        });
      });
      itp('validation error if phone number field is blank', function () {
        return setupAndSendCode(enrollSuccess, 'US', '')
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
          });
      });
      itp('clears previous errors in form when redial', function () {
        return setupAndSendInvalidCode().then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Invalid Phone Number.');
          return sendCodeOnEnter(test, enrollSuccess, 'US', '4151111111');
        })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(false);
          });
      });
      itp('enrolls with correct info when call button is clicked', function () {
        return setupAndSendCode(enrollSuccess, 'AQ', '12345678900')
          .then(function () {
            expect($.ajax.calls.count()).toBe(2);
            Expect.isJsonPost($.ajax.calls.argsFor(1), {
              url: 'https://foo.com/api/v1/authn/factors',
              data: {
                factorType: 'call',
                provider: 'OKTA',
                profile: {
                  phoneNumber: '+67212345678900',
                  phoneExtension: ''
                },
                stateToken: 'testStateToken'
              }
            });
          });
      });
      itp('shows error and does not go to next step if error response', function () {
        return setupAndSendInvalidCode().then(function (test) {
          expectCallButton(test);
          Expect.isNotVisible(test.form.divider());
          Expect.isNotVisible(test.form.codeField());
          Expect.isNotVisible(test.form.submitButton());
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Invalid Phone Number.');
          expect(test.afterRenderHandler).toHaveBeenCalledTimes(1);
          expect(test.afterRenderHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'enroll-call'
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
                  'errorCode': 'E0000001',
                  'errorSummary': 'Invalid Phone Number.',
                  'errorLink': 'E0000001',
                  'errorId': 'oaepmWRr7i5TZa2AQv8sNmu6w',
                  'errorCauses': [{
                    'errorSummary': 'Invalid Phone Number.'
                  }]
                }
              }
            }
          ]);
        });
      });
    }

    function testVerifyPhoneNumber (setupFn, setupAndSendCodeFn, enrollSuccess, existingPhone, expectedStateToken, ) {
      itp('replaces button text from "call" to "calling", disables it and with no primary class', function () {
        return setupAndSendCodeFn().then(function (test) {
          expectCallingButton(test);
        });
      });

      itp('uses send code button with validatePhone:false if user has retried with invalid phone number', function () {
        return setupFn()
          .then(function (test) {
            $.ajax.calls.reset();
            return sendCode(test, resEnrollInvalidPhoneError, 'PF', '12345678');
          })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors',
              data: {
                factorType: 'call',
                provider: 'OKTA',
                profile: {
                  phoneNumber: '+68912345678',
                  phoneExtension: ''
                },
                stateToken: expectedStateToken
              }
            });

            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage())
              .toEqual('The number you entered seems invalid. If the number is correct, please try again.');

            $.ajax.calls.reset();
            return sendCode(test, resEnrollInvalidPhoneError, 'PF', '12345678');
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors',
              data: {
                factorType: 'call',
                provider: 'OKTA',
                profile: {
                  phoneNumber: '+68912345678',
                  phoneExtension: '',
                  validatePhone: false
                },
                stateToken: expectedStateToken
              }
            });
          });
      });
      itp('does not set validatePhone:false if the error is not a validation error (E0000098).', function () {
        return setupFn()
          .then(function (test) {
            $.ajax.calls.reset();
            return sendCode(test, resEnrollError, 'PF', '12345678');
          })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors',
              data: {
                factorType: 'call',
                provider: 'OKTA',
                profile: {
                  phoneNumber: '+68912345678',
                  phoneExtension: ''
                },
                stateToken: expectedStateToken
              }
            });

            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage())
              .toEqual('Invalid Phone Number.');

            $.ajax.calls.reset();
            return sendCode(test, resEnrollError, 'PF', '12345678');
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors',
              data: {
                factorType: 'call',
                provider: 'OKTA',
                profile: {
                  phoneNumber: '+68912345678',
                  phoneExtension: ''
                },
                stateToken: expectedStateToken
              }
            });
          });
      });
      itp('uses resend and not enrollFactor when redial is clicked', function () {
        Util.speedUpDelay();
        return setupAndSendCodeFn()
          .then(function (test) {
            $.ajax.calls.reset();
            return tick(test);
          })
          .then(function (test) {
            test.setNextResponse(enrollSuccess);
            test.form.sendCodeButton().click();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/mbli45IDbggtwb4j40g3/lifecycle/resend',
              data: {
                stateToken: expectedStateToken
              }
            });
          });
      });
      itp('submitting a number, then changing it, and then changing it back ' +
      'will still use the resend endpoint', function () {
        // The call button is normally disabled for several seconds
        // to prevent too many calls to the API, but for testing
        // we mock out the delay function to wait 0 seconds.
        Util.speedUpDelay();
        return setupAndSendCodeFn().then(function (test) {
          // change the number from 'US' to 'AQ'
          enterPhone(test, 'AQ', '6501231234');
          expectCallButton(test);
          return tick(test);
        })
          .then(function (test) {
            // change the number back to 'US'
            enterPhone(test, 'US', '6501231234');
            expectRedialButton(test);
            return tick(test);
          })
          .then(function (test) {
            // resubmit the 'US' number
            $.ajax.calls.reset();
            test.setNextResponse(enrollSuccess);
            test.form.sendCodeButton().click();
            expectCallingButton(test);
            return tick(test);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/mbli45IDbggtwb4j40g3/lifecycle/resend',
              data: {
                'stateToken': expectedStateToken
              }
            });
          });
      });
      itp('shows divider', function () {
        return setupAndSendCodeFn().then(function (test) {
          Expect.isVisible(test.form.divider());
        });
      });
      itp('shows enter code input', function () {
        return setupAndSendCodeFn().then(function (test) {
          Expect.isVisible(test.form.codeField());
          expect(test.form.codeField().attr('type')).toBe('tel');
        });
      });
      itp('shows verify button when enrolled', function () {
        return setupAndSendCodeFn().then(function (test) {
          Expect.isVisible(test.form.submitButton());
        });
      });
      itp('does not send request and shows error if code is not entered', function () {
        return setupAndSendCodeFn().then(function (test) {
          $.ajax.calls.reset();
          test.form.submit();
          expect($.ajax).not.toHaveBeenCalled();
          expect(test.form.hasErrors()).toBe(true);
        });
      });
      itp('calls activate with the right params if passes validation', function () {
        return setupAndSendCodeFn()
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setCode(123456);
            test.setNextResponse(enrollSuccess);
            test.form.submit();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/mbli45IDbggtwb4j40g3/lifecycle/activate',
              data: {
                passCode: '123456',
                stateToken: expectedStateToken
              }
            });
          });
      });
      itp('shows error if error response on verification', function () {
        return setupAndSendCodeFn()
          .then(function (test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resActivateError);
            test.form.setCode(123);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Your token doesn\'t match our records. Please try again.');
            expect(test.afterRenderHandler).toHaveBeenCalledTimes(1);
            expect(test.afterRenderHandler.calls.allArgs()[0]).toEqual([
              {
                controller: 'enroll-call'
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
                    errorCauses: [{
                      errorSummary: 'Your token doesn\'t match our records. Please try again.'
                    }]
                  }
                }
              }
            ]);
          });
      });
    }

    Expect.describe('Enroll phone number', function () {
      testEnrollPhoneNumber(setup, resEnrollSuccess);
    });

    Expect.describe('Enroll phone number on Idx Pipeline', function () {
      testEnrollPhoneNumber(setupWithFactorEnroll, resFactorEnrollActivateCall);
    });

    Expect.describe('Verify phone number', function () {
      testVerifyPhoneNumber(setup, setupAndSendValidCode, resEnrollSuccess, resExistingPhone,  'testStateToken');
      itp('appends updatePhone=true to the request if user has an existing phone', function () {
        return setup(resExistingPhone).then(function (test) {
          $.ajax.calls.reset();
          return sendCode(test, resEnrollSuccess, 'US', '6501231234');
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors?updatePhone=true',
              data: {
                factorType: 'call',
                provider: 'OKTA',
                profile: {
                  phoneNumber: '+16501231234',
                  phoneExtension: ''
                },
                stateToken: 'testStateToken'
              }
            });
          });
      });

      itp('shows warning message to click "Redial" after 30s', function () {  
        Util.speedUpDelay();      
        return setup().then(function (test) {
          test.setNextResponse(resFactorEnrollActivateCall);
          enterPhone(test, 'AQ', '6501231234');
          test.form.sendCodeButton().click();
          return tick(test);
        })
          .then(function (test) {
            expectRedialButton(test);
            expect(test.form.hasWarningMessage()).toBe(true);
            expect(test.form.warningMessage()).toContain(
              'Haven\'t received a voice call? To try again, click Redial.');
            return tick(test);
          })
          .then(function (test) {
            // redial will clear the warning
            $.ajax.calls.reset();
            test.setNextResponse(resFactorEnrollActivateCall);
            test.form.sendCodeButton().click();
            expectCallingButton(test);
            expect(test.form.hasWarningMessage()).toBe(false);
            return tick(test);
          })
          .then(function (test){
            // Re-send after 30s wil show the warning again
            expectRedialButton(test);
            expect(test.form.warningMessage()).toContain(
              'Haven\'t received a voice call? To try again, click Redial.');
          });
      });

      itp('if phone number is changed after enroll, resets the status to MFA_Enroll ' +
        'and then enrolls with updatePhone=true', function () {
        return setupAndSendValidCode().then(function (test) {
          expectCallingButton(test);
          Expect.isVisible(test.form.codeField());
          enterPhone(test, 'US', '4151112222');
          expectCallButton(test);
          $.ajax.calls.reset();
          test.setNextResponse([resAllFactors, resEnrollSuccess]);
          test.form.sendCodeButton().click();
          return tick(test);
        })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(2);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/previous',
              data: { stateToken: 'testStateToken' }
            });
            Expect.isJsonPost($.ajax.calls.argsFor(1), {
              url: 'https://foo.com/api/v1/authn/factors?updatePhone=true',
              data: {
                factorType: 'call',
                provider: 'OKTA',
                profile: {
                  phoneNumber: '+14151112222',
                  phoneExtension: ''
                },
                stateToken: 'testStateToken'
              }
            });
            return tick(test);
          })
          .then(function (test) {
            // form wasn't rerendered
            expect(test.form.phoneNumberField().val()).toEqual('4151112222');
            expectCallingButton(test);
            Expect.isVisible(test.form.codeField());
            Expect.isVisible(test.form.submitButton());
          });
      });
    });
    Expect.describe('Verify phone number on Idx Pipeline', function () {
      testVerifyPhoneNumber(setupWithFactorEnroll, setupAndSendValidCodeWithFactorEnroll, resFactorEnrollActivateCall, resFactorEnrollExistingPhone, '01testStateToken');
    });

  });

});
