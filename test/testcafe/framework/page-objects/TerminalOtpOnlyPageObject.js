import TerminalPageObject from './TerminalPageObject';

const getOtpOnlyIconSelector = (fieldName) => {
  return `[class='enduser-email-otp-only--icon icon--${fieldName}']`;
};

// OTP Only View constants
const BROWSER_OS_ICON_SELECTOR = getOtpOnlyIconSelector('desktop');
const BROWSER_OS_SMARTPHONE_ICON_SELECTOR = getOtpOnlyIconSelector('smartphone');
const BROWSER_OS_TEXT_SELECTOR = '[data-se=\'otp-browser-os\']';
const APP_ICON_SELECTOR = getOtpOnlyIconSelector('app');
const APP_TEXT_SELECTOR = '[data-se=\'otp-app\']';
const GEOLOCATION_ICON_SELECTOR = getOtpOnlyIconSelector('location');
const GEOLOCATION_TEXT_SELECTOR = '[data-se=\'otp-geolocation\']';
const OTP_VALUE_SELECTOR = '.otp-value';
const ENTER_CODE_ON_PAGE_SELECTOR = '.enter-code-on-page';
const USER_EMAIL_SELECTOR = '[data-se=\'identifier\']';
const FORM_TITLE_SELECTOR = '[data-se=\'o-form-head\']';
const OTP_ONLY_WARNING_SELECTOR = '.otp-warning';

export default class TerminalOtpOnlyPageObject extends TerminalPageObject {

  constructor(t) {
    super(t);
  }

  doesBrowserOsIconExist() {
    return this.form.elementExist(BROWSER_OS_ICON_SELECTOR);
  }

  doesBrowserOsSmartphoneIconExist() {
    return this.form.elementExist(BROWSER_OS_SMARTPHONE_ICON_SELECTOR);
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

  doesEnterCodeOnPageExist() {
    return this.form.elementExist(ENTER_CODE_ON_PAGE_SELECTOR);
  }

  getEnterCodeOnPageElement() {
    return this.form.getElement(ENTER_CODE_ON_PAGE_SELECTOR);
  }

  doesUserEmailExist() {
    return this.form.elementExist(USER_EMAIL_SELECTOR);
  }

  getUserEmailElement() {
    return this.form.getElement(USER_EMAIL_SELECTOR);
  }

  doesFormTitleExist() {
    return this.form.elementExist(FORM_TITLE_SELECTOR);
  }

  getFormTitleElement() {
    return this.form.getElement(FORM_TITLE_SELECTOR);
  }

  doesOtpOnlyWarningExist() {
    return this.form.elementExist(OTP_ONLY_WARNING_SELECTOR);
  }

  getOtpOnlyWarningElement() {
    return this.form.getElement(OTP_ONLY_WARNING_SELECTOR);
  }

}
