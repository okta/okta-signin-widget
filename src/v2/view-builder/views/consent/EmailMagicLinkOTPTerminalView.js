import { loc, View } from 'okta';
import hbs from 'handlebars-inline-precompile';

const generateGeolocationString = (location = {}) => {
  if (!location.city && !location.country) {
    return null;
  }
  // Use 1 of 2 formats based on presence of 'state' in response:
  // 1. City, State, Country
  // 2. City, Country
  return location.state ?
    loc('geolocation.formatting.all', 'login', [location.city, location.state, location.country]) :
    loc('geolocation.formatting.partial', 'login', [location.city, location.country]);
};

const getTerminalOtpEmailMagicLinkContext = (appState) => {
  const appName = loc('idx.return.link.otponly.accessing.app', 'login', [appState.get('app').label]);
  const client = appState.get('client');
  const browserOnOsString = loc('idx.return.link.otponly.browser.on.os', 'login', [client.browser, client.os]);
  const geolocation = generateGeolocationString(client.location);
  const otp = appState.get('currentAuthenticator')?.contextualData?.otp;

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
  <div class="enduser-email-consent--info">
    <div>{{i18n code="idx.return.link.otponly.request" bundle="login"}}</div>
  </div>
  <div class="enduser-email-consent--info">
    <i class="enduser-email-consent--icon icon--desktop" aria-hidden="true"></i>
    <div data-se="otp-browser-os">{{browserOnOsString}}</div>
  </div>
  <div class="enduser-email-consent--info">
    <i class="enduser-email-consent--icon icon--app" aria-hidden="true"></i>
    <div data-se="otp-app">{{appName}}</div>
  </div>
  {{#if geolocation}}
  <div class="enduser-email-consent--info">
    <i class="enduser-email-consent--icon icon--location" aria-hidden="true"></i>
    <div data-se="otp-geolocation">{{geolocation}}</div>
  </div>
  {{/if}}
  <p class='otp-warning'>{{i18n code="idx.return.link.otponly.warning" bundle="login"}}</p>
  `,
});

export {
  OTPInformationTerminalView
};
