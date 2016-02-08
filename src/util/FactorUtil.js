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

define(['okta'], function (Okta) {

  var fn = {};

  var factorData = {
    'OKTA_VERIFY': {
      label: Okta.loc('factor.totpSoft.oktaVerify', 'login'),
      description: Okta.loc('factor.totpSoft.description', 'login'),
      iconClassName: 'mfa-okta-verify',
      sortOrder: 1
    },
    'OKTA_VERIFY_PUSH': {
      label: Okta.loc('factor.oktaVerifyPush', 'login'),
      description: Okta.loc('factor.push.description', 'login'),
      iconClassName: 'mfa-okta-verify',
      sortOrder: 1
    },
    'GOOGLE_AUTH': {
      label: Okta.loc('factor.totpSoft.googleAuthenticator', 'login'),
      description: Okta.loc('factor.totpSoft.description', 'login'),
      iconClassName: 'mfa-google-auth',
      sortOrder: 2
    },
    'SYMANTEC_VIP': {
      label: Okta.loc('factor.totpHard.symantecVip', 'login'),
      description: Okta.loc('factor.totpHard.description', 'login'),
      iconClassName: 'mfa-symantec',
      sortOrder: 3
    },
    'RSA_SECURID': {
      label: Okta.loc('factor.totpHard.rsaSecurId', 'login'),
      description: Okta.loc('factor.totpHard.description', 'login'),
      iconClassName: 'mfa-rsa',
      sortOrder: 4
    },
    'DUO': {
      label: Okta.loc('factor.duo', 'login'),
      description: Okta.loc('factor.duo.description', 'login'),
      iconClassName: 'mfa-duo',
      sortOrder: 5
    },
    'YUBIKEY': {
      label: Okta.loc('factor.totpHard.yubikey', 'login'),
      description: Okta.loc('factor.totpHard.yubikey.description', 'login'),
      iconClassName: 'mfa-yubikey',
      sortOrder: 6
    },
    'SMS': {
      label: Okta.loc('factor.sms', 'login'),
      description: Okta.loc('factor.sms.description', 'login'),
      iconClassName: 'mfa-okta-sms',
      sortOrder: 7
    },
    'QUESTION': {
      label: Okta.loc('factor.securityQuestion', 'login'),
      description: Okta.loc('factor.securityQuestion.description', 'login'),
      iconClassName: 'mfa-okta-security-question',
      sortOrder: 8
    }
  };

  /* jshint maxcomplexity: 10 */
  fn.getFactorName = function (provider, factorType) {
    if (provider === 'OKTA' && factorType === 'token:software:totp') {
      return 'OKTA_VERIFY';
    }
    if (provider === 'OKTA' && factorType === 'push') {
      return 'OKTA_VERIFY_PUSH';
    }
    if (provider === 'GOOGLE') {
      return 'GOOGLE_AUTH';
    }
    if (provider === 'SYMANTEC' && factorType === 'token') {
      return 'SYMANTEC_VIP';
    }
    if (provider === 'RSA' && factorType === 'token') {
      return 'RSA_SECURID';
    }
    if (provider === 'DUO' && factorType === 'web') {
      return 'DUO';
    }
    if (provider === 'YUBICO' && factorType === 'token:hardware') {
      return 'YUBIKEY';
    }
    if (provider === 'OKTA' && factorType === 'sms') {
      return 'SMS';
    }
    if (provider === 'OKTA' && factorType === 'question') {
      return 'QUESTION';
    }
  };

  fn.isOktaVerify = function (provider, factorType) {
    return provider === 'OKTA' && (factorType === 'token:software:totp' || factorType === 'push');
  };

  fn.getFactorLabel = function (provider, factorType) {
    return factorData[fn.getFactorName(provider, factorType)].label;
  };

  fn.getFactorDescription = function (provider, factorType) {
    return factorData[fn.getFactorName(provider, factorType)].description;
  };

  fn.getFactorIconClassName = function (provider, factorType) {
    return factorData[fn.getFactorName(provider, factorType)].iconClassName;
  };

  fn.getFactorSortOrder = function (provider, factorType) {
    return factorData[fn.getFactorName(provider, factorType)].sortOrder;
  };

  return fn;
});
