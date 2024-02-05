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
import _ from 'underscore';
import { loc } from './loc';
import TimeUtil from 'util/TimeUtil';
const fn = {};
const factorData = {
  OKTA_VERIFY: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.totpSoft.oktaVerify',
    description: 'factor.totpSoft.description',
    iconClassName: 'mfa-okta-verify',
    sortOrder: 1,
  },
  OKTA_VERIFY_PUSH: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.oktaVerifyPush',
    description: 'factor.push.description',
    iconClassName: 'mfa-okta-verify',
    sortOrder: 1,
  },
  U2F: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.u2f',
    description: brandName => {
      return brandName ? 'factor.u2f.description.specific' : 'factor.u2f.description.generic';
    },
    iconClassName: 'mfa-u2f',
    sortOrder: 2,
  },
  WEBAUTHN: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.webauthn.biometric',
    description: 'factor.webauthn.biometric.description',
    iconClassName: 'mfa-webauthn',
    sortOrder: 2,
  },
  WINDOWS_HELLO: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.windowsHello',
    description: brandName => {
      return brandName
        ? 'factor.windowsHello.signin.description.specific'
        : 'factor.windowsHello.signin.description.generic';
    },
    iconClassName: 'mfa-windows-hello',
    sortOrder: 3,
  },
  YUBIKEY: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.totpHard.yubikey',
    description: 'factor.totpHard.yubikey.description',
    iconClassName: 'mfa-yubikey',
    sortOrder: 4,
  },
  GOOGLE_AUTH: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.totpSoft.googleAuthenticator',
    description: 'factor.totpSoft.description',
    iconClassName: 'mfa-google-auth',
    sortOrder: 5,
  },
  CUSTOM_HOTP: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: '',
    description: 'factor.hotp.description',
    iconClassName: 'mfa-hotp',
    sortOrder: 6,
  },
  SMS: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.sms',
    description: 'factor.sms.description',
    iconClassName: 'mfa-okta-sms',
    sortOrder: 7,
  },
  CALL: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.call',
    description: 'factor.call.description',
    iconClassName: 'mfa-okta-call',
    sortOrder: 8,
  },
  EMAIL: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.email',
    description: 'factor.email.description',
    iconClassName: 'mfa-okta-email',
    sortOrder: 9,
  },
  QUESTION: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.securityQuestion',
    description: 'factor.securityQuestion.description',
    iconClassName: 'mfa-okta-security-question',
    sortOrder: 10,
  },
  DUO: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.duo',
    description: 'factor.duo.description',
    iconClassName: 'mfa-duo',
    sortOrder: 11,
  },
  SYMANTEC_VIP: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.totpHard.symantecVip',
    description: 'factor.totpHard.description',
    iconClassName: 'mfa-symantec',
    sortOrder: 12,
  },
  RSA_SECURID: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.totpHard.rsaSecurId',
    description: 'factor.totpHard.description',
    iconClassName: 'mfa-rsa',
    sortOrder: 13,
  },
  ON_PREM: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: '',
    description: 'factor.totpHard.description',
    iconClassName: 'mfa-onprem',
    sortOrder: 14,
  },
  PASSWORD: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: 'factor.password',
    description: '',
    iconClassName: 'mfa-okta-password',
    sortOrder: 15,
  },
  CUSTOM_CLAIMS: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: '',
    description: 'factor.customFactor.description',
    iconClassName: 'mfa-custom-factor',
    sortOrder: 16,
  },
  GENERIC_SAML: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: '',
    description: brandName => {
      return brandName ? 'factor.customFactor.description.specific' : 'factor.customFactor.description.generic';
    },
    iconClassName: 'mfa-custom-factor',
    sortOrder: 17,
  },
  GENERIC_OIDC: {
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
    label: '',
    description: brandName => {
      return brandName ? 'factor.customFactor.description.specific' : 'factor.customFactor.description.generic';
    },
    iconClassName: 'mfa-custom-factor',
    sortOrder: 18,
  },
};

const getPasswordComplexityRequirementsAsArray = function(policy, i18nKeys) {
  const setExcludeAttributes = function(policyComplexity) {
    const excludeAttributes = policyComplexity.excludeAttributes;

    policyComplexity.excludeFirstName = _.contains(excludeAttributes, 'firstName');
    policyComplexity.excludeLastName = _.contains(excludeAttributes, 'lastName');
    return _.omit(policyComplexity, 'excludeAttributes');
  };

  if (policy.complexity) {
    const complexityFields = i18nKeys.complexity;

    const policyComplexity = setExcludeAttributes(policy.complexity);
    let filteredPolicyComplexity = policyComplexity;

    // If useADComplexityRequirements is true, ignore casing, number, and symbol rules since
    // AD validator handles those requirements
    if (policyComplexity.useADComplexityRequirements) {
      const allowed = ['minLength', 'useADComplexityRequirements', 'excludeUsername', 'excludeFirstName',
        'excludeLastName', 'excludeAttributes'];
      filteredPolicyComplexity = _.pick(policyComplexity, allowed);
    }

    const requirements = _.map(filteredPolicyComplexity, function(complexityValue, complexityType) {
      if (complexityValue <= 0) {
        // to skip 0 and -1
        return;
      }

      const params = complexityFields[complexityType];

      return params.args ? loc(params.i18n, 'login', [complexityValue]) : loc(params.i18n, 'login');
    });

    return _.compact(requirements);
  }
  return [];
};

const getPasswordHistoryRequirementDescription = function(policy, i18nKeys, isUpdatedPasswordRequirementsText) {
  if (policy.age && policy.age.historyCount > 0) {
    if (isUpdatedPasswordRequirementsText) {
      return policy.age.historyCount === 1 ?
        loc(i18nKeys.history.one.i18n, 'login')
        : loc(i18nKeys.history.many.i18n, 'login', [policy.age.historyCount]);
    } else {
      return loc(i18nKeys.history.i18n, 'login', [policy.age.historyCount]);
    }
  }
  return null;
};

const getPasswordAgeRequirementDescription = function(policy, i18nKeys) {
  const getPasswordAgeRequirement = function(displayableTime) {
    let propertiesString;

    switch (displayableTime.unit) {
    case 'DAY':
      propertiesString = i18nKeys.age.days.i18n;
      break;
    case 'HOUR':
      propertiesString = i18nKeys.age.hours.i18n;
      break;
    case 'MINUTE':
      propertiesString = i18nKeys.age.minutes.i18n;
    }
    return loc(propertiesString, 'login', [displayableTime.time]);
  };

  if (policy.age && policy.age.minAgeMinutes > 0) {
    const displayableTime = TimeUtil.getTimeInHighestRelevantUnit(policy.age.minAgeMinutes, 'MINUTE');

    return getPasswordAgeRequirement(displayableTime);
  }
  return null;
};

const getPasswordRequirements = function(policy, i18nKeys, isUpdatedPasswordRequirementsText) {
  const passwordRequirements = {
    complexity: [],
    history: [],
    age: [],
  };

  passwordRequirements.complexity = getPasswordComplexityRequirementsAsArray(policy, i18nKeys);

  const historyRequirement =
    getPasswordHistoryRequirementDescription(policy, i18nKeys, isUpdatedPasswordRequirementsText);

  if (historyRequirement) {
    passwordRequirements.history.push(historyRequirement);
  }

  const ageRequirement = getPasswordAgeRequirementDescription(policy, i18nKeys);

  if (ageRequirement) {
    passwordRequirements.age.push(ageRequirement);
  }

  return passwordRequirements;
};

fn.getFactorName = function(provider, factorType) {
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

fn.getFactorNameForFactorType = function(factorType) {
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

fn.isOktaVerify = function(provider, factorType) {
  return provider === 'OKTA' && (factorType === 'token:software:totp' || factorType === 'push');
};

fn.getFactorLabel = function(provider, factorType) {
  const key = factorData[fn.getFactorName.apply(this, [provider, factorType])].label;

  return loc(key, 'login');
};

fn.getFactorDescription = function(provider, factorType) {
  const descriptionKey = factorData[fn.getFactorName.apply(this, [provider, factorType])].description;

  if (_.isFunction(descriptionKey)) {
    const brandName = this.settings.get('brandName');
    const key = descriptionKey(brandName);

    return brandName ? loc(key, 'login', [brandName]) : loc(key, 'login');
  } else {
    return descriptionKey ? loc(descriptionKey, 'login') : '';
  }
};

fn.getFactorIconClassName = function(provider, factorType) {
  return factorData[fn.getFactorName.apply(this, [provider, factorType])].iconClassName;
};

fn.getFactorSortOrder = function(provider, factorType) {
  return factorData[fn.getFactorName.apply(this, [provider, factorType])].sortOrder;
};

fn.getRememberDeviceValue = function(appState) {
  return appState && appState.get('rememberDeviceByDefault');
};

fn.getSecurityQuestionLabel = function(questionObj) {
  const localizedQuestion = loc('security.' + questionObj.question);

  return localizedQuestion.indexOf('L10N_ERROR') < 0 ? localizedQuestion : questionObj.questionText;
};

fn.removeRequirementsFromError = function(responseJSON, policy) {
  const passwordRequirementsAsString = this.getPasswordComplexityDescription(policy);

  if (
    responseJSON.errorCauses &&
    responseJSON.errorCauses.length > 0 &&
    _.isString(responseJSON.errorCauses[0].errorSummary)
  ) {
    responseJSON.errorCauses[0].errorSummary = responseJSON.errorCauses[0].errorSummary
      .replace(passwordRequirementsAsString, '')
      .trim();
  }
  return responseJSON;
};

fn.getPasswordComplexityDescriptionForHtmlList = function(policy) {
  const passwordRequirementHtmlI18nKeys = {
    complexity: {
      minLength: { i18n: 'password.complexity.length.description', args: true },
      minLowerCase: { i18n: 'password.complexity.lowercase.description' },
      minUpperCase: { i18n: 'password.complexity.uppercase.description' },
      minNumber: { i18n: 'password.complexity.number.description' },
      minSymbol: { i18n: 'password.complexity.symbol.description' },
      excludeUsername: { i18n: 'password.complexity.no_username.description' },
      excludeFirstName: { i18n: 'password.complexity.no_first_name.description' },
      excludeLastName: { i18n: 'password.complexity.no_last_name.description' },
      useADComplexityRequirements: { i18n: 'password.complexity.adRequirements.description' },
    },
    history: {
      one: { i18n: 'password.complexity.history.one.description' },
      many: { i18n: 'password.complexity.history.description' }
    },
    age: {
      minutes: { i18n: 'password.complexity.minAgeMinutes.description' },
      hours: { i18n: 'password.complexity.minAgeHours.description' },
      days: { i18n: 'password.complexity.minAgeDays.description' },
    },
  };
  const passwordRequirements = getPasswordRequirements(policy, passwordRequirementHtmlI18nKeys, true);

  return _.union(passwordRequirements.complexity, passwordRequirements.history, passwordRequirements.age);
};

fn.getPasswordComplexityDescription = function(policy) {
  const passwordRequirementI18nKeys = {
    complexity: {
      minLength: { i18n: 'password.complexity.length', args: true },
      minLowerCase: { i18n: 'password.complexity.lowercase' },
      minUpperCase: { i18n: 'password.complexity.uppercase' },
      minNumber: { i18n: 'password.complexity.number' },
      minSymbol: { i18n: 'password.complexity.symbol' },
      excludeUsername: { i18n: 'password.complexity.no_username' },
      excludeFirstName: { i18n: 'password.complexity.no_first_name' },
      excludeLastName: { i18n: 'password.complexity.no_last_name' },
      useADComplexityRequirements: { i18n: 'password.complexity.adRequirements' },
    },
    history: { i18n: 'password.complexity.history' },
    age: {
      minutes: { i18n: 'password.complexity.minAgeMinutes' },
      hours: { i18n: 'password.complexity.minAgeHours' },
      days: { i18n: 'password.complexity.minAgeDays' },
    },
  };
  const result = [];
  const passwordRequirements = getPasswordRequirements(policy, passwordRequirementI18nKeys, false);
  let requirements = passwordRequirements.complexity;

  // Generate and add complexity string to result
  if (requirements.length > 0) {
    requirements = _.reduce(requirements, function(result, requirement) {
      return result ? result + loc('password.complexity.list.element', 'login', [requirement]) : requirement;
    });

    result.push(loc('password.complexity.requirements', 'login', [requirements]));
  }

  // Only 1 value expected in history and age for now
  result.push(passwordRequirements.history[0]);
  result.push(passwordRequirements.age[0]);

  return _.compact(result).join(' ');
};

fn.getCardinalityText = function(enrolled, required, cardinality) {
  if (cardinality) {
    if (enrolled) {
      return cardinality.enrolled === 1 ? '' : loc('enroll.choices.cardinality.setup', 'login', [cardinality.enrolled]);
    } else if (required && cardinality.maximum > 1) {
      return loc('enroll.choices.cardinality.setup.remaining', 'login', [cardinality.enrolled, cardinality.minimum]);
    }
  }
  return '';
};

fn.findFactorInFactorsArray = function(factors, provider, factorType) {
  let factor = factors.findWhere({ provider: provider, factorType: factorType });

  if (factor === undefined) {
    //for factors that support cardinality and only have factorType
    factor = factors.findWhere({ factorType: factorType });
  }
  return factor;
};

export default fn;
