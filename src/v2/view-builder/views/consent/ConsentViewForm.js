import { loc } from '@okta/courage';
import { BaseForm } from '../../internals';

export default BaseForm.extend(
  {
    noButtonBar: false,
    noCancelButton: false,
    buttonOrder: ['cancel', 'save'],
    save: () => loc('consent.required.consentButton', 'login'),
    cancel: () => loc('consent.required.cancelButton', 'login'),
    title: false,
    events: {
      'click input[data-type="save"]': function() {
        this.setConsent(true);
      },
    },
    setConsent(bool) {
      this.model.set('consent', bool);
    },
    cancelForm() {
      // override BaseForm.prototype.cancelForm which cancels auth flow
      this.setConsent(false);
      this.options.appState.trigger('saveForm', this.model);
    },
  },
);
