/*jshint maxparams:15 */
/*global JSON */
define([
  'underscore',
  'jquery',
  'vendor/OktaAuth',
  'helpers/mocks/Util',
  'helpers/dom/EnrollChoicesForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_push',
  'helpers/xhr/SUCCESS'
],
function (_, $, OktaAuth, Util, EnrollChoicesForm, Beacon, Expect, Router,
          $sandbox, resAllFactors, resPush, resSuccess) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  describe('EnrollChoices', function () {

    function setup(res, showSecurityImage) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({
        uri: baseUrl
      });
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        features: {
          securityImage: showSecurityImage
        },
        authClient: authClient,
        globalSuccessFn: function () {}
      });
      Util.mockRouterNavigate(router);
      Util.mockJqueryCss();
      setNextResponse(res);
      authClient.status();
      return tick().then(function () {
        return {
          ac: authClient,
          setNextResponse: setNextResponse,
          router: router,
          beacon: new Beacon($sandbox),
          form: new EnrollChoicesForm($sandbox)
        };
      });
    }

    // Poor man's deep clone since we don't use lodash
    function deepClone(res) {
      return JSON.parse(JSON.stringify(res));
    }

    function setupWithRequiredNoneEnrolled() {
      var res = deepClone(resAllFactors);
      res.response._embedded.factors[0].enrollment = 'REQUIRED';
      res.response._embedded.factors[1].enrollment = 'REQUIRED';
      res.response._embedded.factors[2].enrollment = 'REQUIRED';
      res.response._embedded.factors[3].enrollment = 'REQUIRED';
      return setup(res);
    }

    function setupWithRequiredSomeRequiredEnrolled() {
      var res = deepClone(resAllFactors);
      res.response._embedded.factors[0].enrollment = 'REQUIRED';
      res.response._embedded.factors[1].enrollment = 'REQUIRED';
      res.response._embedded.factors[2].enrollment = 'REQUIRED';
      res.response._embedded.factors[2].status = 'ACTIVE';
      return setup(res);
    }

    function setupWithRequiredAllRequiredEnrolled() {
      var res = deepClone(resAllFactors);
      res.response._embedded.factors[0].enrollment = 'REQUIRED';
      res.response._embedded.factors[0].status = 'ACTIVE';
      res.response._embedded.factors[1].enrollment = 'REQUIRED';
      res.response._embedded.factors[1].status = 'ACTIVE';
      return setup(res);
    }

    function setupWithAllOptionalNoneEnrolled() {
      // This is the default resAllFactors response. Creating this function for
      // consistency
      return setup(resAllFactors);
    }

    function setupWithAllOptionalSomeEnrolled() {
      var res = deepClone(resAllFactors);
      res.response._embedded.factors[0].status = 'ACTIVE';
      return setup(res);
    }

    function setupWithOktaVerifyPushWithSofttokenEnrolled() {
      var res = deepClone(resPush);
      res.response._embedded.factors[0].status = 'ACTIVE';
      return setup(res);
    }

    function setupWithAllEnrolledButOktaVerifyPushWithSofttokenEnrolled() {
      var res = deepClone(resPush);
      res.response._embedded.factors[0].status = 'ACTIVE';
      res.response._embedded.factors[2].status = 'ACTIVE';
      return setup([res, deepClone(resSuccess)]);
    }

    function setupWithOktaVerifyPushWithPushEnrolled() {
      var res = deepClone(resPush);
      res.response._embedded.factors[0].status = 'ACTIVE';
      res.response._embedded.factors[1].status = 'ACTIVE';
      return setup(res);
    }

    function itHasIconAndText(factorName, iconClass, title, subtitle, res) {
      itp('has right icon', function () {
        return setup(res).then(function (test) {
          expect(test.form.factorIconClass(factorName)).toBe('factor-icon ' + iconClass);
        });
      });
      itp('has right title', function () {
        return setup(res).then(function (test) {
          expect(test.form.factorTitle(factorName)).toBe(title);
        });
      });
      itp('has right subtitle', function () {
        return setup(res).then(function (test) {
          expect(test.form.factorSubtitle(factorName)).toBe(subtitle);
        });
      });
    }

    afterEach(function () {
      $sandbox.empty();
    });

    describe('General', function () {
      itp('has correct title', function () {
        return setup(resAllFactors).then(function (test) {
          expect(test.form.titleText()).toBe('Set up multifactor authentication');
        });
      });
      itp('shows security beacon with saved security image if security image is enabled', function () {
        return setup(resAllFactors, true).then(function (test) {
          expect(test.beacon.isSecurityBeacon()).toBe(true);
        });
      });
    });

    describe('Wizard', function () {

      describe('Required', function () {
        itp('has the correct subtitle text', function () {
          return setupWithRequiredNoneEnrolled().then(function (test) {
            expect(test.form.subtitleText()).toBe(
              'Your company requires multifactor authentication to add an ' +
              'additional layer of security when signing into your Okta account'
            );
          });
        });
        itp('has the correct list title of "Setup required"', function () {
          return setupWithRequiredNoneEnrolled().then(function (test) {
            expect(test.form.requiredFactorListTitle()).toBe('Setup required');
          });
        });
        itp('has the correct list subtitle of "x of y"', function () {
          return setupWithRequiredNoneEnrolled().then(function (test) {
            expect(test.form.requiredFactorListSubtitle()).toBe('1 of 4');
          });
        });
        itp('chooses the first unenrolled required factor as the current factor', function () {
          return setupWithRequiredSomeRequiredEnrolled().then(function (test) {
            // GOOGLE_AUTH is the current factor in this test
            expect(test.form.isFactorMinimized('GOOGLE_AUTH')).toBe(false);
          });
        });
        itp('minimizes factors that are not current', function () {
          return setupWithRequiredNoneEnrolled().then(function (test) {
            // OKTA_VERIFY is the current factor, and GOOGLE_AUTH, QUESTION, and RSA are
            // the other required factors in this test
            expect(test.form.isFactorMinimized('OKTA_VERIFY')).toBe(false);
            expect(test.form.isFactorMinimized('GOOGLE_AUTH')).toBe(true);
            expect(test.form.isFactorMinimized('QUESTION')).toBe(true);
            expect(test.form.isFactorMinimized('RSA_SECURID')).toBe(true);
          });
        });
        itp('does not show optional factors', function () {
          return setupWithRequiredNoneEnrolled().then(function (test) {
            expect(test.form.optionalFactorList().length).toBe(0);
            expect(test.form.factorRow('SYMANTEC_VIP').length).toBe(0);
            expect(test.form.factorRow('DUO').length).toBe(0);
            expect(test.form.factorRow('SMS').length).toBe(0);
          });
        });
        itp('has the button text "Configure factor" if no required factors have been enrolled', function () {
          return setupWithRequiredNoneEnrolled().then(function (test) {
            expect(test.form.submitButtonText()).toBe('Configure factor');
          });
        });
        itp('has the button text "Configure next factor if a required factor has already been enrolled"', function () {
          return setupWithRequiredSomeRequiredEnrolled().then(function (test) {
            expect(test.form.submitButtonText()).toBe('Configure next factor');
          });
        });
        itp('shows a checkmark next to factors that have been enrolled', function () {
          return setupWithRequiredSomeRequiredEnrolled().then(function (test) {
            expect(test.form.factorHasSuccessCheck('OKTA_VERIFY')).toBe(true);
            expect(test.form.factorHasSuccessCheck('GOOGLE_AUTH')).toBe(false);
            expect(test.form.factorHasSuccessCheck('QUESTION')).toBe(false);
          });
        });
        itp('navigates to the current factor on save', function () {
          return setupWithRequiredSomeRequiredEnrolled().then(function (test) {
            test.form.submit();
            expect(test.router.navigate)
              .toHaveBeenCalledWith('signin/enroll/google/token%3Asoftware%3Atotp', { trigger: true });
          });
        });
      });

      describe('Optional/Finish', function () {
        itp('displays the general subtitle if there are only optional factors and none are enrolled', function () {
          return setupWithAllOptionalNoneEnrolled().then(function (test) {
            expect(test.form.subtitleText()).toBe(
              'Your company requires multifactor authentication to add an ' +
              'additional layer of security when signing into your Okta account'
            );
          });
        });
        itp('displays add optional subtitle if there are only optional factors and some are enrolled', function () {
          return setupWithAllOptionalSomeEnrolled().then(function (test) {
            expect(test.form.subtitleText()).toBe(
              'You can configure any additional optional factor or click finish'
            );
          });
        });
        itp('displays add optional subtitle if all required factors have been enrolled', function () {
          return setupWithRequiredAllRequiredEnrolled().then(function (test) {
            expect(test.form.subtitleText()).toBe(
              'You can configure any additional optional factor or click finish'
            );
          });
        });
        itp('does not show the enrolled list if no factors have been enrolled', function () {
          return setupWithAllOptionalNoneEnrolled().then(function (test) {
            expect(test.form.enrolledFactorList().length).toBe(0);
          });
        });
        itp('does not have a list title if there are no enrolled factors', function () {
          return setupWithAllOptionalNoneEnrolled().then(function (test) {
            expect(test.form.optionalFactorListTitle()).toBe('');
          });
        });
        itp('has a list title of "Enrolled factors" for factors that have been enrolled', function () {
          return setupWithAllOptionalSomeEnrolled().then(function (test) {
            expect(test.form.enrolledFactorListTitle()).toBe('Enrolled factors');
          });
        });
        itp('has a list title of "Additional optional factors" for the optional list if ' +
            'there are enrolled factors',
          function () {
            return setupWithAllOptionalSomeEnrolled().then(function (test) {
              expect(test.form.optionalFactorListTitle()).toBe('Additional optional factors');
            });
          }
        );
        itp('shows enrolled factors as a minimized list', function () {
          return setupWithRequiredAllRequiredEnrolled().then(function (test) {
            expect(test.form.isFactorMinimized('GOOGLE_AUTH')).toBe(true);
            expect(test.form.isFactorMinimized('QUESTION')).toBe(true);
          });
        });
        itp('shows optional factors in their expanded title + description state', function () {
          return setupWithRequiredAllRequiredEnrolled().then(function (test) {
            expect(test.form.isFactorMinimized('OKTA_VERIFY')).toBe(false);
            expect(test.form.isFactorMinimized('SYMANTEC_VIP')).toBe(false);
            expect(test.form.isFactorMinimized('RSA_SECURID')).toBe(false);
            expect(test.form.isFactorMinimized('DUO')).toBe(false);
            expect(test.form.isFactorMinimized('SMS')).toBe(false);
          });
        });
        itp('has a setup button for each unenrolled optional factor which navigates to the correct page', function () {
          return setupWithAllOptionalSomeEnrolled().then(function (test) {
            expect(test.form.factorButton('OKTA_VERIFY').length).toBe(1);
            expect(test.form.factorButton('GOOGLE_AUTH').length).toBe(1);
            expect(test.form.factorButton('SYMANTEC_VIP').length).toBe(1);
            expect(test.form.factorButton('RSA_SECURID').length).toBe(1);
            expect(test.form.factorButton('DUO').length).toBe(1);
            expect(test.form.factorButton('SMS').length).toBe(1);
            test.form.factorButton('SMS').click();
            expect(test.router.navigate)
              .toHaveBeenCalledWith('signin/enroll/okta/sms', { trigger: true });

          });
        });
        itp('has the button "Finish" if all required factors have been enrolled', function () {
          return setupWithRequiredAllRequiredEnrolled().then(function (test) {
            expect(test.form.submitButtonText()).toBe('Finish');
          });
        });
        itp('has the button "Finish" if only optional factors, but at least one has been enrolled', function () {
          return setupWithAllOptionalSomeEnrolled().then(function (test) {
            expect(test.form.submitButtonText()).toBe('Finish');
          });
        });
        itp('it uses the finish link to finish enrollment if Finish is clicked', function () {
          return setupWithAllOptionalSomeEnrolled().then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resAllFactors);
            test.form.submit();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/skip',
              data: {
                stateToken: 'testStateToken'
              }
            });
          });
        });
        itp('does not show the Finish button if there are no required factors and no ' +
            'optional factors have been enrolled',
          function () {
            return setupWithAllOptionalNoneEnrolled().then(function (test) {
              expect(test.form.submitButton().length).toBe(0);
            });
          }
        );
      });

    });

    describe('Factor list', function () {
      describe('OKTA_VERIFY', function () {
        itHasIconAndText(
          'OKTA_VERIFY',
          'mfa-okta-verify',
          'Okta Verify',
          'Enter single-use code from the mobile app.',
          resAllFactors
        );
      });
      describe('OKTA_VERIFY_PUSH', function () {
        itHasIconAndText(
          'OKTA_VERIFY_PUSH',
          'mfa-okta-verify',
          'Okta Verify',
          'Use a push notification sent to the mobile app.',
          resPush
        );
        itp('does not show okta totp row when push is available', function () {
          return setup(resPush).then(function (test) {
            expect(test.form.factorRow('OKTA_VERIFY').length).toBe(0);
          });
        });
        itp('does not show okta totp row when push is enrolled', function () {
          return setupWithOktaVerifyPushWithPushEnrolled().then(function (test) {
            expect(test.form.factorRow('OKTA_VERIFY').length).toBe(0);
            expect(test.form.factorRow('OKTA_VERIFY_PUSH').length).toBe(1);
            expect(test.form.factorHasSuccessCheck('OKTA_VERIFY_PUSH')).toBe(true);
          });
        });
        itp('does not show okta push row when softtoken is enrolled', function () {
          return setupWithOktaVerifyPushWithSofttokenEnrolled().then(function (test) {
            expect(test.form.factorRow('OKTA_VERIFY_PUSH').length).toBe(0);
            expect(test.form.factorRow('OKTA_VERIFY').length).toBe(1);
            expect(test.form.factorHasSuccessCheck('OKTA_VERIFY')).toBe(true);
          });
        });
        itp('redirects straight to finish link when all factors are enrolled \
          and OktaVerify softtoken factor enrolled while push is on', function () {
          return setupWithAllEnrolledButOktaVerifyPushWithSofttokenEnrolled().then(function () {
            Expect.isJsonPost($.ajax.calls.mostRecent().args, {
              url: 'https://foo.com/api/v1/authn/skip',
              data: {
                stateToken: 'testStateToken'
              }
            });
          });
        });
      });
      describe('GOOGLE_AUTH', function () {
        itHasIconAndText(
          'GOOGLE_AUTH',
          'mfa-google-auth',
          'Google Authenticator',
          'Enter single-use code from the mobile app.',
          resAllFactors
        );
      });
      describe('SYMANTEC_VIP', function () {
        itHasIconAndText(
          'SYMANTEC_VIP',
          'mfa-symantec',
          'Symantec VIP',
          'Enter a single-use code from a hardware token.',
          resAllFactors
        );
      });
      describe('RSA_SECURID', function () {
        itHasIconAndText(
          'RSA_SECURID',
          'mfa-rsa',
          'RSA SecurID',
          'Enter a single-use code from a hardware token.',
          resAllFactors
        );
      });
      describe('DUO', function () {
        itHasIconAndText(
          'DUO',
          'mfa-duo',
          'Duo Security',
          'Use Push Notification, SMS, or Voice call to authenticate.',
          resAllFactors
        );
      });
      describe('SMS', function () {
        itHasIconAndText(
          'SMS',
          'mfa-okta-sms',
          'SMS Authentication',
          'Enter a single-use code sent to your mobile phone.',
          resAllFactors
        );
        itp('has the right click event', function () {
          return setup(resAllFactors).then(function (test) {
            test.form.factorButton('SMS').click();
            expect(test.router.navigate)
              .toHaveBeenCalledWith('signin/enroll/okta/sms', { trigger: true });
          });
        });
      });
      describe('QUESTION', function () {
        itHasIconAndText(
          'QUESTION',
          'mfa-okta-security-question',
          'Security Question',
          'Use the answer to a security question to authenticate.',
          resAllFactors
        );
      });
    });

  });

});
