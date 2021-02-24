import BasePageObject from './BasePageObject';


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

  getScopeItemTexts() {
    return this.form.getInnerTexts('.scope-item-text');
  }

  getScopeGroupName() {
    return this.form.getElement('.scope-group--header').innerText;
  }
}
