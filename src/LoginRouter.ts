/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint max-params: 0 */
import AccountUnlockedController from 'AccountUnlockedController';
import ActivateTotpController from 'ActivateTotpController';
import AdminConsentRequiredController from 'AdminConsentRequiredController';
import BarcodePushController from 'BarcodePushController';
import BarcodeTotpController from 'BarcodeTotpController';
import ConsentRequiredController from 'ConsentRequiredController';
import CustomPasswordExpiredController from 'CustomPasswordExpiredController';
import DeviceActivateController from './DeviceActivateController';
import DeviceActivateTerminalController from './DeviceActivateTerminalController';
import EnrollActivateCustomFactorController from 'EnrollActivateCustomFactorController';
import EnrollActivateEmailController from 'EnrollActivateEmailController';
import EnrollCallAndSmsController from 'EnrollCallAndSmsController';
import EnrollChoicesController from 'EnrollChoicesController';
import EnrollCustomFactorController from 'EnrollCustomFactorController';
import EnrollDuoController from 'EnrollDuoController';
import EnrollEmailController from 'EnrollEmailController';
import EnrollHotpController from 'EnrollHotpController';
import EnrollOnPremController from 'EnrollOnPremController';
import EnrollPasswordController from 'EnrollPasswordController';
import EnrollQuestionController from 'EnrollQuestionController';
import EnrollSymantecVipController from 'EnrollSymantecVipController';
import EnrollTotpController from 'EnrollTotpController';
import EnrollU2FController from 'EnrollU2FController';
import EnrollUserController from 'EnrollUserController';
import EnrollWebauthnController from 'EnrollWebauthnController';
import EnrollWindowsHelloController from 'EnrollWindowsHelloController';
import EnrollYubikeyController from 'EnrollYubikeyController';
import EnrollmentLinkSentController from 'EnrollmentLinkSentController';
import EnterPasscodePushFlowController from 'EnterPasscodePushFlowController';
import ForgotPasswordController from 'ForgotPasswordController';
import IDPDiscoveryController from 'IDPDiscoveryController';
import ForceIDPDiscoveryController from 'ForceIDPDiscoveryController';
import ManualSetupPushController from 'ManualSetupPushController';
import ManualSetupTotpController from 'ManualSetupTotpController';
import MfaVerifyController from 'MfaVerifyController';
import PasswordExpiredController from 'PasswordExpiredController';
import PasswordResetController from 'PasswordResetController';
import PollController from 'PollController';
import PrimaryAuthController from 'PrimaryAuthController';
import PwdResetEmailSentController from 'PwdResetEmailSentController';
import RecoveryChallengeController from 'RecoveryChallengeController';
import RecoveryLoadingController from 'RecoveryLoadingController';
import RecoveryQuestionController from 'RecoveryQuestionController';
import RefreshAuthStateController from 'RefreshAuthStateController';
import RegistrationCompleteController from 'RegistrationCompleteController';
import RegistrationController from 'RegistrationController';
import UnlockAccountController from 'UnlockAccountController';
import UnlockEmailSentController from 'UnlockEmailSentController';
import VerifyCustomFactorController from 'VerifyCustomFactorController';
import VerifyDuoController from 'VerifyDuoController';
import VerifyPIVController from 'VerifyPIVController';
import VerifyU2FController from 'VerifyU2FController';
import VerifyWebauthnController from 'VerifyWebauthnController';
import VerifyWindowsHelloController from 'VerifyWindowsHelloController';
import ErrorStateController from 'ErrorStateController';
import BaseLoginRouter from 'util/BaseLoginRouter';
import FactorBeacon from 'views/shared/FactorBeacon';
import PIVBeacon from 'views/shared/PIVBeacon';
import SecurityBeacon from 'views/shared/SecurityBeacon';

import Enums from 'util/Enums';

export default BaseLoginRouter.extend({
  routes: {
    '': 'defaultAuth',
    signin: 'primaryAuth',
    'signin/verify/duo/web': 'verifyDuo',
    'signin/verify/piv': 'verifyPIV',
    'signin/poll': 'poll',
    'signin/verify/fido/webauthn': 'verifyWebauthn',
    'signin/verify/webauthn': 'verifyWebauthn',
    'signin/verify/fido/u2f': 'verifyU2F',
    'signin/verify/u2f': 'verifyU2F',
    'signin/verify/generic_saml/assertion:saml2': 'verifySAMLFactor',
    'signin/verify/generic_oidc/assertion:oidc': 'verifyOIDCFactor',
    'signin/verify/custom/claims_provider': 'verifyClaimsFactor',
    'signin/verify/:factorType': 'verifyNoProvider',
    'signin/verify/:provider/:factorType(/:factorIndex)': 'verify',
    'signin/enroll': 'enrollChoices',
    'signin/enroll/duo/web': 'enrollDuo',
    'signin/enroll/okta/question': 'enrollQuestion',
    'signin/enroll/okta/password': 'enrollPassword',
    'signin/enroll/okta/sms': 'enrollSms',
    'signin/enroll/okta/call': 'enrollCall',
    'signin/enroll/okta/email': 'enrollEmail',
    'signin/enroll-activate/okta/sms': 'enrollSms',
    'signin/enroll-activate/okta/call': 'enrollCall',
    'signin/enroll/rsa/token': 'enrollRsa',
    'signin/enroll/del_oath/token': 'enrollOnPrem',
    'signin/enroll/symantec/token': 'enrollSymantecVip',
    'signin/enroll/yubico/token:hardware': 'enrollYubikey',
    'signin/enroll/fido/webauthn': 'enrollWebauthn',
    'signin/enroll/fido/u2f': 'enrollU2F',
    'signin/enroll/generic_saml/assertion:saml2': 'enrollSAMLFactor',
    'signin/enroll/generic_oidc/assertion:oidc': 'enrollOIDCFactor',
    'signin/enroll/custom/claims_provider': 'enrollClaimsFactor',
    'signin/enroll/custom/token:hotp': 'enrollHotpFactor',
    'signin/enroll/:provider/:factorType': 'enrollTotpFactor',
    'signin/enroll-activate/okta/email': 'enrollActivateEmail',
    'signin/enroll-activate/okta/push': 'scanBarcodePushFactor',
    'signin/enroll-activate/okta/push/manual': 'manualSetupPushFactor',
    'signin/enroll-activate/okta/push/sent': 'activationLinkSent',
    'signin/enroll-activate/okta/token:software:totp/passcode': 'enterPasscodeInPushEnrollmentFlow',
    'signin/enroll-activate/custom/claims_provider': 'enrollActivateClaimsFactor',
    'signin/enroll-activate/:provider/:factorType': 'scanBarcodeTotpFactor',
    'signin/enroll-activate/:provider/:factorType/activate': 'activateTotpFactor',
    'signin/enroll-activate/:provider/:factorType/manual': 'manualSetupTotpFactor',
    'signin/password-expired': 'passwordExpired',
    'signin/custom-password-expired': 'customPasswordExpired',
    'signin/forgot-password': 'forgotPassword',
    'signin/recovery-challenge': 'recoveryChallenge',
    'signin/recovery-emailed': 'recoveryEmailSent',
    'signin/recovery-question': 'recoveryQuestion',
    'signin/password-reset': 'passwordReset',
    'signin/reset-password/:token': 'recoveryLoading',
    'signin/user-unlock/:token': 'recoveryLoading',
    'signin/recovery/:token': 'recoveryLoading',
    'signin/unlock-emailed': 'unlockEmailSent',
    'signin/unlock': 'unlockAccount',
    'signin/account-unlocked': 'accountUnlocked',
    'signin/refresh-auth-state(/:token)': 'refreshAuthState',
    'signin/register': 'register',
    'signin/register-complete': 'registerComplete',
    'signin/error': 'errorState',
    'signin/consent': 'consentRequired',
    'signin/admin-consent': 'adminConsentRequired',
    'signin/enroll-user': 'enrollUser',
    'signin/device-activate-complete': 'deviceActivateComplete',
    'signin/device-activate': 'deviceActivate',
    'signin/idp-discovery-check': 'idpDiscoveryCheck',
    '*wildcard': 'defaultAuth',
  },

  // Route handlers that do not require a stateToken. If the page is refreshed,
  // these functions will not require a status call to refresh the stateToken.
  stateLessRouteHandlers: [
    'defaultAuth',
    'idpDiscovery',
    'primaryAuth',
    'forgotPassword',
    'recoveryLoading',
    'unlockAccount',
    'refreshAuthState',
    'register',
    'registerComplete',
    'errorState',
    'verifyPIV',
  ],

  defaultAuth: function() {
    if (window.location.hash === `#${Enums.WIDGET_CONTAINER_ID}`) {
      document.getElementById(Enums.WIDGET_CONTAINER_ID).focus();
      return;
    }
    if (this.settings.get('features.idpDiscovery')) {
      this.idpDiscovery();
    } else {
      this.primaryAuth();
    }
  },

  idpDiscoveryCheck: function() {
    this.render(ForceIDPDiscoveryController, { Beacon: SecurityBeacon });
  },

  idpDiscovery: function() {
    this.render(IDPDiscoveryController, { Beacon: SecurityBeacon });
  },

  primaryAuth: function() {
    this.render(PrimaryAuthController, { Beacon: SecurityBeacon });
  },

  verifyDuo: function() {
    this.render(VerifyDuoController, {
      provider: 'DUO',
      factorType: 'web',
      Beacon: FactorBeacon,
    });
  },

  verifyPIV: function() {
    this.render(VerifyPIVController, { Beacon: PIVBeacon });
  },

  poll: function() {
    this.render(PollController);
  },

  verifyWebauthn: function() {
    if (this.settings.get('features.webauthn')) {
      this.render(VerifyWebauthnController, {
        provider: 'FIDO',
        factorType: 'webauthn',
        Beacon: FactorBeacon,
      });
    } else {
      this.render(VerifyWindowsHelloController, {
        provider: 'FIDO',
        factorType: 'webauthn',
        Beacon: FactorBeacon,
      });
    }
  },

  verifyU2F: function() {
    this.render(VerifyU2FController, {
      provider: 'FIDO',
      factorType: 'u2f',
      Beacon: FactorBeacon,
    });
  },

  verifySAMLFactor: function() {
    this.render(VerifyCustomFactorController, {
      provider: 'GENERIC_SAML',
      factorType: 'assertion:saml2',
      Beacon: FactorBeacon,
    });
  },

  verifyOIDCFactor: function() {
    this.render(VerifyCustomFactorController, {
      provider: 'GENERIC_OIDC',
      factorType: 'assertion:oidc',
      Beacon: FactorBeacon,
    });
  },

  verifyClaimsFactor: function() {
    this.render(VerifyCustomFactorController, {
      provider: 'CUSTOM',
      factorType: 'claims_provider',
      Beacon: FactorBeacon,
    });
  },

  verify: function(provider, factorType, factorIndex) {
    this.render(MfaVerifyController, {
      provider: provider.toUpperCase(),
      factorType: factorType,
      factorIndex: factorIndex,
      Beacon: FactorBeacon,
    });
  },

  verifyNoProvider: function(factorType) {
    this.render(MfaVerifyController, {
      factorType: factorType,
      Beacon: FactorBeacon,
    });
  },

  enrollChoices: function() {
    this.render(EnrollChoicesController, { Beacon: SecurityBeacon });
  },

  enrollDuo: function() {
    this.render(EnrollDuoController, {
      provider: 'DUO',
      factorType: 'web',
      Beacon: FactorBeacon,
    });
  },

  enrollQuestion: function() {
    this.render(EnrollQuestionController, {
      provider: 'OKTA',
      factorType: 'question',
      Beacon: FactorBeacon,
    });
  },

  enrollPassword: function() {
    this.render(EnrollPasswordController, {
      provider: 'OKTA',
      factorType: 'password',
      Beacon: FactorBeacon,
    });
  },

  enrollSms: function() {
    this.render(EnrollCallAndSmsController, {
      provider: 'OKTA',
      factorType: 'sms',
      Beacon: FactorBeacon,
    });
  },

  enrollCall: function() {
    this.render(EnrollCallAndSmsController, {
      provider: 'OKTA',
      factorType: 'call',
      Beacon: FactorBeacon,
    });
  },

  enrollEmail: function() {
    this.render(EnrollEmailController, {
      provider: 'OKTA',
      factorType: 'email',
      Beacon: FactorBeacon,
    });
  },

  enrollActivateEmail: function() {
    this.render(EnrollActivateEmailController, {
      provider: 'OKTA',
      factorType: 'email',
      Beacon: FactorBeacon,
    });
  },

  enrollRsa: function() {
    this.render(EnrollOnPremController, {
      provider: 'RSA',
      factorType: 'token',
      Beacon: FactorBeacon,
    });
  },

  enrollOnPrem: function() {
    this.render(EnrollOnPremController, {
      provider: 'DEL_OATH',
      factorType: 'token',
      Beacon: FactorBeacon,
    });
  },

  enrollSymantecVip: function() {
    this.render(EnrollSymantecVipController, {
      provider: 'SYMANTEC',
      factorType: 'token',
      Beacon: FactorBeacon,
    });
  },

  enrollYubikey: function() {
    this.render(EnrollYubikeyController, {
      provider: 'YUBICO',
      factorType: 'token:hardware',
      Beacon: FactorBeacon,
    });
  },

  enrollSAMLFactor: function() {
    this.render(EnrollCustomFactorController, {
      provider: 'GENERIC_SAML',
      factorType: 'assertion:saml2',
      Beacon: FactorBeacon,
    });
  },

  enrollOIDCFactor: function() {
    this.render(EnrollCustomFactorController, {
      provider: 'GENERIC_OIDC',
      factorType: 'assertion:oidc',
      Beacon: FactorBeacon,
    });
  },

  enrollClaimsFactor: function() {
    this.render(EnrollCustomFactorController, {
      provider: 'CUSTOM',
      factorType: 'claims_provider',
      Beacon: FactorBeacon,
    });
  },

  enrollActivateClaimsFactor: function() {
    this.render(EnrollActivateCustomFactorController, {
      provider: 'CUSTOM',
      factorType: 'claims_provider',
      Beacon: FactorBeacon,
    });
  },

  enrollTotpFactor: function(provider, factorType) {
    this.render(EnrollTotpController, {
      provider: provider.toUpperCase(),
      factorType: factorType,
      Beacon: FactorBeacon,
    });
  },

  enrollHotpFactor: function() {
    this.render(EnrollHotpController, {
      provider: 'CUSTOM',
      factorType: 'token:hotp',
      Beacon: FactorBeacon,
    });
  },

  enrollWebauthn: function() {
    if (this.settings.get('features.webauthn')) {
      this.render(EnrollWebauthnController, {
        provider: 'FIDO',
        factorType: 'webauthn',
        Beacon: FactorBeacon,
      });
    } else {
      this.render(EnrollWindowsHelloController, {
        provider: 'FIDO',
        factorType: 'webauthn',
        Beacon: FactorBeacon,
      });
    }
  },

  enrollU2F: function() {
    this.render(EnrollU2FController, {
      provider: 'FIDO',
      factorType: 'u2f',
      Beacon: FactorBeacon,
    });
  },

  scanBarcodeTotpFactor: function(provider, factorType) {
    this.render(BarcodeTotpController, {
      provider: provider.toUpperCase(),
      factorType: factorType,
      Beacon: FactorBeacon,
    });
  },

  scanBarcodePushFactor: function() {
    this.render(BarcodePushController, {
      provider: 'OKTA',
      factorType: 'push',
      Beacon: FactorBeacon,
    });
  },

  activateTotpFactor: function(provider, factorType) {
    this.render(ActivateTotpController, {
      provider: provider.toUpperCase(),
      factorType: factorType,
      Beacon: FactorBeacon,
    });
  },

  manualSetupTotpFactor: function(provider, factorType) {
    this.render(ManualSetupTotpController, {
      provider: provider.toUpperCase(),
      factorType: factorType,
      Beacon: FactorBeacon,
    });
  },

  manualSetupPushFactor: function() {
    this.render(ManualSetupPushController, {
      provider: 'OKTA',
      factorType: 'push',
      Beacon: FactorBeacon,
    });
  },

  activationLinkSent: function() {
    this.render(EnrollmentLinkSentController, {
      provider: 'OKTA',
      factorType: 'push',
      Beacon: FactorBeacon,
    });
  },

  enterPasscodeInPushEnrollmentFlow: function() {
    this.render(EnterPasscodePushFlowController, {
      provider: 'OKTA',
      factorType: 'token:software:totp',
      Beacon: FactorBeacon,
    });
  },

  passwordExpired: function() {
    this.render(PasswordExpiredController, { Beacon: SecurityBeacon });
  },

  customPasswordExpired: function() {
    this.render(CustomPasswordExpiredController, { Beacon: SecurityBeacon });
  },

  forgotPassword: function() {
    this.render(ForgotPasswordController);
  },

  recoveryChallenge: function() {
    this.render(RecoveryChallengeController, { Beacon: SecurityBeacon });
  },

  recoveryEmailSent: function() {
    this.render(PwdResetEmailSentController, { Beacon: SecurityBeacon });
  },

  unlockEmailSent: function() {
    this.render(UnlockEmailSentController, { Beacon: SecurityBeacon });
  },

  recoveryQuestion: function() {
    this.render(RecoveryQuestionController, { Beacon: SecurityBeacon });
  },

  passwordReset: function() {
    this.render(PasswordResetController, { Beacon: SecurityBeacon });
  },

  recoveryLoading: function(token) {
    this.render(RecoveryLoadingController, {
      token: token,
      Beacon: SecurityBeacon,
    });
  },

  unlockAccount: function() {
    this.render(UnlockAccountController);
  },

  accountUnlocked: function() {
    this.render(AccountUnlockedController, { Beacon: SecurityBeacon });
  },

  refreshAuthState: function(token) {
    this.render(RefreshAuthStateController, {
      token: token,
      Beacon: SecurityBeacon,
    });
  },

  register: function() {
    this.render(RegistrationController);
  },

  registerComplete: function() {
    this.render(RegistrationCompleteController);
  },

  errorState: function() {
    this.render(ErrorStateController, { Beacon: SecurityBeacon });
  },

  consentRequired: function() {
    this.render(ConsentRequiredController);
  },

  adminConsentRequired: function() {
    this.render(AdminConsentRequiredController);
  },

  enrollUser: function() {
    this.render(EnrollUserController);
  },

  deviceActivate: function() {
    this.render(DeviceActivateController);
  },
  deviceActivateComplete: function() {
    this.render(DeviceActivateTerminalController);
  },
});
