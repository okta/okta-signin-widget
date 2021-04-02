import { loc, View } from 'okta';
import hbs from 'handlebars-inline-precompile';
import { BaseFormWithPolling, BaseView } from '../internals';
import polling from './shared/polling';
import { MS_PER_SEC } from '../utils/Constants';

const PollMessageView = View.extend({
  template: hbs`
    <div class="ion-messages-container">
      <p>{{i18n code="poll.form.message"
        bundle="login" arguments="countDownCounterValue" $1="<span class='strong'>$1</span>"}} </p>
    </div>
    <div class="okta-waiting-spinner"></div>
    `
  ,
  getTemplateData() {
    return {
      countDownCounterValue: this.options,
    };
  },
});

const Body = BaseFormWithPolling.extend(Object.assign(
  {
    title() {
      return  loc('poll.form.title', 'login');
    },

    noButtonBar: true,

    initialize() {
      BaseFormWithPolling.prototype.initialize.apply(this, arguments);
      this.startPolling();
      this.listenTo(this.options.appState, 'change:dynamicRefreshInterval', () => {
        const countDownCounterValue = Math.ceil(this.options.appState.getPollInterval() / MS_PER_SEC);
        this.$el.find('.ion-messages-container span').text(countDownCounterValue);
        this.startCountDown('.ion-messages-container span', MS_PER_SEC);
      });
    },

    render() {
      BaseFormWithPolling.prototype.render.apply(this, arguments);
      this.countDownCounterValue = Math.ceil(this.options.appState.getPollInterval() / MS_PER_SEC);
      this.add(new PollMessageView(this.countDownCounterValue));
      this.startCountDown('.ion-messages-container span', MS_PER_SEC);
    },

    remove() {
      BaseFormWithPolling.prototype.remove.apply(this, arguments);
      this.stopPolling();
    },

    triggerAfterError() {
      BaseFormWithPolling.prototype.triggerAfterError.apply(this, arguments);
      this.stopPolling();
      this.$el.find('.o-form-fieldset-container').empty();
    },
  },

  polling,
));

export default BaseView.extend({
  Body
});
