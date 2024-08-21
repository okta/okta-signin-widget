import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { getMessage } from '../../../ion/i18nTransformer';

const I18N_ACCESS_DENIED_KEY_PREFIX = 'idx.error.code.access_denied.device_assurance.remediation';
const I18N_GRACE_PERIOD_KEY_PREFIX = 'idx.device_assurance.grace_period.warning';
const HELP_AND_CONTACT_KEY_PREFIX = `${I18N_ACCESS_DENIED_KEY_PREFIX}.additional_help_`;
const CUSTOM_URL_ADDITIONAL_HELP_KEY = `${I18N_ACCESS_DENIED_KEY_PREFIX}.additional_help_custom`;
const REMEDIATION_OPTION_INDEX_KEY = `${I18N_ACCESS_DENIED_KEY_PREFIX}.option_index`;
const ACCESS_DENIED_TITLE_KEY = `${I18N_ACCESS_DENIED_KEY_PREFIX}.title`;
const GRACE_PERIOD_TITLE_KEY = `${I18N_GRACE_PERIOD_KEY_PREFIX}.title`;
const ACCESS_DENIED_EXPLANATION_KEY_PREFIX = `${I18N_ACCESS_DENIED_KEY_PREFIX}.explanation_`;

function buildRemediationOptionBlockMessage(message) {
  let link = null;
  if (message.links && message.links[0] && message.links[0].url) {
    link = message.links[0].url;
  }
  return {
    message: getMessage(message),
    link,
    className: (
      message.i18n.key === REMEDIATION_OPTION_INDEX_KEY ?
        'end-user-remediation-option' :
        'end-user-remediation-action'
    ),
  };
}

export default View.extend({
  className: 'end-user-remediation-messages-view',
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
          <a href="{{link}}" target="_blank" rel="noopener noreferrer">{{message}}</a>
        {{else}}
          {{message}}
        {{/if}}
        </div>
      {{/each}}
      </div>
    {{/if}}
    <div class="end-user-remediation-help-and-contact">
    {{#if useCustomHelpText }}
      {{i18n
        code="idx.error.code.access_denied.device_assurance.remediation.additional_help_custom"
        bundle="login"
        $1="<a href='#' target='_blank' rel='noopener noreferrer' class='additional-help'>$1</a>"
      }}
    {{else}}
      {{i18n
        code="idx.error.code.access_denied.device_assurance.remediation.additional_help_default"
        bundle="login"
        $1="<a href='#' target='_blank' rel='noopener noreferrer' class='additional-help'>$1</a>"
      }}
    {{/if}}
    </div>
  `,
  getTemplateData() {
    const messages = this.options.messages;
    const remediationOptions = [];
    let title = null;
    let explanation = null;
    let useCustomHelpText = false;

    messages.forEach((message) => {
      if (message.i18n.key === ACCESS_DENIED_TITLE_KEY || message.i18n.key.startsWith(GRACE_PERIOD_TITLE_KEY)) {
        title = getMessage(message);
      } else if (message.i18n.key.startsWith(ACCESS_DENIED_EXPLANATION_KEY_PREFIX)) {
        explanation = getMessage(message);
      } else if (message.i18n.key.startsWith(HELP_AND_CONTACT_KEY_PREFIX)) {
        useCustomHelpText = message.i18n.key === CUSTOM_URL_ADDITIONAL_HELP_KEY;
        if (message.links && message.links[0] && message.links[0].url) {
          this.additionalHelpUrl = message.links[0].url;
        }
      } else {
        remediationOptions.push(buildRemediationOptionBlockMessage(message));
      }
    });

    return {
      title,
      explanation,
      remediationOptions,
      useCustomHelpText,
    };
  },
  render() {
    View.prototype.render.apply(this, arguments);
    if (this.additionalHelpUrl) {
      this.$el.find('.additional-help').attr('href', this.additionalHelpUrl);
    }
  },
});