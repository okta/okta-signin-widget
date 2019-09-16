import { loc } from 'okta';
import BaseView from '../internals//BaseView';
import BaseForm from '../internals//BaseForm';
import BaseFooter from '../internals//BaseFooter';

const Body = BaseForm.extend({
  title: loc('primaryauth.title'),
  save: loc('oform.next', 'login'),
});

const Footer = BaseFooter.extend({
  links () {
    const baseUrl = this.options.settings.get('baseUrl');
    let href = baseUrl + '/help/login';
    if (this.options.settings.get('helpLinks.help') ) {
      href = this.options.settings.get('helpLinks.help');
    }
    const signupLinkObj = {
      'type': 'link',
      'label': 'Sign up',
      'name': 'enroll',
      'actionPath': 'select-enroll-profile',
    };
    const links = [
      {
        'name': 'help',
        'label': 'Need help signing in?',
        'href': href,
      },
    ];
    if (this.options.appState.hasRemediationForm('select-enroll-profile')) {
      links.push(signupLinkObj);
    }
    return links;
  }
});

export default BaseView.extend({
  initialize (options) {
    // add callout for messages
    this.messages = options.messages;
    if (this.messages && this.messages.value.length) {
      this.showMessageCallout(options.messages.value[0].message, 'warning');
    }
    BaseView.prototype.initialize.call(this, arguments);
  },
  postRender () {
    // If user enterted identifier is not found, API sends back a message with a link to sign up
    // This is the click handler for that link
    if (this.messages && this.messages.value.length) {
      const appState = this.options.appState;
      this.$el.find('.js-sign-up').click(function () {
        appState.trigger('invokeAction', 'select-enroll-profile');
        return false;
      });
    }
  },
  Body,
  Footer,
});
