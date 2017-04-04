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

/* eslint max-statements: [2, 16], complexity: [2, 10] */
define(['okta', 'util/RouterUtil'], function (Okta, RouterUtil) {

  var _ = Okta._;

  var action = function (model) {
    var url = RouterUtil.createVerifyUrl(model.get('provider'), model.get('factorType')),
        self = this;

    this.model.manageTransaction(function (transaction, setTransaction) {
      if (transaction.status === 'MFA_CHALLENGE' && transaction.prev) {
        return transaction.prev()
        .then(function (trans) {
          self.trigger('options:toggle');
          setTransaction(trans);
          self.options.appState.trigger('navigate', url);
        });
      } else {
        self.trigger('options:toggle');
        self.options.appState.trigger('navigate', url);
      }
    });
  };

  var dropdownOptions = {
    'TITLE': {
      title: _.partial(Okta.loc, 'mfa.factors.dropdown.title', 'login'),
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
      title: _.partial(Okta.loc, 'factor.totpHard.rsaSecurId', 'login'),
      action: function () {
        action.call(this, this.model);
      }
    },

    'ON_PREM': {
      icon: 'factor-icon mfa-onprem-30',
      title: function () {
        return this.model.get('factorLabel');
      },
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
      title: _.partial(Okta.loc, 'mfa.duoSecurity.push', 'login', ['XXX-XXX-7890'])
    },

    'DUO_SMS': {
      icon: 'duo-sms-16',
      className: 'suboption',
      // TODO: add phone number here
      title: _.partial(Okta.loc, 'mfa.duoSecurity.sms', 'login', ['XXX-XXX-7890'])
    },

    'DUO_CALL': {
      icon: 'duo-call-16',
      className: 'suboption',
      // TODO: add phone number here
      title: _.partial(Okta.loc, 'mfa.duoSecurity.call', 'login', ['XXX-XXX-7890'])
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

    'CALL': {
      icon: 'factor-icon mfa-call-30',
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
    },

    'WINDOWS_HELLO': {
      icon: 'factor-icon mfa-windows-hello-30',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'U2F': {
      icon: 'factor-icon mfa-u2f-30',
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
