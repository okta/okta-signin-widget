import { loc } from 'okta';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import BaseFooter from '../internals/BaseFooter';
import signInWithIdps from './signin/SignInWithIdps';
import signInWithDeviceOption from './signin/SignInWithDeviceOption';
import { createIdpButtons } from '../internals/FormInputFactory';

const Body = BaseForm.extend({

  title () {
    return loc('primaryauth.title', 'login');
  },
  save: loc('oform.next', 'login'),
  render () {
    BaseForm.prototype.render.apply(this, arguments);
    if (this.options.appState.hasRemediationObject(RemediationForms.LAUNCH_AUTHENTICATOR)) {
      this.add(signInWithDeviceOption, '.o-form-fieldset-container', false, true);
    }
    //add idps
    const idpButtons = createIdpButtons(this.options.appState.get('remediations'));
    if (Array.isArray(idpButtons) && idpButtons.length) {
      this.add(signInWithIdps, {
        selector: '.o-form-button-bar',
        options: {
          idpButtons,
        }
      });
    }
    if (this.options.appState.get('currentFormName') !== 'identify') {
      this.$el.find('.button-primary').hide();
      this.$el.find('.separation-line').hide();
    }
  }
});

const Footer = BaseFooter.extend({
  links () {

    let helpLinkHref;
    if (this.options.settings.get('helpLinks.help') ) {
      helpLinkHref = this.options.settings.get('helpLinks.help');
    } else {
      const baseUrl = this.options.settings.get('baseUrl');
      helpLinkHref = baseUrl + '/help/login';
    }

    const links = [
      {
        'name': 'help',
        'label': loc('oie.needhelp', 'login'),
        'href': helpLinkHref,
      },
    ];
    if (this.options.appState.hasRemediationObject(RemediationForms.SELECT_ENROLL_PROFILE)) {
      links.push({
        'type': 'link',
        'label': loc('signup', 'login'),
        'name': 'enroll',
        'actionPath': RemediationForms.SELECT_ENROLL_PROFILE,
      });
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
      appState.trigger('invokeAction', RemediationForms.SELECT_ENROLL_PROFILE);
      return false;
    });
  },
});
