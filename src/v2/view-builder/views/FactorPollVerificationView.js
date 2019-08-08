import BaseView from '../internals//BaseView';
import BaseForm from '../internals//BaseForm';

const Body = BaseForm.extend({
  title () {
    return `Email link sent to (${this.options.appState.get('factorEmail')})`;
  },

  subtitle: 'To Finish signing in, click the link in your email.',

  noButtonBar: true,

  events: {
    'click .js-show-otp': 'showOTPView',
  },

  postRender () {
    this.add('Or <a href="#" class="js-show-otp">enter code</a>', {
      selector: '.okta-form-subtitle',
    });
  },

  showOTPView () {
    this.options.appState.trigger('showView', 'otp');
  }

});

export default BaseView.extend({
  Body,
});
