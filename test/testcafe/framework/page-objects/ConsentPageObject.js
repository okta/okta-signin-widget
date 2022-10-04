import BasePageObject from './BasePageObject';
import { Selector } from 'testcafe';


export default class ConsentPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  clickAllowButton() {
    return this.form.clickSaveButton('Allow Access');
  }

  clickDontAllowButton() {
    return this.form.clickCancelButton();
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
}
