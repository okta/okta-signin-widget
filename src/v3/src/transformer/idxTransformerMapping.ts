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

import { AUTHENTICATOR_KEY, IDX_STEP } from '../constants';
import {
  transformEmailChallenge,
  transformEmailChallengeConsent,
  transformEmailVerification,
} from './email';
import {
  transformGoogleAuthenticatorEnroll,
  transformGoogleAuthenticatorVerify,
} from './googleAuthenticator';
import {
  transformOktaVerifyEnrollChannel,
  transformOktaVerifyEnrollPoll,
} from './oktaVerify';
import { transformPasswordAuthenticator } from './password';
import {
  transformPhoneChallenge,
  transformPhoneCodeEnrollment,
  transformPhoneEnrollment,
  transformPhoneVerification,
} from './phone';
import { transformIdentityRecovery } from './recovery';
import {
  transformSecurityQuestionEnroll,
  transformSecurityQuestionVerify,
} from './securityQuestion';
import {
  transformSelectAuthenticatorEnroll,
  transformSelectAuthenticatorUnlockVerify,
  transformSelectAuthenticatorVerify,
} from './selectAuthenticator';
import { transformWebAuthNAuthenticator } from './webauthn';

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
      },
    }
  }
} = {
  [IDX_STEP.AUTHENTICATOR_ENROLLMENT_DATA]: {
    [AUTHENTICATOR_KEY.PHONE]: {
      transform: transformPhoneEnrollment,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
  },
  [IDX_STEP.AUTHENTICATOR_VERIFICATION_DATA]: {
    [AUTHENTICATOR_KEY.EMAIL]: {
      transform: transformEmailVerification,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
    [AUTHENTICATOR_KEY.PHONE]: {
      transform: transformPhoneVerification,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
  },
  [IDX_STEP.CHALLENGE_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.EMAIL]: {
      transform: transformEmailChallenge,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
    [AUTHENTICATOR_KEY.GOOGLE_OTP]: {
      transform: transformGoogleAuthenticatorVerify,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
    [AUTHENTICATOR_KEY.PHONE]: {
      transform: transformPhoneChallenge,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
    [AUTHENTICATOR_KEY.SECURITY_QUESTION]: {
      transform: transformSecurityQuestionVerify,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
    [AUTHENTICATOR_KEY.WEBAUTHN]: {
      transform: transformWebAuthNAuthenticator,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
  },
  [IDX_STEP.EMAIL_CHALLENGE_CONSENT]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformEmailChallengeConsent,
      buttonConfig: {
        showDefaultSubmit: false,
        showDefaultCancel: false,
      },
    },
  },
  [IDX_STEP.ENROLL_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.PASSWORD]: {
      transform: transformPasswordAuthenticator,
    },
    [AUTHENTICATOR_KEY.PHONE]: {
      transform: transformPhoneCodeEnrollment,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
    [AUTHENTICATOR_KEY.WEBAUTHN]: {
      transform: transformWebAuthNAuthenticator,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
    [AUTHENTICATOR_KEY.SECURITY_QUESTION]: {
      transform: transformSecurityQuestionEnroll,
    },
    [AUTHENTICATOR_KEY.GOOGLE_OTP]: {
      transform: transformGoogleAuthenticatorEnroll,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
  },
  [IDX_STEP.ENROLLMENT_CHANNEL_DATA]: {
    [AUTHENTICATOR_KEY.OV]: {
      transform: transformOktaVerifyEnrollChannel,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
  },
  [IDX_STEP.IDENTIFY_RECOVERY]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformIdentityRecovery,
    },
  },
  [IDX_STEP.ENROLL_POLL]: {
    [AUTHENTICATOR_KEY.OV]: {
      transform: transformOktaVerifyEnrollPoll,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
  },
  [IDX_STEP.REENROLL_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.PASSWORD]: {
      transform: transformPasswordAuthenticator,
    },
  },
  [IDX_STEP.RESET_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.PASSWORD]: {
      transform: transformPasswordAuthenticator,
    },
  },
  [IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformSelectAuthenticatorVerify,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
  },
  [IDX_STEP.SELECT_AUTHENTICATOR_ENROLL]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformSelectAuthenticatorEnroll,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
    [AUTHENTICATOR_KEY.OV]: {
      transform: transformOktaVerifyEnrollPoll,
    },
  },
  [IDX_STEP.SELECT_AUTHENTICATOR_UNLOCK]: {
    [AUTHENTICATOR_KEY.DEFAULT]: {
      transform: transformSelectAuthenticatorUnlockVerify,
      buttonConfig: {
        showDefaultSubmit: false,
      },
    },
  },
};

export default TransformerMap;
