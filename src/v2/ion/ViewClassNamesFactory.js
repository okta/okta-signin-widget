/* eslint complexity: [2, 25] */
import { AUTHENTICATOR_KEY, FORMS } from './RemediationConstants';

const FORMNAME_CLASSNAME_MAPPINGS = {
  [FORMS.IDENTIFY]: {
    [FORMS.IDENTIFY]: 'primary-auth',
    [AUTHENTICATOR_KEY.PASSWORD]: 'primary-auth'
  },
  [FORMS.IDENTIFY_RECOVERY]: {
    [FORMS.IDENTIFY_RECOVERY]: 'forgot-password',
  },
  [FORMS.ENROLL_PROFILE]: {
    [FORMS.ENROLL_PROFILE]: 'registration',
  },
  [FORMS.CHALLENGE_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.EMAIL]: 'mfa-verify-passcode',
    [AUTHENTICATOR_KEY.PASSWORD]: 'mfa-verify-password',
    sms: 'mfa-verify-passcode',
    voice: 'mfa-verify-passcode',
    [AUTHENTICATOR_KEY.SECURITY_QUESTION]: 'mfa-verify-question',
    [AUTHENTICATOR_KEY.WEBAUTHN]: 'mfa-verify-webauthn',
    [AUTHENTICATOR_KEY.ON_PREM]: 'mfa-verify-totp',
    [AUTHENTICATOR_KEY.RSA]: 'mfa-verify-totp',
    [AUTHENTICATOR_KEY.OV]: 'mfa-verify',
    [AUTHENTICATOR_KEY.GOOGLE_OTP]: 'mfa-verify',
    [AUTHENTICATOR_KEY.DUO]: 'mfa-verify-duo',
    [AUTHENTICATOR_KEY.SYMANTEC_VIP]: 'mfa-verify',
    [AUTHENTICATOR_KEY.YUBIKEY]: 'mfa-verify',
    [AUTHENTICATOR_KEY.CUSTOM_APP]: 'mfa-verify',
  },
  [FORMS.CHALLENGE_POLL]: {
    [AUTHENTICATOR_KEY.OV]: 'mfa-verify',
    [AUTHENTICATOR_KEY.CUSTOM_APP]: 'mfa-verify',
  },
  [FORMS.RESEND_PUSH]: {
    [AUTHENTICATOR_KEY.OV]: 'mfa-verify',
    [AUTHENTICATOR_KEY.CUSTOM_APP]: 'mfa-verify',
  },
  [FORMS.ENROLL_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.EMAIL]: 'enroll-email',
    [AUTHENTICATOR_KEY.PASSWORD]: 'enroll-password',
    sms: 'enroll-sms',
    voice: 'enroll-call',
    [AUTHENTICATOR_KEY.SECURITY_QUESTION]: 'enroll-question',
    [AUTHENTICATOR_KEY.WEBAUTHN]: 'enroll-webauthn',
    [AUTHENTICATOR_KEY.ON_PREM]: 'enroll-onprem',
    [AUTHENTICATOR_KEY.RSA]: 'enroll-rsa',
    [AUTHENTICATOR_KEY.DUO]: 'enroll-duo',
    [AUTHENTICATOR_KEY.SYMANTEC_VIP]: 'enroll-symantec',
    [AUTHENTICATOR_KEY.YUBIKEY]: 'enroll-yubikey',
  },

  [FORMS.SELECT_AUTHENTICATOR_ENROLL]: {
    'select-authenticator-enroll': 'enroll-choices'
  },
  [FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE]: {
    [AUTHENTICATOR_KEY.PASSWORD]: 'forgot-password'
  },
  [FORMS.REENROLL_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.PASSWORD]: 'password-expired'
  },
  [FORMS.REENROLL_CUSTOM_PASSWORD_EXPIRY]: {
    [AUTHENTICATOR_KEY.PASSWORD]: 'custom-password-expired'
  },
  [FORMS.REENROLL_CUSTOM_PASSWORD_EXPIRY_WARNING]: {
    [AUTHENTICATOR_KEY.PASSWORD]: 'custom-password-expiry-warning'
  },

  [FORMS.RESET_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.PASSWORD]: 'forgot-password'
  },

  [FORMS.CONSENT_ADMIN]: {
    [FORMS.CONSENT_ADMIN]: 'admin-consent-required',
  },

  [FORMS.CONSENT_ENDUSER]: {
    [FORMS.CONSENT_ENDUSER]: 'consent-required',
  }
};

const getV1ClassName = (formName, authenticatorKey, methodType, isPasswordRecoveryFlow) => {
  // if password reset flow from identifier page with recoveryAuthenticator add forgot-password class
  if (isPasswordRecoveryFlow && formName === FORMS.IDENTIFY) {
    return 'forgot-password';
  } else {
    let key = formName;
    if (authenticatorKey === AUTHENTICATOR_KEY.PHONE) {
      // Both sms and call have same type phone
      // currentAuthenticatorEnrollment is during verify and currentAuthenticator during enroll flows
      key = `${methodType}`;
    }
    else if (authenticatorKey) {
      key = `${authenticatorKey}`;
    }

    if (FORMNAME_CLASSNAME_MAPPINGS[formName] && FORMNAME_CLASSNAME_MAPPINGS[formName][key]) {
      return FORMNAME_CLASSNAME_MAPPINGS[formName][key];
    } else {
      return null;
    }
  }
};

const getClassNameMapping = (formName, authenticatorKey, methodType, isPasswordRecoveryFlow) => {

  // 1. Generates V2 class name
  // If we have a type which is authenticatorType/methodType use that to generate a V2 className
  // Otherwise just use formName
  let v2ClassName = formName;
  if (authenticatorKey) {
    v2ClassName = v2ClassName + '--' + authenticatorKey;
  }

  // 2. do a lookup for any V1 classNames and concat
  let v1ClassName = getV1ClassName(
    formName,
    authenticatorKey,
    methodType,
    isPasswordRecoveryFlow,
  );
  const result = [v2ClassName];
  if (v1ClassName) {
    result.push(v1ClassName);
  }

  return result;
};

export {
  getClassNameMapping,
  getV1ClassName
};

