import BaseView from '../internals//BaseView';
import BaseForm from '../internals//BaseForm';
import email from '../shared/email';

const Body = BaseForm.extend(Object.assign(
  {

    save: 'Send Email Link',
  },
  email,
));

export default BaseView.extend({
  Body,
});
