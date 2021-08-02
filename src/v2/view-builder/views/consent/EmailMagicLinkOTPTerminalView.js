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

const getTerminalOtpEmailMagicLinkContext = (settings, appState) => {
  const app = appState.get('app');
  const client = appState.get('client');
  let appName, browserOnOsString, geolocation;
  if (app) {
    appName = loc('idx.return.link.otponly.accessing.app', 'login', [app.label]);
  }
  if (client) {
    browserOnOsString = loc('idx.return.link.otponly.browser.on.os', 'login', [client.browser, client.os]);
    geolocation = generateGeolocationString(client.location);
  }
  const otp = settings.get('otp') || appState.get('currentAuthenticator')?.contextualData?.otp;

  return {
    showRequestInfo: appName || browserOnOsString || geolocation,
    appName,
    browserOnOsString,
    geolocation,
    otp,
  };
};

const BaseEmailMagicLinkOTPTerminalView = View.extend({
  getTemplateData() {
    return getTerminalOtpEmailMagicLinkContext(this.options.settings, this.options.appState);
  },
});

const OTPInformationTerminalView = BaseEmailMagicLinkOTPTerminalView.extend({
  template: hbs`
  <h1 class='otp-value no-translate'>{{otp}}</h1>
  {{#if showRequestInfo}}
  <div class="enduser-email-consent--info">
    <div>{{i18n code="idx.return.link.otponly.request" bundle="login"}}</div>
  </div>
  {{/if}}
  {{#if browserOnOsString}}
  <div class="enduser-email-consent--info">
    <i class="enduser-email-consent--icon icon--desktop" aria-hidden="true"></i>
    <div data-se="otp-browser-os">{{browserOnOsString}}</div>
  </div>
  {{/if}}
  {{#if appName}}
  <div class="enduser-email-consent--info">
    <i class="enduser-email-consent--icon icon--app" aria-hidden="true"></i>
    <div data-se="otp-app">{{appName}}</div>
  </div>
  {{/if}}
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
