import { View, createButton, loc } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Util from '../../../../util/Util';
import { FORMS } from '../../../ion/RemediationConstants';
import { appendLoginHint } from '../../utils/ChallengeViewUtil';
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
    const nfcRemediation = appState.hasRemediationObject(FORMS.LAUNCH_NFC_AUTHENTICATOR);
    const deviceChallenge = nfcRemediation?.relatesTo?.value;

    this.add(createButton({
      className: 'button',
      title: loc('oie.nfc_pin.launch.button', 'login'),
      click() {
        if (this.model.get('identifier')) {
          this.options.settings.set('identifier', encodeURIComponent(this.model.get('identifier')));
        }

        Util.callAfterTimeout(() => {
          appState.trigger('invokeAction', FORMS.LAUNCH_NFC_AUTHENTICATOR, {
            'rememberMe': this.model.get('rememberMe'),
          });
        }, 0);
      }
    }), '.nfc-container');
  },

  postRender() {
    const appLabel = this.options.appState.attributes?.app?.label;
    const resourceLabel = appLabel
      ? loc('oktaVerify.appDescription', 'login', [appLabel])
      : loc('oktaVerify.description', 'login');
    const descContainer = this.$el.find('.signin-with-nfc-description');
    descContainer.text(resourceLabel);
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
