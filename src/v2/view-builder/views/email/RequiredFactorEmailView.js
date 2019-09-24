import { loc, View, createCallout, createButton, _ } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import email from '../shared/email';
import polling from '../shared/polling';
import BaseFactorView from '../shared/BaseFactorView';

const SHOW_RESEND_TIMEOUT = 60000;

const ResendView = View.extend(
  {
  // by default is hide after one minute polling
    className: 'hide resend-email-view',
    initialize () {
      this.add(createCallout({
        subtitle: 'Haven\'t received an email? To try again, click "Resend Email"',
        type: 'warning',
      }));
      this.add(createButton({
        className: 'button',
        title: 'Resend Email',
        click () {
          this.options.appState.trigger('invokeAction', 'factor.resend');
        }
      }));
    },

    postRender () {
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

    subtitle:
    'An email has been sent to you. Please click the link in your email or enter the code from that email below.',

    saveForm () {
      BaseForm.prototype.saveForm.apply(this, arguments);
      this.stopPolling();
      // TODO: abort ongoing request. (https://oktainc.atlassian.net/browse/OKTA-244134)
    },

    sendEmailLink () {
      // auto send email magic link after page has rendered.
      _.delay(_.bind(function () {
        this.options.appState.trigger('invokeAction', 'factor.send');
      }, this), 300);
    },

    postRender () {
      this.add(ResendView, {
        selector: '.okta-form-subtitle',
        prepend: true,
      });

      // auto send email magic link email on load
      this.sendEmailLink();

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
    if (this.options.appState.hasRemediationForm('select-factor')) {
      links.push({
        'type': 'link',
        'label': 'Switch Factor',
        'name': 'switchFactor',
        'formName': 'select-factor',
      });
    }
    return links;
  }
});

export default BaseFactorView.extend({
  Body,
  Footer
});
