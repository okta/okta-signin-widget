/* eslint max-params:[2, 16] */
import { internal } from 'okta';
import createAuthClient from 'widget/createAuthClient';
import Router from 'LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import Form from 'helpers/dom/VerifyCustomFactorForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import Factor from '../../../src/models/Factor';
import responseMfaEnrollActivateCustomSaml from 'helpers/xhr/MFA_ENROLL_ACTIVATE_CustomSaml';
import AppState from 'v2/models/AppState';
import responseMfaEnrollAll from 'helpers/xhr/MFA_ENROLL_allFactors';
import VerifyCustomFactorController from '../../../src/VerifyCustomFactorController';
import responseSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const SharedUtil = internal.util.Util;
const itp = Expect.itp;

Expect.describe('VerifyCustomFactor', function() {
  function setup(factorType, skipIdpFactorVerificationBtn) {
    const setNextResponse = Util.mockAjax([responseMfaEnrollAll]);
    const baseUrl = 'https://foo.com';
    const authClient = createAuthClient({ issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR });
    const successSpy = jasmine.createSpy('success');
    const afterErrorHandler = jasmine.createSpy('afterErrorHandler');

    const router = new Router({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy,
    });

    router.on('afterError', afterErrorHandler);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);

    setNextResponse(responseMfaEnrollAll);
    router.refreshAuthState('dummy-token');

    return Expect.waitForEnrollChoices().then(function() {
      switch (factorType) {
      case 'custom_oidc':
        router.enrollOIDCFactor();
        break;
      case 'custom_saml':
        router.enrollSAMLFactor();
        break;
      case '  ':
        router.enrollClaimsFactor();
        break;
      }

      const factors = [
        {
          'id': 'clphnxrY5beGtUu610g4',
          'factorType': 'claims_provider',
          'provider': 'CUSTOM',
          'vendorName': 'v1-200-idp-trex',
          '_links': {
            'verify': {
              'href': 'http://v1-200.okta1.com:1802/api/v1/authn/factors/clphnxrY5beGtUu610g4/verify',
              'hints': {
                'allow': [
                  'POST'
                ]
              }
            }
          }
        }
      ];

      const transaction = {
        'factors': [
          {
            'id': 'clphnxrY5beGtUu610g4',
            'factorType': 'claims_provider',
            'provider': 'CUSTOM',
            'vendorName': 'v1-200-idp-trex'
          }
        ]
      };

      transaction.factors = transaction.factors.map((factor) => new Factor.Model(factor));

      const appState = new AppState();
      const factorsArray = factors.map((factor) => new Factor.Model(factor));
      appState.set('factors', new Factor.Collection(factorsArray, { parse: true }));
      appState.set('transaction', transaction);

      return new VerifyCustomFactorController({
          router,
          beacon: new Beacon($sandbox),
          form: new Form($sandbox),
          ac: authClient,
          setNextResponse,
          successSpy,
          afterErrorHandler,
          appState,
          factorType: factorType,
          provider: 'CUSTOM',
          'features.skipIdpFactorVerificationBtn': skipIdpFactorVerificationBtn,
        })
      });
  }

  Expect.describe('Verify custom factor', function() {
    Expect.describe('CUSTOM_CLAIMS when SKIP_IDP_FACTOR_VERIFICATION_BUTTON FF is on', function() {
      itp('displays the redirect subtitle', function() {
        return setup('claims_provider', true).then(function(test) {
          const factor = factors.find((factor) => factor.factorType === 'claims_provider');
          test.options.setNextResponse(responseSuccess);
          expect(test.options.form.subtitleText()).toBe(`Redirecting to ${factor.vendorName}...`);
        });
      });

      itp("has a 'back' link in the footer", function() {
        return setup('claims_provider').then(function(test) {
          Expect.isVisible(test.form.backLink());
        });
      });

      itp('hides the button bar', function() {
        return setup('claims_provider', true).then(function(test) {
          test.setNextResponse(responseSuccess);
          expect(test.form.buttonBar().hasClass('hide')).toBe(true);
        });
      });

      itp('shows the waiting spinner', function() {
        return setup('claims_provider', true).then(function(test) {
          test.setNextResponse(responseSuccess);
          expect(test.form.hasSpinner()).toBe(true);
        });
      });

      itp('redirects to third party automatically', function() {
        spyOn(SharedUtil, 'redirect');
        return setup('claims_provider', true)
          .then(function(test) {
            test.setNextResponse([responseMfaEnrollActivateCustomSaml, responseSuccess]);
            test.initialize();
            return Expect.waitForSpyCall(SharedUtil.redirect);
          })
          .then(function() {
            expect(SharedUtil.redirect).toHaveBeenCalledWith(
              'http://rain.okta1.com:1802/policy/mfa-oidc-idp-redirect?okta_key=mfa.redirect.id',
            );
          });
      });

      itp('displays error when error response received', function() {
        return setup('claims_provider', true)
          .then(function(test) {
            test.setNextResponse(resNoPermissionError);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
          });
      });
    });

    Expect.describe('CUSTOM_CLAIMS when SKIP_IDP_FACTOR_VERIFICATION_BUTTON FF is OFF', function() {
      itp('displays correct subtitle', function() {
        return setup('claims_provider', false).then(function(test) {
          const factor = factors.find((factor) => factor.factorType === 'claims_provider');
          test.options.setNextResponse(responseSuccess);
          expect(test.options.form.subtitleText()).toBe('Clicking below will redirect to MFA enrollment with IDP factor');
        });
      });

      itp("has a 'back' link in the footer", function() {
        return setup('claims_provider', false).then(function(test) {
          Expect.isVisible(test.form.backLink());
        });
      });

      itp('shows the button bar', function() {
        return setup('claims_provider', false).then(function(test) {
          test.setNextResponse(responseSuccess);
          expect(test.form.buttonBar().hasClass('hide')).toBe(false);
        });
      });

      itp('hides the waiting spinner', function() {
        return setup('claims_provider', false).then(function(test) {
          test.setNextResponse(responseSuccess);
          expect(test.form.hasSpinner()).toBe(false);
        });
      });

      itp('redirects to third party when Verify button is clicked', function() {
        spyOn(SharedUtil, 'redirect');
        return setup('claims_provider', false)
          .then(function(test) {
            test.setNextResponse([responseMfaEnrollActivateCustomSaml, responseSuccess]);
            test.form.submit();
            return Expect.waitForSpyCall(SharedUtil.redirect);
          })
          .then(function() {
            expect(SharedUtil.redirect).toHaveBeenCalledWith(
              'http://rain.okta1.com:1802/policy/mfa-oidc-idp-redirect?okta_key=mfa.redirect.id',
            );
          });
      });

      itp('displays error when error response received', function() {
        return setup('claims_provider', false)
          .then(function(test) {
            test.setNextResponse(resNoPermissionError);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
          });
      });
    });
  });


});
