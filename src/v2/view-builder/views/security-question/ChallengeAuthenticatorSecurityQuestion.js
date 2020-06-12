import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseFactorView from '../shared/BaseFactorView';

const Body = BaseForm.extend({
  title () {
    return loc('oie.security.question.challenge.title', 'login');
  },

  save () {
    return loc('oie.verify.button', 'login');
  },

  getUISchema () {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    const questionKey = uiSchemas.filter(s => s.name.indexOf('questionKey') >= 0);
    const answer = uiSchemas.filter(s => s.name.indexOf('answer') >= 0);

    if (questionKey.length === 1 && answer.length === 1) {
      answer[0].label = questionKey[0].label;
    }

    return uiSchemas;
  }
});

export default BaseFactorView.extend({
  Body,
});
