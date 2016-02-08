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

/* jshint maxstatements: 16, maxcomplexity: 10 */
define(['okta', 'util/RouterUtil'], function (Okta, RouterUtil) {

  var action = function (model) {
    var url = RouterUtil.createVerifyUrl(model.get('provider'), model.get('factorType')),
        authClient = this.settings.getAuthClient(),
        self = this;

    if (authClient.state === 'MFA_CHALLENGE' && authClient.current.previous) {
      authClient.current.previous().then(function () {
        self.trigger('options:toggle');
        self.options.appState.trigger('navigate', url);
      });
    } else {
      this.trigger('options:toggle');
      this.options.appState.trigger('navigate', url);
    }
  };

  var dropdownOptions = {
    'TITLE': {
      title: Okta.loc('mfa.factors.dropdown.title', 'login'),
      className: 'dropdown-list-title'
    },

    'OKTA_VERIFY': {
      icon: 'factor-icon mfa-okta-verify-30',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'OKTA_VERIFY_PUSH': {
      icon: 'factor-icon mfa-okta-verify-30',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'GOOGLE_AUTH': {
      icon: 'factor-icon mfa-google-auth-30',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'SYMANTEC_VIP': {
      icon: 'factor-icon mfa-symantec-30',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'RSA_SECURID': {
      icon: 'factor-icon mfa-rsa-30',
      title: Okta.loc('factor.totpHard.rsaSecurId', 'login'),
      action: function () {
        action.call(this, this.model);
      }
    },

    'DUO': {
      icon: 'factor-icon mfa-duo-30',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'DUO_PUSH': {
      icon: 'duo-push-16',
      className: 'suboption',
      // TODO: add phone number here
      title: Okta.loc('mfa.duoSecurity.push', 'login', ['XXX-XXX-7890'])
    },

    'DUO_SMS': {
      icon: 'duo-sms-16',
      className: 'suboption',
      // TODO: add phone number here
      title: Okta.loc('mfa.duoSecurity.sms', 'login', ['XXX-XXX-7890'])
    },

    'DUO_CALL': {
      icon: 'duo-call-16',
      className: 'suboption',
      // TODO: add phone number here
      title: Okta.loc('mfa.duoSecurity.call', 'login', ['XXX-XXX-7890'])
    },

    'YUBIKEY': {
      icon: 'factor-icon mfa-yubikey-30',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'SMS': {
      icon: 'factor-icon mfa-sms-30',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'QUESTION': {
      icon: 'factor-icon mfa-question-30',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    }
  };

  return {
    getDropdownOption: function (factorName) {
      return dropdownOptions[factorName];
    }
  };
});
