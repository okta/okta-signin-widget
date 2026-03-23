import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { BaseForm } from '../../internals';
import { loc, View, createCallout, _ } from '@okta/courage';
import { getBiometricsErrorOptions } from '../../utils/ChallengeViewUtil';
import {
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE,
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP,
} from '../../utils/Constants';

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

  showMessages(options) {
    if (options instanceof View) {
      BaseForm.prototype.showMessages.call(this, options);
      return;
    }

    if (this.options.appState.containsMessageWithI18nKey([
      OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE,
      OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP,
    ])) {
      const messages = this.options.appState.get('messages');
      const biometricsOptions = getBiometricsErrorOptions(messages, true);
      if (!_.isEmpty(biometricsOptions)) {
        options = createCallout(biometricsOptions);
      }
    }

    BaseForm.prototype.showMessages.call(this, options);
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
