import { View, createButton, loc } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { FORMS } from '../../../ion/RemediationConstants';
import { BaseForm, BaseView } from '../../internals';
import IdentifierFooter from '../../components/IdentifierFooter';

const SignInWithNfcOption = View.extend({
  className: 'sign-in-with-nfc-option',
  template: hbs`
    <div class="nfc-container">
      <div class="signin-with-nfc-description"></div>
    </div>
  `,

  initialize() {
    const appState = this.options.appState;

    this.add(createButton({
      className: 'button',
      title: loc('oie.nfc_pin.launch.button', 'login'),
      click() {
        if (this.model.get('identifier')) {
          this.options.settings.set('identifier', encodeURIComponent(this.model.get('identifier')));
        }

        appState.trigger('invokeAction', FORMS.LAUNCH_NFC_AUTHENTICATOR, {
          'rememberMe': this.model.get('rememberMe'),
        });
      }
    }), '.nfc-container');
  },

  postRender() {
    const descContainer = this.$el.find('.signin-with-nfc-description');
    descContainer.text(loc('oie.nfc_pin.authenticator.description', 'login'));
  }
});

const Body = BaseForm.extend({
  title() {
    return loc('primaryauth.title', 'login');
  },

  noButtonBar: true,

  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.add(
      SignInWithNfcOption,
      {
        selector: '.o-form-fieldset-container',
        bubble: false,
        prepend: true,
        options: { isRequired: true }
      }
    );
  },
});

const Footer = IdentifierFooter.extend({
  hasBackToSignInLink: false
});

export default BaseView.extend({
  Body,
  Footer,
});
