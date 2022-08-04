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

import { AUTHENTICATOR_KEY } from '../../constants';
import CustomOTPIcon from '../../img/authCoinIcons/customOtp.svg';
import DUOIcon from '../../img/authCoinIcons/duo.svg';
import GoogleOTPIcon from '../../img/authCoinIcons/googleAuth.svg';
import IDPIcon from '../../img/authCoinIcons/idp.svg';
import OktaVerifyIcon from '../../img/authCoinIcons/oktaVerify.svg';
import OnPremMFAIcon from '../../img/authCoinIcons/onPremMfa.svg';
import PasswordIcon from '../../img/authCoinIcons/password.svg';
import PhoneCallIcon from '../../img/authCoinIcons/phoneCall.svg';
import RSAIcon from '../../img/authCoinIcons/rsa.svg';
import EmailIcon from '../../img/authCoinIcons/secondaryEmail.svg';
import SecurityQuestionIcon from '../../img/authCoinIcons/securityQuestion.svg';
import SymantecVipIcon from '../../img/authCoinIcons/symantec.svg';
import WebAuthNIcon from '../../img/authCoinIcons/webauthn.svg';
import YubikeyIcon from '../../img/authCoinIcons/yubikey.svg';

const AuthenticatorConfiguration: {
  [key: string]: {
    // Had to disable because we cant type SVG icons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    customizable: boolean;
    description: string;
    iconClassName: string;
  }
} = {
  [AUTHENTICATOR_KEY.CUSTOM_OTP]: {
    icon: CustomOTPIcon,
    customizable: true,
    description: 'Custom OTP',
    iconClassName: 'mfa-hotp',
  },
  [AUTHENTICATOR_KEY.CUSTOM_APP]: {
    icon: null, // TODO: figure out what icon to use here
    customizable: false,
    description: 'Custom Push App',
    iconClassName: 'mfa-custom-app-logo',
  },
  [AUTHENTICATOR_KEY.DUO]: {
    icon: DUOIcon,
    customizable: false,
    description: 'DUO',
    iconClassName: 'mfa-duo',
  },
  [AUTHENTICATOR_KEY.IDP]: {
    icon: IDPIcon,
    customizable: true,
    description: 'IDP',
    iconClassName: 'mfa-custom-factor',
  },
  [AUTHENTICATOR_KEY.GOOGLE_OTP]: {
    icon: GoogleOTPIcon,
    customizable: false,
    description: 'Google Authenticator',
    iconClassName: 'mfa-google-auth',
  },
  [AUTHENTICATOR_KEY.EMAIL]: {
    icon: EmailIcon,
    customizable: true,
    description: 'Email',
    iconClassName: 'mfa-okta-email',
  },
  [AUTHENTICATOR_KEY.PASSWORD]: {
    icon: PasswordIcon,
    customizable: true,
    description: 'Password',
    iconClassName: 'mfa-okta-password',
  },
  [AUTHENTICATOR_KEY.OV]: {
    icon: OktaVerifyIcon,
    customizable: false,
    description: 'Okta Verify',
    iconClassName: 'mfa-okta-verify',
  },
  [AUTHENTICATOR_KEY.ON_PREM]: {
    icon: OnPremMFAIcon,
    customizable: true,
    description: 'On Prem MFA',
    iconClassName: 'mfa-onprem',
  },
  [AUTHENTICATOR_KEY.PHONE]: {
    icon: PhoneCallIcon,
    customizable: true,
    description: 'Phone Call',
    iconClassName: 'mfa-okta-phone',
  },
  [AUTHENTICATOR_KEY.RSA]: {
    icon: RSAIcon,
    customizable: false,
    description: 'RSA',
    iconClassName: 'mfa-rsa',
  },
  [AUTHENTICATOR_KEY.SECURITY_QUESTION]: {
    icon: SecurityQuestionIcon,
    customizable: true,
    description: 'Security Question',
    iconClassName: 'mfa-okta-security-question',
  },
  [AUTHENTICATOR_KEY.SYMANTEC_VIP]: {
    icon: SymantecVipIcon,
    customizable: false,
    description: 'Symantec VIP',
    iconClassName: 'mfa-symantec',
  },
  [AUTHENTICATOR_KEY.WEBAUTHN]: {
    icon: WebAuthNIcon,
    customizable: true,
    description: 'WebAuthN',
    iconClassName: 'mfa-webauthn',
  },
  [AUTHENTICATOR_KEY.YUBIKEY]: {
    icon: YubikeyIcon,
    customizable: false,
    description: 'YubiKey Token',
    iconClassName: 'mfa-yubikey',
  },
};

export default AuthenticatorConfiguration;
