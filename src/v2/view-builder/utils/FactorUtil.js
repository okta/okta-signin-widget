/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { loc, _ } from 'okta';

const factorData = {
  'email': {
    label: loc('oie.email', 'login'),
    description: '',
    iconClassName: 'mfa-okta-email',
  },

  'password': {
    label: loc('oie.password', 'login'),
    description: '',
    iconClassName: 'mfa-okta-password',
  },

  'phone': {
    label: loc('oie.phone', 'login'),
    description: '',
    iconClassName: 'mfa-okta-phone',
  },

  'security_question': {
    label: loc('oie.security.question', 'login'),
    description: '',
    iconClassName: 'mfa-okta-security-question',
  },

  // Will get rid of this after fully implementing verify. OKTA-301557
  'webauthn': {
    label: loc('oie.webauthn', 'login'),
    description: loc('oie.webauthn.description', 'login'),
    iconClassName: 'mfa-webauthn',
  },

  'security_key': {
    label: loc('oie.webauthn', 'login'),
    description: loc('oie.webauthn.description', 'login'),
    iconClassName: 'mfa-webauthn',
  },
};

const getFactorData = function (factorName) {
  const key = _.isString(factorName) ? factorName.toLowerCase() : '';
  return factorData[key];
};

const getPasswordComplexityRequirementsAsArray = function ({ complexity }, { complexity: complexityFields }) {
  const setExcludeAttributes = function (policyComplexity) {
    const excludeAttributes = policyComplexity.excludeAttributes;
    policyComplexity.excludeFirstName = _.contains(excludeAttributes, 'firstName');
    policyComplexity.excludeLastName = _.contains(excludeAttributes, 'lastName');
    return _.omit(policyComplexity, 'excludeAttributes');
  };

  if (complexity) {
    const policyComplexity = setExcludeAttributes( complexity );

    let requirements = _.map(policyComplexity, function ( complexityValue, complexityType ) {
      if (complexityValue <= 0) {
        return;
      }
      const { args, i18n } = complexityFields[ complexityType ];
      return args ? loc(i18n, 'login', [complexityValue]) : loc(i18n, 'login');
    });

    return _.compact(requirements);
  }
  return [];
};

const getPasswordHistoryRequirementDescription = function ({ age }, i18nKeys) {
  if (age && age.historyCount > 0) {
    return loc(i18nKeys.history.i18n, 'login', [ age.historyCount ]);
  }
  return null;
};

const getPasswordRequirements = function (policy, i18nKeys) {
  const passwordRequirements = {
    complexity: getPasswordComplexityRequirementsAsArray(policy, i18nKeys),
    history: [],
  };

  const historyRequirement = getPasswordHistoryRequirementDescription(policy, i18nKeys);
  if (historyRequirement) {
    passwordRequirements.history.push(historyRequirement);
  }

  return passwordRequirements;
};

const getPasswordComplexityDescriptionForHtmlList = function ( policy ) {
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
    },
    history: { i18n: 'password.complexity.history.description' },
  };
  const {
    complexity,
    history,
  } = getPasswordRequirements(policy, passwordRequirementHtmlI18nKeys);
  return _.union(complexity, history);
};

module.exports = {
  getFactorData,
  getPasswordComplexityDescriptionForHtmlList,
};
