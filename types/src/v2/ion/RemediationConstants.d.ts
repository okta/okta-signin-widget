export namespace ACTIONS {
    export { ENROLLED_PASSWORD_RECOVERY_LINK };
    export { ORG_PASSWORD_RECOVERY_LINK };
}
export namespace FORMS {
    const IDENTIFY: string;
    const SELECT_IDENTIFY: string;
    const IDENTIFY_RECOVERY: string;
    const SELECT_ENROLL_PROFILE: string;
    const ENROLL_PROFILE: string;
    const ENROLL_PROFILE_UPDATE: string;
    const UNLOCK_ACCOUNT: string;
    const REQUEST_ACTIVATION: string;
    const CONSENT_ADMIN: string;
    const CONSENT_ENDUSER: string;
    const CONSENT_EMAIL_CHALLENGE: string;
    const SELECT_AUTHENTICATOR_AUTHENTICATE: string;
    const SELECT_AUTHENTICATOR_UNLOCK: string;
    const AUTHENTICATOR_VERIFICATION_DATA: string;
    const CHALLENGE_AUTHENTICATOR: string;
    const CHALLENGE_POLL: string;
    const RESEND: string;
    const SELECT_AUTHENTICATOR_ENROLL: string;
    const SELECT_AUTHENTICATOR_ENROLL_DATA: string;
    const AUTHENTICATOR_ENROLLMENT_DATA: string;
    const ENROLL_AUTHENTICATOR: string;
    const SELECT_ENROLLMENT_CHANNEL: string;
    const ENROLLMENT_CHANNEL_DATA: string;
    const ENROLL_POLL: string;
    const REENROLL_AUTHENTICATOR: string;
    const REENROLL_AUTHENTICATOR_WARNING: string;
    const RESET_AUTHENTICATOR: string;
    const SKIP: string;
    const POLL: string;
    const FAILURE_REDIRECT: string;
    const SUCCESS_REDIRECT: string;
    const REDIRECT_IDP: string;
    const PIV_IDP: string;
    const DEVICE_CHALLENGE_POLL: string;
    const DEVICE_APPLE_SSO_EXTENSION: string;
    const CANCEL_TRANSACTION: string;
    const LAUNCH_AUTHENTICATOR: string;
    const DEVICE_ENROLLMENT_TERMINAL: string;
    const USER_CODE: string;
    const TERMINAL: string;
}
export const FORMS_WITHOUT_SIGNOUT: string[];
export const FORMS_WITH_STATIC_BACK_LINK: string[];
export const FORMS_FOR_VERIFICATION: string[];
export namespace AUTHENTICATOR_KEY {
    const EMAIL: string;
    const PASSWORD: string;
    const PHONE: string;
    const WEBAUTHN: string;
    const SECURITY_QUESTION: string;
    const OV: string;
    const GOOGLE_OTP: string;
    const ON_PREM: string;
    const RSA: string;
    const DUO: string;
    const IDP: string;
    const CUSTOM_OTP: string;
    const SYMANTEC_VIP: string;
    const YUBIKEY: string;
    const CUSTOM_APP: string;
}
export namespace AUTHENTICATOR_METHODS {
    const PUSH: string;
}
export const FORM_NAME_TO_OPERATION_MAP: {
    [x: string]: string;
};
export namespace HINTS {
    const CAPTCHA: string;
}
export const TERMINAL_FORMS: string[];
export namespace IDP_FORM_TYPE {
    const X509: string;
}
export namespace INTERSTITIAL_REDIRECT_VIEW {
    const DEFAULT: string;
    const NONE: string;
}
export namespace ATTR_FORMAT {
    const COUNTRY_CODE: string;
}
declare const ENROLLED_PASSWORD_RECOVERY_LINK: "currentAuthenticatorEnrollment-recover";
declare const ORG_PASSWORD_RECOVERY_LINK: "currentAuthenticator-recover";
export {};
//# sourceMappingURL=RemediationConstants.d.ts.map