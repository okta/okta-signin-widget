import TerminalPageObject from './TerminalPageObject';

const getOtpOnlyIconSelector = (fieldName) => {
  return `[class='enduser-email-consent--icon icon--${fieldName}']`;
};

const SIW_MAIN_BODY = '[class=\'siw-main-body\']';

// OTP Only View constants
const BROWSER_OS_ICON_SELECTOR = getOtpOnlyIconSelector('desktop');
const APP_ICON_SELECTOR = getOtpOnlyIconSelector('app');
const GEOLOCATION_ICON_SELECTOR = getOtpOnlyIconSelector('location');
const OTP_VALUE_SELECTOR = '[class=\'otp-value\']';

export default class TerminalOtpOnlyPageObject extends TerminalPageObject {

  constructor(t) {
    super(t);
  }

  doesBrowserOsEntryExist() {
    return this.form.elementExist(BROWSER_OS_ICON_SELECTOR);
  }

  doesAppEntryExist() {
    return this.form.elementExist(APP_ICON_SELECTOR);
  }

  doesGeolocationEntryExist() {
    return this.form.elementExist(GEOLOCATION_ICON_SELECTOR);
  }

  doesOtpEntryExist() {
    return this.form.elementExist(OTP_VALUE_SELECTOR);
  }

}
