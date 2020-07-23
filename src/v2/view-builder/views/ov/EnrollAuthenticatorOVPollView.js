import { View, loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorEnrollFooter from '../../components/AuthenticatorEnrollFooter';
import Link from '../../components/Link';
import { getSwitchOVEnrollChannelLink } from '../../utils/LinksUtil';
import polling from '../shared/polling';

const FastpassEnroll = View.extend({
  template: `Download app and follow instructions for setup`
});

const Body = BaseForm.extend(Object.assign(
  polling,
  {
    title () {
      const selectedChannel = this.options.appState.get('currentAuthenticator').contextualData.selectedChannel;
      let title;
      switch (selectedChannel) {
      case 'email':
        title = loc('oie.enroll.okta_verify.setup.email.title', 'login');
        break;
      case 'sms':
        title = loc('oie.enroll.okta_verify.setup.sms.title', 'login');
        break;
      default:
        title = loc('oie.enroll.okta_verify.setup.title', 'login');
      }
      return title;
    },
    className: 'oie-enroll-ov-poll',
    noButtonBar: true,
    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      this.listenTo(this.model, 'error', this.stopPolling);
      this.startOVPolling();
    },
    getUISchema () {
      const schema = [];
      const contextualData = this.options.appState.get('currentAuthenticator').contextualData;
      const selectedChannel = contextualData.selectedChannel;
      if (selectedChannel === 'local') {
        schema.push({
          View: FastpassEnroll,
        });
      } else if (selectedChannel === 'qrcode') {
        schema.push({
          View: `
          <ol>
            <li>{{i18n code="oie.enroll.okta_verify.qrcode.step1" bundle="login"}}</li>
            <li>{{i18n code="oie.enroll.okta_verify.qrcode.step2" bundle="login"}}</li>
            <li>{{i18n code="oie.enroll.okta_verify.qrcode.step3" bundle="login"}}</li>
          </ol>
          <div class="qrcode-container">
            <img class="qrcode" src=${contextualData.qrcode.href} alt="qr code"></img>
          </div>
        `,
        });
      } else if (selectedChannel === 'email') {
        schema.push({
          View: `
          <ol>
            <li>{{i18n code="oie.enroll.okta_verify.email.step1" bundle="login"}}</li>
            <li>{{i18n code="oie.enroll.okta_verify.email.step2" bundle="login"}}</li>
            <li>{{i18n code="oie.enroll.okta_verify.email.step3" bundle="login"}}</li>
          </ol>
        `,
        });
      }  else if (selectedChannel === 'sms') {
        schema.push({
          View: `
          <ol>
            <li>{{i18n code="oie.enroll.okta_verify.sms.step1" bundle="login"}}</li>
            <li>{{i18n code="oie.enroll.okta_verify.sms.step2" bundle="login"}}</li>
            <li>{{i18n code="oie.enroll.okta_verify.sms.step3" bundle="login"}}</li>
          </ol>
        `,
        });
      }
      if (this.options.appState.get('currentAuthenticator').contextualData.selectedChannel === 'qrcode') {
        schema.push({
          View: Link,
          options: getSwitchOVEnrollChannelLink(this.options.appState),
          selector: '.qrcode-container',
        });
      }
      return schema;
    },
    remove () {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopPolling();
    },
  },
));

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorEnrollFooter,
});
