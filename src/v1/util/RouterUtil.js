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

/* eslint complexity: [2, 47], max-statements: [2, 63] */

import { _, loc } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import BrowserFeatures from 'util/BrowserFeatures';
import Enums from 'util/Enums';
import ErrorCodes from 'util/ErrorCodes';
import { ConfigError, UnsupportedBrowserError } from 'util/Errors';
import OAuth2Util from 'util/OAuth2Util';
import Util from 'util/Util';
const fn = {};
const verifyUrlTpl = hbs('signin/verify/{{provider}}/{{factorType}}');
const verifyUrlMultipleTpl = hbs('signin/verify/{{provider}}/{{factorType}}/{{factorIndex}}');
const verifyUrlNoProviderTpl = hbs('signin/verify/{{factorType}}');
const enrollFactorUrlTpl = hbs('signin/enroll/{{provider}}/{{factorType}}');
const activateFactorUrlTpl = hbs('signin/enroll-activate/{{provider}}/{{factorType}}{{#if step}}/{{step}}{{/if}}');
const recoveryUrlTpl = hbs('signin/recovery/{{recoveryToken}}');
const refreshUrlTpl = hbs('signin/refresh-auth-state{{#if token}}/{{token}}{{/if}}');
const signinWithUsernameUrlTpl = hbs('signin/okta/{{username}}');
const sessionCookieRedirectTpl = hbs(
  // eslint-disable-next-line max-len
  '{{baseUrl}}/login/sessionCookieRedirect?checkAccountSetupComplete=true&token={{{token}}}&redirectUrl={{{redirectUrl}}}'
);
const deviceActivationStatuses = ['DEVICE_ACTIVATED', 'DEVICE_NOT_ACTIVATED_CONSENT_DENIED', 'DEVICE_NOT_ACTIVATED'];

fn.isHostBackgroundChromeTab = function() {
  // Checks if the SIW is loaded in a chrome webview and
  // it is in an app that is in background.
  if (navigator.userAgent.match(/Android/) && navigator.userAgent.match(/Chrome/) && document.hidden) {
    return true;
  } else {
    return false;
  }
};

fn.isDocumentVisible = function() {
  return document.visibilityState === 'visible';
};

fn.createVerifyUrl = function(provider, factorType, factorIndex) {
  if (provider && factorIndex) {
    return verifyUrlMultipleTpl({
      provider: encodeURIComponent(provider.toLowerCase()),
      factorType: encodeURIComponent(factorType),
      factorIndex: encodeURIComponent(factorIndex),
    });
  } else if (provider) {
    return verifyUrlTpl({
      provider: encodeURIComponent(provider.toLowerCase()),
      factorType: encodeURIComponent(factorType),
    });
  } else {
    return verifyUrlNoProviderTpl({
      factorType: encodeURIComponent(factorType),
    });
  }
};

fn.createEnrollFactorUrl = function(provider, factorType) {
  return enrollFactorUrlTpl({
    provider: encodeURIComponent(provider.toLowerCase()),
    factorType: encodeURIComponent(factorType),
  });
};

fn.createActivateFactorUrl = function(provider, factorType, step) {
  return activateFactorUrlTpl({
    provider: encodeURIComponent(provider.toLowerCase()),
    factorType: encodeURIComponent(factorType),
    step: step ? encodeURIComponent(step) : false,
  });
};

fn.createRecoveryUrl = function(recoveryToken) {
  return recoveryUrlTpl({
    recoveryToken: encodeURIComponent(recoveryToken),
  });
};

fn.createRefreshUrl = function(stateToken) {
  const token = stateToken ? encodeURIComponent(stateToken) : null;

  return refreshUrlTpl({ token: token });
};

fn.createSigninUrl = function(username) {
  return username ? signinWithUsernameUrlTpl({ username: encodeURIComponent(username) }) : 'signin';
};

fn.routeAfterAuthStatusChangeError = function(router, err) {
  if (!err) {
    return;
  }

  // Global error handling for CORS enabled errors
  if (err.xhr && BrowserFeatures.corsIsNotEnabled(err.xhr)) {
    router.settings.callGlobalError(new UnsupportedBrowserError(loc('error.enabled.cors')));
    return;
  }

  // Token has expired - no longer valid. Navigate back to primary auth.
  if (err.errorCode === ErrorCodes.INVALID_TOKEN_EXCEPTION) {
    router.appState.set('flashError', err);
    router.controller.state.set('navigateDir', Enums.DIRECTION_BACK);
    if (router.settings.get('features.mfaOnlyFlow')) {
      router.navigate('signin/error', { trigger: true });
    } else {
      router.navigate('', { trigger: true });
    }
    return;
  }

  Util.triggerAfterError(router.controller, err);
};

fn.routeAfterAuthStatusChange = function(router, res) {
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

fn.handleResponseStatus = function(router, res) {
  switch (res.status) {
  case 'SUCCESS': {
    handleSuccessResponseStatus(router, res);
    return;
  }
  case 'ADMIN_CONSENT_REQUIRED':
    router.navigate('signin/admin-consent', { trigger: true });
    return;
  case 'CONSENT_REQUIRED':
    router.navigate('signin/consent', { trigger: true });
    return;
  case 'DEVICE_ACTIVATE':
    router.navigate('signin/device-activate', { trigger: true });
    return;
    // We want the same view for FACTOR_REQUIRED & FACTOR_CHALLENGE
    // In the new idx pipeline FACTOR_CHALLENGE API response does not contain a prev link
  case 'FACTOR_REQUIRED':
  case 'FACTOR_CHALLENGE':
  case 'MFA_REQUIRED': {
    const lastFailedChallengeFactorData = router.appState.get('lastFailedChallengeFactorData');
    // When the widget is bootstrapped with an error in MFA_CHALLENGE state, we pass the
    // lastFailedChallengeFactorData to MFA_REQUIRED, in order to show the error message
    // on the correct factor view

    if (lastFailedChallengeFactorData && lastFailedChallengeFactorData.factor) {
      router.appState.get('factors').lastUsedFactor = lastFailedChallengeFactorData.factor;
    }
    const factor = router.appState.get('factors').getDefaultFactor();
    const url = fn.createVerifyUrl(factor.get('provider'), factor.get('factorType'));

    router.navigate(url, { trigger: true });
    router.appState.clearLastFailedChallengeFactorData();
    return;
  }
  case 'POLL': {
    const pollUrl = 'signin/poll';

    router.navigate(pollUrl, { trigger: true });
    return;
  }
  case 'MFA_CHALLENGE':
    // Since we normally trap MFA_CHALLENGE, this will only get called on a
    // page refresh or when an error is returned on verification with an IdP.
    // We need to return to MFA_REQUIRED to initialize the
    // page correctly (i.e. factors dropdown, etc)
    if (router.appState.get('isFactorResultFailed')) {
      router.appState.setLastFailedChallengeFactorData();
    }
    router.appState.get('transaction').prev().then(function(trans) {
      router.appState.set('transaction', trans);
    });
    // TODO: catch/handle error here?
    return;
  case 'MFA_ENROLL':
  case 'FACTOR_ENROLL':
    router.navigate('signin/enroll', { trigger: true });
    return;
  case 'MFA_ENROLL_ACTIVATE':
  case 'FACTOR_ENROLL_ACTIVATE': {
    const activateUrl = fn.createActivateFactorUrl(
      router.appState.get('activatedFactorProvider'),
      router.appState.get('activatedFactorType')
    );

    router.navigate(activateUrl, { trigger: true });
    return;
  }
  case 'PASSWORD_WARN':
  case 'PASSWORD_EXPIRED':
    if (router.settings.get('features.customExpiredPassword') && !router.appState.get('isPwdManagedByOkta')) {
      router.navigate('signin/custom-password-expired', { trigger: true });
    } else {
      router.navigate('signin/password-expired', { trigger: true });
    }
    return;
  case 'RECOVERY_CHALLENGE': {
    const fromEmail = res.factorType.toLowerCase() === Enums.RECOVERY_FACTOR_TYPE_EMAIL.toLowerCase();
    const isForgotPassword = res.recoveryType === Enums.RECOVERY_TYPE_PASSWORD;
    const isUnlock = res.recoveryType === Enums.RECOVERY_TYPE_UNLOCK;
    // Will use this workaround (lowercasing response) until OKTA-69083 is resolved

    if (isForgotPassword && fromEmail) {
      router.navigate('signin/recovery-emailed', { trigger: true });
    } else if (isUnlock && fromEmail) {
      router.navigate('signin/unlock-emailed', { trigger: true });
    } else {
      router.navigate('signin/recovery-challenge', { trigger: true });
    }
    return;
  }
  case 'RECOVERY':
    router.navigate('signin/recovery-question', { trigger: true });
    return;
  case 'PASSWORD_RESET':
    router.navigate('signin/password-reset', { trigger: true });
    return;
  case 'LOCKED_OUT': {
    if (router.settings.get('features.selfServiceUnlock')) {
      router.navigate('signin/unlock', { trigger: true });
    } else {
      const errorMessage = loc('error.auth.lockedOut', 'login');
      const resError = {
        responseJSON: {
          errorCauses: [],
          errorSummary: errorMessage,
          errorCode: 'E0000119',
        },
      };
      const err = {
        name: 'AuthApiError',
        message: errorMessage,
        xhr: resError
      };
      router.controller.model.appState.trigger('removeLoading');
      router.controller.model.trigger('error', router.controller.model, resError);
      Util.triggerAfterError(router.controller, err);
    }
    return;
  }
  case 'PROFILE_REQUIRED':
    router.navigate('signin/enroll-user', { trigger: true });
    return;
  case 'UNAUTHENTICATED':
    // Either we have factors and we are in passwordlessAuth mode
    if (router.appState.get('promptForFactorInUnauthenticated')) {
      const defaultFactor = router.appState.get('factors').getDefaultFactor();
      const factorURL = fn.createVerifyUrl(defaultFactor.get('provider'), defaultFactor.get('factorType'));

      router.navigate(factorURL, { trigger: true });
      return;
    }
    // Or we're in device flow and we need to force idp discovery check
    if (router.appState.get('usingDeviceFlow')) {
      router.navigate('signin/idp-discovery-check', { trigger: true });
      return;
    }
    // Or we don't have anything and we need to show the login page
    router.navigate('', { trigger: true });
    return;
  default:
    throw new Error('Unknown status: ' + res.status);
  }
};

function handleSuccessResponseStatus(router, res) {
  if (res.recoveryType === Enums.RECOVERY_TYPE_UNLOCK) {
    router.navigate('signin/account-unlocked', { trigger: true });
    return;
  }

  if (_.contains(deviceActivationStatuses, res._embedded?.deviceActivationStatus)) {
    router.navigate('signin/device-activate-complete', { trigger: true });
    return;
  }

  // If the desired end result object needs to have idToken (and not sessionToken),
  // get the id token from session token before calling the global success function.
  if (router.settings.get('oauth2Enabled')) {
    OAuth2Util.getTokens(router.settings, { sessionToken: res.sessionToken }, router.controller);
    return;
  }

  const successData = {
    user: res._embedded.user,
    type: res.type || Enums.SESSION_SSO,
  };

  if (res.relayState) {
    successData.relayState = res.relayState;
  }

  const redirectFn = router.settings.get('redirectUtilFn');
  const nextUrl = res?._links?.original?.href || res?._links?.next?.href;

  if (res.type === Enums.SESSION_STEP_UP) {
    const targetUrl = res?._links?.next?.href;

    successData.stepUp = {
      url: targetUrl,
      finish: function() {
        redirectFn(targetUrl);
      },
    };
  } else {
    if (nextUrl) {
      successData.next = function() {
        redirectFn(nextUrl);
      };
    } else {
      // Add the type for now until the API returns it.
      successData.type = Enums.SESSION_SSO;
    }

    if (res.sessionToken) {
      successData.session = {
        token: res.sessionToken,
        setCookieAndRedirect: function(redirectUri) {
          if (redirectUri) {
            Util.debugMessage(`
              Passing a "redirectUri" to "setCookieAndRedirect" is strongly discouraged.
              It is recommended to set a "redirectUri" option in the config object passed to the widget constructor.
            `);
          }

          redirectUri = redirectUri || router.settings.get('redirectUri');
          if (!redirectUri) {
            throw new ConfigError('"redirectUri" is required');
          }

          redirectFn(
            sessionCookieRedirectTpl({
              baseUrl: router.settings.get('baseUrl'),
              token: encodeURIComponent(res.sessionToken),
              redirectUrl: encodeURIComponent(redirectUri),
            })
          );
        },
      };
    }
  }

  // Check if we need to wait for redirect based on host.
  if (fn.isHostBackgroundChromeTab()) {
    document.addEventListener('visibilitychange', function checkVisibilityAndCallSuccess() {
      if (fn.isDocumentVisible()) {
        document.removeEventListener('visibilitychange', checkVisibilityAndCallSuccess);
        router.settings.callGlobalSuccess(Enums.SUCCESS, successData);
      }
    });
  } else {
    router.settings.callGlobalSuccess(Enums.SUCCESS, successData);
  }
}

export default fn;
