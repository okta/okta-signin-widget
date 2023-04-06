import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { getMessage } from '../../../ion/i18nTransformer';

const HELP_AND_CONTACT_KEY_PREFIX = 'idx.error.code.access_denied.device_assurance.remediation.additional_help_';
const REMEDIATION_OPTION_INDEX_KEY = 'idx.error.code.access_denied.device_assurance.remediation.option_index';
const TITLE_KEY = "idx.error.code.access_denied.device_assurance.remediation.title";
const EXPLANATION_KEY_PREFIX = "idx.error.code.access_denied.device_assurance.remediation.explanation_";

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
      {{#each remediationOptions}}
        <div class="{{className}}">
        {{#if link}}
          <a href="{{link}}" target="_blank">{{message}}</a>
        {{else}}
          {{message}}
        {{/if}}
        </div>
      {{/each}}
      </div>
    {{/if}}
    {{#if helpAndContact}}
      <div class="end-user-remediation-help-and-contact">{{{helpAndContact}}}</div>
    {{/if}}
  `,
  getTemplateData() {
    const messages = this.options.messages.value;
    const remediationOptions = [];
    let title = null;
    let explanation = null;
    let helpAndContact = null;

    messages.forEach((message) => {
      if (message.i18n.key === TITLE_KEY) {
        title = getMessage(message);
      } else if (message.i18n.key.startsWith(EXPLANATION_KEY_PREFIX)) {
        explanation = getMessage(message);
      } else if (message.i18n.key.startsWith(HELP_AND_CONTACT_KEY_PREFIX)) {
        helpAndContact = getMessage(message);
        if (message.links && message.links[0] && message.links[0].url) {
          this.additionalHelpUrl = message.links[0].url;
        }
      } else {
        let link = null;
        if (message.links && message.links[0] && message.links[0].url) {
          link = message.links[0].url;
        }
        remediationOptions.push({
          message: getMessage(message),
          link,
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
  render() {
    View.prototype.render.apply(this, arguments);
    if (this.additionalHelpUrl) {
      this.$el.find('.additional-help').attr('href', this.additionalHelpUrl);
    }
  },
});