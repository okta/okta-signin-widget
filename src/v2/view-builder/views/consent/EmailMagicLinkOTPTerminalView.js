import { loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

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

// A map from FactorTransactionIntent in okta-core to customer-facing flow name
const challengeIntentToI18nKeyMap = {
  'AUTHENTICATION': 'idx.return.link.otponly.enter.code.on.sign.in.page',
  'RECOVERY': 'idx.return.link.otponly.enter.code.on.password.reset.page',
  'UNLOCK_ACCOUNT': 'idx.return.link.otponly.enter.code.on.account.unlock.page',
  'ENROLLMENT': 'idx.return.link.otponly.enter.code.on.sign.up.page'
};

const getTerminalOtpEmailMagicLinkContext = (settings, appState) => {
  const app = appState.get('app');
  const client = appState.get('client');
  const challengeIntentContentKey = challengeIntentToI18nKeyMap[appState.get('idx').context.intent];
  const enterCodeOnFlowPage = challengeIntentContentKey
    ? loc(challengeIntentContentKey, 'login')
    : loc('idx.enter.otp.in.original.tab', 'login');
  let appName, browserOnOsString, isMobileDevice, geolocation;
  if (app?.label) {
    appName = loc('idx.return.link.otponly.app', 'login', [app.label]);
  }
  if (client) {
    browserOnOsString = loc('idx.return.link.otponly.browser.on.os', 'login', [client.browser, client.os]);
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
  <h1 class='otp-value no-translate'>{{otp}}</h1>
  {{#if showRequestInfo}}
  <div class="enduser-email-otp-only--info">
    <div class="okta-form-label">{{i18n code="idx.return.link.otponly.request" bundle="login"}}</div>
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
  <br>
  <p class='otp-warning'>{{i18n code="idx.return.link.otponly.warning.text" bundle="login"}}</p>
  `,
});

export {
  OTPInformationTerminalView
};
