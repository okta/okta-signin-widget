/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint complexity: [2, 47], max-statements: [2, 40] */
import hbs from 'handlebars-inline-precompile';

define([
  'okta',
  './OAuth2Util',
  './Util',
  './Enums',
  './BrowserFeatures',
  './Errors',
  './ErrorCodes'
],
function (Okta, OAuth2Util, Util, Enums, BrowserFeatures, Errors, ErrorCodes) {
  var fn = {};

  var verifyUrlTpl = hbs('signin/verify/{{provider}}/{{factorType}}');
  var verifyUrlMultipleTpl = hbs('signin/verify/{{provider}}/{{factorType}}/{{factorIndex}}');
  var verifyUrlNoProviderTpl = hbs('signin/verify/{{factorType}}');
  var enrollFactorUrlTpl = hbs('signin/enroll/{{provider}}/{{factorType}}');
  var activateFactorUrlTpl = hbs(
    'signin/enroll-activate/{{provider}}/{{factorType}}{{#if step}}/{{step}}{{/if}}'
  );
  var recoveryUrlTpl = hbs('signin/recovery/{{recoveryToken}}');
  var refreshUrlTpl = hbs('signin/refresh-auth-state{{#if token}}/{{token}}{{/if}}');
  var sessionCookieRedirectTpl = hbs(
    // eslint-disable-next-line max-len
    '{{baseUrl}}/login/sessionCookieRedirect?checkAccountSetupComplete=true&token={{{token}}}&redirectUrl={{{redirectUrl}}}'
  );

  fn.isHostBackgroundChromeTab = function () {
    // Checks if the SIW is loaded in a chrome webview and
    // it is in an app that is in background.
    if (navigator.userAgent.match(/Android/) &&
        navigator.userAgent.match(/Chrome/) &&
        document.hidden) {
      return true;
    } else {
      return false;
    }
  };

  fn.isDocumentVisible = function () {
    return document.visibilityState === 'visible';
  };

  fn.createVerifyUrl = function (provider, factorType, factorIndex) {
    if (provider && factorIndex) {
      return verifyUrlMultipleTpl({
        provider: encodeURIComponent(provider.toLowerCase()),
        factorType: encodeURIComponent(factorType),
        factorIndex: encodeURIComponent(factorIndex)
      });
    }
    else if (provider) {
      return verifyUrlTpl({
        provider: encodeURIComponent(provider.toLowerCase()),
        factorType: encodeURIComponent(factorType)
      });
    }
    else {
      return verifyUrlNoProviderTpl({
        factorType: encodeURIComponent(factorType)
      });
    }
  };

  fn.createEnrollFactorUrl = function (provider, factorType) {
    return enrollFactorUrlTpl({
      provider: encodeURIComponent(provider.toLowerCase()),
      factorType: encodeURIComponent(factorType)
    });
  };

  fn.createActivateFactorUrl = function (provider, factorType, step) {
    return activateFactorUrlTpl({
      provider: encodeURIComponent(provider.toLowerCase()),
      factorType: encodeURIComponent(factorType),
      step: step ? encodeURIComponent(step) : false
    });
  };

  fn.createRecoveryUrl = function (recoveryToken) {
    return recoveryUrlTpl({
      recoveryToken: encodeURIComponent(recoveryToken)
    });
  };

  fn.createRefreshUrl = function (stateToken) {
    var token = stateToken ? encodeURIComponent(stateToken) : null;
    return refreshUrlTpl({ token: token });
  };

  fn.routeAfterAuthStatusChangeError = function (router, err) {
    if (!err) {
      return;
    }

    // Global error handling for CORS enabled errors
    if (err.xhr && BrowserFeatures.corsIsNotEnabled(err.xhr)) {
      router.settings.callGlobalError(new Errors.UnsupportedBrowserError(
        Okta.loc('error.enabled.cors')
      ));
      return;
    }

    // Token has expired - no longer valid. Navigate back to primary auth.
    if (err.errorCode === ErrorCodes.INVALID_TOKEN_EXCEPTION) {
      router.appState.set('flashError', err);
      router.controller.state.set('navigateDir', Enums.DIRECTION_BACK);
      router.navigate('', { trigger: true });
      return;
    }

    Util.triggerAfterError(router.controller, err);
  };

  fn.routeAfterAuthStatusChange = function (router, res) {
    // Other errors are handled by the function making the authClient request
    if (!res || !res.status) {
      router.appState.clearLastAuthResponse();
      return;
    }

    router.appState.setAuthResponse(res);

    if (router.controller && router.controller.trapAuthResponse(res)) {
      return;
    }

    fn.handleResponseStatus(router, res);
  };

  fn.handleResponseStatus = function (router, res) {
    switch (res.status) {
    case 'SUCCESS':
      if(res.recoveryType === Enums.RECOVERY_TYPE_UNLOCK) {
        router.navigate('signin/account-unlocked', {trigger: true});
        return;
      }

      // If the desired end result object needs to have idToken (and not sessionToken),
      // get the id token from session token before calling the global success function.
      if (router.settings.get('oauth2Enabled')) {
        OAuth2Util.getTokens(router.settings, {sessionToken: res.sessionToken}, router.controller);
        return;
      }

      var successData = {
        user: res._embedded.user,
        type: res.type || Enums.SESSION_SSO
      };

      if (res.relayState) {
        successData.relayState = res.relayState;
      }

      var redirectFn = router.settings.get('redirectUtilFn');

      var nextUrl = res._links &&
                    ((res._links.original && res._links.original.href) || (res._links.next && res._links.next.href));
      if (res.type === Enums.SESSION_STEP_UP) {
        var targetUrl = res._links && res._links.next && res._links.next.href;
        successData.stepUp = {
          url: targetUrl,
          finish: function () {
            redirectFn(targetUrl);
          }
        };
      } else if (nextUrl) {
        successData.next = function () {
          redirectFn(nextUrl);
        };
      } else {
        // Add the type for now until the API returns it.
        successData.type = Enums.SESSION_SSO;
        successData.session = {
          token: res.sessionToken,
          setCookieAndRedirect: function (redirectUrl) {
            redirectFn(sessionCookieRedirectTpl({
              baseUrl: router.settings.get('baseUrl'),
              token: encodeURIComponent(res.sessionToken),
              redirectUrl: encodeURIComponent(redirectUrl)
            }));
          }
        };
      }
      
      // Check if we need to wait for redirect based on host.
      if (router.settings.get('features.restrictRedirectToForeground') &&
          fn.isHostBackgroundChromeTab()) {
        document.addEventListener('visibilitychange', function checkVisibilityAndCallSuccess () {
          if (fn.isDocumentVisible()) {
            document.removeEventListener('visibilitychange', checkVisibilityAndCallSuccess);
            router.settings.callGlobalSuccess(Enums.SUCCESS, successData);
          }
        });
      } else {
        router.settings.callGlobalSuccess(Enums.SUCCESS, successData);
      }
      return;
    case 'ADMIN_CONSENT_REQUIRED':
      router.navigate('signin/consent', {trigger: true});
      return;
    case 'CONSENT_REQUIRED':
      if (router.settings.get('features.consent')) {
        router.navigate('signin/consent', {trigger: true});
      }
      return;
    // We want the same view for FACTOR_REQUIRED & FACTOR_CHALLENGE
    // In the new idx pipeline FACTOR_CHALLENGE API response does not contain a prev link
    case 'FACTOR_REQUIRED':
    case 'FACTOR_CHALLENGE':
    case 'MFA_REQUIRED':
      // When the widget is bootstrapped with an error in MFA_CHALLENGE state, we pass the
      // lastFailedChallengeFactorData to MFA_REQUIRED, in order to show the error message
      // on the correct factor view
      var lastFailedChallengeFactorData = router.appState.get('lastFailedChallengeFactorData');
      if (lastFailedChallengeFactorData && lastFailedChallengeFactorData.factor) {
        router.appState.get('factors').lastUsedFactor = lastFailedChallengeFactorData.factor;
      }
      var factor = router.appState.get('factors').getDefaultFactor();
      var url = fn.createVerifyUrl(factor.get('provider'), factor.get('factorType'));
      router.navigate(url, { trigger: true });
      router.appState.clearLastFailedChallengeFactorData();
      return;

    case 'POLL':
      var pollUrl = 'signin/poll';
      router.navigate(pollUrl, { trigger: true });
      return;

    case 'MFA_CHALLENGE':
      // Since we normally trap MFA_CHALLENGE, this will only get called on a
      // page refresh or when an error is returned on verification with an IdP.
      // We need to return to MFA_REQUIRED to initialize the
      // page correctly (i.e. factors dropdown, etc)
      if (router.appState.get('isFactorResultFailed')) {
        router.appState.setLastFailedChallengeFactorData();
      }
      router.appState.get('transaction').prev()
        .then(function (trans) {
          router.appState.set('transaction', trans);
        });
      // TODO: catch/handle error here?
      return;
    case 'MFA_ENROLL':
    case 'FACTOR_ENROLL':
      router.navigate('signin/enroll', { trigger: true });
      return;
    case 'MFA_ENROLL_ACTIVATE':
    case 'FACTOR_ENROLL_ACTIVATE':
      var activateUrl = fn.createActivateFactorUrl(router.appState.get('activatedFactorProvider'),
        router.appState.get('activatedFactorType'));
      router.navigate(activateUrl, { trigger: true });
      return;
    case 'PASSWORD_WARN':
    case 'PASSWORD_EXPIRED':
      if (router.settings.get('features.customExpiredPassword') && !router.appState.get('isPwdManagedByOkta')) {
        router.navigate('signin/custom-password-expired', { trigger: true });
      } else {
        router.navigate('signin/password-expired', { trigger: true });
      }
      return;
    case 'RECOVERY_CHALLENGE':
      // Will use this workaround (lowercasing response) until OKTA-69083 is resolved
      var fromEmail = res.factorType.toLowerCase() === Enums.RECOVERY_FACTOR_TYPE_EMAIL.toLowerCase(),
          isForgotPassword = res.recoveryType === Enums.RECOVERY_TYPE_PASSWORD,
          isUnlock = res.recoveryType === Enums.RECOVERY_TYPE_UNLOCK;
      if (isForgotPassword && fromEmail) {
        router.navigate('signin/recovery-emailed', { trigger: true });
      }
      else if (isUnlock && fromEmail) {
        router.navigate('signin/unlock-emailed', { trigger: true });
      }
      else {
        router.navigate('signin/recovery-challenge', { trigger: true });
      }
      return;
    case 'RECOVERY':
      router.navigate('signin/recovery-question', { trigger: true });
      return;
    case 'PASSWORD_RESET':
      router.navigate('signin/password-reset', { trigger: true });
      return;
    case 'LOCKED_OUT':
      if (router.settings.get('features.selfServiceUnlock')) {
        router.navigate('signin/unlock', { trigger: true });
      } else {
        router.controller.model.trigger('error', router.controller.model, {
          responseJSON: {
            errorCauses: [],
            errorSummary: Okta.loc('error.auth.lockedOut', 'login')
          }
        });
      }
      return;
    case 'PROFILE_REQUIRED':
      router.navigate('signin/enroll-user', { trigger: true });
      return;
    case 'UNAUTHENTICATED':
      // Either we have factors and we are in passwordlessAuth mode
      if (router.appState.get('promptForFactorInUnauthenticated')) {
        var defaultFactor = router.appState.get('factors').getDefaultFactor();
        var factorURL = fn.createVerifyUrl(defaultFactor.get('provider'), defaultFactor.get('factorType'));
        router.navigate(factorURL, { trigger: true });
        return;
      }
      // Or we don't have anything and we need to show the login page
      router.navigate('', { trigger: true });
      return;
    default:
      throw new Error('Unknown status: ' + res.status);
    }
  };

  return fn;

});
