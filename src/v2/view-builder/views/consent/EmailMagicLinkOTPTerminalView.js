import { loc, View } from 'okta';
import hbs from 'handlebars-inline-precompile';

const generateGeolocationString = (location = {}) => {
  let geolocationString = null;
  let geolocationValues = [];

  // see which info is provided
  if (location.city) {
    geolocationValues.push(location.city);
  }
  if (location.state) {
    geolocationValues.push(location.state);
  }
  if (location.country) {
    geolocationValues.push(location.country);
  }

  // build string based on values provided
  switch (geolocationValues.length) {
  case 0:
    break;
  case 1:
    geolocationString = geolocationValues[0];
    break;
  case 2:
    geolocationString = loc('geolocation.formatting.partial', 'login', geolocationValues);
    break;
  case 3:
    geolocationString = loc('geolocation.formatting.all', 'login', geolocationValues);
    break;
  default:
    break;
  }

  return geolocationString;
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
