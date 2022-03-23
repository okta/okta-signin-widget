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
  // TODO: remove the last part after fixing the response in this.options
  const challengeIntent = settings.get('intent') || appState.get('intent') || 'Authentication';
  let enterCodeOnFlowPage, appName, browserOnOsString, isMobileDevice, geolocation;
  enterCodeOnFlowPage = loc('idx.return.link.otponly.enter.code.on.page', 'login', [challengeIntent]);
  if (app) {
    appName = loc('idx.return.link.otponly.app', 'login', [app.label]);
  }
  if (client) {
    browserOnOsString = loc('idx.return.link.otponly.browser.on.os', 'login', [client.browser, client.os]);
    // TODO: check exact name
    isMobileDevice = browserOnOsString.includes('Android') || browserOnOsString.includes('iOS');
    geolocation = generateGeolocationString(client.location);
  }
  const otp = settings.get('otp') || appState.get('currentAuthenticator')?.contextualData?.otp;

  return {
    showRequestInfo: appName || browserOnOsString || geolocation,
    appName,
    browserOnOsString,
    isMobileDevice,
    geolocation,
    otp,
    enterCodeOnFlowPage
  };
};

const BaseEmailMagicLinkOTPTerminalView = View.extend({
  getTemplateData() {
    return getTerminalOtpEmailMagicLinkContext(this.options.settings, this.options.appState);
  },
});

const OTPInformationTerminalView = BaseEmailMagicLinkOTPTerminalView.extend({
  template: hbs`
  <p class="enter-code-on-page">{{enterCodeOnFlowPage}}</p>
  <h1 class='otp-value-with-margin-bottom no-translate'>{{otp}}</h1>
  {{#if showRequestInfo}}
  <div class="enduser-email-otp-only--info">
    <div>{{i18n code="idx.return.link.otponly.request" bundle="login"}}</div>
  </div>
  {{/if}}
  {{#if browserOnOsString}}
  <div class="enduser-email-otp-only--info">
    {{#if isMobileDevice}}
      <i class="enduser-email-otp-only--icon icon--smartphone" aria-hidden="true"></i>
    {{else}}
      <i class="enduser-email-otp-only--icon icon--desktop" aria-hidden="true"></i>
    {{/if}}
    <div data-se="otp-browser-os">{{browserOnOsString}}</div>
  </div>
  {{/if}}
  {{#if appName}}
  <div class="enduser-email-otp-only--info">
    <i class="enduser-email-otp-only--icon icon--app" aria-hidden="true"></i>
    <div data-se="otp-app">{{appName}}</div>
  </div>
  {{/if}}
  {{#if geolocation}}
  <div class="enduser-email-otp-only--info">
    <i class="enduser-email-otp-only--icon icon--location" aria-hidden="true"></i>
    <div data-se="otp-geolocation">{{geolocation}}</div>
  </div>
  {{/if}}
  <p class='otp-warning'>{{i18n code="idx.return.link.otponly.warning.text" bundle="login"}}</p>
  `,
});

export {
  OTPInformationTerminalView
};
