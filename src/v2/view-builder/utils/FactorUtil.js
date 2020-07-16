/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
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
import { getPasswordComplexityDescriptionForHtmlList } from '../../../util/FactorUtil';

const factorData = {
  'email': {
    description: loc('oie.email.authenticator.description', 'login'),
    iconClassName: 'mfa-okta-email',
  },

  'password': {
    description: loc('oie.password.authenticator.description', 'login'),
    iconClassName: 'mfa-okta-password',
  },

  'phone': {
    description: loc('oie.phone.authenticator.description', 'login'),
    iconClassName: 'mfa-okta-phone',
  },

  'security_question': {
    description: loc('oie.security.question.authenticator.description', 'login'),
    iconClassName: 'mfa-okta-security-question',
  },

  // Will get rid of this after fully implementing verify. OKTA-301557
  'webauthn': {
    label: loc('oie.webauthn', 'login'),
    description: loc('oie.webauthn.description', 'login'),
    iconClassName: 'mfa-webauthn',
  },

  'security_key': {
    description: loc('oie.webauthn.description', 'login'),
    iconClassName: 'mfa-webauthn',
  },

  'app': {
    label: loc('oie.app', 'login'),
    description: loc('oie.okta_verify.authenticator.description', 'login'),
    iconClassName: 'mfa-okta-verify',
  },
};

const getFactorData = function (factorName) {
  const key = _.isString(factorName) ? factorName.toLowerCase() : '';
  return factorData[key];
};

module.exports = {
  getFactorData,
  getPasswordComplexityDescriptionForHtmlList,
};
