import { View, _ } from 'okta';
import hbs from 'handlebars-inline-precompile';

export default View.extend({
  template: hbs`
      {{#if href}}
        <ol class="qrcode-info ov-info">
          <li>{{i18n code="oie.enroll.okta_verify.qrcode.step1" bundle="login"}}</li>
          <li>{{i18n code="oie.enroll.okta_verify.qrcode.step2" bundle="login"}}</li>
          <li>{{i18n code="oie.enroll.okta_verify.qrcode.step3" bundle="login"}}</li>
        </ol>
        <div class="qrcode-container">
          <img class="qrcode" src={{href}} alt="{{i18n code="mfa.altQrCode" bundle="login" }}"></img>
        </div>
      {{/if}}
      {{#if email}}
        <ul class="email-info ov-info">
          <li>{{{i18n code="oie.enroll.okta_verify.email.info" bundle="login" arguments="email"}}}</li>
          <li class="switch-channel-content"></li>
        </ul>
      {{/if}}
      {{#if phoneNumber}}
        <ul class="sms-info ov-info">
          <li>{{{i18n code="oie.enroll.okta_verify.sms.info" bundle="login" arguments="phoneNumber"}}}</li>
          <li class="switch-channel-content"></li>
        </ul>
      {{/if}}
    `,
  getTemplateData() {
    const contextualData = this.options.appState.get('currentAuthenticator').contextualData;
    return {
      href: contextualData.qrcode?.href,
      email: _.escape(contextualData?.email),
      phoneNumber:  _.escape(contextualData?.phoneNumber),
    };
  }
});
