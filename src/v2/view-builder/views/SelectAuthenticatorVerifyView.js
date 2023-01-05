import { BaseForm, BaseView } from '../internals';
import { createCallout, loc } from '@okta/courage';
import BaseFooter from '../internals/BaseFooter';
import {getFactorPageCustomLink} from '../utils/LinksUtil';

const UNLOCK_USER_SUCCESS_MESSAGE = 'oie.selfservice.unlock_user.landing.to.app.success.message';

export const Body = BaseForm.extend({
  title: function() {
    if (this.isPasswordRecoveryFlow())  {
      return loc('password.reset.title.generic', 'login');
    }
    return loc('oie.select.authenticators.verify.title', 'login');
  },
  subtitle: function() {
    if (this.isPasswordRecoveryFlow())  {
      return loc('oie.password.reset.verification', 'login');
    }
    if (this.isUnlockSuccess()) {
      const container = '.o-form-error-container';
      const text = loc('oie.select.authenticators.verify.subtitle', 'login');
      this.add(`<div class="ion-messages-container"><p>${text}</p></div>`, container);
      return;
    }
    return loc('oie.select.authenticators.verify.subtitle', 'login');
  },
  isPasswordRecoveryFlow() {
    return this.options.appState.get('isPasswordRecovery');
  },
  noButtonBar: true,
  showMessages() {
    if (this.isUnlockSuccess()) {
      let options = {};
      options.subtitle = loc('oie.selfservice.unlock_user.landing.to.app.success.message', 'login');
      options.type = 'success';
      options = createCallout(options);
      BaseForm.prototype.showMessages.call(this, options);
      return;
    }
    BaseForm.prototype.showMessages.call(this);
  },
  isUnlockSuccess() {
    return this.options.appState.containsMessageWithI18nKey(UNLOCK_USER_SUCCESS_MESSAGE);
  }
});

export default BaseView.extend({
  Body,
  Footer: BaseFooter.extend({
    links() {
      return getFactorPageCustomLink(this.options.appState, this.options.settings);
    },
  }),
});
