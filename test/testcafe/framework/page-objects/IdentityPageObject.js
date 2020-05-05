import { Selector, ClientFunction } from 'testcafe';
import BasePageObject from './BasePageObject';

const CALLOUT_SELECTOR = '.infobox-warning > div';
const ENROLL_SELECTOR = 'a[data-se="enroll"]';
const NEEDHELP_SELECTOR = 'a[data-se="help"]';
export default class IdentityPageObject extends BasePageObject {
  constructor (t) {
    super(t);
  }

  async getPageUrl() {

    const pageUrl = await ClientFunction(() => window.location.href)();
    return pageUrl;
  }

  getPageTitle() {
    return this.form.getElement('.okta-form-title').textContent;
  }

  getOktaVerifyButtonText() {
    return this.form.getElement('.sign-in-with-device-option .okta-verify-container .link-button').textContent;
  }

  getSignupLinkText() {
    return Selector(ENROLL_SELECTOR).textContent;
  }

  getNeedhelpLinkText() {
    return Selector(NEEDHELP_SELECTOR).textContent;
  }

  async clickOktaVerifyButton() {
    await this.t.click(Selector('.sign-in-with-device-option .okta-verify-container .link-button'));
  }

  getSeparationLineText() {
    return this.form.getElement('.sign-in-with-device-option .separation-line').textContent;
  }

  fillIdentifierField(value) {
    return this.form.setTextBoxValue('identifier', value);
  }

  getIdentifierValue() {
    return this.form.getTextBoxValue('identifier');
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  waitForIdentifierError(){
    return this.form.waitForTextBoxError('identifier');
  }

  hasIdentifierError() {
    return this.form.hasTextBoxError('identifier');
  }

  hasIdentifierErrorMessage() {
    return this.form.hasTextBoxErrorMessage('identifier');
  }

  hasCallout() {
    return !this.form.getCallout(CALLOUT_SELECTOR);
  }

  getUnknownUserCalloutContent() {
    return this.form.getCallout(CALLOUT_SELECTOR).textContent;
  }

  getIdpButton(selector) {
    return this.form.getCallout(selector);
  }

  clickIdpButton(selector) {
    return this.form.clickElement(selector);
  }

  identifierFieldExists(selector) {
    return this.form.elementExist(selector);
  }

  async clickRegistrationButton() {
    await this.t.click(Selector(ENROLL_SELECTOR));
  }
}
