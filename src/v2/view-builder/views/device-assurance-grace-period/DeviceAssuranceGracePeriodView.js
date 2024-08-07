import { loc, createCallout } from '@okta/courage';
import { BaseForm, BaseView } from '../../internals';
import EndUserRemediationMessages from '../end-user-remediation/EndUserRemediationMessages';
import { getMessage } from 'v2/ion/i18nUtils';

const ERROR_MESSAGE_CLASS = 'ERROR';
const WARNING_MESSAGE_CLASS = 'WARNING';

const DeviceAssuranceGracePeriodView = BaseForm.extend(
  {
    title() {
      return loc('idx.device_assurance.grace_period.title', 'login');
    },

    save() {
      return loc('idx.device_assurance.grace_period.continue_to_app', 'login');
    },

    showMessages() {
      const messages = this.options.appState.get('messages').value;
      const remediationMessages = messages.filter(message => message?.class === ERROR_MESSAGE_CLASS);
      const warningMessage = messages.find(message => message?.class === WARNING_MESSAGE_CLASS);
      this.renderWarning(warningMessage);
      this.add(new EndUserRemediationMessages({ messages: remediationMessages }));
    },

    renderWarning(warningMessage) {
      this.add(createCallout({
        content: `<strong>${getMessage(warningMessage)}</strong>`,
        type: 'warning',
      }));
    },
  },
);

export default BaseView.extend({
  initialize() {
    BaseView.prototype.initialize.apply(this, arguments);
    this.Body = DeviceAssuranceGracePeriodView;
  }
});
