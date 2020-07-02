import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';

const Body = BaseForm.extend({
  title () {
    // dont show title for terminal view
    const msg = this.options.appState.get('terminal').message || {};
    return msg.message || '';
  },
  noButtonBar: true,
  postRender () {
    BaseForm.prototype.postRender.apply(this, arguments);
    this.$el.addClass('terminal-state');
  },
});

export default BaseView.extend({
  Body
});
