import { loc } from '@okta/courage';
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
});

export default BaseView.extend({
  Body
});
