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

import { Form, loc } from '@okta/courage';
import DeviceFingerprint from 'v1/util/DeviceFingerprint';
import TypingUtil from 'v1/util/TypingUtil';
import Util from 'util/Util';
import TextBox from 'v1/views/shared/TextBox';
export default Form.extend({
  className: 'primary-auth-form',
  noCancelButton: true,
  attributes: { novalidate: 'novalidate' },
  save: function() {
    if (this.settings.get('features.passwordlessAuth')) {
      return loc('oform.next', 'login');
    }
    return loc('primaryauth.submit', 'login');
  },
  saveId: 'okta-signin-submit',
  layout: 'o-form-theme',

  // If socialAuth is configured, the title moves from the form to
  // the top of the container (and is rendered in socialAuth).
  title: function() {
    let formTitle = loc('primaryauth.title', 'login');

    if (this.settings.get('socialAuthPositionTop')) {
      formTitle = '';
    }
    return formTitle;
  },

  initialize: function() {
    const trackTypingPattern = this.settings.get('features.trackTypingPattern');

    this.listenTo(this, 'save', async function() {
      const { appState } = this.options;
      if (trackTypingPattern) {
        const typingPattern = TypingUtil.getTypingPattern();
        appState.set('typingPattern', typingPattern);
      }
      const creds = {
        username: this.model.get('username'),
      };

      if (!this.settings.get('features.passwordlessAuth')) {
        creds.password = this.model.get('password');
      }

      // show loading spinner and disable submit button before processCreds hook runs
      appState.trigger('loading', true);
      this.state.trigger('togglePrimaryAuthButton', true);
      
      await this.settings.processCreds(creds);

      if (this.settings.get('features.deviceFingerprinting')) {
        try {
          const fingerprint = await DeviceFingerprint.generateDeviceFingerprint(this.settings.get('baseUrl'), this.$el);
          appState.set('deviceFingerprint', fingerprint);
        } catch {
          // Keep going even if device fingerprint fails
        }
      }

      this.model.save();
    });

    this.stateEnableChange();
    this.stateUsernameChange();
  },

  stateEnableChange: function() {
    this.listenTo(this.state, 'change:enabled', function(model, enable) {
      if (enable) {
        this.enable();
      } else {
        this.disable();
      }
    });
  },

  stateUsernameChange: function() {
    this.listenTo(this.state, 'change:disableUsername', function(model, disable) {
      if (disable) {
        this.$el.find('#okta-signin-username').attr('disabled', true);
      } else {
        this.$el.find('#okta-signin-username').removeAttr('disabled');
      }
    });
  },

  inputs: function() {
    const inputs = [];

    inputs.push(this.getUsernameField());
    if (!this.settings.get('features.passwordlessAuth')) {
      inputs.push(this.getPasswordField());
    }
    if (this.settings.get('features.rememberMe')) {
      inputs.push(this.getRemeberMeCheckbox());
    }
    return inputs;
  },

  getUsernameField: function() {
    const userNameFieldObject = {
      className: 'margin-btm-5',
      label: loc('primaryauth.username.placeholder', 'login'),
      'label-top': true,
      explain: () => {
        if (!this.isCustomized('primaryauth.username.tooltip')) {
          return false;
        }

        return Util.createInputExplain('primaryauth.username.tooltip', 'primaryauth.username.placeholder', 'login');
      },
      'explain-top': true,
      name: 'username',
      input: TextBox,
      inputId: 'okta-signin-username',
      type: 'text',
      disabled: this.options.appState.get('disableUsername'),
      autoComplete: Util.getAutocompleteValue(this.settings, 'username'),
      // TODO: support a11y attrs in Courage - OKTA-279025
      render: function() {
        const that = this;
        function clearAriaInvalid() {
          that.$(this)
            .removeAttr('aria-invalid')
            .off('focusout', clearAriaInvalid)
            .off('change', clearAriaInvalid);
        }

        this.$(`input[name=${this.options.name}]`)
          // OKTA-430928: to prevent NVDA and JAWS screen readers from
          // announcing "required invalid entry" before the user has a chance to
          // complete the field, aria-invalid is set to "false" initially and
          // removed on focusout or change using clearAriaInvalid()
          .attr({
            'aria-invalid': 'false',
            'aria-required': 'true',
          })
          .prop({
            required: true,
          })
          .focusout(clearAriaInvalid)
          .change(clearAriaInvalid);
      },
    };

    return userNameFieldObject;
  },

  getPasswordField: function() {
    const passwordFieldObject = {
      className: 'margin-btm-30',
      label: loc('primaryauth.password.placeholder', 'login'),
      'label-top': true,
      explain: () => {
        if (!this.isCustomized('primaryauth.password.tooltip')) {
          return false;
        }

        return Util.createInputExplain('primaryauth.password.tooltip', 'primaryauth.password.placeholder', 'login');
      },
      'explain-top': true,
      name: 'password',
      inputId: 'okta-signin-password',
      validateOnlyIfDirty: true,
      type: 'password',
      autoComplete: Util.getAutocompleteValue(this.settings, 'current-password'),
      // TODO: support a11y attrs in Courage - OKTA-279025
      render: function() {
        const that = this;
        function clearAriaInvalid() {
          that.$(this)
            .removeAttr('aria-invalid')
            .off('focusout', clearAriaInvalid)
            .off('change', clearAriaInvalid);
        }
        this.$(`input[name=${this.options.name}]`)
          // OKTA-430928: to prevent NVDA and JAWS screen readers from
          // announcing "required invalid entry" before the user has a chance to
          // complete the field, aria-invalid is set to "false" initially and
          // removed on focusout or change using clearAriaInvalid()
          .attr({
            'aria-invalid': 'false',
            'aria-required': 'true',
          })
          .prop({
            required: true
          })
          .focusout(clearAriaInvalid)
          .change(clearAriaInvalid);
      },
    };

    if (this.settings.get('features.showPasswordToggleOnSignInPage')) {
      passwordFieldObject.params = {};
      passwordFieldObject.params.showPasswordToggle = true;
    }
    return passwordFieldObject;
  },

  isCustomized: function(property) {
    const language = this.settings.get('language');
    const i18n = this.settings.get('i18n');
    const customizedProperty = i18n && i18n[language] && i18n[language][property];

    return !!customizedProperty;
  },

  // TODO fix method name typo
  getRemeberMeCheckbox: function() {
    return {
      label: false,
      placeholder: loc('remember', 'login'),
      name: 'remember',
      type: 'checkbox',
      'label-top': true,
      className: 'margin-btm-0',
      initialize: function() {
        this.listenTo(this.model, 'change:remember', function(model, val) {
          // OKTA-98946: We normally re-render on changes to model values,
          // but in this case we will manually update the checkbox due to
          // iOS Safari and how it handles autofill - it will autofill the
          // form anytime the dom elements are re-rendered, which prevents
          // the user from editing their username.
          this.$(':checkbox').prop('checked', val).trigger('updateState');
        });
      },
    };
  },

  focus: function() {
    if (!this.model.get('username')) {
      this.getInputs().first().focus();
    } else if (!this.settings.get('features.passwordlessAuth')) {
      this.getInputs().toArray()[1].focus();
    }
    if (this.settings.get('features.trackTypingPattern')) {
      TypingUtil.track('okta-signin-username');
    }
  },
});
