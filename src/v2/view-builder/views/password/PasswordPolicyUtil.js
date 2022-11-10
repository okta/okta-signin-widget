import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

const generatePasswordPolicyHtml = function(form, rulesList, prepend) {
  form.add(
    View.extend({
      tagName: 'section',
      template:
        hbs`<div class="password-authenticator--heading">
        {{i18n code="password.complexity.requirements.header" bundle="login"}}
      </div>
      <ul class="password-authenticator--list">
        {{#each rulesList}}<li>{{this}}</li>{{/each}}
      </ul>`,
      getTemplateData: () => ({ rulesList }),
      attributes: {
        'data-se': 'password-authenticator--rules'
      }
    }),
    {
      prepend,
      selector: '.o-form-fieldset-container',
    }
  );
};

export {
  generatePasswordPolicyHtml,
};