import { BaseForm, BaseView } from '../../internals';
import Util from '../../../../util/Util';
import { loc } from 'okta';

// for BETA,
// redirect is needed for Apple SSO Extension to intercept the request, because
// - XHR request is not interceptable
// - form post is interceptable, but some app (Outlook) closes the app after
// We may have a different approach/UX for EA
const Body = BaseForm.extend({
  noButtonBar: true,

  className: 'ion-form device-challenge-poll',

  title () {
    return loc('deviceTrust.sso.redirectText', 'login');
  },

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);

    // TODO: OKTA-286547
    // this should be handle by the foundation, not on the view level
    const method = this.options.appState.get('remediations')
      .filter(v => v.name === this.options.appState.get('currentFormName'))[0].method || '';
    if (method.toLowerCase() === 'get') {
      Util.redirectWithFormGet(this.options.currentViewState.href);
    } else {
      this.listenTo(this.model, 'error', () => {
        this.$('.spinner').hide();
      });
      this.add('<div class="spinner"></div>');
      this.options.appState.trigger('saveForm', this.model);
    }
  }
});

export default BaseView.extend({
  Body,
  Header: null,
});
