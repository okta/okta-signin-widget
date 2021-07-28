import { createCallout, loc } from 'okta';
import { BaseForm, BaseView } from '../../internals';

const Body = BaseForm.extend({

  title() {
    return loc('device.code.activate.title', 'login');
  },

  subtitle() {
    return loc('device.code.activate.subtitle', 'login');
  },

  events: {
    'keyup input[name="userCode"]': function(e) {
      e.preventDefault();
      this.addHyphen(e);
    }
  },

  addHyphen(evt) {
    const currentVal = evt.target.value;
    // add hyphen after 4th character
    if (currentVal && currentVal.length === 4 && !['Backspace', 'Delete', '-'].includes(evt.key)) {
      evt.target.value = currentVal.concat('-');
    }
  },

  showMessages() {
    // override showMessages to display error message
    const messagesObjs = this.options.appState.get('messages');
    if (messagesObjs && Array.isArray(messagesObjs.value)) {
      this.add('<div class="ion-messages-container"></div>', '.o-form-error-container');

      messagesObjs.value.forEach(messagesObj => {
        const msg = messagesObj.message;
        if (messagesObj?.class === 'ERROR') {
          this.add(createCallout({
            content: msg,
            type: 'error',
          }), '.o-form-error-container');
        } else {
          this.add(`<p>${msg}</p>`, '.ion-messages-container');
        }
      });
    }
  },
});

export default BaseView.extend({
  Body
});
