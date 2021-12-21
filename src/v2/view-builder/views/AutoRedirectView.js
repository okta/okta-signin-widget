import { _, loc } from 'okta';
import { BaseForm, BaseView } from '../internals';
import { INTERSTITIAL_REDIRECT_VIEW } from '../../ion/RemediationConstants';

const Body = BaseForm.extend({
  title() {
    let titleString = loc('oie.success.text.signingIn', 'login');
    // For more info on the API response available in appState, see IdxResponseBuilder.java
    const app = this.options.appState.get('app');
    const user = this.options.appState.get('user');

    // If the option is not set, we treat that as being the case where we don't render the spinner.
    // This is to account for the customer hosted scenario, because by default okta-core will pass in
    // the correct value as set by the option in the Admin UI (which by default is "DEFAULT").
    if (!this.redirectView || this.redirectView === INTERSTITIAL_REDIRECT_VIEW.NONE) {
      titleString = loc('oie.success.text.signingIn.with.ellipsis', 'login');
      return titleString;
    }

    if (_.isEmpty(app)) {
      return titleString;
    }

    const { label: appInstanceName, name: appDisplayName } = app;
    const { identifier: userEmail } = user || {};

    const appName = appInstanceName ? appInstanceName : appDisplayName;

    if (appName && userEmail && !this.settings.get('features.showIdentifier')) {
      titleString = loc('oie.success.text.signingIn.with.appName.and.identifier', 'login', [appName, userEmail]);
    } else if (appName) {
      titleString = loc('oie.success.text.signingIn.with.appName', 'login', [appName]);
    }

    return titleString;
  },
  noButtonBar: true,
  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.redirectView = this.settings.get('interstitialBeforeLoginRedirect');
    this.model.set('useRedirect', true);
    this.trigger('save', this.model);
  },

  render() {
    BaseForm.prototype.render.apply(this, arguments);
    if (this.redirectView === INTERSTITIAL_REDIRECT_VIEW.DEFAULT) {
      this.add('<div class="okta-waiting-spinner"></div>');
    }
  }
});

export default BaseView.extend({
  Body
});
