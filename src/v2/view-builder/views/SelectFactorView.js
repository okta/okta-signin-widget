import { loc } from 'okta';
import BaseView from '../internals//BaseView';
import BaseForm from '../internals//BaseForm';

const SelectFactorForm = BaseForm.extend({
  title: loc('enroll.choices.title', 'login'),
  noButtonBar: true,
});

export default BaseView.extend({
  Body: SelectFactorForm,
});
