import { BaseForm, BaseView } from '../../internals';
import { loc } from '@okta/courage';

// for BETA,
// redirect is needed for Apple SSO Extension to intercept the request, because
// - XHR request is not interceptable
// - form post is interceptable, but some app (Outlook) closes the app after
// We may have a different approach/UX for EA
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
    this.add('<div class="spinner"></div>');

    const isGetMethod = this.options.currentViewState?.method?.toLowerCase() === 'get';
    this.model.set('useRedirect', isGetMethod);
    this.trigger('save', this.model);
  }
});

export default BaseView.extend({
  Body,
});
