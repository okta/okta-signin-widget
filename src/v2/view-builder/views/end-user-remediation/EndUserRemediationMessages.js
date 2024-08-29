import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { getMessage } from '../../../ion/i18nTransformer';
import TimeUtil from 'util/TimeUtil';
import { loc } from 'util/loc';

const I18N_ACCESS_DENIED_KEY_PREFIX = 'idx.error.code.access_denied.device_assurance.remediation';
const I18N_GRACE_PERIOD_KEY_PREFIX = 'idx.device_assurance.grace_period.warning';
const HELP_AND_CONTACT_KEY_PREFIX = `${I18N_ACCESS_DENIED_KEY_PREFIX}.additional_help_`;
const CUSTOM_URL_ADDITIONAL_HELP_KEY = `${I18N_ACCESS_DENIED_KEY_PREFIX}.additional_help_custom`;
const REMEDIATION_OPTION_INDEX_KEY = `${I18N_ACCESS_DENIED_KEY_PREFIX}.option_index`;
const ACCESS_DENIED_TITLE_KEY = `${I18N_ACCESS_DENIED_KEY_PREFIX}.title`;
const GRACE_PERIOD_TITLE_KEY = `${I18N_GRACE_PERIOD_KEY_PREFIX}.title`;
const ACCESS_DENIED_EXPLANATION_KEY_PREFIX = `${I18N_ACCESS_DENIED_KEY_PREFIX}.explanation_`;
const GRACE_PERIOD_DUE_BY_DATE_SUFFIX = '.due_by_date';
const GRACE_PERIOD_DUE_BY_DAYS_SUFFIX = '.due_by_days';

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

    // eslint-disable-next-line complexity
    messages.forEach((msg) => {
      const { i18n: { key, params = [] }, links } = msg;
  
      if (key === ACCESS_DENIED_TITLE_KEY) {
        title = getMessage(msg);
      } else if (key.startsWith(GRACE_PERIOD_TITLE_KEY)) {
        if (params.length > 0) {
          let localizedExpiry;
          const expiry = params[0];
          // eslint-disable-next-line max-depth
          switch (key.split(GRACE_PERIOD_TITLE_KEY)[1]) {
          case GRACE_PERIOD_DUE_BY_DATE_SUFFIX:
            localizedExpiry = TimeUtil.formatUnixEpochToDeviceAssuranceGracePeriodDueDate(expiry);
            break;
          case GRACE_PERIOD_DUE_BY_DAYS_SUFFIX: 
            localizedExpiry = TimeUtil.formatUnixEpochToDeviceAssuranceGracePeriodDueDays(expiry);
            break;
          }
          title = loc(key, 'login', localizedExpiry ? [localizedExpiry] : []);
        }
      } else if (key.startsWith(ACCESS_DENIED_EXPLANATION_KEY_PREFIX)) {
        explanation = getMessage(msg);
      } else if (key.startsWith(HELP_AND_CONTACT_KEY_PREFIX)) {
        useCustomHelpText = key === CUSTOM_URL_ADDITIONAL_HELP_KEY;
        if (links && links[0] && links[0].url) {
          this.additionalHelpUrl = links[0].url;
        }
      } else {
        remediationOptions.push(buildRemediationOptionBlockMessage(msg));
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