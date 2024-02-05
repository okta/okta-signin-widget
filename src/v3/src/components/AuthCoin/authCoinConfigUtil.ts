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

import { AUTHENTICATOR_KEY, CHALLENGE_METHOD, IDX_STEP } from '../../constants';
import { IconProps } from '../../types';
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
  SmartCardIcon,
  SymantecIcon,
  YubiKeyIcon,
} from '../Icon';

type AuthCoinConfig = {
  icon: FunctionComponent<IconProps>;
  name: string;
  customizable: boolean;
  description: string;
  iconClassName: string;
};

export const getAuthCoinConfiguration = (): Record<string, AuthCoinConfig> => ({
  [AUTHENTICATOR_KEY.CUSTOM_OTP]: {
    icon: CustomOTPIcon,
    customizable: true,
    name: 'mfa-hotp',
    description: loc('factor.hotp.description', 'login'),
    iconClassName: 'mfa-hotp',
  },
  [AUTHENTICATOR_KEY.CUSTOM_APP]: {
    icon: CustomAppIcon,
    name: 'mfa-custom-app-logo',
    customizable: true,
    description: loc('factor.customFactor.description.generic', 'login'),
    iconClassName: 'mfa-custom-app-logo',
  },
  [AUTHENTICATOR_KEY.DUO]: {
    icon: DuoIcon,
    name: 'mfa-duo',
    customizable: false,
    description: loc('factor.duo', 'login'),
    iconClassName: 'mfa-duo',
  },
  [AUTHENTICATOR_KEY.EMAIL]: {
    icon: EmailIcon,
    name: 'mfa-okta-email',
    customizable: true,
    description: loc('factor.email', 'login'),
    iconClassName: 'mfa-okta-email',
  },
  [AUTHENTICATOR_KEY.GOOGLE_OTP]: {
    icon: GoogleOTPIcon,
    name: 'mfa-google-auth',
    customizable: false,
    description: loc('factor.totpSoft.googleAuthenticator', 'login'),
    iconClassName: 'mfa-google-auth',
  },
  [AUTHENTICATOR_KEY.IDP]: {
    icon: IDPIcon,
    name: 'mfa-custom-factor',
    customizable: true,
    description: loc('factor.customFactor.description.generic', 'login'),
    iconClassName: 'mfa-custom-factor',
  },
  [AUTHENTICATOR_KEY.ON_PREM]: {
    icon: OnPremMFAIcon,
    name: 'mfa-onprem',
    customizable: true,
    description: loc('factor.totpHard.description', 'login'),
    iconClassName: 'mfa-onprem',
  },
  [AUTHENTICATOR_KEY.OV]: {
    icon: OktaVerifyIcon,
    name: 'mfa-okta-verify',
    customizable: false,
    description: loc('factor.totpSoft.oktaVerify', 'login'),
    iconClassName: 'mfa-okta-verify',
  },
  [AUTHENTICATOR_KEY.PASSWORD]: {
    icon: PasswordIcon,
    name: 'mfa-okta-password',
    customizable: true,
    description: loc('factor.password', 'login'),
    iconClassName: 'mfa-okta-password',
  },
  [AUTHENTICATOR_KEY.PHONE]: {
    icon: PhoneIcon,
    name: 'mfa-okta-phone',
    customizable: true,
    description: loc('factor.call', 'login'),
    iconClassName: 'mfa-okta-phone',
  },
  [IDX_STEP.PIV_IDP]: {
    icon: SmartCardIcon,
    name: 'smart-card-icon',
    customizable: true,
    description: loc('piv.card', 'login'),
    iconClassName: 'smart-card-icon',
  },
  [AUTHENTICATOR_KEY.SMART_CARD_IDP]: {
    icon: SmartCardIcon,
    name: 'smart-card-icon',
    customizable: true,
    description: loc('piv.card', 'login'),
    iconClassName: 'smart-card-icon',
  },
  [AUTHENTICATOR_KEY.RSA]: {
    icon: RSAIcon,
    name: 'mfa-rsa',
    customizable: false,
    description: loc('factor.totpHard.rsaSecurId', 'login'),
    iconClassName: 'mfa-rsa',
  },
  [AUTHENTICATOR_KEY.SECURITY_QUESTION]: {
    icon: SecurityQuestionIcon,
    name: 'mfa-okta-security-question',
    customizable: true,
    description: loc('factor.securityQuestion', 'login'),
    iconClassName: 'mfa-okta-security-question',
  },
  [AUTHENTICATOR_KEY.SYMANTEC_VIP]: {
    icon: SymantecIcon,
    name: 'mfa-symantec',
    customizable: false,
    description: loc('factor.totpHard.symantecVip', 'login'),
    iconClassName: 'mfa-symantec',
  },
  [AUTHENTICATOR_KEY.WEBAUTHN]: {
    icon: SecurityKeyOrBiometricsIcon,
    name: 'mfa-webauthn',
    customizable: true,
    description: loc('factor.webauthn.biometric', 'login'),
    iconClassName: 'mfa-webauthn',
  },
  [AUTHENTICATOR_KEY.YUBIKEY]: {
    icon: YubiKeyIcon,
    name: 'mfa-yubikey',
    customizable: false,
    description: loc('factor.totpHard.yubikey', 'login'),
    iconClassName: 'mfa-yubikey',
  },
  [CHALLENGE_METHOD.APP_LINK]: {
    icon: OktaVerifyIcon,
    name: 'mfa-okta-verify',
    customizable: false,
    description: loc('factor.totpSoft.oktaVerify', 'login'),
    iconClassName: 'mfa-okta-verify',
  },
  [CHALLENGE_METHOD.CHROME_DTC]: {
    icon: OktaVerifyIcon,
    name: 'mfa-okta-verify',
    customizable: false,
    description: loc('factor.totpSoft.oktaVerify', 'login'),
    iconClassName: 'mfa-okta-verify',
  },
  [CHALLENGE_METHOD.CUSTOM_URI]: {
    icon: OktaVerifyIcon,
    name: 'mfa-okta-verify',
    customizable: false,
    description: loc('factor.totpSoft.oktaVerify', 'login'),
    iconClassName: 'mfa-okta-verify',
  },
  [CHALLENGE_METHOD.LOOPBACK]: {
    icon: OktaVerifyIcon,
    name: 'mfa-okta-verify',
    customizable: false,
    description: loc('factor.totpSoft.oktaVerify', 'login'),
    iconClassName: 'mfa-okta-verify',
  },
  [CHALLENGE_METHOD.UNIVERSAL_LINK]: {
    icon: OktaVerifyIcon,
    name: 'mfa-okta-verify',
    customizable: false,
    description: loc('factor.totpSoft.oktaVerify', 'login'),
    iconClassName: 'mfa-okta-verify',
  },
});
