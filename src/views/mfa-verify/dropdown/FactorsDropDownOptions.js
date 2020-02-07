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

  // deviceName is escaped on BaseForm (see BaseForm's template)
  var pushTitleTpl = Okta.tpl('{{factorName}} ({{{deviceName}}})');
  var action = function (model) {

    var factorIndex;
    var factorType = model.get('factorType');
    var factorsList = this.options.appState.get('factors');
    if (factorsList.hasMultipleFactorsOfSameType(factorType)) {
      factorIndex = factorsList.getFactorIndex(factorType, model.get('id'));
    }
    var url = RouterUtil.createVerifyUrl(model.get('provider'), factorType, factorIndex);
    var self = this;

    this.options.appState.trigger('factorSwitched');
    this.model.manageTransaction(function (transaction, setTransaction) {
      // FACTOR_CHALLENGE does not have a prev link
      if (transaction.status === 'FACTOR_CHALLENGE') {
        this.options.appState.set('trapMfaRequiredResponse', true);
      }
      if (transaction.status === 'MFA_CHALLENGE' && transaction.prev) {
        this.options.appState.set('trapMfaRequiredResponse', true);
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
      className: 'dropdown-list-title',
      disabled: true
    },

    'OKTA_VERIFY': {
      icon: 'factor-icon mfa-okta-verify-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'OKTA_VERIFY_PUSH': {
      icon: 'factor-icon mfa-okta-verify-30',
      className: 'factor-option',
      title: function () {
        return pushTitleTpl({
          factorName: this.model.get('factorLabel'),
          deviceName: this.model.get('deviceName')
        });
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'GOOGLE_AUTH': {
      icon: 'factor-icon mfa-google-auth-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'CUSTOM_HOTP': {
      icon: 'factor-icon mfa-hotp-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'SYMANTEC_VIP': {
      icon: 'factor-icon mfa-symantec-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'RSA_SECURID': {
      icon: 'factor-icon mfa-rsa-30',
      className: 'factor-option',
      title: _.partial(Okta.loc, 'factor.totpHard.rsaSecurId', 'login'),
      action: function () {
        action.call(this, this.model);
      }
    },

    'ON_PREM': {
      icon: 'factor-icon mfa-onprem-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'DUO': {
      icon: 'factor-icon mfa-duo-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'DUO_PUSH': {
      icon: 'duo-push-16',
      className: 'suboption factor-option',
      // TODO: add phone number here
      title: _.partial(Okta.loc, 'mfa.duoSecurity.push', 'login', ['XXX-XXX-7890'])
    },

    'DUO_SMS': {
      icon: 'duo-sms-16',
      className: 'suboption factor-option',
      // TODO: add phone number here
      title: _.partial(Okta.loc, 'mfa.duoSecurity.sms', 'login', ['XXX-XXX-7890'])
    },

    'DUO_CALL': {
      icon: 'duo-call-16',
      className: 'suboption factor-option',
      // TODO: add phone number here
      title: _.partial(Okta.loc, 'mfa.duoSecurity.call', 'login', ['XXX-XXX-7890'])
    },

    'YUBIKEY': {
      icon: 'factor-icon mfa-yubikey-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'SMS': {
      icon: 'factor-icon mfa-sms-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'CALL': {
      icon: 'factor-icon mfa-call-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'QUESTION': {
      icon: 'factor-icon mfa-question-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'PASSWORD': {
      icon: 'factor-icon mfa-password-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'WINDOWS_HELLO': {
      icon: 'factor-icon mfa-windows-hello-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'U2F': {
      icon: 'factor-icon mfa-u2f-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'WEBAUTHN': {
      icon: 'factor-icon mfa-webauthn-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'EMAIL': {
      icon: 'factor-icon mfa-email-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'GENERIC_SAML': {
      icon: 'factor-icon mfa-custom-factor-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'GENERIC_OIDC': {
      icon: 'factor-icon mfa-custom-factor-30',
      className: 'factor-option',
      title: function () {
        return this.model.get('factorLabel');
      },
      action: function () {
        action.call(this, this.model);
      }
    },

    'CUSTOM_CLAIMS': {
      icon: 'factor-icon mfa-custom-factor-30',
      className: 'factor-option',
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
