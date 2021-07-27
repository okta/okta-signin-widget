import hbs from 'handlebars-inline-precompile';
import { loc, View } from 'okta';
import { BaseForm, BaseView } from '../../internals';

const InvalidUserCodeErrorView = View.extend({
  template: hbs`
      {{#each messages}}
        {{#if isError}}
          <div class="okta-form-infobox-error infobox infobox-error" role="alert">
              <span class="icon error-16"></span>
               <p>{{message}}</p>
          </div>
        {{else}}
          <div class="ion-messages-container">
              <p>{{message}}</p>
          </div>
        {{/if}}
      {{/each}}
    `,
  getTemplateData: function() {
    const messages = this.options.appState.get('messages') || {};
    if (Array.isArray(messages.value)) {
      return {
        messages: messages.value
          .map(m => {
            return {
              isError: m.class === 'ERROR',
              message: m.message
            };
          })
      };
    }
    return [];
  },
});

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
    this.add(InvalidUserCodeErrorView, '.o-form-error-container');
  },
});

export default BaseView.extend({
  Body
});
