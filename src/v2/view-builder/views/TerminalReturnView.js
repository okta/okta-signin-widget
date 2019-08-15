import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import email from '../shared/email';

const Body = BaseForm.extend(Object.assign(
  {
    subtitle: 'To finish signing in, return to the screen where you requested the email link.',
    noButtonBar: true,
  },
  email,
));

export default BaseView.extend({
  Body,
});
