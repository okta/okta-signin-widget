import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { getMessage } from '../../../ion/i18nTransformer';

const HELP_AND_CONTACT_KEY_PREFIX = 'idx.error.code.access_denied.device_assurance.remediation.additional_help_';
const REMEDIATION_OPTION_INDEX_KEY = 'idx.error.code.access_denied.device_assurance.remediation.option_index';

export default View.extend({
  className: 'end-user-remediation-terminal-view',
  template: hbs`
    {{#if title}}
      <div class="end-user-remediation-title">{{title}}</div>
    {{/if}}
    {{#if explanation}}
      <div class="end-user-remediation-explanation">{{explanation}}</div>
    {{/if}}
    {{#if remediationOptions}}
      <div class="end-user-remediation-options">
      {{#each remediationOptions}}<div class="{{className}}">{{{message}}}</div>{{/each}}
      </div>
    {{/if}}
    {{#if helpAndContact}}
      <div class="end-user-remediation-help-and-contact">{{{helpAndContact}}}</div>
    {{/if}}
  `,
  getTemplateData() {
    const messages = this.options.messages.value;
    const title = getMessage(messages[0]);
    const explanation = getMessage(messages[1]);
    const remediationOptions = [];
    let helpAndContact = null;

    messages.forEach((message, index) => {
      if (index < 2) {
        return;
      } else if (message.i18n.key.startsWith(HELP_AND_CONTACT_KEY_PREFIX)) {
        helpAndContact = getMessage(message);
      } else {
        remediationOptions.push({
          message: getMessage(message),
          className: (
            message.i18n.key === REMEDIATION_OPTION_INDEX_KEY ?
              'end-user-remediation-option' :
              'end-user-remediation-action'
          ),
        });
      }
    });

    return {
      title,
      explanation,
      remediationOptions,
      helpAndContact,
    };
  },
});