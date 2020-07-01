import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import { loc } from 'okta';

const Body = BaseForm.extend({
  title () {
    const msg = this.options.appState.get('terminal').message || {};
    return msg.message || loc('closeWindow', 'login');
  },
  noButtonBar: true,
  postRender () {
    BaseForm.prototype.postRender.apply(this, arguments);
    this.$el.addClass('terminal-state');
  },
});

// TODO add cancel link to the footer if cancel is present in the API

export default BaseView.extend({
  Body
});
