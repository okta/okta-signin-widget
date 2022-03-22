import { BaseForm, BaseView } from '../internals';
import { loc } from 'okta';
import BaseFooter from '../internals/BaseFooter';
import {getFactorPageCustomLink} from '../utils/LinksUtil';

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
    return loc('oie.select.authenticators.verify.subtitle', 'login');
  },
  isPasswordRecoveryFlow() {
    return this.options.appState.get('isPasswordRecovery');
  },
  noButtonBar: true,
});

export default BaseView.extend({
  Body,
  Footer: BaseFooter.extend({
    links() {
      return getFactorPageCustomLink(this.options.appState, this.options.settings);
    },
  }),
});
