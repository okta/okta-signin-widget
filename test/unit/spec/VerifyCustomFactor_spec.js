/* eslint max-params:[2, 16] */
import { _, $, internal } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import VerifyCustomFactorForm from 'helpers/dom/VerifyCustomFactorForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resAllFactors from 'helpers/xhr/MFA_REQUIRED_allFactors';
import resNoPermissionError from 'helpers/xhr/NO_PERMISSION_error';
import resChallengeClaimsProvider from 'helpers/xhr/MFA_CHALLENGE_ClaimsProvider';
import resSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const SharedUtil = internal.util.Util;
const itp = Expect.itp;

Expect.describe('VerifyCustomFactor', function() {
  function createRouter(baseUrl, authClient, successSpy, settings, startRouter) {
    const router = new Router(
      _.extend(
        {
          el: $sandbox,
          baseUrl: baseUrl,
          authClient: authClient,
          globalSuccessFn: successSpy,
        },
        settings
      )
    );

    Util.registerRouter(router);
    Util.mockRouterNavigate(router, startRouter);
    return router;
  }

  function expectError(test, code, message, controller, resError) {
    expect(test.form.hasErrors()).toBe(true);
    expect(test.form.errorMessage()).toBe(message);
    expectErrorEvent(test, code, message, controller, resError);
  }

  function expectErrorEvent(test, code, message, controller, resError) {
    expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
    expect(test.afterErrorHandler.mock.calls[0]).toEqual([
      {
        controller: controller,
      },
      {
        name: 'AuthApiError',
        message: message,
        statusCode: code,
        xhr: resError,
      },
    ]);
  }

  function expectSubtitleToBe(test, desiredSubtitle) {
    expect(test.form.subtitleText()).toBe(desiredSubtitle);
  }

  async function setup(res, selectedFactorProps, settings, lastFailedChallengeFactorData, languagesResponse , startRouter) {
    const setNextResponse = Util.mockAjax();
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: {
        issuer: baseUrl,
        transformErrorXHR: LoginUtil.transformErrorXHR
      }
    });
    const successSpy = jest.fn();
    const afterErrorHandler =  jest.fn();
    const router = createRouter(baseUrl, authClient, successSpy, settings, startRouter);

    router.on('afterError', afterErrorHandler);
    if (startRouter) {
      if (typeof startRouter !== 'boolean') {
        throw new Error('startRouter parameter should be boolean');
      }
      await Expect.waitForPrimaryAuth();
    }

    setNextResponse(res);
    if (languagesResponse) {
      setNextResponse(languagesResponse);
    }
    router.refreshAuthState('dummy-token');
    await Expect.waitForMfaVerify();

    router.appState.set('lastFailedChallengeFactorData', lastFailedChallengeFactorData);

    if (selectedFactorProps) {
      const factors = router.appState.get('factors');
      const selectedFactor = factors.findWhere(selectedFactorProps);
      const provider = selectedFactor.get('provider');
      const factorType = selectedFactor.get('factorType');

      if (provider === 'CUSTOM' && factorType === 'claims_provider') {
        setNextResponse(resChallengeClaimsProvider);
        router.verifyClaimsFactor();
        await Expect.waitForVerifyCustomFactor();
      }
    }

    const $forms = $sandbox.find('.o-form');

    let forms = _.map($forms, function(form) {
      return new VerifyCustomFactorForm($(form));
    });

    if (forms.length === 1) {
      forms = forms[0];
    }
    const beacon = new Beacon($sandbox);

    return {
      router: router,
      form: forms,
      beacon: beacon,
      ac: authClient,
      setNextResponse: setNextResponse,
      successSpy: successSpy,
      afterErrorHandler: afterErrorHandler,
    };
  }

  const setupClaimsProviderFactorWithIntrospect = _.partial(setup, resAllFactors, {
    factorType: 'claims_provider',
    provider: 'CUSTOM',
  });

  Expect.describe('Claims Provider Factor', function() {
    Expect.describe('when SKIP_IDP_FACTOR_VERIFICATION_BUTTON FF is on', function() {
      const lastFailedChallengeFactorData = {
        errorMessage: 'Verify failed.'
      };

      let settings = {};

      beforeEach(() => {
        settings = { 'features.skipIdpFactorVerificationBtn': true };
      });

      itp('hides the button bar when', function() {
        return setupClaimsProviderFactorWithIntrospect(settings)
          .then(function(test) {
            Expect.isNotVisible(test.form.buttonBar());
          });
      });

      itp('shows the button bar when lastFailedChallengeFactorData is not null', function() {
        return setupClaimsProviderFactorWithIntrospect(settings ,lastFailedChallengeFactorData).then(function(test) {
          expect(test.form.$('.o-form-button-bar').hasClass('hide')).toBe(false);
        });
      });

      itp('shows the waiting spinner', function() {
        return setupClaimsProviderFactorWithIntrospect(settings)
          .then(function(test) {
            expect(test.form.hasSpinner().length).toBe(1);
          });
      });

      itp('hides the waiting spinner when lastFailedChallengeFactorData is not null', function() {
        return setupClaimsProviderFactorWithIntrospect(settings, lastFailedChallengeFactorData).then(function(test) {
          expect(test.form.$('.okta-waiting-spinner').length).toBe(0);
        });
      });

      itp('shows the right auto redirect subtitle', function() {
        return setupClaimsProviderFactorWithIntrospect(settings)
          .then(function(test) {
            expectSubtitleToBe(test, 'Redirecting to IDP factor...');
          });
      });

      itp('shows the right auto redirect subtitle when lastFailedChallengeFactorData is not null', function() {
        return setupClaimsProviderFactorWithIntrospect(settings, lastFailedChallengeFactorData).then(function(test) {
          expectSubtitleToBe(test, 'Clicking below will redirect to verification with IDP factor');
        });
      });

      itp('redirects automatically to third party', function() {
        spyOn(SharedUtil, 'redirect');
        return setupClaimsProviderFactorWithIntrospect(settings)
          .then(function(test) {
            test.setNextResponse([resChallengeClaimsProvider, resSuccess]);
            test.form.initialize();
            return Expect.waitForSpyCall(SharedUtil.redirect);
          })
          .then(function() {
            expect(SharedUtil.redirect).toHaveBeenCalledWith(
              'http://rain.okta1.com:1802/sso/idps/idpId?stateToken=testStateToken'
            );
          });
      });
    });

    Expect.describe('when SKIP_IDP_FACTOR_VERIFICATION_BUTTON FF is off', function() {
      let settings = {};

      beforeEach(() => {
        settings = { 'features.skipIdpFactorVerificationBtn': false };
      });

      itp('shows the right subtitle', function() {
        return setupClaimsProviderFactorWithIntrospect(settings)
          .then(function(test) {
            expectSubtitleToBe(test, 'Clicking below will redirect to verification with IDP factor');
          });
      });

      itp('shows the button bar', function() {
        return setupClaimsProviderFactorWithIntrospect(settings)
          .then(function(test) {
            expect(test.form.buttonBar().hasClass('hide')).toBe(false);
          });
      });

      itp('hides the waiting spinner', function() {
        return setupClaimsProviderFactorWithIntrospect(settings)
          .then(function(test) {
            expect(test.form.hasSpinner().length).toBe(0);
          });
      });

      itp('redirects to third party when Verify button is clicked', function() {
        spyOn(SharedUtil, 'redirect');
        return setupClaimsProviderFactorWithIntrospect(settings)
          .then(function(test) {
            test.setNextResponse([resChallengeClaimsProvider, resSuccess]);
            test.form.submit();
            return Expect.waitForSpyCall(SharedUtil.redirect);
          })
          .then(function() {
            expect(SharedUtil.redirect).toHaveBeenCalledWith(
              'http://rain.okta1.com:1802/sso/idps/idpId?stateToken=testStateToken'
            );
          });
      });

      itp('does not redirect to third party automatically', function() {
        jest.spyOn(SharedUtil, 'redirect');
        return setupClaimsProviderFactorWithIntrospect(settings)
          .then(function(test) {
            test.setNextResponse([resChallengeClaimsProvider, resSuccess]);
            test.form.initialize();
            expect(SharedUtil.redirect).not.toHaveBeenCalled();
          });
      });

      itp('displays error when error response received', function() {
        return setupClaimsProviderFactorWithIntrospect(settings)
          .then(function(test) {
            test.setNextResponse(resNoPermissionError);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expectError(
              test,
              403,
              'You do not have permission to perform the requested action',
              'verify-custom-factor custom-factor-form',
              {
                status: 403,
                responseType: 'json',
                responseText: '{"errorCode":"E0000006","errorSummary":"You do not have permission to perform the requested action","errorLink":"E0000006","errorId":"oae3CaVvE33SqKyymZRyUWE7Q","errorCauses":[]}',
                responseJSON: {
                  errorCode: 'E0000006',
                  errorSummary: 'You do not have permission to perform the requested action',
                  errorLink: 'E0000006',
                  errorId: 'oae3CaVvE33SqKyymZRyUWE7Q',
                  errorCauses: [],
                },
              }
            );
          });
      });
    });
  });
});
