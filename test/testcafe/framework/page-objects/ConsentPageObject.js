import BasePageObject from './BasePageObject';
import { Selector, userVariables } from 'testcafe';


export default class ConsentPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  clickAllowButton() {
    const allowBtn = this.form.getByText('Allow Access');
    return this.form.t.click(allowBtn);
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

  hasScopeText(label) {
    return this.form.getByText(label).exists;
  }

  getScopeGroupName() {
    const selector = userVariables.gen3 ? '[data-se="scope-group--header"]' : '.scope-group--header';
    return this.form.getElement(selector).innerText;
  }

  async getHeaderTitleText() {
    if (userVariables.gen3) {
      return Selector('[data-se=title-text] > p').innerText;
    }
    const parent = Selector('.consent-title .title-text');
    // Don't want the <b> nor its content (appName)
    const textChildren = parent.find((node, index, originNode) => {
      return node.parentNode === originNode && node.nodeType === Node.TEXT_NODE;
    });
    const rawText = await textChildren.textContent;
    return rawText.trim();
  }

  getConsentAgreementText() {
    if (userVariables.gen3) {
      return this.form.getElement('[data-se="consent-description"]').innerText;
    }
    return this.getTextContent('.consent-description');
  }

  getGranularHeaderClientName() {
    if (userVariables.gen3) {
      return this.getFormTitle();
    }
    return this.getTextContent('.title-text > b');
  }

  getGranularHeaderText() {
    if (userVariables.gen3) {
      return this.getTextContent('[data-se=title-text] > p');
    }
    return this.getTextContent('.title-text > p');
  }

  getScopeCheckBoxLabels() {
    return this.form.getInnerTexts('label');
  }

  getDisabledCheckBoxLabels() {
    if (userVariables.gen3) {
      return this.form.getInnerTexts('[aria-disabled="true"] ~ span');
    }
    return this.form.getInnerTexts(':disabled ~ label');
  }

  getScopeCheckBoxValue(name) {
    return this.form.getCheckboxValue(name);
  }

  setScopeCheckBox(name, value) {
    return this.form.setCheckbox(name, value);
  }
}
