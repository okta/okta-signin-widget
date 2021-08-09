import { loc, createCallout } from 'okta';
import { BaseForm } from '../../internals';
import BrowserFeatures from '../../../../util/BrowserFeatures';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import polling from '../shared/polling';
import { FORMS as RemediationForms } from '../../../ion/RemediationConstants';
import ResendView from './ResendView';
import SwitchEnrollChannelLinkView from './SwitchEnrollChannelLinkView';
import EnrollChannelPollDescriptionView from './EnrollChannelPollDescriptionView';

const OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_IOS =
  'oie.authenticator.app.non_fips_compliant_enrollment_device_incompatible';
const OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_NON_IOS =
  'oie.authenticator.app.non_fips_compliant_enrollment_app_update_required';
const OV_QR_ENROLL_ENABLE_BIOMETRICS_KEY = 'oie.authenticator.app.method.push.enroll.enable.biometrics';

const Body = BaseForm.extend(Object.assign(
  {
    title() {
      const selectedChannel = this.options.appState.get('currentAuthenticator').contextualData.selectedChannel;
      let title;
      switch (selectedChannel) {
      case 'email':
        title = loc('oie.enroll.okta_verify.setup.email.title', 'login');
        break;
      case 'sms':
        title = loc('oie.enroll.okta_verify.setup.sms.title', 'login');
        break;
      default:
        title = loc('oie.enroll.okta_verify.setup.title', 'login');
      }
      return title;
    },
    className: 'oie-enroll-ov-poll',
    noButtonBar: true,
    initialize() {
      BaseForm.prototype.initialize.apply(this, arguments);
      this.listenTo(this.model, 'error', this.stopPolling);
      this.startPolling();
    },
    showMessages() {
      // override showMessages to display error message
      const messagesObjs = this.options.appState.get('messages');
      if (messagesObjs && Array.isArray(messagesObjs.value)) {
        this.add('<div class="ion-messages-container"></div>', '.o-form-error-container');

        messagesObjs.value.forEach(messagesObj => {
          const msg = messagesObj.message;
          if (messagesObj?.class === 'ERROR') {
            const options = {
              content: msg,
              type: 'error',
            };
            if (this.options.appState.containsMessageWithI18nKey(OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_IOS) ||
            this.options.appState.containsMessageWithI18nKey(OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_NON_IOS)) {
              // add a title for ov force upgrade
              options.title = loc('oie.okta_verify.enroll.force.upgrade.title', 'login');
            } else if (this.options.appState.containsMessageWithI18nKey(OV_QR_ENROLL_ENABLE_BIOMETRICS_KEY)) {
              // add a title for OV enable biometrics message during enrollment
              options.title = loc('oie.authenticator.app.method.push.enroll.enable.biometrics.title', 'login');
            }
            this.add(createCallout(options), '.o-form-error-container');
          } else {
            this.add(`<p>${msg}</p>`, '.ion-messages-container');
          }
        });

      }
    },
    postRender() {
      // Using setTimeout of 0 because, the view is added in postRender of formController and not the initialize,
      // and hence by the time swithForm is called, current view is not rendered and availabe on controller $el.
      setTimeout(() => {
        if ((BrowserFeatures.isAndroid() || BrowserFeatures.isIOS()) &
          this.options.appState.get('currentAuthenticator').contextualData.selectedChannel === 'qrcode') {
          this.options.appState.trigger('switchForm', RemediationForms.SELECT_ENROLLMENT_CHANNEL);
        }
      }, 0);
    },
    getUISchema() {
      const schema = [];
      const contextualData = this.options.appState.get('currentAuthenticator').contextualData;
      const selectedChannel = contextualData.selectedChannel;
      schema.push({
        View: EnrollChannelPollDescriptionView,
      });
      schema.push({
        View: SwitchEnrollChannelLinkView,
        options: {
          selectedChannel
        },
        selector: selectedChannel === 'qrcode' ? '.qrcode-container' : '.switch-channel-content',
      });
      if (['email', 'sms'].includes(selectedChannel)) {
        schema.push({
          View: ResendView,
          selector: '.o-form-error-container',
        });
      }
      return schema;
    },
    remove() {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopPolling();
    },
  },

  polling,
));

export default BaseAuthenticatorView.extend({
  Body,
});
