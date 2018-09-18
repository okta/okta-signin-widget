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

/* eslint complexity: [2, 17], max-statements: [2, 32] */
define([
  'okta'
],
function (Okta) {

  var { TimeUtil } = Okta.internal.util;

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
    'U2F': {
      label: 'factor.u2f',
      description: 'factor.u2f.description',
      iconClassName: 'mfa-u2f',
      sortOrder: 2
    },
    'WINDOWS_HELLO': {
      label: 'factor.windowsHello',
      description: 'factor.windowsHello.signin.description',
      iconClassName: 'mfa-windows-hello',
      sortOrder: 3
    },
    'YUBIKEY': {
      label: 'factor.totpHard.yubikey',
      description: 'factor.totpHard.yubikey.description',
      iconClassName: 'mfa-yubikey',
      sortOrder: 4
    },
    'GOOGLE_AUTH': {
      label: 'factor.totpSoft.googleAuthenticator',
      description: 'factor.totpSoft.description',
      iconClassName: 'mfa-google-auth',
      sortOrder: 5
    },
    'SMS': {
      label: 'factor.sms',
      description: 'factor.sms.description',
      iconClassName: 'mfa-okta-sms',
      sortOrder: 6
    },
    'CALL': {
      label: 'factor.call',
      description: 'factor.call.description',
      iconClassName: 'mfa-okta-call',
      sortOrder: 7
    },
    'EMAIL': {
      label: 'factor.email',
      description: '',
      iconClassName: 'mfa-okta-email',
      sortOrder: 8
    },
    'QUESTION': {
      label: 'factor.securityQuestion',
      description: 'factor.securityQuestion.description',
      iconClassName: 'mfa-okta-security-question',
      sortOrder: 9
    },
    'DUO': {
      label: 'factor.duo',
      description: 'factor.duo.description',
      iconClassName: 'mfa-duo',
      sortOrder: 10
    },
    'SYMANTEC_VIP': {
      label: 'factor.totpHard.symantecVip',
      description: 'factor.totpHard.description',
      iconClassName: 'mfa-symantec',
      sortOrder: 11
    },
    'RSA_SECURID': {
      label: 'factor.totpHard.rsaSecurId',
      description: 'factor.totpHard.description',
      iconClassName: 'mfa-rsa',
      sortOrder: 12
    },
    'ON_PREM': {
      label: '',
      description: 'factor.totpHard.description',
      iconClassName: 'mfa-onprem',
      sortOrder: 13
    },
    'PASSWORD': {
      label: 'factor.password',
      description: '',
      iconClassName: 'mfa-okta-password',
      sortOrder: 14
    },
    'GENERIC_SAML': {
      label: '',
      description: 'factor.customFactor.description',
      iconClassName: 'mfa-custom-factor',
      sortOrder: 15
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
    if (provider === 'OKTA' && factorType === 'email') {
      return 'EMAIL';
    }
    if (provider === 'OKTA' && factorType === 'password') {
      return 'PASSWORD';
    }
    if (provider === 'GENERIC_SAML' && factorType === 'assertion:saml2') {
      return 'GENERIC_SAML';
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

  fn.getPasswordComplexityDescription = function (policy) {
    var result = [];

    var getPasswordAgeRequirement = function(displayableTime) {
      var propertiesString;
      switch (displayableTime.unit) {
      case 'DAY':
        propertiesString = 'password.complexity.minAgeDays';
        break;
      case 'HOUR':
        propertiesString = 'password.complexity.minAgeHours';
        break;
      case 'MINUTE':
        propertiesString = 'password.complexity.minAgeMinutes';
      }
      return Okta.loc(propertiesString, 'login', [displayableTime.time]);
    };

    var setExcludeAttributes = function (policyComplexity) {
      var excludeAttributes = policyComplexity.excludeAttributes;
      policyComplexity.excludeFirstName = _.contains(excludeAttributes, 'firstName');
      policyComplexity.excludeLastName = _.contains(excludeAttributes, 'lastName');
      return _.omit(policyComplexity, 'excludeAttributes');
    };

    if (policy.complexity) {
      var complexityFields = {
        minLength: {i18n: 'password.complexity.length', args: true},
        minLowerCase: {i18n: 'password.complexity.lowercase'},
        minUpperCase: {i18n: 'password.complexity.uppercase'},
        minNumber: {i18n: 'password.complexity.number'},
        minSymbol: {i18n: 'password.complexity.symbol'},
        excludeUsername: {i18n: 'password.complexity.no_username'},
        excludeFirstName: {i18n: 'password.complexity.no_first_name'},
        excludeLastName: {i18n: 'password.complexity.no_last_name'}
      };

      var policyComplexity = setExcludeAttributes(policy.complexity);

      var requirements = _.map(policyComplexity, function (complexityValue, complexityType) {
        if (complexityValue <= 0) { // to skip 0 and -1
          return;
        }

        var params = complexityFields[complexityType];
        return params.args ?
          Okta.loc(params.i18n, 'login', [complexityValue]) : Okta.loc(params.i18n, 'login');
      });

      requirements = _.compact(requirements);

      if (requirements.length) {
        requirements = _.reduce(requirements, function (result, requirement) {
          return result ? (result + Okta.loc('password.complexity.list.element', 'login', [requirement])) : requirement;
        });

        result.push(Okta.loc('password.complexity.requirements', 'login', [requirements]));
      }
    }

    if (policy.age && policy.age.historyCount > 0) {
      result.push(Okta.loc('password.complexity.history', 'login', [policy.age.historyCount]));
    }

    if (policy.age && policy.age.minAgeMinutes > 0) {
      var displayableTime = TimeUtil.getTimeInHighestRelevantUnit(policy.age.minAgeMinutes, 'MINUTE');
      var minAgeDescription = getPasswordAgeRequirement(displayableTime);
      result.push(minAgeDescription);
    }

    return result.join(' ');
  };


  return fn;
});
