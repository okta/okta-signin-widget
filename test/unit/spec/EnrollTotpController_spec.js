/* eslint max-params: [2, 24] */
import { _, loc } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import LinkSentConfirmation from 'helpers/dom/EnrollPushLinkSentForm';
import BarcodeForm from 'helpers/dom/EnrollTotpBarcodeForm';
import DeviceTypeForm from 'helpers/dom/EnrollTotpDeviceTypeForm';
import ManualSetupForm from 'helpers/dom/EnrollTotpManualSetupForm';
import PassCodeForm from 'helpers/dom/EnrollTotpPassCodeForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resOperationNotAllowed from 'helpers/xhr/ERROR_OPERATION_NOT_ALLOWED';
import resActivatePushEmail from 'helpers/xhr/MFA_ENROLL_ACTIVATE_push_email';
import resActivatePushSms from 'helpers/xhr/MFA_ENROLL_ACTIVATE_push_sms';
import resActivatePushTimeout from 'helpers/xhr/MFA_ENROLL_ACTIVATE_push_timeout';
import resActivateError from 'helpers/xhr/MFA_ENROLL_ACTIVATE_totp_error';
import resAllFactors from 'helpers/xhr/MFA_ENROLL_allFactors';
import resFactorsWithPush from 'helpers/xhr/MFA_ENROLL_push';
import resPushEnrollSuccess from 'helpers/xhr/MFA_ENROLL_push_success';
import resPushEnrollSuccessNewQR from 'helpers/xhr/MFA_ENROLL_push_success_newqr';
import resTotpEnrollSuccess from 'helpers/xhr/MFA_ENROLL_totp_success';
import resSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const itp = Expect.itp;
const tick = Expect.tick;

Expect.describe('EnrollTotp', function() {
  function setup(res, selectedFactor, settings, startRouter) {
    const setNextResponse = Util.mockAjax();
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: { issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR }
    });
    const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    const router = new Router(
      _.extend(
        {
          el: $sandbox,
          baseUrl: baseUrl,
          authClient: authClient,
          'features.router': startRouter,
        },
        settings
      )
    );

    router.on('afterError', afterErrorHandler);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router, startRouter);

    return tick()
      .then(function() {
        setNextResponse(res);
        router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollChoices();
      })
      .then(function() {
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
          setNextResponse: setNextResponse,
          afterErrorHandler: afterErrorHandler,
        });
      });
  }

  const setupOktaTotp = _.partial(setup, resAllFactors, {
    provider: 'okta',
    factorType: 'token:software:totp',
  });

  const setupGoogleTotp = _.partial(setup, resAllFactors, {
    provider: 'google',
    factorType: 'token:software:totp',
  });

  const setupOktaPush = _.partial(setup, resFactorsWithPush, {
    provider: 'okta',
    factorType: 'push',
  });

  function enrollFactor(test, res) {
    test.setNextResponse(res || resTotpEnrollSuccess);
    test.form.selectDeviceType('APPLE');
    test.form.submit();
    return test;
  }

  function setupAndEnrollOktaTotp() {
    return setupOktaTotp()
      .then(function(test) {
        return enrollFactor(test, resTotpEnrollSuccess);
      })
      .then(function(test) {
        return Expect.waitForBarcodeTotp(test);
      });
  }

  function setupAndEnrollGoogleTotp() {
    return setupGoogleTotp()
      .then(function(test) {
        return enrollFactor(test, resTotpEnrollSuccess);
      })
      .then(function(test) {
        return Expect.waitForBarcodeTotp(test);
      });
  }

  function setupAndEnrollOktaPush() {
    return setupOktaPush()
      .then(function(test) {
        test.originalAjax = Util.stallEnrollFactorPoll(test.ac);
        return enrollFactor(test, resPushEnrollSuccess);
      })
      .then(function(test) {
        return Expect.waitForBarcodePush(test);
      });
  }

  function enrollOktaPushGoCannotScan() {
    return setupAndEnrollOktaPush().then(function(test) {
      test.setNextResponse([resFactorsWithPush, resPushEnrollSuccess]);
      test.scanCodeForm.clickManualSetupLink();
      return Expect.waitForManualSetupPush(test);
    });
  }

  function enrollOktaPushUseManualTotp() {
    return enrollOktaPushGoCannotScan().then(function(test) {
      test.setNextResponse([resAllFactors, resTotpEnrollSuccess]);
      test.manualSetupForm.selectManualOption();
      return test.manualSetupForm.waitForManual(test);
    });
  }

  function testEnrollFactor(
    setupOktaTotpFn,
    setupAndEnrollOktaTotpFn,
    setupGoogleTotpFn,
    setupAndEnrollGoogleTotpFn,
    expectedStateToken
  ) {
    itp('has correct device type options for Okta Verify', function() {
      return setupOktaTotpFn().then(function(test) {
        expect(test.form.deviceTypeOptions().length).toBe(2);
        expect(test.form.deviceTypeOptionLabel('APPLE').length).toBe(1);
        expect(test.form.deviceTypeOptionLabel('ANDROID').length).toBe(1);
      });
    });
    itp('has correct device type options for Google Authenticator', function() {
      return setupGoogleTotpFn().then(function(test) {
        expect(test.form.deviceTypeOptions().length).toBe(2);
        expect(test.form.deviceTypeOptionLabel('APPLE').length).toBe(1);
        expect(test.form.deviceTypeOptionLabel('ANDROID').length).toBe(1);
      });
    });
    itp('has app download instructions not displayed until device type is selected', function() {
      return setupOktaTotpFn().then(function(test) {
        Expect.isNotVisible(test.form.appDownloadInstructions());
      });
    });
    itp('has app download instructions displayed when device type is selected', function() {
      return setupOktaTotpFn().then(function(test) {
        test.form.selectDeviceType('APPLE');
        Expect.isVisible(test.form.appDownloadInstructions());
      });
    });
    itp('has correct app download instructions displayed for Okta Verify', function() {
      return setupOktaTotpFn().then(function(test) {
        test.form.selectDeviceType('APPLE');
        expect(test.form.appDownloadInstructionsLinkText()).toEqual('Okta Verify from the App Store');
        expect(test.form.appDownloadInstructionsAppLogo('.okta-verify-download-icon').length).toBe(1);
        test.form.selectDeviceType('ANDROID');
        expect(test.form.appDownloadInstructionsLinkText()).toEqual('Okta Verify from the Google Play Store');
      });
    });
    itp('has correct app download instructions displayed for Google Auth', function() {
      return setupGoogleTotpFn().then(function(test) {
        test.form.selectDeviceType('APPLE');
        expect(test.form.appDownloadInstructionsLinkText()).toEqual('Google Authenticator from the App Store');
        expect(test.form.appDownloadInstructionsAppLogo('.google-auth-38').length).toBe(1);
        test.form.selectDeviceType('ANDROID');
        expect(test.form.appDownloadInstructionsLinkText()).toEqual('Google Authenticator from the Google Play Store');
      });
    });
    itp('has link right target and rel attributes for app/play store links', function() {
      return setupOktaTotpFn().then(function(test) {
        test.form.selectDeviceType('APPLE');
        expect(test.form.appDownloadInstructionsLink()[0].getAttribute('target')).toEqual('_blank');
        expect(test.form.appDownloadInstructionsLink()[0].getAttribute('rel')).toEqual('noreferer noopener');
        test.form.selectDeviceType('ANDROID');
        expect(test.form.appDownloadInstructionsLink()[0].getAttribute('target')).toEqual('_blank');
        expect(test.form.appDownloadInstructionsLink()[0].getAttribute('rel')).toEqual('noreferer noopener');
      });
    });
    itp('has a next button not displayed until device type is selected', function() {
      return setupOktaTotpFn().then(function(test) {
        Expect.isNotVisible(test.form.submitButton());
      });
    });
    itp('has a next button displayed when device type is selected', function() {
      return setupOktaTotpFn().then(function(test) {
        test.form.selectDeviceType('APPLE');
        Expect.isVisible(test.form.submitButton());
      });
    });
    itp('returns to factor list when browser\'s back button is clicked', function() {
      return setupOktaTotpFn({}, true)
        .then(function(test) {
          Util.triggerBrowserBackButton();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function(test) {
          Expect.isEnrollChoices(test.router.controller);
          Util.stopRouter();
        });
    });
    itp('sends enroll request with correct params for Okta totp', function() {
      return setupAndEnrollOktaTotpFn().then(function() {
        expect(Util.numAjaxRequests()).toBe(2);
        Expect.isJsonPost(Util.getAjaxRequest(1), {
          url: 'https://foo.com/api/v1/authn/factors',
          data: {
            factorType: 'token:software:totp',
            provider: 'OKTA',
            stateToken: expectedStateToken,
          },
        });
      });
    });
    itp('sends enroll request with correct params for Google totp', function() {
      return setupAndEnrollGoogleTotpFn().then(function() {
        expect(Util.numAjaxRequests()).toBe(2);
        Expect.isJsonPost(Util.getAjaxRequest(1), {
          url: 'https://foo.com/api/v1/authn/factors',
          data: {
            factorType: 'token:software:totp',
            provider: 'GOOGLE',
            stateToken: expectedStateToken,
          },
        });
      });
    });
  }

  function testOktaVerify(
    setupAndEnrollOktaPushFn,
    setupOktaPushFn,
    activatePushSmsRes,
    activatePushTimeoutRes,
    expectedStateToken
  ) {
    function setupPolling(test, finalResponse) {
      Util.resetAjaxRequests();

      // 1: Set for first enrollFactor
      // 2: Set for startEnrollFactorPoll
      // 3: Set for EnrollFactor poll finish
      test.setNextResponse([activatePushSmsRes, activatePushSmsRes, finalResponse]);

      // Start the enrollment
      test.form.selectDeviceType('APPLE');
      // Submit would trigger enroll activate call and 1 poll.
      test.form.submit();

      return Expect.waitForAjaxRequests(1, test) // 1: submit enrollFactor
        .then(() => {
          Util.callAllTimeouts();
          return Expect.waitForAjaxRequests(2, test); // 2: submit enrollFactor poll
        })
        .then(() => {
          Util.callAllTimeouts();
          return Expect.waitForAjaxRequests(3, test); // Final response tick
        });
    }
    itp('has appropriate instructions to scan QR Code', function() {
      return setupAndEnrollOktaPushFn().then(function(test) {
        expect(test.scanCodeForm.scanInstructionDetails().text()).toEqual('Launch Okta Verify on your mobile device and select “Add an account”. Scan the QR code to continue.');
      });
    });
    itp('has qrcode image with alt attr', function() {
      return setupAndEnrollOktaPushFn().then(function(test) {
        expect(test.scanCodeForm.qrcodeImg().length).toBe(1);
        expect(test.scanCodeForm.qrcodeImg().attr('src')).toEqual('/base/test/unit/assets/1x1.gif');
        expect(test.scanCodeForm.qrcodeImg().attr('alt')).toEqual('QR code');
      });
    });
    itp('has a link to setup app manually', function() {
      return setupAndEnrollOktaPushFn().then(function(test) {
        Expect.isVisible(test.scanCodeForm.manualSetupLink());
        expect(test.scanCodeForm.manualSetupLink().attr('aria-label')).toEqual('Setup without scanning a QR code.');
      });
    });
    itp('does not have "Next" button', function() {
      return setupAndEnrollOktaPushFn().then(function(test) {
        expect(test.scanCodeForm.submitButton().length).toBe(0);
      });
    });
    itp('removes the scan code form on clicking "Back to factor list" link', function() {
      return setupOktaPushFn()
        .then(function(test) {
          return setupPolling(test, resSuccess);
        })
        .then(function(test) {
          test.setNextResponse([resFactorsWithPush]);
          test.scanCodeForm.clickBackLink();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function(test) {
          expect(test.scanCodeForm.container().length).toBe(0);
        });
    });
    itp('removes the scan code form on clicking "Can\'t scan" link', function() {
      return setupOktaPushFn()
        .then(function(test) {
          return setupPolling(test, activatePushSmsRes);
        })
        .then(function(test) {
          test.setNextResponse([resFactorsWithPush, resPushEnrollSuccess]);
          test.scanCodeForm.clickManualSetupLink();
          return Expect.waitForManualSetupPush(test);
        })
        .then(function(test) {
          expect(test.scanCodeForm.container().length).toBe(0);
        });
    });
    itp('returns to factor list when browser\'s back button is clicked', function() {
      return setupOktaPushFn({}, true)
        .then(function(test) {
          return setupPolling(test, resSuccess);
        })
        .then(function(test) {
          test.setNextResponse([resFactorsWithPush]);
          Util.triggerBrowserBackButton();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function(test) {
          Expect.isEnrollChoices(test.router.controller);
          Util.stopRouter();
        });
    });
    itp('polls until SUCCESS when submitted', function() {
      return setupOktaPushFn()
        .then(function(test) {
          return setupPolling(test, resSuccess);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(3);

          // initial enrollFactor call
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'push',
              provider: 'OKTA',
              stateToken: expectedStateToken,
            },
          });

          // first startEnrollFactorPoll call
          Expect.isJsonPost(Util.getAjaxRequest(1), {
            url: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate/poll',
            data: {
              stateToken: expectedStateToken,
            },
          });

          // last startEnrollFactorPoll call
          Expect.isJsonPost(Util.getAjaxRequest(2), {
            url: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate/poll',
            data: {
              stateToken: expectedStateToken,
            },
          });
        });
    });
    itp('shows "Refresh code" link if got network error while polling', function() {
      // Simulate polling with Auth SDK's exponential backoff (6 failed requests)
      function setupFailurePolling(test) {
        const failureResponse = { status: 0, response: {} };

        Util.resetAjaxRequests();
        test.setNextResponse([
          activatePushSmsRes,
          activatePushSmsRes,
          failureResponse,
          failureResponse,
          failureResponse,
          failureResponse,
          failureResponse,
          failureResponse,
        ]);
        test.form.selectDeviceType('APPLE');
        test.form.submit();
        return Expect.waitForAjaxRequests(1, test) // 1: submit enrollFactor
          .then(() => {
            Util.callAllTimeouts();
            return Expect.waitForAjaxRequests(2, test); // 2: submit enrollFactor poll
          })
          .then(() => {
            Util.callAllTimeouts();
            return Expect.waitForAjaxRequests(3, test); // Failure request
          })
          .then(() => {
            Util.callAllTimeouts();
            return Expect.waitForAjaxRequests(4, test); // Failure request
          })
          .then(() => {
            Util.callAllTimeouts();
            return Expect.waitForAjaxRequests(5, test); // Failure request
          })
          .then(() => {
            Util.callAllTimeouts();
            return Expect.waitForAjaxRequests(6, test); // Failure request
          })
          .then(() => {
            Util.callAllTimeouts();
            return Expect.waitForAjaxRequests(7, test); // Failure request
          })
          .then(() => {
            Util.callAllTimeouts();
            return Expect.waitForAjaxRequests(8, test); // 4: Error from Auth SDK
          });
      }
      return setupOktaPushFn()
        .then(function(test) {
          spyOn(test.router.settings, 'callGlobalError');
          return setupFailurePolling(test);
        })
        .then(function(test) {
          return test.scanCodeForm.waitForRefreshQrcodeLink(test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(8);
          expect(test.scanCodeForm.hasManualSetupLink()).toBe(false);
          expect(test.scanCodeForm.hasRefreshQrcodeLink()).toBe(true);
          expect(test.scanCodeForm.hasErrors()).toBe(true);
          expect(test.scanCodeForm.errorMessage()).toEqual(loc('error.network.connection', 'login'));

          // on "Refresh code" link click
          // it sends reactivation request and starts polling again
          Util.resetAjaxRequests();
          test.setNextResponse([activatePushSmsRes, resSuccess]);
          test.scanCodeForm.clickrefreshQrcodeLink();
          return Expect.waitForAjaxRequests(2, test);
        })
        .then(function(test) {
          // errors cleared
          expect(test.scanCodeForm.hasErrors()).toBe(false);

          // the error was raised
          expect(test.router.settings.callGlobalError.calls.count()).toBe(1);

          // polled until success
          expect(Util.numAjaxRequests()).toBe(2);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate/poll',
            data: {
              stateToken: expectedStateToken,
            },
          });

          Expect.isJsonPost(Util.getAjaxRequest(1), {
            url: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate/poll',
            data: {
              stateToken: expectedStateToken,
            },
          });
        });
    });
    itp('allows refresh after TIMEOUT', function() {
      return setupOktaPushFn()
        .then(function(test) {
          Util.resetAjaxRequests();

          // 1: Set for first enrollFactor
          // 2: Set for activateFactor
          // 3: Set for second enrollFactor
          test.setNextResponse([activatePushSmsRes, activatePushTimeoutRes, activatePushSmsRes]);

          // Start the enrollment
          test.form.selectDeviceType('APPLE');
          test.form.submit();

          return Expect.waitForAjaxRequests(1, test).then(() => { // 1: submit enrollFactor
            Util.callAllTimeouts();
            return Expect.waitForAjaxRequests(2, test); // 2: submit enrollFactor poll
          });
        })
        .then(function(test) {
          // After TIMEOUT, refresh the QR code
          Expect.isVisible(test.scanCodeForm.refreshLink());
          test.scanCodeForm.clickRefreshLink();
          return Expect.waitForAjaxRequests(3, test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(3);

          // initial enrollFactor call
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'push',
              provider: 'OKTA',
              stateToken: expectedStateToken,
            },
          });

          // first startEnrollFactorPoll call
          Expect.isJsonPost(Util.getAjaxRequest(1), {
            url: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate/poll',
            data: {
              stateToken: expectedStateToken,
            },
          });

          // last startEnrollFactorPoll call
          Expect.isJsonPost(Util.getAjaxRequest(2), {
            url: 'https://foo.com/api/v1/authn/factors/opfiilf0vAdzHVmic0g3/lifecycle/activate',
            data: {
              stateToken: expectedStateToken,
            },
          });
        });
    });
  }

  function testManualSetup(
    enrollOktaPushGoCannotScanFn,
    setupAndEnrollOktaPushFn,
    enrollOktaPushUseManualTotpFn,
    setupOktaPushFn,
    factorsWithPushRes,
    pushEnrollSuccessRes,
    pushEnrollSuccessNewQRRes,
    expectedStateToken
  ) {
    itp('is rendered on "Can\'t scan" link click', function() {
      return enrollOktaPushGoCannotScanFn().then(function(test) {
        Expect.isVisible(test.manualSetupForm.form());
        Expect.isVisible(test.manualSetupForm.dropdownElement());
        Expect.isVisible(test.manualSetupForm.gotoScanBarcodeLink());
      });
    });
    itp('has correct fields displayed when different dropdown options selected', function() {
      return enrollOktaPushGoCannotScanFn()
        .then(function(test) {
          return test.manualSetupForm.waitForDropdownElement(test);
        })
        .then(function(test) {
          return test.manualSetupForm.waitForCountryCodeSelect(test);
        })
        .then(function(test) {
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
        .then(function(test) {
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
        .then(function(test) {
          // manual option
          Expect.isNotVisible(test.manualSetupForm.countryCodeSelect());
          Expect.isNotVisible(test.manualSetupForm.phoneNumberField());
          Expect.isVisible(test.manualSetupForm.sharedSecretField());
          Expect.isNotVisible(test.manualSetupForm.submitButton());
          Expect.isVisible(test.manualSetupForm.nextButton());
        });
    });
    itp('returns to factor list when browser\'s back button is clicked', function() {
      return setupOktaPushFn({}, true)
        .then(function(test) {
          test.originalAjax = Util.stallEnrollFactorPoll(test.ac);
          return enrollFactor(test, pushEnrollSuccessRes);
        })
        .then(function(test) {
          return Expect.waitForBarcodePush(test);
        })
        .then(function(test) {
          test.setNextResponse([factorsWithPushRes, pushEnrollSuccessRes]);
          test.scanCodeForm.clickManualSetupLink();
          return Expect.waitForManualSetupPush(test);
        })
        .then(function(test) {
          test.setNextResponse(resAllFactors);
          Util.triggerBrowserBackButton();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function(test) {
          Expect.isEnrollChoices(test.router.controller);
          Util.stopRouter();
        });
    });
    itp('goes to previous link and then enrolls in totp when choosing manually', function() {
      return enrollOktaPushUseManualTotpFn().then(function() {
        expect(Util.numAjaxRequests()).toBe(6);
        Expect.isJsonPost(Util.getAjaxRequest(4), {
          url: 'https://foo.com/api/v1/authn/previous',
          data: { stateToken: expectedStateToken },
        });
        Expect.isJsonPost(Util.getAjaxRequest(5), {
          url: 'https://foo.com/api/v1/authn/factors',
          data: {
            factorType: 'token:software:totp',
            provider: 'OKTA',
            stateToken: expectedStateToken,
          },
        });
      });
    });
    itp('goes to previous link and enrolls in push when coming from manual', function() {
      return enrollOktaPushUseManualTotpFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          expect(test.manualSetupForm.sharedSecretFieldValue()).toEqual('superSecretSharedSecret');
          test.setNextResponse([factorsWithPushRes, pushEnrollSuccessRes]);
          test.manualSetupForm.selectSmsOption();
          return test.manualSetupForm.waitForSms(test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(2);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/previous',
            data: { stateToken: expectedStateToken },
          });
          Expect.isJsonPost(Util.getAjaxRequest(1), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'push',
              provider: 'OKTA',
              stateToken: expectedStateToken,
            },
          });
          expect(test.manualSetupForm.sharedSecretFieldValue()).toEqual('');
        });
    });
    itp('does not do re-enroll when switches between sms and email options', function() {
      return enrollOktaPushGoCannotScanFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.manualSetupForm.selectEmailOption();
          return test.manualSetupForm.waitForEmail(test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(0);
          Expect.isNotVisible(test.manualSetupForm.phoneNumberField());
          test.manualSetupForm.selectSmsOption();
          return test.manualSetupForm.waitForSms(test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(0);
          Expect.isVisible(test.manualSetupForm.phoneNumberField());
        });
    });
    itp('sends sms activation link request with correct params and shows confirmation', function() {
      return enrollOktaPushGoCannotScanFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          Expect.isVisible(test.manualSetupForm.form());
          test.manualSetupForm.setPhoneNumber('4152554668');
          test.setNextResponse(resActivatePushSms);
          test.manualSetupForm.submit();
          return Expect.waitForEnrollmentLinkSent(test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/activate/sms',
            data: {
              stateToken: expectedStateToken,
              profile: {
                phoneNumber: '+14152554668',
              },
            },
          });
          Expect.isVisible(test.linkSentConfirmation.smsSentMsg());
          expect(test.linkSentConfirmation.getMsgText().indexOf('+14152554668') >= 0).toBe(true);
        });
    });
    itp('removes the sms activation form on successful activation response', function() {
      Expect.allowUnhandledPromiseRejection(); // OKTA-324849
      return enrollOktaPushGoCannotScanFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          Expect.isVisible(test.manualSetupForm.form());
          test.manualSetupForm.setPhoneNumber('4152554668');
          test.setNextResponse(resActivatePushSms);
          test.manualSetupForm.submit();

          test.originalAjax = Util.stallEnrollFactorPoll(test.ac, test.originalAjax);
          return Expect.waitForEnrollmentLinkSent(test);
        })
        .then(function(test) {
          Expect.isVisible(test.linkSentConfirmation.smsSentMsg());
          expect(test.linkSentConfirmation.getMsgText().indexOf('+14152554668') >= 0).toBe(true);
          test.originalAjax = Util.resumeEnrollFactorPoll(test.ac, test.originalAjax, resAllFactors);
          Util.callAllTimeouts();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function(test) {
          expect(test.linkSentConfirmation.smsSentMsg().length).toBe(0);
        });
    });
    itp('sends email activation link request with correct params and shows confirmation', function() {
      return enrollOktaPushGoCannotScanFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          Expect.isVisible(test.manualSetupForm.form());
          test.manualSetupForm.selectEmailOption();
          test.setNextResponse(resActivatePushEmail);
          test.manualSetupForm.submit();
          return Expect.waitForEnrollmentLinkSent(test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/activate/email',
            data: {
              stateToken: expectedStateToken,
            },
          });
          Expect.isVisible(test.linkSentConfirmation.emailSentMsg());
          expect(test.linkSentConfirmation.getMsgText().indexOf('administrator1@clouditude.net') >= 0).toBe(true);
        });
    });
    itp(
      'renders pass code form on "Next" button click when Manual is selected \
          and sends activation request with correct params on pass code submit',
      function() {
        return enrollOktaPushUseManualTotpFn()
          .then(function(test) {
            Util.resetAjaxRequests();
            test.manualSetupForm.nextButtonClick();
            return Expect.waitForEnterPasscodePushFlow(test);
          })
          .then(function(test) {
            Expect.isVisible(test.passCodeForm.form());
            Expect.isVisible(test.passCodeForm.codeField());
            test.passCodeForm.setCode('1234');

            // Reset the httpRequestClient (changed during push setup)
            test.ac.options.httpRequestClient = test.originalAjax;
            test.setNextResponse(resSuccess);
            test.passCodeForm.submit();
            return tick(test);
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            Expect.isJsonPost(Util.getAjaxRequest(0), {
              url: 'https://foo.com/api/v1/authn/factors/id1234/lifecycle/activate',
              data: {
                passCode: '1234',
                stateToken: expectedStateToken,
              },
            });
          });
      }
    );
    itp(
      'goes back to "Can\'t" scan screen with manual option selected \
      when Back link clicked on pass code step',
      function() {
        return enrollOktaPushUseManualTotpFn()
          .then(function(test) {
            Util.resetAjaxRequests();
            test.manualSetupForm.nextButtonClick();
            return Expect.waitForEnterPasscodePushFlow(test);
          })
          .then(function(test) {
            Expect.isVisible(test.passCodeForm.form());
            test.passCodeForm.backLink().click();
            return Expect.waitForManualSetupPush(test);
          })
          .then(function(test) {
            return test.manualSetupForm.waitForCountryCodeSelect(test);
          })
          .then(function(test) {
            expect(Util.numAjaxRequests()).toBe(0);
            Expect.isVisible(test.manualSetupForm.form());
            Expect.isNotVisible(test.manualSetupForm.countryCodeSelect());
            Expect.isNotVisible(test.manualSetupForm.phoneNumberField());
            Expect.isVisible(test.manualSetupForm.sharedSecretField());
            Expect.isNotVisible(test.manualSetupForm.submitButton());
            Expect.isVisible(test.manualSetupForm.nextButton());
          });
      }
    );
    itp('refreshes authStatus and goes back to scan barcode screen on "Scan barcode" link click', function() {
      return setupAndEnrollOktaPushFn()
        .then(function(test) {
          const oldQrCodeSrc = test.scanCodeForm.qrcodeImg().attr('src');

          expect(oldQrCodeSrc).toBe('/base/test/unit/assets/1x1.gif');
          test.setNextResponse([factorsWithPushRes, pushEnrollSuccessRes]);
          test.scanCodeForm.clickManualSetupLink();
          return Expect.waitForManualSetupPush(test);
        })
        .then(function(test) {
          Util.resetAjaxRequests();
          Expect.isVisible(test.manualSetupForm.form());
          test.setNextResponse([factorsWithPushRes, pushEnrollSuccessNewQRRes]);
          test.manualSetupForm.gotoScanBarcode();
          return Expect.waitForBarcodePush(test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(2);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/previous',
            data: {
              stateToken: expectedStateToken,
            },
          });
          Expect.isJsonPost(Util.getAjaxRequest(1), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'push',
              provider: 'OKTA',
              stateToken: expectedStateToken,
            },
          });
          Expect.isVisible(test.scanCodeForm.form());
          const newQrCodeSrc = test.scanCodeForm.qrcodeImg().attr('src');

          expect(newQrCodeSrc).toBe('/base/test/unit/assets/1x1v2.gif');
        });
    });
  }

  function testScanQRCode(setupAndEnrollOktaTotpFn, setupOktaTotpFn, totpEnrollSuccessRes, allFactorsRes) {
    itp('has qrcode image', function() {
      return setupAndEnrollOktaTotpFn().then(function(test) {
        expect(test.scanCodeForm.qrcodeImg().length).toBe(1);
        // Note: Modifying API qr code return image with something we can load locally
        expect(test.scanCodeForm.qrcodeImg().attr('src')).toEqual('/base/test/unit/assets/1x1.gif');
      });
    });
    itp('has a link to setup app manually', function() {
      return setupAndEnrollOktaTotpFn().then(function(test) {
        Expect.isVisible(test.scanCodeForm.manualSetupLink());
      });
    });
    itp('has "Next" button', function() {
      return setupAndEnrollOktaTotpFn().then(function(test) {
        Expect.isVisible(test.scanCodeForm.submitButton());
      });
    });
    itp('returns to factor list when browser\'s back button is clicked', function() {
      return setupOktaTotpFn({}, true)
        .then(function(test) {
          return enrollFactor(test, totpEnrollSuccessRes);
        })
        .then(function(test) {
          return Expect.waitForBarcodeTotp(test);
        })
        .then(function(test) {
          test.setNextResponse(allFactorsRes);
          Util.triggerBrowserBackButton();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function(test) {
          Expect.isEnrollChoices(test.router.controller);
          Util.stopRouter();
        });
    });
  }

  function testScanQRCodeManualSetup(setupAndEnrollOktaTotpFn, setupOktaTotpFn, totpEnrollSuccessRes) {
    itp('is rendered on "Can\'t scan" link click', function() {
      return setupAndEnrollOktaTotpFn()
        .then(function(test) {
          test.scanCodeForm.clickManualSetupLink();
          return Expect.waitForManualSetupTotp(test);
        })
        .then(function(test) {
          Expect.isVisible(test.manualSetupForm.form());
          Expect.isVisible(test.manualSetupForm.sharedSecretField());
          expect(test.manualSetupForm.sharedSecretFieldValue()).toEqual('superSecretSharedSecret');
          Expect.isVisible(test.manualSetupForm.gotoScanBarcodeLink());
        });
    });
    itp('renders pass code form on "Next" button click', function() {
      return setupAndEnrollOktaTotpFn()
        .then(function(test) {
          test.scanCodeForm.clickManualSetupLink();
          return Expect.waitForManualSetupTotp(test);
        })
        .then(function(test) {
          Expect.isVisible(test.manualSetupForm.form());
          test.manualSetupForm.submit();
          return Expect.waitForActivateTotp(test);
        })
        .then(function(test) {
          Expect.isVisible(test.passCodeForm.form());
          Expect.isVisible(test.passCodeForm.codeField());
          expect(test.passCodeForm.codeField().attr('type')).toBe('tel');
        });
    });
    itp('returns to factor list when browser\'s back button is clicked', function() {
      return setupOktaTotpFn({}, true)
        .then(function(test) {
          return enrollFactor(test, totpEnrollSuccessRes);
        })
        .then(function(test) {
          return Expect.waitForBarcodeTotp(test);
        })
        .then(function(test) {
          test.scanCodeForm.clickManualSetupLink();
          return Expect.waitForManualSetupTotp(test);
        })
        .then(function(test) {
          test.setNextResponse(resAllFactors);
          Util.triggerBrowserBackButton();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function(test) {
          Expect.isEnrollChoices(test.router.controller);
          Util.stopRouter();
        });
    });
    itp('refreshes authStatus and goes back to scan barcode screen on "Scan barcode" link click', function() {
      return setupAndEnrollOktaTotpFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.scanCodeForm.clickManualSetupLink();
          return Expect.waitForManualSetupTotp(test);
        })
        .then(function(test) {
          Expect.isVisible(test.manualSetupForm.form());
          test.setNextResponse(totpEnrollSuccessRes);
          Util.mockSDKCookie(test.ac);
          test.manualSetupForm.gotoScanBarcode();
          return Expect.waitForBarcodeTotp(test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn',
            data: { stateToken: 'testStateToken' },
          });
          Expect.isVisible(test.scanCodeForm.form());
        });
    });
  }

  function testScanQRCodePassCodeForm(
    setupAndEnrollOktaTotpFn,
    setupOktaTotpFn,
    totpEnrollSuccessRes,
    expectedStateToken
  ) {
    itp('renders pass code form on "Next" button click', function() {
      return setupAndEnrollOktaTotpFn()
        .then(function(test) {
          test.scanCodeForm.submit();
          return Expect.waitForActivateTotp(test);
        })
        .then(function(test) {
          Expect.isVisible(test.passCodeForm.form());
          Expect.isVisible(test.passCodeForm.codeField());
          expect(test.passCodeForm.codeField().attr('type')).toBe('tel');
        });
    });
    itp('shows error in case of an error response', function() {
      return setupAndEnrollOktaTotpFn()
        .then(function(test) {
          test.scanCodeForm.submit();
          return Expect.waitForActivateTotp(test);
        })
        .then(function(test) {
          Expect.isVisible(test.passCodeForm.form());
          test.setNextResponse(resActivateError);
          test.passCodeForm.setCode(123);
          test.passCodeForm.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.passCodeForm.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Api validation failed: factorEnrollRequest');
          expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
          expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'activate-totp',
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
    itp('shows modified error in case of E0000079 operation not allowed error response', function() {
      return setupAndEnrollOktaTotpFn()
        .then(function(test) {
          test.scanCodeForm.submit();
          return Expect.waitForActivateTotp(test);
        })
        .then(function(test) {
          Expect.isVisible(test.passCodeForm.form());
          test.setNextResponse(resOperationNotAllowed);
          test.passCodeForm.setCode(123);
          test.passCodeForm.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.passCodeForm.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('The operation is not allowed. Please refresh the page to proceed.');
        });
    });
    itp('calls activate with the right params', function() {
      return setupAndEnrollOktaTotpFn()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.scanCodeForm.submit();
          return Expect.waitForActivateTotp(test);
        })
        .then(function(test) {
          Expect.isVisible(test.passCodeForm.form());
          test.passCodeForm.setCode(123456);
          test.setNextResponse(resSuccess);
          test.passCodeForm.submit();
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors/id1234/lifecycle/activate',
            data: {
              passCode: '123456',
              stateToken: expectedStateToken,
            },
          });
        });
    });
    itp('returns to factor list when browser\'s back button is clicked', function() {
      return setupOktaTotpFn({}, true)
        .then(function(test) {
          return enrollFactor(test, totpEnrollSuccessRes);
        })
        .then(function(test) {
          return Expect.waitForBarcodeTotp(test);
        })
        .then(function(test) {
          test.scanCodeForm.submit();
          return Expect.waitForActivateTotp(test);
        })
        .then(function(test) {
          test.setNextResponse(resAllFactors);
          Util.triggerBrowserBackButton();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function(test) {
          Expect.isEnrollChoices(test.router.controller);
          Util.stopRouter();
        });
    });
  }

  Expect.describe('Header & Footer', function() {
    itp('displays the correct factorBeacon for Okta Verify', function() {
      return setupOktaTotp().then(function(test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-okta-verify')).toBe(true);
      });
    });
    itp('displays the correct factorBeacon for Google Authenticator', function() {
      return setupGoogleTotp().then(function(test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-google-auth')).toBe(true);
      });
    });
    itp('has a "back" link in the footer', function() {
      return setupOktaTotp().then(function(test) {
        Expect.isVisible(test.form.backLink());
      });
    });
  });

  Expect.describe('Enroll factor', function() {
    testEnrollFactor(
      setupOktaTotp,
      setupAndEnrollOktaTotp,
      setupGoogleTotp,
      setupAndEnrollGoogleTotp,
      'testStateToken'
    );
  });

  Expect.describe('Scan qrcode', function() {
    testScanQRCode(setupAndEnrollOktaTotp, setupOktaTotp, resTotpEnrollSuccess, resAllFactors);

    Expect.describe('Manual setup', function() {
      testScanQRCodeManualSetup(setupAndEnrollOktaTotp, setupOktaTotp, resTotpEnrollSuccess, 'testStateToken');
    });

    Expect.describe('Pass code form', function() {
      testScanQRCodePassCodeForm(setupAndEnrollOktaTotp, setupOktaTotp, resTotpEnrollSuccess, 'testStateToken');
    });
  });

  Expect.describe('Okta Verify with Push', function() {
    testOktaVerify(setupAndEnrollOktaPush, setupOktaPush, resActivatePushSms, resActivatePushTimeout, 'testStateToken');
    Expect.describe('Manual setup', function() {
      testManualSetup(
        enrollOktaPushGoCannotScan,
        setupAndEnrollOktaPush,
        enrollOktaPushUseManualTotp,
        setupOktaPush,
        resFactorsWithPush,
        resPushEnrollSuccess,
        resPushEnrollSuccessNewQR,
        'testStateToken'
      );
    });
  });
});
