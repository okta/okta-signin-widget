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

import { FunctionComponent } from 'preact';
import { IconProps } from 'src/types';

import { AUTHENTICATOR_KEY } from '../../constants';
import { loc } from '../../util';
import {
  CustomAppIcon,
  CustomOTPIcon,
  DuoIcon,
  EmailIcon,
  GoogleOTPIcon,
  IDPIcon,
  OktaVerifyIcon,
  OnPremMFAIcon,
  PasswordIcon,
  PhoneIcon,
  RSAIcon,
  SecurityKeyOrBiometricsIcon,
  SecurityQuestionIcon,
  SymantecIcon,
  YubiKeyIcon,
} from '../Icon';

const AuthenticatorConfiguration: {
  [key: string]: {
    icon: FunctionComponent<IconProps>;
    name: string;
    customizable: boolean;
    description: string;
    iconClassName: string;
  }
} = {
  [AUTHENTICATOR_KEY.CUSTOM_OTP]: {
    icon: CustomOTPIcon,
    customizable: true,
    name: 'customOtpAuthenticator',
    description: loc('factor.hotp.description', 'login'),
    iconClassName: 'mfa-hotp',
  },
  [AUTHENTICATOR_KEY.CUSTOM_APP]: {
    icon: CustomAppIcon,
    name: 'customAppAuthenticator',
    customizable: true,
    description: loc('factor.customFactor.description.generic', 'login'),
    iconClassName: 'mfa-custom-app-logo',
  },
  [AUTHENTICATOR_KEY.DUO]: {
    icon: DuoIcon,
    name: 'duoAuthenticator',
    customizable: false,
    description: loc('factor.duo', 'login'),
    iconClassName: 'mfa-duo',
  },
  [AUTHENTICATOR_KEY.IDP]: {
    icon: IDPIcon,
    name: 'idpAuthenticator',
    customizable: true,
    description: loc('factor.customFactor.description.generic', 'login'),
    iconClassName: 'mfa-custom-factor',
  },
  [AUTHENTICATOR_KEY.GOOGLE_OTP]: {
    icon: GoogleOTPIcon,
    name: 'googleOtpAuthenticator',
    customizable: false,
    description: loc('factor.totpSoft.googleAuthenticator', 'login'),
    iconClassName: 'mfa-google-auth',
  },
  [AUTHENTICATOR_KEY.EMAIL]: {
    icon: EmailIcon,
    name: 'emailAuthenticator',
    customizable: true,
    description: loc('factor.email', 'login'),
    iconClassName: 'mfa-okta-email',
  },
  [AUTHENTICATOR_KEY.PASSWORD]: {
    icon: PasswordIcon,
    name: 'passwordAuthenticator',
    customizable: true,
    description: loc('factor.password', 'login'),
    iconClassName: 'mfa-okta-password',
  },
  [AUTHENTICATOR_KEY.OV]: {
    icon: OktaVerifyIcon,
    name: 'oktaVerifyAuthenticator',
    customizable: false,
    description: loc('factor.totpSoft.oktaVerify', 'login'),
    iconClassName: 'mfa-okta-verify',
  },
  [AUTHENTICATOR_KEY.ON_PREM]: {
    icon: OnPremMFAIcon,
    name: 'onPremAuthenticator',
    customizable: true,
    description: loc('factor.totpHard.description', 'login'),
    iconClassName: 'mfa-onprem',
  },
  [AUTHENTICATOR_KEY.PHONE]: {
    icon: PhoneIcon,
    name: 'phoneAuthenticator',
    customizable: true,
    description: loc('factor.call', 'login'),
    iconClassName: 'mfa-okta-phone',
  },
  [AUTHENTICATOR_KEY.RSA]: {
    icon: RSAIcon,
    name: 'rsaAuthenticator',
    customizable: false,
    description: loc('factor.totpHard.rsaSecurId', 'login'),
    iconClassName: 'mfa-rsa',
  },
  [AUTHENTICATOR_KEY.SECURITY_QUESTION]: {
    icon: SecurityQuestionIcon,
    name: 'securityQuestionAuthenticator',
    customizable: true,
    description: loc('factor.securityQuestion', 'login'),
    iconClassName: 'mfa-okta-security-question',
  },
  [AUTHENTICATOR_KEY.SYMANTEC_VIP]: {
    icon: SymantecIcon,
    name: 'symantecVipAuthenticator',
    customizable: false,
    description: loc('factor.totpHard.symantecVip', 'login'),
    iconClassName: 'mfa-symantec',
  },
  [AUTHENTICATOR_KEY.WEBAUTHN]: {
    icon: SecurityKeyOrBiometricsIcon,
    name: 'webauthnAuthenticator',
    customizable: true,
    description: loc('factor.webauthn.biometric', 'login'),
    iconClassName: 'mfa-webauthn',
  },
  [AUTHENTICATOR_KEY.YUBIKEY]: {
    icon: YubiKeyIcon,
    name: 'yubikeyAuthenticator',
    customizable: false,
    description: loc('factor.totpHard.yubikey', 'login'),
    iconClassName: 'mfa-yubikey',
  },
};

export default AuthenticatorConfiguration;
