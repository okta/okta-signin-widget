/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IdxStepTransformer } from 'src/types';
import { isDevelopmentEnvironment, isTestEnvironment } from 'src/util';

import { AUTHENTICATOR_KEY, CHALLENGE_METHOD, IDX_STEP } from '../../constants';
import { transformIdentify } from '../identify';
import {
  transformAppleSsoExtension,
  transformOktaVerifyChannelSelection,
  transformOktaVerifyCustomAppChallengePoll,
  transformOktaVerifyCustomAppResendPush,
  transformOktaVerifyEnrollChannel,
  transformOktaVerifyEnrollPoll,
  transformTOTPChallenge,
} from '../oktaVerify';
import {
  transformEnrollPasswordAuthenticator,
  transformExpiredCustomPassword,
  transformExpiredCustomPasswordWarning,
  transformExpiredPasswordAuthenticator,
  transformExpiredPasswordWarningAuthenticator,
  transformPasswordChallenge,
  transformResetPasswordAuthenticator,
} from '../password';
import {
  transformPhoneChallenge,
  transformPhoneCodeEnrollment,
  transformPhoneEnrollment,
  transformPhoneVerification,
} from '../phone';
import { transformEnrollProfile } from '../profile';
import { transformEnrollProfileUpdate } from '../profile/transformEnrollProfileUpdate';
import { transformAutoRedirect } from '../redirect';
import {
  transformSelectAuthenticatorEnroll,
  transformSelectAuthenticatorUnlockVerify,
  transformSelectAuthenticatorVerify,
  transformSelectOVCustomAppMethodVerify,
} from '../selectAuthenticator';
import { transformWebAuthNAuthenticator } from '../webauthn';
import { transformYubikeyOtpAuthenticator } from '../yubikey';
import { transformAdminConsent, transformEnduserConsent, transformGranularConsent } from './consent';
import { transformEnumerateComponents } from './development';
import { transformDeviceCodeAuthenticator } from './device';
import { transformDuoAuthenticator } from './duo';
import {
  transformEmailAuthenticatorEnroll,
  transformEmailAuthenticatorVerify,
  transformEmailChallengeConsent,
  transformEmailVerification,
} from './email';
import {
  transformGoogleAuthenticatorEnroll,
  transformGoogleAuthenticatorVerify,
} from './googleAuthenticator';
import {
  transformIdpAuthenticator,
  transformIdpRedirect,
} from './idp';
import { transformKeepMeSignedIn } from './keepMeSignedIn';
import {
  transformOktaVerifyDeviceChallengePoll,
  transformOktaVerifyFPLaunchAuthenticator,
  transformOktaVerifyFPLoopbackPoll,
} from './oktaVerify';
import { transformCustomOtpAuthenticator } from './otp';
import { transformPIVAuthenticator } from './piv';
import {
  transformIdentityRecovery,
  transformRequestActivation,
} from './recovery';
import { transformRSAAuthenticator } from './rsa';
import { transformSafeModePoll } from './safeMode';
import {
  transformSecurityQuestionEnroll,
  transformSecurityQuestionVerify,
} from './securityQuestion';
import { transformSymantecVipAuthenticator } from './symantecVip';

/**
 * TransformerMap
 *
 * This Map defines the correlation between IDX's NextStep name,
 * IdxAuthenticator's key and corresponding transformer function.
 * The transformer function is used to create Custom elements (JsonForms)
 * to be displayed on the primary form.
 *
 * First key: Idx NextStep's {@link NextStep} name
 * Second key: Idx Authenticator's {@link IdxAuthenticator} key
 * Second key's value: Function {@link IdxStepTransformer} transformer
 */
const TransformerMap: {
  [key: string]: {
    [key: string]: {
      transform: IdxStepTransformer,
      buttonConfig?: {
        showDefaultSubmit?: boolean,
        showDefaultCancel?: boolean,
        showForgotPassword?: boolean,
        showVerifyWithOtherLink?: boolean,
        showReturnToAuthListLink?: boolean,
      },
    }
  }
} = {
  [IDX_STEP.AUTHENTICATOR_ENROLLMENT_DATA]: {
    [AUTHENTICATOR_KEY.EMAIL]: {
      transform: transformEmailVerification,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.PHONE]: {
      transform: transformPhoneEnrollment,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.AUTHENTICATOR_VERIFICATION_DATA]: {
    [AUTHENTICATOR_KEY.CUSTOM_APP]: {
      transform: transformSelectOVCustomAppMethodVerify,
      buttonConfig: {
        showDefaultSubmit: false,
        showVerifyWithOtherLink: false,
      },
    },
    [AUTHENTICATOR_KEY.EMAIL]: {
      transform: transformEmailVerification,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.OV]: {
      transform: transformSelectOVCustomAppMethodVerify,
      buttonConfig: {
        showDefaultSubmit: false,
        showVerifyWithOtherLink: false,
      },
    },
    [AUTHENTICATOR_KEY.PHONE]: {
      transform: transformPhoneVerification,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.CANCEL_TRANSACTION]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformAppleSsoExtension,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.CONSENT_ADMIN]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformAdminConsent,
      buttonConfig: { showDefaultSubmit: false, showDefaultCancel: false },
    },
  },
  [IDX_STEP.CONSENT_ENDUSER]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformEnduserConsent,
      buttonConfig: { showDefaultSubmit: false, showDefaultCancel: false },
    },
  },
  [IDX_STEP.CONSENT_GRANULAR]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformGranularConsent,
      buttonConfig: { showDefaultSubmit: false, showDefaultCancel: false },
    },
  },
  [IDX_STEP.CHALLENGE_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.CUSTOM_OTP]: {
      transform: transformCustomOtpAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.DUO]: {
      transform: transformDuoAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.EMAIL]: {
      transform: transformEmailAuthenticatorVerify,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.GOOGLE_OTP]: {
      transform: transformGoogleAuthenticatorVerify,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.IDP]: {
      transform: transformIdpAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.PASSWORD]: {
      transform: transformPasswordChallenge,
      buttonConfig: { showDefaultSubmit: false, showForgotPassword: true },
    },
    [AUTHENTICATOR_KEY.ON_PREM]: {
      transform: transformRSAAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.OV]: {
      transform: transformTOTPChallenge,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
    [AUTHENTICATOR_KEY.PHONE]: {
      transform: transformPhoneChallenge,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.RSA]: {
      transform: transformRSAAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.SECURITY_QUESTION]: {
      transform: transformSecurityQuestionVerify,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.SYMANTEC_VIP]: {
      transform: transformSymantecVipAuthenticator,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
    [AUTHENTICATOR_KEY.WEBAUTHN]: {
      transform: transformWebAuthNAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.YUBIKEY]: {
      transform: transformYubikeyOtpAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.CHALLENGE_POLL]: {
    [AUTHENTICATOR_KEY.OV]: {
      transform: transformOktaVerifyCustomAppChallengePoll,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
        showVerifyWithOtherLink: false,
      },
    },
    [AUTHENTICATOR_KEY.CUSTOM_APP]: {
      transform: transformOktaVerifyCustomAppChallengePoll,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
        showVerifyWithOtherLink: false,
      },
    },
  },
  [IDX_STEP.DEVICE_APPLE_SSO_EXTENSION]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformAppleSsoExtension,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.OV]: {
      transform: transformAppleSsoExtension,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.DEVICE_CHALLENGE_POLL]: {
    [CHALLENGE_METHOD.APP_LINK]: {
      transform: transformOktaVerifyDeviceChallengePoll,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
      },
    },
    [CHALLENGE_METHOD.CHROME_DTC]: {
      transform: transformOktaVerifyDeviceChallengePoll,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
      },
    },
    [CHALLENGE_METHOD.CUSTOM_URI]: {
      transform: transformOktaVerifyDeviceChallengePoll,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
      },
    },
    [CHALLENGE_METHOD.LOOPBACK]: {
      transform: transformOktaVerifyFPLoopbackPoll,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
      },
    },
    [CHALLENGE_METHOD.UNIVERSAL_LINK]: {
      transform: transformOktaVerifyDeviceChallengePoll,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
      },
    },
  },
  [IDX_STEP.CONSENT_EMAIL_CHALLENGE]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformEmailChallengeConsent,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
      },
    },
  },
  [IDX_STEP.ENROLL_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.DUO]: {
      transform: transformDuoAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.EMAIL]: {
      transform: transformEmailAuthenticatorEnroll,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.GOOGLE_OTP]: {
      transform: transformGoogleAuthenticatorEnroll,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.IDP]: {
      transform: transformIdpAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.ON_PREM]: {
      transform: transformRSAAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.PASSWORD]: {
      transform: transformEnrollPasswordAuthenticator,
    },
    [AUTHENTICATOR_KEY.PHONE]: {
      transform: transformPhoneCodeEnrollment,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.RSA]: {
      transform: transformRSAAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.SECURITY_QUESTION]: {
      transform: transformSecurityQuestionEnroll,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.SYMANTEC_VIP]: {
      transform: transformSymantecVipAuthenticator,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
    [AUTHENTICATOR_KEY.WEBAUTHN]: {
      transform: transformWebAuthNAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.YUBIKEY]: {
      transform: transformYubikeyOtpAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.ENROLLMENT_CHANNEL_DATA]: {
    [AUTHENTICATOR_KEY.OV]: {
      transform: transformOktaVerifyEnrollChannel,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.ENROLL_POLL]: {
    [AUTHENTICATOR_KEY.OV]: {
      transform: transformOktaVerifyEnrollPoll,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.ENROLL_PROFILE]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformEnrollProfile,
      buttonConfig: { showDefaultSubmit: false, showDefaultCancel: false },
    },
  },
  [IDX_STEP.ENROLL_PROFILE_UPDATE]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformEnrollProfileUpdate,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.FAILURE_REDIRECT]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformAutoRedirect,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
      },
    },
  },
  [IDX_STEP.IDENTIFY]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformIdentify,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
        showForgotPassword: true,
      },
    },
    [AUTHENTICATOR_KEY.PASSWORD]: {
      transform: transformIdentify,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
        showForgotPassword: true,
      },
    },
  },
  [IDX_STEP.IDENTIFY_RECOVERY]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformIdentityRecovery,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
  },
  [IDX_STEP.KEEP_ME_SIGNED_IN]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformKeepMeSignedIn,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
        showReturnToAuthListLink: false,
      },
    },
  },
  [IDX_STEP.LAUNCH_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformOktaVerifyFPLaunchAuthenticator,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
      },
    },
  },
  [IDX_STEP.PIV_IDP]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformPIVAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.SMART_CARD_IDP]: {
      transform: transformPIVAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.REDIRECT_IDP]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformIdpRedirect,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.REENROLL_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.PASSWORD]: {
      transform: transformExpiredPasswordAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.REENROLL_AUTHENTICATOR_WARNING]: {
    [AUTHENTICATOR_KEY.PASSWORD]: {
      transform: transformExpiredPasswordWarningAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.REENROLL_CUSTOM_PASSWORD_EXPIRY]: {
    [AUTHENTICATOR_KEY.PASSWORD]: {
      transform: transformExpiredCustomPassword,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.REENROLL_CUSTOM_PASSWORD_EXPIRY_WARNING]: {
    [AUTHENTICATOR_KEY.PASSWORD]: {
      transform: transformExpiredCustomPasswordWarning,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.REQUEST_ACTIVATION]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformRequestActivation,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
        showForgotPassword: false,
      },
    },
  },
  [IDX_STEP.RESEND]: {
    [AUTHENTICATOR_KEY.OV]: {
      transform: transformOktaVerifyCustomAppResendPush,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.CUSTOM_APP]: {
      transform: transformOktaVerifyCustomAppResendPush,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.RESET_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.PASSWORD]: {
      transform: transformResetPasswordAuthenticator,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.GOOGLE_OTP]: {
      transform: transformGoogleAuthenticatorEnroll,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformSelectAuthenticatorVerify,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.SELECT_AUTHENTICATOR_ENROLL]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformSelectAuthenticatorEnroll,
      buttonConfig: { showDefaultSubmit: false },
    },
    [AUTHENTICATOR_KEY.OV]: {
      transform: transformOktaVerifyEnrollPoll,
    },
  },
  [IDX_STEP.SELECT_AUTHENTICATOR_UNLOCK]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformSelectAuthenticatorUnlockVerify,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.SELECT_ENROLLMENT_CHANNEL]: {
    [AUTHENTICATOR_KEY.OV]: {
      transform: transformOktaVerifyChannelSelection,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.SUCCESS_REDIRECT]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformAutoRedirect,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
      },
    },
  },
  [IDX_STEP.POLL]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformSafeModePoll,
      buttonConfig: { showDefaultSubmit: false },
    },
  },
  [IDX_STEP.USER_CODE]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformDeviceCodeAuthenticator,
    },
  },
};

if (isDevelopmentEnvironment() || isTestEnvironment()) {
  // Don't add developer transforms in production bundle
  TransformerMap.DEVELOPMENT = {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformEnumerateComponents,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
        showForgotPassword: false,
        showVerifyWithOtherLink: false,
        showReturnToAuthListLink: false,
      },
    },
  };
}

export default TransformerMap;
