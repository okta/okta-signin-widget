import { createCallout, loc } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import BaseFooter from '../internals/BaseFooter';
import BaseHeader from '../internals/BaseHeader';
import HeaderBeacon from '../components/HeaderBeacon';
import { getBackToSignInLink, getSkipSetupLink } from '../utils/LinksUtil';
import { getIconClassNameForBeacon } from '../utils/AuthenticatorUtil';
import { OKTA_STATE_TOKEN_KEY } from '../../view-builder/utils/Constants';

const RETURN_LINK_EXPIRED_KEY = 'idx.return.link.expired';
const SAFE_MODE_KEY_PREFIX = 'idx.error.server.safe.mode';

const EMAIL_AUTHENTICATOR_TERMINAL_KEYS = [
  'idx.transferred.to.new.tab',
  'idx.return.to.original.tab',
  RETURN_LINK_EXPIRED_KEY,
  'idx.return.stale',
  'idx.return.error',
  'idx.email.verification.required'
];

const EMAIL_AUTHENTICATOR_TYPE = 'email';

const HeaderBeaconTerminal = HeaderBeacon.extend({
  getBeaconClassName: function () {
    return this.options.appState.containsMessageWithI18nKey(EMAIL_AUTHENTICATOR_TERMINAL_KEYS)
      ? getIconClassNameForBeacon(EMAIL_AUTHENTICATOR_TYPE)
      : HeaderBeacon.prototype.getBeaconClassName.apply(this, arguments);
  }
});

const Body = BaseForm.extend({
  noButtonBar: true,

  postRender () {
    BaseForm.prototype.postRender.apply(this, arguments);
    this.$el.addClass('terminal-state');
  },

  title () {
    if (this.options.appState.containsMessageWithI18nKey(RETURN_LINK_EXPIRED_KEY)) {
      return loc('oie.email.return.link.expired.title', 'login');
    }
    if (this.options.appState.containsMessageStartingWithI18nKey(SAFE_MODE_KEY_PREFIX)) {
      return loc('oie.safe.mode.title', 'login');
    }
    return BaseForm.prototype.title.apply(this, arguments);
  },

  showMessages () {
    const messagesObjs = this.options.appState.get('messages');
    if (messagesObjs && Array.isArray(messagesObjs.value)) {
      this.add('<div class="ion-messages-container"></div>', '.o-form-error-container');
      messagesObjs.value
        .forEach(messagesObj => {
          const msg = messagesObj.message;
          if (messagesObj.class === 'ERROR' || messagesObj.i18n?.key === RETURN_LINK_EXPIRED_KEY) {
            this.add(createCallout({
              content: msg,
              type: 'error',
            }), '.o-form-error-container');
          } else {
            this.add(`<p>${msg}</p>`, '.ion-messages-container');
          }
        });
    }
  },

});

const Footer = BaseFooter.extend({
  links: function () {
    if (this.options.appState.containsMessageWithI18nKey(RETURN_LINK_EXPIRED_KEY)) {
      return getBackToSignInLink(this.options.settings);
    }
    if (this.options.appState.containsMessageStartingWithI18nKey(SAFE_MODE_KEY_PREFIX)) {
      return getSkipSetupLink(this.options.appState);
    }
  }
});

export default BaseView.extend({
  Header: BaseHeader.extend({
    HeaderBeacon: HeaderBeaconTerminal,
  }),
  Body,
  Footer,
  postRender () {
    BaseForm.prototype.postRender.apply(this, arguments);
    sessionStorage.removeItem(OKTA_STATE_TOKEN_KEY);
  }
});
