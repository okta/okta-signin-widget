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

/* eslint complexity: [2, 38], max-statements: [2, 38] */
define([
  'okta',
  './TimeUtil'
],
function (Okta, TimeUtil) {

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
      description: (brandName) => {
        return brandName ?
          'factor.u2f.description.specific':
          'factor.u2f.description.generic';
      },
      iconClassName: 'mfa-u2f',
      sortOrder: 2
    },
    'WEBAUTHN': {
      label: 'factor.webauthn.biometric',
      description: 'factor.webauthn.biometric.description',
      iconClassName: 'mfa-webauthn',
      sortOrder: 2
    },
    'WINDOWS_HELLO': {
      label: 'factor.windowsHello',
      description: (brandName) => {
        return brandName ?
          'factor.windowsHello.signin.description.specific' :
          'factor.windowsHello.signin.description.generic';
      },
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
    'CUSTOM_HOTP': {
      label: '',
      description: 'factor.hotp.description',
      iconClassName: 'mfa-hotp',
      sortOrder: 6
    },
    'SMS': {
      label: 'factor.sms',
      description: 'factor.sms.description',
      iconClassName: 'mfa-okta-sms',
      sortOrder: 7
    },
    'CALL': {
      label: 'factor.call',
      description: 'factor.call.description',
      iconClassName: 'mfa-okta-call',
      sortOrder: 8
    },
    'EMAIL': {
      label: 'factor.email',
      description: 'factor.email.description',
      iconClassName: 'mfa-okta-email',
      sortOrder: 9
    },
    'QUESTION': {
      label: 'factor.securityQuestion',
      description: 'factor.securityQuestion.description',
      iconClassName: 'mfa-okta-security-question',
      sortOrder: 10
    },
    'DUO': {
      label: 'factor.duo',
      description: 'factor.duo.description',
      iconClassName: 'mfa-duo',
      sortOrder: 11
    },
    'SYMANTEC_VIP': {
      label: 'factor.totpHard.symantecVip',
      description: 'factor.totpHard.description',
      iconClassName: 'mfa-symantec',
      sortOrder: 12
    },
    'RSA_SECURID': {
      label: 'factor.totpHard.rsaSecurId',
      description: 'factor.totpHard.description',
      iconClassName: 'mfa-rsa',
      sortOrder: 13
    },
    'ON_PREM': {
      label: '',
      description: 'factor.totpHard.description',
      iconClassName: 'mfa-onprem',
      sortOrder: 14
    },
    'PASSWORD': {
      label: 'factor.password',
      description: '',
      iconClassName: 'mfa-okta-password',
      sortOrder: 15
    },
    'CUSTOM_CLAIMS': {
      label: '',
      description: 'factor.customFactor.description',
      iconClassName: 'mfa-custom-factor',
      sortOrder: 16
    },
    'GENERIC_SAML': {
      label: '',
      description: (brandName) => {
        return brandName ?
          'factor.customFactor.description.specific':
          'factor.customFactor.description.generic';
      },
      iconClassName: 'mfa-custom-factor',
      sortOrder: 17
    },
    'GENERIC_OIDC': {
      label: '',
      description: (brandName) => {
        return brandName ?
          'factor.customFactor.description.specific' :
          'factor.customFactor.description.generic';
      },
      iconClassName: 'mfa-custom-factor',
      sortOrder: 18
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
    if (provider === 'OKTA' && factorType === 'email') {
      return 'EMAIL';
    }
    if (provider === 'OKTA' && factorType === 'password') {
      return 'PASSWORD';
    }
    if (provider === 'GENERIC_SAML' && factorType === 'assertion:saml2') {
      return 'GENERIC_SAML';
    }
    if (provider === 'GENERIC_OIDC' && factorType === 'assertion:oidc') {
      return 'GENERIC_OIDC';
    }
    return fn.getFactorNameForFactorType.call(this, factorType);
  };

  fn.getFactorNameForFactorType = function (factorType) {
    if (factorType === 'u2f') {
      return 'U2F';
    }
    if (factorType === 'token:software:totp') {
      return 'OKTA_VERIFY';
    }
    if (factorType === 'webauthn') {
      if (this.settings.get('features.webauthn')) {
        return 'WEBAUTHN';
      } else {
        return 'WINDOWS_HELLO';
      }
    }
    if (factorType === 'token:hotp') {
      return 'CUSTOM_HOTP';
    }
    if (factorType === 'claims_provider') {
      return 'CUSTOM_CLAIMS';
    }
  };

  fn.isOktaVerify = function (provider, factorType) {
    return provider === 'OKTA' && (factorType === 'token:software:totp' || factorType === 'push');
  };

  fn.getFactorLabel = function (provider, factorType) {
    var key = factorData[fn.getFactorName.apply(this, [provider, factorType])].label;
    return Okta.loc(key, 'login');
  };

  fn.getFactorDescription = function (provider, factorType) {
    var descriptionKey = factorData[fn.getFactorName.apply(this, [provider, factorType])].description;
    if (_.isFunction(descriptionKey)) {
      var brandName = this.settings.get('brandName');
      var key = descriptionKey(brandName);
      return brandName ? Okta.loc(key, 'login', [brandName]) : Okta.loc(key, 'login');
    } else {
      return Okta.loc(descriptionKey, 'login');
    }
  };

  fn.getFactorIconClassName = function (provider, factorType) {
    return factorData[fn.getFactorName.apply(this, [provider, factorType])].iconClassName;
  };

  fn.getFactorSortOrder = function (provider, factorType) {
    return factorData[fn.getFactorName.apply(this, [provider, factorType])].sortOrder;
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

    var getPasswordAgeRequirement = function (displayableTime) {
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

  fn.getCardinalityText = function (enrolled, required, cardinality) {
    if (cardinality) {
      if (enrolled) {
        return (cardinality.enrolled === 1) ? '' :
          Okta.loc('enroll.choices.cardinality.setup', 'login', [cardinality.enrolled]);
      }
      else if (required && cardinality.maximum > 1) {
        return Okta.loc('enroll.choices.cardinality.setup.remaining', 'login',
          [cardinality.enrolled, cardinality.minimum]);
      }
    }
    return '';
  };

  fn.findFactorInFactorsArray = function (factors, provider, factorType) {
    var factor = factors.findWhere({provider: provider, factorType: factorType});
    if (factor === undefined) {
      //for factors that support cardinality and only have factorType
      factor = factors.findWhere({factorType: factorType});
    }
    return factor;
  };

  return fn;
});
