/*jshint maxparams:25, maxstatements:26, camelcase:false */
/*global JSON */
define([
  'vendor/lib/q',
  'underscore',
  'jquery',
  'duo',
  'vendor/OktaAuth',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/MfaVerifyForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'util/RouterUtil',
  'sandbox',
  'helpers/xhr/MFA_REQUIRED_allFactors',
  'helpers/xhr/MFA_REQUIRED_oktaVerify',
  'helpers/xhr/MFA_CHALLENGE_duo',
  'helpers/xhr/MFA_CHALLENGE_sms',
  'helpers/xhr/MFA_CHALLENGE_push',
  'helpers/xhr/MFA_CHALLENGE_push_rejected',
  'helpers/xhr/MFA_CHALLENGE_push_timeout',
  'helpers/xhr/SUCCESS',
  'helpers/xhr/MFA_VERIFY_invalid_answer',
  'helpers/xhr/MFA_VERIFY_totp_invalid_answer',
  'helpers/xhr/SMS_RESEND_error',
  'helpers/xhr/MFA_LOCKED_FAILED_ATEMPTS'
],
function (Q, _, $, Duo, OktaAuth, LoginUtil, Util, MfaVerifyForm, Beacon, Expect, Router, RouterUtil, $sandbox,
          resAllFactors, resVerify, resChallengeDuo, resChallengeSms, resChallengePush,
          resRejectedPush, resTimeoutPush, resSuccess, resInvalid, resInvalidTotp,
          resResendError, resMfaLocked) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  describe('MFA Verify', function () {

    function setup(res, selectedFactorProps, settings) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({uri: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
      var router = new Router(_.extend({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: function () {}
      }, settings));
      Util.mockRouterNavigate(router);
      setNextResponse(res);
      router.refreshAuthState('dummy-token');
      return tick()
      .then(function () {
        if (selectedFactorProps) {
          var factors = router.appState.get('factors'),
              selectedFactor = factors.findWhere(selectedFactorProps),
              provider = selectedFactor.get('provider'),
              factorType = selectedFactor.get('factorType');
          if (provider === 'DUO' && factorType === 'web') {
            setNextResponse(resChallengeDuo);
            router.verifyDuo();
          }
          else {
            router.verify(selectedFactor.get('provider'), selectedFactor.get('factorType'));
          }
          return tick();
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
          setNextResponse: setNextResponse
        };
      });
    }

    var setupSecurityQuestion = _.partial(setup, resAllFactors, { factorType: 'question' });
    var setupGoogleTOTP = _.partial(setup, resAllFactors, { factorType: 'token:software:totp', provider: 'GOOGLE' });
    var setupRsaTOTP = _.partial(setup, resAllFactors, { factorType: 'token', provider: 'RSA' });
    var setupSymantecTOTP = _.partial(setup, resAllFactors, { factorType: 'token', provider: 'SYMANTEC' });
    var setupYubikey = _.partial(setup, resAllFactors, { factorType: 'token:hardware', provider: 'YUBICO' });
    var setupSMS = _.partial(setup, resAllFactors, { factorType: 'sms' });
    var setupOktaPush = _.partial(setup, resAllFactors, { factorType: 'push', provider: 'OKTA' });
    var setupOktaTOTP = _.partial(setup, resVerify, { factorType: 'token:software:totp' });

    // Mocks the right calls for Auth SDK's transactions handled in the widget
    function mockTransactions(controller, isTotp) {
      // Spy on backup factor model for TOTP, since TOTP is special
      var model = isTotp ? controller.model.get('backupFactor') : controller.model;
      spyOn(model, 'trigger').and.callThrough();
      spyOn(controller.options.appState, 'set').and.callThrough();
      spyOn(RouterUtil, 'routeAfterAuthStatusChange').and.callThrough();
    }

    // Expect -
    // 1. model triggers the setTransaction event
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
      expect(model.trigger).toHaveBeenCalledWith('setTransaction', mockTransaction);
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

    function setupDuo() {
      Util.mockDuo();
      return setup(resAllFactors, { factorType: 'web', provider: 'DUO' });
    }

    function setupWithFirstFactor(factorIdentifier) {
      var res = JSON.parse(JSON.stringify(resAllFactors));
      var factors = res.response._embedded.factors;
      var index = _.findIndex(factors, factorIdentifier);
      var factor = factors.splice(index,1);
      factors.unshift(factor[0]);
      return setup(res);
    }

    function setupPolling(test, finalResponse) {
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

    beforeEach(function () {
      $.fx.off = true;
    });
    afterEach(function () {
      $.fx.off = false;
      $sandbox.empty();
    });

    describe('General', function () {
      describe('Defaults to the last used factor', function () {
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
      });
    });

    describe('Factor types', function () {

      describe('Security Question', function () {
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
        itp('has an answer field', function () {
          return setupSecurityQuestion().then(function (test) {
            expectHasAnswerField(test, 'password');
          });
        });
        itp('has a show answer checkbox', function () {
          return setupSecurityQuestion().then(function (test) {
            var showAnswer = test.form.showAnswerCheckbox();
            expect(showAnswer.length).toBe(1);
            expect(showAnswer.attr('type')).toEqual('checkbox');
            expect(test.form.showAnswerLabelText()).toEqual('Show answer');
          });
        });
        itp('an answer field type is "password" initially and changed to text \
          when a "show answer" checkbox is checked', function () {
          return setupSecurityQuestion().then(function (test) {
            var answer = test.form.answerField();
            expect(test.form.showAnswerCheckboxStatus()).toEqual('unchecked');
            expect(answer.attr('type')).toEqual('password');
            test.form.setShowAnswer(true);
            expect(test.form.answerField().attr('type')).toEqual('text');
            test.form.setShowAnswer(false);
            expect(test.form.answerField().attr('type')).toEqual('password');
          });
        });
        itp('calls authClient verifyFactor with correct args when submitted', function () {
          return setupSecurityQuestion().then(function (test) {
            $.ajax.calls.reset();
            Util.mockCookie('ln', 'testuser');
            test.form.setAnswer('food');
            test.setNextResponse(resSuccess);
            test.form.submit();
            return tick();
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
        itp('calls authClient verifyFactor with correct args when logged in from a mobile device', function () {
          return setupSecurityQuestion({ features: { forceRememberDevice: true }})
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('food');
            test.setNextResponse(resSuccess);
            test.form.submit();
            return tick();
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
            Q.stopUnhandledRejectionTracking();
            $.ajax.calls.reset();
            test.form.setAnswer('who cares');
            test.setNextResponse(resInvalid);
            test.form.submit();
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).toContain('link-button-disabled');
            return tick(test);
          })
          .then(function (test) {
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).not.toContain('link-button-disabled');
          });
        });
        itp('shows an error if error response from authClient', function () {
          return setupSecurityQuestion()
          .then(function (test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resInvalid);
            test.form.setAnswer('wrong');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Your answer doesn\'t match our records. Please try again.');
          });
        });
        itp('sets the transaction on the appState on success response', function () {
          return setupSecurityQuestion({ features: { forceRememberDevice: true }})
          .then(function (test) {
            mockTransactions(test.router.controller);
            $.ajax.calls.reset();
            test.form.setAnswer('food');
            test.setNextResponse(resSuccess);
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expectSetTransaction(test.router, resSuccess);
          });
        });
        itp('sets the transaction error on the appState on error response', function () {
          return setupSecurityQuestion({ features: { forceRememberDevice: true }})
          .then(function (test) {
            Q.stopUnhandledRejectionTracking();
            mockTransactions(test.router.controller);
            $.ajax.calls.reset();
            test.form.setAnswer('food');
            test.setNextResponse(resInvalid);
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expectSetTransactionError(test.router, resInvalid);
          });
        });
      });

      describe('TOTP', function () {
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
        itp('shows the right beacon for Okta TOTP', function () {
          return setupOktaTOTP().then(function (test) {
            expectHasRightBeaconImage(test, 'mfa-okta-verify');
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
            expectHasAnswerField(test);
          });
        });
        itp('calls authClient verifyFactor with correct args when submitted', function () {
          return setupGoogleTOTP().then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('123456');
            test.setNextResponse(resSuccess);
            test.form.submit();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/ufthp18Zup4EGLtrd0g3/verify',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('disables the "verify button" when clicked', function () {
          return setupGoogleTOTP().then(function (test) {
            Q.stopUnhandledRejectionTracking();
            $.ajax.calls.reset();
            test.form.setAnswer('who cares');
            test.setNextResponse(resInvalid);
            test.form.submit();
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).toContain('link-button-disabled');
            return tick(test);
          })
          .then(function (test) {
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).not.toContain('link-button-disabled');
          });
        });
        itp('shows an error if error response from authClient', function () {
          return setupGoogleTOTP()
          .then(function (test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resInvalidTotp);
            test.form.setAnswer('wrong');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Invalid Passcode/Answer');
          });
        });
        itp('sets the transaction on the appState on success response', function () {
          return setupGoogleTOTP().then(function (test) {
            mockTransactions(test.router.controller);
            test.form.setAnswer('123456');
            test.setNextResponse(resSuccess);
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expectSetTransaction(test.router, resSuccess);
          });
        });
        itp('sets the transaction error on the appState on error response', function () {
          return setupGoogleTOTP().then(function (test) {
            Q.stopUnhandledRejectionTracking();
            mockTransactions(test.router.controller);
            test.setNextResponse(resInvalidTotp);
            test.form.setAnswer('wrong');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expectSetTransactionError(test.router, resInvalidTotp);
          });
        });
      });

      describe('Yubikey', function () {
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
        itp('disables the "verify button" when clicked', function () {
          return setupYubikey().then(function (test) {
            Q.stopUnhandledRejectionTracking();
            $.ajax.calls.reset();
            test.form.setAnswer('who cares');
            test.setNextResponse(resInvalid);
            test.form.submit();
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).toContain('link-button-disabled');
            return tick(test);
          })
          .then(function (test) {
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).not.toContain('link-button-disabled');
          });
        });
        itp('calls authClient verifyFactor with correct args when submitted', function () {
          return setupYubikey().then(function (test) {
            $.ajax.calls.reset();
            test.form.setAnswer('123456');
            test.setNextResponse(resSuccess);
            test.form.submit();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/ykf2l0aUIe5VBplDj0g4/verify',
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
            return tick(test);
          })
          .then(function (test) {
            expectSetTransaction(test.router, resSuccess);
          });
        });
        itp('sets the transaction error on the appState on error response', function () {
          return setupYubikey().then(function (test) {
            Q.stopUnhandledRejectionTracking();
            mockTransactions(test.router.controller);
            test.setNextResponse(resInvalid);
            test.form.setAnswer('wrong');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expectSetTransactionError(test.router, resInvalid);
          });
        });
      });

      describe('SMS', function () {
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
            expectHasAnswerField(test);
          });
        });
        itp('clears the passcode text field on clicking the "Send code" button', function () {
          return setupSMS().then(function (test) {
            Q.stopUnhandledRejectionTracking();
            test.button = test.form.smsSendCode();
            test.form.setAnswer('123456');
            test.setNextResponse(resChallengeSms);
            expect(test.button.trimmedText()).toEqual('Send code');
            expect(test.form.answerField().val()).toEqual('123456');
            test.form.smsSendCode().click();
            return tick().then(function () {
              expect(test.button.trimmedText()).toEqual('Sent');
              expect(test.form.answerField().val()).toEqual('');
              var button = test.form.submitButton();
              var buttonClass = button.attr('class');
              expect(buttonClass).not.toContain('link-button-disabled');
              return test;
            });
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
              url: 'https://foo.com/api/v1/authn/factors/smshp9NXcoXu8z2wN0g3/verify',
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
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/smshp9NXcoXu8z2wN0g3/verify',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('temporarily disables the send code button before displaying re-send \
              to avoid exceeding the rate limit', function () {
          var deferred = Q.defer();
          spyOn(Q, 'delay').and.callFake(function () {
            return deferred.promise;
          });

          return setupSMS().then(function (test) {
            Q.stopUnhandledRejectionTracking();
            test.button = test.form.smsSendCode();
            expect(test.button.trimmedText()).toEqual('Send code');
            test.setNextResponse(resChallengeSms);
            test.form.smsSendCode().click();
            return tick().then(function () {
              expect(test.button.trimmedText()).toEqual('Sent');
              deferred.resolve();
              return test;
            });
          }).then(function (test) {
            return tick().then(function () {
              expect(test.button.length).toBe(1);
              expect(test.button.trimmedText()).toEqual('Re-send code');
            });
          });
        });
        itp('displays only one error block if got an error resp on "Send code"', function () {
          var deferred = Q.defer();
          spyOn(Q, 'delay').and.callFake(function () {
            return deferred.promise;
          });
          return setupSMS().then(function (test) {
            Q.stopUnhandledRejectionTracking();
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
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resMfaLocked);
            test.form.setAnswer('12345');
            test.form.submit();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorBox().length).toBe(1);
            expect(test.form.errorMessage()).toBe('Your account was locked due to excessive MFA attempts.');
          });
        });
        itp('hides error messages after clicking on send sms', function () {
          return setupSMS().then(function (test) {
            Q.stopUnhandledRejectionTracking();
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

      describe('Okta Push', function () {
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
        describe('Push', function () {
          itp('shows a title that includes the device name', function () {
            return setupOktaPush().then(function (test) {
              expect(test.form[0].titleText()).toBe('Okta Verify (Reman\'s iPhone)');
              expect(test.form[1].titleText()).toBe('');
            });
          });
          itp('calls authClient verifyFactor with correct args when submitted', function () {
            return setupOktaPush().then(function (test) {
              $.ajax.calls.reset();
              Util.mockCookie('ln', 'testuser');
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
          describe('polling', function () {
            itp('will pass rememberMe on the first request', function () {
              return setupOktaPush().then(function (test) {
                Util.mockCookie('ln', 'testuser');
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
            itp('will disable form submit', function () {
              return setupOktaPush().then(function (test) {
                return setupPolling(test, resSuccess)
                .then(function () {
                  expect(test.form.submitButton().attr('class')).toMatch('link-button-disabled');
                  $.ajax.calls.reset();
                  test.form.submit();
                  return tick(test); // Final tick - SUCCESS
                })
                .then(function () {
                  expect($.ajax.calls.count()).toBe(0);
                });
              });
            });
            itp('on SUCCESS, polling stops and form is submitted', function () {
              return setupOktaPush().then(function (test) {
                spyOn(test.router.settings, 'callGlobalSuccess');
                return setupPolling(test, resSuccess)
                .then(function () { return tick(test); }) // Final tick - SUCCESS
                .then(function () {
                  expect(test.router.settings.callGlobalSuccess).toHaveBeenCalled();
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
                var failureResponse = {status: 0, response: {}};
                $.ajax.calls.reset();
                Util.speedUpPolling(test.ac);
                test.setNextResponse([resChallengePush, resChallengePush, failureResponse, failureResponse,
                  failureResponse, failureResponse, failureResponse, failureResponse]);
                test.form = test.form[0];
                test.form.submit();
                return tick(test)    // 1: submit verifyFactor
                    .then(function () { return tick(test); }) // 2: submit verifyFactor poll
                    .then(function () { return tick(test); }); // 3: Failure requests
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
          });

          // Do this when we have implemented push errors in OktaAuth and have an example
          xit('shows an error if error response from authClient');
        });
        describe('TOTP', function () {
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
              Expect.isTextField(form.answerField());
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
                url: 'https://foo.com/api/v1/authn/factors/osthw62MEvG6YFuHe0g3/verify',
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

      describe('Duo', function () {
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
        itp('makes the right init request', function () {
          return setupDuo().then(function () {
            expect($.ajax.calls.count()).toBe(2);
            Expect.isJsonPost($.ajax.calls.argsFor(1), {
              url: 'https://foo.com/api/v1/authn/factors/ost947vv5GOSPjt9C0g4/verify',
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
            return tick();
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
    });

    describe('Beacon', function () {
      itp('has no dropdown if there is only one factor', function () {
        return setup(resVerify).then(function (test) {
          var options = test.beacon.getOptionsLinks();
          expect(options.length).toBe(0);
        });
      });
      itp('has a dropdown if there is more than one factor', function () {
        return setup(resAllFactors).then(function (test) {
          var options = test.beacon.getOptionsLinks();
          expect(options.length).toBe(8);
        });
      });
      itp('shows the right options in the dropdown, removes okta totp if ' +
         'okta push exists, and orders factors by security', function () {
        return setup(resAllFactors).then(function (test) {
          var options = test.beacon.getOptionsLinksText();
          expect(options).toEqual([
            'Okta Verify', 'Google Authenticator', 'Symantec VIP',
            'RSA SecurID', 'Duo Security', 'Yubikey', 'SMS Authentication',
            'Security Question'
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
          test.beacon.getOptionsLinks().eq(1).click();
          return tick(test);
        })
        .then(function (test) {
          expectHasRightBeaconImage(test, 'mfa-google-auth');
        });
      });
      itp('changes selectedFactor if option is chosen', function () {
        return setup(resAllFactors).then(function (test) {
          test.beacon.dropDownButton().click();
          test.beacon.getOptionsLinks().eq(1).click();
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
          test.beacon.getOptionsLinks().eq(4).click();
          return tick(test);
        })
        .then(function (test) {
          test.setNextResponse(resAllFactors);
          test.beacon.dropDownButton().click();
          test.beacon.getOptionsLinks().eq(1).click();
          return tick(test);
        })
        .then(function (test) {
          expect(test.router.navigate)
            .toHaveBeenCalledWith('signin/verify/google/token%3Asoftware%3Atotp', { trigger: true });
        });
      });
    });

    describe('Switch between different factors and verify a factor', function () {
      itp('Verify Security Question after switching from SMS MFA_CHALLENGE', function () {
        return setupSMS().then(function (test) {
          test.setNextResponse(resChallengeSms);
          test.form.smsSendCode().click();
          return tick(test);
        })
        .then(function (test) {
          test.setNextResponse(resAllFactors);
          test.beacon.dropDownButton().click();
          test.beacon.getOptionsLinks().eq(7).click();
          return tick(test);
        })
        .then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          // We cannot use test.form here since refers to SMS form,
          // so query for the security question form.
          test.questionForm = new MfaVerifyForm($sandbox.find('.o-form'));
          test.questionForm.setAnswer('food');
          test.questionForm.submit();
          return tick(test);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/factors/ufshpdkgNun3xNE3W0g3/verify',
            data: {
              answer: 'food',
              stateToken: 'testStateToken'
            }
          });
        });
      });
      itp('Verify Google TOTP after switching from Push MFA_CHALLENGE', function () {
        return setupOktaPush().then(function (test) {
          return setupPolling(test, resAllFactors)
          .then(function (test) {
            test.beacon.dropDownButton().click();
            test.beacon.getOptionsLinks().eq(1).click();
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
              url: 'https://foo.com/api/v1/authn/factors/ufthp18Zup4EGLtrd0g3/verify',
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
          return setupPolling(test, resAllFactors)
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.totpForm = new MfaVerifyForm($($sandbox.find('.o-form')[1]));
            // click or enter code in the the Totp form
            test.totpForm.inlineTOTPAdd().click();
            test.totpForm.setAnswer('654321');
            test.totpForm.inlineTOTPVerify().click();
            return tick(test);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/osthw62MEvG6YFuHe0g3/verify',
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
              url: 'https://foo.com/api/v1/authn/factors/osthw62MEvG6YFuHe0g3/verify',
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
    });

  });

});
