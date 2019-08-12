import { View, createButton, createCallout, _ } from 'okta';
import BaseView from '../internals//BaseView';
import BaseForm from '../internals//BaseForm';

const SHOW_RESEND_TIMEOUT = 60000;

const ResendView = View.extend({
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
});

const Body = BaseForm.extend({
  title () {
    return `Email link (${this.options.appState.get('factorEmail')})`;
  },

  subtitle: 'To finish signing in, click the link in your email.',

  noButtonBar: true,

  events: {
    'click .js-show-otp': 'showOTPView',
  },

  postRender () {
    this.add(ResendView, {
      selector: '.okta-form-subtitle',
      prepend: true,
    });

    this.add('Or <a href="#" class="js-show-otp">enter code</a>', {
      selector: '.okta-form-subtitle',
    });
  },

  showOTPView () {
    this.options.appState.set('currentFormName', 'otp');
  }

});

export default BaseView.extend({
  Body,
});
