import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { FORMS as RemediationForms } from '../../../ion/RemediationConstants';

export default View.extend({
  className: 'ov-same-device-enroll-text',
  template: hbs `
        {{{i18n code="oie.enroll.okta_verify.select.channel.ovOnThisDevice"
        bundle="login" $1="<a class='ov-same-device-enroll-link' href='#'>$1</a>"}}}
      `,
  postRender: function() {
    const appState = this.options && this.options.appState;
    const model = this.model;

    this.$('.ov-same-device-enroll-link').click(function() {
      if (!appState || !model) {
        return;
      }

      const sameDeviceChannel = 'samedevice';
      const remediations = appState.get('remediations');
      const selectEnrollmentChannelRemediation = remediations.find((remediation) => {
        return remediation.name === RemediationForms.SELECT_ENROLLMENT_CHANNEL;
      });

      if (!selectEnrollmentChannelRemediation) {
        return;
      }
      const idField = selectEnrollmentChannelRemediation.uiSchema?.find((schema) =>
        schema.name === 'authenticator.id');
      if (!idField) {
        return;
      }
      // filter selected channel
      const sameDeviceChannelField = selectEnrollmentChannelRemediation.uiSchema?.find((schema) =>
        schema.name === 'authenticator.channel');
      if (!sameDeviceChannelField) {
        return;
      }
      sameDeviceChannelField.options = sameDeviceChannelField.options?.filter((option) =>
        option.value === sameDeviceChannel);
      sameDeviceChannelField.value = sameDeviceChannelField.options[0]?.value || sameDeviceChannel;
      sameDeviceChannelField.sublabel = null;

      model.set('authenticator.channel', sameDeviceChannelField.value);
      model.set('authenticator.id', idField.value);
      model.set('formName', selectEnrollmentChannelRemediation.name);
      appState.trigger('saveForm', model);
    });
  },
});
