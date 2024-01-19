import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { FORMS as RemediationForms } from '../../../ion/RemediationConstants';

export default View.extend({
  className: 'switch-channel-text',
  template: hbs `
    {{#if isQRcodeChannel}}
      {{#if sameDeviceOVEnrollmentEnabled}}
        {{{i18n code="oie.enroll.okta_verify.switch.channel.link.text" bundle="login"}}}
      {{else}}
        <a href="#" class="switch-channel-link"
        aria-label="{{i18n code="enroll.totp.aria.cannotScan" bundle="login" }}">
          {{i18n code="enroll.totp.cannotScan" bundle="login"}}</a>
      {{/if}}
    {{else if isSameDeviceChannel}}
    {{else if isDeviceBootstrapChannel}}
    {{else}}
      {{{i18n code="oie.enroll.okta_verify.switch.channel.link.text" bundle="login"}}}
    {{/if}}`,
  getTemplateData() {
    const selectedChannel = this.options.appState.get('currentAuthenticator').contextualData.selectedChannel;
    return {
      sameDeviceOVEnrollmentEnabled: this.settings.get('features.sameDeviceOVEnrollmentEnabled'),
      isQRcodeChannel: selectedChannel === 'qrcode',
      // Do not show switch channel link for sameDevice or deviceBootstrap
      isSameDeviceChannel: selectedChannel === 'samedevice',
      isDeviceBootstrapChannel: selectedChannel === 'devicebootstrap',
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
