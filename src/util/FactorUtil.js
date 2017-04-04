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

/* eslint complexity: [2, 14], max-statements: [2, 26] */
define(['okta'], function (Okta) {

  var _ = Okta._;

  var fn = {};

  var factorData = {
    'OKTA_VERIFY': {
      label: 'factor.totpSoft.oktaVerify',
      description: 'factor.totpSoft.description',
      iconClassName: 'mfa-okta-verify',
      sortOrder: 1
    },
    'OKTA_VERIFY_PUSH': {
      label: 'factor.oktaVerifyPush',
      description: 'factor.push.description',
      iconClassName: 'mfa-okta-verify',
      sortOrder: 1
    },
    'SMS': {
      label: 'factor.sms',
      description: 'factor.sms.description',
      iconClassName: 'mfa-okta-sms',
      sortOrder: 2
    },
    'CALL': {
      label: 'factor.call',
      description: 'factor.call.description',
      iconClassName: 'mfa-okta-call',
      sortOrder: 3
    },
    'WINDOWS_HELLO': {
      label: 'factor.windowsHello',
      description: 'factor.windowsHello.signin.description',
      iconClassName: 'mfa-windows-hello',
      sortOrder: 4
    },
    'U2F': {
      label: 'factor.u2f',
      description: 'factor.u2f.description',
      iconClassName: 'mfa-u2f',
      sortOrder: 5
    },
    'YUBIKEY': {
      label: 'factor.totpHard.yubikey',
      description: 'factor.totpHard.yubikey.description',
      iconClassName: 'mfa-yubikey',
      sortOrder: 6
    },
    'DUO': {
      label: 'factor.duo',
      description: 'factor.duo.description',
      iconClassName: 'mfa-duo',
      sortOrder: 7
    },
    'GOOGLE_AUTH': {
      label: 'factor.totpSoft.googleAuthenticator',
      description: 'factor.totpSoft.description',
      iconClassName: 'mfa-google-auth',
      sortOrder: 8
    },
    'SYMANTEC_VIP': {
      label: 'factor.totpHard.symantecVip',
      description: 'factor.totpHard.description',
      iconClassName: 'mfa-symantec',
      sortOrder: 9
    },
    'RSA_SECURID': {
      label: 'factor.totpHard.rsaSecurId',
      description: 'factor.totpHard.description',
      iconClassName: 'mfa-rsa',
      sortOrder: 10
    },
    'ON_PREM': {
      label: '',
      description: 'factor.totpHard.description',
      iconClassName: 'mfa-onprem',
      sortOrder: 10
    },
    'QUESTION': {
      label: 'factor.securityQuestion',
      description: 'factor.securityQuestion.description',
      iconClassName: 'mfa-okta-security-question',
      sortOrder: 11
    }
  };

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
    if (provider === 'OKTA' && factorType === 'call') {
      return 'CALL';
    }
    if (provider === 'OKTA' && factorType === 'question') {
      return 'QUESTION';
    }
    if (provider === 'FIDO' && factorType === 'webauthn') {
      return 'WINDOWS_HELLO';
    }
    if (provider === 'FIDO' && factorType === 'u2f') {
      return 'U2F';
    }
  };

  fn.isOktaVerify = function (provider, factorType) {
    return provider === 'OKTA' && (factorType === 'token:software:totp' || factorType === 'push');
  };

  fn.getFactorLabel = function (provider, factorType) {
    var key = factorData[fn.getFactorName(provider, factorType)].label;
    return Okta.loc(key, 'login');
  };

  fn.getFactorDescription = function (provider, factorType) {
    var key = factorData[fn.getFactorName(provider, factorType)].description;
    return Okta.loc(key, 'login');
  };

  fn.getFactorIconClassName = function (provider, factorType) {
    return factorData[fn.getFactorName(provider, factorType)].iconClassName;
  };

  fn.getFactorSortOrder = function (provider, factorType) {
    return factorData[fn.getFactorName(provider, factorType)].sortOrder;
  };

  fn.getRememberDeviceValue = function (appState) {
    return appState && appState.get('rememberDeviceByDefault');
  };

  fn.getSecurityQuestionLabel = function (questionObj) {
    var localizedQuestion = Okta.loc('security.' + questionObj.question);
    return localizedQuestion.indexOf('L10N_ERROR') < 0 ? localizedQuestion : questionObj.questionText;
  };

  fn.getPasswordComplexityDescription = function (policyComplexity) {
    var fields = {
      minLength: {i18n: 'password.complexity.length', args: true},
      minLowerCase: {i18n: 'password.complexity.lowercase'},
      minUpperCase: {i18n: 'password.complexity.uppercase'},
      minNumber: {i18n: 'password.complexity.number'},
      minSymbol: {i18n: 'password.complexity.symbol'},
      excludeUsername: {i18n: 'password.complexity.no_username'}
    };

    var requirements = _.map(policyComplexity, function (complexityValue, complexityType) {
      if(!complexityValue){
        return;
      }

      var params = fields[complexityType];
      return params.args ?
        Okta.loc(params.i18n, 'login', [complexityValue]) : Okta.loc(params.i18n, 'login');
    });

    if (requirements.length) {
      requirements = _.reduce(requirements, function (result, requirement) {
        return result ?
          (requirement ? (result + Okta.loc('password.complexity.list.element', 'login', [requirement])) : result) :
          requirement;
      });

      return Okta.loc('password.complexity.description', 'login', [requirements]);
    }
  };


  return fn;
});
