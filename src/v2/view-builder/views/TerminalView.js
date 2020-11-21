import { createCallout, loc } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import BaseFooter from '../internals/BaseFooter';
import { getBackToSignInLink, getSkipSetupLink } from '../utils/LinksUtil';

const RETURN_LINK_EXPIRED_KEY = 'idx.return.link.expired';
const SAFE_MODE_KEY = 'idx.error.server.safe.mode';

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
    if (this.options.appState.containsMessageStartingWithI18nKey(SAFE_MODE_KEY)) {
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
    if (this.options.appState.containsMessageStartingWithI18nKey(SAFE_MODE_KEY)) {
      return getSkipSetupLink(this.options.appState);
    }
  }
});

export default BaseView.extend({
  Body,
  Footer
});
