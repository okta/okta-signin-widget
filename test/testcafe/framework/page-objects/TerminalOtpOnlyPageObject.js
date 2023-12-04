import { within } from '@testing-library/testcafe';
import { Selector, userVariables } from 'testcafe';
import TerminalPageObject from './TerminalPageObject';

const getOtpOnlyIconSelector = (fieldName) => {
  if (userVariables.gen3) {
    return `[data-se=icon-${fieldName}]`;
  }
  return `.enduser-email-otp-only--icon.icon--${fieldName}`;
};

// OTP Only View constants
const BROWSER_OS_ICON_SELECTOR = getOtpOnlyIconSelector('desktop');
const BROWSER_OS_ICON_SELECTOR_V3 = getOtpOnlyIconSelector('browser');
const BROWSER_OS_SMARTPHONE_ICON_SELECTOR = getOtpOnlyIconSelector('smartphone');
const BROWSER_OS_TEXT_SELECTOR = '[data-se=\'otp-browser-os\']';
const BROWSER_OS_TEXT_SELECTOR_V3 = '[data-se=\'text-browser\']';
const APP_ICON_SELECTOR = getOtpOnlyIconSelector('app');
const APP_TEXT_SELECTOR = '[data-se=\'otp-app\']';
const APP_TEXT_SELECTOR_V3 = '[data-se=\'text-app\']';
const GEOLOCATION_ICON_SELECTOR = getOtpOnlyIconSelector('location');
const GEOLOCATION_TEXT_SELECTOR = '[data-se=\'otp-geolocation\']';
const GEOLOCATION_TEXT_SELECTOR_V3 = '[data-se=\'text-location\']';
const OTP_VALUE_SELECTOR = '.otp-value';
const OTP_VALUE_SELECTOR_V3 = '[data-se=\'otp-value\']';
const ENTER_CODE_ON_PAGE_SELECTOR = '.enter-code-on-page';
const ENTER_CODE_ON_PAGE_SELECTOR_V3 = '[data-se=\'enter-code-instr\']';
const USER_EMAIL_SELECTOR = '[data-se=\'identifier\']';
const FORM_TITLE_SELECTOR = '[data-se=\'o-form-head\']';
const OTP_ONLY_WARNING_SELECTOR = '.otp-warning';

export default class TerminalOtpOnlyPageObject extends TerminalPageObject {

  constructor(t) {
    super(t);
  }

  doesBrowserOsIconExist() {
    // Follow up Jira on data-se attr discrepancy
    // https://oktainc.atlassian.net/browse/OKTA-589298
    if (userVariables.gen3) {
      return this.form.elementExist(BROWSER_OS_ICON_SELECTOR_V3);
    }
    return this.form.elementExist(BROWSER_OS_ICON_SELECTOR);
  }

  doesBrowserOsSmartphoneIconExist() {
    if(userVariables.gen3) {
      const iconSelector = getOtpOnlyIconSelector('browser');
      return within(this.form.getElement(iconSelector))
        .findByTitle('Browser').exists;
    }
    return this.form.elementExist(BROWSER_OS_SMARTPHONE_ICON_SELECTOR);
  }

  getBrowserOsElement() {
    if (userVariables.gen3) {
      return this.form.getElement(BROWSER_OS_TEXT_SELECTOR_V3);
    }
    return this.form.getElement(BROWSER_OS_TEXT_SELECTOR);
  }

  doesAppIconExist() {
    return this.form.elementExist(APP_ICON_SELECTOR);
  }

  doesAppNameElementExist() {
    const appNameSelector = userVariables.gen3 ? APP_TEXT_SELECTOR_V3 : APP_TEXT_SELECTOR;
    return Selector(appNameSelector).exists;
  }

  getAppNameElement() {
    if (userVariables.gen3) {
      return this.form.getElement(APP_TEXT_SELECTOR_V3); 
    }
    return this.form.getElement(APP_TEXT_SELECTOR);
  }

  doesGeolocationIconExist() {
    return this.form.elementExist(GEOLOCATION_ICON_SELECTOR);
  }

  getGeolocationElement() {
    if (userVariables.gen3) {
      return this.form.getElement(GEOLOCATION_TEXT_SELECTOR_V3);
    }
    return this.form.getElement(GEOLOCATION_TEXT_SELECTOR);
  }

  doesOtpEntryExist() {
    if (userVariables.gen3) {
      return this.form.elementExist(OTP_VALUE_SELECTOR_V3);   
    }
    return this.form.elementExist(OTP_VALUE_SELECTOR);
  }

  getOtpEntry() {
    if (userVariables.gen3) {
      return this.form.getElement(OTP_VALUE_SELECTOR_V3);   
    }
    return this.form.getElement(OTP_VALUE_SELECTOR);
  }

  doesEnterCodeOnPageExist() {
    if (userVariables.gen3) {
      return this.form.elementExist(ENTER_CODE_ON_PAGE_SELECTOR_V3); 
    }
    return this.form.elementExist(ENTER_CODE_ON_PAGE_SELECTOR);
  }

  getEnterCodeOnPageElement() {
    if (userVariables.gen3) {
      return this.form.getElement(ENTER_CODE_ON_PAGE_SELECTOR_V3); 
    }
    return this.form.getElement(ENTER_CODE_ON_PAGE_SELECTOR);
  }

  doesUserEmailExist() {
    if (userVariables.gen3) {
      return Selector(USER_EMAIL_SELECTOR).exists;
    }
    return this.form.elementExist(USER_EMAIL_SELECTOR);
  }

  getUserEmailElement() {
    if (userVariables.gen3) {
      return Selector(USER_EMAIL_SELECTOR);
    }
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
