import BasePageObject from './BasePageObject';
import { Selector } from 'testcafe';


export default class ConsentPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  clickAllowButton() {
    return this.form.clickSaveButton();
  }

  clickDontAllowButton() {
    return this.form.clickCancelButton();
  }

  getAllowButtonLabel() {
    return this.form.getSaveButtonLabel();
  }

  getDontAllowButtonLabel() {
    return this.form.getCancelButtonLabel();
  }

  getScopeItemTexts() {
    return this.form.getInnerTexts('.scope-item-text');
  }

  getScopeGroupName() {
    return this.form.getElement('.scope-group--header').innerText;
  }

  async getHeaderTitleText() {
    const parent = Selector('.consent-title .title-text');
    // Don't want the <b> nor its content (appName)
    const textChildren = parent.find((node, index, originNode) => {
      return node.parentNode === originNode && node.nodeType === Node.TEXT_NODE;
    });
    const rawText = await textChildren.textContent;
    return rawText.trim();
  }

  getConsentAgreementText() {
    return this.getTextContent('.consent-description');
  }

  getGranularHeaderClientName() {
    return this.getTextContent('.title-text > b');
  }

  getGranularHeaderText() {
    return this.getTextContent('.title-text > p');
  }

  getScopeCheckBoxLabels() {
    return this.form.getInnerTexts('label');
  }

  getDisabledCheckBoxLabels() {
    return this.form.getInnerTexts(':disabled ~ label');
  }

  getScopeCheckBoxValue(name) {
    return this.form.getCheckboxValue(name);
  }

  setScopeCheckBox(name, value) {
    return this.form.setCheckbox(name, value);
  }
}
