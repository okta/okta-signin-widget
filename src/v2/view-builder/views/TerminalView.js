import { createCallout, loc } from 'okta';
import { BaseForm, BaseFooter, BaseView } from '../internals';
import { getBackToSignInLink, getSkipSetupLink, getReloadPageButtonLink } from '../utils/LinksUtil';
import EmailAuthenticatorHeader from '../components/EmailAuthenticatorHeader';

const RETURN_LINK_EXPIRED_KEY = 'idx.return.link.expired';
const SAFE_MODE_KEY_PREFIX = 'idx.error.server.safe.mode';
const UNLOCK_ACCOUNT_TERMINAL_KEY = 'oie.selfservice.unlock_user.success.message';
const RETURN_TO_ORIGINAL_TAB_KEY = 'idx.return.to.original.tab';
const OPERATION_CANCELED_ON_OTHER_DEVICE_KEY = 'idx.operation.cancelled.on.other.device';
const OPERATION_CANCELED_BY_USER_KEY = 'idx.operation.cancelled.by.user';
const DEVICE_ACTIVATED = 'idx.device.activated';
const DEVICE_NOT_ACTIVATED_CONSENT_DENIED = 'idx.device.not.activated.consent.denied';
const DEVICE_NOT_ACTIVATED_INTERNAL_ERROR = 'idx.device.not.activated.internal.error';

export const REGISTRATION_NOT_ENABLED = 'oie.registration.is.not.enabled';

const EMAIL_AUTHENTICATOR_TERMINAL_KEYS = [
  'idx.transferred.to.new.tab',
  'idx.return.stale',
  'idx.return.error',
  'idx.email.verification.required',
  RETURN_TO_ORIGINAL_TAB_KEY,
  RETURN_LINK_EXPIRED_KEY,
  OPERATION_CANCELED_ON_OTHER_DEVICE_KEY,
  OPERATION_CANCELED_BY_USER_KEY,
];

const GET_BACK_TO_SIGN_LINK_FLOWS = [
  RETURN_LINK_EXPIRED_KEY,
  REGISTRATION_NOT_ENABLED,
];

const DEVICE_CODE_ERROR_KEYS = [
  DEVICE_NOT_ACTIVATED_CONSENT_DENIED,
  DEVICE_NOT_ACTIVATED_INTERNAL_ERROR
];

const DEVICE_CODE_FLOW_TERMINAL_KEYS = [
  DEVICE_ACTIVATED,
  ...DEVICE_CODE_ERROR_KEYS
];

const Body = BaseForm.extend({
  noButtonBar: true,

  postRender() {
    BaseForm.prototype.postRender.apply(this, arguments);
    this.$el.addClass('terminal-state');

    // show device code terminal icons
    if (this.options.appState.containsMessageWithI18nKey(DEVICE_CODE_FLOW_TERMINAL_KEYS)) {
      const iconClass = this.options.appState.containsMessageWithI18nKey(DEVICE_ACTIVATED)
        ? 'success-24-green' : 'error-24-red';
      this.$('.o-form-head').before('<div class="device-code-terminal--icon-container">' +
        '<span class="device-code-terminal--icon ' + iconClass + '"></span>' +
        '</div>');
    }
  },

  title() {
    if (this.options.appState.containsMessageWithI18nKey(RETURN_LINK_EXPIRED_KEY)) {
      return loc('oie.email.return.link.expired.title', 'login');
    }
    if (this.options.appState.containsMessageStartingWithI18nKey(SAFE_MODE_KEY_PREFIX)) {
      return loc('oie.safe.mode.title', 'login');
    }
    if (this.options.appState.containsMessageWithI18nKey(UNLOCK_ACCOUNT_TERMINAL_KEY)) {
      return loc('account.unlock.unlocked.title', 'login');
    }
    if (this.options.appState.containsMessageWithI18nKey(DEVICE_ACTIVATED)) {
      return loc('oie.device.code.activated.success.title', 'login');
    }
    if (this.options.appState.containsMessageWithI18nKey(DEVICE_CODE_ERROR_KEYS)) {
      return loc('oie.device.code.activated.error.title', 'login');
    }
    if (this.options.appState.containsMessageWithI18nKey(REGISTRATION_NOT_ENABLED)) {
      return loc('oie.registration.form.title', 'login');
    }
  },

  showMessages() {
    const messagesObjs = this.options.appState.get('messages');
    let description;
    if (this.options.appState.containsMessageWithI18nKey(OPERATION_CANCELED_ON_OTHER_DEVICE_KEY)) {
      description = loc('oie.consent.enduser.deny.description', 'login');
    } else if (this.options.appState.containsMessageWithI18nKey(RETURN_TO_ORIGINAL_TAB_KEY)) {
      description = loc('oie.consent.enduser.email.allow.description', 'login');
    }
    if (description && Array.isArray(messagesObjs?.value)) {
      messagesObjs.value.push({ message: `${description}` });
    }

    if (messagesObjs && Array.isArray(messagesObjs.value)) {
      this.add('<div class="ion-messages-container"></div>', '.o-form-error-container');

      messagesObjs.value
        .forEach(messagesObj => {
          const msg = messagesObj.message;
          if (messagesObj.class === 'ERROR' || messagesObj.i18n?.key === RETURN_LINK_EXPIRED_KEY) {
            this.add(createCallout({
              content: msg,
              type: 'error',
            }), {
              selector: '.o-form-error-container',
              prepend: true,
            });
          } else {
            this.add(`<p>${msg}</p>`, '.ion-messages-container');
          }
        });
    }
  },

});

const Footer = BaseFooter.extend({
  links: function() {
    if (this.options.appState.containsMessageWithI18nKey(GET_BACK_TO_SIGN_LINK_FLOWS)) {
      return getBackToSignInLink(this.options.settings);
    }
    if (this.options.appState.containsMessageStartingWithI18nKey(SAFE_MODE_KEY_PREFIX)) {
      return getSkipSetupLink(this.options.appState);
    }
    if (this.options.appState.containsMessageWithI18nKey(DEVICE_CODE_ERROR_KEYS)) {
      return getReloadPageButtonLink();
    }
  }
});

export default BaseView.extend({
  initialize() {
    BaseView.prototype.initialize.apply(this, arguments);
    if (this.options.appState.containsMessageWithI18nKey(EMAIL_AUTHENTICATOR_TERMINAL_KEYS)) {
      this.Header = EmailAuthenticatorHeader;
    }
  },
  Body,
  Footer
});
