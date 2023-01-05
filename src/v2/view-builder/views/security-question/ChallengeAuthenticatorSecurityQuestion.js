import { loc } from '@okta/courage';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend({
  title() {
    return loc('oie.security.question.challenge.title', 'login');
  },

  save() {
    return loc('mfa.challenge.verify', 'login');
  },

  getUISchema() {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    const questionKey = uiSchemas.filter(s => s.name.indexOf('questionKey') >= 0);
    const answer = uiSchemas.filter(s => s.name.indexOf('answer') >= 0);

    /**
     * At verify SQ case,
     * 'questionKey' is read-only hence it won't show up in UI anyway.
     * 'answer' has label 'answer' but apparently UI want to display the
     * actual question (label of `questionKey`) as better user experience.
     */
    if (questionKey.length === 1 && answer.length === 1) {
      answer[0].label = questionKey[0].label;
    }

    return uiSchemas;
  }
});

export default BaseAuthenticatorView.extend({
  Body,
});
