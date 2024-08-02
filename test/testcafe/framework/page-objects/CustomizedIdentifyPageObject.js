import IdentityPageObject from './IdentityPageObject';
import { Selector } from 'testcafe';

const CUSTOM_LINK = '[data-se="customLink"]';

export default class CustomizedIdentifyPageObject extends IdentityPageObject {
  constructor(t) {
    super(t);
  }

  getCustomLink() {
    return Selector(CUSTOM_LINK);
  }

  getCustomLinkText() {
    return this.getCustomLink().textContent;
  }

  getCustomLinkUrl() {
    return this.getCustomLink().getAttribute('href');
  }
}
