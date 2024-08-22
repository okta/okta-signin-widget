import { loc, createCallout } from '@okta/courage';
import { BaseForm, BaseView } from '../../internals';
import EndUserRemediationMessages from '../end-user-remediation/EndUserRemediationMessages';

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
      if (messages) {
        this.add(createCallout({
          content: new EndUserRemediationMessages({ messages }),
          type: 'warning',
        }));
      }
    },
  },
);

export default BaseView.extend({
  initialize() {
    BaseView.prototype.initialize.apply(this, arguments);
    this.Body = DeviceAssuranceGracePeriodView;
  }
});
