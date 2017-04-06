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

/* eslint complexity: [2, 24],max-statements: [2, 25] */
define([
  'okta',
  'shared/util/Util',
  './OAuth2Util',
  './Enums',
  './BrowserFeatures',
  './Errors',
  './ErrorCodes'
],
function (Okta, Util, OAuth2Util, Enums, BrowserFeatures, Errors, ErrorCodes) {

  var fn = {};

  var verifyUrlTpl = Okta.tpl('signin/verify/{{provider}}/{{factorType}}');
  var enrollFactorUrlTpl = Okta.tpl('signin/enroll/{{provider}}/{{factorType}}');
  var activateFactorUrlTpl = Okta.tpl(
    'signin/enroll-activate/{{provider}}/{{factorType}}{{#if step}}/{{step}}{{/if}}'
  );
  var recoveryUrlTpl = Okta.tpl('signin/recovery/{{recoveryToken}}');
  var refreshUrlTpl = Okta.tpl('signin/refresh-auth-state{{#if token}}/{{token}}{{/if}}');
  var sessionCookieRedirectTpl = Okta.tpl(
    '{{baseUrl}}/login/sessionCookieRedirect?checkAccountSetupComplete=true' +
    '&token={{{token}}}&redirectUrl={{{redirectUrl}}}'
  );

  fn.createVerifyUrl = function (provider, factorType) {
    return verifyUrlTpl({
      provider: encodeURIComponent(provider.toLowerCase()),
      factorType: encodeURIComponent(factorType)
    });
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

  fn.routeAfterAuthStatusChange = function (router, err, res) {

    // Global error handling for CORS enabled errors
    if (err && err.xhr && BrowserFeatures.corsIsNotEnabled(err.xhr)) {
      router.settings.callGlobalError(new Errors.UnsupportedBrowserError(
        Okta.loc('error.enabled.cors')
      ));
      return;
    }

    // Token has expired - no longer valid. Navigate back to primary auth.
    if (err && err.errorCode === ErrorCodes.INVALID_TOKEN_EXCEPTION) {
      router.appState.set('flashError', Okta.loc('error.expired.session'));
      router.controller.state.set('navigateDir', Enums.DIRECTION_BACK);
      router.navigate('', { trigger: true });
      return;
    }

    // Other errors are handled by the function making the authClient request
    if (err || !res || !res.status) {
      return;
    }

    router.appState.setAuthResponse(res);

    if (router.controller && router.controller.trapAuthResponse(res)) {
      return;
    }

    switch (res.status) {
    case 'SUCCESS':
      // If the desired end result object needs to have idToken (and not sessionToken),
      // get the id token from session token before calling the global success function.
      if (router.settings.get('oauth2Enabled')) {
        OAuth2Util.getTokens(router.settings, {sessionToken: res.sessionToken}, router.controller);
        return;
      }

      if(res.recoveryType === Enums.RECOVERY_TYPE_UNLOCK) {
        router.navigate('signin/account-unlocked', {trigger: true});
        return;
      }

      router.settings.callGlobalSuccess(Enums.SUCCESS, {
        user: res._embedded.user,
        session: {
          token: res.sessionToken,
          setCookieAndRedirect: function (redirectUrl) {
            Util.redirect(sessionCookieRedirectTpl({
              baseUrl: router.settings.get('baseUrl'),
              token: encodeURIComponent(res.sessionToken),
              redirectUrl: encodeURIComponent(redirectUrl)
            }));
          }
        }
      });
      return;
    case 'MFA_REQUIRED':
      var factor = router.appState.get('factors').getDefaultFactor();
      var url = fn.createVerifyUrl(factor.get('provider'), factor.get('factorType'));
      router.navigate(url, { trigger: true });
      return;
    case 'MFA_CHALLENGE':
      // Since we normally trap MFA_CHALLENGE, this will only get called on a
      // page refresh. We need to return to MFA_REQUIRED to initialize the
      // page correctly (i.e. factors dropdown, etc)
      router.appState.get('transaction').prev()
      .then(function(trans) {
        router.appState.set('transaction', trans);
      }).done();
      return;
    case 'MFA_ENROLL':
      router.navigate('signin/enroll', { trigger: true });
      return;
    case 'MFA_ENROLL_ACTIVATE':
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
    default:
      throw new Error('Unknown status: ' + res.status);
    }
  };

  return fn;

});
