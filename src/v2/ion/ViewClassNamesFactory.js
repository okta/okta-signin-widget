/* eslint complexity: [2, 25] */
import {FORMS} from './RemediationConstants';

const FORMNAME_CLASSNAME_MAPPINGS = {
  [FORMS.IDENTIFY]: {
    [FORMS.IDENTIFY]: ['primary-auth'],
    'password': ['primary-auth']
  },
  [FORMS.ENROLL_PROFILE]: {
    [FORMS.ENROLL_PROFILE]: ['registration'],
  },
  [FORMS.CHALLENGE_AUTHENTICATOR]: {
    email: ['mfa-verify-passcode'],
    password: ['mfa-verify-password'],
    sms: ['mfa-verify-passcode'],
    voice: ['mfa-verify-passcode'],
    'security_question': ['mfa-verify-question']
  },
  [FORMS.ENROLL_AUTHENTICATOR]: {
    email: ['enroll-email'],
    password: ['enroll-password'],
    sms: ['enroll-sms'],
    voice: ['enroll-call'],
    'security_question': ['enroll-question'],
  },

  [FORMS.SELECT_AUTHENTICATOR_ENROLL]: {
    'select-authenticator-enroll': ['enroll-choices']
  },
  [FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE]: {
    'password': ['forgot-password']
  },
  [FORMS.REENROLL_AUTHENTICATOR]: {
    'password':['password-expired']
  },

  [FORMS.RESET_AUTHENTICATOR]: {
    'password':['forgot-password']
  },
};

const getV1ClassName = (formName, type, isPasswordRecoveryFlow) => {
  if (isPasswordRecoveryFlow && formName === 'identify') {
    // if password reset flow from identifier page with recoveryAuthenticator add forgot-password class
    return ['forgot-password'];
  } else {
    return FORMNAME_CLASSNAME_MAPPINGS[formName][type];
  }
};

const getClassNameMapping = (formName, authenticatorType, methodType) => {
  let type = formName;
  let v2ClassName = formName;
  let classNames = [];

  if (authenticatorType === 'phone') {
    /**
      Both sms and call have same type phone
      currentAuthenticatorEnrollment is during verify and currentAuthenticator during enroll flows
    **/
    type = `${methodType}`;
  }
  else if (authenticatorType) {
    type = `${authenticatorType}`;
  }

  if (type !== formName) {
    // If we have a type which is authenticatorType/methodType use that to generate a V2 className
    v2ClassName = formName + '--' + type;
  }
  classNames.push(v2ClassName);
  //do a lookup for any V1 classNames and concat
  if (FORMNAME_CLASSNAME_MAPPINGS[formName] && FORMNAME_CLASSNAME_MAPPINGS[formName][type]) {
    classNames = classNames.concat(getV1ClassName(formName, type));
  }
  return classNames;
};

export {
  getClassNameMapping,
  getV1ClassName
};

