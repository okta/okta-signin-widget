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
export { getPasswordComplexityDescriptionForHtmlList } from '../../../util/FactorUtil';

/* eslint complexity: [2, 19] */
const getAuthenticatorData = function (authenticator, isVerifyAuthenticator) {
  const authenticatorType = authenticator.authenticatorType || authenticator.factorType;
  const key = _.isString(authenticatorType) ? authenticatorType.toLowerCase() : '';
  let authenticatorData = {};
  switch (key) {
  case 'email':
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.email.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-email',
    });
    break;

  case 'password':
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.password.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-password',
    });
    break;

  case 'phone':
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? authenticator.relatesTo?.profile?.phoneNumber
        : loc('oie.phone.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-phone',
    });
    break;

  case 'security_question': 
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.security.question.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-security-question',
    });
    break;

  // Will get rid of this after fully implementing verify. OKTA-301557
  case 'webauthn':
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.webauthn.description', 'login'),
      iconClassName: 'mfa-webauthn',
    });
    break;

  case 'security_key':
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.webauthn.description', 'login'),
      iconClassName: 'mfa-webauthn',
    });
    break;

  case 'app':
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.okta_verify.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-verify',
    });
    break;
  }

  return authenticatorData;
};

export function getAuthenticatorDataForEnroll (authenticator) {
  return getAuthenticatorData(authenticator);
}

export function getAuthenticatorDataForVerification (authenticator) {
  return getAuthenticatorData(authenticator, true);
}

export function getIconClassNameForBeacon (authenticatorType) {
  return getAuthenticatorData({ authenticatorType }).iconClassName;
}