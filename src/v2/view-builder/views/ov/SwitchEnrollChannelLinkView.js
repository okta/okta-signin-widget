import { View } from 'okta';
import hbs from 'handlebars-inline-precompile';
import { FORMS as RemediationForms } from '../../../ion/RemediationConstants';

export default View.extend({
  className: 'switch-channel-text',
  template: hbs `
    {{#if isQRcodeChannel}}
      <a href="#" class="switch-channel-link" aria-label="{{i18n code="enroll.totp.aria.cannotScan" bundle="login" }}">
        {{i18n code="enroll.totp.cannotScan" bundle="login"}}</a>
    {{else}}
      {{{i18n code="oie.enroll.okta_verify.switch.channel.link.text" bundle="login"}}}
    {{/if}}`,
  getTemplateData() {
    return {
      isQRcodeChannel: this.options.appState.get('currentAuthenticator').contextualData.selectedChannel === 'qrcode',
    };
  },
  postRender() {
    this.$el.find('.switch-channel-link').on('click', (event) => {
      const appState = this.options.appState;
      event.preventDefault();
      appState.trigger('switchForm', RemediationForms.SELECT_ENROLLMENT_CHANNEL);
    });
  },
});
