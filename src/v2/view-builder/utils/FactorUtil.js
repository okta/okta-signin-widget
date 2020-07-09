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

  'app': {
    label: loc('oie.app', 'login'),
    description: '',
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
