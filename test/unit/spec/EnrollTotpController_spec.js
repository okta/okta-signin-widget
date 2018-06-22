/* eslint max-params: [2, 26] */
define([
  'okta/underscore',
  'okta/jquery',
  'vendor/lib/q',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'shared/util/StringUtil',
  'helpers/mocks/Util',
  'helpers/dom/EnrollTotpDeviceTypeForm',
  'helpers/dom/EnrollTotpBarcodeForm',
  'helpers/dom/EnrollTotpManualSetupForm',
  'helpers/dom/EnrollTotpPassCodeForm',
  'helpers/dom/EnrollPushLinkSentForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'sandbox',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_push',
  'helpers/xhr/MFA_ENROLL_totp_success',
  'helpers/xhr/MFA_ENROLL_push_success',
  'helpers/xhr/MFA_ENROLL_push_success_newqr',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_totp_error',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_push_email',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_push_sms',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_push_timeout',
  'helpers/xhr/SUCCESS',
  'LoginRouter'
],
function (_, $, Q, OktaAuth, LoginUtil, StringUtil, Util, DeviceTypeForm, BarcodeForm,
          ManualSetupForm, PassCodeForm, LinkSentConfirmation,  Beacon, Expect,
          $sandbox, resAllFactors, resFactorsWithPush, resTotpEnrollSuccess,
          resPushEnrollSuccess, resPushEnrollSuccessNewQR, resActivateError, resActivatePushEmail,
          resActivatePushSms, resActivatePushTimeout, resSuccess, Router) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  Expect.describe('EnrollTotp', function () {

    function setup(res, selectedFactor, settings, startRouter) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});

      var router = new Router(_.extend({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        'features.router': startRouter
      }, settings));
      Util.registerRouter(router);
      Util.mockRouterNavigate(router, startRouter);

      return tick()
      .then(function () {
        setNextResponse(res);
        router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollChoices();
      })
      .then(function () {
        router.enrollTotpFactor(selectedFactor.provider, selectedFactor.factorType);
        return Expect.waitForEnrollTotp({
          router: router,
          beacon: new Beacon($sandbox),
          form: new DeviceTypeForm($sandbox),
          scanCodeForm: new BarcodeForm($sandbox),
          manualSetupForm: new ManualSetupForm($sandbox),
          passCodeForm: new PassCodeForm($sandbox),
          linkSentConfirmation: new LinkSentConfirmation($sandbox),
          ac: authClient,
          setNextResponse: setNextResponse
        });
      });
    }

    var setupOktaTotp = _.partial(setup, resAllFactors, {
      provider: 'okta',
      factorType: 'token:software:totp'
    });

    var setupGoogleTotp = _.partial(setup, resAllFactors, {
      provider: 'google',
      factorType: 'token:software:totp'
    });

    var setupOktaPush = _.partial(setup, resFactorsWithPush, {
      provider: 'okta',
      factorType: 'push'
    });

    function enrollFactor(test, res) {
      test.setNextResponse(res || resTotpEnrollSuccess);
      test.form.selectDeviceType('APPLE');
      test.form.submit();
      return test;
    }

    function setupAndEnrollOktaTotp() {
      return setupOktaTotp()
      .then(function (test) {
        return enrollFactor(test, resTotpEnrollSuccess);
      })
      .then(function (test) {
        return Expect.waitForBarcodeTotp(test);
      });
    }

    function setupAndEnrollGoogleTotp() {
      return setupGoogleTotp()
      .then(function (test) {
        return enrollFactor(test, resTotpEnrollSuccess);
      })
      .then(function (test) {
        return Expect.waitForBarcodeTotp(test);
      });
    }

    function setupAndEnrollOktaPush() {
      return setupOktaPush()
      .then(function (test) {
        test.originalAjax = Util.stallEnrollFactorPoll(test.ac);
        return enrollFactor(test, resPushEnrollSuccess);
      })
      .then(function (test) {
        return Expect.waitForBarcodePush(test);
      });
    }

    function enrollOktaPushGoCannotScan() {
      return setupAndEnrollOktaPush()
      .then(function (test) {
        test.scanCodeForm.clickManualSetupLink();
        return Expect.waitForManualSetupPush(test);
      });
    }

    function enrollOktaPushUseManualTotp() {
      return enrollOktaPushGoCannotScan()
      .then(function (test) {
        test.setNextResponse([resAllFactors, resTotpEnrollSuccess]);
        test.manualSetupForm.selectManualOption();
        return test.manualSetupForm.waitForManual(test);
      });
    }

    Expect.describe('Header & Footer', function () {
      itp('displays the correct factorBeacon for Okta Verify', function () {
        return setupOktaTotp().then(function (test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-okta-verify')).toBe(true);
        });
      });
      itp('displays the correct factorBeacon for Google Authenticator', function () {
        return setupGoogleTotp().then(function (test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-google-auth')).toBe(true);
        });
      });
      itp('has a "back" link in the footer', function () {
        return setupOktaTotp().then(function (test) {
          Expect.isVisible(test.form.backLink());
        });
      });
    });

    Expect.describe('Enroll factor', function () {
      itp('has correct device type options for Okta Verify', function () {
        return setupOktaTotp().then(function (test) {
          expect(test.form.deviceTypeOptions().length).toBe(2);
          expect(test.form.deviceTypeOptionLabel('APPLE').length).toBe(1);
          expect(test.form.deviceTypeOptionLabel('ANDROID').length).toBe(1);
          expect(test.form.deviceTypeOptionLabel('WINDOWS').length).toBe(0);
          expect(test.form.deviceTypeOptionLabel('BLACKBERRY').length).toBe(0);
        });
      });
      itp('has Windows Phone option for Okta Verify when feature is on', function () {
        return setupOktaTotp({'features.windowsVerify': true}).then(function (test) {
          expect(test.form.deviceTypeOptions().length).toBe(3);
          expect(test.form.deviceTypeOptionLabel('APPLE').length).toBe(1);
          expect(test.form.deviceTypeOptionLabel('ANDROID').length).toBe(1);
          expect(test.form.deviceTypeOptionLabel('WINDOWS').length).toBe(1);
          expect(test.form.deviceTypeOptionLabel('BLACKBERRY').length).toBe(0);
        });
      });
      itp('has correct device type options for Google Authenticator', function () {
        return setupGoogleTotp().then(function (test) {
          expect(test.form.deviceTypeOptions().length).toBe(3);
          expect(test.form.deviceTypeOptionLabel('APPLE').length).toBe(1);
          expect(test.form.deviceTypeOptionLabel('ANDROID').length).toBe(1);
          expect(test.form.deviceTypeOptionLabel('WINDOWS').length).toBe(0);
          expect(test.form.deviceTypeOptionLabel('BLACKBERRY').length).toBe(1);
        });
      });
      itp('has app download instructions not displayed until device type is selected', function () {
        return setupOktaTotp().then(function (test) {
          Expect.isNotVisible(test.form.appDownloadInstructions());
        });
      });
      itp('has app download instructions displayed when device type is selected', function () {
        return setupOktaTotp().then(function (test) {
          test.form.selectDeviceType('APPLE');
          Expect.isVisible(test.form.appDownloadInstructions());
        });
      });
      itp('has correct app download instructions displayed for Okta Verify', function () {
        return setupOktaTotp().then(function (test) {
          test.form.selectDeviceType('APPLE');
          expect(test.form.appDownloadInstructionsLinkText()).toEqual('Okta Verify from the App Store');
          expect(test.form.appDownloadInstructionsAppLogo('.okta-verify-38').length).toBe(1);
          test.form.selectDeviceType('ANDROID');
          expect(test.form.appDownloadInstructionsLinkText()).toEqual('Okta Verify from the Google Play Store');
        });
      });
      itp('has correct app download instructions displayed for Google Auth', function () {
        return setupGoogleTotp().then(function (test) {
          test.form.selectDeviceType('APPLE');
          expect(test.form.appDownloadInstructionsLinkText())
            .toEqual('Google Authenticator from the App Store');
          expect(test.form.appDownloadInstructionsAppLogo('.google-auth-38').length).toBe(1);
          test.form.selectDeviceType('ANDROID');
          expect(test.form.appDownloadInstructionsLinkText())
            .toEqual('Google Authenticator from the Google Play Store');
        });
      });
      itp('has a next button not displayed until device type is selected', function () {
        return setupOktaTotp().then(function (test) {
          Expect.isNotVisible(test.form.submitButton());
        });
      });
      itp('has a next button displayed when device type is selected', function () {
        return setupOktaTotp().then(function (test) {
          test.form.selectDeviceType('APPLE');
          Expect.isVisible(test.form.submitButton());
        });
      });
      itp('returns to factor list when browser\'s back button is clicked', function () {
        return setupOktaTotp({}, true)
        .then(function (test) {
          Util.triggerBrowserBackButton();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function (test) {
          Expect.isEnrollChoices(test.router.controller);
          Util.stopRouter();
        });
      });
      itp('sends enroll request with correct params for Okta totp', function () {
        return setupAndEnrollOktaTotp().then(function () {
          expect($.ajax.calls.count()).toBe(2);
          Expect.isJsonPost($.ajax.calls.argsFor(1), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'token:software:totp',
              provider: 'OKTA',
              stateToken: 'testStateToken'
            }
          });
        });
      });
      itp('sends enroll request with correct params for Google totp', function () {
        return setupAndEnrollGoogleTotp().then(function () {
          expect($.ajax.calls.count()).toBe(2);
          Expect.isJsonPost($.ajax.calls.argsFor(1), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'token:software:totp',
              provider: 'GOOGLE',
              stateToken: 'testStateToken'
            }
          });
        });
      });
    });

    Expect.describe('Scan qrcode', function () {
      itp('has qrcode image', function () {
        return setupAndEnrollOktaTotp().then(function (test) {
          expect(test.scanCodeForm.qrcodeImg().length).toBe(1);
          // Note: Modifying API qr code return image with something we can load locally
          expect(test.scanCodeForm.qrcodeImg().attr('src'))
            .toEqual('../../../test/unit/assets/1x1.gif');
        });
      });
      itp('has a link to setup app manually', function () {
        return setupAndEnrollOktaTotp().then(function (test) {
          Expect.isVisible(test.scanCodeForm.manualSetupLink());
        });
      });
      itp('has "Next" button', function () {
        return setupAndEnrollOktaTotp().then(function (test) {
          Expect.isVisible(test.scanCodeForm.submitButton());
        });
      });
      itp('returns to factor list when browser\'s back button is clicked', function () {
        return setupOktaTotp({}, true)
        .then(function (test) {
          return enrollFactor(test, resTotpEnrollSuccess);
        })
        .then(function (test) {
          return Expect.waitForBarcodeTotp(test);
        })
        .then(function (test) {
          test.setNextResponse(resAllFactors);
          Util.triggerBrowserBackButton();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function (test) {
          Expect.isEnrollChoices(test.router.controller);
          Util.stopRouter();
        });
      });

      Expect.describe('Manual setup', function () {
        itp('is rendered on "Can\'t scan" link click', function () {
          return setupAndEnrollOktaTotp()
          .then(function (test) {
            test.scanCodeForm.clickManualSetupLink();
            return Expect.waitForManualSetupTotp(test);
          })
          .then(function (test) {
            Expect.isVisible(test.manualSetupForm.form());
            Expect.isVisible(test.manualSetupForm.sharedSecretField());
            expect(test.manualSetupForm.sharedSecretFieldValue()).toEqual('superSecretSharedSecret');
            Expect.isVisible(test.manualSetupForm.gotoScanBarcodeLink());
          });
        });
        itp('renders pass code form on "Next" button click', function () {
          return setupAndEnrollOktaTotp()
          .then(function (test) {
            test.scanCodeForm.clickManualSetupLink();
            return Expect.waitForManualSetupTotp(test);
          })
          .then(function (test) {
            Expect.isVisible(test.manualSetupForm.form());
            test.manualSetupForm.submit();
            return Expect.waitForActivateTotp(test);
          })
          .then(function (test) {
            Expect.isVisible(test.passCodeForm.form());
            Expect.isVisible(test.passCodeForm.codeField());
            expect(test.passCodeForm.codeField().attr('type')).toBe('tel');
          });
        });
        itp('returns to factor list when browser\'s back button is clicked', function () {
          return setupOktaTotp({}, true)
          .then(function (test) {
            return enrollFactor(test, resTotpEnrollSuccess);
          })
          .then(function (test) {
            return Expect.waitForBarcodeTotp(test);
          })
          .then(function (test) {
            test.scanCodeForm.clickManualSetupLink();
            return Expect.waitForManualSetupTotp(test);
          })
          .then(function (test) {
            test.setNextResponse(resAllFactors);
            Util.triggerBrowserBackButton();
            return Expect.waitForEnrollChoices(test);
          })
          .then(function (test) {
            Expect.isEnrollChoices(test.router.controller);
            Util.stopRouter();
          });
        });
        itp('refreshes authStatus and goes back to scan barcode screen on "Scan barcode" link click', function () {
          return setupAndEnrollOktaTotp().then(function (test) {
            $.ajax.calls.reset();
            test.scanCodeForm.clickManualSetupLink();
            return Expect.waitForManualSetupTotp(test);
          })
          .then(function (test) {
            Expect.isVisible(test.manualSetupForm.form());
            test.setNextResponse(resTotpEnrollSuccess);
            Util.mockSDKCookie(test.ac);
            test.manualSetupForm.gotoScanBarcode();
            return Expect.waitForBarcodeTotp(test);
          })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn',
              data: { stateToken: 'testStateToken' }
            });
            Expect.isVisible(test.scanCodeForm.form());
          });
        });
      });

      Expect.describe('Pass code form', function () {
        itp('renders pass code form on "Next" button click', function () {
          return setupAndEnrollOktaTotp().then(function (test) {
            test.scanCodeForm.submit();
            return Expect.waitForActivateTotp(test);
          })
          .then(function (test) {
            Expect.isVisible(test.passCodeForm.form());
            Expect.isVisible(test.passCodeForm.codeField());
            expect(test.passCodeForm.codeField().attr('type')).toBe('tel');
          });
        });
        itp('shows error in case of an error response', function () {
          return setupAndEnrollOktaTotp().then(function (test) {
            test.scanCodeForm.submit();
            return Expect.waitForActivateTotp(test);
          })
          .then(function (test) {
            Expect.isVisible(test.passCodeForm.form());
            test.setNextResponse(resActivateError);
            test.passCodeForm.setCode(123);
            test.passCodeForm.submit();
            return tick(test);
          })
          .then(function (test) {
            expect(test.passCodeForm.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Api validation failed: factorEnrollRequest');
          });
        });
        itp('calls activate with the right params', function () {
          return setupAndEnrollOktaTotp().then(function (test) {
            $.ajax.calls.reset();
            test.scanCodeForm.submit();
            return Expect.waitForActivateTotp(test);
          })
          .then(function (test) {
            Expect.isVisible(test.passCodeForm.form());
            test.passCodeForm.setCode(123456);
            test.setNextResponse(resSuccess);
            test.passCodeForm.submit();
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/id1234/lifecycle/activate',
              data: {
                passCode: '123456',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('returns to factor list when browser\'s back button is clicked', function () {
          return setupOktaTotp({}, true)
          .then(function (test) {
            return enrollFactor(test, resTotpEnrollSuccess);
          })
          .then(function (test) {
            return Expect.waitForBarcodeTotp(test);
          })
          .then(function (test) {
            test.scanCodeForm.submit();
            return Expect.waitForActivateTotp(test);
          })
          .then(function (test) {
            test.setNextResponse(resAllFactors);
            Util.triggerBrowserBackButton();
            return Expect.waitForEnrollChoices(test);
          })
          .then(function (test) {
            Expect.isEnrollChoices(test.router.controller);
            Util.stopRouter();
          });
        });
      });
    });

    Expect.describe('Okta Verify with Push', function () {
      function setupPolling(test, finalResponse) {
        $.ajax.calls.reset();

        // Mock calls to startVerifyFactorPoll to include a faster poll
        Util.speedUpPolling(test.ac);

        // 1: Set for first enrollFactor
        // 2: Set for startEnrollFactorPoll
        // 3: Set for EnrollFactor poll finish
        test.setNextResponse([resActivatePushSms, resActivatePushSms, finalResponse]);

        // Start the enrollment
        test.form.selectDeviceType('APPLE');
        test.form.submit();

        return tick(test)    // 1: submit enrollFactor
          .then(function () { return tick(test); }) // 2: submit enrollFactor poll
          .then(function () { return tick(test); }); // Final response tick
      }
      itp('has qrcode image', function () {
        return setupAndEnrollOktaPush().then(function (test) {
          expect(test.scanCodeForm.qrcodeImg().length).toBe(1);
          expect(test.scanCodeForm.qrcodeImg().attr('src'))
            .toEqual('../../../test/unit/assets/1x1.gif');
        });
      });
      itp('has a link to setup app manually', function () {
        return setupAndEnrollOktaPush().then(function (test) {
          Expect.isVisible(test.scanCodeForm.manualSetupLink());
        });
      });
      itp('does not have "Next" button', function () {
        return setupAndEnrollOktaPush().then(function (test) {
          expect(test.scanCodeForm.submitButton().length).toBe(0);
        });
      });
      itp('removes the scan code form on clicking "Back to factor list" link', function () {
        return setupOktaPush().then(function (test) {
          return setupPolling(test, resSuccess);
        })
        .then(function(test) {
          test.scanCodeForm.clickBackLink();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function (test) {
          expect(test.scanCodeForm.container().length).toBe(0);
        });
      });
      itp('removes the scan code form on clicking "Can\'t scan" link', function () {
        return setupOktaPush().then(function (test) {
          return setupPolling(test, resSuccess);
        })
        .then(function(test) {
          test.scanCodeForm.clickManualSetupLink();
          return Expect.waitForManualSetupPush(test);
        })
        .then(function (test) {
          expect(test.scanCodeForm.container().length).toBe(0);
        });
      });
      itp('returns to factor list when browser\'s back button is clicked', function () {
        return setupOktaPush({}, true).then(function (test) {
          return setupPolling(test, resSuccess);
        })
        .then(function (test) {
          Util.triggerBrowserBackButton();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function (test) {
          Expect.isEnrollChoices(test.router.controller);
          Util.stopRouter();
        });
      });
      itp('polls until SUCCESS when submitted', function () {
        return setupOktaPush().then(function (test) {
          return setupPolling(test, resSuccess);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(3);

          // initial enrollFactor call
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              'factorType': 'push',
              'provider': 'OKTA',
              'stateToken': 'testStateToken'
            }
          });

          // first startEnrollFactorPoll call
          Expect.isJsonPost($.ajax.calls.argsFor(1), {
            url: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate/poll',
            data: {
              stateToken: 'testStateToken'
            }
          });

          // last startEnrollFactorPoll call
          Expect.isJsonPost($.ajax.calls.argsFor(2), {
            url: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate/poll',
            data: {
              stateToken: 'testStateToken'
            }
          });
        });
      });
      itp('shows "Refresh code" link if got network error while polling', function () {
        // Simulate polling with Auth SDK's exponential backoff (6 failed requests)
        function setupFailurePolling(test) {
          var failureResponse = {status: 0, response: {}};
          Util.speedUpPolling(test.ac);
          test.setNextResponse([resActivatePushSms, resActivatePushSms,
            failureResponse, failureResponse, failureResponse, failureResponse, failureResponse, failureResponse]);
          test.form.selectDeviceType('APPLE');
          test.form.submit();
          return tick(test)    // 1: submit enrollFactor
              .then(function () { return tick(test); }) // 2: submit enrollFactor poll
              .then(function () { return tick(test); }) // 3: Failure requests
              .then(function () { return tick(test); }); // 4: Error from Auth SDK
        }
        return setupOktaPush().then(function (test) {
          spyOn(test.router.settings, 'callGlobalError');
          return setupFailurePolling(test);
        })
        .then(function (test) {
          return test.scanCodeForm.waitForRefreshQrcodeLink(test);
        })
        .then(function (test) {
          expect($.ajax.calls.count()).toBe(9);
          expect(test.scanCodeForm.hasManualSetupLink()).toBe(false);
          expect(test.scanCodeForm.hasRefreshQrcodeLink()).toBe(true);
          expect(test.scanCodeForm.hasErrors()).toBe(true);
          expect(test.scanCodeForm.errorMessage())
            .toEqual(StringUtil.localize('error.network.connection', 'login'));

          // on "Refresh code" link click
          // it sends reactivation request and starts polling again
          $.ajax.calls.reset();
          test.setNextResponse([resActivatePushSms, resSuccess]);
          test.scanCodeForm.clickrefreshQrcodeLink();
          return tick(test);
        })
        .then(function (test) {
          // errors cleared
          expect(test.scanCodeForm.hasErrors()).toBe(false);

          // the error was raised
          expect(test.router.settings.callGlobalError.calls.count()).toBe(1);

          // polled until success
          expect($.ajax.calls.count()).toBe(2);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate/poll',
            data: {
              'stateToken': 'testStateToken'
            }
          });

          Expect.isJsonPost($.ajax.calls.argsFor(1), {
            url: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate/poll',
            data: {
              stateToken: 'testStateToken'
            }
          });
        });
      });
      itp('allows refresh after TIMEOUT', function () {
        return setupOktaPush().then(function (test) {
          $.ajax.calls.reset();
          Util.speedUpPolling(test.ac);

          // 1: Set for first enrollFactor
          // 2: Set for activateFactor
          // 3: Set for second enrollFactor
          test.setNextResponse([resActivatePushSms, resActivatePushTimeout, resActivatePushSms]);

          // Start the enrollment
          test.form.selectDeviceType('APPLE');
          test.form.submit();

          return tick()       // 1: submit enrollFactor
                .then(tick)   // 2: submit enrollFactor poll
                .then(function() {
                  return test;
                });
        })
        .then(function (test) {
          // After TIMEOUT, refresh the QR code
          Expect.isVisible(test.scanCodeForm.refreshLink());
          test.scanCodeForm.clickRefreshLink();
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(3);

          // initial enrollFactor call
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              'factorType': 'push',
              'provider': 'OKTA',
              'stateToken': 'testStateToken'
            }
          });

          // first startEnrollFactorPoll call
          Expect.isJsonPost($.ajax.calls.argsFor(1), {
            url: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate/poll',
            data: {
              stateToken: 'testStateToken'
            }
          });

          // last startEnrollFactorPoll call
          Expect.isJsonPost($.ajax.calls.argsFor(2), {
            url: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate',
            data: {
              stateToken: 'testStateToken'
            }
          });
        });
      });

      Expect.describe('Manual setup', function () {
        itp('is rendered on "Can\'t scan" link click', function () {
          return enrollOktaPushGoCannotScan()
          .then(function (test) {
            Expect.isVisible(test.manualSetupForm.form());
            Expect.isVisible(test.manualSetupForm.dropdownElement());
            Expect.isVisible(test.manualSetupForm.gotoScanBarcodeLink());
          });
        });
        itp('has correct fields displayed when different dropdown options selected', function () {
          return enrollOktaPushGoCannotScan()
          .then(function (test) {
            return test.manualSetupForm.waitForDropdownElement(test);
          })
          .then(function (test) {
            return test.manualSetupForm.waitForCountryCodeSelect(test);
          })
          .then(function (test) {
            Expect.isVisible(test.manualSetupForm.dropdownElement());
            // sms (default)
            Expect.isVisible(test.manualSetupForm.countryCodeSelect());
            Expect.isVisible(test.manualSetupForm.phoneNumberField());
            Expect.isNotVisible(test.manualSetupForm.sharedSecretField());
            Expect.isVisible(test.manualSetupForm.submitButton());
            Expect.isNotVisible(test.manualSetupForm.nextButton());
            test.manualSetupForm.selectEmailOption();
            return test.manualSetupForm.waitForEmail(test);
          })
          .then(function (test) {
            // email option
            Expect.isNotVisible(test.manualSetupForm.countryCodeSelect());
            Expect.isNotVisible(test.manualSetupForm.phoneNumberField());
            Expect.isNotVisible(test.manualSetupForm.sharedSecretField());
            Expect.isVisible(test.manualSetupForm.submitButton());
            Expect.isNotVisible(test.manualSetupForm.nextButton());
            test.setNextResponse(resTotpEnrollSuccess);
            test.setNextResponse(resAllFactors);
            test.manualSetupForm.selectManualOption();
            return test.manualSetupForm.waitForManual(test);
          })
          .then(function (test) {
            // manual option
            Expect.isNotVisible(test.manualSetupForm.countryCodeSelect());
            Expect.isNotVisible(test.manualSetupForm.phoneNumberField());
            Expect.isVisible(test.manualSetupForm.sharedSecretField());
            Expect.isNotVisible(test.manualSetupForm.submitButton());
            Expect.isVisible(test.manualSetupForm.nextButton());
          });
        });
        itp('returns to factor list when browser\'s back button is clicked', function () {
          return setupOktaPush({}, true)
          .then(function (test) {
            test.originalAjax = Util.stallEnrollFactorPoll(test.ac);
            return enrollFactor(test, resPushEnrollSuccess);
          })
          .then(function (test) {
            return Expect.waitForBarcodePush(test);
          })
          .then(function (test) {
            test.scanCodeForm.clickManualSetupLink();
            return Expect.waitForManualSetupPush(test);
          })
          .then(function (test) {
            test.setNextResponse(resAllFactors);
            Util.triggerBrowserBackButton();
            return Expect.waitForEnrollChoices(test);
          })
          .then(function (test) {
            Expect.isEnrollChoices(test.router.controller);
            Util.stopRouter();
          });
        });
        itp('goes to previous link and then enrolls in totp when choosing manual', function () {
          return enrollOktaPushUseManualTotp()
          .then(function () {
            expect($.ajax.calls.count()).toBe(4);
            Expect.isJsonPost($.ajax.calls.argsFor(2), {
              url: 'https://foo.com/api/v1/authn/previous',
              data: { stateToken: 'testStateToken' }
            });
            Expect.isJsonPost($.ajax.calls.argsFor(3), {
              url: 'https://foo.com/api/v1/authn/factors',
              data: {
                factorType: 'token:software:totp',
                provider: 'OKTA',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('goes to previous link and enrolls in push when coming from manual', function () {
          return enrollOktaPushUseManualTotp()
          .then(function (test) {
            $.ajax.calls.reset();
            expect(test.manualSetupForm.sharedSecretFieldValue()).toEqual('superSecretSharedSecret');
            test.setNextResponse([resFactorsWithPush, resPushEnrollSuccess]);
            test.manualSetupForm.selectSmsOption();
            return test.manualSetupForm.waitForSms(test);
          })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(2);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/previous',
              data: { stateToken: 'testStateToken' }
            });
            Expect.isJsonPost($.ajax.calls.argsFor(1), {
              url: 'https://foo.com/api/v1/authn/factors',
              data: {
                factorType: 'push',
                provider: 'OKTA',
                stateToken: 'testStateToken'
              }
            });
            expect(test.manualSetupForm.sharedSecretFieldValue()).toEqual('');
          });
        });
        itp('does not do re-enroll when switches between sms and email options', function () {
          return enrollOktaPushGoCannotScan()
          .then(function (test) {
            $.ajax.calls.reset();
            test.manualSetupForm.selectEmailOption();
            return test.manualSetupForm.waitForEmail(test);
          })
          .then(function (test) {
            expect($.ajax).not.toHaveBeenCalled();
            Expect.isNotVisible(test.manualSetupForm.phoneNumberField());
            test.manualSetupForm.selectSmsOption();
            return test.manualSetupForm.waitForSms(test);
          })
          .then(function (test) {
            expect($.ajax).not.toHaveBeenCalled();
            Expect.isVisible(test.manualSetupForm.phoneNumberField());
          });
        });
        itp('sends sms activation link request with correct params and shows confirmation', function () {
          return enrollOktaPushGoCannotScan()
          .then(function (test) {
            $.ajax.calls.reset();
            Expect.isVisible(test.manualSetupForm.form());
            test.manualSetupForm.setPhoneNumber('4152554668');
            test.setNextResponse(resActivatePushSms);
            test.manualSetupForm.submit();
            return Expect.waitForEnrollmentLinkSent(test);
          })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/activate/sms',
              data: {
                stateToken: 'testStateToken',
                profile: {
                  phoneNumber: '+14152554668'
                }
              }
            });
            Expect.isVisible(test.linkSentConfirmation.smsSentMsg());
            expect(test.linkSentConfirmation.getMsgText().indexOf('+14152554668') >= 0).toBe(true);
          });
        });
        itp('removes the sms activation form on successful activation response', function () {
          return enrollOktaPushGoCannotScan()
          .then(function (test) {
            $.ajax.calls.reset();
            Expect.isVisible(test.manualSetupForm.form());
            test.manualSetupForm.setPhoneNumber('4152554668');
            test.setNextResponse(resActivatePushSms);
            test.manualSetupForm.submit();

            Util.speedUpPolling(test.ac);
            test.originalAjax = Util.stallEnrollFactorPoll(test.ac, test.originalAjax);
            return Expect.waitForEnrollmentLinkSent(test);
          })
          .then(function (test) {
            Expect.isVisible(test.linkSentConfirmation.smsSentMsg());
            expect(test.linkSentConfirmation.getMsgText().indexOf('+14152554668') >= 0).toBe(true);
            test.originalAjax = Util.resumeEnrollFactorPoll(test.ac, test.originalAjax, resAllFactors);
            return tick(test);
          })
          .then(function (test) {
            expect(test.linkSentConfirmation.smsSentMsg().length).toBe(0);
          });
        });
        itp('sends email activation link request with correct params and shows confirmation', function () {
          return enrollOktaPushGoCannotScan()
          .then(function (test) {
            $.ajax.calls.reset();
            Expect.isVisible(test.manualSetupForm.form());
            test.manualSetupForm.selectEmailOption();
            test.setNextResponse(resActivatePushEmail);
            test.manualSetupForm.submit();
            return Expect.waitForEnrollmentLinkSent(test);
          })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/activate/email',
              data: {
                stateToken: 'testStateToken'
              }
            });
            Expect.isVisible(test.linkSentConfirmation.emailSentMsg());
            expect(test.linkSentConfirmation.getMsgText().indexOf('administrator1@clouditude.net') >= 0).toBe(true);
          });
        });
        itp('renders pass code form on "Next" button click when Manual is selected \
          and sends activation request with correct params on pass code submit', function () {
          return enrollOktaPushUseManualTotp()
          .then(function (test) {
            $.ajax.calls.reset();
            test.manualSetupForm.nextButtonClick();
            return Expect.waitForEnterPasscodePushFlow(test);
          })
          .then(function (test) {
            Expect.isVisible(test.passCodeForm.form());
            Expect.isVisible(test.passCodeForm.codeField());
            test.passCodeForm.setCode('1234');

            // Reset the ajaxRequest (changed during push setup)
            test.ac.options.ajaxRequest = test.originalAjax;
            test.setNextResponse(resSuccess);
            test.passCodeForm.submit();
            return tick(test);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/factors/id1234/lifecycle/activate',
              data: {
                passCode: '1234',
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('goes back to "Can\'t" scan screen with manual option selected \
          when Back link clicked on pass code step', function () {
          return enrollOktaPushUseManualTotp()
          .then(function (test) {
            $.ajax.calls.reset();
            test.manualSetupForm.nextButtonClick();
            return Expect.waitForEnterPasscodePushFlow(test);
          })
          .then(function (test) {
            Expect.isVisible(test.passCodeForm.form());
            test.passCodeForm.backLink().click();
            return Expect.waitForManualSetupPush(test);
          })
          .then(function (test) {
            return test.manualSetupForm.waitForCountryCodeSelect(test);
          })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(0);
            Expect.isVisible(test.manualSetupForm.form());
            Expect.isNotVisible(test.manualSetupForm.countryCodeSelect());
            Expect.isNotVisible(test.manualSetupForm.phoneNumberField());
            Expect.isVisible(test.manualSetupForm.sharedSecretField());
            Expect.isNotVisible(test.manualSetupForm.submitButton());
            Expect.isVisible(test.manualSetupForm.nextButton());
          });
        });
        itp('refreshes authStatus and goes back to scan barcode screen on "Scan barcode" link click', function () {
          return setupAndEnrollOktaPush()
          .then(function (test) {
            var oldQrCodeSrc = test.scanCodeForm.qrcodeImg().attr('src');
            expect(oldQrCodeSrc).toBe('../../../test/unit/assets/1x1.gif');
            test.scanCodeForm.clickManualSetupLink();
            return Expect.waitForManualSetupPush(test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            Expect.isVisible(test.manualSetupForm.form());
            test.setNextResponse(resPushEnrollSuccessNewQR);
            Util.mockSDKCookie(test.ac);
            test.manualSetupForm.gotoScanBarcode();
            return Expect.waitForBarcodePush(test);
          })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn',
              data: {
                stateToken: 'testStateToken'
              }
            });
            Expect.isVisible(test.scanCodeForm.form());
            var newQrCodeSrc = test.scanCodeForm.qrcodeImg().attr('src');
            expect(newQrCodeSrc).toBe('../../../test/unit/assets/1x1v2.gif');
          });
        });
      });
    });

  });
});
