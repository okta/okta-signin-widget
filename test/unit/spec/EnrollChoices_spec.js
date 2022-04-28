/* eslint max-params: [2, 19] */
import { _ } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'v1/LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import EnrollChoicesForm from 'helpers/dom/EnrollChoicesForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resAllFactors from 'helpers/xhr/MFA_ENROLL_allFactors';
import resAllFactorsProfile from 'helpers/xhr/MFA_ENROLL_allFactorsProfile';
import resAllFactorsOnPrem from 'helpers/xhr/MFA_ENROLL_allFactors_OnPrem';
import resEnrolledHotp from 'helpers/xhr/MFA_ENROLL_enrolledHotp';
import resMultipleOktaVerify from 'helpers/xhr/MFA_ENROLL_multipleOktaVerify';
import resMultipleU2F from 'helpers/xhr/MFA_ENROLL_multipleU2F';
import resMultipleWebauthn from 'helpers/xhr/MFA_ENROLL_multipleWebauthn';
import resMultipleWebauthnProfile from 'helpers/xhr/MFA_ENROLL_multipleWebauthnProfile';
import resPush from 'helpers/xhr/MFA_ENROLL_push';
import resSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
import FactorUtil from '../../../src/util/FactorUtil';
const itp = Expect.itp;
const tick = Expect.tick;
const factorEnrollList = {
  QUESTION: {
    index: 0,
    factorType: 'question',
  },
  GOOGLE_AUTH: {
    index: 1,
    factorType: null,
  },
  OKTA_VERIFY: {
    index: 2,
    factorType: 'token:software:totp',
  },
  RSA_SECURID: {
    index: 3,
    factorType: 'token',
  },
  SYMANTEC_VIP: {
    index: 4,
    factorType: 'token',
  },
  YUBIKEY: {
    index: 5,
    factorType: 'token:hardware',
  },
  SMS: {
    index: 6,
    factorType: 'sms',
  },
  CALL: {
    index: 7,
    factorType: 'call',
  },
  DUO: {
    index: 8,
    factorType: 'web',
  },
  WEBAUTHN: {
    index: 9,
    factorType: 'webauthn',
  },
  U2F: {
    index: 10,
    factorType: 'u2f',
  },
  CUSTOM_CLAIMS: {
    index: 11,
    factorType: 'claims_provider',
  },
  GENERIC_SAML: {
    index: 12,
    factorType: 'assertion:saml2',
  },
  GENERIC_OIDC: {
    index: 13,
    factorType: 'assertion:oidc',
  },
  EMAIL: {
    index: 14,
    factorType: 'email',
  },
};

const enrolledWebauthnFactor = {
  factorId: '12345',
  factorType: 'webauthn',
  provider: 'FIDO',
  vendorName: 'FIDO',
};

Expect.describe('EnrollChoices', function() {
  function setup(res, showSecurityImage, webauthnEnabled, brandName) {
    const settings = {};

    if (webauthnEnabled) {
      settings['features.webauthn'] = true;
    }
    const setNextResponse = Util.mockAjax();
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: { issuer: baseUrl }
    });
    const router = new Router(
      _.extend(
        {
          el: $sandbox,
          baseUrl: baseUrl,
          features: {
            securityImage: showSecurityImage,
            webauthn: webauthnEnabled,
          },
          authClient: authClient,
          brandName: brandName,
        },
        settings
      )
    );

    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    Util.mockJqueryCss();
    setNextResponse(res);
    router.refreshAuthState('dummy-token');
    return Expect.waitForEnrollChoices({
      ac: authClient,
      setNextResponse: setNextResponse,
      router: router,
      beacon: new Beacon($sandbox),
      form: new EnrollChoicesForm($sandbox),
    });
  }

  // Poor man's deep clone since we don't use lodash
  function deepClone(res) {
    return JSON.parse(JSON.stringify(res));
  }

  function setGracePeriodEndDate(res, endDate) {
    const policy = res.response._embedded.policy || {};

    res.response._embedded.policy = _.extend(policy, {
      gracePeriod: {
        endDate,
      },
    });
  }

  function setupWithRequiredNoneEnrolled(brandName, endDate) {
    const res = deepClone(resAllFactors);

    res.response._embedded.factors[0].enrollment = 'REQUIRED';
    res.response._embedded.factors[1].enrollment = 'REQUIRED';
    res.response._embedded.factors[2].enrollment = 'REQUIRED';
    res.response._embedded.factors[3].enrollment = 'REQUIRED';
    if (endDate) {
      setGracePeriodEndDate(res, endDate);
    }
    return setup(res, false, false, brandName);
  }

  function setupWithRequiredNoneEnrolledOnPrem() {
    const res = deepClone(resAllFactorsOnPrem);

    res.response._embedded.factors[0].enrollment = 'REQUIRED';
    res.response._embedded.factors[1].enrollment = 'REQUIRED';
    res.response._embedded.factors[2].enrollment = 'REQUIRED';
    res.response._embedded.factors[3].enrollment = 'REQUIRED';
    res.response._embedded.factors[4].enrollment = 'REQUIRED';
    return setup(res);
  }

  function setupWithRequiredSomeRequiredEnrolled(endDate) {
    const res = deepClone(resAllFactors);

    res.response._embedded.factors[0].enrollment = 'REQUIRED';
    res.response._embedded.factors[1].enrollment = 'REQUIRED';
    res.response._embedded.factors[2].enrollment = 'REQUIRED';
    res.response._embedded.factors[2].status = 'ACTIVE';
    if (endDate) {
      setGracePeriodEndDate(res, endDate);
    }
    return setup(res);
  }

  function setupWithRequiredAllRequiredEnrolled(includeOnPrem, endDate) {
    const response = includeOnPrem ? resAllFactorsOnPrem : resAllFactors;
    const res = deepClone(response);

    res.response._embedded.factors[0].enrollment = 'REQUIRED';
    res.response._embedded.factors[0].status = 'ACTIVE';
    res.response._embedded.factors[1].enrollment = 'REQUIRED';
    res.response._embedded.factors[1].status = 'ACTIVE';
    if (endDate) {
      setGracePeriodEndDate(res, endDate);
    }
    return setup(res);
  }

  function setupWithAllOptionalNoneEnrolled(brandName, endDate) {
    const res = deepClone(resAllFactors);

    if (endDate) {
      setGracePeriodEndDate(res, endDate);
    }
    return setup(res, false, false, brandName);
  }

  function setupWithAllOptionalSomeEnrolled(includeOnPrem, endDate) {
    const response = includeOnPrem ? resAllFactorsOnPrem : resAllFactors;
    const res = deepClone(response);

    res.response._embedded.factors[0].status = 'ACTIVE';
    if (endDate) {
      setGracePeriodEndDate(res, endDate);
    }
    return setup(res);
  }

  function setupWithOktaVerifyPushWithSofttokenEnrolled() {
    const res = deepClone(resPush);

    res.response._embedded.factors[0].status = 'ACTIVE';
    return setup(res);
  }

  function setupWithAllEnrolledButOktaVerifyPushWithSofttokenEnrolled() {
    const res = deepClone(resPush);

    res.response._embedded.factors[0].status = 'ACTIVE';
    res.response._embedded.factors[2].status = 'ACTIVE';
    return setup([res, deepClone(resSuccess)]);
  }

  function setupWithOktaVerifyPushWithPushEnrolled() {
    const res = deepClone(resPush);

    res.response._embedded.factors[0].status = 'ACTIVE';
    res.response._embedded.factors[1].status = 'ACTIVE';
    return setup(res);
  }

  function setupMultipleFactorEnrollments(options) {
    const res = options.singleFactorRes
      ? deepClone(options.singleFactorRes)
      : options.useProfiles ? deepClone(resAllFactorsProfile) : deepClone(resAllFactors);
    const index = options.singleFactorRes ? 0 : factorEnrollList[options.factorName].index;
    const factor = res.response._embedded.factors[index];

    factor.status = options.status;
    factor.enrollment = options.enrollment;
    if (options.useProfiles) {
      setProfileData(factor.profiles[0], options.cardinality, options.enrolledFactor);
    } else {
      factor.policy.enrollment = options.cardinality;
    }
    return setup(res, false, options.webauthnEnabled);
  }

  function setProfileData(profile, cardinality, enrolledFactor) {
    const cardinalityData = {
      min: cardinality.minimum,
      max: cardinality.maximum,
    };

    profile._embedded.features[0].cardinality = cardinalityData;
    for (var i = 0; i < cardinality.enrolled; i++) {
      profile._embedded.enrolledFactors.push(enrolledFactor);
    }
  }

  function setupMultipleRequiredActiveEnrollmentsForFactorAndAnotherFactorRequired(options) {
    const index = factorEnrollList[options.factorName].index;
    const res = deepClone(resAllFactors);

    // setting question to required
    res.response._embedded.factors[0].enrollment = 'REQUIRED';
    res.response._embedded.factors[index].status = 'ACTIVE';
    res.response._embedded.factors[index].enrollment = 'REQUIRED';
    res.response._embedded.factors[index].policy.enrollment = options.cardinality;
    return setup(res, false, options.webauthnEnabled);
  }

  function itHasIconAndText(factorName, iconClass, title, subtitle, res, webauthnEnabled, brandName) {
    itp('has right icon', function() {
      return setup(res, false, webauthnEnabled, brandName).then(function(test) {
        expect(test.form.factorIconClass(factorName)).toBe('factor-icon ' + iconClass);
      });
    });
    itp('has right title', function() {
      return setup(res, false, webauthnEnabled, brandName).then(function(test) {
        expect(test.form.factorTitle(factorName)).toBe(title);
      });
    });
    itp('has right subtitle', function() {
      return setup(res, false, webauthnEnabled, brandName).then(function(test) {
        expect(test.form.factorSubtitle(factorName)).toBe(subtitle);
      });
    });
  }

  describe('General', function() {
    itp('has correct title', function() {
      return setup(resAllFactors).then(function(test) {
        expect(test.form.titleText()).toBe('Set up multifactor authentication');
      });
    });
    itp('shows security beacon with saved security image if security image is enabled', function() {
      return setup(resAllFactors, true).then(function(test) {
        expect(test.beacon.isSecurityBeacon()).toBe(true);
      });
    });
  });

  describe('Wizard', function() {
    describe('Required', function() {
      itp('has the correct subtitle text', function() {
        return setupWithRequiredNoneEnrolled().then(function(test) {
          expect(test.form.subtitleText()).toBe(
            'Your company requires multifactor authentication to add an ' +
              'additional layer of security when signing in to your account'
          );
        });
      });
      itp('has the correct subtitle text if config has a brandName', function() {
        return setupWithRequiredNoneEnrolled('Spaghett Inc.').then(function(test) {
          expect(test.form.subtitleText()).toBe(
            'Your company requires multifactor authentication to add an ' +
              'additional layer of security when signing in to your Spaghett Inc. account'
          );
        });
      });
      itp('has the correct list title of "Setup required"', function() {
        return setupWithRequiredNoneEnrolled().then(function(test) {
          expect(test.form.requiredFactorListTitle()).toBe('Setup required');
        });
      });
      itp('chooses the first unenrolled required factor as the current factor', function() {
        return setupWithRequiredSomeRequiredEnrolled().then(function(test) {
          // GOOGLE_AUTH is the current factor in this test
          expect(test.form.isFactorMinimized('GOOGLE_AUTH')).toBe(false);
        });
      });
      itp('minimizes factors that are not current', function() {
        return setupWithRequiredNoneEnrolled().then(function(test) {
          // OKTA_VERIFY is the current factor, and GOOGLE_AUTH, QUESTION, and RSA are
          // the other required factors in this test
          expect(test.form.isFactorMinimized('OKTA_VERIFY')).toBe(false);
          expect(test.form.isFactorMinimized('GOOGLE_AUTH')).toBe(true);
          expect(test.form.isFactorMinimized('QUESTION')).toBe(true);
          expect(test.form.isFactorMinimized('RSA_SECURID')).toBe(true);
        });
      });
      itp('minimizes factors that are not current (On-Prem)', function() {
        return setupWithRequiredNoneEnrolledOnPrem().then(function(test) {
          // OKTA_VERIFY is the current factor, and GOOGLE_AUTH, QUESTION, and ON_PREM are
          // the other required factors in this test
          expect(test.form.isFactorMinimized('OKTA_VERIFY_PUSH')).toBe(false);
          expect(test.form.isFactorMinimized('QUESTION')).toBe(true);
          expect(test.form.isFactorMinimized('GOOGLE_AUTH')).toBe(true);
          expect(test.form.isFactorMinimized('ON_PREM')).toBe(true);
        });
      });
      itp('does not show optional factors', function() {
        return setupWithRequiredNoneEnrolled().then(function(test) {
          expect(test.form.optionalFactorList().length).toBe(0);
          expect(test.form.factorRow('SYMANTEC_VIP').length).toBe(0);
          expect(test.form.factorRow('DUO').length).toBe(0);
          expect(test.form.factorRow('SMS').length).toBe(0);
          expect(test.form.factorRow('EMAIL').length).toBe(0);
          expect(test.form.factorRow('GENERIC_SAML').length).toBe(0);
          expect(test.form.factorRow('GENERIC_OIDC').length).toBe(0);
          expect(test.form.factorRow('CUSTOM_CLAIMS').length).toBe(0);
        });
      });
      itp('has the button text "Configure factor" if no required factors have been enrolled', function() {
        return setupWithRequiredNoneEnrolled().then(function(test) {
          expect(test.form.submitButtonText()).toBe('Configure factor');
        });
      });
      itp('does not have skip set up link when all factors are required', function() {
        return setupWithRequiredNoneEnrolled().then(function(test) {
          expect(test.form.skipSetUpLink().length).toBe(0);
        });
      });
      itp('has the button text "Configure next factor if a required factor has already been enrolled"', function() {
        return setupWithRequiredSomeRequiredEnrolled().then(function(test) {
          expect(test.form.submitButtonText()).toBe('Configure next factor');
        });
      });
      itp('shows a green checkmark next to factors that have been enrolled', function() {
        return setupWithRequiredSomeRequiredEnrolled().then(function(test) {
          expect(test.form.factorHasSuccessCheck('OKTA_VERIFY')).toBe(true);
          expect(test.form.factorHasSuccessCheck('GOOGLE_AUTH')).toBe(false);
          expect(test.form.factorHasSuccessCheck('QUESTION')).toBe(false);
        });
      });
      itp('shows a gray checkmark next to factors that have been enrolled', function() {
        return setupWithRequiredSomeRequiredEnrolled().then(function(test) {
          expect(test.form.factorHasPendingCheck('OKTA_VERIFY')).toBe(false);
          expect(test.form.factorHasPendingCheck('GOOGLE_AUTH')).toBe(true);
          expect(test.form.factorHasPendingCheck('QUESTION')).toBe(true);
        });
      });
      itp('navigates to the current factor on save', function() {
        return setupWithRequiredSomeRequiredEnrolled().then(function(test) {
          test.form.submit();
          expect(test.router.navigate).toHaveBeenCalledWith('signin/enroll/google/token%3Asoftware%3Atotp', {
            trigger: true,
          });
        });
      });
      itp(
        'has skip set up link when it is in the response and at least 1 required factor is enrolled but all required are not enrolled yet',
        function() {
          return setupWithRequiredSomeRequiredEnrolled().then(function(test) {
            expect(test.form.skipSetUpLink().length).toBe(1);
          });
        }
      );
    });

    describe('Optional/Finish', function() {
      itp('displays the general subtitle if there are only optional factors and none are enrolled', function() {
        return setupWithAllOptionalNoneEnrolled().then(function(test) {
          expect(test.form.subtitleText()).toBe(
            'Your company requires multifactor authentication to add an ' +
              'additional layer of security when signing in to your account'
          );
        });
      });
      itp(
        'displays the specific subtitle if there are only optional factors and none are enrolled if config has a brandName',
        function() {
          return setupWithAllOptionalNoneEnrolled('Spaghetti Inc.').then(function(test) {
            expect(test.form.subtitleText()).toBe(
              'Your company requires multifactor authentication to add an ' +
                'additional layer of security when signing in to your Spaghetti Inc. account'
            );
          });
        }
      );
      itp('displays add optional subtitle if there are only optional factors and some are enrolled', function() {
        return setupWithAllOptionalSomeEnrolled().then(function(test) {
          expect(test.form.subtitleText()).toBe('You can configure any additional optional factor or click finish');
        });
      });
      itp('displays add optional subtitle if all required factors have been enrolled', function() {
        return setupWithRequiredAllRequiredEnrolled().then(function(test) {
          expect(test.form.subtitleText()).toBe('You can configure any additional optional factor or click finish');
        });
      });
      itp('does not have skip set up link when all factors are optional none enrolled', function() {
        return setupWithAllOptionalNoneEnrolled().then(function(test) {
          expect(test.form.skipSetUpLink().length).toBe(0);
        });
      });
      itp('does not have skip set up link when all factors are optional some enrolled', function() {
        return setupWithAllOptionalSomeEnrolled().then(function(test) {
          expect(test.form.skipSetUpLink().length).toBe(0);
        });
      });
      itp('does not have skip set up link when all required factors are enrolled', function() {
        return setupWithRequiredAllRequiredEnrolled().then(function(test) {
          expect(test.form.skipSetUpLink().length).toBe(0);
        });
      });
      itp('does not show the enrolled list if no factors have been enrolled', function() {
        return setupWithAllOptionalNoneEnrolled().then(function(test) {
          expect(test.form.enrolledFactorList().length).toBe(0);
        });
      });
      itp('does not have a list title if there are no enrolled factors', function() {
        return setupWithAllOptionalNoneEnrolled().then(function(test) {
          expect(test.form.optionalFactorListTitle()).toBe('');
        });
      });
      itp('has a list title of "Enrolled factors" for factors that have been enrolled', function() {
        return setupWithAllOptionalSomeEnrolled().then(function(test) {
          expect(test.form.enrolledFactorListTitle()).toBe('Enrolled factors');
        });
      });
      itp(
        'has a list title of "Additional optional factors" for the optional list if ' + 'there are enrolled factors',
        function() {
          return setupWithAllOptionalSomeEnrolled().then(function(test) {
            expect(test.form.optionalFactorListTitle()).toBe('Additional optional factors');
          });
        }
      );
      itp('shows enrolled factors as a minimized list', function() {
        return setupWithRequiredAllRequiredEnrolled().then(function(test) {
          expect(test.form.isFactorMinimized('GOOGLE_AUTH')).toBe(true);
          expect(test.form.isFactorMinimized('QUESTION')).toBe(true);
        });
      });
      itp('shows optional factors in their expanded title + description state', function() {
        return setupWithRequiredAllRequiredEnrolled().then(function(test) {
          expect(test.form.isFactorMinimized('OKTA_VERIFY')).toBe(false);
          expect(test.form.isFactorMinimized('SYMANTEC_VIP')).toBe(false);
          expect(test.form.isFactorMinimized('RSA_SECURID')).toBe(false);
          expect(test.form.isFactorMinimized('DUO')).toBe(false);
          expect(test.form.isFactorMinimized('WINDOWS_HELLO')).toBe(false);
          expect(test.form.isFactorMinimized('SMS')).toBe(false);
          expect(test.form.isFactorMinimized('EMAIL')).toBe(false);
          expect(test.form.isFactorMinimized('CALL')).toBe(false);
          expect(test.form.isFactorMinimized('GENERIC_SAML')).toBe(false);
          expect(test.form.isFactorMinimized('GENERIC_OIDC')).toBe(false);
          expect(test.form.isFactorMinimized('CUSTOM_CLAIMS')).toBe(false);
        });
      });
      itp('shows optional factors in their expanded title + description state (On-Prem)', function() {
        return setupWithRequiredAllRequiredEnrolled(true).then(function(test) {
          expect(test.form.isFactorMinimized('OKTA_VERIFY')).toBe(false);
          expect(test.form.isFactorMinimized('SYMANTEC_VIP')).toBe(false);
          expect(test.form.isFactorMinimized('ON_PREM')).toBe(false);
          expect(test.form.isFactorMinimized('DUO')).toBe(false);
          expect(test.form.isFactorMinimized('WINDOWS_HELLO')).toBe(false);
          expect(test.form.isFactorMinimized('SMS')).toBe(false);
          expect(test.form.isFactorMinimized('EMAIL')).toBe(false);
          expect(test.form.isFactorMinimized('GENERIC_SAML')).toBe(false);
          expect(test.form.isFactorMinimized('GENERIC_OIDC')).toBe(false);
          expect(test.form.isFactorMinimized('CUSTOM_CLAIMS')).toBe(false);
        });
      });
      itp('has a setup button for each unenrolled optional factor which navigates to the correct page', function() {
        return setupWithAllOptionalSomeEnrolled().then(function(test) {
          expect(test.form.factorButton('OKTA_VERIFY').length).toBe(1);
          expect(test.form.factorButton('GOOGLE_AUTH').length).toBe(1);
          expect(test.form.factorButton('SYMANTEC_VIP').length).toBe(1);
          expect(test.form.factorButton('RSA_SECURID').length).toBe(1);
          expect(test.form.factorButton('DUO').length).toBe(1);
          expect(test.form.factorButton('WINDOWS_HELLO').length).toBe(1);
          expect(test.form.factorButton('SMS').length).toBe(1);
          expect(test.form.factorButton('EMAIL').length).toBe(1);
          expect(test.form.factorButton('CALL').length).toBe(1);
          expect(test.form.factorButton('GENERIC_SAML').length).toBe(1);
          expect(test.form.factorButton('GENERIC_OIDC').length).toBe(1);
          expect(test.form.factorButton('CUSTOM_CLAIMS').length).toBe(1);
          test.form.factorButton('SMS').click();
          expect(test.router.navigate).toHaveBeenCalledWith('signin/enroll/okta/sms', { trigger: true });
        });
      });
      itp(
        'has a setup button for each unenrolled optional factor which navigates to the correct page (On-Prem)',
        function() {
          return setupWithAllOptionalSomeEnrolled(true).then(function(test) {
            expect(test.form.factorButton('OKTA_VERIFY_PUSH').length).toBe(0);
            expect(test.form.factorButton('QUESTION').length).toBe(1);
            expect(test.form.factorButton('GOOGLE_AUTH').length).toBe(1);
            expect(test.form.factorButton('SYMANTEC_VIP').length).toBe(1);
            expect(test.form.factorButton('YUBIKEY').length).toBe(1);
            expect(test.form.factorButton('ON_PREM').length).toBe(1);
            expect(test.form.factorButton('DUO').length).toBe(1);
            expect(test.form.factorButton('WINDOWS_HELLO').length).toBe(1);
            expect(test.form.factorButton('U2F').length).toBe(1);
            expect(test.form.factorButton('CALL').length).toBe(1);
            expect(test.form.factorButton('SMS').length).toBe(1);
            expect(test.form.factorButton('EMAIL').length).toBe(1);
            expect(test.form.factorButton('GENERIC_SAML').length).toBe(1);
            expect(test.form.factorButton('GENERIC_OIDC').length).toBe(1);
            expect(test.form.factorButton('CUSTOM_CLAIMS').length).toBe(1);
            test.form.factorButton('SMS').click();
            expect(test.router.navigate).toHaveBeenCalledWith('signin/enroll/okta/sms', { trigger: true });
          });
        }
      );
      itp('has the button "Finish" if all required factors have been enrolled', function() {
        return setupWithRequiredAllRequiredEnrolled().then(function(test) {
          expect(test.form.submitButtonText()).toBe('Finish');
        });
      });
      itp('has the button "Finish" if only optional factors, but at least one has been enrolled', function() {
        return setupWithAllOptionalSomeEnrolled().then(function(test) {
          expect(test.form.submitButtonText()).toBe('Finish');
        });
      });
      itp('it uses the finish link to finish enrollment if Finish is clicked', function() {
        return setupWithAllOptionalSomeEnrolled()
          .then(function(test) {
            Util.resetAjaxRequests();
            test.setNextResponse(resAllFactors);
            test.form.submit();
            return tick();
          })
          .then(function() {
            expect(Util.numAjaxRequests()).toBe(1);
            Expect.isJsonPost(Util.getAjaxRequest(0), {
              url: 'https://foo.com/api/v1/authn/skip',
              data: {
                stateToken: 'testStateToken',
              },
            });
          });
      });
      itp(
        'does not show the Finish button if there are no required factors and no ' +
          'optional factors have been enrolled',
        function() {
          return setupWithAllOptionalNoneEnrolled().then(function(test) {
            expect(test.form.submitButton().length).toBe(0);
          });
        }
      );
    });

    describe('Grace period', function() {
      beforeEach(function() {
        const today = new Date('2019-06-25T00:00:00.000Z');

        jasmine.clock().mockDate(today);
      });
      describe('all factors are required and none are enrolled', function() {
        itp('has default subtitle', function() {
          return setupWithRequiredNoneEnrolled(null, '2019-06-28T00:00:00.000Z').then(function(test) {
            expect(test.form.subtitleText()).toBe(
              'Your company requires multifactor authentication to add an ' +
                'additional layer of security when signing in to your account'
            );
          });
        });
      });
      describe('all factors are required and at least one is enrolled', function() {
        itp('has default subtitle when endDate is null', function() {
          return setupWithRequiredSomeRequiredEnrolled(null).then(function(test) {
            expect(test.form.subtitleText()).toBe(
              'Your company requires multifactor authentication to add an additional ' +
                'layer of security when signing in to your account'
            );
          });
        });
        itp('has grace period subtitle when endDate is not null', function() {
          return setupWithRequiredSomeRequiredEnrolled('2019-06-28T00:00:00.000Z').then(function(test) {
            expect(test.form.subtitleText()).toBe(
              'Your company recommends setting up additional factors for authentication. ' +
                'Set up will be required in: 3 day(s).'
            );
          });
        });
        itp(
          'has grace period less than one day subtitle when time remaining is less \
          than a day',
          function() {
            const today = new Date('2019-06-25T11:59:59.000Z');

            jasmine.clock().mockDate(today);
            return setupWithRequiredSomeRequiredEnrolled('2019-06-26T00:00:00.000Z').then(function(test) {
              expect(test.form.subtitleText()).toBe(
                'Your company recommends setting up additional factors for authentication. ' +
                  'Set up will be required in: less than 1 day.'
              );
            });
          }
        );
        itp('has default subtitle when todays date is past endDate', function() {
          const today = new Date('2019-06-26T11:59:59.000Z');

          jasmine.clock().mockDate(today);
          return setupWithRequiredSomeRequiredEnrolled('2019-06-26T00:00:00.000Z').then(function(test) {
            expect(test.form.subtitleText()).toBe(
              'Your company requires multifactor authentication to add an additional ' +
                'layer of security when signing in to your account'
            );
          });
        });
      });
      describe('all factors are required and all are enrolled', function() {
        itp('has optional subtitle', function() {
          return setupWithRequiredAllRequiredEnrolled(null, '2019-06-28T00:00:00.000Z').then(function(test) {
            expect(test.form.subtitleText()).toBe('You can configure any additional optional factor or click finish');
          });
        });
      });
      describe('all factors optional and none are enrolled', function() {
        itp('has default subtitle', function() {
          return setupWithAllOptionalNoneEnrolled(null, '2019-06-28T00:00:00.000Z').then(function(test) {
            expect(test.form.subtitleText()).toBe(
              'Your company requires multifactor authentication to add an ' +
                'additional layer of security when signing in to your account'
            );
          });
        });
      });
      describe('all factors optional and some are enrolled', function() {
        itp('has optional subtitle', function() {
          return setupWithAllOptionalSomeEnrolled(null, '2019-06-28T00:00:00.000Z').then(function(test) {
            expect(test.form.subtitleText()).toBe('You can configure any additional optional factor or click finish');
          });
        });
      });
    });
  });

  describe('Factor list', function() {
    describe('OKTA_VERIFY', function() {
      itHasIconAndText(
        'OKTA_VERIFY',
        'mfa-okta-verify',
        'Okta Verify',
        'Enter single-use code from the mobile app.',
        resAllFactors
      );
    });
    describe('OKTA_VERIFY_PUSH', function() {
      itHasIconAndText(
        'OKTA_VERIFY_PUSH',
        'mfa-okta-verify',
        'Okta Verify',
        'Use a push notification sent to the mobile app.',
        resPush
      );
      itp('does not show okta totp row when push is available', function() {
        return setup(resPush).then(function(test) {
          expect(test.form.factorRow('OKTA_VERIFY').length).toBe(0);
        });
      });
      itp('does not show okta totp row when push is enrolled', function() {
        return setupWithOktaVerifyPushWithPushEnrolled().then(function(test) {
          expect(test.form.factorRow('OKTA_VERIFY').length).toBe(0);
          expect(test.form.factorRow('OKTA_VERIFY_PUSH').length).toBe(1);
          expect(test.form.factorHasSuccessCheck('OKTA_VERIFY_PUSH')).toBe(true);
        });
      });
      itp('does not show okta push row when softtoken is enrolled', function() {
        return setupWithOktaVerifyPushWithSofttokenEnrolled().then(function(test) {
          expect(test.form.factorRow('OKTA_VERIFY_PUSH').length).toBe(0);
          expect(test.form.factorRow('OKTA_VERIFY').length).toBe(1);
          expect(test.form.factorHasSuccessCheck('OKTA_VERIFY')).toBe(true);
        });
      });
      itp(
        'redirects straight to finish link when all factors are enrolled \
          and OktaVerify softtoken factor enrolled while push is on',
        function() {
          return setupWithAllEnrolledButOktaVerifyPushWithSofttokenEnrolled().then(function() {
            Expect.isJsonPost(Util.lastAjaxRequest(), {
              url: 'https://foo.com/api/v1/authn/skip',
              data: {
                stateToken: 'testStateToken',
              },
            });
          });
        }
      );
    });
    describe('GOOGLE_AUTH', function() {
      itHasIconAndText(
        'GOOGLE_AUTH',
        'mfa-google-auth',
        'Google Authenticator',
        'Enter single-use code from the mobile app.',
        resAllFactors
      );
    });
    describe('SYMANTEC_VIP', function() {
      itHasIconAndText(
        'SYMANTEC_VIP',
        'mfa-symantec',
        'Symantec VIP',
        'Enter a single-use code from a hardware token.',
        resAllFactors
      );
    });
    describe('RSA_SECURID', function() {
      itHasIconAndText(
        'RSA_SECURID',
        'mfa-rsa',
        'RSA SecurID',
        'Enter a single-use code from a hardware token.',
        resAllFactors
      );
    });
    describe('ON_PREM', function() {
      itHasIconAndText(
        'ON_PREM',
        'mfa-onprem',
        'On-Prem MFA',
        'Enter a single-use code from a hardware token.',
        resAllFactorsOnPrem
      );
    });
    describe('DUO', function() {
      itHasIconAndText(
        'DUO',
        'mfa-duo',
        'Duo Security',
        'Use Push Notification, SMS, or Voice call to authenticate.',
        resAllFactors
      );
    });
    describe('SMS', function() {
      itHasIconAndText(
        'SMS',
        'mfa-okta-sms',
        'SMS Authentication',
        'Enter a single-use code sent to your mobile phone.',
        resAllFactors
      );
      itp('has the right click event', function() {
        return setup(resAllFactors).then(function(test) {
          test.form.factorButton('SMS').click();
          expect(test.router.navigate).toHaveBeenCalledWith('signin/enroll/okta/sms', { trigger: true });
        });
      });
    });
    describe('CALL', function() {
      itHasIconAndText(
        'CALL',
        'mfa-okta-call',
        'Voice Call Authentication',
        'Use a phone to authenticate by following voice instructions.',
        resAllFactors
      );
      itp('has the right click event', function() {
        return setup(resAllFactors).then(function(test) {
          test.form.factorButton('CALL').click();
          expect(test.router.navigate).toHaveBeenCalledWith('signin/enroll/okta/call', { trigger: true });
        });
      });
    });
    describe('EMAIL', function() {
      itHasIconAndText(
        'EMAIL',
        'mfa-okta-email',
        'Email Authentication',
        'Enter a verification code sent to your email.',
        resAllFactors
      );
      itp('has the right click event', function() {
        return setup(resAllFactors).then(function(test) {
          test.form.factorButton('EMAIL').click();
          expect(test.router.navigate).toHaveBeenCalledWith('signin/enroll/okta/email', { trigger: true });
        });
      });
    });
    describe('U2F', function() {
      itHasIconAndText(
        'U2F',
        'mfa-u2f',
        'Security Key (U2F)',
        'Use a Universal 2nd Factor (U2F) security key to sign in.',
        resAllFactors
      );
    });
    describe('U2F WITH BRANDNAME', function() {
      itHasIconAndText(
        'U2F',
        'mfa-u2f',
        'Security Key (U2F)',
        'Use a Universal 2nd Factor (U2F) security key to sign in to Spaghetti Inc..',
        resAllFactors,
        false,
        'Spaghetti Inc.'
      );
    });
    describe('WEBAUTHN', function() {
      itHasIconAndText(
        'WEBAUTHN',
        'mfa-webauthn',
        'Security Key or Biometric Authenticator',
        'Use a security key (USB or bluetooth) or a biometric authenticator (Windows Hello, Touch ID, etc.)',
        resAllFactors,
        true
      );
    });
    describe('Hotp', function() {
      itHasIconAndText(
        'CUSTOM_HOTP',
        'mfa-hotp',
        'Entrust',
        'Enter a single-use code from an authenticator.',
        resAllFactors
      );

      itp('displays enrolled profile name if already enrolled', function() {
        return setup(resEnrolledHotp).then(function(test) {
          expect(test.form.factorTitle('CUSTOM_HOTP')).toBe('Entrust2');
          expect(test.form.factorHasSuccessCheck('CUSTOM_HOTP')).toBe(true);
        });
      });
    });
    describe('QUESTION', function() {
      itHasIconAndText(
        'QUESTION',
        'mfa-okta-security-question',
        'Security Question',
        'Use the answer to a security question to authenticate.',
        resAllFactors
      );
    });
    describe('CUSTOM CLAIMS FACTOR', function() {
      itHasIconAndText(
        'CUSTOM_CLAIMS',
        'mfa-custom-factor',
        'IDP factor',
        'Redirect to a third party MFA provider to sign in to Okta.',
        resAllFactors
      );
    });
    describe('CUSTOM SAML FACTOR', function() {
      itHasIconAndText(
        'GENERIC_SAML',
        'mfa-custom-factor',
        'Third Party Factor',
        'Redirect to a third party MFA provider to sign in.',
        resAllFactors
      );
    });
    describe('CUSTOM SAML FACTOR WITH BRANDNAME', function() {
      itHasIconAndText(
        'GENERIC_SAML',
        'mfa-custom-factor',
        'Third Party Factor',
        'Redirect to a third party MFA provider to sign in to Spaghetti Inc..',
        resAllFactors,
        false,
        'Spaghetti Inc.'
      );
    });
    describe('CUSTOM OIDC FACTOR', function() {
      itHasIconAndText(
        'GENERIC_OIDC',
        'mfa-custom-factor',
        'OIDC Factor',
        'Redirect to a third party MFA provider to sign in.',
        resAllFactors
      );
    });
    describe('CUSTOM OIDC FACTOR WITH BRANDNAME', function() {
      itHasIconAndText(
        'GENERIC_OIDC',
        'mfa-custom-factor',
        'OIDC Factor',
        'Redirect to a third party MFA provider to sign in to Spaghetti Inc..',
        resAllFactors,
        false,
        'Spaghetti Inc.'
      );
    });
  });

  describe('Factor list order', function() {
    itp('is in correct order', function() {
      return setup(resAllFactors).then(function(test) {
        const factorList = test.form.getFactorList();

        expect(factorList).toEqual([
          'OKTA_VERIFY',
          'U2F',
          'WINDOWS_HELLO',
          'YUBIKEY',
          'GOOGLE_AUTH',
          'CUSTOM_HOTP',
          'SMS',
          'CALL',
          'EMAIL',
          'QUESTION',
          'DUO',
          'SYMANTEC_VIP',
          'RSA_SECURID',
          'CUSTOM_CLAIMS',
          'GENERIC_SAML',
          'GENERIC_OIDC',
        ]);
      });
    });
    itp('with push and onPrem is in correct order', function() {
      return setup(resAllFactorsOnPrem).then(function(test) {
        const factorList = test.form.getFactorList();

        expect(factorList).toEqual([
          'OKTA_VERIFY_PUSH',
          'U2F',
          'WINDOWS_HELLO',
          'YUBIKEY',
          'GOOGLE_AUTH',
          'SMS',
          'CALL',
          'EMAIL',
          'QUESTION',
          'DUO',
          'SYMANTEC_VIP',
          'ON_PREM',
          'CUSTOM_CLAIMS',
          'GENERIC_SAML',
          'GENERIC_OIDC',
        ]);
      });
    });
  });

  describe('Multiple Enrollments', function() {
    function testMultipleEnrollmentsForFactor(factorName, webauthnEnabled, useProfiles, enrolledFactor) {
      itp('does not display cardinality text if it is optional', function() {
        const res = useProfiles ? resAllFactorsProfile : resAllFactors;

        return setup(res, false, webauthnEnabled).then(function(test) {
          expect(test.form.factorButtonText(factorName)).toBe('Setup');
          expect(test.form.factorCardinalityText(factorName)).toBe('');
        });
      });
      itp('does not display cardinality text when factor is REQUIRED and maximum=1', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'NOT_SETUP',
          enrollment: 'REQUIRED',
          cardinality: { enrolled: 0, minimum: 0, maximum: 1 },
          webauthnEnabled,
          useProfiles,
        }).then(function(test) {
          expect(test.form.factorButtonText(factorName)).toBe('');
          expect(test.form.factorCardinalityText(factorName)).toBe('');
          expect(test.form.submitButtonText()).toBe('Configure factor');
        });
      });
      itp('displays correct button and cardinality text when enrolled=1 optional=2', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'ACTIVE',
          enrollment: 'OPTIONAL',
          cardinality: { enrolled: 1, minimum: 0, maximum: 3 },
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          const factorRows = test.form.factorRow(factorName);

          //displays one row for enrolled, one for optional
          expect(factorRows.length).toBe(2);

          const enrolledFactorRow = factorRows[0];
          const optionalFactorRow = factorRows[1];

          //enrolled factor row should have success check and no cardinality text
          expect(test.form.factorHasSuccessCheck(null, enrolledFactorRow)).toBe(true);
          expect(test.form.factorCardinalityText(null, enrolledFactorRow)).toBe('');
          //optional factor should have button and no cardinality text
          expect(test.form.factorButtonText(null, optionalFactorRow)).toBe('Set up another');
          expect(test.form.factorCardinalityText(null, optionalFactorRow)).toBe('');
        });
      });
      itp('displays correct button and cardinality text when enrolled=2 optional=1', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'ACTIVE',
          enrollment: 'OPTIONAL',
          cardinality: { enrolled: 2, minimum: 0, maximum: 3 },
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          const factorRows = test.form.factorRow(factorName);

          //displays one row for enrolled, one for optional
          expect(factorRows.length).toBe(2);

          const enrolledFactorRow = factorRows[0];
          const optionalFactorRow = factorRows[1];

          //enrolled factor row should have success check and cardinality text
          expect(test.form.factorHasSuccessCheck(null, enrolledFactorRow)).toBe(true);
          expect(test.form.factorCardinalityText(null, enrolledFactorRow)).toBe('(2 set up)');
          //optional factor should have button and no cardinality text
          expect(test.form.factorButtonText(null, optionalFactorRow)).toBe('Set up another');
          expect(test.form.factorCardinalityText(null, optionalFactorRow)).toBe('');
        });
      });
      itp('displays correct button and cardinality text when enrolled=3 optional=0', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'ACTIVE',
          enrollment: 'OPTIONAL',
          cardinality: { enrolled: 3, minimum: 0, maximum: 3 },
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          const factorRows = test.form.factorRow(factorName);

          //displays only one row for enrolled, none for optional
          expect(factorRows.length).toBe(1);
          //enrolled factor row should have success check and cardinality text
          expect(test.form.factorHasSuccessCheck(factorName)).toBe(true);
          expect(test.form.factorCardinalityText(factorName)).toBe('(3 set up)');
        });
      });
      itp('displays correct cardinality text when enrolled=0 required=2', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'NOT_SETUP',
          enrollment: 'REQUIRED',
          cardinality: { enrolled: 0, minimum: 2, maximum: 3 },
          webauthnEnabled,
          useProfiles,
        }).then(function(test) {
          //enrolled factor row should have pending check and cardinality text
          expect(test.form.factorHasPendingCheck(factorName)).toBe(true);
          expect(test.form.factorCardinalityText(factorName)).toBe('(0 of 2 set up)');
        });
      });
      itp('displays correct cardinality text when enrolled=1 required=1', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'NOT_SETUP',
          enrollment: 'REQUIRED',
          cardinality: { enrolled: 1, minimum: 2, maximum: 3 },
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          //enrolled factor row should have pending check and cardinality text
          expect(test.form.factorHasPendingCheck(factorName)).toBe(true);
          expect(test.form.factorCardinalityText(factorName)).toBe('(1 of 2 set up)');
        });
      });
      itp('does not have skip set up link when enrolled=1 required=1', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'NOT_SETUP',
          enrollment: 'REQUIRED',
          cardinality: { enrolled: 1, minimum: 2, maximum: 3 },
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          expect(test.form.skipSetUpLink().length).toBe(0);
        });
      });
      itp('displays correct cardinality text when enrolled=2 required=0 and question required', function() {
        return setupMultipleRequiredActiveEnrollmentsForFactorAndAnotherFactorRequired({
          factorName,
          cardinality: { enrolled: 2, minimum: 2, maximum: 3 },
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          //enrolled factor row should have success check and cardinality text
          expect(test.form.factorHasSuccessCheck(factorName)).toBe(true);
          expect(test.form.factorCardinalityText(factorName)).toBe('(2 set up)');
        });
      });
      itp(
        'has skip set up link when it is in the response and enrolled=2 required=0 and question required',
        function() {
          return setupMultipleRequiredActiveEnrollmentsForFactorAndAnotherFactorRequired({
            factorName,
            cardinality: { enrolled: 2, minimum: 2, maximum: 3 },
            webauthnEnabled,
            useProfiles,
            enrolledFactor,
          }).then(function(test) {
            expect(test.form.skipSetUpLink().length).toBe(1);
          });
        }
      );
      itp('displays correct cardinality text when enrolled=2 required=0 optional=1', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'ACTIVE',
          enrollment: 'REQUIRED',
          cardinality: { enrolled: 2, minimum: 2, maximum: 3 },
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          const factorRows = test.form.factorRow(factorName);

          //displays one row for enrolled, one for optional
          expect(factorRows.length).toBe(2);

          const enrolledFactorRow = factorRows[0];
          const optionalFactorRow = factorRows[1];

          //enrolled factor row should have success check and cardinality text
          expect(test.form.factorHasSuccessCheck(null, enrolledFactorRow)).toBe(true);
          expect(test.form.factorCardinalityText(null, enrolledFactorRow)).toBe('(2 set up)');
          //optional factor should have button and no cardinality text
          expect(test.form.factorButtonText(null, optionalFactorRow)).toBe('Set up another');
          expect(test.form.factorCardinalityText(null, optionalFactorRow)).toBe('');
        });
      });
      itp('displays correct cardinality text when enrolled=3 required=0 optional=0', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'ACTIVE',
          enrollment: 'REQUIRED',
          cardinality: { enrolled: 3, minimum: 2, maximum: 3 },
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          const factorRows = test.form.factorRow(factorName);

          //displays only one row for enrolled, none for optional
          expect(factorRows.length).toBe(1);
          //enrolled factor row should have success check and cardinality text
          expect(test.form.factorHasSuccessCheck(factorName)).toBe(true);
          expect(test.form.factorCardinalityText(factorName)).toBe('(3 set up)');
        });
      });
      itp('checks that the order of factors is correct during enroll if enrollment OPTIONAL', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'ACTIVE',
          enrollment: 'OPTIONAL',
          cardinality: { enrolled: 1, minimum: 0, maximum: 3 },
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          const factorRows = test.form.optionalFactorList();
          const factorIndex = factorRows.find(`[data-se="${factorName}"]`).index();
          const expectedIndex =
            FactorUtil.getFactorSortOrder.call(
              test.router,
              factorEnrollList[factorName].provider,
              factorEnrollList[factorName].factorType
            ) - 1;

          expect(factorIndex).toBe(expectedIndex);
        });
      });
      itp('checks that the order of factors is correct during enroll if enrollment REQUIRED', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'ACTIVE',
          enrollment: 'REQUIRED',
          cardinality: { enrolled: 1, minimum: 1, maximum: 3 },
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          const factorRows = test.form.optionalFactorList();
          const factorIndex = factorRows.find(`[data-se="${factorName}"]`).index();
          const expectedIndex =
            FactorUtil.getFactorSortOrder.call(
              test.router,
              factorEnrollList[factorName].provider,
              factorEnrollList[factorName].factorType
            ) - 1;

          expect(factorIndex).toBe(expectedIndex);
        });
      });
    }

    function testMultipleEnrollmentsWhenSingleFactor(
      factorName,
      singleFactorRes,
      webauthnEnabled,
      useProfiles,
      enrolledFactor
    ) {
      itp('does not display cardinality text if factor is optional', function() {
        return setup(singleFactorRes, false, webauthnEnabled).then(function(test) {
          expect(test.form.factorButtonText(factorName)).toBe('Setup');
          expect(test.form.factorCardinalityText(factorName)).toBe('');
        });
      });
      itp('displays correct button and cardinality text when enrolled=1 optional=2', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'ACTIVE',
          enrollment: 'OPTIONAL',
          cardinality: { enrolled: 1, minimum: 0, maximum: 3 },
          singleFactorRes,
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          const factorRows = test.form.factorRow(factorName);

          //displays one row for enrolled, one for optional
          expect(factorRows.length).toBe(2);

          const enrolledFactorRow = factorRows[0];
          const optionalFactorRow = factorRows[1];

          //enrolled factor row should have success check and no cardinality text
          expect(test.form.factorHasSuccessCheck(null, enrolledFactorRow)).toBe(true);
          expect(test.form.factorCardinalityText(null, enrolledFactorRow)).toBe('');
          //optional factor should have button and no cardinality text
          expect(test.form.factorButtonText(null, optionalFactorRow)).toBe('Set up another');
          expect(test.form.factorCardinalityText(null, optionalFactorRow)).toBe('');
        });
      });
      itp('displays correct button and cardinality text when enrolled=2 optional=1', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'ACTIVE',
          enrollment: 'OPTIONAL',
          cardinality: { enrolled: 2, minimum: 0, maximum: 3 },
          singleFactorRes,
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          const factorRows = test.form.factorRow(factorName);

          //displays one row for enrolled, one for optional
          expect(factorRows.length).toBe(2);

          const enrolledFactorRow = factorRows[0];
          const optionalFactorRow = factorRows[1];

          //enrolled factor row should have success check and cardinality text
          expect(test.form.factorHasSuccessCheck(null, enrolledFactorRow)).toBe(true);
          expect(test.form.factorCardinalityText(null, enrolledFactorRow)).toBe('(2 set up)');
          //optional factor should have button and no cardinality text
          expect(test.form.factorButtonText(null, optionalFactorRow)).toBe('Set up another');
          expect(test.form.factorCardinalityText(null, optionalFactorRow)).toBe('');
        });
      });
      itp('displays correct cardinality text when enrolled=0 required=2', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'NOT_SETUP',
          enrollment: 'REQUIRED',
          cardinality: { enrolled: 0, minimum: 2, maximum: 3 },
          singleFactorRes,
          webauthnEnabled,
          useProfiles,
        }).then(function(test) {
          //enrolled factor row should have pending check and cardinality text
          expect(test.form.factorHasPendingCheck(factorName)).toBe(true);
          expect(test.form.factorCardinalityText(factorName)).toBe('(0 of 2 set up)');
        });
      });
      itp('displays correct cardinality text when enrolled=1 required=1', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'NOT_SETUP',
          enrollment: 'REQUIRED',
          cardinality: { enrolled: 1, minimum: 2, maximum: 3 },
          singleFactorRes,
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          //enrolled factor row should have pending check and cardinality text
          expect(test.form.factorHasPendingCheck(factorName)).toBe(true);
          expect(test.form.factorCardinalityText(factorName)).toBe('(1 of 2 set up)');
        });
      });
      itp('displays correct cardinality text when enrolled=2 required=0 optional=1', function() {
        return setupMultipleFactorEnrollments({
          factorName,
          status: 'ACTIVE',
          enrollment: 'REQUIRED',
          cardinality: { enrolled: 2, minimum: 2, maximum: 3 },
          singleFactorRes,
          webauthnEnabled,
          useProfiles,
          enrolledFactor,
        }).then(function(test) {
          const factorRows = test.form.factorRow(factorName);

          //displays one row for enrolled, one for optional
          expect(factorRows.length).toBe(2);

          const enrolledFactorRow = factorRows[0];
          const optionalFactorRow = factorRows[1];

          //enrolled factor row should have success check and cardinality text
          expect(test.form.factorHasSuccessCheck(null, enrolledFactorRow)).toBe(true);
          expect(test.form.factorCardinalityText(null, enrolledFactorRow)).toBe('(2 set up)');
          //optional factor should have button and no cardinality text
          expect(test.form.factorButtonText(null, optionalFactorRow)).toBe('Set up another');
          expect(test.form.factorCardinalityText(null, optionalFactorRow)).toBe('');
        });
      });
    }

    describe('U2F multi enrollments', function() {
      testMultipleEnrollmentsForFactor('U2F');
    });
    describe('with only U2F configured', function() {
      testMultipleEnrollmentsWhenSingleFactor('U2F', resMultipleU2F);
    });
    describe('WEBAUTHN multi enrollments', function() {
      testMultipleEnrollmentsForFactor('WEBAUTHN', true);
    });
    describe('with only WEBAUTHN configured', function() {
      testMultipleEnrollmentsWhenSingleFactor('WEBAUTHN', resMultipleWebauthn, true);
    });
    describe('WEBAUTHN with profiles', function() {
      testMultipleEnrollmentsForFactor('WEBAUTHN', true, true, enrolledWebauthnFactor);
    });
    describe('with only WEBAUTHN configured with profiles', function() {
      testMultipleEnrollmentsWhenSingleFactor(
        'WEBAUTHN',
        resMultipleWebauthnProfile,
        true,
        true,
        enrolledWebauthnFactor
      );
    });
    describe('Okta Verify', function() {
      testMultipleEnrollmentsForFactor('OKTA_VERIFY');
    });
    describe('with only Okta Verify totp configured', function() {
      const resMultipleOktaVerifyTotp = deepClone(resMultipleOktaVerify);

      resMultipleOktaVerifyTotp.response._embedded.factors = _.where(
        resMultipleOktaVerifyTotp.response._embedded.factors,
        { factorType: 'token:software:totp' }
      );
      testMultipleEnrollmentsWhenSingleFactor('OKTA_VERIFY', resMultipleOktaVerifyTotp);
    });
    describe('with only Okta Verify push configured', function() {
      const resMultipleOktaVerifyTotp = deepClone(resMultipleOktaVerify);

      resMultipleOktaVerifyTotp.response._embedded.factors = _.where(
        resMultipleOktaVerifyTotp.response._embedded.factors,
        { factorType: 'push' }
      );
      testMultipleEnrollmentsWhenSingleFactor('OKTA_VERIFY_PUSH', resMultipleOktaVerifyTotp);
    });
    describe('with only Okta Verify Totp/Push configured', function() {
      testMultipleEnrollmentsWhenSingleFactor('OKTA_VERIFY_PUSH', resMultipleOktaVerify);
    });
  });
});
