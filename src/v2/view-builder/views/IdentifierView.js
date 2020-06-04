import { loc } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import BaseFooter from '../internals/BaseFooter';
import signInWithIdps from './signin/SignInWithIdps';
import signInWithDeviceOption from './signin/SignInWithDeviceOption';

const Body = BaseForm.extend({

  title () {
    return loc('primaryauth.title', 'login');
  },
  save: loc('oform.next', 'login'),
  render () {
    BaseForm.prototype.render.apply(this, arguments);
    if (this.options.appState.hasRemediationObject('launch-authenticator')) {
      this.add(signInWithDeviceOption, '.o-form-fieldset-container', false, true);
    }
    //add idps
    if (this.options.appState.hasRemediationObject('redirect')) {
      this.add(signInWithIdps, '.o-form-button-bar');
    }
    if (this.options.appState.get('currentFormName') !== 'identify') {
      this.$el.find('.button-primary').hide();
      this.$el.find('.separation-line').hide();
    }
  }
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
      'label': loc('signup', 'login'),
      'name': 'enroll',
      'actionPath': 'select-enroll-profile',
    };
    const links = [
      {
        'name': 'help',
        'label': loc('needhelp', 'login'),
        'href': href,
      },
    ];
    if (this.options.appState.hasRemediationObject('select-enroll-profile')) {
      links.push(signupLinkObj);
    }
    return links;
  }
});

export default BaseView.extend({
  Body,
  Footer,

  postRender () {
    BaseView.prototype.postRender.apply(this, arguments);

    // If user enterted identifier is not found, API sends back a message with a link to sign up
    // This is the click handler for that link
    const appState = this.options.appState;
    this.$el.find('.js-sign-up').click(function () {
      appState.trigger('invokeAction', 'select-enroll-profile');
      return false;
    });
  },
});
