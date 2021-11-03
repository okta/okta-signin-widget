import TerminalPageObject from './TerminalPageObject';

const getOtpOnlyIconSelector = (fieldName) => {
  return `[class='enduser-email-consent--icon icon--${fieldName}']`;
};

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

  getBrowserOsEntry() {
    return this.form.getElement(BROWSER_OS_ICON_SELECTOR);
  }

  isCorrectBrowserOsEntry(expected) {
    return expected === this.getBrowserOsEntry().innerText;
  }

  doesAppEntryExist() {
    return this.form.elementExist(APP_ICON_SELECTOR);
  }

  getAppEntry() {
    return this.form.getElement(APP_ICON_SELECTOR);
  }

  isCorrectAppEntry(expected) {
    return expected === this.getAppEntry().innerText;
  }

  doesGeolocationEntryExist() {
    return this.form.elementExist(GEOLOCATION_ICON_SELECTOR);
  }

  getGeolocationEntry() {
    return this.form.getElement(GEOLOCATION_ICON_SELECTOR);
  }

  isCorrectGeolocationEntry(expected) {
    return expected === this.getGeolocationEntry().innerText;
  }

  doesOtpEntryExist() {
    return this.form.elementExist(OTP_VALUE_SELECTOR);
  }

  getOtpEntry() {
    return this.form.getElement(OTP_VALUE_SELECTOR);
  }

  isCorrectOtpEntry(expected) {
    return expected === this.getOtpEntry().innerText;
  }

}
