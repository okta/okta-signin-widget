import { loc } from 'okta';


const getTerminalOtpEmailMagicLinkContext = (appState) => {
  const appName = loc('idx.return.link.otponly.accessing.app', 'login', [appState.get('app').label]);
  const client = appState.get('client');
  const browserOnOsString = `${client.browser} on ${client.os}`;
  const geolocation = client.geolocation;
  const otp = appState.get('currentAuthenticator').contextualData.otp;

  return {
    appName,
    browserOnOsString,
    geolocation,
    otp,
  };
};


const generateOtpOnlyHTML = (data) => {
  return `
  <h1 class='otp-value'>${data.otp}</h1>
  <div class="enduser-email-consent--info no-translate">
    <div>${loc('idx.return.link.otponly.request', 'login')}</div>
  </div>
  <div class="enduser-email-consent--info no-translate">
    <i class="enduser-email-consent--icon icon--desktop"></i>
    <div>${data.browserOnOsString}</div>
  </div>
  <div class="enduser-email-consent--info no-translate">
    <i class="enduser-email-consent--icon icon--app"></i>
    <div>${data.appName}</div>
  </div>
  ${data.geolocation ? `
    <div class="enduser-email-consent--info no-translate">
      <i class="enduser-email-consent--icon icon--location"></i>
      <div>${data.geolocation}</div>
    </div>
    ` : ''}
  <p>${loc('idx.return.link.otponly.warning', 'login')}</p>
  `;
};

export {
  getTerminalOtpEmailMagicLinkContext,
  generateOtpOnlyHTML
};
