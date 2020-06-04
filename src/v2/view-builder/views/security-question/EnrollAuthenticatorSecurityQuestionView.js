import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseFactorView from '../shared/BaseFactorView';

const Body = BaseForm.extend({
  title() {
    return loc('oie.security.question.enroll.title', 'login');
  }
});

export default BaseFactorView.extend({
  Body,
});
