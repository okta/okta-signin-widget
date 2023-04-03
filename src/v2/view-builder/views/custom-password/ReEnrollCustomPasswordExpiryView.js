import { createButton, loc, _ } from '@okta/courage';
import { BaseView, BaseForm } from '../../internals';
import Util from '../../../../util/Util';

const Body = BaseForm.extend({
  title() {
    return loc('password.expired.title.generic', 'login');
  },
  subtitle() {
    return loc('password.expired.custom.subtitle', 'login');
  },
  noSubmitButton: true,
  initialize() {
    const { customExpiredPasswordName, customExpiredPasswordURL } = this.options.currentViewState;
    this.add(createButton({
      className: 'button button-primary button-wide',
      title: _.partial(loc, 'password.expired.custom.submit', 'login', [customExpiredPasswordName]),
      click: () => {
        Util.redirect(customExpiredPasswordURL);
      },
    }));
  },
});

export default BaseView.extend({ Body });
