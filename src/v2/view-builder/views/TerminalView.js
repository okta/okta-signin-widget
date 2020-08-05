import { createCallout } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';

const Body = BaseForm.extend({
  noButtonBar: true,
  postRender () {
    BaseForm.prototype.postRender.apply(this, arguments);
    this.$el.addClass('terminal-state');
  },

  showMessages () {
    const messagesObjs = this.options.appState.get('messages');
    if (messagesObjs && Array.isArray(messagesObjs.value)) {
      this.add('<div class="ion-messages-container"></div>', '.o-form-error-container');

      messagesObjs.value
        .forEach(messagesObj => {
          const msg = messagesObj.message;
          if (messagesObj.class === 'ERROR') {
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
