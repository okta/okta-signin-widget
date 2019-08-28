import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';

const Body = BaseForm.extend({
  title () {
    return  'You will be redirected';
  },
  noButtonBar: true,
  initialize (options) {
    BaseForm.prototype.initialize.apply(this, arguments);
    options.appState.trigger('saveForm', options.model);
  },
});

export default BaseView.extend({
  Body
});
