import BaseView from '../internals//BaseView';
import BaseForm from '../internals//BaseForm';

const Body = BaseForm.extend({

  title () {
    return `Email link (${this.options.appState.get('factorEmail')})`;
  },

  save: 'Send Email Link',
});

export default BaseView.extend({
  Body,
});
