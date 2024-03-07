import { _, loc, createCallout, createButton } from '@okta/courage';
import { BaseForm, BaseView } from '../internals';
import { INTERSTITIAL_REDIRECT_VIEW } from '../../ion/RemediationConstants';
import CustomAccessDeniedErrorMessage from '../views/shared/CustomAccessDeniedErrorMessage';
import Util from 'util/Util';
import { getHeader } from '../utils/AutoRedirectUtil';
const CUSTOM_ACCESS_DENIED_KEY = 'security.access_denied_custom_message';
const UNLOCK_USER_SUCCESS_MESSAGE = 'oie.selfservice.unlock_user.landing.to.app.success.message';

const Body = BaseForm.extend({
  /* eslint complexity: [2, 16] */
  title() {
    let titleString = loc('oie.success.text.signingIn', 'login');
    // For more info on the API response available in appState, see IdxResponseBuilder.java
    const app = this.options.appState.get('app');
    const user = this.options.appState.get('user');

    // OKTA-635926: add user gesture for ov enrollment on android
    if (Util.isAndroidOVEnrollment()) {
      titleString = loc('oie.success.text.signingIn.with.appName.android.ov.enrollment', 'login');
      return titleString;
    }

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
  showMessages() {
    if (this.isUnlockSuccess()) {
      const container = '.o-form-error-container';
      const text = loc('oie.selfservice.unlock_user.landing.to.app.signing.in.message', 'login');
      this.add(`<div class="ion-messages-container"><p>${text}</p></div>`, container);
      return;
    } else if (this.options.appState.containsMessageStartingWithI18nKey(CUSTOM_ACCESS_DENIED_KEY)) {
      const { message, links } = this.options.appState.get('messages').value.find(
        msg => msg.i18n.key === CUSTOM_ACCESS_DENIED_KEY);
      this.add(createCallout({
        type: 'error',
        content: new CustomAccessDeniedErrorMessage({ message, links })
      }));
      return;
    }
    BaseForm.prototype.showMessages.call(this);
  },
  isUnlockSuccess() {
    return this.options.appState.containsMessageWithI18nKey(UNLOCK_USER_SUCCESS_MESSAGE);
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
    if (Util.isAndroidOVEnrollment()) {
      const currentViewState = this.options.appState.getCurrentViewState();
      this.add(createButton({
        className: 'ul-button button button-wide button-primary hide-underline',
        title: loc('oktaVerify.open.button', 'login'),
        id: 'launch-enrollment-ov',
        click: () => {
          Util.redirectWithFormGet(currentViewState.href);
        }
      }));
    } else if (this.redirectView === INTERSTITIAL_REDIRECT_VIEW.DEFAULT) {
      this.add('<div class="okta-waiting-spinner"></div>');
    }
  }
});

export default BaseView.extend({
  Header: getHeader(),
  Body: Body
});
