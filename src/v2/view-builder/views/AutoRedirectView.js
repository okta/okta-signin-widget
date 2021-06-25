import { _, loc } from 'okta';
import { BaseForm, BaseView } from '../internals';

const Body = BaseForm.extend({
  title() {
    let titleString = loc('oie.success.text.signingIn', 'login');
    // For more info on the API response available in appState, see IdxResponseBuilder.java
    const app = this.options.appState.get('app');
    const user = this.options.appState.get('user');

    if (!this.redirectView || this.redirectView === 'Simplified') {
      titleString = loc('oie.success.text.signingIn.with.ellipsis', 'login');
      return titleString;
    }

    if (_.isEmpty(app)) {
      return titleString;
    }

    const { label: appInstanceName, name: appDisplayName } = app;
    const { identifier: userEmail } = user || {};

    const appName = appInstanceName ? appInstanceName : appDisplayName;

    if (appName && userEmail) {
      titleString = loc('oie.success.text.signingIn.with.appName.and.identifier', 'login', [appName, userEmail]);
    } else if (appName) {
      titleString = loc('oie.success.text.signingIn.with.appName', 'login', [appName]);
    }

    return titleString;
  },
  noButtonBar: true,
  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.redirectView = this.settings.get('features.showRedirectView');
    this.model.set('useRedirect', true);
    this.trigger('save', this.model);
  },

  render() {
    BaseForm.prototype.render.apply(this, arguments);
    if (this.redirectView === 'Default') {
      this.add('<div class="okta-waiting-spinner"></div>');
    }
  }
});

export default BaseView.extend({
  Body
});
