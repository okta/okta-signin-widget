import { createCallout, loc } from 'okta';
import { BaseForm, BaseFooter, BaseView } from '../internals';
import { getBackToSignInLink, getSkipSetupLink, getReloadPageButtonLink } from '../utils/LinksUtil';
import EmailAuthenticatorHeader from '../components/EmailAuthenticatorHeader';

const RETURN_LINK_EXPIRED_KEY = 'idx.return.link.expired';
const SAFE_MODE_KEY_PREFIX = 'idx.error.server.safe.mode';
const UNLOCK_ACCOUNT_TERMINAL_KEY = 'oie.selfservice.unlock_user.success.message';
const UNLOCK_ACCOUNT_FAILED_PERMISSIONS = 'oie.selfservice.unlock_user.challenge.failed.permissions';
const RESET_PASSWORD_NOT_ALLOWED = 'oie.selfservice.reset.password.not.allowed';
const RETURN_TO_ORIGINAL_TAB_KEY = 'idx.return.to.original.tab';
const OPERATION_CANCELED_ON_OTHER_DEVICE_KEY = 'idx.operation.cancelled.on.other.device';
const OPERATION_CANCELED_BY_USER_KEY = 'idx.operation.cancelled.by.user';
const DEVICE_ACTIVATED = 'idx.device.activated';
const DEVICE_NOT_ACTIVATED_CONSENT_DENIED = 'idx.device.not.activated.consent.denied';
const DEVICE_NOT_ACTIVATED_INTERNAL_ERROR = 'idx.device.not.activated.internal.error';
const FLOW_CONTINUE_IN_NEW_TAB = 'idx.transferred.to.new.tab';
const EMAIL_LINK_OUT_OF_DATE = 'idx.return.stale';
const EMAIL_LINK_CANT_BE_PROCESSED = 'idx.return.error';
const EMAIL_VERIFICATION_REQUIRED = 'idx.email.verification.required';

const EMAIL_ACTIVATION_EMAIL_EXPIRE = 'idx.expired.activation.token';
const EMAIL_ACTIVATION_EMAIL_INVALID = 'idx.missing.activation.token';
const EMAIL_ACTIVATION_EMAIL_SUBMITTED = 'idx.request.activation.email';
const EMAIL_ACTIVATION_EMAIL_SUSPENDED = 'idx.activating.inactive.user';
 

export const REGISTRATION_NOT_ENABLED = 'oie.registration.is.not.enabled';
export const FORGOT_PASSWORD_NOT_ENABLED = 'oie.forgot.password.is.not.enabled';

const EMAIL_AUTHENTICATOR_TERMINAL_KEYS = [
  FLOW_CONTINUE_IN_NEW_TAB,
  EMAIL_LINK_OUT_OF_DATE,
  EMAIL_LINK_CANT_BE_PROCESSED,
  EMAIL_VERIFICATION_REQUIRED,
  RETURN_TO_ORIGINAL_TAB_KEY,
  RETURN_LINK_EXPIRED_KEY,
  OPERATION_CANCELED_ON_OTHER_DEVICE_KEY,
  OPERATION_CANCELED_BY_USER_KEY,
];

const DEVICE_CODE_ERROR_KEYS = [
  DEVICE_NOT_ACTIVATED_CONSENT_DENIED,
  DEVICE_NOT_ACTIVATED_INTERNAL_ERROR
];

const DEVICE_CODE_FLOW_TERMINAL_KEYS = [
  DEVICE_ACTIVATED,
  ...DEVICE_CODE_ERROR_KEYS
];

// These terminal views build their own links, basically they have cancel remediation in error response
// Or doesn't require a Back to Sign in link because the flow didn't start from login screen
const NO_BACKTOSIGNIN_LINK_VIEWS = [
  UNLOCK_ACCOUNT_TERMINAL_KEY,
  RETURN_TO_ORIGINAL_TAB_KEY,
  FLOW_CONTINUE_IN_NEW_TAB,
  OPERATION_CANCELED_ON_OTHER_DEVICE_KEY,
  ...DEVICE_CODE_FLOW_TERMINAL_KEYS,
  UNLOCK_ACCOUNT_FAILED_PERMISSIONS,
  RESET_PASSWORD_NOT_ALLOWED,
];

// Key map to transform terminal view titles {ApiKey : WidgetKey}  
const terminalViewTitles = {
  [RETURN_LINK_EXPIRED_KEY] : 'oie.email.return.link.expired.title',
  [UNLOCK_ACCOUNT_TERMINAL_KEY] : 'account.unlock.unlocked.title',
  [DEVICE_ACTIVATED] : 'device.code.activated.success.title',
  [REGISTRATION_NOT_ENABLED] : 'oie.registration.form.title',
  [FORGOT_PASSWORD_NOT_ENABLED] : 'password.reset.title.generic',
  [EMAIL_ACTIVATION_EMAIL_EXPIRE] : 'oie.activation.request.email.title.expire',
  [EMAIL_ACTIVATION_EMAIL_SUBMITTED] : 'oie.activation.request.email.title.submitted',
  [EMAIL_ACTIVATION_EMAIL_SUSPENDED] : 'oie.activation.request.email.title.suspended',
  [EMAIL_ACTIVATION_EMAIL_INVALID] : 'oie.activation.request.email.title.invalid',
  [DEVICE_NOT_ACTIVATED_CONSENT_DENIED] : 'device.code.activated.error.title',
  [DEVICE_NOT_ACTIVATED_INTERNAL_ERROR] : 'device.code.activated.error.title',
  [RETURN_TO_ORIGINAL_TAB_KEY] : 'oie.consent.enduser.email.allow.title',
};

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
    return this.getTerminalViewTitle();
  },

  getTerminalViewTitle() {
    if (this.options.appState.containsMessageStartingWithI18nKey(SAFE_MODE_KEY_PREFIX)) {
      return loc('oie.safe.mode.title', 'login');
    }

    const apiKeys = Object.keys(terminalViewTitles);
    const key = apiKeys.find(key => this.options.appState.containsMessageWithI18nKey(key));
    if (key) {
      return loc(terminalViewTitles[key], 'login');
    }
  },

  showMessages() {
    const messagesObjs = this.options.appState.get('messages');
    let description;
    if (this.options.appState.containsMessageWithI18nKey(OPERATION_CANCELED_ON_OTHER_DEVICE_KEY)) {
      description = loc('idx.operation.cancelled.on.other.device', 'login');
      messagesObjs.value.push({ message: loc('oie.consent.enduser.deny.description', 'login') });
    } else if (this.options.appState.containsMessageWithI18nKey(RETURN_TO_ORIGINAL_TAB_KEY)) {
      description = loc('oie.consent.enduser.email.allow.description', 'login');
      messagesObjs.value.push({ message: loc('oie.return.to.original.tab', 'login')});
    } else if (this.options.appState.containsMessageWithI18nKey('tooManyRequests')) {
      description = loc('oie.tooManyRequests', 'login');
    }

    if (description && Array.isArray(messagesObjs?.value)) {
      messagesObjs.value[0].message = description;
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
  // All terminal views should have Back to sign in link either widget configured or server configured.
  links: function() {
    if (this.options.appState.containsMessageStartingWithI18nKey(SAFE_MODE_KEY_PREFIX)) {
      return getSkipSetupLink(this.options.appState);
    }
    if (this.options.appState.containsMessageWithI18nKey(DEVICE_CODE_ERROR_KEYS)) {
      return getReloadPageButtonLink();
    }
    // If cancel object exists idx response then view would take care of rendering back to sign in link
    if (!this.options.appState.hasActionObject('cancel') &&
        !this.options.appState.containsMessageWithI18nKey(NO_BACKTOSIGNIN_LINK_VIEWS)) {
      return getBackToSignInLink(this.options.settings);
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
