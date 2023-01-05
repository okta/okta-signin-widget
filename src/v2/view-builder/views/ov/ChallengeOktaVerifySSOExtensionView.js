import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { BaseForm } from '../../internals';
import { loc, createCallout, _ } from '@okta/courage';
import { getBiometricsErrorOptions } from '../../utils/ChallengeViewUtil';

// for EA,
// redirect is needed for Apple SSO Extension to intercept the request, because
// - XHR request is not interceptable
// - form post is interceptable, but some app (Outlook) closes the app after
// We may have a different approach/UX for GA
const Body = BaseForm.extend({
  noButtonBar: true,

  className: 'ion-form device-challenge-poll',

  title() {
    return loc('deviceTrust.sso.redirectText', 'login');
  },

  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);

    this.listenTo(this.model, 'error', () => {
      this.$('.spinner').hide();
    });
    this.add('<div class="credential-sso-extension"><div class="spinner"></div></div>');

    const isGetMethod = this.options.currentViewState?.method?.toLowerCase() === 'get';
    this.model.set('useRedirect', isGetMethod);
    this.trigger('save', this.model);
  },

  showCustomFormErrorCallout(error) {
    const options = getBiometricsErrorOptions(error, false);
    
    // If not biometrics error, just show the returned error message
    if (_.isEmpty(options)) {
      return false;
    }

    this.showMessages(createCallout(options));
    return true;
  },
});

export default BaseAuthenticatorView.extend({
  Body,
});
