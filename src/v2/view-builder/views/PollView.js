import { loc, View } from 'okta';
import hbs from 'handlebars-inline-precompile';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import polling from './shared/polling';
import { MS_PER_SEC } from '../utils/Constants';

const PollMessageView = View.extend({
  template: hbs`
    <div class="ion-messages-container">
      {{i18n code="poll.form.message" 
        bundle="login" arguments="countDownCounterValue" $1="<span class='strong'>$1</span>"}}
    </div>
    <div class="okta-waiting-spinner"></div>`
  ,
  getTemplateData () {
    const countDownCounterValue = this.options;
    return {
      countDownCounterValue,
    };
  },
});

const Body = BaseForm.extend(Object.assign(
  {
    title () {
      return  loc('poll.form.title', 'login');
    },

    noButtonBar: true,
    
    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      this.startPolling();
    },

    render () {
      BaseForm.prototype.render.apply(this, arguments);
      this.countDownCounterValue = Math.ceil(this.options.appState.getCurrentViewState().refresh / MS_PER_SEC);
      this.add(new PollMessageView(this.countDownCounterValue));
      this.startCountDown('.ion-messages-container span', MS_PER_SEC);
    },

    remove () {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopPolling();
    }
  },

  polling,
));

export default BaseView.extend({
  Body
});
