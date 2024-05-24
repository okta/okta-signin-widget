import { loc, _ } from '@okta/courage';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import BrowserFeatures from '../../../../util/BrowserFeatures';
import SameDeviceEnrollLink from './SameDeviceEnrollLink';

const Body = BaseForm.extend({
  title() {
    return (BrowserFeatures.isAndroid() || BrowserFeatures.isIOS())
      ? loc('oie.enroll.okta_verify.setup.title', 'login')
      : loc('oie.enroll.okta_verify.select.channel.title.updated', 'login');
  },
  getUISchema() {
    const schemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    // filter selected channel
    const channelField = _.find(schemas, (schema) => schema.name === 'authenticator.channel');
    // do not show the 'samedevice' radio option, that option is displayed as a link instead
    channelField.options = _.filter(channelField?.options, (option) => (
      option.value !== this.options.appState.get('currentAuthenticator')?.contextualData?.selectedChannel
      && option.value !== 'samedevice'
    ));
    channelField.value = channelField.options[0]?.value;
    channelField.sublabel = null;
    this.model.set('authenticator.channel', channelField.value);
    const description = {
      View: loc('oie.enroll.okta_verify.select.channel.subtitle', 'login'),
      selector: '.o-form-fieldset-container',
    };
    return [description, ...schemas];
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  postRender() {
    const authenticatorFormValues = this.options.currentViewState.value
      ?.find(val => val.name === 'authenticator').value.form.value;
    const sameDeviceChannelAvailable = authenticatorFormValues
      ?.find(val => val.name === 'channel').options?.find(channel => channel.value === 'samedevice');
    // only add this link if the samedevice channel is available in the remediation
    if (sameDeviceChannelAvailable) {
      this.add(new SameDeviceEnrollLink({
        model: this.model,
        settings: this.settings,
        appState: this.options.appState
      }), 'form');
    }
  },
});
