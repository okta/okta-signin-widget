import Logger from 'util/Logger';
import { AUTHENTICATOR_KEY, FORMS as RemediationForms } from '../ion/RemediationConstants';
import { BaseView } from './internals';

// Identify
import IdentifierView from './views/IdentifierView';
import RedirectIdPView from './views/RedirectIdPView';
import RedirectIdvView from './views/idp/RedirectIdvView';

import IdentifyRecoveryView from './views/IdentifyRecoveryView';

// Terminal & Auto-Redirect
import TerminalView from './views/TerminalView';
import AutoRedirectView from './views/AutoRedirectView';

// safe mode poll view
import PollView from './views/PollView';

// consent
import AdminConsentView from './views/consent/AdminConsentView';
import EnduserConsentView from './views/consent/EnduserConsentView';
import GranularConsentView from './views/consent/GranularConsentView';
import EnduserEmailConsentView from './views/consent/EnduserEmailConsentView';

// Device (Okta Verify)
import DeviceChallengePollView from './views/device/DeviceChallengePollView';
import SSOExtensionView from './views/device/SSOExtensionView';
import SignInDeviceView from './views/device/SignInDeviceView';
import DeviceEnrollmentTerminalView from './views/device/DeviceEnrollmentTerminalView';

// registration
import EnrollProfileView from './views/EnrollProfileView';

// registration update
import EnrollProfileUpdateView from './views/EnrollProfileUpdateView';

// Email Activation
import RequestActivationEmail from './views/activation/RequestActivationEmailView';

// authenticator list
import SelectAuthenticatorEnrollView from './views/SelectAuthenticatorEnrollView';
import SelectAuthenticatorVerifyView from './views/SelectAuthenticatorVerifyView';
import SelectAuthenticatorUnlockAccountView from './views/authenticator/SelectAuthenticatorUnlockAccountView';

// password
import EnrollAuthenticatorPasswordView from './views/password/EnrollAuthenticatorPasswordView';
import ChallengeAuthenticatorPasswordView from './views/password/ChallengeAuthenticatorPasswordView';
import ReEnrollAuthenticatorPasswordView from './views/password/ReEnrollAuthenticatorPasswordView';
import ReEnrollAuthenticatorWarningPasswordView from './views/password/ReEnrollAuthenticatorWarningPasswordView';
import ResetAuthenticatorPasswordView from './views/password/ResetAuthenticatorPasswordView';

// phone
import EnrollAuthenticatorPhoneView from './views/phone/EnrollAuthenticatorPhoneView';
import EnrollAuthenticatorDataPhoneView from './views/phone/EnrollAuthenticatorDataPhoneView';
import ChallengeAuthenticatorPhoneView from './views/phone/ChallengeAuthenticatorPhoneView';
import ChallengeAuthenticatorDataPhoneView from './views/phone/ChallengeAuthenticatorDataPhoneView';

// security question
import EnrollAuthenticatorSecurityQuestion from './views/security-question/EnrollAuthenticatorSecurityQuestionView';
import ChallengeAuthenticatorSecurityQuestion from './views/security-question/ChallengeAuthenticatorSecurityQuestion';

//webauthn
import EnrollWebauthnView from './views/webauthn/EnrollWebauthnView';
import ChallengeWebauthnView from './views/webauthn/ChallengeWebauthnView';

// email
import EnrollAuthenticatorEmailView from './views/email/EnrollAuthenticatorEmailView';
import ChallengeAuthenticatorEmailView from './views/email/ChallengeAuthenticatorEmailView';
import ChallengeAuthenticatorDataEmailView from './views/email/ChallengeAuthenticatorDataEmailView';

// app (okta verify)
import EnrollPollOktaVerifyView from './views/ov/EnrollPollOktaVerifyView';
import SelectEnrollmentChannelOktaVerifyView from './views/ov/SelectEnrollmentChannelOktaVerifyView';
import EnrollementChannelDataOktaVerifyView from './views/ov/EnrollementChannelDataOktaVerifyView';
import ChallengeOktaVerifyView from './views/ov/ChallengeOktaVerifyView';
import ChallengeOktaVerifyTotpView from './views/ov/ChallengeOktaVerifyTotpView';
import ChallengeOktaVerifyResendPushView from './views/ov/ChallengeOktaVerifyResendPushView';
import ChallengeOktaVerifyCustomAppDataView from './views/shared/ChallengeOktaVerifyCustomAppDataView';
import ChallengeOktaVerifySSOExtensionView from './views/ov/ChallengeOktaVerifySSOExtensionView';

// app (google authenticator)
import EnrollAuthenticatorGoogleAuthenticatorView from './views/google-authenticator/EnrollAuthenticatorGoogleAuthenticatorView';
import ChallengeGoogleAuthenticatorView from './views/google-authenticator/ChallengeGoogleAuthenticatorView';

// on-prem mfa
import EnrollAuthenticatorOnPremView from './views/on-prem/EnrollAuthenticatorOnPremView';
import ChallengeAuthenticatorOnPremView from './views/on-prem/ChallengeAuthenticatorOnPremView';

// duo mfa
import EnrollDuoAuthenticatorView from './views/duo/EnrollDuoAuthenticatorView';
import ChallengeDuoAuthenticatorView from './views/duo/ChallengeDuoAuthenticatorView';

// idp authenticator
import AuthenticatorIdPVerifyView from './views/idp/AuthenticatorIdPVerifyView';
import AuthenticatorIdPEnrollView from './views/idp/AuthenticatorIdPEnrollView';

// custom otp
import ChallengeCustomOTPAuthenticatorView from './views/custom-otp/ChallengeCustomOTPAuthenticatorView';

// Symantec VIP authenticator
import AuthenticatorSymantecView from './views/symantec/AuthenticatorSymantecView';

// Device code activate view
import DeviceCodeActivateView from './views/device/DeviceCodeActivateView';

// X509 PIV view
import ChallengePIVView from './views/piv/ChallengePIVView';

// YubiKey
import AuthenticatorYubiKeyView from './views/yubikey/AuthenticatorYubiKeyView';

// custom app
import ChallengePushView from './views/shared/ChallengePushView';
import ChallengeCustomAppResendPushView from './views/custom-app/ChallengeCustomAppResendPushView';

// custom password
import ReEnrollCustomPasswordExpiryView from './views/custom-password/ReEnrollCustomPasswordExpiryView';
import ReEnrollCustomPasswordExpiryWarningView from './views/custom-password/ReEnrollCustomPasswordExpiryWarningView';

// keep me signed in
import PostAuthKeepMeSignedInView from './views/keep-me-signed-in/PostAuthKeepMeSignedInView';

// unlock account
import UnlockAccountView from './views/authenticator/UnlockAccountView'

// device assurance grace period
import DeviceAssuranceGracePeriodView from './views/device-assurance-grace-period/DeviceAssuranceGracePeriodView'

const DEFAULT = '_';

const VIEWS_MAPPING = {
  [RemediationForms.IDENTIFY]: {
    [DEFAULT]: IdentifierView,
  },
  [RemediationForms.IDENTIFY_RECOVERY]: {
    [DEFAULT]: IdentifyRecoveryView,
  },
  [RemediationForms.DEVICE_CHALLENGE_POLL]: {
    [DEFAULT]: DeviceChallengePollView,
  },
  [RemediationForms.LAUNCH_AUTHENTICATOR]: {
    [DEFAULT]: SignInDeviceView,
  },
  [RemediationForms.DEVICE_APPLE_SSO_EXTENSION]: {
    [DEFAULT]: SSOExtensionView,
    [AUTHENTICATOR_KEY.OV]: ChallengeOktaVerifySSOExtensionView,
  },
  [RemediationForms.CANCEL_TRANSACTION]: {
    [DEFAULT]: SSOExtensionView,
  },
  [RemediationForms.ENROLL_PROFILE]: {
    [DEFAULT]: EnrollProfileView,
  },
  [RemediationForms.ENROLL_PROFILE_UPDATE]: {
    [DEFAULT]: EnrollProfileUpdateView,
  },
  [RemediationForms.POLL]: {
    [DEFAULT]: PollView
  },
  [RemediationForms.REQUEST_ACTIVATION]: {
    [DEFAULT]: RequestActivationEmail
  },
  [RemediationForms.SELECT_AUTHENTICATOR_ENROLL]: {
    [DEFAULT]: SelectAuthenticatorEnrollView,
  },
  [RemediationForms.AUTHENTICATOR_ENROLLMENT_DATA]: {
    [AUTHENTICATOR_KEY.PHONE]: EnrollAuthenticatorDataPhoneView,
    [AUTHENTICATOR_KEY.EMAIL]: ChallengeAuthenticatorDataEmailView,
  },
  [RemediationForms.CONSENT_ADMIN]: {
    [DEFAULT]: AdminConsentView
  },
  [RemediationForms.CONSENT_ENDUSER]: {
    [DEFAULT]: EnduserConsentView
  },
  [RemediationForms.CONSENT_GRANULAR]: {
    [DEFAULT]: GranularConsentView
  },
  [RemediationForms.CONSENT_EMAIL_CHALLENGE]: {
    [DEFAULT]: EnduserEmailConsentView,
  },
  [RemediationForms.ENROLL_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.DUO]: EnrollDuoAuthenticatorView,
    [AUTHENTICATOR_KEY.EMAIL]: EnrollAuthenticatorEmailView,
    [AUTHENTICATOR_KEY.GOOGLE_OTP]: EnrollAuthenticatorGoogleAuthenticatorView,
    [AUTHENTICATOR_KEY.IDP]: AuthenticatorIdPEnrollView,
    [AUTHENTICATOR_KEY.ON_PREM]: EnrollAuthenticatorOnPremView,
    [AUTHENTICATOR_KEY.PASSWORD]: EnrollAuthenticatorPasswordView,
    [AUTHENTICATOR_KEY.PHONE]: EnrollAuthenticatorPhoneView,
    [AUTHENTICATOR_KEY.RSA]: EnrollAuthenticatorOnPremView,
    [AUTHENTICATOR_KEY.SECURITY_QUESTION]: EnrollAuthenticatorSecurityQuestion,
    [AUTHENTICATOR_KEY.SYMANTEC_VIP]: AuthenticatorSymantecView,
    [AUTHENTICATOR_KEY.WEBAUTHN]: EnrollWebauthnView,
    [AUTHENTICATOR_KEY.YUBIKEY]: AuthenticatorYubiKeyView,
  },
  [RemediationForms.CHALLENGE_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.CUSTOM_OTP]: ChallengeCustomOTPAuthenticatorView,
    [AUTHENTICATOR_KEY.DUO]: ChallengeDuoAuthenticatorView,
    [AUTHENTICATOR_KEY.EMAIL]: ChallengeAuthenticatorEmailView,
    [AUTHENTICATOR_KEY.GOOGLE_OTP]: ChallengeGoogleAuthenticatorView,
    [AUTHENTICATOR_KEY.IDP]: AuthenticatorIdPVerifyView,
    [AUTHENTICATOR_KEY.ON_PREM]: ChallengeAuthenticatorOnPremView,
    [AUTHENTICATOR_KEY.OV]: ChallengeOktaVerifyTotpView,
    [AUTHENTICATOR_KEY.PASSWORD]: ChallengeAuthenticatorPasswordView,
    [AUTHENTICATOR_KEY.PHONE]: ChallengeAuthenticatorPhoneView,
    [AUTHENTICATOR_KEY.RSA]: ChallengeAuthenticatorOnPremView,
    [AUTHENTICATOR_KEY.SECURITY_QUESTION]: ChallengeAuthenticatorSecurityQuestion,
    [AUTHENTICATOR_KEY.SYMANTEC_VIP]: AuthenticatorSymantecView,
    [AUTHENTICATOR_KEY.WEBAUTHN]: ChallengeWebauthnView,
    [AUTHENTICATOR_KEY.YUBIKEY]: AuthenticatorYubiKeyView,
  },
  [RemediationForms.ENROLL_POLL]: {
    [AUTHENTICATOR_KEY.OV]: EnrollPollOktaVerifyView,
  },
  [RemediationForms.SELECT_ENROLLMENT_CHANNEL]: {
    [AUTHENTICATOR_KEY.OV]: SelectEnrollmentChannelOktaVerifyView,
  },
  [RemediationForms.ENROLLMENT_CHANNEL_DATA]: {
    [AUTHENTICATOR_KEY.OV]: EnrollementChannelDataOktaVerifyView,
  },
  // Expired scenarios for authenticators..
  [RemediationForms.REENROLL_AUTHENTICATOR]: {
    // Password expired scenario..
    [AUTHENTICATOR_KEY.PASSWORD]: ReEnrollAuthenticatorPasswordView
  },
  [RemediationForms.REENROLL_CUSTOM_PASSWORD_EXPIRY]: {
    // Custom password expired scenario
    [AUTHENTICATOR_KEY.PASSWORD]: ReEnrollCustomPasswordExpiryView,
  },
  [RemediationForms.REENROLL_CUSTOM_PASSWORD_EXPIRY_WARNING]: {
    // Custom password expiry warning scenario
    [AUTHENTICATOR_KEY.PASSWORD]: ReEnrollCustomPasswordExpiryWarningView,
  },
  // Will expire soon warnings for authenticators..
  [RemediationForms.REENROLL_AUTHENTICATOR_WARNING]: {
    // Password will expire soon scenario..
    [AUTHENTICATOR_KEY.PASSWORD]: ReEnrollAuthenticatorWarningPasswordView,
  },
  // Reset forms for authenticators..
  [RemediationForms.RESET_AUTHENTICATOR]: {
    // Admin driven password reset..
    [AUTHENTICATOR_KEY.PASSWORD]: ResetAuthenticatorPasswordView,
    [AUTHENTICATOR_KEY.GOOGLE_OTP]: EnrollAuthenticatorGoogleAuthenticatorView,
  },
  [RemediationForms.SELECT_AUTHENTICATOR_AUTHENTICATE]: {
    [DEFAULT]: SelectAuthenticatorVerifyView,
  },
  [RemediationForms.SELECT_AUTHENTICATOR_UNLOCK]: {
    [DEFAULT]: SelectAuthenticatorUnlockAccountView,
  },
  [RemediationForms.UNLOCK_ACCOUNT]: {
    [DEFAULT]: UnlockAccountView,
  },
  [RemediationForms.CHALLENGE_POLL]: {
    [AUTHENTICATOR_KEY.OV]: ChallengeOktaVerifyView,
    [AUTHENTICATOR_KEY.CUSTOM_APP]: ChallengePushView,
  },
  [RemediationForms.RESEND]: {
    [AUTHENTICATOR_KEY.OV]: ChallengeOktaVerifyResendPushView,
    [AUTHENTICATOR_KEY.CUSTOM_APP]: ChallengeCustomAppResendPushView,
  },
  [RemediationForms.AUTHENTICATOR_VERIFICATION_DATA]: {
    [AUTHENTICATOR_KEY.PHONE]: ChallengeAuthenticatorDataPhoneView,
    [AUTHENTICATOR_KEY.OV]: ChallengeOktaVerifyCustomAppDataView,
    [AUTHENTICATOR_KEY.EMAIL]: ChallengeAuthenticatorDataEmailView,
    [AUTHENTICATOR_KEY.CUSTOM_APP]: ChallengeOktaVerifyCustomAppDataView,
  },
  [RemediationForms.FAILURE_REDIRECT]: {
    [DEFAULT]: AutoRedirectView,
  },
  [RemediationForms.SUCCESS_REDIRECT]: {
    [DEFAULT]: AutoRedirectView,
  },
  [RemediationForms.REDIRECT_IDP]: {
    [DEFAULT]: RedirectIdPView,
  },
  [RemediationForms.REDIRECT_IDVERIFY]: {
    [DEFAULT]: RedirectIdvView,
  },
  [RemediationForms.PIV_IDP]: {
    [DEFAULT]: ChallengePIVView,
  },
  [RemediationForms.DEVICE_ENROLLMENT_TERMINAL]: {
    [DEFAULT]: DeviceEnrollmentTerminalView,
  },
  [RemediationForms.USER_CODE] : {
    [DEFAULT] : DeviceCodeActivateView
  },
  [RemediationForms.KEEP_ME_SIGNED_IN]: {
    [DEFAULT]: PostAuthKeepMeSignedInView,
  },
  [RemediationForms.TERMINAL]: {
    [DEFAULT]: TerminalView,
  },
  [RemediationForms.DEVICE_ASSURANCE_GRACE_PERIOD]: {
    [DEFAULT]: DeviceAssuranceGracePeriodView,
  },
};

export default {
  create(formName, authenticatorKey = DEFAULT) {
    const config = VIEWS_MAPPING[formName];
    if (!config) {
      Logger.warn(`Cannot find customized View for ${formName}.`);
      return BaseView;
    }
    const View = config[authenticatorKey] || config[DEFAULT];
    if (!View) {
      Logger.warn(`Cannot find customized View for ${formName} + ${authenticatorKey}.`);
      return BaseView;
    }

    return View;
  }
};
