/* eslint complexity: [2, 25] */
import { FORMS } from './RemediationConstants';

const FORMNAME_CLASSNAME_MAPPINGS = {
  [FORMS.IDENTIFY]: {
    [FORMS.IDENTIFY]: 'primary-auth',
    'password': 'primary-auth'
  },
  [FORMS.ENROLL_PROFILE]: {
    [FORMS.ENROLL_PROFILE]: 'registration',
  },
  [FORMS.CHALLENGE_AUTHENTICATOR]: {
    email: 'mfa-verify-passcode',
    password: 'mfa-verify-password',
    sms: 'mfa-verify-passcode',
    voice: 'mfa-verify-passcode',
    'security_question': 'mfa-verify-question',
    'security_key': 'mfa-verify-webauthn',
    app: 'mfa-verify',
  },
  [FORMS.CHALLENGE_POLL]: {
    app: 'mfa-verify',
  },
  [FORMS.ENROLL_AUTHENTICATOR]: {
    email: 'enroll-email',
    password: 'enroll-password',
    sms: 'enroll-sms',
    voice: 'enroll-call',
    'security_question': 'enroll-question',
    'security_key': 'enroll-webauthn',
  },

  [FORMS.SELECT_AUTHENTICATOR_ENROLL]: {
    'select-authenticator-enroll': 'enroll-choices'
  },
  [FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE]: {
    'password': 'forgot-password'
  },
  [FORMS.REENROLL_AUTHENTICATOR]: {
    'password': 'password-expired'
  },

  [FORMS.RESET_AUTHENTICATOR]: {
    'password': 'forgot-password'
  },
};

const getV1ClassName = (formName, authenticatorType, methodType, isPasswordRecoveryFlow) => {
  // if password reset flow from identifier page with recoveryAuthenticator add forgot-password class
  if (isPasswordRecoveryFlow && formName === FORMS.IDENTIFY) {
    return 'forgot-password';
  } else {
    let type = formName;
    if (authenticatorType === 'phone') {
      // Both sms and call have same type phone
      // currentAuthenticatorEnrollment is during verify and currentAuthenticator during enroll flows
      type = `${methodType}`;
    }
    else if (authenticatorType) {
      type = `${authenticatorType}`;
    }

    if (FORMNAME_CLASSNAME_MAPPINGS[formName] && FORMNAME_CLASSNAME_MAPPINGS[formName][type]) {
      return FORMNAME_CLASSNAME_MAPPINGS[formName][type];
    } else {
      return null;
    }
  }
};

const getClassNameMapping = (formName, authenticatorType, methodType, isPasswordRecoveryFlow) => {

  // 1. Generates V2 class name
  // If we have a type which is authenticatorType/methodType use that to generate a V2 className
  // Otherwise just use formName
  let v2ClassName = formName;
  if (authenticatorType) {
    v2ClassName = v2ClassName + '--' + authenticatorType;
  }
  if (methodType && methodType !== authenticatorType) {
    v2ClassName = v2ClassName + '--' + methodType;
  }


  // 2. do a lookup for any V1 classNames and concat
  let v1ClassName = getV1ClassName(
    formName,
    authenticatorType,
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

