import { loc } from '@okta/courage';
import { BaseFormWithPolling } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import polling from '../shared/polling';
import OVResendView from './OVResendView';
import SwitchEnrollChannelLinkView from './SwitchEnrollChannelLinkView';
import EnrollChannelPollDescriptionView from './EnrollChannelPollDescriptionView';

const OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_IOS =
  'oie.authenticator.app.non_fips_compliant_enrollment_device_incompatible';
const OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_NON_IOS =
  'oie.authenticator.app.non_fips_compliant_enrollment_app_update_required';
const OV_QR_ENROLL_ENABLE_BIOMETRICS_KEY = 'oie.authenticator.app.method.push.enroll.enable.biometrics';
let shouldStartPolling = true;

const Body = BaseFormWithPolling.extend(Object.assign(
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
      BaseFormWithPolling.prototype.initialize.apply(this, arguments);
      this.listenTo(this.model, 'error', this.stopPolling);
      if (shouldStartPolling) {
        this.startPolling();
      }
    },
    showMessages() {
      // override showMessages to display custom callout
      const calloutOptions = {};
      if (this.options.appState.containsMessageWithI18nKey(OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_IOS) ||
        this.options.appState.containsMessageWithI18nKey(OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_NON_IOS)) {
        // add a title for ov force upgrade
        calloutOptions.title = loc('oie.okta_verify.enroll.force.upgrade.title', 'login');
      } else if (this.options.appState.containsMessageWithI18nKey(OV_QR_ENROLL_ENABLE_BIOMETRICS_KEY)) {
        // add a title for OV enable biometrics message during enrollment
        calloutOptions.title = loc('oie.authenticator.app.method.push.enroll.enable.biometrics.title', 'login');
      }
      BaseFormWithPolling.prototype.showMessages.call(this, calloutOptions);
    },
    getUISchema() {
      const schema = [];
      const contextualData = this.options.appState.get('currentAuthenticator').contextualData;
      const selectedChannel = contextualData.selectedChannel;
      let selector;
      if (selectedChannel === 'qrcode') {
        selector = '.qrcode-container';
        shouldStartPolling = true;
      } else if (['email', 'sms'].includes(selectedChannel)) {
        selector = '.switch-channel-content';
        shouldStartPolling = true;
      } else if (['samedevice', 'devicebootstrap'].includes(selectedChannel)) { 
        // no selector if the channel is same device or device bootstrap
        // additionally, stop polling as it should be a terminal page
        shouldStartPolling = false;
      }
      
      schema.push({
        View: EnrollChannelPollDescriptionView,
      });
      schema.push({
        View: SwitchEnrollChannelLinkView,
        options: {
          selectedChannel
        },
        selector: selector,
      });
      if (['email', 'sms'].includes(selectedChannel)) {
        schema.push({
          View: OVResendView,
          selector: '.o-form-error-container',
        });
      }
      return schema;
    },
    remove() {
      BaseFormWithPolling.prototype.remove.apply(this, arguments);
      this.stopPolling();
    },
  },

  polling,
));

export default BaseAuthenticatorView.extend({
  Body,
});
