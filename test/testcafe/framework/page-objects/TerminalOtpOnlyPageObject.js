import TerminalPageObject from './TerminalPageObject';

const getOtpOnlyIconSelector = (fieldName) => {
  return `[class='enduser-email-consent--icon icon--${fieldName}']`;
};

// OTP Only View constants
const BROWSER_OS_ICON_SELECTOR = getOtpOnlyIconSelector('desktop');
const BROWSER_OS_TEXT_SELECTOR = '[data-se=\'otp-browser-os\']';
const APP_ICON_SELECTOR = getOtpOnlyIconSelector('app');
const APP_TEXT_SELECTOR = '[data-se=\'otp-app\']';
const GEOLOCATION_ICON_SELECTOR = getOtpOnlyIconSelector('location');
const GEOLOCATION_TEXT_SELECTOR = '[data-se=\'otp-geolocation\']';
const OTP_VALUE_SELECTOR = '.otp-value';

export default class TerminalOtpOnlyPageObject extends TerminalPageObject {

  constructor(t) {
    super(t);
  }

  doesBrowserOsIconExist() {
    return this.form.elementExist(BROWSER_OS_ICON_SELECTOR);
  }

  getBrowserOsElement() {
    return this.form.getElement(BROWSER_OS_TEXT_SELECTOR);
  }

  doesAppIconExist() {
    return this.form.elementExist(APP_ICON_SELECTOR);
  }

  getAppNameElement() {
    return this.form.getElement(APP_TEXT_SELECTOR);
  }

  doesGeolocationIconExist() {
    return this.form.elementExist(GEOLOCATION_ICON_SELECTOR);
  }

  getGeolocationElement() {
    return this.form.getElement(GEOLOCATION_TEXT_SELECTOR);
  }

  doesOtpEntryExist() {
    return this.form.elementExist(OTP_VALUE_SELECTOR);
  }

  getOtpEntry() {
    return this.form.getElement(OTP_VALUE_SELECTOR);
  }

}
