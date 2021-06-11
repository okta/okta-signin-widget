import { loc, createCallout } from 'okta';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';
import { BaseForm, BaseView, createIdpButtons, createCustomButtons } from '../internals';
import DeviceFingerprinting from '../utils/DeviceFingerprinting';
import IdentifierFooter from '../components/IdentifierFooter';
import Link from '../components/Link';
import signInWithIdps from './signin/SignInWithIdps';
import customButtonsView from './signin/CustomButtons';
import signInWithDeviceOption from './signin/SignInWithDeviceOption';
import { isCustomizedI18nKey } from '../../ion/i18nTransformer';
import { getForgotPasswordLink } from '../utils/LinksUtil';

const Body = BaseForm.extend({

  title() {
    return loc('primaryauth.title', 'login');
  },

  save() {
    return loc('oform.next', 'login');
  },

  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);

    if (this.getUISchema().find(schema => schema.name === 'credentials.passcode')) {
      this.save = loc('oie.primaryauth.submit', 'login');
    }
  },

  saveForm() {
    // Ideally this can be added to a "preSaveForm" handler - but keeping this here for now.
    if (!this.settings.get('features.deviceFingerprinting')) {
      BaseForm.prototype.saveForm.apply(this, arguments);
      return;
    }

    // Before the XHR is made for "identify", we'll generate this one-time use fingerprint via
    // a hidden-iframe (similar to authn/v1 flows)
    const fingerprintData = {
      oktaDomainUrl: this.settings.get('baseUrl'),
      element: this.$el,
    };

    DeviceFingerprinting.generateDeviceFingerprint(fingerprintData)
      .then(fingerprint => {
        this.options.appState.set('deviceFingerprint', fingerprint);
      })
      .catch(() => { /* Keep going even if device fingerprint fails */ })
      .finally(() => {
        BaseForm.prototype.saveForm.apply(this, arguments);
      });
  },

  render() {
    BaseForm.prototype.render.apply(this, arguments);

    // Launch Device Authenticator
    if (this.options.appState.hasRemediationObject(RemediationForms.LAUNCH_AUTHENTICATOR)) {
      this.add(signInWithDeviceOption, '.o-form-fieldset-container', false, true, { isRequired: false });
    }

    // add forgot password link and external idps buttons if needed
    const idpButtons = createIdpButtons(this.options.appState.get('remediations'));
    if (Array.isArray(idpButtons) && idpButtons.length) {
      // Add the forgot password link before the buttons for multiple IDPs
      this._addForgotPasswordView();
      this._addIdpView(idpButtons);
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
  /**
   * Update UI schemas for customization from .widgetrc.js or Admin Customization settings page.
   * @returns Array
   */
  getUISchema() {
    const schemas = BaseForm.prototype.getUISchema.apply(this, arguments);

    const { settings } = this.options;
    const identifierExplainLabeli18nKey = 'primaryauth.username.tooltip';
    const passwordExplainLabeli18nKey = 'primaryauth.password.tooltip';

    const newSchemas = schemas.map(schema => {
      let newSchema = { ...schema };

      if (schema.name === 'identifier' &&
        isCustomizedI18nKey(identifierExplainLabeli18nKey, settings)
      ) {
        newSchema = {
          ...newSchema,
          explain: loc(identifierExplainLabeli18nKey, 'login'),
          'explain-top': true,
        };
      } else if (schema.name === 'credentials.passcode' &&
        isCustomizedI18nKey(passwordExplainLabeli18nKey, settings)
      ) {
        newSchema = {
          ...newSchema,
          explain: loc(passwordExplainLabeli18nKey, 'login'),
          'explain-top': true,
        };
      }

      return newSchema;
    });

    return newSchemas;
  },

  _addForgotPasswordView() {
    const forgotPasswordLink = getForgotPasswordLink(this.options.appState, this.options.settings);
    if (forgotPasswordLink.length) {
      this.add('<div class="links-primary"></div>', { selector: '.o-form-button-bar' });
      this.add(Link, {
        selector: '.links-primary',
        options: forgotPasswordLink[0],
      });
    }
  },

  _addIdpView(idpButtons) {
    // We check the 'idpDisplay' option config to determine whether to render the idp buttons 
    // above or below the login fields
    const idpDisplay = this.options.settings.get('idpDisplay');
    const isPrimaryIdpDisplay = idpDisplay && idpDisplay.toUpperCase() === 'PRIMARY';

    this.add(signInWithIdps, {
      prepend: isPrimaryIdpDisplay,
      selector: isPrimaryIdpDisplay ? '.o-form-fieldset-container' : '.o-form-button-bar',
      options: {
        idpButtons,
        isPrimaryIdpDisplay
      }
    });
  },
});

export default BaseView.extend({
  Body,

  initialize() {
    // Override Footer by overriding showForgotPasswordLink method
    this.Footer = IdentifierFooter.extend({
      showForgotPasswordLink: () => {
        // We don't add the forgot password link in the footer if SIW renders multi IDPs,
        // instead in that case we add it before the IDP buttons in IdentifierView as primary links.
        const idpButtons = createIdpButtons(this.options.appState.get('remediations'));
        return (!this.options.appState.isIdentifierOnlyView() &&
          (!Array.isArray(idpButtons) || idpButtons.length === 0));
      }
    });
  },

  postRender() {
    BaseView.prototype.postRender.apply(this, arguments);

    // If user entered identifier is not found, API sends back a message with a link to sign up
    // This is the click handler for that link
    const appState = this.options.appState;
    this.$el.find('.js-sign-up').click(function() {
      appState.trigger('invokeAction', RemediationForms.SELECT_ENROLL_PROFILE);
      return false;
    });
  },
});
