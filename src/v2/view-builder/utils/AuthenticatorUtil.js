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
import FactorUtil from '../../../util/FactorUtil';
import { AUTHENTICATOR_KEY } from '../../ion/RemediationConstants';

const { getPasswordComplexityDescription, getPasswordComplexityDescriptionForHtmlList } = FactorUtil;

const getButtonDataSeAttr = function (authenticator) {
  if (authenticator.authenticatorKey) {
    const method = authenticator.value?.methodType ?
      '-' + authenticator.value?.methodType : '';
    return authenticator.authenticatorKey + method;
  }
  return '';
};

/* eslint complexity: [2, 19] */
const getAuthenticatorData = function (authenticator, isVerifyAuthenticator) {
  const authenticatorKey = authenticator.authenticatorKey;
  const key = _.isString(authenticatorKey) ? authenticatorKey.toLowerCase() : '';
  let authenticatorData = {};
  switch (key) {
  case AUTHENTICATOR_KEY.EMAIL:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.email.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-email',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
    });
    break;

  case AUTHENTICATOR_KEY.PASSWORD:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.password.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-password',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
    });
    break;

  case AUTHENTICATOR_KEY.PHONE:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? authenticator.relatesTo?.profile?.phoneNumber
        : loc('oie.phone.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-phone',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
    });
    break;

  case AUTHENTICATOR_KEY.SECURITY_QUESTION:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.security.question.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-security-question',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
    });
    break;

  case AUTHENTICATOR_KEY.WEBAUTHN:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.webauthn.description', 'login'),
      iconClassName: 'mfa-webauthn',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
    });
    break;

  case AUTHENTICATOR_KEY.OV:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.okta_verify.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-verify',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
    });
    break;

  case AUTHENTICATOR_KEY.GOOGLE_AUTHENTICATOR:
    Object.assign(authenticatorData, {
      description: '',
      iconClassName: 'mfa-google-auth',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
    });
    break;

  case AUTHENTICATOR_KEY.ON_PREM: {
    const vendorName =  authenticator.relatesTo?.displayName ||
      loc('oie.on_prem.authenticator.default.vendorName', 'login');
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.on_prem.authenticator.description', 'login', [vendorName]),
      iconClassName: 'mfa-onprem',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
    });
    break;
  }
  }

  return authenticatorData;
};

export function getAuthenticatorDataForEnroll (authenticator) {
  return getAuthenticatorData(authenticator);
}

export function getAuthenticatorDataForVerification (authenticator) {
  return getAuthenticatorData(authenticator, true);
}

export function getIconClassNameForBeacon (authenticatorKey) {
  return getAuthenticatorData({ authenticatorKey }).iconClassName;
}

export function removeRequirementsFromError (errorJSON, policy) {
  const passwordRequirementsAsString = getPasswordComplexityDescription(policy);
  if (errorJSON.errorCauses?.length > 0
    && Array.isArray(errorJSON.errorCauses[0].errorSummary)
    && errorJSON.errorCauses[0].errorSummary.length > 0) {

    // Remove the requirements string if it is present.
    errorJSON.errorCauses[0].errorSummary = errorJSON.errorCauses[0].errorSummary[0]
      .replace(`${passwordRequirementsAsString}`, '')
      .trim();
  }
  return errorJSON;
}

// Re-export function from FactorUtil
export { getPasswordComplexityDescriptionForHtmlList };
