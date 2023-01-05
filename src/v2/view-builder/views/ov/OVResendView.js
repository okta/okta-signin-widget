import { createCallout } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import BaseResendView from '../shared/BaseResendView';

export default BaseResendView.extend({
  //only show after certain threshold of polling
  className: 'hide resend-ov-link-view',
  events: {
    'click a.resend-link' : 'handelResendLink'
  },

  initialize() {
    const selectedChannel = this.options.appState.get('currentAuthenticator').contextualData.selectedChannel;
    this.add(createCallout({
      content: selectedChannel === 'email' ?
        hbs `{{{i18n code="oie.enroll.okta_verify.email.notReceived" bundle="login"}}}`:
        hbs `{{{i18n code="oie.enroll.okta_verify.sms.notReceived" bundle="login"}}}`,
      type: 'warning',
    }));
  },

  handelResendLink() {
    this.options.appState.trigger('invokeAction', 'currentAuthenticator-resend');
    //hide warning, but reinitiate to show warning again after some threshold of polling
    this.$el.addClass('hide');
    this.showCalloutAfterTimeout();
  },
});
