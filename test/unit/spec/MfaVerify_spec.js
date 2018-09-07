/* eslint max-params: [2, 50], max-statements: [2, 45], camelcase: 0 */
define([
  'okta',
  'vendor/lib/q',
  'duo',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/MfaVerifyForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'util/BrowserFeatures',
  'util/RouterUtil',
  'sandbox',
  'util/webauthn',
  'helpers/xhr/MFA_REQUIRED_allFactors',
  'helpers/xhr/MFA_REQUIRED_allFactors_OnPrem',
  'helpers/xhr/MFA_REQUIRED_oktaVerifyTotpOnly',
  'helpers/xhr/MFA_REQUIRED_webauthn',
  'helpers/xhr/MFA_REQUIRED_oktaPassword',
  'helpers/xhr/MFA_REQUIRED_U2F',
  'helpers/xhr/MFA_CHALLENGE_duo',
  'helpers/xhr/MFA_CHALLENGE_sms',
  'helpers/xhr/MFA_CHALLENGE_call',
  'helpers/xhr/MFA_CHALLENGE_email',
  'helpers/xhr/MFA_CHALLENGE_Webauthn',
  'helpers/xhr/MFA_CHALLENGE_u2f',
  'helpers/xhr/MFA_CHALLENGE_customFactor',
  'helpers/xhr/MFA_CHALLENGE_push',
  'helpers/xhr/MFA_CHALLENGE_push_rejected',
  'helpers/xhr/MFA_CHALLENGE_push_timeout',
  'helpers/xhr/SUCCESS',
  'helpers/xhr/MFA_VERIFY_invalid_answer',
  'helpers/xhr/MFA_VERIFY_invalid_password',
  'helpers/xhr/MFA_VERIFY_totp_invalid_answer',
  'helpers/xhr/RSA_ERROR_change_pin',
  'helpers/xhr/SMS_RESEND_error',
  'helpers/xhr/NO_PERMISSION_error',
  'helpers/xhr/MFA_LOCKED_FAILED_ATEMPTS',
  'helpers/xhr/MFA_REQUIRED_policy_always',
  'helpers/xhr/labels_login_ja',
  'helpers/xhr/labels_country_ja'
],
function (Okta,
          Q,
          Duo,
          OktaAuth,
          LoginUtil,
          Util,
          MfaVerifyForm,
          Beacon,
          Expect,
          Router,
          BrowserFeatures,
          RouterUtil,
          $sandbox,
          webauthn,
          resAllFactors,
          resAllFactorsOnPrem,
          resVerifyTOTPOnly,
          resRequiredWebauthn,
          resPassword,
          resU2F,
          resChallengeDuo,
          resChallengeSms,
          resChallengeCall,
          resChallengeEmail,
          resChallengeWebauthn,
          resChallengeU2F,
          resChallengeCustomFactor,
          resChallengePush,
          resRejectedPush,
          resTimeoutPush,
          resSuccess,
          resInvalid,
          resInvalidPassword,
          resInvalidTotp,
          resRSAChangePin,
          resResendError,
          resNoPermissionError,
          resMfaLocked,
          resMfaAlwaysPolicy,
          labelsLoginJa,
          labelsCountryJa) {

  var { _, $ } = Okta;
  var SharedUtil = Okta.internal.util.Util;
  var itp = Expect.itp;
  var tick = Expect.tick;
  var factors = {
    'OKTA_VERIFY': 0,
    'OKTA_VERIFY_PUSH': 0,
    'U2F': 1,
    'WINDOWS_HELLO': 2,
    'YUBIKEY': 3,
    'GOOGLE_AUTH': 4,
    'SMS': 5,
    'CALL': 6,
    'EMAIL': 7,
    'QUESTION': 8,
    'DUO': 9,
    'SYMANTEC_VIP': 10,
    'RSA_SECURID': 11,
    'ON_PREM': 12,
    'GENERIC_SAML': 14
  };

  function clickFactorInDropdown(test, factorName) {
    //assumes dropdown has all factors
    test.beacon.getOptionsLinks().eq(factors[factorName]).click();
  }

  Expect.describe('MFA Verify', function () {

    function createRouter(baseUrl, authClient, successSpy, settings) {
      var router = new Router(_.extend({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy
      }, settings));
      Util.registerRouter(router);
      Util.mockRouterNavigate(router);
      return router;
    }

    function setup(res, selectedFactorProps, settings, languagesResponse) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
      var successSpy = jasmine.createSpy('success');
      var router = createRouter(baseUrl, authClient, successSpy, settings);
      setNextResponse(res);
      if (languagesResponse) {
        setNextResponse(languagesResponse);
      }
      router.refreshAuthState('dummy-token');
      return Expect.waitForMfaVerify()
      .then(function () {
        if (selectedFactorProps) {
          var factors = router.appState.get('factors'),
              selectedFactor = factors.findWhere(selectedFactorProps),
              provider = selectedFactor.get('provider'),
              factorType = selectedFactor.get('factorType');
          if (provider === 'DUO' && factorType === 'web') {
            setNextResponse(resChallengeDuo);
            router.verifyDuo();
            return Expect.waitForVerifyDuo();
          }
          else if (provider === 'FIDO' && factorType === 'webauthn') {
            setNextResponse(resChallengeWebauthn);
            router.verifyWindowsHello();
            return Expect.waitForVerifyWindowsHello();
          }
          else if (provider === 'GENERIC_SAML' && factorType === 'assertion:saml2') {
            setNextResponse(resChallengeCustomFactor);
            router.verifyCustomFactor();
            return Expect.waitForVerifyCustomFactor();
          }
          else {
            router.verify(selectedFactor.get('provider'), selectedFactor.get('factorType'));
            return Expect.waitForMfaVerify();
          }
        }
      })
      .then(function () {
        var $forms = $sandbox.find('.o-form');
        var forms = _.map($forms, function (form) {
          return new MfaVerifyForm($(form));
        });
        if (forms.length === 1) {
          forms = forms[0];
        }
        var beacon = new Beacon($sandbox);
        return {
          router: router,
          form: forms,
          beacon: beacon,
          ac: authClient,
          setNextResponse: setNextResponse,
          successSpy: successSpy
        };
      });
    }

    function setupWebauthnOnly() {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
      var successSpy = jasmine.createSpy('success');
      var router = createRouter(baseUrl, authClient, successSpy);
      setNextResponse([resRequiredWebauthn, resChallengeWebauthn, resSuccess]);
      router.refreshAuthState('dummy-token');
      return Expect.waitForVerifyWindowsHello()
      .then(function() {
        return Expect.waitForSpyCall(successSpy);
      })
      .then(function () {
        return {
          router: router
        };
      });
    }

    function setupWithMfaPolicy(options) {
      var res = JSON.parse(JSON.stringify(resMfaAlwaysPolicy));

      if (options) {
        if (options.hasOwnProperty('minutes')) {
          res.response._embedded.policy.allowRememberDevice = true;
          res.response._embedded.policy.rememberDeviceLifetimeInMinutes = options.minutes;
        }

        if (options.hasOwnProperty('byDefault')) {
          res.response._embedded.policy.rememberDeviceByDefault = options.byDefault;
        }
      }

      return setup(res);
    }

    var setupSecurityQuestion = _.partial(setup, resAllFactors, { factorType: 'question' });
    var setupGoogleTOTP = _.partial(setup, resAllFactors, { factorType: 'token:software:totp', provider: 'GOOGLE' });
    var setupGoogleTOTPAutoPushTrue = _.partial(setup, Util.getAutoPushResponse(resAllFactors, true),
                                        { factorType: 'token:software:totp', provider: 'GOOGLE' });
    var setupRsaTOTP = _.partial(setup, resAllFactors, { factorType: 'token', provider: 'RSA' });
    var setupOnPremTOTP = _.partial(setup, resAllFactorsOnPrem, { factorType: 'token', provider: 'DEL_OATH' });
    var setupSymantecTOTP = _.partial(setup, resAllFactors, { factorType: 'token', provider: 'SYMANTEC' });
    var setupYubikey = _.partial(setup, resAllFactors, { factorType: 'token:hardware', provider: 'YUBICO' });
    var setupSMS = _.partial(setup, resAllFactors, { factorType: 'sms' });
    var setupCall = _.partial(setup, resAllFactors, { factorType: 'call' });
    var setupEmail = _.partial(setup, resAllFactors, { factorType: 'email' });
    var setupOktaPush = _.partial(setup, resAllFactors, { factorType: 'push', provider: 'OKTA' });
    var setupOktaTOTP = _.partial(setup, resVerifyTOTPOnly, { factorType: 'token:software:totp' });
    var setupWebauthn = _.partial(setup, resAllFactors, {  factorType: 'webauthn', provider: 'FIDO' });
    var setupPassword = _.partial(setup, resPassword, { factorType: 'password' });
    var setupCustomFactor = _.partial(setup, resAllFactors,
                              { factorType: 'assertion:saml2', provider: 'GENERIC_SAML' });
    var setupAllFactorsWithRouter = _.partial(setup, resAllFactors, null, { 'features.router': true });
    function setupSecurityQuestionLocalized(options) {
      spyOn(BrowserFeatures, 'localStorageIsNotSupported').and.returnValue(options.localStorageIsNotSupported);
      spyOn(BrowserFeatures, 'getUserLanguages').and.returnValue(['ja', 'en']);
      return setup(resAllFactors, { factorType: 'question' }, {}, [
        _.extend({ delay: 0 }, labelsLoginJa),
        _.extend({ delay: 0 }, labelsCountryJa)
      ]);
    }

    function setupU2F(options) {
      options || (options = {});

      if (options.u2f) {
        window.u2f = {
          sign: function () {
          }
        };
        spyOn(window.u2f, 'sign');
        if (options && options.signStub) {
          window.u2f.sign.and.callFake(options.signStub);
        }
      }
      else {
        delete window.u2f;
      }

      return setup(options.oneFactor ? resU2F : resAllFactors)
      .then(function (test) {
        var responses = [resChallengeU2F];
        if (options && options.res) {
          responses.push(options.res);
        }
        test.setNextResponse(responses);
        test.router.verifyU2F();
        return Expect.waitForVerifyU2F(test);
      })
      .then(function (test) {
        return _.extend(test, {
          form: new MfaVerifyForm($sandbox.find('.o-form'))
        });
      });
    }

    function emulateNotWindows() {
      spyOn(webauthn, 'isAvailable').and.returnValue(false);
      spyOn(webauthn, 'makeCredential');
      spyOn(webauthn, 'getAssertion');
      return Q();
    }

    function emulateWindows(errorType) {
      spyOn(webauthn, 'isAvailable').and.returnValue(true);

      spyOn(webauthn, 'getAssertion').and.callFake(function () {
        var deferred = Q.defer();

        switch (errorType) {
        case 'AbortError':
          deferred.reject({
            message: 'AbortError'
          });
          break;

        case 'NotSupportedError':
          deferred.reject({
            message: 'NotSupportedError'
          });
          break;

        case 'NotFoundError':
          deferred.reject({
            message: 'NotFoundError'
          });
          break;

        default:
          deferred.resolve({
            authenticatorData: 'authenticatorData1234',
            clientData: 'clientData1234',
            signature: 'signature1234'
          });
        }

        return tick(deferred.promise);
      });

      return Q();
    }

    // Mocks the right calls for Auth SDK's transactions handled in the widget
    function mockTransactions(controller, isTotp) {
      // Spy on backup factor model for TOTP, since TOTP is special
      var model = isTotp ? controller.model.get('backupFactor') : controller.model;
      spyOn(model, 'trigger').and.callThrough();
      spyOn(model, 'setTransaction').and.callThrough();
      spyOn(controller.options.appState, 'set').and.callThrough();
      spyOn(RouterUtil, 'routeAfterAuthStatusChange').and.callThrough();
    }

    // Expect -
    // 1. setTransaction on model is called with transaction
    // 2. controller sets the transaction property on the appState
    // 3. routerAfterAuthStatusChange is called with the right parameters (success response)
    function expectSetTransaction(router, res, isTotp) {
      var mockTransaction = jasmine.objectContaining({data: res.response, status: res.response.status});
      // Spy on backup factor model for TOTP, since TOTP is special
      var model = router.controller.model;
      if (isTotp) {
        model = model.get('backupFactor');
      }
      // Make sure that the transaction event is called on the model
      expect(model.setTransaction).toHaveBeenCalledWith(mockTransaction);
      // Make sure that the controller catches the model's event and sets the transaction property on appState
      expect(router.controller.options.appState.set).toHaveBeenCalledWith('transaction', mockTransaction);
      expect(RouterUtil.routeAfterAuthStatusChange).toHaveBeenCalledWith(router, null, res.response);
    }

    // Expect -
    // 1. model triggers the setTransactionError event
    // 2. controller sets the transactionError property on the appState
    // 3. routerAfterAuthStatusChange is called with the right parameters (error response)
    function expectSetTransactionError(router, res, isTotp) {
      var mockError = jasmine.objectContaining(res.response);
      // Spy on backup factor model for TOTP, since TOTP is special
      var model = router.controller.model;
      if (isTotp) {
        model = model.get('backupFactor');
      }
      // Make sure that the transaction event is called on the model
      expect(model.trigger).toHaveBeenCalledWith('setTransactionError', mockError);
      // Make sure that the controller catches the model's event and sets the transactionError property on appState
      expect(router.controller.options.appState.set).toHaveBeenCalledWith('transactionError', mockError);
      expect(RouterUtil.routeAfterAuthStatusChange).toHaveBeenCalledWith(router, mockError);
    }

    function setupDuo(settings) {
      Util.mockDuo();
      return setup(resAllFactors, { factorType: 'web', provider: 'DUO' }, settings);
    }

    function setupWithFirstFactor(factorIdentifier) {
      var res = JSON.parse(JSON.stringify(resAllFactors));
      var factors = res.response._embedded.factors;
      var index = _.findIndex(factors, factorIdentifier);
      var factor = factors.splice(index, 1);
      factors.unshift(factor[0]);
      return setup(res);
    }

    function setupPolling(test, finalResponse) {
      // This is to reduce delay before initiating polling in the tests.
      spyOn(LoginUtil, 'callAfterTimeout').and.callFake(function() {
        return setTimeout(arguments[0]);
      });
      $.ajax.calls.reset();

      // Mock calls to startVerifyFactorPoll to include a faster poll
      Util.speedUpPolling(test.ac);

      // 1: Set for first verifyFactor
      // 2: Set for startVerifyFactorPoll
      // 3: Set for verifyFactor poll finish
      test.setNextResponse([resChallengePush, resChallengePush, finalResponse]);

      // Okta Push contains 2 forms, push and verify.
      // For polling we are only interested in the push form.
      test.form = test.form[0];
      test.form.submit();

      return tick(test)    // First tick - submit verifyFactor
          .then(function () { return tick(test); }); // Second tick - start verifyFactor poll
      // The next tick will trigger the final response
    }

    function expectHasRightBeaconImage(test, desiredClassName) {
      expect(test.beacon.isFactorBeacon()).toBe(true);
      expect(test.beacon.hasClass(desiredClassName)).toBe(true);
    }

    function expectTitleToBe(test, desiredTitle) {
      expect(test.form.titleText()).toBe(desiredTitle);
    }

    function expectSubtitleToBe(test, desiredSubtitle) {
      expect(test.form.subtitleText()).toBe(desiredSubtitle);
    }

    function expectLabelToBe(test, desiredLabel, fieldName) {
      expect(test.form.labelText(fieldName)).toBe(desiredLabel);
    }

    function expectHasAnswerField(test, fieldType) {
      fieldType || (fieldType = 'text');
      var answer = test.form.answerField();
      expect(answer.length).toBe(1);
      expect(answer.attr('type')).toEqual(fieldType);
    }

    function expectHasPasswordField(test, fieldType) {
      fieldType || (fieldType = 'text');
      var password = test.form.passwordField();
      expect(password.length).toBe(1);
      expect(password.attr('type')).toEqual(fieldType);
    }

    function expectHasRightPlaceholderText(test, placeholderText){
      var answer = test.form.answerField();
      expect(answer.attr('placeholder')).toEqual(placeholderText);
    }

    Expect.describe('General', function () {
      Expect.describe('Defaults to the last used factor', function () {
        itp('Security Question', function () {
          return setup(resAllFactors).then(function (test) {
            expect(test.form.isSecurityQuestion()).toBe(true);
          });
        });
        itp('Google TOTP', function () {
          return setupWithFirstFactor({provider: 'GOOGLE', factorType: 'token:software:totp'})
          .then(function (test) {
            expect(test.form.isTOTP()).toBe(true);
          });
        });
        // TOTP and push have the same form. If either of them is the last used, we show the push form.
        itp('Okta TOTP/Push', function () {
          return setupWithFirstFactor({provider: 'OKTA', factorType: 'token:software:totp'})
          .then(function (test) {
            expect(test.form[0].isPush()).toBe(true);
          });
        });
        itp('Okta Push', function () {
          return setupWithFirstFactor({factorType: 'push'}).then(function (test) {
            expect(test.form[0].isPush()).toBe(true);
          });
        });
        itp('Okta SMS', function () {
          return setupWithFirstFactor({factorType: 'sms'}).then(function (test) {
            expect(test.form.isSMS()).toBe(true);
          });
        });
        itp('Okta Email', function () {
          return setupWithFirstFactor({factorType: 'email'}).then(function (test) {
            expect(test.form.isEmail()).toBe(true);
          });
        });
      });
      Expect.describe('Sign out link', function () {
        itp('is visible', function () {
          return setupWithFirstFactor({factorType: 'question'}).then(function (test) {
            Expect.isVisible(test.form.signoutLink($sandbox));
          });
        });
        itp('is not present if features.hideSignOutLinkInMFA is true', function () {
          return setupSecurityQuestion({'features.hideSignOutLinkInMFA': true}).then(function (test) {
            expect(test.form.signoutLink($sandbox).length).toBe(0);
          });
        });

        itp('has a signout link which cancels the current stateToken and navigates to primaryAuth', function () {
          return setupSecurityQuestion()
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.signoutLink($sandbox).click();
            return Expect.waitForPrimaryAuth(test);
          })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/cancel',
              data: {
                stateToken: 'testStateToken'
              }
            });
            Expect.isPrimaryAuth(test.router.controller);
          });
        });

        itp('has a signout link which cancels the current stateToken and redirects to the provided signout url',
        function () {
          return setupSecurityQuestion({ signOutLink: 'http://www.goodbye.com' })
          .then(function (test) {
            spyOn(SharedUtil, 'redirect');
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.signoutLink($sandbox).click();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/cancel',
              data: {
                stateToken: 'testStateToken'
              }
            });
            expect(SharedUtil.redirect).toHaveBeenCalledWith('http://www.goodbye.com');
          });
        });

      });
      Expect.describe('Remember device', function () {
        itp('is rendered', function () {
          return setup(resAllFactors).then(function (test) {
            Expect.isVisible(test.form.rememberDeviceCheckbox());
          });
        });
        itp('has the right text for device based policy', function () {
          return setupWithMfaPolicy({ minutes: 0 }).then(function (test) {
            expect(test.form.rememberDeviceLabelText()).toEqual('Do not challenge me on this device again');
          });
        });
        itp('has the right text for time based policy (1 minute)', function () {
          return setupWithMfaPolicy({ minutes: 1 }).then(function (test) {
            expect(test.form.rememberDeviceLabelText()).toEqual(
              'Do not challenge me on this device for the next minute');
          });
        });
        itp('has the right text for time based policy (minutes)', function () {
          return setupWithMfaPolicy({ minutes: 15 }).then(function (test) {
            expect(test.form.rememberDeviceLabelText()).toEqual(
              'Do not challenge me on this device for the next 15 minutes');
          });
        });
        itp('has the right text for time based policy (hours)', function () {
          return setupWithMfaPolicy({ minutes: 120 }).then(function (test) {
            expect(test.form.rememberDeviceLabelText()).toEqual(
              'Do not challenge me on this device for the next 2 hours');
          });
        });
        itp('has the right text for time based policy (days)', function () {
          return setupWithMfaPolicy({ minutes: 2880 }).then(function (test) {
            expect(test.form.rememberDeviceLabelText()).toEqual(
              'Do not challenge me on this device for the next 2 days');
          });
        });
        itp('is not rendered when policy is always ask for mfa', function () {
          return setup(resMfaAlwaysPolicy).then(function (test) {
            expect(test.form.rememberDeviceCheckbox().length).toEqual(0);
          });
        });
        itp('is checked by default if policy rememberDeviceByDefault is true', function () {
          return setupWithMfaPolicy({ minutes: 15, byDefault: true }).then(function (test) {
            expect(test.form.isRememberDeviceChecked()).toBe(true);
          });
        });
        itp('is not checked by default if policy rememberDeviceByDefault is false', function () {
          return setupWithMfaPolicy({ minutes: 0 }).then(function (test) {
            expect(test.form.isRememberDeviceChecked()).toBe(false);
          });
        });
      });
    });

    Expect.describe('Factor types', function () {

      Expect.describe('Security Question', function () {
        itp('is security question', function () {
          return setupSecurityQuestion().then(function (test) {
            expect(test.form.isSecurityQuestion()).toBe(true);
          });
        });
        itp('shows the right beacon', function () {
          return setupSecurityQuestion().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-okta-security-question');
          });
        });
        itp('shows the right title', function () {
          return setupSecurityQuestion().then(function (test) {
            expectTitleToBe(test, 'Security Question');
          });
        });
        itp('sets the label to the user\'s security question', function () {
          return setupSecurityQuestion().then(function (test) {
            expectLabelToBe(test, 'What is the food you least liked as a child?', 'answer');
          });
        });
        itp('sets the label to the user\'s security question (localized)', function () {
          return setupSecurityQuestionLocalized({localStorageIsNotSupported : false}).then(function (test) {
            expectLabelToBe(test, 'JA: What is the food you least liked as a child?', 'answer');
          });
        });
        itp('sets the label to the user\'s security question (localized + no local storage)', function () {
          return setupSecurityQuestionLocalized({localStorageIsNotSupported : true}).then(function (test) {
            expectLabelToBe(test, 'JA: What is the food you least liked as a child?', 'answer');
          });
        });
        itp('has an answer field', function () {
          return setupSecurityQuestion().then(function (test) {
            expectHasAnswerField(test, 'password');
          });
        });
        itp('has remember device checkbox', function () {
          return setupSecurityQuestion().then(function (test) {
            Expect.isVisible(test.form.rememberDeviceCheckbox());
          });
        });
        itp('no auto push checkbox', function () {
          return setupSecurityQuestion({'features.autoPush': true}).then(function (test) {
            expect(test.form.autoPushCheckbox().length).toBe(0);
          });
        });
        itp('an answer field type is "password" initially and can be switched between "text" and "password" \
          by clicking on "show"/"hide" buttons', function () {
          return setupSecurityQuestion().then(function (test) {
            var answer = test.form.answerField();
            expect(answer.attr('type')).toEqual('password');

            test.form.showAnswerButton().click();
            expect(test.form.answerField().attr('type')).toEqual('text');
            expect(test.form.passwordToggleShowContainer().is(':visible')).toBe(false);
            expect(test.form.passwordToggleHideContainer().is(':visible')).toBe(true);

            test.form.hideAnswerButton().click();
            expect(test.form.answerField().attr('type')).toEqual('password');
            expect(test.form.passwordToggleShowContainer().is(':visible')).toBe(true);
            expect(test.form.passwordToggleHideContainer().is(':visible')).toBe(false);
          });
        });
        itp('calls authClient verifyFactor with correct args when submitted', function () {
          return setupSecurityQuestion().then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('food');
            test.form.setRememberDevice(true);
            test.setNextResponse(resSuccess);
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/ufshpdkgNun3xNE3W0g3/verify?rememberDevice=true',
              data: {
                answer: 'food',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('disables the "verify button" when clicked', function () {
          return setupSecurityQuestion().then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('who cares');
            test.setNextResponse(resInvalid);
            test.form.submit();
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).toContain('link-button-disabled');
            expect(button.prop('disabled')).toBe(true);
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).not.toContain('link-button-disabled');
            expect(button.prop('disabled')).toBe(false);
          });
        });
        itp('shows an error if error response from authClient', function () {
          return setupSecurityQuestion()
          .then(function (test) {
            test.setNextResponse(resInvalid);
            test.form.setAnswer('wrong');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Your answer doesn\'t match our records. Please try again.');
          });
        });
        itp('shows errors if verify button is clicked and answer is empty', function () {
          return setupSecurityQuestion()
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect($.ajax).not.toHaveBeenCalled();
            expect(test.form.passCodeErrorField().length).toBe(1);
            expect(test.form.passCodeErrorField().text()).toBe('The field cannot be left blank');
            expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
          });
        });
        itp('sets the transaction on the appState on success response', function () {
          return setupSecurityQuestion()
          .then(function (test) {
            mockTransactions(test.router.controller);
            $.ajax.calls.reset();
            test.form.setAnswer('food');
            test.setNextResponse(resSuccess);
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function (test) {
            expectSetTransaction(test.router, resSuccess);
          });
        });
        itp('sets the transaction error on the appState on error response', function () {
          return setupSecurityQuestion()
          .then(function (test) {
            mockTransactions(test.router.controller);
            $.ajax.calls.reset();
            test.form.setAnswer('food');
            test.setNextResponse(resInvalid);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expectSetTransactionError(test.router, resInvalid);
          });
        });
      });

      Expect.describe('TOTP', function () {
        itp('is totp', function () {
          return setupGoogleTOTP().then(function (test) {
            expect(test.form.isTOTP()).toBe(true);
          });
        });
        itp('shows the right beacon for google TOTP', function () {
          return setupGoogleTOTP().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-google-auth');
          });

        });
        itp('does not autocomplete', function () {
          return setupGoogleTOTP().then(function (test) {
            expect(test.form.getAutocomplete()).toBe('off');
          });
        });
        itp('shows the right beacon for RSA TOTP', function () {
          return setupRsaTOTP().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-rsa');
          });
        });
        itp('shows the right beacon for On Prem TOTP', function () {
          return setupOnPremTOTP().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-onprem');
          });
        });
        itp('shows the right beacon for Okta TOTP', function () {
          return setupOktaTOTP().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-okta-verify');
          });
        });
        itp('no auto push checkbox for Okta TOTP', function () {
          return setupOktaTOTP({'features.autoPush': true}).then(function (test) {
            expect(test.form.autoPushCheckbox().length).toBe(0);
          });
        });
        itp('shows the right beacon for Symantec TOTP', function () {
          return setupSymantecTOTP().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-symantec');
          });
        });
        itp('references factorName in title', function () {
          return setupGoogleTOTP().then(function (test) {
            expectTitleToBe(test, 'Google Authenticator');
          });
        });
        itp('shows the right subtitle with factorName', function () {
          return setupGoogleTOTP().then(function (test) {
            expectSubtitleToBe(test, 'Enter your Google Authenticator passcode');
          });
        });
        itp('has a passCode field', function () {
          return setupGoogleTOTP().then(function (test) {
            expectHasAnswerField(test, 'tel');
          });
        });
        itp('has a masked passCode field for RSA', function () {
          return setupRsaTOTP().then(function (test) {
            expectHasAnswerField(test, 'password');
          });
        });
        itp('has a masked passCode field for On-Prem', function () {
          return setupOnPremTOTP().then(function (test) {
            expectHasAnswerField(test, 'password');
          });
        });
        itp('has remember device checkbox', function () {
          return setupGoogleTOTP().then(function (test) {
            Expect.isVisible(test.form.rememberDeviceCheckbox());
          });
        });
        itp('calls authClient verifyFactor with correct args when submitted', function () {
          return setupGoogleTOTP().then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('123456');
            test.setNextResponse(resSuccess);
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/ufthp18Zup4EGLtrd0g3/verify?rememberDevice=false',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('calls authClient verifyFactor with rememberDevice URL param', function () {
          return setupGoogleTOTP().then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('123456');
            test.form.setRememberDevice(true);
            test.setNextResponse(resSuccess);
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/ufthp18Zup4EGLtrd0g3/verify?rememberDevice=true',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('disables the "verify button" when clicked', function () {
          return setupGoogleTOTP().then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('who cares');
            test.setNextResponse(resInvalid);
            test.form.submit();
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).toContain('link-button-disabled');
            expect(button.prop('disabled')).toBe(true);
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect($.ajax.calls.count()).toBe(1);
            expect(buttonClass).not.toContain('link-button-disabled');
            expect(button.prop('disabled')).toBe(false);
          });
        });
        itp('shows an error if error response from authClient', function () {
          return setupGoogleTOTP()
          .then(function (test) {
            test.setNextResponse(resInvalidTotp);
            test.form.setAnswer('wrong');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Invalid Passcode/Answer');
          });
        });
        itp('shows errors if verify button is clicked and answer is empty', function () {
          return setupGoogleTOTP()
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect($.ajax).not.toHaveBeenCalled();
            expect(test.form.passCodeErrorField().length).toBe(1);
            expect(test.form.passCodeErrorField().text()).toBe('The field cannot be left blank');
            expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
          });
        });
        itp('sets the transaction on the appState on success response', function () {
          return setupGoogleTOTP().then(function (test) {
            mockTransactions(test.router.controller);
            test.form.setAnswer('123456');
            test.setNextResponse(resSuccess);
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function (test) {
            expectSetTransaction(test.router, resSuccess);
          });
        });
        itp('sets the transaction error on the appState on error response', function () {
          return setupGoogleTOTP().then(function (test) {
            mockTransactions(test.router.controller);
            test.setNextResponse(resInvalidTotp);
            test.form.setAnswer('wrong');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expectSetTransactionError(test.router, resInvalidTotp);
          });
        });
        itp('clears input field value if error is for PIN change (RSA)', function () {
          return setupRsaTOTP()
          .then(function (test) {
            test.setNextResponse(resRSAChangePin);
            test.form.setAnswer('correct');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Enter a new PIN having from 4 to 8 digits:');
            expect(test.form.answerField().val()).toEqual('');
          });
        });
        itp('clears input field value if error is for PIN change (On-Prem)', function () {
          return setupOnPremTOTP()
          .then(function (test) {
            test.setNextResponse(resRSAChangePin);
            test.form.setAnswer('correct');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Enter a new PIN having from 4 to 8 digits:');
            expect(test.form.answerField().val()).toEqual('');
          });
        });
      });

      Expect.describe('Yubikey', function () {
        itp('shows the right beacon for Yubikey', function () {
          return setupYubikey().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-yubikey');
          });
        });
        itp('has an answer field', function () {
          return setupYubikey().then(function (test) {
            expectHasAnswerField(test, 'password');
          });
        });
        itp('has right placeholder text in answer field', function () {
          return setupYubikey().then(function (test) {
            expectHasRightPlaceholderText(test, 'Click here, then tap your Yubikey');
          });
        });
        itp('does not autocomplete', function () {
          return setupYubikey().then(function (test) {
            expect(test.form.getAutocomplete()).toBe('off');
          });
        });
        itp('shows the right title', function () {
          return setupYubikey().then(function (test) {
            expectTitleToBe(test, 'Yubikey');
          });
        });
        itp('has remember device checkbox', function () {
          return setupYubikey().then(function (test) {
            Expect.isVisible(test.form.rememberDeviceCheckbox());
          });
        });
        itp('disables the "verify button" when clicked', function () {
          return setupYubikey().then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('who cares');
            test.setNextResponse(resInvalid);
            test.form.submit();
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).toContain('link-button-disabled');
            expect(button.prop('disabled')).toBe(true);
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).not.toContain('link-button-disabled');
            expect(button.prop('disabled')).toBe(false);
          });
        });
        itp('calls authClient verifyFactor with correct args when submitted', function () {
          return setupYubikey().then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('123456');
            test.setNextResponse(resSuccess);
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/ykf2l0aUIe5VBplDj0g4/verify?rememberDevice=false',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('calls authClient verifyFactor with rememberDevice URL param', function () {
          return setupYubikey().then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('123456');
            test.form.setRememberDevice(true);
            test.setNextResponse(resSuccess);
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/ykf2l0aUIe5VBplDj0g4/verify?rememberDevice=true',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('sets the transaction on the appState on success response', function () {
          return setupYubikey().then(function (test) {
            mockTransactions(test.router.controller);
            test.form.setAnswer('123456');
            test.setNextResponse(resSuccess);
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function (test) {
            expectSetTransaction(test.router, resSuccess);
          });
        });
        itp('sets the transaction error on the appState on error response', function () {
          return setupYubikey().then(function (test) {
            mockTransactions(test.router.controller);
            test.setNextResponse(resInvalid);
            test.form.setAnswer('wrong');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expectSetTransactionError(test.router, resInvalid);
          });
        });
      });

      Expect.describe('SMS', function () {
        beforeEach(function () {
          var  throttle = _.throttle;
          spyOn(_, 'throttle').and.callFake(function (fn) {
            return throttle(fn, 0);
          });
        });

        itp('is sms', function () {
          return setupSMS().then(function (test) {
            expect(test.form.isSMS()).toBe(true);
          });
        });
        itp('shows the right beacon', function () {
          return setupSMS().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-okta-sms');
          });
        });
        itp('does not autocomplete', function () {
          return setupSMS().then(function (test) {
            expect(test.form.getAutocomplete()).toBe('off');
          });
        });
        itp('shows the phone number in the title', function () {
          return setupSMS().then(function (test) {
            expectTitleToBe(test, 'SMS Authentication');
            expectSubtitleToBe(test, '(+1 XXX-XXX-6688)');
          });
        });
        itp('has a button to send the code', function () {
          return setupSMS().then(function (test) {
            var button = test.form.smsSendCode();
            expect(button.length).toBe(1);
            expect(button.is('a')).toBe(true);
          });
        });
        itp('has a passCode field', function () {
          return setupSMS().then(function (test) {
            expectHasAnswerField(test, 'tel');
          });
        });
        itp('has remember device checkbox', function () {
          return setupSMS().then(function (test) {
            Expect.isVisible(test.form.rememberDeviceCheckbox());
          });
        });
        itp('clears the passcode text field on clicking the "Send code" button', function () {
          return setupSMS()
          .then(function (test) {
            test.setNextResponse(resChallengeSms);

            expect(test.form.smsSendCode().trimmedText()).toEqual('Send code');
            test.form.setAnswer('123456');
            expect(test.form.answerField().val()).toEqual('123456');
            test.form.smsSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.smsSendCode().trimmedText()).toEqual('Sent');
            expect(test.form.answerField().val()).toEqual('');

            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).not.toContain('link-button-disabled');
            expect(button.prop('disabled')).toBe(false);
            return test;
          });
        });
        itp('calls verifyFactor with empty code if send code button is clicked', function () {
          return setupSMS().then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeSms);
            test.form.smsSendCode().click();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/smshp9NXcoXu8z2wN0g3/verify?rememberDevice=false',
              data: {
                passCode: '',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        // See OKTA-179504
        xit('posts resend if send code button is clicked second time', function () {
          Util.speedUpPolling();
          return setupSMS().then(function (test) {
            test.setNextResponse(resChallengeSms);
            expect(test.form.smsSendCode().text()).toBe('Send code');
            test.form.smsSendCode().click();
            return Expect.wait(function () {
              return test.form.smsSendCode().text() === 'Re-send code';
            }, test);
          })
          .then(function (test) {
            expect(test.form.submitButton().prop('disabled')).toBe(false);
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeSms);
            test.form.smsSendCode().click();
            return Expect.wait(function () {
              return test.form.smsSendCode().text() === 'Sent';
            }, test);
          })
          .then(function (test) {
            return Expect.wait(function () {
              return test.form.smsSendCode().text() === 'Re-send code';
            }, test);
          })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(1);
            expect(test.form.submitButton().prop('disabled')).toBe(false);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/smshp9NXcoXu8z2wN0g3/verify/resend',
              data: {
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('calls verifyFactor with rememberDevice URL param', function () {
          return setupSMS().then(function (test) {
            $.ajax.calls.reset();
            test.form.setRememberDevice(true);
            test.setNextResponse(resChallengeSms);
            test.form.smsSendCode().click();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/smshp9NXcoXu8z2wN0g3/verify?rememberDevice=true',
              data: {
                passCode: '',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('calls verifyFactor with empty code if verify button is clicked', function () {
          return setupSMS().then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeSms);
            test.form.smsSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.setAnswer('');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expect($.ajax).not.toHaveBeenCalled();
            expect(test.form.passCodeErrorField().length).toBe(1);
            expect(test.form.passCodeErrorField().text()).toBe('The field cannot be left blank');
            expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
          });
        });
        itp('calls verifyFactor with given code if verify button is clicked', function () {
          return setupSMS().then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeSms);
            test.form.smsSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.setAnswer('123456');
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/smshp9NXcoXu8z2wN0g3/verify?rememberDevice=false',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('shows errors if verify button is clicked and answer is empty', function () {
          return setupSMS()
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect($.ajax).not.toHaveBeenCalled();
            expect(test.form.passCodeErrorField().length).toBe(1);
            expect(test.form.passCodeErrorField().text()).toBe('The field cannot be left blank');
            expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
          });
        });
        itp('calls authClient verifyFactor with rememberDevice URL param', function () {
          return setupSMS().then(function (test) {
            $.ajax.calls.reset();
            test.form.setRememberDevice(true);
            test.setNextResponse(resChallengeSms);
            test.form.smsSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.setAnswer('123456');
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/smshp9NXcoXu8z2wN0g3/verify?rememberDevice=true',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('temporarily disables the send code button before displaying re-send \
              to avoid exceeding the rate limit', function () {
          var deferred = Util.mockRateLimiting();

          return setupSMS().then(function (test) {
            test.button = test.form.smsSendCode();
            expect(test.button.trimmedText()).toEqual('Send code');
            test.setNextResponse(resChallengeSms);
            test.form.smsSendCode().click();
            return tick(test);
          }).then(function (test) {
            expect(test.button.trimmedText()).toEqual('Sent');
            deferred.resolve();
            return test;
          }).then(function (test) {
            return tick().then(function () {
              expect(test.button.length).toBe(1);
              expect(test.button.trimmedText()).toEqual('Re-send code');
            });
          });
        });
        itp('displays only one error block if got an error resp on "Send code"', function () {
          var deferred = Util.mockRateLimiting();
          return setupSMS().then(function (test) {
            test.setNextResponse(resResendError);
            test.form.smsSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorBox().length).toBe(1);
            deferred.resolve();
            test.setNextResponse(resResendError);
            test.form.smsSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorBox().length).toBe(1);
          });
        });
        itp('shows proper account locked error after too many failed MFA attempts.', function () {
          return setupSMS().then(function (test) {
            test.setNextResponse(resMfaLocked);
            test.form.setAnswer('12345');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorBox().length).toBe(1);
            expect(test.form.errorMessage()).toBe('Your account was locked due to excessive MFA attempts.');
          });
        });
        itp('hides error messages after clicking on send sms', function () {
          return setupSMS().then(function (test) {
            test.form.setAnswer('');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorBox().length).toBe(1);
            test.setNextResponse(resChallengeSms);
            test.form.smsSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(false);
            expect(test.form.errorBox().length).toBe(0);
          });
        });
      });

      Expect.describe('Call', function () {
        beforeEach(function () {
          var  throttle = _.throttle;
          spyOn(_, 'throttle').and.callFake(function (fn) {
            return throttle(fn, 0);
          });
        });

        itp('is call', function () {
          return setupCall().then(function (test) {
            expect(test.form.isCall()).toBe(true);
          });
        });
        itp('shows the right beacon', function () {
          return setupCall().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-okta-call');
          });
        });
        itp('does not autocomplete', function () {
          return setupCall().then(function (test) {
            expect(test.form.getAutocomplete()).toBe('off');
          });
        });
        itp('shows the phone number in the title', function () {
          return setupCall().then(function (test) {
            expectTitleToBe(test, 'Voice Call Authentication');
            expectSubtitleToBe(test, '(+1 XXX-XXX-7799)');
          });
        });
        itp('has a button to make a call', function () {
          return setupCall().then(function (test) {
            var button = test.form.makeCall();
            expect(button.length).toBe(1);
            expect(button.is('a')).toBe(true);
          });
        });
        itp('has a passCode field', function () {
          return setupCall().then(function (test) {
            expectHasAnswerField(test, 'tel');
          });
        });
        itp('clears the passcode text field on clicking the "Call" button', function () {
          return setupCall().then(function (test) {
            test.button = test.form.makeCall();
            test.form.setAnswer('123456');
            test.setNextResponse(resChallengeCall);
            expect(test.button.trimmedText()).toEqual('Call');
            expect(test.form.answerField().val()).toEqual('123456');
            test.form.makeCall().click();
            return tick().then(function () {
              expect(test.button.trimmedText()).toEqual('Calling');
              expect(test.form.answerField().val()).toEqual('');
              var button = test.form.submitButton();
              var buttonClass = button.attr('class');
              expect(buttonClass).not.toContain('link-button-disabled');
              expect(button.prop('disabled')).toBe(false);
              return test;
            });
          });
        });
        itp('calls verifyFactor with empty code if call button is clicked', function () {
          return setupCall().then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeCall);
            test.form.makeCall().click();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/clfk6mRsVLrhHznVe0g3/verify?rememberDevice=false',
              data: {
                passCode: '',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('calls verifyFactor with rememberDevice URL param', function () {
          return setupCall().then(function (test) {
            $.ajax.calls.reset();
            test.form.setRememberDevice(true);
            test.setNextResponse(resChallengeCall);
            test.form.makeCall().click();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/clfk6mRsVLrhHznVe0g3/verify?rememberDevice=true',
              data: {
                passCode: '',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('calls verifyFactor with empty code if verify button is clicked', function () {
          return setupCall().then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeCall);
            test.form.makeCall().click();
            return tick(test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.setAnswer('');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expect($.ajax).not.toHaveBeenCalled();
            expect(test.form.passCodeErrorField().length).toBe(1);
            expect(test.form.passCodeErrorField().text()).toBe('The field cannot be left blank');
            expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
          });
        });
        itp('calls verifyFactor with given code if verify button is clicked', function () {
          return setupCall().then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeCall);
            test.form.makeCall().click();
            return tick(test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.setAnswer('123456');
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/clfk6mRsVLrhHznVe0g3/verify?rememberDevice=false',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('calls authClient verifyFactor with rememberDevice URL param', function () {
          return setupCall().then(function (test) {
            $.ajax.calls.reset();
            test.form.setRememberDevice(true);
            test.setNextResponse(resChallengeCall);
            test.form.makeCall().click();
            return tick(test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.setAnswer('123456');
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/clfk6mRsVLrhHznVe0g3/verify?rememberDevice=true',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('shows errors if verify button is clicked and answer is empty', function () {
          return setupCall()
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect($.ajax).not.toHaveBeenCalled();
            expect(test.form.passCodeErrorField().length).toBe(1);
            expect(test.form.passCodeErrorField().text()).toBe('The field cannot be left blank');
            expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
          });
        });
        itp('temporarily disables the call button before displaying redial \
              to avoid exceeding the rate limit', function () {
          var deferred = Util.mockRateLimiting();

          return setupCall().then(function (test) {
            test.button = test.form.makeCall();
            expect(test.button.trimmedText()).toEqual('Call');
            test.setNextResponse(resChallengeCall);
            test.form.makeCall().click();
            return tick().then(function () {
              expect(test.button.trimmedText()).toEqual('Calling');
              deferred.resolve();
              return test;
            });
          }).then(function (test) {
            return tick().then(function () {
              expect(test.button.length).toBe(1);
              expect(test.button.trimmedText()).toEqual('Redial');
            });
          });
        });
        itp('displays only one error block if got an error resp on "Call"', function () {
          var deferred = Util.mockRateLimiting();
          return setupCall().then(function (test) {
            test.setNextResponse(resResendError);
            test.form.makeCall().click();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorBox().length).toBe(1);
            deferred.resolve();
            test.setNextResponse(resResendError);
            test.form.makeCall().click();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorBox().length).toBe(1);
          });
        });
        itp('shows proper account locked error after too many failed MFA attempts.', function () {
          return setupCall().then(function (test) {
            test.setNextResponse(resMfaLocked);
            test.form.setAnswer('12345');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorBox().length).toBe(1);
            expect(test.form.errorMessage()).toBe('Your account was locked due to excessive MFA attempts.');
          });
        });
        itp('hides error messages after clicking on call', function () {
          return setupCall().then(function (test) {
            test.form.setAnswer('');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorBox().length).toBe(1);
            return tick(test);
          })
          .then(function (test) {
            test.setNextResponse(resChallengeCall);
            test.form.makeCall().click();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(false);
            expect(test.form.errorBox().length).toBe(0);
          });
        });
        itp('posts to resend link if call button is clicked for the second time', function () {
          Util.speedUpPolling();
          return setupCall().then(function (test) {
            test.setNextResponse(resChallengeCall);
            expect(test.form.makeCall().text()).toBe('Call');
            test.form.makeCall().click();
            return Expect.wait(function () {
              return test.form.makeCall().text() === 'Redial';
            }, test);
          })
          .then(function (test) {
            expect(test.form.submitButton().prop('disabled')).toBe(false);
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeCall);
            test.form.makeCall().click();
            return Expect.wait(function () {
              return test.form.makeCall().text() === 'Calling';
            }, test);
          })
          .then(function (test) {
            return Expect.wait(function () {
              return test.form.makeCall().text() === 'Redial';
            }, test);
          })
          .then(function (test) {
            expect(test.form.submitButton().prop('disabled')).toBe(false);
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              data: {stateToken: 'testStateToken'},
              url: 'https://foo.com/api/v1/authn/factors/clfk6mRsVLrhHznVe0g3/verify/resend'
            });
          });
        });
      });

      Expect.describe('Email', function () {
        beforeEach(function () {
          var  throttle = _.throttle;
          spyOn(_, 'throttle').and.callFake(function (fn) {
            return throttle(fn, 0);
          });
        });

        itp('is email', function () {
          return setupEmail().then(function (test) {
            expect(test.form.isEmail()).toBe(true);
          });
        });
        itp('shows the right beacon', function () {
          return setupEmail().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-okta-email');
          });
        });
        itp('does not autocomplete', function () {
          return setupEmail().then(function (test) {
            expect(test.form.getAutocomplete()).toBe('off');
          });
        });
        itp('shows the email in the title', function () {
          return setupEmail().then(function (test) {
            expectTitleToBe(test, 'Email Authentication');
            expectSubtitleToBe(test, '(a...1@clouditude.net)');
          });
        });
        itp('has a button to send the code', function () {
          return setupEmail().then(function (test) {
            var button = test.form.emailSendCode();
            expect(button.length).toBe(1);
            expect(button.is('a')).toBe(true);
          });
        });
        itp('has a passCode field', function () {
          return setupEmail().then(function (test) {
            expectHasAnswerField(test, 'tel');
          });
        });
        itp('has remember device checkbox', function () {
          return setupEmail().then(function (test) {
            Expect.isVisible(test.form.rememberDeviceCheckbox());
          });
        });
        itp('clears the passcode text field on clicking the "Send email" button', function () {
          return setupEmail().then(function (test) {
            test.button = test.form.emailSendCode();
            test.form.setAnswer('123456');
            test.setNextResponse(resChallengeEmail);
            expect(test.button.trimmedText()).toEqual('Send email');
            expect(test.form.answerField().val()).toEqual('123456');
            test.form.emailSendCode().click();
            return tick().then(function () {
              expect(test.button.trimmedText()).toEqual('Sent');
              expect(test.form.answerField().val()).toEqual('');
              var button = test.form.submitButton();
              var buttonClass = button.attr('class');
              expect(buttonClass).not.toContain('link-button-disabled');
              expect(button.prop('disabled')).toBe(false);
              return test;
            });
          });
        });
        itp('calls verifyFactor with empty code if send code button is clicked', function () {
          return setupEmail().then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeEmail);
            test.form.emailSendCode().click();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/emailhp9NXcoXu8z2wN0g3/verify?rememberDevice=false',
              data: {
                passCode: '',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('calls verifyFactor with rememberDevice URL param', function () {
          return setupEmail().then(function (test) {
            $.ajax.calls.reset();
            test.form.setRememberDevice(true);
            test.setNextResponse(resChallengeEmail);
            test.form.emailSendCode().click();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/emailhp9NXcoXu8z2wN0g3/verify?rememberDevice=true',
              data: {
                passCode: '',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('shows errors if verify button is clicked and answer is empty', function () {
          return setupEmail().then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeEmail);
            test.form.emailSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect($.ajax).not.toHaveBeenCalled();
            expect(test.form.passCodeErrorField().length).toBe(1);
            expect(test.form.passCodeErrorField().text()).toBe('The field cannot be left blank');
            expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
          });
        });
        itp('calls verifyFactor with given code if verify button is clicked', function () {
          return setupEmail().then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeEmail);
            test.form.emailSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.setAnswer('123456');
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/emailhp9NXcoXu8z2wN0g3/verify?rememberDevice=false',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('calls authClient verifyFactor with rememberDevice URL param', function () {
          return setupEmail().then(function (test) {
            $.ajax.calls.reset();
            test.form.setRememberDevice(true);
            test.setNextResponse(resChallengeEmail);
            test.form.emailSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.setAnswer('123456');
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/emailhp9NXcoXu8z2wN0g3/verify?rememberDevice=true',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('temporarily disables the send code button before displaying re-send \
             to avoid exceeding the rate limit', function () {
          var deferred = Util.mockRateLimiting();
          return setupEmail().then(function (test) {
            test.button = test.form.emailSendCode();
            expect(test.button.trimmedText()).toEqual('Send email');
            test.setNextResponse(resChallengeEmail);
            test.form.emailSendCode().click();
            return tick().then(function () {
              expect(test.button.trimmedText()).toEqual('Sent');
              expect(test.button.attr('class')).toContain('link-button-disabled');
              deferred.resolve();
              return test;
            });
          }).then(function (test) {
            return tick().then(function () {
              expect(test.button.length).toBe(1);
              expect(test.button.trimmedText()).toEqual('Re-send email');
            });
          });
        });
        itp('displays only one error block if got an error resp on "Send email"', function () {
          var deferred = Util.mockRateLimiting();
          return setupEmail().then(function (test) {
            test.setNextResponse(resResendError);
            test.form.emailSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorBox().length).toBe(1);
            deferred.resolve();
            test.setNextResponse(resResendError);
            test.form.emailSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorBox().length).toBe(1);
          });
        });
        itp('shows proper account locked error after too many failed MFA attempts.', function () {
          return setupEmail().then(function (test) {
            test.setNextResponse(resMfaLocked);
            test.form.setAnswer('12345');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorBox().length).toBe(1);
            expect(test.form.errorMessage()).toBe('Your account was locked due to excessive MFA attempts.');
          });
        });
        itp('hides error messages after clicking on send email', function () {
          return setupEmail().then(function (test) {
            test.form.setAnswer('');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorBox().length).toBe(1);
            test.setNextResponse(resChallengeEmail);
            test.form.emailSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(false);
            expect(test.form.errorBox().length).toBe(0);
          });
        });
        itp('posts to resend link if send email button is clicked for the second time', function () {
          Util.speedUpPolling();
          return setupEmail().then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeEmail);
            test.form.emailSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.submitButton().prop('disabled')).toBe(false);
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeEmail);
            test.form.emailSendCode().click();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.submitButton().prop('disabled')).toBe(false);
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              data: {stateToken: 'testStateToken'},
              url: 'https://foo.com/api/v1/authn/factors/emailhp9NXcoXu8z2wN0g3/verify/resend'
            });
          });
        });
      });

      Expect.describe('Okta Push', function () {
        // Remember device for Push form exists out of the form.
        function getRememberDeviceForPushForm(test) {
          var rememberDevice = test.router.controller.$('[data-se="o-form-input-rememberDevice"]');
          var checkbox = rememberDevice.find(':checkbox');
          return checkbox;
        }
        function setRememberDeviceForPushForm(test, val) {
          var checkbox = getRememberDeviceForPushForm(test);
          checkbox.prop('checked', val);
          checkbox.trigger('change');
        }
        function getAutoPushCheckbox(test) {
          var autoPush = test.router.controller.$('[data-se="o-form-input-autoPush"]');
          var checkbox = autoPush.find(':checkbox');
          return checkbox;
        }
        function setAutoPushCheckbox(test, val) {
          var checkbox = getAutoPushCheckbox(test);
          checkbox.prop('checked', val);
          checkbox.trigger('change');
        }
        function getAutoPushLabel(test) {
          var autoPush = test.router.controller.$('[data-se="o-form-input-autoPush"]');
          var autoPushLabel = autoPush.find('Label').text();
          return autoPushLabel;
        }
        itp('has push and an inline totp form', function () {
          return setupOktaPush().then(function (test) {
            expect(test.form[0].isPush()).toBe(true);
            expect(test.form[1].isInlineTOTP()).toBe(true);
          });
        });
        itp('shows the right beacon', function () {
          return setupOktaPush().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-okta-verify');
          });
        });
        itp('has remember device checkbox', function () {
          return setupOktaPush().then(function (test) {
            Expect.isVisible(getRememberDeviceForPushForm(test));
          });
        });

        Expect.describe('Auto Push', function () {
          itp('has auto push checkbox', function () {
            return setupOktaPush({'features.autoPush': true}).then(function (test) {
              Expect.isVisible(getAutoPushCheckbox(test));
            });
          });
          itp('auto push has the right text', function () {
            return setupOktaPush({'features.autoPush': true}).then(function (test) {
              expect(getAutoPushLabel(test)).toEqual('Send push automatically');
            });
          });
          itp('has no auto push checkbox when feature is off', function () {
            return setupOktaPush({'features.autoPush': false}).then(function (test) {
              expect(getAutoPushCheckbox(test).length).toBe(0);
            });
          });
        });

        Expect.describe('Push', function () {
          itp('shows a title that includes the device name', function () {
            return setupOktaPush().then(function (test) {
              expect(test.form[0].titleText()).toBe('Okta Verify (Reman\'s iPhone)');
              expect(test.form[1].titleText()).toBe('');
            });
          });
          itp('calls authClient verifyFactor with correct args when submitted', function () {
            return setupOktaPush().then(function (test) {
              $.ajax.calls.reset();
              setRememberDeviceForPushForm(test, true);
              test.setNextResponse(resSuccess);
              test.form[0].submit();
              return tick();
            })
            .then(function () {
              expect($.ajax.calls.count()).toBe(1);
              Expect.isJsonPost($.ajax.calls.argsFor(0), {
                url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify?rememberDevice=true',
                data: {
                  stateToken: 'testStateToken'
                }
              });
            });
          });
          itp('calls authClient verifyFactor with correct args when autoPush is checked', function () {
            return setupOktaPush({'features.autoPush': true}).then(function (test) {
              $.ajax.calls.reset();
              setAutoPushCheckbox(test, true);
              test.setNextResponse(resSuccess);
              test.form[0].submit();
              return tick();
            })
            .then(function () {
              expect($.ajax.calls.count()).toBe(1);
              Expect.isJsonPost($.ajax.calls.argsFor(0), {
                url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                '?autoPush=true&rememberDevice=false',
                data: {
                  stateToken: 'testStateToken'
                }
              });
            });
          });
          itp('calls authClient verifyFactor with correct args when autoPush is not checked', function () {
            return setupOktaPush({'features.autoPush': true}).then(function (test) {
              $.ajax.calls.reset();
              setAutoPushCheckbox(test, false);
              test.setNextResponse(resSuccess);
              test.form[0].submit();
              return tick();
            })
            .then(function () {
              expect($.ajax.calls.count()).toBe(1);
              Expect.isJsonPost($.ajax.calls.argsFor(0), {
                url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                '?autoPush=false&rememberDevice=false',
                data: {
                  stateToken: 'testStateToken'
                }
              });
            });
          });
          Expect.describe('polling', function () {
            itp('will pass rememberMe on the first request', function () {
              return setupOktaPush().then(function (test) {
                setRememberDeviceForPushForm(test, true);
                return setupPolling(test, resSuccess)
                .then(tick) // Final tick - SUCCESS
                .then(function () {
                  expect($.ajax.calls.count()).toBe(3);
                  // initial verifyFactor call
                  Expect.isJsonPost($.ajax.calls.argsFor(0), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify?rememberDevice=true',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });

                  // first startVerifyFactorPoll call
                  Expect.isJsonPost($.ajax.calls.argsFor(1), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });

                  // last startVerifyFactorPoll call
                  Expect.isJsonPost($.ajax.calls.argsFor(2), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });
                });
              });
            });
            itp('will pass autoPush as true if checkbox checked during polling', function () {
              return setupOktaPush({'features.autoPush': true}).then(function (test) {
                setAutoPushCheckbox(test, true);
                return setupPolling(test, resSuccess)
                .then(tick) // Final tick - SUCCESS
                .then(function () {
                  expect($.ajax.calls.count()).toBe(3);
                  // initial verifyFactor call
                  Expect.isJsonPost($.ajax.calls.argsFor(0), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                    '?autoPush=true&rememberDevice=false',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });

                  // first startVerifyFactorPoll call
                  Expect.isJsonPost($.ajax.calls.argsFor(1), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                    '?autoPush=true&rememberDevice=false',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });

                  // last startVerifyFactorPoll call
                  Expect.isJsonPost($.ajax.calls.argsFor(2), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                    '?autoPush=true&rememberDevice=false',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });
                });
              });
            });
            itp('will pass autoPush as false if checkbox unchecked during polling', function () {
              return setupOktaPush({'features.autoPush': true}).then(function (test) {
                setAutoPushCheckbox(test, false);
                return setupPolling(test, resSuccess)
                .then(tick) // Final tick - SUCCESS
                .then(function () {
                  expect($.ajax.calls.count()).toBe(3);
                  // initial verifyFactor call
                  Expect.isJsonPost($.ajax.calls.argsFor(0), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                    '?autoPush=false&rememberDevice=false',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });

                  // first startVerifyFactorPoll call
                  Expect.isJsonPost($.ajax.calls.argsFor(1), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                    '?autoPush=false&rememberDevice=false',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });

                  // last startVerifyFactorPoll call
                  Expect.isJsonPost($.ajax.calls.argsFor(2), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                    '?autoPush=false&rememberDevice=false',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });
                });
              });
            });
            itp('will pass rememberDevice as true if checkbox checked during polling', function () {
              return setupOktaPush({'features.autoPush': true}).then(function (test) {
                setAutoPushCheckbox(test, true);
                setRememberDeviceForPushForm(test, true);
                return setupPolling(test, resSuccess)
                .then(tick) // Final tick - SUCCESS
                .then(function () {
                  expect($.ajax.calls.count()).toBe(3);
                  // initial verifyFactor call
                  Expect.isJsonPost($.ajax.calls.argsFor(0), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                    '?autoPush=true&rememberDevice=true',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });

                  // first startVerifyFactorPoll call
                  Expect.isJsonPost($.ajax.calls.argsFor(1), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                    '?autoPush=true&rememberDevice=true',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });

                  // last startVerifyFactorPoll call
                  Expect.isJsonPost($.ajax.calls.argsFor(2), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                    '?autoPush=true&rememberDevice=true',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });
                });
              });
            });
            itp('will pass rememberDevice as true if checkbox checked during polling and autoPush is false',
              function () {
                return setupOktaPush({ 'features.autoPush': true }).then(function (test) {
                  setAutoPushCheckbox(test, false);
                  setRememberDeviceForPushForm(test, true);
                  return setupPolling(test, resSuccess)
                  .then(tick) // Final tick - SUCCESS
                  .then(function () {
                    expect($.ajax.calls.count()).toBe(3);
                    // initial verifyFactor call
                    Expect.isJsonPost($.ajax.calls.argsFor(0), {
                      url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                      '?autoPush=false&rememberDevice=true',
                      data: {
                        stateToken: 'testStateToken'
                      }
                    });

                    // first startVerifyFactorPoll call
                    Expect.isJsonPost($.ajax.calls.argsFor(1), {
                      url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                      '?autoPush=false&rememberDevice=true',
                      data: {
                        stateToken: 'testStateToken'
                      }
                    });

                    // last startVerifyFactorPoll call
                    Expect.isJsonPost($.ajax.calls.argsFor(2), {
                      url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify' +
                      '?autoPush=false&rememberDevice=true',
                      data: {
                        stateToken: 'testStateToken'
                      }
                    });
                  });
                });
              });
            itp('will disable form submit', function () {
              return setupOktaPush().then(function (test) {
                return setupPolling(test, resSuccess)
                .then(function () {
                  expect(test.form.submitButton().attr('class')).toMatch('link-button-disabled');
                  expect(test.form.submitButton().prop('disabled')).toBe(true);
                  $.ajax.calls.reset();
                  test.form.submit();
                  return tick(test); // Final tick - SUCCESS
                })
                .then(function () {
                  expect($.ajax.calls.count()).toBe(0);
                });
              });
            });
            itp('on SUCCESS, sets transaction, polling stops and form is submitted', function () {
              return setupOktaPush().then(function (test) {
                spyOn(test.router.controller.model, 'setTransaction').and.callThrough();
                spyOn(test.router.settings, 'callGlobalSuccess');
                return setupPolling(test, resSuccess)
                .then(function () {
                  // Final tick - SUCCESS
                  return tick(test);
                })
                .then(function () {
                  expect(test.router.settings.callGlobalSuccess).toHaveBeenCalled();
                  // One after first poll returns and one after polling finished.
                  var calls = test.router.controller.model.setTransaction.calls;
                  expect(calls.count()).toBe(2);
                  expect(calls.first().args[0].status).toBe('MFA_CHALLENGE');
                  expect(calls.mostRecent().args[0].status).toBe('SUCCESS');
                });
              });
            });
            itp('sets transaction state to MFA_CHALLENGE before poll', function () {
              return setupOktaPush().then(function (test) {
                $.ajax.calls.reset();
                test.setNextResponse(resChallengePush);
                test.form[0].submit();
                return tick(test).then(function() {
                  expect(test.router.controller.model.appState.get('transaction').status).toBe('MFA_CHALLENGE');
                });
              });
            });
            itp('starts poll after a delay of 6000ms', function () {
              return setupOktaPush().then(function (test) {
                spyOn(LoginUtil, 'callAfterTimeout').and.callFake(function() {
                  // reducing the timeout to 100 so that test is fast.
                  return setTimeout(arguments[0], 100);
                });

                $.ajax.calls.reset();
                test.setNextResponse(resChallengePush);
                test.form[0].submit();
                return tick(test).then(function() {
                  expect(LoginUtil.callAfterTimeout.calls.argsFor(1)[1]).toBe(6000);
                  expect(test.router.controller.model.appState.get('transaction').status).toBe('MFA_CHALLENGE');
                  var transaction = test.router.controller.model.appState.get('transaction');
                  spyOn(transaction, 'poll');
                  // Check between 0 and 6000ms (in test 100ms).
                  setTimeout(function() {
                    expect(transaction.poll).not.toHaveBeenCalled();
                  }, 80);
                  var deferred = Q.defer();
                  setTimeout(deferred.resolve, 150);
                  return deferred.promise.then(function() {
                    expect(transaction.poll).toHaveBeenCalled();
                  });
                });
              }); 
            });
            itp('does not start poll if factor was switched before 6000ms', function () {
              return setupOktaPush().then(function (test) {
                spyOn(LoginUtil, 'callAfterTimeout').and.callFake(function() {
                  // reducing the timeout to 100 so that test is fast.
                  return setTimeout(arguments[0], 100);
                });
                $.ajax.calls.reset();
                test.setNextResponse([resChallengePush, resAllFactors]);
                test.form[0].submit();
                return tick(test).then(function() {
                  var deferred = Q.defer();
                  expect(test.router.controller.model.appState.get('transaction').status).toBe('MFA_CHALLENGE');
                  var transaction = test.router.controller.model.appState.get('transaction');
                  spyOn(transaction, 'poll');
                  spyOn(test.router.controller.model.appState, 'trigger').and.callThrough();
                  clickFactorInDropdown(test, 'DUO');
                  expect(test.router.controller.model.appState.trigger).toHaveBeenCalledWith('factorSwitched');
                  setTimeout(deferred.resolve, 150);
                  return deferred.promise.then(function() {
                    expect(transaction.poll).not.toHaveBeenCalled();
                  });
                });
              });
            });
            itp('stops listening on factorSwitched when we start polling', function () {
              return setupOktaPush().then(function (test) {
                spyOn(LoginUtil, 'callAfterTimeout').and.callFake(function() {
                  return setTimeout(arguments[0]);
                });
                $.ajax.calls.reset();
                test.setNextResponse(resChallengePush);
                test.form[0].submit();
                spyOn(test.router.controller.model, 'stopListening').and.callThrough();
                return tick(test).then(function() {
                  expect(test.router.controller.model.stopListening).toHaveBeenCalledWith(
                    test.router.controller.model.appState, 'factorSwitched');
                });
              });
            });
            itp('on REJECTED, re-enables submit, displays an error, and allows resending', function () {
              return setupOktaPush().then(function (test) {
                return setupPolling(test, resRejectedPush)
                .then(function () { return tick(test); }) // Final response - REJECTED
                .then(function (test) {
                  expect(test.form.errorMessage()).toBe('You have chosen to reject this login.');
                  expect(test.form.submitButton().prop('disabled')).toBe(false);

                  // Setup responses
                  $.ajax.calls.reset();
                  test.setNextResponse([resChallengePush, resChallengePush, resSuccess]);

                  // Click submit
                  test.form.submit();
                  return tick()
                    .then(tick)
                    .then(tick);
                })
                .then(function () {
                  expect($.ajax.calls.count()).toBe(3);

                  // initial resendByName call
                  Expect.isJsonPost($.ajax.calls.argsFor(0), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify/resend',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });

                  // first startVerifyFactorPoll call
                  Expect.isJsonPost($.ajax.calls.argsFor(1), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });

                  // last startVerifyFactorPoll call
                  Expect.isJsonPost($.ajax.calls.argsFor(2), {
                    url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify',
                    data: {
                      stateToken: 'testStateToken'
                    }
                  });
                });
              });
            });
            itp('on TIMEOUT, re-enables submit, displays an error, and allows resending', function () {
              return setupOktaPush().then(function (test) {
                return setupPolling(test, resTimeoutPush)
                .then(function () { return tick(test); }) // Final response - TIMEOUT
                .then(function (test) {
                  expect(test.form.errorMessage()).toBe('Your push notification has expired.');
                  expect(test.form.submitButton().prop('disabled')).toBe(false);
                });
              });
            });
            itp('re-enables submit and displays an error when request fails', function () {
              function setupFailurePolling(test) {
                // This is to reduce delay before initiating polling in the tests.
                spyOn(LoginUtil, 'callAfterTimeout').and.callFake(function() {
                  return setTimeout(arguments[0]);
                });
                var failureResponse = {status: 0, response: {}};
                $.ajax.calls.reset();
                Util.speedUpPolling(test.ac);
                test.setNextResponse([resChallengePush, resChallengePush, failureResponse, failureResponse,
                  failureResponse, failureResponse, failureResponse, failureResponse]);
                test.form = test.form[0];
                test.form.submit();
                return Expect.waitForFormError(test.form, test);
              }
              return setupOktaPush().then(function (test) {
                spyOn(test.router.settings, 'callGlobalError');
                Q.stopUnhandledRejectionTracking();
                return setupFailurePolling(test)
                .then(function () { return tick(test); }) // Final response - failed
                .then(function (test) {
                  expect(test.form.errorMessage()).toBe(
                    'Unable to connect to the server. Please check your network connection.');
                  expect(test.form.submitButton().prop('disabled')).toBe(false);
                });
              });
            });
            itp('on WARNING_TIMEOUT, shows warning message', function () {
              return setupOktaPush().then(function (test) {
                return setupPolling(test, resSuccess)
                .then(function (test) {
                  expect(test.form.warningMessage()).toBe(
                    'Haven\'t received a push notification yet? Try opening the Okta Verify App on your phone.');
                  expect(test.form.submitButton().prop('disabled')).toBe(true);
                });
              });
            });
            itp('removes warnings and displays error when an error occurs', function () {
              function setupFailurePolling(test) {
                spyOn(LoginUtil, 'callAfterTimeout').and.callFake(function() {
                  return setTimeout(arguments[0]);
                });
                var failureResponse = {status: 0, response: {}};
                $.ajax.calls.reset();
                Util.speedUpPolling(test.ac);
                test.setNextResponse([resChallengePush, resChallengePush, failureResponse, failureResponse,
                  failureResponse, failureResponse, failureResponse, failureResponse]);
                test.form = test.form[0];
                test.form.submit();
                return tick(test);
              }
              return setupOktaPush().then(function (test) {
                spyOn(test.router.settings, 'callGlobalError');
                Q.stopUnhandledRejectionTracking();
                return setupFailurePolling(test)
                .then(function () {
                  expect(test.form.submitButton().prop('disabled')).toBe(true);
                  expect(test.form.submitButtonText()).toBe('Push sent!');
                  expect(test.form.warningMessage()).toBe(
                    'Haven\'t received a push notification yet? Try opening the Okta Verify App on your phone.');
                  return Expect.waitForFormError(test.form, test);
                })
                .then(function (test) {
                  expect(test.form.errorMessage()).toBe(
                    'Unable to connect to the server. Please check your network connection.');
                  expect(test.form.submitButton().prop('disabled')).toBe(false);
                  expect(test.form.hasWarningMessage()).toBe(false);
                });
              });
            });
          });

          // Do this when we have implemented push errors in OktaAuth and have an example
          xit('shows an error if error response from authClient');
        });
        Expect.describe('TOTP', function () {
          itp('has a link to enter code', function () {
            return setupOktaPush().then(function (test) {
              Expect.isLink(test.form[1].inlineTOTPAdd());
              expect(test.form[1].inlineTOTPAddText()).toEqual('Or enter code');
            });
          });
          itp('removes link when clicking it and replaces with totp form', function () {
            return setupOktaPush().then(function (test) {
              var form = test.form[1];
              form.inlineTOTPAdd().click();
              expect(form.inlineTOTPAdd().length).toBe(0);
              expectHasAnswerField({ form: form }, 'tel');
              Expect.isLink(form.inlineTOTPVerify());
              expect(test.form[1].inlineTOTPVerifyText()).toEqual('Verify');
            });
          });
          itp('calls authClient verifyFactor with correct args when submitted', function () {
            return setupOktaPush().then(function (test) {
              $.ajax.calls.reset();
              test.form[1].inlineTOTPAdd().click();
              test.form[1].setAnswer('654321');
              test.setNextResponse(resSuccess);
              test.form[1].inlineTOTPVerify().click();
              return tick();
            })
            .then(function () {
              expect($.ajax.calls.count()).toBe(1);
              Expect.isJsonPost($.ajax.calls.argsFor(0), {
                url: 'https://foo.com/api/v1/authn/factors/osthw62MEvG6YFuHe0g3/verify?rememberDevice=false',
                data: {
                  passCode: '654321',
                  stateToken: 'testStateToken'
                }
              });
            });
          });
          itp('clears any errors from push when submitting inline totp', function () {
            return setupOktaPush()
            .then(function (test) {
              var pushForm = test.form[0],
                  inlineForm = test.form[1];
              return setupPolling(test, resRejectedPush)
              .then(function () { return tick(test); }) // Final response - REJECTED
              .then(function () {
                return Expect.waitForFormError(pushForm, {
                  test: test,
                  inlineForm: inlineForm
                });
              });
            })
            .then(function (res) {
              expect(res.test.form.errorMessage()).toBe('You have chosen to reject this login.');
              res.inlineForm.inlineTOTPAdd().click();
              res.inlineForm.setAnswer('654321');
              res.test.setNextResponse([resAllFactors, resSuccess]);
              res.inlineForm.inlineTOTPVerify().click();
              return Expect.waitForSpyCall(res.test.successSpy, res.test);
            })
            .then(function (test) {
              expect(test.form.hasErrors()).toBe(false);
            });
          });
          itp('calls authClient verifyFactor with rememberDevice URL param', function () {
            return setupOktaPush().then(function (test) {
              $.ajax.calls.reset();
              test.form[1].inlineTOTPAdd().click();
              test.form[1].setAnswer('654321');
              setRememberDeviceForPushForm(test, true);
              test.setNextResponse(resSuccess);
              test.form[1].inlineTOTPVerify().click();
              return tick();
            })
            .then(function () {
              expect($.ajax.calls.count()).toBe(1);
              Expect.isJsonPost($.ajax.calls.argsFor(0), {
                url: 'https://foo.com/api/v1/authn/factors/osthw62MEvG6YFuHe0g3/verify?rememberDevice=true',
                data: {
                  passCode: '654321',
                  stateToken: 'testStateToken'
                }
              });
            });
          });
          itp('shows an error if error response from authClient', function () {
            return setupOktaPush()
            .then(function (test) {
              var form = test.form[1];
              form.inlineTOTPAdd().click();
              Q.stopUnhandledRejectionTracking();
              test.setNextResponse(resInvalidTotp);
              form.setAnswer('wrong');
              form.inlineTOTPVerify().click();
              return tick(form);
            })
            .then(function (form) {
              expect(form.hasErrors()).toBe(true);
              expect(form.errorMessage()).toBe('Invalid Passcode/Answer');
            });
          });
          itp('shows errors if verify button is clicked and answer is empty', function () {
            return setupOktaPush()
            .then(function (test) {
              var form = test.form[1];
              $.ajax.calls.reset();
              form.inlineTOTPAdd().click();
              form.inlineTOTPVerify().click();
              return Expect.waitForFormError(form, form);
            })
            .then(function (form) {
              expect($.ajax).not.toHaveBeenCalled();
              expect(form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
              expect(form.passCodeErrorField().text()).toBe('The field cannot be left blank');
            });
          });
          itp('sets the transaction on the appState on success response', function () {
            return setupOktaPush().then(function (test) {
              mockTransactions(test.router.controller, true);
              test.form[1].inlineTOTPAdd().click();
              test.form[1].setAnswer('654321');
              test.setNextResponse(resSuccess);
              test.form[1].inlineTOTPVerify().click();
              return tick(test);
            })
            .then(function (test) {
              expectSetTransaction(test.router, resSuccess, true);
            });
          });
          itp('sets the transaction error on the appState on error response', function () {
            return setupOktaPush().then(function (test) {
              mockTransactions(test.router.controller, true);
              Q.stopUnhandledRejectionTracking();
              test.setNextResponse(resInvalidTotp);
              var form = test.form[1];
              form.inlineTOTPAdd().click();
              form.setAnswer('wrong');
              form.inlineTOTPVerify().click();
              return tick(test);
            })
            .then(function (test) {
              expectSetTransactionError(test.router, resInvalidTotp, true);
            });
          });
        });
      });

      Expect.describe('Duo', function () {
        itp('is duo', function () {
          return setupDuo().then(function (test) {
            expect(test.form.isDuo()).toBe(true);
          });
        });
        itp('shows the right beacon', function () {
          return setupDuo().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-duo');
          });
        });
        itp('shows the right title', function () {
          return setupDuo().then(function (test) {
            expectTitleToBe(test, 'Duo Security');
          });
        });
        itp('iframe has title', function () {
          return setupDuo().then(function (test) {
            expect(test.form.$('iframe').attr('title')).toBe(test.form.titleText());
          });
        });
        itp('has remember device checkbox', function () {
          return setupDuo().then(function (test) {
            Expect.isVisible(test.form.rememberDeviceCheckbox());
          });
        });
        itp('makes the right init request', function () {
          return setupDuo().then(function () {
            expect($.ajax.calls.count()).toBe(2);
            Expect.isJsonPost($.ajax.calls.argsFor(1), {
              url: 'https://foo.com/api/v1/authn/factors/ost947vv5GOSPjt9C0g4/verify?rememberDevice=false',
              data: {
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('makes the correct request when rememberDevice is checked', function () {
          return setupDuo()
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setRememberDevice(true);
            test.setNextResponse(resSuccess);
            // Duo callback (returns an empty response)
            test.setNextResponse({
              status: 200,
              responseType: 'json',
              response: {}
            });
            var postAction = Duo.init.calls.mostRecent().args[0].post_action;
            postAction('someSignedResponse');
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(2);
            Expect.isJsonPost($.ajax.calls.argsFor(1), {
              url: 'https://foo.com/api/v1/authn/factors/ost947vv5GOSPjt9C0g4/verify?rememberDevice=true',
              data: {
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('initializes duo correctly', function () {
          return setupDuo().then(function (test) {
            var initOptions = Duo.init.calls.mostRecent().args[0];
            expect(initOptions.host).toBe('api123443.duosecurity.com');
            expect(initOptions.sig_request).toBe('sign_request(ikey, skey, akey, username)');
            expect(initOptions.iframe).toBe(test.form.iframe().get(0));
            expect(_.isFunction(initOptions.post_action)).toBe(true);
          });
        });
        itp('notifies okta when duo is done, and completes verification', function () {
          return setupDuo()
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            // Duo callback (returns an empty response)
            test.setNextResponse({
              status: 200,
              responseType: 'json',
              response: {}
            });
            var postAction = Duo.init.calls.mostRecent().args[0].post_action;
            postAction('someSignedResponse');
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(2);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/ost947vv5GOSPjt9C0g4/verify/response',
              data: {
                id: 'ost947vv5GOSPjt9C0g4',
                stateToken: 'testStateToken',
                sig_response: 'someSignedResponse'
              }
            });
            Expect.isJsonPost($.ajax.calls.argsFor(1), {
              url: 'https://foo.com/api/v1/authn/factors/ost947vv5GOSPjt9C0g4/verify',
              data: {
                stateToken: 'testStateToken'
              }
            });
          });
        });
      });

      Expect.describe('Windows Hello', function () {
        itp('shows the right beacon for Windows Hello', function () {
          return emulateNotWindows()
          .then(setupWebauthn)
          .then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-windows-hello');
          });
        });

        itp('displays error message if not Windows', function () {
          return emulateNotWindows()
          .then(setupWebauthn)
          .then(function (test) {
            expect(test.form.el('o-form-error-html').length).toBe(1);
            expect(test.form.submitButton().length).toBe(0);
          });
        });

        itp('does not display error message if Windows', function () {
          return emulateWindows()
          .then(setupWebauthn)
          .then(function (test) {
            expect(test.form.el('o-form-error-html').length).toBe(0);
            expect(test.form.submitButton().length).toBe(1);
          });
        });

        itp('calls webauthn.getAssertion and verifies factor', function () {
          return emulateWindows()
          .then(setupWebauthn)
          .then(function (test) {
            test.setNextResponse([resChallengeWebauthn, resSuccess]);
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect(webauthn.getAssertion).toHaveBeenCalledWith(
              'NONCE',
              [{ id: 'credentialId' }]
            );
            expect($.ajax.calls.count()).toBe(3);
            Expect.isJsonPost($.ajax.calls.argsFor(2), {
              url: 'https://foo.com/api/v1/authn/factors/webauthnFactorId/verify',
              data: {
                authenticatorData: 'authenticatorData1234',
                clientData: 'clientData1234',
                signatureData: 'signature1234',
                stateToken: 'testStateToken'
              }
            });
          });
        });

        itp('does not show error if webauthn.getAssertion fails with AbortError', function () {
          return emulateWindows('AbortError')
          .then(setupWebauthn)
          .then(function (test) {
            test.setNextResponse(resChallengeWebauthn);
            test.form.submit();
            return Expect.waitForSpyCall(webauthn.getAssertion, test);
          })
          .then(function (test) {
            expect(test.form.el('o-form-error-html').length).toBe(0);
            expect($.ajax.calls.count()).toBe(2);
          });
        });

        itp('shows error if webauthn.getAssertion fails with NotSupportedError', function () {
          return emulateWindows('NotSupportedError')
          .then(setupWebauthn)
          .then(function (test) {
            test.setNextResponse(resChallengeWebauthn);
            test.form.submit();
            return Expect.waitForSpyCall(webauthn.getAssertion, test);
          })
          .then(function (test) {
            expect(test.form.el('o-form-error-html').length).toBe(1);
            expect($.ajax.calls.count()).toBe(2);
          });
        });

        itp('shows error if webauthn.getAssertion fails with NotFound', function () {
          return emulateWindows('NotFoundError')
          .then(setupWebauthn)
          .then(function (test) {
            test.setNextResponse(resChallengeWebauthn);
            test.form.submit();
            return Expect.waitForSpyCall(webauthn.getAssertion, test);
          })
          .then(function (test) {
            expect(test.form.el('o-form-error-html').length).toBe(1);
            expect($.ajax.calls.count()).toBe(2);
          });
        });

        itp('subtitle changes after submitting the form', function () {
          return emulateWindows()
          .then(setupWebauthn)
          .then(function (test) {
            test.setNextResponse([resChallengeWebauthn, resSuccess]);
            expect(test.form.subtitleText()).toBe('Verify your identity with Windows Hello');
            expect(test.form.$('.o-form-button-bar').hasClass('hide')).toBe(false);

            test.form.submit();
            expect(test.form.subtitleText()).toBe('Please wait while Windows Hello is loading...');
            expect(test.form.$('.o-form-button-bar').hasClass('hide')).toBe(true);
            return Expect.waitForSpyCall(webauthn.getAssertion, test);
          })
          .then(function (test) {
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.subtitleText()).toBe('Signing in to Okta...');
            expect(test.form.$('.o-form-button-bar').hasClass('hide')).toBe(true);
          });
        });

        itp('automatically triggers Windows Hello only once', function () {
          return emulateWindows()
          .then(setupWebauthnOnly)
          .then(function (test) {
            expect(test.router.controller.model.get('__autoTriggered__')).toBe(true);
            spyOn(test.router.controller.model, 'save');
            test.router.controller.postRender();
            expect(test.router.controller.model.save).not.toHaveBeenCalled();
          });
        });
      });

      Expect.describe('Security Key (U2F)', function () {
        itp('shows the right beacon for Security Key (U2F)', function () {
          return setupU2F({u2f: true}).then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-u2f');
            return Expect.waitForSpyCall(window.u2f.sign);
          });
        });

        itp('shows the right title', function () {
          return setupU2F({u2f: true}).then(function (test) {
            expectTitleToBe(test, 'Security Key (U2F)');
            return Expect.waitForSpyCall(window.u2f.sign);
          });
        });

        itp('shows error if browser does not support u2f', function () {
          return setupU2F({u2f: false}).then(function (test) {
            expect(test.form.el('o-form-error-html')).toHaveLength(1);
            expect(test.form.el('o-form-error-html').find('strong').html())
            .toEqual('Security Key (U2F) is not supported on this browser. ' +
              'Select another factor or contact your admin for assistance.');
          });
        });

        itp('shows error if browser does not support u2f and only one factor', function () {
          return setupU2F({u2f: false, oneFactor: true}).then(function (test) {
            expect(test.form.el('o-form-error-html')).toHaveLength(1);
            expect(test.form.el('o-form-error-html').find('strong').html())
            .toEqual('Security Key (U2F) is not supported on this browser. Contact your admin for assistance.');
          });
        });

        itp('does not show error if browser supports u2f', function () {
          return setupU2F({u2f: true}).then(function (test) {
            expect(test.form.el('o-form-error-html')).toHaveLength(0);
          });
        });

        itp('shows a spinner while waiting for u2f challenge', function () {
          return setupU2F({u2f: true}).then(function (test) {
            expect(test.form.el('u2f-waiting').length).toBe(1);
            return Expect.waitForSpyCall(window.u2f.sign);
          });
        });

        itp('has remember device checkbox', function () {
          return setupU2F({u2f: true}).then(function (test) {
            Expect.isVisible(test.form.rememberDeviceCheckbox());
          });
        });

        itp('calls u2f.sign and verifies factor', function () {
          var signStub = function (appId, nonce, registeredKeys, callback) {
            callback({
              keyHandle: 'someKeyHandle',
              clientData: 'someClientData',
              signatureData: 'someSignature'
            });
          };
          return setupU2F({u2f: true, signStub: signStub, res: resSuccess})
          .then(function (test) {
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect(window.u2f.sign).toHaveBeenCalledWith(
              'https://test.okta.com',
              'NONCE',
              [ { version: 'U2F_V2', keyHandle: 'someCredentialId' } ],
              jasmine.any(Function)
            );
            expect($.ajax.calls.count()).toBe(3);
            Expect.isJsonPost($.ajax.calls.argsFor(2), {
              url: 'https://foo.com/api/v1/authn/factors/u2fFactorId/verify?rememberDevice=false',
              data: {
                clientData: 'someClientData',
                signatureData: 'someSignature',
                stateToken: 'testStateToken'
              }
            });
          });
        });

        // See OKTA-179504
        xit('calls u2f.sign and verifies factor when rememberDevice set to true', function () {
          var signStub = function (appId, nonce, registeredKeys, callback) {
            callback({
              keyHandle: 'someKeyHandle',
              clientData: 'someClientData',
              signatureData: 'someSignature'
            });
          };
          return setupU2F({u2f: true, signStub: signStub, res: resSuccess})
          .then(function (test) {
            test.form.setRememberDevice(true);
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect(window.u2f.sign).toHaveBeenCalledWith(
              'https://test.okta.com',
              'NONCE',
              [ { version: 'U2F_V2', keyHandle: 'someCredentialId' } ],
              jasmine.any(Function)
            );
            expect($.ajax.calls.count()).toBe(3);
            Expect.isJsonPost($.ajax.calls.argsFor(2), {
              url: 'https://foo.com/api/v1/authn/factors/u2fFactorId/verify?rememberDevice=true',
              data: {
                clientData: 'someClientData',
                signatureData: 'someSignature',
                stateToken: 'testStateToken'
              }
            });
          });
        });

        itp('shows an error if u2f.sign fails', function () {
          Q.stopUnhandledRejectionTracking();
          var signStub = function (appId, nonce, registeredKeys, callback) {
            callback({ errorCode: 2 });
          };
          return setupU2F({u2f: true, signStub: signStub})
          .then(function (test) {
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(window.u2f.sign).toHaveBeenCalled();
            expect(test.form.hasErrors()).toBe(true);
          });
        });
      });

      Expect.describe('Custom Factor', function () {
        itp('is custom factor', function () {
          return setupCustomFactor().then(function (test) {
            expect(test.form.isCustomFactor()).toBe(true);
          });
        });
        itp('shows the right beacon', function () {
          return setupCustomFactor().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-custom-factor');
          });
        });
        itp('shows the right title', function () {
          return setupCustomFactor().then(function (test) {
            expectTitleToBe(test, 'Third Party Factor');
          });
        });
        itp('shows the right subtitle', function () {
          return setupCustomFactor().then(function (test) {
            expectSubtitleToBe(test, 'Clicking below will redirect to verification with Third Party Factor');
          });
        });
        itp('has remember device checkbox', function () {
          return setupCustomFactor().then(function (test) {
            Expect.isVisible(test.form.rememberDeviceCheckbox());
          });
        });
        itp('redirects to third party when Verify button is clicked', function () {
          spyOn(SharedUtil, 'redirect');
          return setupCustomFactor().then(function (test) {
            test.setNextResponse([resChallengeCustomFactor, resSuccess]);
            test.form.submit();
            return Expect.waitForSpyCall(SharedUtil.redirect);
          })
          .then(function () {
            expect(SharedUtil.redirect).toHaveBeenCalledWith(
              'http://rain.okta1.com:1802/policy/mfa-idp-redirect?okta_key=mfa.redirect.id'
            );
          });
        });
        itp('displays error when error response received', function () {
          return setupCustomFactor().then(function (test) {
            test.setNextResponse(resNoPermissionError);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
          });
        });
        itp('calls authClient verifyFactor with rememberDevice URL param', function () {
          return setupCustomFactor().then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.setRememberDevice(true);
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'http://rain.okta1.com:1802/api/v1/authn/factors/customFactorId/verify?rememberDevice=true',
              data: {
                stateToken: 'testStateToken'
              }
            });
          });
        });
      });
      Expect.describe('Password', function () {
        itp('is password', function () {
          return setupPassword().then(function (test) {
            expect(test.form.isPassword()).toBe(true);
          });
        });
        itp('shows the right beacon', function () {
          return setupPassword().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-okta-password');
          });
        });
        itp('shows the right title', function () {
          return setupPassword().then(function (test) {
            expectTitleToBe(test, 'Password');
          });
        });
        itp('has a password field', function () {
          return setupPassword().then(function (test) {
            expectHasPasswordField(test, 'password');
          });
        });
        itp('has remember device checkbox', function () {
          return setupPassword().then(function (test) {
            Expect.isVisible(test.form.rememberDeviceCheckbox());
          });
        });
        itp('no auto push checkbox', function () {
          return setupPassword({'features.autoPush': true}).then(function (test) {
            expect(test.form.autoPushCheckbox().length).toBe(0);
          });
        });
        itp('a password field type is "password" initially and can be switched between "text" and "password" \
          by clicking on "show"/"hide" buttons', function () {
          return setupPassword().then(function (test) {
            var answer = test.form.passwordField();
            expect(answer.attr('type')).toEqual('password');

            test.form.showPasswordButton().click();
            expect(test.form.passwordField().attr('type')).toEqual('text');

            test.form.hidePasswordButton().click();
            expect(test.form.passwordField().attr('type')).toEqual('password');
          });
        });
        itp('calls authClient verifyFactor with correct args when submitted', function () {
          return setupPassword().then(function (test) {
            $.ajax.calls.reset();
            test.form.setPassword('Abcd1234');
            test.form.setRememberDevice(true);
            test.setNextResponse(resSuccess);
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'http://rain.okta1.com:1802/api/v1/authn/factors/password/verify?rememberDevice=true',
              data: {
                password: 'Abcd1234',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('disables the "verify button" when clicked', function () {
          return setupPassword().then(function (test) {
            $.ajax.calls.reset();
            test.form.setPassword('Abcd');
            test.setNextResponse(resInvalidPassword);
            test.form.submit();
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).toContain('link-button-disabled');
            expect(button.prop('disabled')).toBe(true);
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).not.toContain('link-button-disabled');
            expect(button.prop('disabled')).toBe(false);
          });
        });
        itp('shows an error if error response from authClient', function () {
          return setupPassword()
          .then(function (test) {
            test.setNextResponse(resInvalidPassword);
            test.form.setPassword('wrong');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Password is incorrect');
          });
        });
        itp('shows errors if verify button is clicked and password is empty', function () {
          return setupPassword()
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setPassword('');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect($.ajax).not.toHaveBeenCalled();
            expect(test.form.passwordErrorField().length).toBe(1);
            expect(test.form.passwordErrorField().text()).toBe('Please enter a password');
            expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
          });
        });
        itp('sets the transaction on the appState on success response', function () {
          return setupPassword()
          .then(function (test) {
            mockTransactions(test.router.controller);
            $.ajax.calls.reset();
            test.form.setPassword('Abcd1234');
            test.setNextResponse(resSuccess);
            test.form.submit();
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function (test) {
            expectSetTransaction(test.router, resSuccess);
          });
        });
        itp('sets the transaction error on the appState on error response', function () {
          return setupPassword()
          .then(function (test) {
            mockTransactions(test.router.controller);
            $.ajax.calls.reset();
            test.form.setPassword('Abcd1234');
            test.setNextResponse(resInvalidPassword);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expectSetTransactionError(test.router, resInvalidPassword);
          });
        });
      });
    });

    Expect.describe('Beacon', function () {
      itp('has no dropdown if there is only one factor', function () {
        return setup(resVerifyTOTPOnly).then(function (test) {
          var options = test.beacon.getOptionsLinks();
          expect(options.length).toBe(0);
        });
      });
      itp('has a dropdown if there is more than one factor', function () {
        return setup(resAllFactors).then(function (test) {
          var options = test.beacon.getOptionsLinks();
          expect(options.length).toBe(14);
        });
      });
      itp('shows the right options in the dropdown, removes okta totp if ' +
         'okta push exists, and orders factors by security', function () {
        return setup(resAllFactors).then(function (test) {
          var options = test.beacon.getOptionsLinksText();
          expect(options).toEqual([
            'Okta Verify', 'Security Key (U2F)', 'Windows Hello', 'Yubikey', 'Google Authenticator',
            'SMS Authentication', 'Voice Call Authentication', 'Email Authentication', 'Security Question',
            'Duo Security', 'Symantec VIP', 'RSA SecurID', 'Password', 'Third Party Factor'
          ]);
        });
      });
      itp('shows the right options in the dropdown, removes okta totp if ' +
          'okta push exists, and orders factors by security (On-Prem, no Password)', function () {
        return setup(resAllFactorsOnPrem).then(function (test) {
          var options = test.beacon.getOptionsLinksText();
          expect(options).toEqual([
            'Okta Verify', 'Yubikey', 'Google Authenticator', 'SMS Authentication', 'Security Question',
            'Duo Security', 'Symantec VIP', 'On-Prem MFA', 'Third Party Factor'
          ]);
        });
      });
      itp('opens dropDown options when dropDown link is clicked', function () {
        return setup(resAllFactors).then(function (test) {
          expect(test.beacon.getOptionsList().is(':visible')).toBe(false);
          test.beacon.dropDownButton().click();
          expect(test.beacon.getOptionsList().is(':visible')).toBe(true);
        });
      });
      itp('updates beacon image when different factor is selected', function () {
        return setup(resAllFactors)
        .then(function (test) {
          expectHasRightBeaconImage(test, 'mfa-okta-security-question');
          test.beacon.dropDownButton().click();
          clickFactorInDropdown(test, 'GOOGLE_AUTH');
          return tick(test);
        })
        .then(function (test) {
          expectHasRightBeaconImage(test, 'mfa-google-auth');
        });
      });
      itp('changes selectedFactor if option is chosen', function () {
        return setup(resAllFactors).then(function (test) {
          test.beacon.dropDownButton().click();
          clickFactorInDropdown(test, 'GOOGLE_AUTH');
          expect(test.router.navigate)
            .toHaveBeenCalledWith('signin/verify/google/token%3Asoftware%3Atotp', { trigger: true });
        });
      });
      itp('is able to switch between factors even when the auth status is MFA_CHALLENGE', function () {
        spyOn(Duo, 'init');
        return setup(resAllFactors).then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeDuo);
          test.beacon.dropDownButton().click();
          clickFactorInDropdown(test, 'DUO');
          return tick(test);
        })
        .then(function (test) {
          test.setNextResponse(resAllFactors);
          test.beacon.dropDownButton().click();
          clickFactorInDropdown(test, 'GOOGLE_AUTH');
          return tick(test);
        })
        .then(function (test) {
          expect(test.router.navigate)
            .toHaveBeenCalledWith('signin/verify/google/token%3Asoftware%3Atotp', { trigger: true });
        });
      });
    });

    Expect.describe('Switch between different factors and verify a factor', function () {
      itp('Verify Security Question after switching from SMS MFA_CHALLENGE', function () {
        return setupSMS().then(function (test) {
          test.setNextResponse(resChallengeSms);
          test.form.smsSendCode().click();
          return tick(test);
        })
        .then(function (test) {
          test.setNextResponse(resAllFactors);
          test.beacon.dropDownButton().click();
          clickFactorInDropdown(test, 'QUESTION');
          return Expect.waitForVerifyQuestion(test);
        })
        .then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          // We cannot use test.form here since refers to SMS form,
          // so query for the security question form.
          test.questionForm = new MfaVerifyForm($sandbox.find('.o-form'));
          test.questionForm.setAnswer('food');
          test.questionForm.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/factors/ufshpdkgNun3xNE3W0g3/verify?rememberDevice=false',
            data: {
              answer: 'food',
              stateToken: 'testStateToken'
            }
          });
        });
      });
      itp('Verify Push after switching from Google TOTP', function () {
        return setupGoogleTOTPAutoPushTrue({'features.autoPush': true})
        .then(function (test) {
          test.setNextResponse(resChallengePush);
          test.beacon.dropDownButton().click();
          clickFactorInDropdown(test, 'OKTA_VERIFY_PUSH');
          return Expect.waitForVerifyPush(test);
        })
        .then(function (test) {
          var button = test.form.submitButton();
          var buttonClass = button.attr('class');
          expect(buttonClass).toContain('link-button-disabled');
          expect(button.prop('disabled')).toBe(true);
        });
      });
      itp('Verify Google TOTP after switching from Push MFA_CHALLENGE', function () {
        return setupOktaPush().then(function (test) {
          return setupPolling(test, resAllFactors)
          .then(function (test) {
            test.beacon.dropDownButton().click();
            clickFactorInDropdown(test, 'GOOGLE_AUTH');
            return tick(test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            // We cannot use test.form here since refers to SMS form,
            // so query for the google TOTP form.
            test.googleTOTPForm = new MfaVerifyForm($sandbox.find('.o-form'));
            test.googleTOTPForm.setAnswer('123456');
            test.googleTOTPForm.submit();
            return tick(test);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/ufthp18Zup4EGLtrd0g3/verify?rememberDevice=false',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
      });
      itp('Verify Okta TOTP on active Push MFA_CHALLENGE', function () {
        return setupOktaPush().then(function (test) {
          // using resTimeoutPush here for the test. This needs to be resTimeoutPush
          // or resRejectedPush, to set the transaction to MFA_CHALLENGE state and
          // mimic an active poll (Note: The transaction state is not set to MFA_CHALLENGE
          // during polling).
          return setupPolling(test, resTimeoutPush)
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse([resAllFactors, resSuccess]);
            test.totpForm = new MfaVerifyForm($($sandbox.find('.o-form')[1]));
            // click or enter code in the the Totp form
            test.totpForm.inlineTOTPAdd().click();
            test.totpForm.setAnswer('654321');
            test.totpForm.inlineTOTPVerify().click();
            return tick(test);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(2);
            Expect.isJsonPost($.ajax.calls.argsFor(1), {
              url: 'https://foo.com/api/v1/authn/factors/osthw62MEvG6YFuHe0g3/verify?rememberDevice=false',
              data: {
                passCode: '654321',
                stateToken: 'testStateToken'
              }
            });
          });
        });
      });
      itp('Verify Okta TOTP success on Push MFA_REJECTED', function () {
        return setupOktaPush().then(function (test) {
          return setupPolling(test, resRejectedPush)
          .then(function () { return tick(test); }) // Final response - REJECTED
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse([resAllFactors, resSuccess]);
            test.totpForm = new MfaVerifyForm($($sandbox.find('.o-form')[1]));
            // click or enter code in the the Totp form
            test.totpForm.inlineTOTPAdd().click();
            test.totpForm.setAnswer('654321');
            test.totpForm.inlineTOTPVerify().click();
            return tick(test);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(2);
            // MFA_CHALLENGE to MFA_REQUIRED
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/previous',
              data: {
                stateToken: 'testStateToken'
              }
            });
            Expect.isJsonPost($.ajax.calls.argsFor(1), {
              url: 'https://foo.com/api/v1/authn/factors/osthw62MEvG6YFuHe0g3/verify?rememberDevice=false',
              data: {
                passCode: '654321',
                stateToken: 'testStateToken'
              }
            });
          });
        });
      });
      itp('Verify Okta TOTP success (after Push MFA_REJECTED) sets the transaction on the appState', function () {
        return setupOktaPush().then(function (test) {
          return setupPolling(test, resRejectedPush)
          .then(function () { return tick(test); }) // Final response - REJECTED
          .then(function (test) {
            mockTransactions(test.router.controller, true);
            test.setNextResponse([resAllFactors, resSuccess]);
            test.totpForm = new MfaVerifyForm($($sandbox.find('.o-form')[1]));
            // click or enter code in the the Totp form
            test.totpForm.inlineTOTPAdd().click();
            test.totpForm.setAnswer('654321');
            test.totpForm.inlineTOTPVerify().click();
            return tick(test);
          })
          .then(function () {
            expectSetTransaction(test.router, resSuccess, true);
          });
        });
      });
      itp('Verify DUO after switching from SMS MFA_CHALLENGE', function () {
        return setupSMS().then(function (test) {
          test.setNextResponse(resChallengeSms);
          test.form.smsSendCode().click();
          return tick(test);
        })
        .then(function (test) {
          spyOn(Duo, 'init');
          test.setNextResponse([resAllFactors, resChallengeDuo]);
          test.beacon.dropDownButton().click();
          clickFactorInDropdown(test, 'DUO');
          return Expect.waitForVerifyDuo(test);
        })
        .then(function () {
          expect(Duo.init).toHaveBeenCalled();
        });
      });
    });

    Expect.describe('Browser back button does not change view', function () {
      itp('from mfa verify controller', function () {
        return setupAllFactorsWithRouter().then(function (test) {
          spyOn(window, 'addEventListener');
          test.router.start();
          expectHasRightBeaconImage(test, 'mfa-okta-security-question');
          test.beacon.dropDownButton().click();
          clickFactorInDropdown(test, 'SMS');
          return tick(test);
        })
        .then(function (test) {
          expectHasRightBeaconImage(test, 'mfa-okta-sms');
          Util.triggerBrowserBackButton();
          return tick(test);
        })
        .then(function (test) {
          //view is still the same
          expectHasRightBeaconImage(test, 'mfa-okta-sms');
          Util.stopRouter();
        });
      });
      itp('from duo controller', function () {
        return setupAllFactorsWithRouter().then(function (test) {
          spyOn(window, 'addEventListener');
          test.router.start();
          expectHasRightBeaconImage(test, 'mfa-okta-security-question');
          spyOn(Duo, 'init');
          test.setNextResponse(resChallengeDuo);
          test.beacon.dropDownButton().click();
          clickFactorInDropdown(test, 'DUO');
          return tick(test);
        })
        .then(function (test) {
          expectHasRightBeaconImage(test, 'mfa-duo');
          Util.triggerBrowserBackButton();
          return tick(test);
        })
        .then(function (test) {
          //view is still the same
          expectHasRightBeaconImage(test, 'mfa-duo');
          Util.stopRouter();
        });
      });
      itp('from windows hello controller', function () {
        return emulateWindows()
        .then(setupAllFactorsWithRouter)
        .then(function (test) {
          spyOn(window, 'addEventListener');
          test.router.start();
          expectHasRightBeaconImage(test, 'mfa-okta-security-question');
          test.setNextResponse(resChallengeWebauthn);
          test.beacon.dropDownButton().click();
          clickFactorInDropdown(test, 'WINDOWS_HELLO');
          return tick(test);
        })
        .then(function (test) {
          expectHasRightBeaconImage(test, 'mfa-windows-hello');
          Util.triggerBrowserBackButton();
          return tick(test);
        })
        .then(function (test) {
          //view is still the same
          expectHasRightBeaconImage(test, 'mfa-windows-hello');
          Util.stopRouter();
        });
      });
      itp('from u2f controller', function () {
        return setupAllFactorsWithRouter().then(function (test) {
          spyOn(window, 'addEventListener');
          test.router.start();
          expectHasRightBeaconImage(test, 'mfa-okta-security-question');
          return test;
        })
        .then(function (test) {
          window.u2f = {
            sign: function () {
            }
          };
          spyOn(window.u2f, 'sign');
          test.setNextResponse(resChallengeU2F);
          test.beacon.dropDownButton().click();
          clickFactorInDropdown(test, 'U2F');
          return tick(test);
        })
        .then(function (test) {
          expectHasRightBeaconImage(test, 'mfa-u2f');
          Util.triggerBrowserBackButton();
          return tick(test);
        })
        .then(function (test) {
          //view is still the same
          expectHasRightBeaconImage(test, 'mfa-u2f');
          Util.stopRouter();
        });
      });
    });

    Expect.describe('The auth response', function () {
      itp('is NOT TRAPPED when Mfa verify follows password re-auth', function () {
        return setupPassword().then(function (test) {
          spyOn(RouterUtil, 'handleResponseStatus').and.callThrough();
          $.ajax.calls.reset();
          test.form.setPassword('Abcd1234');
          test.form.setRememberDevice(true);
          test.setNextResponse(resAllFactors);
          test.form.submit();
          return Expect.waitForVerifyQuestion(test);
        })
        .then(function (test) {
          test.questionForm = new MfaVerifyForm($sandbox.find('.o-form'));
          expect(test.questionForm.isSecurityQuestion()).toBe(true);
          // trapAuthResponse does not prevent handleResponseStatus from being called
          expect(RouterUtil.handleResponseStatus.calls.count()).toBe(1);
        });
      });
      itp('is TRAPPED on any factor change through the dropdown', function () {
        return setupSMS().then(function (test) {
          spyOn(RouterUtil, 'handleResponseStatus').and.callThrough();
          test.setNextResponse(resChallengeSms);
          test.form.smsSendCode().click();
          return tick(test);
        })
        .then(function (test) {
          test.setNextResponse(resAllFactors);
          test.beacon.dropDownButton().click();
          clickFactorInDropdown(test, 'QUESTION');
          return Expect.waitForVerifyQuestion(test);
        })
        .then(function () {
          // trapAuthResponse prevents handleResponseStatus from being called
          expect(RouterUtil.handleResponseStatus.calls.count()).toBe(0);
        });
      });
      itp('is TRAPPED during verify of inline totp with Okta Verify Push', function () {
        return setupOktaPush().then(function (test) {
          return setupPolling(test, resRejectedPush)
          .then(function () { return tick(test); }) // Final response - REJECTED
          .then(function (test) {
            spyOn(RouterUtil, 'handleResponseStatus').and.callThrough();
            test.totpForm = new MfaVerifyForm($($sandbox.find('.o-form')[1]));
            test.totpForm.inlineTOTPAdd().click();
            test.totpForm.setAnswer('654321');
            test.setNextResponse([resAllFactors, resSuccess]);
            test.totpForm.inlineTOTPVerify().click();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            // clicking on inline totp should trap auth response, SUCCESS response will
            // call handleResponseStatus.
            expect(RouterUtil.handleResponseStatus.calls.count()).toBe(1);
          });
        });
      });
    });

  });

});
