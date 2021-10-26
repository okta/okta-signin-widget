import { loc, View } from 'okta';
import hbs from 'handlebars-inline-precompile';

const getTerminalOtpEmailMagicLinkContext = (appState) => {
  const appName = loc('idx.return.link.otponly.accessing.app', 'login', [appState.get('app').label]);
  const client = appState.get('client');
  const browserOnOsString = loc('idx.return.link.otponly.browser.on.os', 'login', [client.browser, client.os]);
  const clientLocationExists = client.location && client.location.city && client.location.country;
  const geolocation = clientLocationExists ?
    loc('idx.return.link.otponly.city.country', 'login', [client.location.city, client.location.country]) :
    null;
  const otp = appState.get('currentAuthenticator').contextualData.otp;

  return {
    appName,
    browserOnOsString,
    geolocation,
    otp,
  };
};

const BaseEmailMagicLinkOTPTerminalView = View.extend({
  getTemplateData() {
    return getTerminalOtpEmailMagicLinkContext(this.options.appState);
  },
});

const OTPInformationTerminalView = BaseEmailMagicLinkOTPTerminalView.extend({
  template: hbs`
  <h1 class='otp-value'>{{otp}}</h1>
  <div class="enduser-email-consent--info no-translate">
    <div>{{i18n code="idx.return.link.otponly.request" bundle="login"}}</div>
  </div>
  <div class="enduser-email-consent--info no-translate">
    <i class="enduser-email-consent--icon icon--desktop"></i>
    <div>{{browserOnOsString}}</div>
  </div>
  <div class="enduser-email-consent--info no-translate">
    <i class="enduser-email-consent--icon icon--app"></i>
    <div>{{appName}}</div>
  </div>
  {{#if geolocation}}
  <div class="enduser-email-consent--info no-translate">
    <i class="enduser-email-consent--icon icon--location"></i>
    <div>{{geolocation}}</div>
  </div>
  {{/if}}
  <p class='otp-warning'>{{i18n code="idx.return.link.otponly.warning" bundle="login"}}</p>
  `,
});

export {
  OTPInformationTerminalView
};
