import { loc, View, createCallout, _ } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import email from '../shared/email';
import polling from '../shared/polling';
import BaseFactorView from '../shared/BaseFactorView';

const SHOW_RESEND_TIMEOUT = 60000;

const ResendView = View.extend(
  {
    //only show after certain threshold of polling
    className: 'hide resend-email-view',
    events: {
      'click a.resend-link' : 'handelResendLink'
    },

    initialize () {
      this.add(createCallout({
        content: 'Haven\'t received an email? <a class=\'resend-link\'>Send again</a>',
        type: 'warning',
      }));
    },

    handelResendLink () {
      this.options.appState.trigger('invokeAction', 'factor-resend');
      //hide warning, but reinitiate to show warning again after some threshold of polling
      this.$el.addClass('hide');
      this.showCalloutWithDelay();
    },

    postRender () {
      this.showCalloutWithDelay();
    },

    showCalloutWithDelay () {
      this.showMeTimeout = _.delay(() => {
        this.$el.removeClass('hide');
      }, SHOW_RESEND_TIMEOUT);
    },

    remove () {
      View.prototype.remove.apply(this, arguments);
      clearTimeout(this.showMeTimeout);
    }
  },
);

const Body = BaseForm.extend(Object.assign(
  {
    save: loc('mfa.challenge.verify', 'login'),
    subtitle:'A verification code was sent to your email.',
    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      // polling has been killed when click save to avoid race conditions hence resume if save failed.
      this.listenTo(this.options.model, 'error', this.startPolling.bind(this));
    },

    saveForm () {
      BaseForm.prototype.saveForm.apply(this, arguments);
      this.stopPolling();
      // TODO: abort ongoing request. (https://oktainc.atlassian.net/browse/OKTA-244134)
    },

    postRender () {
      //Override message in form subtitle so that we can add html content to it. Courage form subtitle doesn't
      //support html tags.
      this.$el.find('.okta-form-subtitle').empty();
      this.add(`<div>A verification code was sent to <span class='strong'>
        ${this.options.appState.get('factorProfile').email}</span>.
        Check your email and enter the code below.</div>`, '.okta-form-subtitle');

      this.add(ResendView, {
        selector: '.o-form-error-container',
        prepend: true,
      });

      this.startPolling();

    },

    remove () {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopPolling();
    }
  },

  email,
  polling,
));

const Footer = BaseFooter.extend({
  links: function () {
    var links = [
      // email recovery not supported to LEA
    ];
    // check if we have a select-factor form in remediation, if so add a link
    if (this.options.appState.hasRemediationForm('select-factor-authenticate')) {
      links.push({
        'type': 'link',
        'label': 'Switch Factor',
        'name': 'switchFactor',
        'formName': 'select-factor-authenticate',
      });
    }
    return links;
  }
});

export default BaseFactorView.extend({
  Body,
  Footer
});
