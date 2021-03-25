import { loc, createCallout } from 'okta';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';
import { BaseForm, BaseView, createIdpButtons, createCustomButtons } from '../internals';
import IdentifierFooter from '../components/IdentifierFooter';
import signInWithIdps from './signin/SignInWithIdps';
import customButtonsView from './signin/CustomButtons';
import signInWithDeviceOption from './signin/SignInWithDeviceOption';

const Body = BaseForm.extend({

  title() {
    return loc('primaryauth.title', 'login');
  },

  save() {
    return loc('oform.next', 'login');
  },

  render() {
    BaseForm.prototype.render.apply(this, arguments);

    // Launch Device Authenticator
    if (this.options.appState.hasRemediationObject(RemediationForms.LAUNCH_AUTHENTICATOR)) {
      this.add(signInWithDeviceOption, '.o-form-fieldset-container', false, true, { isRequired: false });
    }

    // This IdentifierView has been reused for the case when there is no `identify` remediation form
    // but only `redirect-idp` forms. At that case, no UI Schema.
    const hasUISchemas = this.getUISchema().length > 0;

    // add external idps buttons
    const idpButtons = createIdpButtons(this.options.appState.get('remediations'));
    if (Array.isArray(idpButtons) && idpButtons.length) {
      this.add(signInWithIdps, {
        selector: '.o-form-button-bar',
        options: {
          idpButtons,
          addSeparateLine: hasUISchemas,
        }
      });
    }

    const customButtons = createCustomButtons(this.options.settings);
    if (Array.isArray(customButtons) && customButtons.length) {
      this.add(customButtonsView, {
        selector: '.o-form-button-bar',
        options: {
          customButtons,
          addSeparateLine: true,
        }
      });
    }

    if (!hasUISchemas) {
      this.$el.find('.button-primary').hide();
    }
  },
  showMessages() {
    /**
     * Renders a warning callout for unknown user flow
     * Note: Anytime we get back `messages` object along with identify view
     * we would render it as a warning callout
     * */
    const messagesObj = this.options.appState.get('messages');
    if (messagesObj?.value.length
        && this.options.appState.get('currentFormName') === 'identify') {
      const content = messagesObj.value[0].message;
      const messageCallout = createCallout({
        content: content,
        type: 'warning',
      });
      this.add(messageCallout, '.o-form-error-container');
    }
  },
});

export default BaseView.extend({
  Body,
  Footer: IdentifierFooter,

  postRender() {
    BaseView.prototype.postRender.apply(this, arguments);

    // If user enterted identifier is not found, API sends back a message with a link to sign up
    // This is the click handler for that link
    const appState = this.options.appState;
    this.$el.find('.js-sign-up').click(function() {
      appState.trigger('invokeAction', RemediationForms.SELECT_ENROLL_PROFILE);
      return false;
    });
  },
});
