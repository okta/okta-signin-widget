import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';

const Body = BaseForm.extend({
  title () {
    const msg = this.options.appState.get('currentState').message || {};
    return msg.value || 'You can close this window';
  },
  noButtonBar: true,
});

export default BaseView.extend({
  Body,
});
