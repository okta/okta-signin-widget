import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';

const Body = BaseForm.extend({
  title () {
    return 'You can close this window';
  },
  noButtonBar: true,
});

export default BaseView.extend({
  Body,
});
