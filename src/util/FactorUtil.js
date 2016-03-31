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

define(['okta' , './CookieUtil'], function (Okta, CookieUtil) {

  var fn = {};

  var factorData = {
    'OKTA_VERIFY': {
      label: Okta.loc('factor.totpSoft.oktaVerify', 'login'),
      description: Okta.loc('factor.totpSoft.description', 'login'),
      iconClassName: 'mfa-okta-verify',
      sortOrder: 1
    },
    'OKTA_VERIFY_PUSH': {
      label: Okta.loc('factor.oktaVerifyPush', 'login'),
      description: Okta.loc('factor.push.description', 'login'),
      iconClassName: 'mfa-okta-verify',
      sortOrder: 1
    },
    'GOOGLE_AUTH': {
      label: Okta.loc('factor.totpSoft.googleAuthenticator', 'login'),
      description: Okta.loc('factor.totpSoft.description', 'login'),
      iconClassName: 'mfa-google-auth',
      sortOrder: 2
    },
    'SYMANTEC_VIP': {
      label: Okta.loc('factor.totpHard.symantecVip', 'login'),
      description: Okta.loc('factor.totpHard.description', 'login'),
      iconClassName: 'mfa-symantec',
      sortOrder: 3
    },
    'RSA_SECURID': {
      label: Okta.loc('factor.totpHard.rsaSecurId', 'login'),
      description: Okta.loc('factor.totpHard.description', 'login'),
      iconClassName: 'mfa-rsa',
      sortOrder: 4
    },
    'ON_PREM': {
      label: '',
      description: Okta.loc('factor.totpHard.description', 'login'),
      iconClassName: 'mfa-onprem',
      sortOrder: 4
    },
    'DUO': {
      label: Okta.loc('factor.duo', 'login'),
      description: Okta.loc('factor.duo.description', 'login'),
      iconClassName: 'mfa-duo',
      sortOrder: 5
    },
    'YUBIKEY': {
      label: Okta.loc('factor.totpHard.yubikey', 'login'),
      description: Okta.loc('factor.totpHard.yubikey.description', 'login'),
      iconClassName: 'mfa-yubikey',
      sortOrder: 6
    },
    'SMS': {
      label: Okta.loc('factor.sms', 'login'),
      description: Okta.loc('factor.sms.description', 'login'),
      iconClassName: 'mfa-okta-sms',
      sortOrder: 7
    },
    'QUESTION': {
      label: Okta.loc('factor.securityQuestion', 'login'),
      description: Okta.loc('factor.securityQuestion.description', 'login'),
      iconClassName: 'mfa-okta-security-question',
      sortOrder: 8
    }
  };

  /* jshint maxcomplexity: 11 */
  fn.getFactorName = function (provider, factorType) {
    if (provider === 'OKTA' && factorType === 'token:software:totp') {
      return 'OKTA_VERIFY';
    }
    if (provider === 'OKTA' && factorType === 'push') {
      return 'OKTA_VERIFY_PUSH';
    }
    if (provider === 'GOOGLE') {
      return 'GOOGLE_AUTH';
    }
    if (provider === 'SYMANTEC' && factorType === 'token') {
      return 'SYMANTEC_VIP';
    }
    if (provider === 'RSA' && factorType === 'token') {
      return 'RSA_SECURID';
    }
    if (provider === 'DEL_OATH' && factorType === 'token') {
      return 'ON_PREM';
    }
    if (provider === 'DUO' && factorType === 'web') {
      return 'DUO';
    }
    if (provider === 'YUBICO' && factorType === 'token:hardware') {
      return 'YUBIKEY';
    }
    if (provider === 'OKTA' && factorType === 'sms') {
      return 'SMS';
    }
    if (provider === 'OKTA' && factorType === 'question') {
      return 'QUESTION';
    }
  };

  fn.isOktaVerify = function (provider, factorType) {
    return provider === 'OKTA' && (factorType === 'token:software:totp' || factorType === 'push');
  };

  fn.getFactorLabel = function (provider, factorType) {
    return factorData[fn.getFactorName(provider, factorType)].label;
  };

  fn.getFactorDescription = function (provider, factorType) {
    return factorData[fn.getFactorName(provider, factorType)].description;
  };

  fn.getFactorIconClassName = function (provider, factorType) {
    return factorData[fn.getFactorName(provider, factorType)].iconClassName;
  };

  fn.getFactorSortOrder = function (provider, factorType) {
    return factorData[fn.getFactorName(provider, factorType)].sortOrder;
  };

  fn.getRememberDeviceValue = function (settings, appState) {
    var username = appState && appState.get('username');
    var rememberDeviceAlways = settings && settings.get('features.rememberDeviceAlways');
    var rememberDeviceUsername = CookieUtil.getCookieDeviceUsername();
    var rememberDevice = false;

    // rememberDevice is true if 'rememberDeviceAlways' is on or
    // if the last username is same as the current username.
    if (rememberDeviceAlways) {
      rememberDevice = true;
    } else if (rememberDeviceUsername || username) {
      rememberDevice = (rememberDeviceUsername === username);
    }

    return rememberDevice;
  };

  return fn;
});
