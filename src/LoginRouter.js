/*!
 * Okta Sign-In Widget SDK LEGAL NOTICES
 *
 * The Okta software accompanied by this notice is provided pursuant to the
 * following terms:
 *
 * Copyright © 2015, Okta, Inc. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable
 * law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * The Okta software accompanied by this notice has build dependencies on
 * certain third party software licensed under separate terms ("Third Party
 * Components").
 *
 * Okta makes the following disclaimers regarding the Third Party Components on
 * behalf of itself, the copyright holders, contributors, and licensors of such
 * Third Party Components:
 * TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, THE THIRD PARTY
 * COMPONENTS ARE PROVIDED BY THE COPYRIGHT HOLDERS, CONTRIBUTORS, LICENSORS,
 * AND OKTA "AS IS" AND ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER
 * ORAL OR WRITTEN, WHETHER EXPRESS, IMPLIED, OR ARISING BY STATUTE, CUSTOM,
 * COURSE OF DEALING, OR TRADE USAGE, INCLUDING WITHOUT LIMITATION THE IMPLIED
 * WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
 * NON-INFRINGEMENT, ARE DISCLAIMED. IN NO EVENT WILL THE COPYRIGHT OWNER,
 * CONTRIBUTORS, LICENSORS, OR OKTA BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION), HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE THIRD
 * PARTY COMPONENTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* jshint maxparams: 100 */
define([
  'util/BaseLoginRouter',
  'PrimaryAuthController',
  'VerifyDuoController',
  'MfaVerifyController',
  'EnrollChoicesController',
  'EnrollDuoController',
  'EnrollQuestionController',
  'EnrollSmsController',
  'EnrollRsaController',
  'EnrollSymantecVipController',
  'EnrollYubikeyController',
  'EnrollTotpController',
  'BarcodeTotpController',
  'BarcodePushController',
  'ActivateTotpController',
  'ManualSetupTotpController',
  'ManualSetupPushController',
  'EnrollmentLinkSentController',
  'EnterPasscodePushFlowController',
  'PasswordExpiredController',
  'ForgotPasswordController',
  'RecoveryChallengeController',
  'PwdResetEmailSentController',
  'RecoveryQuestionController',
  'PasswordResetController',
  'RecoveryLoadingController',
  'UnlockAccountController',
  'UnlockEmailSentController',
  'RefreshAuthStateController',
  'views/shared/SecurityBeacon',
  'views/shared/FactorBeacon'
],
function (BaseLoginRouter, PrimaryAuthController, VerifyDuoController, MfaVerifyController,
          EnrollChoicesController, EnrollDuoController, EnrollQuestionController, EnrollSmsController,
          EnrollRsaController, EnrollSymantecVipController, EnrollYubikeyController, EnrollTotpController,
          BarcodeTotpController, BarcodePushController, ActivateTotpController, ManualSetupTotpController,
          ManualSetupPushController, EnrollmentLinkSentController, EnterPasscodePushFlowController,
          PasswordExpiredController, ForgotPasswordController, RecoveryChallengeController,
          PwdResetEmailSentController, RecoveryQuestionController, PasswordResetController,
          RecoveryLoadingController, UnlockAccountController, UnlockEmailSentController,
          RefreshAuthStateController, SecurityBeacon, FactorBeacon) {

  return BaseLoginRouter.extend({

    routes: {
      '': 'primaryAuth',
      'signin': 'primaryAuth',
      'signin/verify/duo/web': 'verifyDuo',
      'signin/verify/:provider/:factorType': 'verify',
      'signin/enroll': 'enrollChoices',
      'signin/enroll/duo/web': 'enrollDuo',
      'signin/enroll/okta/question': 'enrollQuestion',
      'signin/enroll/okta/sms': 'enrollSms',
      'signin/enroll-activate/okta/sms': 'enrollSms',
      'signin/enroll/rsa/token': 'enrollRsa',
      'signin/enroll/symantec/token': 'enrollSymantecVip',
      'signin/enroll/yubico/token:hardware': 'enrollYubikey',
      'signin/enroll/:provider/:factorType': 'enrollTotpFactor',
      'signin/enroll-activate/okta/push': 'scanBarcodePushFactor',
      'signin/enroll-activate/okta/push/manual': 'manualSetupPushFactor',
      'signin/enroll-activate/okta/push/sent': 'activationLinkSent',
      'signin/enroll-activate/okta/token:software:totp/passcode': 'enterPasscodeInPushEnrollmentFlow',
      'signin/enroll-activate/:provider/:factorType': 'scanBarcodeTotpFactor',
      'signin/enroll-activate/:provider/:factorType/activate': 'activateTotpFactor',
      'signin/enroll-activate/:provider/:factorType/manual': 'manualSetupTotpFactor',
      'signin/password-expired': 'passwordExpired',
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
      'signin/refresh-auth-state(/:token)': 'refreshAuthState',
      '*wildcard': 'primaryAuth'
    },

    // Route handlers that do not require a stateToken. If the page is refreshed,
    // these functions will not require a status call to refresh the stateToken.
    stateLessRouteHandlers: [
      'primaryAuth', 'forgotPassword', 'recoveryLoading', 'unlockAccount',
      'refreshAuthState'
    ],

    primaryAuth: function () {
      this.render(PrimaryAuthController, { Beacon: SecurityBeacon });
    },

    verifyDuo: function () {
      this.render(VerifyDuoController, {
        provider: 'DUO',
        factorType: 'web',
        Beacon: FactorBeacon
      });
    },

    verify: function (provider, factorType) {
      this.render(MfaVerifyController, {
        provider: provider.toUpperCase(),
        factorType: factorType,
        Beacon: FactorBeacon
      });
    },

    enrollChoices: function () {
      this.render(EnrollChoicesController, { Beacon: SecurityBeacon });
    },

    enrollDuo: function () {
      this.render(EnrollDuoController, {
        provider: 'DUO',
        factorType: 'web',
        Beacon: FactorBeacon
      });
    },

    enrollQuestion: function () {
      this.render(EnrollQuestionController, {
        provider: 'OKTA',
        factorType: 'question',
        Beacon: FactorBeacon
      });
    },

    enrollSms: function () {
      this.render(EnrollSmsController, {
        provider: 'OKTA',
        factorType: 'sms',
        Beacon: FactorBeacon
      });
    },

    enrollRsa: function () {
      this.render(EnrollRsaController, {
        provider: 'RSA',
        factorType: 'token',
        Beacon: FactorBeacon
      });
    },

    enrollSymantecVip: function () {
      this.render(EnrollSymantecVipController, {
        provider: 'SYMANTEC',
        factorType: 'token',
        Beacon: FactorBeacon
      });
    },

    enrollYubikey: function () {
      this.render(EnrollYubikeyController, {
        provider: 'YUBICO',
        factorType: 'token:hardware',
        Beacon: FactorBeacon
      });
    },

    enrollTotpFactor: function (provider, factorType) {
      this.render(EnrollTotpController, {
        provider: provider.toUpperCase(),
        factorType: factorType,
        Beacon: FactorBeacon
      });
    },

    scanBarcodeTotpFactor: function (provider, factorType) {
      this.render(BarcodeTotpController, {
        provider: provider.toUpperCase(),
        factorType: factorType,
        Beacon: FactorBeacon
      });
    },

    scanBarcodePushFactor: function () {
      this.render(BarcodePushController, {
        provider: 'OKTA',
        factorType: 'push',
        Beacon: FactorBeacon
      });
    },

    activateTotpFactor: function (provider, factorType) {
      this.render(ActivateTotpController, {
        provider: provider.toUpperCase(),
        factorType: factorType,
        Beacon: FactorBeacon
      });
    },

    manualSetupTotpFactor: function (provider, factorType) {
      this.render(ManualSetupTotpController, {
        provider: provider.toUpperCase(),
        factorType: factorType,
        Beacon: FactorBeacon
      });
    },

    manualSetupPushFactor: function () {
      this.render(ManualSetupPushController, {
        provider: 'OKTA',
        factorType: 'push',
        Beacon: FactorBeacon
      });
    },

    activationLinkSent: function () {
      this.render(EnrollmentLinkSentController, {
        provider: 'OKTA',
        factorType: 'push',
        Beacon: FactorBeacon
      });
    },

    enterPasscodeInPushEnrollmentFlow: function () {
      this.render(EnterPasscodePushFlowController, {
        provider: 'OKTA',
        factorType: 'token:software:totp',
        Beacon: FactorBeacon
      });
    },

    passwordExpired: function () {
      this.render(PasswordExpiredController, { Beacon: SecurityBeacon });
    },

    forgotPassword: function () {
      this.render(ForgotPasswordController);
    },

    recoveryChallenge: function () {
      this.render(RecoveryChallengeController, { Beacon: SecurityBeacon });
    },

    recoveryEmailSent: function () {
      this.render(PwdResetEmailSentController, { Beacon: SecurityBeacon });
    },

    unlockEmailSent: function () {
      this.render(UnlockEmailSentController, { Beacon: SecurityBeacon });
    },

    recoveryQuestion: function () {
      this.render(RecoveryQuestionController, { Beacon: SecurityBeacon });
    },

    passwordReset: function () {
      this.render(PasswordResetController, { Beacon: SecurityBeacon });
    },

    recoveryLoading: function (token) {
      this.render(RecoveryLoadingController, {
        token: token,
        Beacon: SecurityBeacon
      });
    },

    unlockAccount: function () {
      this.render(UnlockAccountController);
    },

    refreshAuthState: function (token) {
      this.render(RefreshAuthStateController, {
        token: token,
        Beacon: SecurityBeacon
      });
    }

  });

});
