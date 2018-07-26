/* eslint max-params: [2, 18] */
define([
  'vendor/lib/q',
  'okta/underscore',
  'okta/jquery',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/EnrollCallForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'sandbox',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_callFactor_existingPhone',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_call_success',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_error',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_errorActivate',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_invalid_phone',
  'helpers/xhr/SUCCESS',
  'LoginRouter'
],
function (Q, _, $, OktaAuth, LoginUtil, Util, Form, Beacon, Expect, $sandbox,
          resAllFactors, resExistingPhone, resEnrollSuccess, resEnrollError, resActivateError,
          resEnrollInvalidPhoneError, resSuccess, Router) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  Expect.describe('EnrollCall', function () {

    function setup(resp, startRouter) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        'features.router': startRouter
      });
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
          setNextResponse: setNextResponse
        });
      });
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
      return tick(test);
    }

    function sendCodeOnEnter(test, res, countryCode, phoneNumber, phoneExtension) {
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

    function setupAndSendCode(res, countryCode, phoneNumber, phoneExtension) {
      return setup().then(function (test) {
        return sendCode(test, res, countryCode, phoneNumber, phoneExtension);
      });
    }

    var setupAndSendValidCode = _.partial(setupAndSendCode, resEnrollSuccess, 'US', '6501231234');
    var setupAndSendInvalidCode = _.partial(setupAndSendCode, resEnrollError, 'US', '650');

    function expectRedialButton(test) {
      var button = test.form.sendCodeButton();
      expect(button.trimmedText()).toEqual('Redial');
      expect(button.hasClass('button-primary')).toBe(false);
    }

    function expectCallingButton(test) {
      var button = test.form.sendCodeButton();
      expect(button.trimmedText()).toEqual('Calling');
      expect(button.attr('class')).not.toMatch('button-primary');
      expect(button.attr('class')).toMatch('link-button-disabled');
    }

    function expectCallButton(test) {
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

    Expect.describe('Enroll phone number', function () {
      itp('has a list of countries in alphabetical order', function () {
        return setup().then(function (test) {
          var countries = test.form.countriesList();
          expect(countries[0]).toEqual({ val: 'AF', text: 'Afghanistan' });
          expect(countries[1]).toEqual({ val: 'AL', text: 'Albania' });
          expect(countries[238]).toEqual({ val: 'ZW', text: 'Zimbabwe' });
        });
      });
      itp('does not include countries with no calling codes', function () {
        return setup().then(function (test) {
          var countries = test.form.countriesList();
          expect(_.findWhere(countries, { val: 'HM'})).toBe(undefined);
          expect(_.findWhere(countries, { val: 'BV'})).toBe(undefined);
          expect(_.findWhere(countries, { val: 'TF'})).toBe(undefined);
        });
      });
      itp('has autocomplete set to false', function () {
        return setup().then(function (test) {
          expect(test.form.getCodeFieldAutocomplete()).toBe('off');
        });
      });
      itp('defaults to United States for the country', function () {
        return setup().then(function (test) {
          expect(test.form.selectedCountry()).toBe('United States');
        });
      });
      itp('updates the phone number country calling code when country is changed', function () {
        return setup().then(function (test) {
          expect(test.form.phonePrefixText()).toBe('+1');
          test.form.selectCountry('AQ');
          expect(test.form.phonePrefixText()).toBe('+672');
        });
      });
      itp('has a phone number text field', function () {
        return setup().then(function (test) {
          Expect.isTextField(test.form.phoneNumberField());
        });
      });
      itp('has a phone extension text field', function () {
        return setup().then(function (test) {
          Expect.isTextField(test.form.phoneExtensionField());
        });
      });
      itp('has a button with primary class and text "Call"', function () {
        return setup().then(function (test) {
          expectCallButton(test);
        });
      });
      itp('does not show divider', function () {
        return setup().then(function (test) {
          Expect.isNotVisible(test.form.divider());
        });
      });
      itp('does not show enter code input', function () {
        return setup().then(function (test) {
          Expect.isNotVisible(test.form.codeField());
        });
      });
      itp('does not show verify button', function () {
        return setup().then(function (test) {
          Expect.isNotVisible(test.form.submitButton());
        });
      });
      itp('validation error if phone number field is blank', function () {
        return setupAndSendCode(resEnrollSuccess, 'US', '')
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
          });
      });
      itp('clears previous errors in form when redial', function () {
        return setupAndSendInvalidCode().then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Invalid Phone Number.');
          return sendCodeOnEnter(test, resEnrollSuccess, 'US', '4151111111');
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(false);
        });
      });
      itp('enrolls with correct info when call button is clicked', function () {
        return setupAndSendCode(resEnrollSuccess, 'AQ', '12345678900')
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
        });
      });
    });

    Expect.describe('Verify phone number', function () {
      itp('replaces button text from "call" to "calling", disables it and with no primary class', function () {
        return setupAndSendValidCode().then(function (test) {
          expectCallingButton(test);
        });
      });
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
      itp('uses send code button with validatePhone:false if user has retried with invalid phone number', function () {
        return setup()
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
              stateToken: 'testStateToken'
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
              stateToken: 'testStateToken'
            }
          });
        });
      });
      itp('does not set validatePhone:false if the error is not a validation error (E0000098).', function () {
        return setup()
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
              stateToken: 'testStateToken'
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
              stateToken: 'testStateToken'
            }
          });
        });
      });
      itp('uses resend and not enrollFactor when redial is clicked', function () {
        Util.speedUpDelay();
        return setupAndSendValidCode()
        .then(function (test) {
          $.ajax.calls.reset();
          return tick(test);
        })
        .then(function (test) {
          test.setNextResponse(resEnrollSuccess);
          test.form.sendCodeButton().click();
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/factors/mbli45IDbggtwb4j40g4/lifecycle/resend',
            data: {
              stateToken: 'testStateToken'
            }
          });
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
      itp('submitting a number, then changing it, and then changing it back ' +
        'will still use the resend endpoint', function () {
        // The call button is normally disabled for several seconds
        // to prevent too many calls to the API, but for testing
        // we mock out the delay function to wait 0 seconds.
        Util.speedUpDelay();
        return setupAndSendValidCode().then(function (test) {
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
          test.setNextResponse(resEnrollSuccess);
          test.form.sendCodeButton().click();
          expectCallingButton(test);
          return tick(test);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/factors/mbli45IDbggtwb4j40g4/lifecycle/resend',
            data: {
              'stateToken': 'testStateToken'
            }
          });
        });
      });
      itp('shows divider', function () {
        return setupAndSendValidCode().then(function (test) {
          Expect.isVisible(test.form.divider());
        });
      });
      itp('shows enter code input', function () {
        return setupAndSendValidCode().then(function (test) {
          Expect.isVisible(test.form.codeField());
          expect(test.form.codeField().attr('type')).toBe('tel');
        });
      });
      itp('shows verify button when enrolled', function () {
        return setupAndSendValidCode().then(function (test) {
          Expect.isVisible(test.form.submitButton());
        });
      });
      itp('does not send request and shows error if code is not entered', function () {
        return setupAndSendValidCode().then(function (test) {
          $.ajax.calls.reset();
          test.form.submit();
          expect($.ajax).not.toHaveBeenCalled();
          expect(test.form.hasErrors()).toBe(true);
        });
      });
      itp('calls activate with the right params if passes validation', function () {
        return setupAndSendValidCode()
        .then(function (test) {
          $.ajax.calls.reset();
          test.form.setCode(123456);
          test.setNextResponse(resEnrollSuccess);
          test.form.submit();
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/factors/mbli45IDbggtwb4j40g4/lifecycle/activate',
            data: {
              passCode: '123456',
              stateToken: 'testStateToken'
            }
          });
        });
      });
      itp('shows error if error response on verification', function () {
        return setupAndSendValidCode()
        .then(function (test) {
          Q.stopUnhandledRejectionTracking();
          test.setNextResponse(resActivateError);
          test.form.setCode(123);
          test.form.submit();
          return tick(test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Your token doesn\'t match our records. Please try again.');
        });
      });
    });

  });

});
