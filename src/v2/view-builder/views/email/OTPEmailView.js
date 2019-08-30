import { loc, View, createCallout, createButton, _ } from 'okta';
import BaseForm from '../../internals/BaseForm';
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

      // `clearfix` has different style in SIW than Courage
      // and it hide anything from `:before` node hence remove
      // `clearfix` as workaround rather change existing style
      // just to be extreme safe.
      this.$el.find('.infobox').removeClass('clearfix');
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

    subtitle: 'To finish signing in, click the link in your email or enter code below.',

    saveForm () {
      BaseForm.prototype.saveForm.apply(this, arguments);
      this.stopPolling();
      // TODO: abort ongoing request. (https://oktainc.atlassian.net/browse/OKTA-244134)
    },

    postRender () {
      this.add(ResendView, {
        selector: '.okta-form-subtitle',
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

export default BaseFactorView.extend({
  Body,
});
