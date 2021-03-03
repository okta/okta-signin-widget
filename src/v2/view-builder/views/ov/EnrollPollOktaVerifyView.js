import { loc } from 'okta';
import { BaseForm } from '../../internals';
import BrowserFeatures from '../../../../util/BrowserFeatures';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import polling from '../shared/polling';
import { FORMS as RemediationForms } from '../../../ion/RemediationConstants';
import ResendView from './ResendView';
import SwitchEnrollChannelLinkView from './SwitchEnrollChannelLinkView';
import EnrollChannelPollDescriptionView from './EnrollChannelPollDescriptionView';

const Body = BaseForm.extend(Object.assign(
  {
    title () {
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
    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      if ((BrowserFeatures.isAndroid() || BrowserFeatures.isIOS()) &
        this.options.appState.get('currentAuthenticator').contextualData.selectedChannel === 'qrcode') {
        this.options.appState.trigger('switchForm', RemediationForms.SELECT_ENROLLMENT_CHANNEL);
      }
      this.listenTo(this.model, 'error', this.stopPolling);
      this.startPolling();
    },
    getUISchema () {
      const schema = [];
      const contextualData = this.options.appState.get('currentAuthenticator').contextualData;
      const selectedChannel = contextualData.selectedChannel;
      schema.push({
        View: EnrollChannelPollDescriptionView,
      });
      schema.push({
        View: SwitchEnrollChannelLinkView,
        options: {
          selectedChannel,
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
    remove () {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopPolling();
    },
  },

  polling,
));

export default BaseAuthenticatorView.extend({
  Body,
});
