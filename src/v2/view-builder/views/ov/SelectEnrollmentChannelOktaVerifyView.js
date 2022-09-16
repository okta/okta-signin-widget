import { loc, _ } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import BrowserFeatures from '../../../../util/BrowserFeatures';

const Body = BaseForm.extend({
  title() {
    return (BrowserFeatures.isAndroid() || BrowserFeatures.isIOS())
      ? loc('oie.enroll.okta_verify.setup.title', 'login')
      : loc('oie.enroll.okta_verify.select.channel.title', 'login');
  },
  getUISchema() {
    const schemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    // filter selected channel
    const channelField = _.find(schemas, (schema) => schema.name === 'authenticator.channel');
    channelField.options = _.filter(channelField?.options, (option) =>
      option.value !== this.options.appState.get('currentAuthenticator')?.contextualData?.selectedChannel);
    channelField.value = channelField.options[0]?.value;
    channelField.sublabel = null;
    this.model.set('authenticator.channel', channelField.value);
    const description = {
      View: loc('oie.enroll.okta_verify.select.channel.description', 'login'),
      selector: '.o-form-fieldset-container',
    };
    return [description, ...schemas];
  },
});

export default BaseAuthenticatorView.extend({
  Body,
});
