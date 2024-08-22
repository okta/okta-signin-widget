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
import _ from 'underscore';
import { loc } from '../../../util/loc';
import FactorUtil from 'util/FactorUtil';
import { AUTHENTICATOR_KEY, ID_PROOFING_TYPE } from '../../ion/RemediationConstants';

const { getPasswordComplexityDescriptionForHtmlList } = FactorUtil;

const getButtonDataSeAttr = function(authenticator) {
  if (authenticator.authenticatorKey) {
    const method = authenticator.value?.methodType ?
      '-' + authenticator.value?.methodType : '';
    return authenticator.authenticatorKey + method;
  }
  return '';
};

/* eslint complexity: [0, 0], max-statements: [2, 25] */
const getAuthenticatorData = function(authenticator, isVerifyAuthenticator) {
  const authenticatorKey = authenticator.authenticatorKey;
  const key = _.isString(authenticatorKey) ? authenticatorKey.toLowerCase() : '';
  let authenticatorData = {};
  let nicknameText = isVerifyAuthenticator ? authenticator.relatesTo?.nickname : undefined;
  switch (key) {
  case AUTHENTICATOR_KEY.EMAIL:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? authenticator.relatesTo?.profile?.email || ''
        : loc('oie.email.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-email',
      noTranslateClassName: isVerifyAuthenticator ? 'no-translate' : '',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      ariaLabel: isVerifyAuthenticator
        ? getVerifyEmailAriaLabel(authenticator.relatesTo?.profile?.email)
        : loc('oie.select.authenticator.enroll.email.label', 'login')
    });
    break;

  case AUTHENTICATOR_KEY.PASSWORD:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.password.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-password',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      ariaLabel: isVerifyAuthenticator
        ? loc('oie.select.authenticator.verify.password.label', 'login')
        : loc('oie.select.authenticator.enroll.password.label', 'login')
    });
    break;

  case AUTHENTICATOR_KEY.PHONE:
    Object.assign(authenticatorData, {
      nickname: nicknameText,
      description: isVerifyAuthenticator
        ? authenticator.relatesTo?.profile?.phoneNumber
        : loc('oie.phone.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-phone',
      noTranslateClassName: isVerifyAuthenticator ? 'no-translate' : '',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      ariaLabel: isVerifyAuthenticator
        ? getVerifyPhoneAriaLabel(authenticator.relatesTo?.profile?.phoneNumber)
        : loc('oie.select.authenticator.enroll.phone.label', 'login')
    });
    break;

  case AUTHENTICATOR_KEY.SECURITY_QUESTION:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.security.question.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-security-question',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      ariaLabel: isVerifyAuthenticator
        ? loc('oie.select.authenticator.verify.security.question.label', 'login')
        : loc('oie.select.authenticator.enroll.security.question.label', 'login')
    });
    break;

  case AUTHENTICATOR_KEY.WEBAUTHN:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.webauthn.description', 'login'),
      iconClassName: 'mfa-webauthn',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      ariaLabel: isVerifyAuthenticator
        ? loc('oie.select.authenticator.verify.webauthn.label', 'login')
        : loc('oie.select.authenticator.enroll.webauthn.label', 'login')
    });
    break;

  case AUTHENTICATOR_KEY.OV:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? loc('oie.okta_verify.label', 'login')
        : loc('oie.okta_verify.authenticator.description', 'login'),
      iconClassName: 'mfa-okta-verify',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      ariaLabel: getOktaVerifyAriaLabel(isVerifyAuthenticator, authenticator?.value?.methodType),
    });
    break;

  case AUTHENTICATOR_KEY.GOOGLE_OTP:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.google_authenticator.authenticator.description', 'login'),
      iconClassName: 'mfa-google-auth',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      ariaLabel: isVerifyAuthenticator
        ? loc('oie.select.authenticator.verify.named.authenticator.label', 'login', [authenticator.label])
        : loc('oie.select.authenticator.enroll.named.authenticator.label', 'login', [authenticator.label])
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
      ariaLabel: isVerifyAuthenticator
        ? loc('oie.select.authenticator.verify.named.authenticator.label', 'login', [authenticator.label])
        : loc('oie.select.authenticator.enroll.named.authenticator.label', 'login', [authenticator.label])
    });
    break;
  }

  case AUTHENTICATOR_KEY.RSA:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.rsa.authenticator.description', 'login'),
      iconClassName: 'mfa-rsa',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      ariaLabel: isVerifyAuthenticator
        ? loc('oie.select.authenticator.verify.named.authenticator.label', 'login', [authenticator.label])
        : loc('oie.select.authenticator.enroll.named.authenticator.label', 'login', [authenticator.label])
    });
    break;

  case AUTHENTICATOR_KEY.DUO:
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.duo.authenticator.description', 'login'),
      iconClassName: 'mfa-duo',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      ariaLabel: isVerifyAuthenticator
        ? loc('oie.select.authenticator.verify.named.authenticator.label', 'login', [authenticator.label])
        : loc('oie.select.authenticator.enroll.named.authenticator.label', 'login', [authenticator.label])
    });
    break;

  case AUTHENTICATOR_KEY.IDP: {
    const idpName =  authenticator.relatesTo?.displayName;
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.idp.authenticator.description', 'login', [idpName]),
      iconClassName: 'mfa-custom-factor',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      logoUri : authenticator?.relatesTo?.logoUri || '',
      ariaLabel: isVerifyAuthenticator
        ? loc('oie.select.authenticator.verify.named.authenticator.label', 'login', [authenticator.label])
        : loc('oie.select.authenticator.enroll.named.authenticator.label', 'login', [authenticator.label])
    });
    break;
  }
  case AUTHENTICATOR_KEY.CUSTOM_OTP: {
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.custom_otp.description', 'login'),
      iconClassName: 'mfa-hotp',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      ariaLabel: isVerifyAuthenticator
        ? loc('oie.select.authenticator.verify.named.authenticator.label', 'login', [authenticator.label])
        : loc('oie.select.authenticator.enroll.named.authenticator.label', 'login', [authenticator.label])
    });
    break;
  }

  case AUTHENTICATOR_KEY.SYMANTEC_VIP: {
    const appName =  authenticator.relatesTo?.displayName;
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.symantecVip.authenticator.description', 'login', [appName]),
      iconClassName: 'mfa-symantec',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      ariaLabel: isVerifyAuthenticator
        ? loc('oie.select.authenticator.verify.named.authenticator.label', 'login', [authenticator.label])
        : loc('oie.select.authenticator.enroll.named.authenticator.label', 'login', [authenticator.label])
    });
    break;
  }

  case AUTHENTICATOR_KEY.YUBIKEY: {
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''
        : loc('oie.yubikey.authenticator.description', 'login'),
      iconClassName: 'mfa-yubikey',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      ariaLabel: isVerifyAuthenticator
        ? loc('oie.select.authenticator.verify.named.authenticator.label', 'login', [authenticator.label])
        : loc('oie.select.authenticator.enroll.named.authenticator.label', 'login', [authenticator.label])
    });
    break;
  }

  case AUTHENTICATOR_KEY.CUSTOM_APP: {
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? authenticator?.relatesTo?.displayName
        : loc('oie.custom.app.authenticator.description', 'login', [authenticator.label]),
      noTranslateClassName: isVerifyAuthenticator ? 'no-translate' : '',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      iconClassName: 'mfa-custom-app-logo',
      logoUri : authenticator?.relatesTo?.logoUri || '',
      ariaLabel: isVerifyAuthenticator
        ? loc(
          'oie.select.authenticator.verify.named.authenticator.label',
          'login',
          [authenticator?.relatesTo?.displayName])
        : loc('oie.select.authenticator.enroll.named.authenticator.label', 'login', [authenticator.label])
    });
    break;
  }

  case AUTHENTICATOR_KEY.SMARTCARD: {
    Object.assign(authenticatorData, {
      description: isVerifyAuthenticator
        ? ''  
        : loc('oie.smartcard.authenticator.description', 'login'),
      iconClassName: 'mfa-smartcard',
      buttonDataSeAttr: getButtonDataSeAttr(authenticator),
      ariaLabel: isVerifyAuthenticator
        ? loc('oie.select.authenticator.verify.named.authenticator.label', 'login', [authenticator.label])
        : loc('oie.select.authenticator.enroll.named.authenticator.label', 'login', [authenticator.label])
    });
    break;
  }

  }
  return authenticatorData;
};

const getIDProofingData = function(idvName) {
  let idProofingData = {};
 
  switch (idvName) {
  case ID_PROOFING_TYPE.IDV_PERSONA:
    idProofingData = {
      iconClassName: 'mfa-idv-persona',
    };
    break;
  }
  return idProofingData;
};

export function getVerifyEmailAriaLabel(email) {
  return email
    ? loc('oie.select.authenticator.verify.email.with.email.label', 'login', [email])
    : loc('oie.select.authenticator.verify.email.label', 'login');
}

export function getVerifyPhoneAriaLabel(phone) {
  return phone
    ? loc('oie.select.authenticator.verify.phone.with.phone.label', 'login', [phone])
    : loc('oie.select.authenticator.verify.phone.label', 'login');
}

export function getOktaVerifyAriaLabel(isVerify, methodType) {
  if (!isVerify) {
    return loc('oie.select.authenticator.enroll.okta_verify.authenticator.label', 'login');
  }
  const defaultLabel = loc('oie.select.authenticator.verify.okta_verify.label', 'login');
  if (typeof methodType === 'undefined') {
    return defaultLabel;
  }
  const methodTypeLabelMap = {
    push: loc('oie.select.authenticator.okta_verify.push.label', 'login'),
    totp: loc('oie.select.authenticator.okta_verify.totp.label', 'login'),
    'signed_nonce': loc('oie.select.authenticator.okta_verify.signed_nonce.label', 'login'),
  };
  return methodTypeLabelMap[methodType] || defaultLabel;
}

export function getAuthenticatorDataForEnroll(authenticator) {
  return getAuthenticatorData(authenticator);
}

export function getAuthenticatorDataForVerification(authenticator) {
  return getAuthenticatorData(authenticator, true);
}

export function getIconClassNameForBeacon(authenticatorKey, idvName) {
  return getAuthenticatorData({ authenticatorKey }).iconClassName || getIDProofingData(idvName).iconClassName;
}

export function removeRequirementsFromError(errorJSON) {
  if (errorJSON.errorCauses?.length > 0
    && Array.isArray(errorJSON.errorCauses[0].errorSummary)
    && errorJSON.errorCauses[0].errorSummary.length > 0) {
    // Change from Array to string for all errors.
    errorJSON.errorCauses[0].errorSummary = errorJSON.errorCauses[0].errorSummary[0];

    // Overrides for particular error messages.
    const errorKey = errorJSON.errorCauses[0].errorKey?.length > 0 && errorJSON.errorCauses[0].errorKey[0];
    // Remove the requirements string only if this is requirements were not met error.
    if (errorKey === 'password.passwordRequirementsNotMet') {
      errorJSON.errorCauses[0].errorSummary = loc('registration.error.password.passwordRequirementsNotMet', 'login');
    }
  }
  return errorJSON;
}

/**
 * Get authenticator display name from {@code remediation}.
 *
 * @param {Object} remediation
 */
export function getAuthenticatorDisplayName(remediation) {
  return remediation.relatesTo?.value?.displayName;
}

// Re-export function from FactorUtil
export { getPasswordComplexityDescriptionForHtmlList };
